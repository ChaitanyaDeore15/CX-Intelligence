import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseCsvText } from '@/lib/csv-parser';
import { validateSurveyRecords } from '@/lib/validation';
import { ColumnMappingConfig } from '@/lib/mapping';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { mapping, csvText, csatMin = 1, csatMax = 5 } = body;

    const parsed = parseCsvText(csvText);
    const summary = validateSurveyRecords(parsed.rows, mapping as ColumnMappingConfig, {
      csatMin,
      csatMax,
    });

    // Accept valid records only
    const validRecords = summary.validatedRecords.filter((r) => !r.hasError);

    // Save validation issues to DB
    if (summary.issues.length > 0) {
      await prisma.validationIssue.createMany({
        data: summary.issues.map((iss) => ({
          datasetId: id,
          rowNumber: iss.rowNumber,
          column: iss.column || null,
          errorType: iss.errorType,
          message: iss.message,
          severity: iss.severity,
        })),
      });
    }

    // Ingest valid survey responses in batches of 500
    const BATCH_SIZE = 500;
    for (let i = 0; i < validRecords.length; i += BATCH_SIZE) {
      const chunk = validRecords.slice(i, i + BATCH_SIZE);
      await prisma.surveyResponse.createMany({
        data: chunk.map((r) => ({
          datasetId: id,
          rowNumber: r.rowNumber,
          sourceId: r.sourceId,
          npsScore: r.npsScore,
          csatScore: r.csatScore,
          responseDate: r.responseDate,
          commentText: r.commentText,
          product: r.product,
          region: r.region,
          customerType: r.customerType,
          metadataJson: Object.keys(r.metadata).length > 0 ? JSON.stringify(r.metadata) : null,
        })),
      });
    }

    // Update dataset status to READY
    const updated = await prisma.dataset.update({
      where: { id },
      data: {
        status: 'READY',
        totalRows: summary.totalRows,
        validRows: validRecords.length,
        columnMapping: JSON.stringify(mapping),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        datasetId: updated.id,
        totalRows: updated.totalRows,
        validRows: updated.validRows,
        status: updated.status,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CONFIRM_FAILED',
          message: error instanceof Error ? error.message : 'Unknown confirmation error',
        },
      },
      { status: 500 }
    );
  }
}
