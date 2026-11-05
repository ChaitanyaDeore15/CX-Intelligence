import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const dataset = await prisma.dataset.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            responses: true,
            validationIssues: true,
            themes: true,
            insights: true,
          },
        },
      },
    });

    if (!dataset) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Dataset not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: dataset });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Hard delete dataset: Prisma schema has onDelete: Cascade for all children
    await prisma.dataset.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: { message: `Dataset ${id} and all related records deleted successfully` },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: error instanceof Error ? error.message : 'Unknown deletion error',
        },
      },
      { status: 500 }
    );
  }
}
