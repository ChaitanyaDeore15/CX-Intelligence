import { NextResponse } from 'next/server';
import { SAMPLE_CSV_TEMPLATE, generateSyntheticSurveyData } from '@/lib/csv-template';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'template' or 'synthetic'
  const count = parseInt(searchParams.get('count') || '100', 10);

  const csvContent = type === 'synthetic' 
    ? generateSyntheticSurveyData(Math.min(count, 10000))
    : SAMPLE_CSV_TEMPLATE;

  const fileName = type === 'synthetic' ? `synthetic_cx_survey_${count}_rows.csv` : 'cx_survey_template.csv';

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
}
