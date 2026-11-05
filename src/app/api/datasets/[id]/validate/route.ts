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

    if (!mapping || typeof mapping !== 'object') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_MAPPING', message: 'Mapping configuration required' } },
        { status: 400 }
      );
    }

    if (!csvText) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_CSV', message: 'CSV content required for validation' } },
        { status: 400 }
      );
    }

    const parsed = parseCsvText(csvText);
    const summary = validateSurveyRecords(parsed.rows, mapping as ColumnMappingConfig, {
      csatMin,
      csatMax,
    });

    // Save validation state
    await prisma.dataset.update({
      where: { id },
      data: {
        status: 'VALIDATED',
        columnMapping: JSON.stringify(mapping),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        datasetId: id,
        totalRows: summary.totalRows,
        acceptedRows: summary.acceptedRows,
        rejectedRows: summary.rejectedRows,
        issueCount: summary.issues.length,
        issues: summary.issues.slice(0, 50), // top 50 issues
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown validation error',
        },
      },
      { status: 500 }
    );
  }
}
