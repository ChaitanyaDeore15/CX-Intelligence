# CX Intelligence — Test Plan & Quality Assurance Strategy

## 1. Quality Objectives
- **100% Deterministic Metric Accuracy**: Independent verification that NPS and CSAT calculations match reference mathematical formulations without floating-point inaccuracies.
- **> 80% AI Agreement**: Test suite asserting agreement between sentiment/theme outputs and human-labeled CX benchmark data.
- **Resilience Under Faults**: Verified handling of CSV BOMs, missing fields, malformed lines, SQL/formula injection attempts, and LLM rate-limit fallbacks.
- **Performance**: Up to 10,000 survey rows ingested and parsed within target thresholds.

## 2. Test Architecture
- **Unit Testing**: Vitest for fast, isolated testing of metric engines, PII maskers, mapping heuristics, and validation logic.
- **API Integration Testing**: Testing route handlers with mock and live database transactions.
- **End-to-End (E2E) Testing**: Full user journeys from upload to PDF export.
- **Security Testing**: Verification of formula injection defenses, sanitized error outputs, and PII masking.

## 3. Reference Test Cases for Deterministic Metrics
| Scenario | Inputs | Expected Output |
|---|---|---|
| NPS Standard | 70 Promoters (10), 20 Passives (8), 10 Detractors (4) | NPS = +60.0, Promoters = 70.0%, Passives = 20.0%, Detractors = 10.0% |
| NPS Detractor Heavy | 10 Promoters (9), 20 Passives (7), 70 Detractors (2) | NPS = -60.0 |
| NPS Neutral | 50 Promoters, 0 Passives, 50 Detractors | NPS = 0.0 |
| CSAT Standard | Scale 1-5, values: [5, 4, 3, 2, 1] | Satisfied % (>=4) = 40.0%, Average CSAT = 3.00 |
| Missing/Null Handling | 10 responses with null scores, 10 valid | Denominator is explicitly 10, nulls are excluded from calculation |
