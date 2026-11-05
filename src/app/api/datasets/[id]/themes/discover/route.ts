import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { extractSemanticThemes } from '@/lib/themes';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const responses = await prisma.surveyResponse.findMany({
      where: {
        datasetId: id,
        commentText: { not: null },
      },
      select: {
        id: true,
        commentText: true,
        npsScore: true,
        csatScore: true,
      },
    });

    const validComments = responses.filter(
      (r): r is typeof r & { commentText: string } => typeof r.commentText === 'string' && r.commentText.trim().length > 0
    );

    const extracted = extractSemanticThemes(validComments);

    // Persist discovered themes
    for (const item of extracted) {
      let theme = await prisma.theme.findFirst({
        where: { datasetId: id, name: item.name },
      });

      if (!theme) {
        theme = await prisma.theme.create({
          data: {
            datasetId: id,
            name: item.name,
            description: item.description,
            commentCount: item.commentCount,
            impactScore: item.impactScore,
          },
        });
      } else {
        theme = await prisma.theme.update({
          where: { id: theme.id },
          data: {
            commentCount: item.commentCount,
            impactScore: item.impactScore,
          },
        });
      }

      // Link comment assignments
      for (const respId of item.assignedResponseIds) {
        await prisma.commentThemeAssignment.upsert({
          where: {
            responseId_themeId: {
              responseId: respId,
              themeId: theme.id,
            },
          },
          update: {
            relevance: 1.0,
          },
          create: {
            responseId: respId,
            themeId: theme.id,
            relevance: 1.0,
            isRepresentative: false,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        discoveredThemesCount: extracted.length,
        themes: extracted,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'THEME_DISCOVERY_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
