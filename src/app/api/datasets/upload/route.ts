import { NextResponse } from 'next/server';
import { parseCsvText } from '@/lib/csv-parser';
import { detectColumnMappings } from '@/lib/mapping';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_FILE', message: 'No CSV file provided' } },
        { status: 400 }
      );
    }

    // Configurable file size limit (25MB)
    const maxSizeBytes = Number(process.env.MAX_FILE_SIZE_BYTES || 26214400);
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: `File size exceeds ${(maxSizeBytes / (1024 * 1024)).toFixed(0)}MB limit`,
          },
        },
        { status: 400 }
      );
    }

    const text = await file.text();
    const parsed = parseCsvText(text);

    if (parsed.headers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CSV',
            message: 'Uploaded file contains no valid CSV headers or data',
          },
        },
        { status: 400 }
      );
    }

    // Configurable row count limit
    const maxRows = Number(process.env.MAX_ROW_COUNT || 10000);
    if (parsed.totalRows > maxRows) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ROW_LIMIT_EXCEEDED',
            message: `Dataset contains ${parsed.totalRows} rows, exceeding max limit of ${maxRows}`,
          },
        },
        { status: 400 }
      );
    }

    // Detect column mappings
    const suggestedMapping = detectColumnMappings(parsed.headers);

    // Create Dataset record in UPLOADED status
    const dataset = await prisma.dataset.create({
      data: {
        name: file.name.replace(/\.[^/.]+$/, ''),
        fileName: file.name,
        fileSizeBytes: file.size,
        totalRows: parsed.totalRows,
        validRows: 0,
        status: 'UPLOADED',
        columnMapping: JSON.stringify(suggestedMapping),
      },
    });

    // We return preview rows (first 25 rows) and detected mappings
    const previewRows = parsed.rows.slice(0, 25);

    return NextResponse.json({
      success: true,
      data: {
        datasetId: dataset.id,
        fileName: file.name,
        fileSizeBytes: file.size,
        totalRows: parsed.totalRows,
        headers: parsed.headers,
        suggestedMapping,
        previewRows,
        parseErrors: parsed.errors,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: error instanceof Error ? error.message : 'Unknown upload error',
        },
      },
      { status: 500 }
    );
  }
}
