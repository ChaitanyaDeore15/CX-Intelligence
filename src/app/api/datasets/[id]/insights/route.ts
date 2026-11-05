import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateNps, calculateCsat } from '@/lib/metrics';
import { computeWeeklyTrends, computeSegmentMetrics } from '@/lib/analytics';
import { extractSemanticThemes } from '@/lib/themes';
import { generateEvidenceGroundedInsights } from '@/lib/insights';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const responses = await prisma.surveyResponse.findMany({
      where: { datasetId: id },
    });

    if (responses.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'EMPTY_DATASET', message: 'Cannot generate insights for empty dataset' } },
        { status: 400 }
      );
    }

    const overallNps = calculateNps(responses.map((r) => r.npsScore));
    const overallCsat = calculateCsat(responses.map((r) => r.csatScore));

    const productSegments = computeSegmentMetrics(
      responses.map((r) => ({ npsScore: r.npsScore, csatScore: r.csatScore, segmentVal: r.product }))
    );
    const regionSegments = computeSegmentMetrics(
      responses.map((r) => ({ npsScore: r.npsScore, csatScore: r.csatScore, segmentVal: r.region }))
    );
    const tierSegments = computeSegmentMetrics(
      responses.map((r) => ({ npsScore: r.npsScore, csatScore: r.csatScore, segmentVal: r.customerType }))
    );

    const trends = computeWeeklyTrends(
      responses.map((r) => ({
        responseDate: r.responseDate,
        npsScore: r.npsScore,
        csatScore: r.csatScore,
      }))
    );

    const commentsForThemes = responses
      .filter((r): r is typeof r & { commentText: string } => typeof r.commentText === 'string' && r.commentText.trim().length > 0)
      .map((r) => ({
        id: r.id,
        commentText: r.commentText,
        npsScore: r.npsScore,
        csatScore: r.csatScore,
      }));

    const themes = extractSemanticThemes(commentsForThemes);

    const generated = generateEvidenceGroundedInsights({
      datasetId: id,
      overallNps,
      overallCsat,
      productSegments,
      regionSegments,
      tierSegments,
      trends,
      themes,
      sampleResponses: responses.filter((r): r is typeof r & { commentText: string } => Boolean(r.commentText)),
    });

    // Clean old generated insights for this dataset
    await prisma.generatedInsight.deleteMany({
      where: { datasetId: id },
    });

    // Save newly generated insights & evidence records
    for (const g of generated) {
      const insight = await prisma.generatedInsight.create({
        data: {
          datasetId: id,
          title: g.title,
          summary: g.summary,
          category: g.category,
          impactRank: g.impactRank,
          evidenceStrength: g.evidenceStrength,
          metricImpactJson: JSON.stringify(g.metricImpact),
          segmentScope: g.segmentScope,
          recommendation: g.recommendation,
          suggestedAction: g.suggestedAction,
          limitations: g.limitations || null,
        },
      });

      if (g.supportingEvidences.length > 0) {
        await prisma.insightEvidence.createMany({
          data: g.supportingEvidences.map((ev) => ({
            insightId: insight.id,
            responseId: ev.responseId,
            excerpt: ev.commentExcerpt,
          })),
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        insightsCount: generated.length,
        insights: generated,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INSIGHT_GENERATION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const insights = await prisma.generatedInsight.findMany({
      where: { datasetId: id },
      orderBy: { impactRank: 'asc' },
      include: {
        evidences: {
          include: {
            response: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_INSIGHTS_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
