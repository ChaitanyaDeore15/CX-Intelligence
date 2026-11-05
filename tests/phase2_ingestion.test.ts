import { describe, it, expect } from 'vitest';
import { parseCsvText } from '../src/lib/csv-parser';
import { detectColumnMappings } from '../src/lib/mapping';
import { validateSurveyRecords } from '../src/lib/validation';

describe('Phase 2 — CSV Parser', () => {
  it('parses standard CSV text accurately', () => {
    const csv = `response_id,nps_score,csat_score,comment\nR1,10,5,"Loved it, exceptional speed!"\nR2,4,2,"Sluggish and crashed."`;
    const result = parseCsvText(csv);
    expect(result.headers).toEqual(['response_id', 'nps_score', 'csat_score', 'comment']);
    expect(result.totalRows).toBe(2);
    expect(result.rows[0].response_id).toBe('R1');
    expect(result.rows[0].comment).toBe('Loved it, exceptional speed!');
  });

  it('handles UTF-8 BOM cleanly', () => {
    const csvWithBom = '\uFEFFname,score\nAlice,10';
    const result = parseCsvText(csvWithBom);
    expect(result.headers[0]).toBe('name');
    expect(result.rows[0].name).toBe('Alice');
  });

  it('handles multiline comments and escaped quotes', () => {
    const csv = `id,comment\n1,"Line 1\nLine 2 with ""quotes"""`;
    const result = parseCsvText(csv);
    expect(result.totalRows).toBe(1);
    expect(result.rows[0].comment).toBe('Line 1\nLine 2 with "quotes"');
  });
});

describe('Phase 2 — Column Mapping Auto-detection', () => {
  it('auto-detects standard CX columns from varied synonyms', () => {
    const headers = [
      'Respondent_ID',
      'Likelihood_to_Recommend_NPS',
      'Satisfaction_Rating',
      'Customer_Feedback_Text',
      'Product_Line',
      'Geo_Region',
      'Account_Tier',
      'Submission_Date',
    ];

    const detected = detectColumnMappings(headers);
    expect(detected.sourceId).toBe('Respondent_ID');
    expect(detected.npsScore).toBe('Likelihood_to_Recommend_NPS');
    expect(detected.csatScore).toBe('Satisfaction_Rating');
    expect(detected.commentText).toBe('Customer_Feedback_Text');
    expect(detected.product).toBe('Product_Line');
    expect(detected.region).toBe('Geo_Region');
    expect(detected.customerType).toBe('Account_Tier');
    expect(detected.responseDate).toBe('Submission_Date');
  });
});

describe('Phase 2 — Survey Validation Engine', () => {
  const mapping = {
    sourceId: 'id',
    npsScore: 'nps',
    csatScore: 'csat',
    commentText: 'comment',
    responseDate: 'date',
  };

  it('flags out-of-range NPS scores (< 0 or > 10)', () => {
    const rows = [
      { id: '1', nps: '10', csat: '5', comment: 'Great' },
      { id: '2', nps: '11', csat: '4', comment: 'Over max' },
      { id: '3', nps: '-2', csat: '3', comment: 'Under min' },
    ];

    const summary = validateSurveyRecords(rows, mapping);
    expect(summary.totalRows).toBe(3);
    expect(summary.acceptedRows).toBe(1);
    expect(summary.rejectedRows).toBe(2);
    expect(summary.issues.some((i) => i.rowNumber === 2 && i.errorType === 'OUT_OF_RANGE')).toBe(true);
    expect(summary.issues.some((i) => i.rowNumber === 3 && i.errorType === 'OUT_OF_RANGE')).toBe(true);
  });

  it('flags out-of-range CSAT scores (< 1 or > 5 on 5-point scale)', () => {
    const rows = [
      { id: '1', nps: '8', csat: '0', comment: 'Bad CSAT' },
      { id: '2', nps: '8', csat: '6', comment: 'Over scale' },
      { id: '3', nps: '8', csat: '4', comment: 'Valid' },
    ];

    const summary = validateSurveyRecords(rows, mapping);
    expect(summary.acceptedRows).toBe(1);
    expect(summary.rejectedRows).toBe(2);
  });

  it('flags invalid date formats with warning without discarding record', () => {
    const rows = [
      { id: '1', nps: '9', csat: '5', date: 'not-a-real-date', comment: 'Good' },
    ];

    const summary = validateSurveyRecords(rows, mapping);
    expect(summary.acceptedRows).toBe(1); // warning does not reject row
    expect(summary.issues[0].errorType).toBe('INVALID_DATE');
    expect(summary.issues[0].severity).toBe('WARNING');
  });

  it('detects duplicate respondent IDs with warning', () => {
    const rows = [
      { id: 'DUP-1', nps: '9', csat: '5' },
      { id: 'DUP-1', nps: '9', csat: '5' },
    ];

    const summary = validateSurveyRecords(rows, mapping);
    expect(summary.issues.some((i) => i.errorType === 'DUPLICATE')).toBe(true);
  });
});
