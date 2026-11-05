/**
 * Deterministic CX Metrics Engine
 * Strictly computes NPS, CSAT, distributions, and trend deltas in TypeScript code.
 * AI models are strictly prohibited from generating or modifying these numerical values.
 */

export interface NpsResult {
  npsScore: number | null; // e.g. +45.2, or null if no valid responses
  totalValidResponses: number;
  promoters: number;
  passives: number;
  detractors: number;
  promoterPct: number;
  passivePct: number;
  detractorPct: number;
}

export interface CsatResult {
  csatScorePct: number | null; // % of satisfied responses (e.g. 82.5%)
  averageScore: number | null; // Average numeric rating (e.g. 4.12)
  totalValidResponses: number;
  satisfiedCount: number;
  neutralCount: number;
  dissatisfiedCount: number;
  satisfiedPct: number;
}

export interface MetricSummary {
  totalResponses: number;
  nps: NpsResult;
  csat: CsatResult;
  commentCount: number;
  commentAvailabilityPct: number;
}

/**
 * Net Promoter Score (NPS) calculation
 * Promoters: 9-10
 * Passives: 7-8
 * Detractors: 0-6
 * Formula: % Promoters - % Detractors
 */
export function calculateNps(scores: (number | null | undefined)[]): NpsResult {
  const validScores = scores.filter(
    (s): s is number => typeof s === 'number' && !isNaN(s) && s >= 0 && s <= 10
  );

  const totalValid = validScores.length;
  if (totalValid === 0) {
    return {
      npsScore: null,
      totalValidResponses: 0,
      promoters: 0,
      passives: 0,
      detractors: 0,
      promoterPct: 0,
      passivePct: 0,
      detractorPct: 0,
    };
  }

  let promoters = 0;
  let passives = 0;
  let detractors = 0;

  for (const score of validScores) {
    if (score >= 9) promoters++;
    else if (score >= 7) passives++;
    else detractors++;
  }

  const promoterPct = Number(((promoters / totalValid) * 100).toFixed(1));
  const passivePct = Number(((passives / totalValid) * 100).toFixed(1));
  const detractorPct = Number(((detractors / totalValid) * 100).toFixed(1));
  const npsScore = Number((promoterPct - detractorPct).toFixed(1));

  return {
    npsScore,
    totalValidResponses: totalValid,
    promoters,
    passives,
    detractors,
    promoterPct,
    passivePct,
    detractorPct,
  };
}

/**
 * Customer Satisfaction (CSAT) calculation
 * Default: 5-point scale, Satisfied threshold >= 4
 */
export function calculateCsat(
  scores: (number | null | undefined)[],
  options: { minScale?: number; maxScale?: number; satisfiedThreshold?: number } = {}
): CsatResult {
  const minScale = options.minScale ?? 1;
  const maxScale = options.maxScale ?? 5;
  const satisfiedThreshold = options.satisfiedThreshold ?? 4;

  const validScores = scores.filter(
    (s): s is number =>
      typeof s === 'number' && !isNaN(s) && s >= minScale && s <= maxScale
  );

  const totalValid = validScores.length;
  if (totalValid === 0) {
    return {
      csatScorePct: null,
      averageScore: null,
      totalValidResponses: 0,
      satisfiedCount: 0,
      neutralCount: 0,
      dissatisfiedCount: 0,
      satisfiedPct: 0,
    };
  }

  let satisfiedCount = 0;
  let neutralCount = 0;
  let dissatisfiedCount = 0;
  let sum = 0;

  for (const score of validScores) {
    sum += score;
    if (score >= satisfiedThreshold) {
      satisfiedCount++;
    } else if (score === satisfiedThreshold - 1) {
      neutralCount++;
    } else {
      dissatisfiedCount++;
    }
  }

  const satisfiedPct = Number(((satisfiedCount / totalValid) * 100).toFixed(1));
  const averageScore = Number((sum / totalValid).toFixed(2));

  return {
    csatScorePct: satisfiedPct,
    averageScore,
    totalValidResponses: totalValid,
    satisfiedCount,
    neutralCount,
    dissatisfiedCount,
    satisfiedPct,
  };
}

/**
 * Small sample size warning threshold (< 30 observations)
 */
export const MIN_STATISTICAL_SAMPLE_SIZE = 30;

export function isSampleReliable(sampleSize: number): boolean {
  return sampleSize >= MIN_STATISTICAL_SAMPLE_SIZE;
}
