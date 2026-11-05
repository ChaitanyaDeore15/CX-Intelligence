# CX Intelligence — System Architecture Specification

## 1. Architectural Philosophy
1. **Numbers from Code, Narrative from AI**: All quantitative metrics (NPS, CSAT, distributions, segments, trends) are calculated deterministically via tested TypeScript algorithms. The AI model is strictly prohibited from computing or hallucinating quantitative metrics.
2. **Strict Traceability & Evidence Linking**: Every high-level insight, theme, and sentiment label links directly to immutable survey response IDs.
3. **Data Privacy by Default**: Raw PII (emails, phone numbers, credit cards, full names) is sanitized before text reaches external AI endpoints.
4. **Service-Oriented Modularity**: Decoupled modules for ingestion, validation, metrics, text analytics, AI orchestration, and export.

## 2. High-Level System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 Next.js Frontend                                  |
|  +--------------------+  +--------------------+  +--------------------+  +-----+  |
|  | CSV Upload & Wizard|  | CX KPI Dashboard   |  | Segment & Trends   |  | ... |  |
|  +--------------------+  +--------------------+  +--------------------+  +-----+  |
+-----------------------------------------|-----------------------------------------+
                                          | REST / JSON API
+-----------------------------------------v-----------------------------------------+
|                              Next.js Route Handlers                               |
|  +------------------+  +-------------------+  +------------------+  +-----------+ |
|  | Ingestion Engine |  | Metrics Engine    |  | AI Orchestrator  |  | Export    | |
|  +------------------+  +-------------------+  +------------------+  +-----------+ |
+------------------|-----------------------|--------------|-------------------------+
                   |                       |              |
+------------------v-----+   +-------------v----+   +-----v-------------------------+
| Validation & Mapping   |   | Deterministic    |   | AI & NLP Pipeline             |
| - Header normalizer    |   | - NPS Engine     |   | - PII Redactor                |
| - Row-level validator  |   | - CSAT Engine    |   | - Batching & Retry Wrapper    |
| - Type coercion        |   | - Segment Engine |   | - Sentiment & Theme Clust.    |
| - Duplicate detector   |   | - Trend Engine   |   | - Structured JSON Validator   |
+------------------------+   +------------------+   +-------------------------------+
                   |                       |              |
+------------------v-----------------------v--------------v-------------------------+
|                                    Data Layer                                     |
|  Prisma ORM (PostgreSQL / SQLite for local development)                           |
|  Tables: Dataset, SurveyResponse, ValidationIssue, SentimentResult, Theme, Insight|
+-----------------------------------------------------------------------------------+
```

## 3. Core Modules & Responsibilities
- `src/lib/upload`: File reception, MIME inspection, stream parsing, storage management.
- `src/lib/mapping`: Header detection heuristic, user configuration persistence, normalization.
- `src/lib/validation`: Strict row-by-row boundary checking, error aggregation, rejection logging.
- `src/lib/analytics`: Deterministic computation of NPS, CSAT, distributions, and trend deltas.
- `src/lib/segmentation`: Multi-dimensional filtering, segment aggregation, small-sample warnings.
- `src/lib/privacy`: Regular expression & heuristic PII detection and masking.
- `src/lib/sentiment`: Batching text sentiment classifier with retry and fallback engine.
- `src/lib/themes`: Unsupervised/LLM semantic clustering and representative comment extraction.
- `src/lib/insights`: Evidence-grounded insight generator and transparent impact ranking formula.
- `src/lib/reports`: PDF layout compilation and CSV streaming with formula injection defenses.
