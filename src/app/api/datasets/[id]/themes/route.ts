import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const themes = await prisma.theme.findMany({
      where: { datasetId: id },
      include: {
        _count: {
          select: { assignments: true },
        },
      },
      orderBy: { commentCount: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: themes,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_THEMES_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
