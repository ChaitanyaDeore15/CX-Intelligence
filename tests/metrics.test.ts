import { describe, it, expect } from 'vitest';
import { calculateNps, calculateCsat, isSampleReliable } from '../src/lib/metrics';

describe('Deterministic Metrics Engine — Net Promoter Score (NPS)', () => {
  it('correctly calculates standard NPS with positive score (+60.0)', () => {
    // 70 promoters (score 9-10), 20 passives (score 7-8), 10 detractors (score 0-6)
    const scores: number[] = [
      ...Array(70).fill(10),
      ...Array(20).fill(8),
      ...Array(10).fill(4),
    ];

    const result = calculateNps(scores);

    expect(result.totalValidResponses).toBe(100);
    expect(result.promoters).toBe(70);
    expect(result.passives).toBe(20);
    expect(result.detractors).toBe(10);
    expect(result.promoterPct).toBe(70.0);
    expect(result.passivePct).toBe(20.0);
    expect(result.detractorPct).toBe(10.0);
    expect(result.npsScore).toBe(60.0);
  });

  it('correctly calculates negative NPS score (-60.0)', () => {
    // 10 promoters, 20 passives, 70 detractors
    const scores: number[] = [
      ...Array(10).fill(9),
      ...Array(20).fill(7),
      ...Array(70).fill(2),
    ];

    const result = calculateNps(scores);

    expect(result.npsScore).toBe(-60.0);
    expect(result.promoterPct).toBe(10.0);
    expect(result.detractorPct).toBe(70.0);
  });

  it('correctly returns zero NPS when promoters equal detractors', () => {
    const scores: number[] = [
      ...Array(50).fill(10),
      ...Array(50).fill(0),
    ];

    const result = calculateNps(scores);
    expect(result.npsScore).toBe(0.0);
    expect(result.promoterPct).toBe(50.0);
    expect(result.detractorPct).toBe(50.0);
  });

  it('excludes invalid and out-of-boundary scores (e.g. -1, 11, null, NaN)', () => {
    const mixedScores = [10, 10, 8, 4, null, undefined, NaN, -5, 15, 9];
    const result = calculateNps(mixedScores as any);

    // Valid: 10, 10, 8, 4, 9 -> total 5
    // Promoters: 10, 10, 9 (3 -> 60%)
    // Passives: 8 (1 -> 20%)
    // Detractors: 4 (1 -> 20%)
    // NPS = 60 - 20 = 40.0
    expect(result.totalValidResponses).toBe(5);
    expect(result.promoters).toBe(3);
    expect(result.passives).toBe(1);
    expect(result.detractors).toBe(1);
    expect(result.npsScore).toBe(40.0);
  });

  it('returns null score when no valid responses exist', () => {
    const emptyScores: number[] = [];
    const result = calculateNps(emptyScores);

    expect(result.npsScore).toBeNull();
    expect(result.totalValidResponses).toBe(0);
  });
});

describe('Deterministic Metrics Engine — CSAT', () => {
  it('correctly calculates satisfied percentage and average rating', () => {
    // Scores: 5, 4, 3, 2, 1
    // Satisfied (>=4): 5, 4 -> 2 out of 5 = 40.0%
    // Average: (5+4+3+2+1)/5 = 3.00
    const scores = [5, 4, 3, 2, 1];
    const result = calculateCsat(scores);

    expect(result.totalValidResponses).toBe(5);
    expect(result.satisfiedCount).toBe(2);
    expect(result.neutralCount).toBe(1);
    expect(result.dissatisfiedCount).toBe(2);
    expect(result.satisfiedPct).toBe(40.0);
    expect(result.csatScorePct).toBe(40.0);
    expect(result.averageScore).toBe(3.0);
  });

  it('correctly handles all satisfied responses', () => {
    const scores = [5, 5, 4, 5, 4];
    const result = calculateCsat(scores);

    expect(result.satisfiedPct).toBe(100.0);
    expect(result.averageScore).toBe(4.6);
  });

  it('returns null when no valid CSAT scores exist', () => {
    const result = calculateCsat([]);
    expect(result.csatScorePct).toBeNull();
    expect(result.averageScore).toBeNull();
  });
});

describe('Statistical Reliability Checks', () => {
  it('flags small sample sizes (N < 30) as unreliable', () => {
    expect(isSampleReliable(10)).toBe(false);
    expect(isSampleReliable(29)).toBe(false);
    expect(isSampleReliable(30)).toBe(true);
    expect(isSampleReliable(500)).toBe(true);
  });
});
