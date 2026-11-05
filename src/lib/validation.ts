import { ColumnMappingConfig } from './mapping';

export interface RowValidationIssue {
  rowNumber: number;
  column?: string;
  errorType: 'MISSING_REQUIRED' | 'OUT_OF_RANGE' | 'INVALID_DATE' | 'MALFORMED_ROW' | 'DUPLICATE';
  message: string;
  severity: 'ERROR' | 'WARNING';
}

export interface ValidatedRecord {
  rowNumber: number;
  sourceId: string | null;
  npsScore: number | null;
  csatScore: number | null;
  responseDate: Date | null;
  commentText: string | null;
  product: string | null;
  region: string | null;
  customerType: string | null;
  metadata: Record<string, any>;
  hasError: boolean;
}

export interface ValidationSummary {
  totalRows: number;
  acceptedRows: number;
  rejectedRows: number;
  issues: RowValidationIssue[];
  validatedRecords: ValidatedRecord[];
}

export interface ValidationOptions {
  csatMin?: number;
  csatMax?: number;
}

/**
 * Validates raw CSV records against standard CX rules
 */
export function validateSurveyRecords(
  rows: Record<string, any>[],
  mapping: ColumnMappingConfig,
  options: ValidationOptions = {}
): ValidationSummary {
  const csatMin = options.csatMin ?? 1;
  const csatMax = options.csatMax ?? 5;

  const issues: RowValidationIssue[] = [];
  const validatedRecords: ValidatedRecord[] = [];
  const seenSourceIds = new Set<string>();

  rows.forEach((row, index) => {
    const rowNumber = index + 1;
    let rowHasError = false;

    // 1. Source ID
    const rawId = mapping.sourceId ? String(row[mapping.sourceId] ?? '').trim() : null;
    const sourceId = rawId || `ROW-${rowNumber}`;

    if (rawId) {
      if (seenSourceIds.has(rawId)) {
        issues.push({
          rowNumber,
          column: mapping.sourceId,
          errorType: 'DUPLICATE',
          message: `Duplicate response identifier: '${rawId}'`,
          severity: 'WARNING',
        });
      } else {
        seenSourceIds.add(rawId);
      }
    }

    // 2. NPS Score Validation (0-10)
    let npsScore: number | null = null;
    if (mapping.npsScore && row[mapping.npsScore] !== undefined && row[mapping.npsScore] !== '') {
      const val = Number(row[mapping.npsScore]);
      if (isNaN(val) || val < 0 || val > 10 || !Number.isInteger(val)) {
        issues.push({
          rowNumber,
          column: mapping.npsScore,
          errorType: 'OUT_OF_RANGE',
          message: `NPS score '${row[mapping.npsScore]}' is outside valid range (0-10 integer)`,
          severity: 'ERROR',
        });
        rowHasError = true;
      } else {
        npsScore = val;
      }
    }

    // 3. CSAT Score Validation (e.g., 1-5)
    let csatScore: number | null = null;
    if (mapping.csatScore && row[mapping.csatScore] !== undefined && row[mapping.csatScore] !== '') {
      const val = Number(row[mapping.csatScore]);
      if (isNaN(val) || val < csatMin || val > csatMax) {
        issues.push({
          rowNumber,
          column: mapping.csatScore,
          errorType: 'OUT_OF_RANGE',
          message: `CSAT score '${row[mapping.csatScore]}' is outside configured scale (${csatMin}-${csatMax})`,
          severity: 'ERROR',
        });
        rowHasError = true;
      } else {
        csatScore = val;
      }
    }

    // If both NPS and CSAT are mapped, but neither is present for this row
    if (mapping.npsScore && mapping.csatScore && npsScore === null && csatScore === null) {
      issues.push({
        rowNumber,
        errorType: 'MISSING_REQUIRED',
        message: 'Record contains neither an NPS nor a CSAT score',
        severity: 'WARNING',
      });
    }

    // 4. Response Date Validation
    let responseDate: Date | null = null;
    if (mapping.responseDate && row[mapping.responseDate] !== undefined && row[mapping.responseDate] !== '') {
      const parsedDate = new Date(row[mapping.responseDate]);
      if (isNaN(parsedDate.getTime())) {
        issues.push({
          rowNumber,
          column: mapping.responseDate,
          errorType: 'INVALID_DATE',
          message: `Unparseable date format: '${row[mapping.responseDate]}'`,
          severity: 'WARNING',
        });
      } else {
        responseDate = parsedDate;
      }
    }

    // 5. Open comment
    let commentText: string | null = null;
    if (mapping.commentText && row[mapping.commentText]) {
      const trimmed = String(row[mapping.commentText]).trim();
      if (trimmed.length > 0) {
        commentText = trimmed;
      }
    }

    // 6. Segment fields
    const product = mapping.product && row[mapping.product] ? String(row[mapping.product]).trim() : null;
    const region = mapping.region && row[mapping.region] ? String(row[mapping.region]).trim() : null;
    const customerType = mapping.customerType && row[mapping.customerType] ? String(row[mapping.customerType]).trim() : null;

    // Remaining unmapped columns into metadata
    const mappedCols = new Set(Object.values(mapping).filter(Boolean) as string[]);
    const metadata: Record<string, any> = {};
    for (const [k, v] of Object.entries(row)) {
      if (!mappedCols.has(k) && v !== undefined && v !== '') {
        metadata[k] = v;
      }
    }

    validatedRecords.push({
      rowNumber,
      sourceId,
      npsScore,
      csatScore,
      responseDate,
      commentText,
      product,
      region,
      customerType,
      metadata,
      hasError: rowHasError,
    });
  });

  const rejectedRows = validatedRecords.filter((r) => r.hasError).length;
  const acceptedRows = validatedRecords.length - rejectedRows;

  return {
    totalRows: rows.length,
    acceptedRows,
    rejectedRows,
    issues,
    validatedRecords,
  };
}
