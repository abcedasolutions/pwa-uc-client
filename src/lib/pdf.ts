import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { SpreadsheetColumn } from "./spreadsheet";

export function buildPdf<T extends object>(
  title: string,
  columns: SpreadsheetColumn<T>[],
  rows: T[],
  subtitle?: string
): jsPDF {
  const doc = new jsPDF({ orientation: columns.length > 5 ? "landscape" : "portrait" });

  doc.setFontSize(14);
  doc.text(title, 14, 16);
  if (subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(subtitle, 14, 22);
  }

  autoTable(doc, {
    startY: subtitle ? 27 : 22,
    head: [columns.map((c) => c.header)],
    body: rows.map((row) => columns.map((c) => String(row[c.key] ?? ""))),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  return doc;
}

export function pdfToBlobUrl(doc: jsPDF): string {
  return doc.output("bloburl") as unknown as string;
}
