import { describe, it, expect } from 'vitest';
import { computeWeeklyTrends, computeSegmentMetrics } from '../src/lib/analytics';

describe('Phase 3 — Analytics & Trend Engine', () => {
  it('correctly aggregates weekly chronological trends', () => {
    const records = [
      { responseDate: new Date('2026-09-01'), npsScore: 10, csatScore: 5 },
      { responseDate: new Date('2026-09-02'), npsScore: 9, csatScore: 5 },
      { responseDate: new Date('2026-09-08'), npsScore: 4, csatScore: 2 },
      { responseDate: new Date('2026-09-15'), npsScore: 2, csatScore: 1 },
    ];

    const result = computeWeeklyTrends(records);
    expect(result.buckets.length).toBeGreaterThanOrEqual(2);
    expect(result.overallChange.npsDelta).not.toBeNull();
    expect(result.overallChange.volumeDelta).toBeDefined();
  });

  it('handles missing dates gracefully without crashing', () => {
    const records = [
      { responseDate: null, npsScore: 10, csatScore: 5 },
      { responseDate: null, npsScore: 4, csatScore: 2 },
    ];

    const result = computeWeeklyTrends(records);
    expect(result.buckets).toHaveLength(0);
    expect(result.overallChange.npsDelta).toBeNull();
  });

  it('computes segment breakdown matrix with sample reliability flags', () => {
    const smallSegment = Array(15).fill({ npsScore: 10, csatScore: 5, segmentVal: 'SMB' });
    const largeSegment = Array(45).fill({ npsScore: 8, csatScore: 4, segmentVal: 'Enterprise' });

    const matrix = computeSegmentMetrics([...smallSegment, ...largeSegment]);
    expect(matrix).toHaveLength(2);
    
    const ent = matrix.find((m) => m.segmentValue === 'Enterprise');
    const smb = matrix.find((m) => m.segmentValue === 'SMB');

    expect(ent?.totalResponses).toBe(45);
    expect(ent?.isReliable).toBe(true); // >= 30

    expect(smb?.totalResponses).toBe(15);
    expect(smb?.isReliable).toBe(false); // < 30 warning
  });
});
