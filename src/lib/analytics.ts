import { calculateNps, calculateCsat, NpsResult, CsatResult } from './metrics';

export interface FilterCriteria {
  datasetId?: string;
  product?: string;
  region?: string;
  customerType?: string;
  startDate?: string;
  endDate?: string;
  npsCategory?: 'PROMOTER' | 'PASSIVE' | 'DETRACTOR';
  csatCategory?: 'SATISFIED' | 'NEUTRAL' | 'DISSATISFIED';
}

export interface SegmentMetric {
  segmentValue: string;
  totalResponses: number;
  nps: NpsResult;
  csat: CsatResult;
  isReliable: boolean; // N >= 30
}

export interface TrendBucket {
  period: string; // e.g., '2026-W36' or '2026-09'
  startDate: string;
  endDate: string;
  totalResponses: number;
  nps: NpsResult;
  csat: CsatResult;
}

export interface TrendAnalysisResult {
  buckets: TrendBucket[];
  overallChange: {
    npsDelta: number | null; // absolute change
    csatSatisfiedPctDelta: number | null; // percentage points change
    csatAverageDelta: number | null;
    volumeDelta: number;
  };
}

/**
 * Groups records into weekly periods and computes trends deterministically
 */
export function computeWeeklyTrends(
  records: Array<{
    responseDate: Date | null;
    npsScore: number | null;
    csatScore: number | null;
  }>
): TrendAnalysisResult {
  const datedRecords = records
    .filter((r): r is typeof r & { responseDate: Date } => r.responseDate instanceof Date && !isNaN(r.responseDate.getTime()))
    .sort((a, b) => a.responseDate.getTime() - b.responseDate.getTime());

  if (datedRecords.length === 0) {
    return {
      buckets: [],
      overallChange: {
        npsDelta: null,
        csatSatisfiedPctDelta: null,
        csatAverageDelta: null,
        volumeDelta: 0,
      },
    };
  }

  // Group by ISO week (YYYY-Www)
  const groupMap: Map<string, typeof datedRecords> = new Map();

  for (const rec of datedRecords) {
    const d = new Date(rec.responseDate);
    d.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    const weekNumber = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    const weekKey = `${d.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;

    if (!groupMap.has(weekKey)) {
      groupMap.set(weekKey, []);
    }
    groupMap.get(weekKey)!.push(rec);
  }

  const sortedKeys = Array.from(groupMap.keys()).sort();
  const buckets: TrendBucket[] = sortedKeys.map((key) => {
    const recs = groupMap.get(key)!;
    const nps = calculateNps(recs.map((r) => r.npsScore));
    const csat = calculateCsat(recs.map((r) => r.csatScore));
    return {
      period: key,
      startDate: recs[0].responseDate.toISOString().split('T')[0],
      endDate: recs[recs.length - 1].responseDate.toISOString().split('T')[0],
      totalResponses: recs.length,
      nps,
      csat,
    };
  });

  // Calculate change between first bucket and last bucket
  const first = buckets[0];
  const last = buckets[buckets.length - 1];

  const npsDelta =
    first && last && first.nps.npsScore !== null && last.nps.npsScore !== null
      ? Number((last.nps.npsScore - first.nps.npsScore).toFixed(1))
      : null;

  const csatSatisfiedPctDelta =
    first && last && first.csat.csatScorePct !== null && last.csat.csatScorePct !== null
      ? Number((last.csat.csatScorePct - first.csat.csatScorePct).toFixed(1))
      : null;

  const csatAverageDelta =
    first && last && first.csat.averageScore !== null && last.csat.averageScore !== null
      ? Number((last.csat.averageScore - first.csat.averageScore).toFixed(2))
      : null;

  const volumeDelta = last && first ? last.totalResponses - first.totalResponses : 0;

  return {
    buckets,
    overallChange: {
      npsDelta,
      csatSatisfiedPctDelta,
      csatAverageDelta,
      volumeDelta,
    },
  };
}

/**
 * Computes comparative segment breakdown matrix for a given attribute
 */
export function computeSegmentMetrics(
  records: Array<{
    npsScore: number | null;
    csatScore: number | null;
    segmentVal: string | null;
  }>
): SegmentMetric[] {
  const groups: Map<string, Array<{ npsScore: number | null; csatScore: number | null }>> = new Map();

  for (const r of records) {
    const val = r.segmentVal || 'Unspecified';
    if (!groups.has(val)) {
      groups.set(val, []);
    }
    groups.get(val)!.push(r);
  }

  const result: SegmentMetric[] = [];
  Array.from(groups.entries()).forEach(([val, recs]) => {
    const nps = calculateNps(recs.map((x) => x.npsScore));
    const csat = calculateCsat(recs.map((x) => x.csatScore));
    result.push({
      segmentValue: val,
      totalResponses: recs.length,
      nps,
      csat,
      isReliable: recs.length >= 30,
    });
  });

  // Sort descending by response volume
  return result.sort((a, b) => b.totalResponses - a.totalResponses);
}
