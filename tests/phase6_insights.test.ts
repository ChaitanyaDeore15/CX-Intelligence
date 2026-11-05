import { describe, it, expect } from 'vitest';
import { generateEvidenceGroundedInsights } from '../src/lib/insights';
import { calculateNps, calculateCsat } from '../src/lib/metrics';

describe('Phase 6 — Evidence-Grounded Insights Engine', () => {
  it('detects underperforming product segment and links supporting evidence comments', () => {
    const overallNps = calculateNps([10, 10, 9, 8, 8]); // NPS ~ 60
    const overallCsat = calculateCsat([5, 5, 4, 4, 4]);

    const productSegments = [
      {
        segmentValue: 'Mobile App',
        totalResponses: 40,
        nps: calculateNps([2, 4, 1, 0]), // severe drop
        csat: calculateCsat([1, 2, 1, 2]),
        isReliable: true,
      },
    ];

    const sampleResponses = [
      {
        id: 'RESP-01',
        sourceId: 'R1',
        commentText: 'Mobile app crashes whenever I view reports. Unusable.',
        npsScore: 1,
        csatScore: 1,
        product: 'Mobile App',
        region: 'North America',
      },
    ];

    const insights = generateEvidenceGroundedInsights({
      datasetId: 'test-dataset',
      overallNps,
      overallCsat,
      productSegments,
      regionSegments: [],
      tierSegments: [],
      trends: { buckets: [], overallChange: { npsDelta: 0, csatSatisfiedPctDelta: 0, csatAverageDelta: 0, volumeDelta: 0 } },
      themes: [],
      sampleResponses,
    });

    expect(insights.length).toBeGreaterThan(0);
    const productInsight = insights.find((i) => i.category === 'PRODUCT_GAP');
    expect(productInsight).toBeDefined();
    expect(productInsight?.impactRank).toBe(1);
    expect(productInsight?.supportingEvidences).toHaveLength(1);
    expect(productInsight?.supportingEvidences[0].commentExcerpt).toContain('Mobile app crashes');
    expect(productInsight?.evidenceStrength).toBe('STRONG');
  });
});
