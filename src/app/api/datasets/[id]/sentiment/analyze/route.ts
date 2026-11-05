import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { classifyCommentSentiment } from '@/lib/sentiment';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Retrieve unanalyzed responses or all responses with comments
    const responses = await prisma.surveyResponse.findMany({
      where: {
        datasetId: id,
        commentText: { not: null },
      },
      include: {
        sentimentResult: true,
      },
    });

    const unanalyzed = responses.filter((r) => !r.sentimentResult && r.commentText);

    // Create AnalysisJob
    const job = await prisma.analysisJob.create({
      data: {
        datasetId: id,
        jobType: 'SENTIMENT',
        status: 'PROCESSING',
        totalItems: unanalyzed.length,
        processedItems: 0,
        startedAt: new Date(),
      },
    });

    let processed = 0;
    for (const r of unanalyzed) {
      if (!r.commentText) continue;
      const res = await classifyCommentSentiment(r.commentText);
      await prisma.sentimentResult.create({
        data: {
          responseId: r.id,
          sentiment: res.sentiment,
          confidence: res.confidence,
          explanation: res.explanation,
          modelName: 'cx-nlp-engine-v1',
        },
      });
      processed++;
    }

    // Complete Job
    await prisma.analysisJob.update({
      where: { id: job.id },
      data: {
        status: 'COMPLETED',
        progress: 100,
        processedItems: processed,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        jobId: job.id,
        processedItems: processed,
        totalItems: unanalyzed.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SENTIMENT_JOB_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
