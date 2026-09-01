import JSZip from "jszip";

export interface PieChartSpec {
  title: string;
  sheetName: string;
  /** 1-indexed row of the "Quantidade" header cell (series name). */
  headerRow: number;
  /** 1-indexed first/last row of the category+value data (column A = category, B = value). */
  firstRow: number;
  lastRow: number;
}

const NS_R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

function buildChartXml(spec: PieChartSpec): string {
  const sheet = spec.sheetName;
  const catRange = `'${sheet}'!$A$${spec.firstRow}:$A$${spec.lastRow}`;
  const valRange = `'${sheet}'!$B$${spec.firstRow}:$B$${spec.lastRow}`;
  const nameCell = `'${sheet}'!$B$${spec.headerRow}`;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="${NS_R}">
<c:chart>
<c:title><c:tx><c:rich><a:bodyPr/><a:p><a:r><a:t>${escapeXml(spec.title)}</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title>
<c:autoTitleDeleted val="0"/>
<c:plotArea><c:layout/>
<c:pieChart>
<c:varyColors val="1"/>
<c:ser>
<c:idx val="0"/><c:order val="0"/>
<c:tx><c:strRef><c:f>${nameCell}</c:f></c:strRef></c:tx>
<c:cat><c:strRef><c:f>${catRange}</c:f></c:strRef></c:cat>
<c:val><c:numRef><c:f>${valRange}</c:f></c:numRef></c:val>
</c:ser>
<c:dLbls><c:showLegendKey val="0"/><c:showVal val="0"/><c:showCatName val="0"/><c:showSerName val="0"/><c:showPercent val="1"/><c:showBubbleSize val="0"/></c:dLbls>
<c:firstSliceAng val="0"/>
</c:pieChart>
</c:plotArea>
<c:legend><c:legendPos val="r"/><c:overlay val="0"/></c:legend>
<c:plotVisOnly val="1"/>
<c:dispBlanksAs val="gap"/>
</c:chart>
</c:chartSpace>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildDrawingXml(count: number): string {
  const anchors = Array.from({ length: count }, (_, i) => {
    const row = i * 16;
    return `<xdr:oneCellAnchor>
<xdr:from><xdr:col>4</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${row}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>
<xdr:ext cx="5400000" cy="2700000"/>
<xdr:graphicFrame macro="">
<xdr:nvGraphicFramePr><xdr:cNvPr id="${i + 1}" name="Chart ${i + 1}"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr>
<xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm>
<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart"><c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:r="${NS_R}" r:id="rId${i + 1}"/></a:graphicData></a:graphic>
</xdr:graphicFrame>
<xdr:clientData/>
</xdr:oneCellAnchor>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">${anchors}</xdr:wsDr>`;
}

function buildDrawingRels(count: number): string {
  const rels = Array.from(
    { length: count },
    (_, i) =>
      `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart${i + 1}.xml"/>`
  ).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels}</Relationships>`;
}

function findSheetFile(workbookXml: string, workbookRelsXml: string, sheetName: string): string | null {
  const sheetMatch = new RegExp(
    `<sheet\\b[^>]*name="${sheetName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*/>`
  ).exec(workbookXml);
  if (!sheetMatch) return null;
  const ridMatch = /r:id="(rId\d+)"/.exec(sheetMatch[0]);
  if (!ridMatch) return null;
  const relId = ridMatch[1];

  const relMatch = new RegExp(`<Relationship\\b[^>]*Id="${relId}"[^>]*/>`).exec(workbookRelsXml);
  if (!relMatch) return null;
  const targetMatch = /Target="([^"]+)"/.exec(relMatch[0]);
  if (!targetMatch) return null;

  return targetMatch[1].replace(/^\/?xl\//, "").replace(/^worksheets\//, "");
}

/**
 * Post-processes an .xlsx produced by SheetJS to embed native pie charts on one sheet,
 * by writing the OOXML chart/drawing parts directly (SheetJS's free build can't write
 * charts). The chart part shapes were reverse-engineered from a real Excel-generated
 * file that already had working pie charts, so they're known to open correctly.
 */
export async function embedPieCharts(
  workbookBytes: ArrayBuffer,
  specs: PieChartSpec[]
): Promise<Blob> {
  if (specs.length === 0) {
    return new Blob([workbookBytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  }

  const zip = await JSZip.loadAsync(workbookBytes);

  const workbookXml = await zip.file("xl/workbook.xml")!.async("string");
  const workbookRelsXml = await zip.file("xl/_rels/workbook.xml.rels")!.async("string");
  const sheetFile = findSheetFile(workbookXml, workbookRelsXml, specs[0].sheetName);
  if (!sheetFile) {
    return new Blob([workbookBytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  }

  specs.forEach((spec, i) => {
    zip.file(`xl/charts/chart${i + 1}.xml`, buildChartXml(spec));
  });
  zip.file("xl/drawings/drawing1.xml", buildDrawingXml(specs.length));
  zip.file("xl/drawings/_rels/drawing1.xml.rels", buildDrawingRels(specs.length));

  const sheetPath = `xl/worksheets/${sheetFile}`;
  const sheetXml = await zip.file(sheetPath)!.async("string");
  const sheetWithDrawing = sheetXml.replace(
    "</worksheet>",
    `<drawing xmlns:r="${NS_R}" r:id="rId1"/></worksheet>`
  );
  zip.file(sheetPath, sheetWithDrawing);

  const sheetRelsPath = `xl/worksheets/_rels/${sheetFile}.rels`;
  const drawingRel = `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>`;
  const existingRels = zip.file(sheetRelsPath);
  if (existingRels) {
    const existingXml = await existingRels.async("string");
    zip.file(sheetRelsPath, existingXml.replace("</Relationships>", `${drawingRel}</Relationships>`));
  } else {
    zip.file(
      sheetRelsPath,
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${drawingRel}</Relationships>`
    );
  }

  const contentTypesXml = await zip.file("[Content_Types].xml")!.async("string");
  const newOverrides =
    `<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>` +
    specs
      .map(
        (_, i) =>
          `<Override PartName="/xl/charts/chart${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>`
      )
      .join("");
  zip.file(
    "[Content_Types].xml",
    contentTypesXml.replace("</Types>", `${newOverrides}</Types>`)
  );

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
