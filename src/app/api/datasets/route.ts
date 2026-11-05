import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const datasets = await prisma.dataset.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            responses: true,
            themes: true,
            insights: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: datasets,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATASET_FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to retrieve datasets',
        },
      },
      { status: 500 }
    );
  }
}
