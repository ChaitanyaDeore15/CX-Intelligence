/**
 * CX Survey Sample Data & Template Generator
 */

export const SAMPLE_CSV_HEADERS = [
  'response_id',
  'date',
  'nps_score',
  'csat_score',
  'comment',
  'product',
  'region',
  'customer_type',
];

export const SAMPLE_CSV_TEMPLATE = `response_id,date,nps_score,csat_score,comment,product,region,customer_type
RESP-001,2026-09-01,10,5,"The latest reporting update saved our analytics team 5 hours a week. Extremely smooth onboarding!",Enterprise Suite,North America,Enterprise
RESP-002,2026-09-02,9,5,"Customer support resolved our integration ticket in under 20 minutes. Great experience.",Analytics Cloud,EMEA,Mid-Market
RESP-003,2026-09-03,4,2,"Mobile app crashes every time I export a dashboard to PDF. Very frustrating during client meetings.",Mobile App,North America,SMB
RESP-004,2026-09-04,2,1,"Unexpected invoice charges and no itemized breakdown. Still waiting 4 days for a response from billing.",Billing Portal,EMEA,Enterprise
RESP-005,2026-09-05,8,4,"Overall solid platform, but loading large datasets over 100k rows can be sluggish.",Analytics Cloud,APAC,Mid-Market
RESP-006,2026-09-06,10,5,"Best CX analytics tool on the market. The natural language insights are spot on.",Enterprise Suite,APAC,Enterprise
RESP-007,2026-09-07,3,2,"Documentation for the REST API is outdated and code samples contain broken syntax.",Enterprise Suite,LATAM,Mid-Market
RESP-008,2026-09-08,9,4,"User interface is intuitive and clean. Our executive team loves the weekly digest.",Analytics Cloud,North America,Enterprise
RESP-009,2026-09-09,5,3,"Average tool. Does what it says, but lacks customizable role-based permissions.",Mobile App,EMEA,SMB
RESP-010,2026-09-10,1,1,"System downtime during month-end close caused major delays across our finance division.",Billing Portal,North America,Enterprise
`;

export function generateSyntheticSurveyData(count: number = 250): string {
  const products = ['Enterprise Suite', 'Mobile App', 'Analytics Cloud', 'Billing Portal'];
  const regions = ['North America', 'EMEA', 'APAC', 'LATAM'];
  const customerTypes = ['Enterprise', 'Mid-Market', 'SMB', 'Startup'];

  const feedbackPool = [
    { nps: 10, csat: 5, text: 'Phenomenal workflow efficiency and our account manager is exceptionally proactive.' },
    { nps: 9, csat: 5, text: 'The new dashboard layout makes segment tracking effortless for our team.' },
    { nps: 10, csat: 5, text: 'Blazing fast query speeds and intuitive data visualization filters.' },
    { nps: 8, csat: 4, text: 'Good feature set overall, but would love more native integrations with Salesforce.' },
    { nps: 7, csat: 4, text: 'Works well for day-to-day tracking, minor UI stutter when switching workspaces.' },
    { nps: 7, csat: 3, text: 'Standard capabilities. Nothing revolutionary, but gets the reporting done.' },
    { nps: 4, csat: 2, text: 'Mobile app notifications are frequently delayed or duplicate.' },
    { nps: 3, csat: 2, text: 'Billing discrepancies occurred twice this quarter. Needs better transparency.' },
    { nps: 2, csat: 1, text: 'Customer support wait times have degraded drastically from minutes to days.' },
    { nps: 1, csat: 1, text: 'Critical reports fail to export and system encounters intermittent 500 errors.' },
    { nps: 5, csat: 3, text: 'Learning curve was steep for non-technical team members.' },
    { nps: 9, csat: 4, text: 'Clear visualization options and very dependable data accuracy.' },
    { nps: 2, csat: 1, text: 'App freezes when loading charts with more than 5 filters applied.' },
    { nps: 10, csat: 5, text: 'Automated insights pinpointed our regional drop before our quarterly review.' },
    { nps: 6, csat: 3, text: 'Exported CSV formatting occasionally misses date columns.' },
  ];

  const rows: string[] = [SAMPLE_CSV_HEADERS.join(',')];

  const startDate = new Date('2026-07-01');

  for (let i = 1; i <= count; i++) {
    const id = `RESP-${String(i).padStart(4, '0')}`;
    const dateObj = new Date(startDate.getTime() + Math.floor(Math.random() * 75) * 86400000);
    const dateStr = dateObj.toISOString().split('T')[0];
    const sample = feedbackPool[Math.floor(Math.random() * feedbackPool.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    const customerType = customerTypes[Math.floor(Math.random() * customerTypes.length)];

    // Occasional score perturbation to simulate natural variance
    const nps = Math.min(10, Math.max(0, sample.nps + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0)));
    const csat = Math.min(5, Math.max(1, sample.csat));
    const comment = `"${sample.text.replace(/"/g, '""')}"`;

    rows.push([id, dateStr, nps, csat, comment, product, region, customerType].join(','));
  }

  return rows.join('\n');
}
