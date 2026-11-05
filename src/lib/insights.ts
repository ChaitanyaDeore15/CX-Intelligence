import { NpsResult, CsatResult } from './metrics';
import { TrendAnalysisResult, SegmentMetric } from './analytics';
import { ExtractedThemeResult } from './themes';
import { scrubPII } from './privacy';

export interface InsightEvidenceItem {
  responseId: string;
  sourceId: string | null;
  commentExcerpt: string;
  npsScore: number | null;
  csatScore: number | null;
  product: string | null;
  region: string | null;
}

export interface StructuredInsight {
  title: string;
  summary: string;
  category: 'PRODUCT_GAP' | 'SERVICE_ISSUE' | 'CHURN_RISK' | 'POSITIVE_HIGHLIGHT';
  impactRank: number; // 1 is highest priority
  evidenceStrength: 'STRONG' | 'MODERATE' | 'PRELIMINARY';
  metricImpact: {
    npsDeviation?: number;
    affectedSegment?: string;
    sampleCount: number;
  };
  segmentScope: string;
  recommendation: string;
  suggestedAction: string;
  limitations?: string;
  supportingEvidences: InsightEvidenceItem[];
}

export interface InsightGenerationInput {
  datasetId: string;
  overallNps: NpsResult;
  overallCsat: CsatResult;
  productSegments: SegmentMetric[];
  regionSegments: SegmentMetric[];
  tierSegments: SegmentMetric[];
  trends: TrendAnalysisResult;
  themes: ExtractedThemeResult[];
  sampleResponses: Array<{
    id: string;
    sourceId: string | null;
    commentText: string;
    npsScore: number | null;
    csatScore: number | null;
    product: string | null;
    region: string | null;
  }>;
}

/**
 * Deterministically generates ranked CX insights grounded in verifiable facts and linked evidence
 */
export function generateEvidenceGroundedInsights(
  input: InsightGenerationInput
): StructuredInsight[] {
  const insights: StructuredInsight[] = [];

  // 1. Check for Underperforming Product Segments
  const baselineNps = input.overallNps.npsScore ?? 0;
  for (const seg of input.productSegments) {
    if (seg.nps.npsScore !== null && seg.nps.npsScore < baselineNps - 15) {
      const drop = Number((seg.nps.npsScore - baselineNps).toFixed(1));
      const relatedEvidences: InsightEvidenceItem[] = input.sampleResponses
        .filter((r) => r.product === seg.segmentValue && (r.npsScore ?? 10) <= 6)
        .slice(0, 3)
        .map((r) => ({
          responseId: r.id,
          sourceId: r.sourceId,
          commentExcerpt: scrubPII(r.commentText).scrubbedText.slice(0, 150),
          npsScore: r.npsScore,
          csatScore: r.csatScore,
          product: r.product,
          region: r.region,
        }));

      insights.push({
        title: `Product Satisfaction Deficit: '${seg.segmentValue}' Underperforming Baseline`,
        summary: `${seg.segmentValue} exhibits an NPS of ${seg.nps.npsScore > 0 ? '+' : ''}${seg.nps.npsScore}, which is ${Math.abs(drop)} points below the overall portfolio baseline (${baselineNps}).`,
        category: 'PRODUCT_GAP',
        impactRank: 1,
        evidenceStrength: seg.isReliable ? 'STRONG' : 'PRELIMINARY',
        metricImpact: {
          npsDeviation: drop,
          affectedSegment: `Product: ${seg.segmentValue}`,
          sampleCount: seg.totalResponses,
        },
        segmentScope: `Product: ${seg.segmentValue}`,
        recommendation: `Conduct a targeted diagnostic review of the ${seg.segmentValue} user journey, specifically focusing on reported stability and feature blockers.`,
        suggestedAction: `Convene product and UX leads to review error logs and reach out to detractor respondents.`,
        limitations: seg.isReliable ? undefined : `Small sample warning: only ${seg.totalResponses} responses recorded for this segment.`,
        supportingEvidences: relatedEvidences,
      });
    }
  }

  // 2. Check for Top High-Impact Customer Pain Point Theme
  const topNegativeTheme = input.themes.find((t) => t.impactScore >= 0.7);
  if (topNegativeTheme) {
    const relatedEvidences: InsightEvidenceItem[] = input.sampleResponses
      .filter((r) => topNegativeTheme.assignedResponseIds.includes(r.id))
      .slice(0, 3)
      .map((r) => ({
        responseId: r.id,
        sourceId: r.sourceId,
        commentExcerpt: scrubPII(r.commentText).scrubbedText.slice(0, 150),
        npsScore: r.npsScore,
        csatScore: r.csatScore,
        product: r.product,
        region: r.region,
      }));

    insights.push({
      title: `Critical CX Friction: '${topNegativeTheme.name}' Driving Detractor Sentiment`,
      summary: `${topNegativeTheme.commentCount} customer comments reported issues relating to ${topNegativeTheme.name.toLowerCase()}, with ${(topNegativeTheme.impactScore * 100).toFixed(0)}% of affected customers rating as detractors.`,
      category: 'SERVICE_ISSUE',
      impactRank: 2,
      evidenceStrength: 'STRONG',
      metricImpact: {
        affectedSegment: topNegativeTheme.name,
        sampleCount: topNegativeTheme.commentCount,
      },
      segmentScope: `All Segments / Theme: ${topNegativeTheme.name}`,
      recommendation: `Institute immediate remediation protocol for ${topNegativeTheme.name.toLowerCase()} and establish automated alerts.`,
      suggestedAction: `Audit customer support queue and engineering tickets tagged with this category.`,
      supportingEvidences: relatedEvidences,
    });
  }

  // 3. Check for Region-Specific Opportunities
  for (const reg of input.regionSegments) {
    if (reg.csat.csatScorePct !== null && reg.csat.csatScorePct < 60) {
      const relatedEvidences: InsightEvidenceItem[] = input.sampleResponses
        .filter((r) => r.region === reg.segmentValue && (r.csatScore ?? 5) <= 2)
        .slice(0, 3)
        .map((r) => ({
          responseId: r.id,
          sourceId: r.sourceId,
          commentExcerpt: scrubPII(r.commentText).scrubbedText.slice(0, 150),
          npsScore: r.npsScore,
          csatScore: r.csatScore,
          product: r.product,
          region: r.region,
        }));

      insights.push({
        title: `Regional CSAT Vulnerability in ${reg.segmentValue}`,
        summary: `Customer satisfaction in ${reg.segmentValue} is depressed at ${reg.csat.csatScorePct}%, with average score ${reg.csat.averageScore}/5.0.`,
        category: 'CHURN_RISK',
        impactRank: 3,
        evidenceStrength: reg.isReliable ? 'STRONG' : 'MODERATE',
        metricImpact: {
          affectedSegment: `Region: ${reg.segmentValue}`,
          sampleCount: reg.totalResponses,
        },
        segmentScope: `Region: ${reg.segmentValue}`,
        recommendation: `Investigate regional infrastructure latency and localized support availability for ${reg.segmentValue}.`,
        suggestedAction: `Review regional account health with Customer Success directors.`,
        supportingEvidences: relatedEvidences,
      });
    }
  }

  // Sort by impactRank ascending (1 is top priority)
  return insights.sort((a, b) => a.impactRank - b.impactRank);
}
