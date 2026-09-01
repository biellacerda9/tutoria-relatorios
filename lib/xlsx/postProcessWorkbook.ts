import JSZip from "jszip";

export interface ChartSpec {
  type: "pie" | "bar";
  title: string;
  sheetName: string;
  /** 1-indexed row of the "Quantidade" header cell (series name). */
  headerRow: number;
  /** 1-indexed first/last row of the category+value data (column A = category, B = value). */
  firstRow: number;
  lastRow: number;
}

export interface StyleSpec {
  sheetName: string;
  /** 1-indexed rows whose cells should be rendered bold (section/table headers). */
  boldRows: number[];
  freezeHeaderRow?: boolean;
}

const NS_R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const XML_HEADER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildChartXml(spec: ChartSpec): string {
  const sheet = spec.sheetName;
  const catRange = `'${sheet}'!$A$${spec.firstRow}:$A$${spec.lastRow}`;
  const valRange = `'${sheet}'!$B$${spec.firstRow}:$B$${spec.lastRow}`;
  const nameCell = `'${sheet}'!$B$${spec.headerRow}`;

  const plot =
    spec.type === "pie"
      ? `<c:pieChart>
<c:varyColors val="1"/>
<c:ser>
<c:idx val="0"/><c:order val="0"/>
<c:tx><c:strRef><c:f>${nameCell}</c:f></c:strRef></c:tx>
<c:cat><c:strRef><c:f>${catRange}</c:f></c:strRef></c:cat>
<c:val><c:numRef><c:f>${valRange}</c:f></c:numRef></c:val>
</c:ser>
<c:dLbls><c:showLegendKey val="0"/><c:showVal val="0"/><c:showCatName val="0"/><c:showSerName val="0"/><c:showPercent val="1"/><c:showBubbleSize val="0"/></c:dLbls>
<c:firstSliceAng val="0"/>
</c:pieChart>`
      : `<c:barChart>
<c:barDir val="bar"/>
<c:grouping val="clustered"/>
<c:varyColors val="0"/>
<c:ser>
<c:idx val="0"/><c:order val="0"/>
<c:tx><c:strRef><c:f>${nameCell}</c:f></c:strRef></c:tx>
<c:cat><c:strRef><c:f>${catRange}</c:f></c:strRef></c:cat>
<c:val><c:numRef><c:f>${valRange}</c:f></c:numRef></c:val>
</c:ser>
<c:dLbls><c:showLegendKey val="0"/><c:showVal val="1"/><c:showCatName val="0"/><c:showSerName val="0"/><c:showPercent val="0"/><c:showBubbleSize val="0"/></c:dLbls>
<c:axId val="111111111"/><c:axId val="222222222"/>
</c:barChart>
<c:catAx><c:axId val="111111111"/><c:scaling><c:orientation val="maxMin"/></c:scaling><c:delete val="0"/><c:axPos val="l"/><c:crossAx val="222222222"/></c:catAx>
<c:valAx><c:axId val="222222222"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="b"/><c:crossAx val="111111111"/></c:valAx>`;

  return `${XML_HEADER}<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="${NS_R}">
<c:chart>
<c:title><c:tx><c:rich><a:bodyPr/><a:p><a:r><a:t>${escapeXml(spec.title)}</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title>
<c:autoTitleDeleted val="0"/>
<c:plotArea><c:layout/>
${plot}
</c:plotArea>
<c:legend><c:legendPos val="r"/><c:overlay val="0"/></c:legend>
<c:plotVisOnly val="1"/>
<c:dispBlanksAs val="gap"/>
</c:chart>
</c:chartSpace>`;
}

function buildDrawingXml(count: number): string {
  const anchors = Array.from({ length: count }, (_, i) => {
    const row = i * 17;
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

  return `${XML_HEADER}<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">${anchors}</xdr:wsDr>`;
}

function buildDrawingRels(count: number): string {
  const rels = Array.from(
    { length: count },
    (_, i) =>
      `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart${i + 1}.xml"/>`
  ).join("");
  return `${XML_HEADER}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels}</Relationships>`;
}

/** Maps every sheet name in the workbook to its physical `sheetN.xml` file name. */
async function buildSheetFileMap(zip: JSZip): Promise<Map<string, string>> {
  const workbookXml = await zip.file("xl/workbook.xml")!.async("string");
  const workbookRelsXml = await zip.file("xl/_rels/workbook.xml.rels")!.async("string");

  const map = new Map<string, string>();
  const sheetTagRe = /<sheet\b[^>]*\/>/g;
  for (const tag of workbookXml.match(sheetTagRe) ?? []) {
    const name = /name="([^"]+)"/.exec(tag)?.[1];
    const rid = /r:id="(rId\d+)"/.exec(tag)?.[1];
    if (!name || !rid) continue;
    const relTag = new RegExp(`<Relationship\\b[^>]*Id="${rid}"[^>]*/>`).exec(workbookRelsXml)?.[0];
    const target = relTag && /Target="([^"]+)"/.exec(relTag)?.[1];
    if (!target) continue;
    map.set(name, target.replace(/^\/?xl\//, "").replace(/^worksheets\//, ""));
  }
  return map;
}

const SHEET_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";

async function applyBoldHeaderStyle(
  zip: JSZip,
  sheetFile: string,
  boldRows: number[],
  freezeHeaderRow: boolean | undefined,
  boldStyleIndex: number
) {
  const sheetPath = `xl/worksheets/${sheetFile}`;
  const xml = await zip.file(sheetPath)!.async("string");
  const doc = new DOMParser().parseFromString(xml, "application/xml");

  const boldRowSet = new Set(boldRows);
  const rows = doc.getElementsByTagName("row");
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const r = Number(row.getAttribute("r"));
    if (!boldRowSet.has(r)) continue;
    const cells = row.getElementsByTagName("c");
    for (let j = 0; j < cells.length; j++) {
      cells[j].setAttribute("s", String(boldStyleIndex));
    }
  }

  if (freezeHeaderRow) {
    const sheetViews = doc.getElementsByTagName("sheetViews")[0];
    const sheetView = sheetViews?.getElementsByTagName("sheetView")[0];
    if (sheetView) {
      const pane = doc.createElementNS(SHEET_NS, "pane");
      pane.setAttribute("ySplit", "1");
      pane.setAttribute("topLeftCell", "A2");
      pane.setAttribute("activePane", "bottomLeft");
      pane.setAttribute("state", "frozen");
      sheetView.insertBefore(pane, sheetView.firstChild);
    }
  }

  zip.file(sheetPath, new XMLSerializer().serializeToString(doc));
}

async function addBoldFontStyle(zip: JSZip): Promise<number> {
  const path = "xl/styles.xml";
  const xml = await zip.file(path)!.async("string");
  const doc = new DOMParser().parseFromString(xml, "application/xml");

  const fonts = doc.getElementsByTagName("fonts")[0];
  const baseFont = fonts.getElementsByTagName("font")[0];
  const boldFont = baseFont.cloneNode(true) as Element;
  const bold = doc.createElementNS(SHEET_NS, "b");
  boldFont.insertBefore(bold, boldFont.firstChild);
  fonts.appendChild(boldFont);
  const fontCount = fonts.getElementsByTagName("font").length;
  fonts.setAttribute("count", String(fontCount));
  const newFontIndex = fontCount - 1;

  const cellXfs = doc.getElementsByTagName("cellXfs")[0];
  const baseXf = cellXfs.getElementsByTagName("xf")[0];
  const boldXf = baseXf.cloneNode(true) as Element;
  boldXf.setAttribute("fontId", String(newFontIndex));
  boldXf.setAttribute("applyFont", "1");
  cellXfs.appendChild(boldXf);
  const xfCount = cellXfs.getElementsByTagName("xf").length;
  cellXfs.setAttribute("count", String(xfCount));
  const newXfIndex = xfCount - 1;

  zip.file(path, new XMLSerializer().serializeToString(doc));
  return newXfIndex;
}

/**
 * Post-processes an .xlsx produced by SheetJS to add native pie/bar charts and bold
 * section headers, by writing/editing the underlying OOXML parts directly (SheetJS's
 * free build can only read charts/styles, not write them). The chart part shapes were
 * reverse-engineered from a real Excel-generated file that already had working pie
 * charts, so they're known to open correctly.
 */
export async function postProcessWorkbook(
  workbookBytes: ArrayBuffer,
  charts: ChartSpec[],
  styles: StyleSpec[]
): Promise<Blob> {
  const zip = await JSZip.loadAsync(workbookBytes);
  const sheetFileMap = await buildSheetFileMap(zip);

  if (styles.length > 0) {
    const boldStyleIndex = await addBoldFontStyle(zip);
    for (const spec of styles) {
      const sheetFile = sheetFileMap.get(spec.sheetName);
      if (!sheetFile) continue;
      await applyBoldHeaderStyle(zip, sheetFile, spec.boldRows, spec.freezeHeaderRow, boldStyleIndex);
    }
  }

  if (charts.length > 0) {
    const sheetFile = sheetFileMap.get(charts[0].sheetName);
    if (sheetFile) {
      charts.forEach((spec, i) => {
        zip.file(`xl/charts/chart${i + 1}.xml`, buildChartXml(spec));
      });
      zip.file("xl/drawings/drawing1.xml", buildDrawingXml(charts.length));
      zip.file("xl/drawings/_rels/drawing1.xml.rels", buildDrawingRels(charts.length));

      const sheetPath = `xl/worksheets/${sheetFile}`;
      const sheetXml = await zip.file(sheetPath)!.async("string");
      zip.file(
        sheetPath,
        sheetXml.replace("</worksheet>", `<drawing xmlns:r="${NS_R}" r:id="rId1"/></worksheet>`)
      );

      const sheetRelsPath = `xl/worksheets/_rels/${sheetFile}.rels`;
      const drawingRel = `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>`;
      const existingRels = zip.file(sheetRelsPath);
      if (existingRels) {
        const existingXml = await existingRels.async("string");
        zip.file(sheetRelsPath, existingXml.replace("</Relationships>", `${drawingRel}</Relationships>`));
      } else {
        zip.file(
          sheetRelsPath,
          `${XML_HEADER}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${drawingRel}</Relationships>`
        );
      }

      const contentTypesXml = await zip.file("[Content_Types].xml")!.async("string");
      const newOverrides =
        `<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>` +
        charts
          .map(
            (_, i) =>
              `<Override PartName="/xl/charts/chart${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>`
          )
          .join("");
      zip.file("[Content_Types].xml", contentTypesXml.replace("</Types>", `${newOverrides}</Types>`));
    }
  }

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
