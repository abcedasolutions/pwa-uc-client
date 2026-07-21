import * as XLSX from "xlsx";

export interface SpreadsheetColumn<T> {
  key: keyof T;
  header: string;
}

/*
  Reads .xlsx, .xls, and .csv through the same path - SheetJS auto-detects
  the format from the file content, so callers never need to branch on
  extension.
*/
export async function parseSpreadsheetFile(file: File): Promise<Record<string, string>[]> {
  const buffer = await file.arrayBuffer();
  /*
    cellDates converts real Excel date cells into JS Date objects instead of
    their raw serial-number form - normalized below to plain yyyy-mm-dd so
    callers get the same shape whether the source was a .csv or a .xlsx.
    codepage 65001 (UTF-8) is required for .csv specifically: without a BOM,
    SheetJS's CSV reader falls back to a non-UTF-8 codepage and mangles
    accented headers like "Código" into "CÃ³digo", silently breaking every
    column lookup. 
    -----> Real .xlsx files are unaffected (they're not plain text).
  */
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true, codepage: 65001 });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  return rows.map((row) => {
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      if (value instanceof Date) {
        normalized[key.trim()] = value.toISOString().slice(0, 10);
      } else {
        normalized[key.trim()] = String(value ?? "").trim();
      }
    }
    return normalized;
  });
}

function normalizeHeader(header: string): string {
  return header
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

/*
  Import spreadsheets are hand-authored by people, not by this app, so header
  spelling varies ("Código" vs "Codigo" vs "codigo"). Look the value up by
  trying every candidate name, accent- and case-insensitively.
*/
export function getField(row: Record<string, string>, ...candidates: string[]): string {
  const normalizedRow: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    normalizedRow[normalizeHeader(key)] = value;
  }
  for (const candidate of candidates) {
    const value = normalizedRow[normalizeHeader(candidate)];
    if (value !== undefined && value !== "") return value;
  }
  return "";
}

/*
  Generates a downloadable starter file with just the expected header row
  (plus optional example rows) so users importing data know exactly which
  columns and spelling to use, without having to guess from documentation.
*/
export function downloadTemplate<T extends object>(
  filename: string,
  sheetName: string,
  columns: SpreadsheetColumn<T>[],
  exampleRows: Partial<Record<keyof T, string | number>>[] = []
) {
  const data =
    exampleRows.length > 0
      ? exampleRows.map((row) => {
          const shaped: Record<string, unknown> = {};
          for (const col of columns) shaped[col.header] = row[col.key] ?? "";
          return shaped;
        })
      : [Object.fromEntries(columns.map((c) => [c.header, ""]))];
  const sheet = XLSX.utils.json_to_sheet(data, { header: columns.map((c) => c.header) });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName.slice(0, 31));
  XLSX.writeFile(workbook, filename);
}

export function exportToExcel<T extends object>(
  filename: string,
  sheetName: string,
  columns: SpreadsheetColumn<T>[],
  rows: T[]
) {
  const data = rows.map((row) => {
    const shaped: Record<string, unknown> = {};
    for (const col of columns) shaped[col.header] = row[col.key] ?? "";
    return shaped;
  });
  const sheet = XLSX.utils.json_to_sheet(data, { header: columns.map((c) => c.header) });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName.slice(0, 31));
  XLSX.writeFile(workbook, filename);
}
