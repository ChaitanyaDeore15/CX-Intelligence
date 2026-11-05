import { describe, it, expect } from 'vitest';
import { scrubPII } from '../src/lib/privacy';
import { classifyCommentSentiment } from '../src/lib/sentiment';

describe('Phase 4 — Privacy & PII Scrubbing', () => {
  it('masks email addresses accurately', () => {
    const input = 'Contact me at john.doe@enterprise.corp regarding the error.';
    const { scrubbedText, maskedCount } = scrubPII(input);
    expect(maskedCount).toBe(1);
    expect(scrubbedText).toBe('Contact me at [REDACTED_EMAIL] regarding the error.');
  });

  it('masks phone numbers and account sequences', () => {
    const input = 'Call (555) 234-5678 or verify SSN 123-45-6789.';
    const { scrubbedText, maskedCount } = scrubPII(input);
    expect(maskedCount).toBe(2);
    expect(scrubbedText).toContain('[REDACTED_PHONE]');
    expect(scrubbedText).toContain('[REDACTED_ACCOUNT]');
  });
});

describe('Phase 4 — Sentiment Classification Engine', () => {
  it('correctly classifies positive sentiment feedback', async () => {
    const feedback = 'Phenomenal workflow efficiency and our account manager is exceptionally proactive!';
    const result = await classifyCommentSentiment(feedback);
    expect(result.sentiment).toBe('POSITIVE');
    expect(result.confidence).toBeGreaterThanOrEqual(0.7);
  });

  it('correctly classifies negative sentiment feedback', async () => {
    const feedback = 'Mobile app crashes every time I export a dashboard to PDF. Very frustrating.';
    const result = await classifyCommentSentiment(feedback);
    expect(result.sentiment).toBe('NEGATIVE');
    expect(result.confidence).toBeGreaterThanOrEqual(0.7);
  });

  it('correctly classifies neutral or balanced feedback', async () => {
    const feedback = 'Standard capabilities. Nothing revolutionary, but gets the reporting done.';
    const result = await classifyCommentSentiment(feedback);
    expect(result.sentiment).toBe('NEUTRAL');
  });
});
