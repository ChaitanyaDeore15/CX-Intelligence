const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial demonstration CX dataset...');

  // Check if demo dataset already exists
  const existing = await prisma.dataset.findFirst({
    where: { name: 'Q3 2026 Enterprise CX Benchmark' },
  });

  if (existing) {
    console.log('Demonstration dataset already exists. Skipping seed.');
    return;
  }

  const dataset = await prisma.dataset.create({
    data: {
      name: 'Q3 2026 Enterprise CX Benchmark',
      fileName: 'q3_2026_cx_benchmark.csv',
      fileSizeBytes: 145280,
      totalRows: 100,
      validRows: 100,
      status: 'READY',
      columnMapping: JSON.stringify({
        npsScore: 'nps_score',
        csatScore: 'csat_score',
        responseDate: 'date',
        commentText: 'comment',
        product: 'product',
        region: 'region',
        customerType: 'customer_type',
      }),
      dateRangeStart: new Date('2026-07-01'),
      dateRangeEnd: new Date('2026-09-30'),
    },
  });

  const products = ['Enterprise Suite', 'Mobile App', 'Analytics Cloud', 'Billing Portal'];
  const regions = ['North America', 'EMEA', 'APAC', 'LATAM'];
  const customerTypes = ['Enterprise', 'Mid-Market', 'SMB'];

  const comments = [
    { nps: 10, csat: 5, text: 'The new dashboard layout makes segment tracking effortless for our team.', sentiment: 'POSITIVE' },
    { nps: 9, csat: 5, text: 'Customer support resolved our integration ticket in under 20 minutes.', sentiment: 'POSITIVE' },
    { nps: 8, csat: 4, text: 'Overall solid platform, but loading large datasets over 100k rows can be sluggish.', sentiment: 'NEUTRAL' },
    { nps: 4, csat: 2, text: 'Mobile app crashes every time I export a dashboard to PDF. Very frustrating.', sentiment: 'NEGATIVE' },
    { nps: 2, csat: 1, text: 'Unexpected invoice charges and no itemized breakdown. Still waiting 4 days for a response.', sentiment: 'NEGATIVE' },
    { nps: 10, csat: 5, text: 'Automated insights pinpointed our regional drop before our quarterly review.', sentiment: 'POSITIVE' },
    { nps: 3, csat: 2, text: 'Documentation for the REST API is outdated and code samples contain broken syntax.', sentiment: 'NEGATIVE' },
    { nps: 7, csat: 4, text: 'Works well for day-to-day tracking, minor UI stutter when switching workspaces.', sentiment: 'NEUTRAL' },
  ];

  for (let i = 1; i <= 100; i++) {
    const c = comments[i % comments.length];
    const p = products[i % products.length];
    const r = regions[i % regions.length];
    const ct = customerTypes[i % customerTypes.length];
    const day = 1 + (i % 80);
    const date = new Date(2026, 6, day);

    const response = await prisma.surveyResponse.create({
      data: {
        datasetId: dataset.id,
        rowNumber: i,
        sourceId: `RESP-${String(i).padStart(4, '0')}`,
        npsScore: c.nps,
        csatScore: c.csat,
        responseDate: date,
        commentText: c.text,
        product: p,
        region: r,
        customerType: ct,
      },
    });

    await prisma.sentimentResult.create({
      data: {
        responseId: response.id,
        sentiment: c.sentiment,
        confidence: 0.95,
        explanation: `Classified as ${c.sentiment} based on linguistic indicators.`,
        modelName: 'deterministic-heuristic-v1',
      },
    });
  }

  // Create sample themes
  const billingTheme = await prisma.theme.create({
    data: {
      datasetId: dataset.id,
      name: 'Billing Transparency & Invoicing',
      description: 'Customer complaints regarding unexpected fees and sluggish billing support response times.',
      commentCount: 25,
      impactScore: 0.82,
    },
  });

  const appStabilityTheme = await prisma.theme.create({
    data: {
      datasetId: dataset.id,
      name: 'Mobile App Performance & Crashes',
      description: 'Reported app freezes during PDF exports and complex query execution.',
      commentCount: 25,
      impactScore: 0.74,
    },
  });

  // Create sample insight
  const insight = await prisma.generatedInsight.create({
    data: {
      datasetId: dataset.id,
      title: 'Mobile App Stability Directly Depressing EMEA CSAT',
      summary: 'Mobile App customer satisfaction in EMEA dropped to 2.4/5, heavily driven by PDF export crashes.',
      category: 'PRODUCT_GAP',
      impactRank: 1,
      evidenceStrength: 'STRONG',
      metricImpactJson: JSON.stringify({
        npsDeviation: -24.5,
        affectedSegment: 'Mobile App / EMEA',
        sampleCount: 25,
      }),
      segmentScope: 'Product: Mobile App, Region: EMEA',
      recommendation: 'Prioritize mobile release patch 4.2.1 targeting PDF memory leaks in rendering pipeline.',
      suggestedAction: 'Engage Mobile engineering team on error logs and proactively reach out to affected EMEA SMB accounts.',
    },
  });

  await prisma.auditEvent.create({
    data: {
      datasetId: dataset.id,
      action: 'DATASET_SEEDED',
      detailsJson: JSON.stringify({ totalRows: 100, seedVersion: '1.0' }),
    },
  });

  console.log(`Successfully seeded dataset: ${dataset.id} with 100 responses and initial themes/insights.`);
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
