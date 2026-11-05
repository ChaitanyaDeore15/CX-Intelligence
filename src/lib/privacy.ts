/**
 * Privacy Shield & PII Scrubber
 * Masks emails, phone numbers, account IDs, and identifiable credit card sequences
 * before text is sent to any external AI/LLM model.
 */

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
const SSN_CREDIT_REGEX = /\b(?:\d{4}[-\s]?){3}\d{4}\b|\b\d{3}-\d{2}-\d{4}\b/g;

export function scrubPII(text: string): { scrubbedText: string; maskedCount: number } {
  if (!text) return { scrubbedText: '', maskedCount: 0 };

  let maskedCount = 0;

  let result = text.replace(EMAIL_REGEX, () => {
    maskedCount++;
    return '[REDACTED_EMAIL]';
  });

  result = result.replace(PHONE_REGEX, () => {
    maskedCount++;
    return '[REDACTED_PHONE]';
  });

  result = result.replace(SSN_CREDIT_REGEX, () => {
    maskedCount++;
    return '[REDACTED_ACCOUNT]';
  });

  return { scrubbedText: result, maskedCount };
}
