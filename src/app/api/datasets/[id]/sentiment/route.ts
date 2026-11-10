import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const sentiments = await prisma.sentimentResult.findMany({
      where: {
        response: {
          datasetId: id,
        },
      },
      include: {
        response: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const total = sentiments.length;
    const positive = sentiments.filter((s) => s.sentiment === 'POSITIVE').length;
    const neutral = sentiments.filter((s) => s.sentiment === 'NEUTRAL').length;
    const negative = sentiments.filter((s) => s.sentiment === 'NEGATIVE').length;

    return NextResponse.json({
      success: true,
      data: {
        total,
        positive,
        neutral,
        negative,
        sentiments,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_SENTIMENT_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
