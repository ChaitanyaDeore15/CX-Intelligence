import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateNps, calculateCsat } from '@/lib/metrics';
import { computeWeeklyTrends, computeSegmentMetrics } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);

    const product = searchParams.get('product');
    const region = searchParams.get('region');
    const customerType = searchParams.get('customerType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build Prisma where filter
    const whereClause: any = { datasetId: id };
    if (product && product !== 'ALL') whereClause.product = product;
    if (region && region !== 'ALL') whereClause.region = region;
    if (customerType && customerType !== 'ALL') whereClause.customerType = customerType;

    if (startDate || endDate) {
      whereClause.responseDate = {};
      if (startDate) whereClause.responseDate.gte = new Date(startDate);
      if (endDate) whereClause.responseDate.lte = new Date(endDate);
    }

    const responses = await prisma.surveyResponse.findMany({
      where: whereClause,
      select: {
        id: true,
        sourceId: true,
        npsScore: true,
        csatScore: true,
        responseDate: true,
        commentText: true,
        product: true,
        region: true,
        customerType: true,
      },
    });

    // Deterministic overall metrics
    const nps = calculateNps(responses.map((r) => r.npsScore));
    const csat = calculateCsat(responses.map((r) => r.csatScore));
    const commentCount = responses.filter((r) => Boolean(r.commentText)).length;

    // Segment breakdowns
    const productSegments = computeSegmentMetrics(
      responses.map((r) => ({ npsScore: r.npsScore, csatScore: r.csatScore, segmentVal: r.product }))
    );
    const regionSegments = computeSegmentMetrics(
      responses.map((r) => ({ npsScore: r.npsScore, csatScore: r.csatScore, segmentVal: r.region }))
    );
    const tierSegments = computeSegmentMetrics(
      responses.map((r) => ({ npsScore: r.npsScore, csatScore: r.csatScore, segmentVal: r.customerType }))
    );

    // Weekly time-series trends
    const trends = computeWeeklyTrends(
      responses.map((r) => ({
        responseDate: r.responseDate,
        npsScore: r.npsScore,
        csatScore: r.csatScore,
      }))
    );

    // Extract unique filter options
    const allRecordsForFilters = await prisma.surveyResponse.findMany({
      where: { datasetId: id },
      select: { product: true, region: true, customerType: true },
    });

    const products = Array.from(new Set(allRecordsForFilters.map((r) => r.product).filter(Boolean))) as string[];
    const regions = Array.from(new Set(allRecordsForFilters.map((r) => r.region).filter(Boolean))) as string[];
    const customerTypes = Array.from(new Set(allRecordsForFilters.map((r) => r.customerType).filter(Boolean))) as string[];

    return NextResponse.json({
      success: true,
      data: {
        totalFilteredRecords: responses.length,
        nps,
        csat,
        commentCount,
        trends,
        segments: {
          byProduct: productSegments,
          byRegion: regionSegments,
          byCustomerType: tierSegments,
        },
        availableFilters: {
          products,
          regions,
          customerTypes,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ANALYTICS_FAILED',
          message: error instanceof Error ? error.message : 'Unknown analytics error',
        },
      },
      { status: 500 }
    );
  }
}
