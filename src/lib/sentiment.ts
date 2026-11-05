import { scrubPII } from './privacy';

export type SentimentLabel = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

export interface SentimentAnalysisOutput {
  sentiment: SentimentLabel;
  confidence: number;
  explanation: string;
}

// Rule-based dictionary for deterministic fallback
const POSITIVE_WORDS = [
  'great', 'love', 'loved', 'excellent', 'amazing', 'best', 'smooth', 'fast', 'helpful',
  'proactive', 'saved', 'spot on', 'intuitive', 'dependable', 'clean', 'phenomenal',
  'wonderful', 'fantastic', 'superb', 'perfect',
];

const NEGATIVE_WORDS = [
  'crash', 'crashed', 'crashes', 'freeze', 'freezes', 'broken', 'sluggish', 'frustrating',
  'frustrated', 'error', 'errors', 'slow', 'downtime', 'worst', 'terrible', 'horrible',
  'delay', 'delays', 'invoice', 'charge', 'charges', 'bug', 'discrepancies', 'fail', 'fails',
];

/**
 * Classifies customer comment sentiment using AI provider or deterministic linguistic fallback
 */
export async function classifyCommentSentiment(
  rawComment: string
): Promise<SentimentAnalysisOutput> {
  const { scrubbedText } = scrubPII(rawComment);
  const lower = scrubbedText.toLowerCase();

  // If external AI provider configured (OpenAI, Gemini, Anthropic)
  const provider = process.env.AI_PROVIDER || 'mock';
  const apiKey = process.env.AI_API_KEY;

  if (provider === 'gemini' && apiKey) {
    // In production with valid GEMINI_API_KEY, can make structured API call
    // For now, falls back gracefully to deterministic rule-based analysis
  }

  // Deterministic linguistic rule engine
  let posCount = 0;
  let negCount = 0;

  for (const w of POSITIVE_WORDS) {
    if (lower.includes(w)) posCount++;
  }
  for (const w of NEGATIVE_WORDS) {
    if (lower.includes(w)) negCount++;
  }

  if (negCount > posCount) {
    return {
      sentiment: 'NEGATIVE',
      confidence: Math.min(0.95, 0.7 + negCount * 0.1),
      explanation: `Negative sentiment detected based on problem indicators (${negCount} keyword matches).`,
    };
  }

  if (posCount > negCount) {
    return {
      sentiment: 'POSITIVE',
      confidence: Math.min(0.95, 0.7 + posCount * 0.1),
      explanation: `Positive sentiment detected based on satisfaction expressions (${posCount} keyword matches).`,
    };
  }

  return {
    sentiment: 'NEUTRAL',
    confidence: 0.8,
    explanation: 'Neutral or balanced contextual feedback.',
  };
}
