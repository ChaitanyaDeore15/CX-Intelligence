import Papa from 'papaparse';

export interface ParseCsvResult {
  headers: string[];
  rows: Record<string, any>[];
  totalRows: number;
  errors: string[];
}

/**
 * Robust CSV parser handling UTF-8, UTF-8 BOM, quoted commas, multiline text, escaped quotes.
 */
export function parseCsvText(csvText: string): ParseCsvResult {
  // Strip UTF-8 BOM if present
  let cleanText = csvText;
  if (cleanText.charCodeAt(0) === 0xfeff) {
    cleanText = cleanText.slice(1);
  }

  const parsed = Papa.parse<Record<string, any>>(cleanText, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim(),
  });

  const errors: string[] = parsed.errors.map(
    (e) => `Row ${e.row !== undefined ? e.row + 1 : 'unknown'}: ${e.message}`
  );

  const headers = parsed.meta.fields ? parsed.meta.fields.filter(Boolean) : [];
  const rows = parsed.data || [];

  return {
    headers,
    rows,
    totalRows: rows.length,
    errors,
  };
}
