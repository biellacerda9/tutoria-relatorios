import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

const MARGIN = 28;
const GAP = 14;
const CAPTURE_BACKGROUND = "#f7f4ec";

async function captureBlock(block: HTMLElement, contentWidth: number) {
  const canvas = await html2canvas(block, {
    scale: 2,
    backgroundColor: CAPTURE_BACKGROUND,
    useCORS: true,
  });
  const imgData = canvas.toDataURL("image/jpeg", 0.92);
  const imgHeight = (canvas.height * contentWidth) / canvas.width;
  return { imgData, imgHeight };
}

/**
 * Renders each `[data-pdf-block]` inside `element` as its own image and lays them out
 * page by page, never slicing a block across a page break (only a single block taller
 * than one whole page falls back to slicing, as a last resort).
 */
export async function exportReportToPdf(element: HTMLElement, filename: string, title?: string) {
  const blocks = Array.from(element.querySelectorAll<HTMLElement>("[data-pdf-block]"));
  const targets = blocks.length > 0 ? blocks : [element];

  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4", compress: true });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN * 2;
  const maxBlockHeight = pageHeight - MARGIN * 2;

  let cursorY = MARGIN;

  if (title) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(22, 35, 58);
    const lines = pdf.splitTextToSize(title, contentWidth) as string[];
    pdf.text(lines, MARGIN, cursorY + 11);
    cursorY += 11 + lines.length * 16;
    pdf.setDrawColor(221, 217, 205);
    pdf.line(MARGIN, cursorY, pageWidth - MARGIN, cursorY);
    cursorY += 20;
  }

  for (const block of targets) {
    const { imgData, imgHeight } = await captureBlock(block, contentWidth);

    if (imgHeight > maxBlockHeight) {
      if (cursorY > MARGIN) {
        pdf.addPage();
        cursorY = MARGIN;
      }
      let remaining = imgHeight;
      let offset = 0;
      pdf.addImage(imgData, "JPEG", MARGIN, MARGIN - offset, contentWidth, imgHeight);
      remaining -= maxBlockHeight;
      while (remaining > 0) {
        offset += maxBlockHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", MARGIN, MARGIN - offset, contentWidth, imgHeight);
        remaining -= maxBlockHeight;
      }
      cursorY = pageHeight;
      continue;
    }

    if (cursorY + imgHeight > pageHeight - MARGIN) {
      pdf.addPage();
      cursorY = MARGIN;
    }

    pdf.addImage(imgData, "JPEG", MARGIN, cursorY, contentWidth, imgHeight);
    cursorY += imgHeight + GAP;
  }

  pdf.save(filename);
}
