export interface ColumnMappingConfig {
  sourceId?: string;
  npsScore?: string;
  csatScore?: string;
  responseDate?: string;
  commentText?: string;
  product?: string;
  region?: string;
  customerType?: string;
  [key: string]: string | undefined;
}

export interface SuggestedMapping {
  field: keyof ColumnMappingConfig;
  label: string;
  required: boolean;
  suggestedColumn: string | null;
  confidence: number;
}

const FIELD_PATTERNS: Record<keyof ColumnMappingConfig, RegExp[]> = {
  npsScore: [/nps/i, /recommend/i, /promoter/i, /likelihood_to_recommend/i, /net_promoter/i],
  csatScore: [/csat/i, /satisfaction/i, /satisfied/i, /rating/i, /score/i],
  responseDate: [/date/i, /timestamp/i, /created/i, /submitted/i, /time/i],
  commentText: [/comment/i, /feedback/i, /text/i, /review/i, /verbatim/i, /open_text/i, /notes/i],
  product: [/product/i, /service/i, /app/i, /feature/i, /item/i, /plan/i],
  region: [/region/i, /country/i, /market/i, /geo/i, /location/i, /territory/i],
  customerType: [/customer_type/i, /tier/i, /segment/i, /account_type/i, /type/i, /persona/i],
  sourceId: [/response_id/i, /id/i, /survey_id/i, /respondent_id/i, /uuid/i],
};

/**
 * Heuristically auto-detects standard CX fields from raw CSV headers
 */
export function detectColumnMappings(headers: string[]): Record<string, string | null> {
  const result: Record<string, string | null> = {
    npsScore: null,
    csatScore: null,
    responseDate: null,
    commentText: null,
    product: null,
    region: null,
    customerType: null,
    sourceId: null,
  };

  const usedHeaders = new Set<string>();

  for (const [field, patterns] of Object.entries(FIELD_PATTERNS)) {
    for (const pattern of patterns) {
      const match = headers.find((h) => !usedHeaders.has(h) && pattern.test(h));
      if (match) {
        result[field] = match;
        usedHeaders.add(match);
        break;
      }
    }
  }

  return result;
}
