import { describe, it, expect } from 'vitest';
import { extractSemanticThemes } from '../src/lib/themes';

describe('Phase 5 — Semantic Theme Extraction Engine', () => {
  it('correctly clusters performance complaints into Application Performance theme', () => {
    const records = [
      {
        id: '1',
        commentText: 'Mobile app crashes every time I export a dashboard to PDF. Very sluggish.',
        npsScore: 2,
        csatScore: 1,
      },
      {
        id: '2',
        commentText: 'The system freezes when querying more than 100k records.',
        npsScore: 4,
        csatScore: 2,
      },
    ];

    const themes = extractSemanticThemes(records);
    const perfTheme = themes.find((t) => t.name === 'Application Performance & Stability');

    expect(perfTheme).toBeDefined();
    expect(perfTheme?.commentCount).toBe(2);
    expect(perfTheme?.impactScore).toBe(1.0); // 100% associated with detractors
    expect(perfTheme?.assignedResponseIds).toContain('1');
    expect(perfTheme?.assignedResponseIds).toContain('2');
  });

  it('clusters billing disputes into Billing Transparency theme', () => {
    const records = [
      {
        id: '3',
        commentText: 'Unexpected invoice charge on our monthly account statement.',
        npsScore: 3,
        csatScore: 1,
      },
    ];

    const themes = extractSemanticThemes(records);
    const billingTheme = themes.find((t) => t.name === 'Billing & Invoicing Transparency');

    expect(billingTheme).toBeDefined();
    expect(billingTheme?.commentCount).toBe(1);
  });
});
