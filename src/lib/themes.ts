import { scrubPII } from './privacy';
import { calculateNps, calculateCsat } from './metrics';

export interface ThemeClusterDef {
  name: string;
  description: string;
  keywords: string[];
}

export const PRESET_THEME_TAXONOMY: ThemeClusterDef[] = [
  {
    name: 'Application Performance & Stability',
    description: 'System responsiveness, freezes, crashes, and query timeouts.',
    keywords: ['crash', 'crashes', 'freeze', 'freezes', 'sluggish', 'slow', 'timeout', 'downtime'],
  },
  {
    name: 'Billing & Invoicing Transparency',
    description: 'Pricing disputes, unexpected fees, invoice clarity, and billing support.',
    keywords: ['billing', 'invoice', 'charge', 'charges', 'fee', 'pricing', 'discrepancy'],
  },
  {
    name: 'Customer Support Responsiveness',
    description: 'Ticket turnaround times, support responsiveness, and resolution quality.',
    keywords: ['support', 'ticket', 'representative', 'agent', 'response time', 'waiting'],
  },
  {
    name: 'Product Usability & Workflow',
    description: 'Ease of onboarding, intuitive navigation, UI layout, and feature ergonomics.',
    keywords: ['intuitive', 'layout', 'navigation', 'dashboard', 'easy', 'onboarding', 'efficient'],
  },
  {
    name: 'Integration & API Capabilities',
    description: 'Third-party connectors, webhook dependability, REST API documentation.',
    keywords: ['api', 'integration', 'webhook', 'connect', 'salesforce', 'export', 'documentation'],
  },
];

export interface ExtractedThemeResult {
  name: string;
  description: string;
  commentCount: number;
  impactScore: number; // calculated negative score correlation
  assignedResponseIds: string[];
  representativeComment: string | null;
}

/**
 * Discovers and clusters survey feedback into recurring themes
 */
export function extractSemanticThemes(
  records: Array<{
    id: string;
    commentText: string;
    npsScore: number | null;
    csatScore: number | null;
  }>
): ExtractedThemeResult[] {
  const themeMap: Map<
    string,
    {
      def: ThemeClusterDef;
      assigned: Array<{ id: string; commentText: string; nps: number | null; csat: number | null }>;
    }
  > = new Map();

  for (const t of PRESET_THEME_TAXONOMY) {
    themeMap.set(t.name, { def: t, assigned: [] });
  }

  for (const rec of records) {
    const { scrubbedText } = scrubPII(rec.commentText);
    const lower = scrubbedText.toLowerCase();

    Array.from(themeMap.entries()).forEach(([themeName, entry]) => {
      const match = entry.def.keywords.some((kw) => lower.includes(kw));
      if (match) {
        entry.assigned.push({
          id: rec.id,
          commentText: rec.commentText,
          nps: rec.npsScore,
          csat: rec.csatScore,
        });
      }
    });
  }

  const results: ExtractedThemeResult[] = [];

  Array.from(themeMap.entries()).forEach(([themeName, entry]) => {
    if (entry.assigned.length === 0) return;

    // Deterministically calculate satisfaction impact score
    // Higher impact score indicates strong association with detractors (NPS <= 6 or CSAT <= 2)
    const lowScoreCount = entry.assigned.filter(
      (x) => (x.nps !== null && x.nps <= 6) || (x.csat !== null && x.csat <= 2)
    ).length;

    const impactScore = Number((lowScoreCount / entry.assigned.length).toFixed(2));

    // Select the longest detailed representative comment
    const representative = entry.assigned.reduce((prev, curr) =>
      curr.commentText.length > prev.commentText.length ? curr : prev
    );

    results.push({
      name: entry.def.name,
      description: entry.def.description,
      commentCount: entry.assigned.length,
      impactScore,
      assignedResponseIds: entry.assigned.map((a) => a.id),
      representativeComment: representative.commentText,
    });
  });

  return results.sort((a, b) => b.commentCount - a.commentCount);
}
