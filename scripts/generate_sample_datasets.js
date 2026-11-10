const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'sample_data');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const products = ['Enterprise Suite', 'Mobile App', 'Analytics Cloud', 'Billing Portal'];
const regions = ['North America', 'EMEA', 'APAC', 'LATAM'];
const tiers = ['Enterprise', 'Mid-Market', 'SMB', 'Startup'];

const commentsPool = [
  { nps: 10, csat: 5, text: 'The new dashboard layout makes segment tracking effortless for our team.' },
  { nps: 9, csat: 5, text: 'Customer support resolved our integration ticket in under 20 minutes.' },
  { nps: 8, csat: 4, text: 'Overall solid platform, but loading large datasets over 100k rows can be sluggish.' },
  { nps: 4, csat: 2, text: 'Mobile app crashes every time I export a dashboard to PDF. Very frustrating.' },
  { nps: 2, csat: 1, text: 'Unexpected invoice charges and no itemized breakdown. Still waiting 4 days for a response.' },
  { nps: 10, csat: 5, text: 'Automated insights pinpointed our regional drop before our quarterly review.' },
  { nps: 3, csat: 2, text: 'Documentation for the REST API is outdated and code samples contain broken syntax.' },
  { nps: 7, csat: 4, text: 'Works well for day-to-day tracking, minor UI stutter when switching workspaces.' },
  { nps: 1, csat: 1, text: 'Downtime during month-end close caused major delays across our finance division.' },
  { nps: 9, csat: 5, text: 'Phenomenal workflow efficiency and our account manager is exceptionally proactive.' },
];

// 1. Standard Full Omnichannel Enterprise Survey (500 rows)
const f1 = ['response_id,date,nps_score,csat_score,comment,product,region,customer_type'];
for (let i = 1; i <= 500; i++) {
  const p = products[i % products.length];
  const r = regions[i % regions.length];
  const t = tiers[i % tiers.length];
  const c = commentsPool[i % commentsPool.length];
  const day = 1 + (i % 75);
  const d = new Date(2026, 7, day).toISOString().split('T')[0];
  const comment = `"${c.text.replace(/"/g, '""')}"`;
  f1.push(`RESP-${String(i).padStart(4, '0')},${d},${c.nps},${c.csat},${comment},${p},${r},${t}`);
}
fs.writeFileSync(path.join(dir, '1_enterprise_omnichannel_500_rows.csv'), f1.join('\n'));

// 2. NPS-Only Dataset (no CSAT column, varied headers for auto-mapping test)
const f2 = ['survey_id,submission_date,net_promoter_score,feedback,product_line,geo_location'];
for (let i = 1; i <= 200; i++) {
  const p = products[i % products.length];
  const r = regions[i % regions.length];
  const c = commentsPool[i % commentsPool.length];
  const d = new Date(2026, 8, (i % 28) + 1).toISOString().split('T')[0];
  const comment = `"${c.text.replace(/"/g, '""')}"`;
  f2.push(`NPS-${i},${d},${c.nps},${comment},${p},${r}`);
}
fs.writeFileSync(path.join(dir, '2_nps_only_dataset.csv'), f2.join('\n'));

// 3. CSAT-Only Dataset (no NPS column)
const f3 = ['ticket_id,date,satisfaction_rating,comment,service_type'];
for (let i = 1; i <= 150; i++) {
  const c = commentsPool[i % commentsPool.length];
  const d = new Date(2026, 8, (i % 28) + 1).toISOString().split('T')[0];
  const comment = `"${c.text.replace(/"/g, '""')}"`;
  f3.push(`CSAT-${i},${d},${c.csat},${comment},Customer Support`);
}
fs.writeFileSync(path.join(dir, '3_csat_only_dataset.csv'), f3.join('\n'));

// 4. Validation & Error Boundary Test (Out-of-range, invalid dates, duplicates)
const f4 = [
  'response_id,date,nps_score,csat_score,comment,product,region,customer_type',
  'ERR-001,2026-09-01,15,5,"Out of range NPS score (15, should be flagged as ERROR)",Mobile App,EMEA,Enterprise',
  'ERR-002,2026-09-02,-4,4,"Negative NPS score (-4, should be flagged as ERROR)",Mobile App,EMEA,Enterprise',
  'ERR-003,2026-09-03,8,9,"Out of range CSAT rating (9 on 1-5 scale, flagged as ERROR)",Analytics Cloud,North America,SMB',
  'ERR-004,bad-date-format,10,5,"Unparseable date string (flagged as WARNING)",Analytics Cloud,North America,SMB',
  'DUP-001,2026-09-05,10,5,"Duplicate response identifier 1st instance",Enterprise Suite,APAC,Enterprise',
  'DUP-001,2026-09-06,9,4,"Duplicate response identifier 2nd instance",Enterprise Suite,APAC,Enterprise',
  'OK-001,2026-09-07,10,5,"Completely valid record for comparison",Enterprise Suite,North America,Enterprise',
];
fs.writeFileSync(path.join(dir, '4_validation_edge_cases.csv'), f4.join('\n'));

// 5. High-Volume Performance Benchmark (2,500 rows)
const f5 = ['response_id,date,nps_score,csat_score,comment,product,region,customer_type'];
for (let i = 1; i <= 2500; i++) {
  const p = products[i % products.length];
  const r = regions[i % regions.length];
  const t = tiers[i % tiers.length];
  const c = commentsPool[i % commentsPool.length];
  const d = new Date(2026, 6 + (i % 3), (i % 28) + 1).toISOString().split('T')[0];
  const comment = `"${c.text.replace(/"/g, '""')}"`;
  f5.push(`PERF-${i},${d},${c.nps},${c.csat},${comment},${p},${r},${t}`);
}
fs.writeFileSync(path.join(dir, '5_performance_benchmark_2500_rows.csv'), f5.join('\n'));

console.log('All 5 test CSV files generated successfully.');
