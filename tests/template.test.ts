import { describe, it, expect } from 'vitest';
import { SAMPLE_CSV_HEADERS, SAMPLE_CSV_TEMPLATE, generateSyntheticSurveyData } from '../src/lib/csv-template';

describe('CSV Template & Synthetic Generator', () => {
  it('contains expected CX survey standard headers', () => {
    expect(SAMPLE_CSV_HEADERS).toContain('nps_score');
    expect(SAMPLE_CSV_HEADERS).toContain('csat_score');
    expect(SAMPLE_CSV_HEADERS).toContain('comment');
    expect(SAMPLE_CSV_HEADERS).toContain('product');
    expect(SAMPLE_CSV_HEADERS).toContain('region');
    expect(SAMPLE_CSV_HEADERS).toContain('customer_type');
  });

  it('generates synthetic survey dataset with requested row count', () => {
    const csv = generateSyntheticSurveyData(50);
    const lines = csv.trim().split('\n');
    // 1 header line + 50 data rows = 51 lines
    expect(lines.length).toBe(51);
    expect(lines[0]).toBe(SAMPLE_CSV_HEADERS.join(','));
  });

  it('provides a valid downloadable template string', () => {
    expect(SAMPLE_CSV_TEMPLATE).toContain('RESP-001');
    expect(SAMPLE_CSV_TEMPLATE).toContain('Enterprise Suite');
  });
});
