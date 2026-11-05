# CX Intelligence — Project Plan & Roadmap

## 1. Executive Summary & Objective
**CX Intelligence** is an enterprise-grade AI-powered Customer Experience (CX) Analysis Platform designed for CX Managers, Product Managers, Business Analysts, and Leadership. It ingests survey datasets (CSV), performs rigorous deterministic validation and metrics calculation (NPS, CSAT, distributions, time-series trends, segment cuts), conducts AI-powered sentiment classification and semantic theme clustering, generates evidence-grounded CX insights, and provides audit-ready reporting and export capabilities.

## 2. Core Success Targets
| Category | Metric | MVP Target | Verification Method |
|---|---|---|---|
| **Activation** | Users who upload a file & view dashboard | > 70% | Telemetry / Audit event tracking |
| **Speed** | Complete end-to-end processing (up to 10k rows) | < 1 minute | Automated performance benchmark suite |
| **Accuracy** | Metrics match independent reference calculations | 100% | Unit & integration tests against standard reference data |
| **AI Quality** | Sentiment & theme agreement with human review | > 80% | Human-reviewed test set evaluation suite |
| **Value** | User rating of insight usefulness | > 4.0 / 5 | Qualitative feedback score tracking |

## 3. Eight-Week Implementation Timeline

### Phase 1 — Week 1: Requirements, Architecture & UI Foundation
- [x] Review full `CX_Analysis_MVP.pdf` specification and user requirements.
- [x] Establish architectural contracts, system diagrams, and data models.
- [x] Set up documentation suite (`docs/`).
- [x] Scaffold Next.js application with TypeScript strict mode, Tailwind CSS, and UI component foundation.
- [x] Implement database schema via Prisma with relational integrity.
- [x] Build core UI layout: Header, Sidebar, Navigation, Notification toasts, Metric Cards, Status badges, Modal dialogs.
- [x] Implement health check endpoints (`/api/health`) and database connectivity verification.
- [x] Generate synthetic sample survey datasets and downloadable CSV template.
- [x] Set up Vitest testing harness and execute Phase 1 verification tests.

### Phase 2 — Week 2: CSV Upload, Validation, Column Mapping & CX Metrics
- [ ] Drag-and-drop & file-picker upload handling up to 10k rows with size & MIME validation.
- [ ] Robust CSV parser handling UTF-8, UTF-8 BOM, quoted commas, multiline text, escaped quotes.
- [ ] Auto-detection column mapping wizard with manual override for NPS, CSAT, dates, comments, segments.
- [ ] Multi-stage validation engine: missing values, score boundary checks (NPS 0-10, CSAT 1-5), invalid dates, malformed records.
- [ ] Deterministic CX metrics calculation engine (Promoters, Passives, Detractors, NPS %, CSAT %, distributions).
- [ ] Interactive CX Dashboard with headline KPIs and score breakdown.
- [ ] Reference dataset unit tests proving 100% calculation accuracy.

### Phase 3 — Week 3: Filtering, Segmentation & Trend Analysis
- [ ] Global multi-dimensional filter bar (Date range, Product, Region, Customer Tier, Score brackets).
- [ ] Segment breakdown matrices: NPS by region, CSAT by product, volume distribution.
- [ ] Side-by-side comparative segment analysis with small sample-size warnings ($N < 30$).
- [ ] Chronological time-series aggregation (weekly/monthly) with proper zero-handling and rate change metrics ($\Delta$ percentage points vs. absolute deltas).
- [ ] Recharts interactive visualizations with tooltips and explicit denominator disclosures.

### Phase 4 — Week 4: Sentiment Analysis Pipeline
- [ ] Asynchronous batch processing queue for open-text survey comments.
- [ ] Provider-agnostic LLM client (OpenAI, Gemini, Anthropic, or Local/Fallback rule-based NLP).
- [ ] PII redaction layer (email, phone numbers, names masked before LLM transmission).
- [ ] Comment-level classification: Positive, Neutral, Negative with confidence scoring and reasoning.
- [ ] Comment Explorer with search, sentiment filtering, and source-row traceability.
- [ ] Resilient retry mechanism, batch progress tracking, and fallback classifier.

### Phase 5 — Week 5: Theme Detection & Customer Pain-Point Analysis
- [ ] Unsupervised/LLM-assisted semantic theme clustering from raw text feedback.
- [ ] Dynamic theme labeling (e.g., "Billing Inaccuracies", "Delivery Delays", "App Navigation").
- [ ] Theme association metrics: comment volume, sentiment distribution, NPS/CSAT impact correlation.
- [ ] Representative comment extraction for each theme cluster.
- [ ] Theme Explorer UI with drill-down into underlying feedback records.

### Phase 6 — Week 6: AI-Generated CX Insights & Evidence Linking
- [ ] Deterministic fact aggregation engine (KPI summaries, underperforming segments, top themes).
- [ ] Structured insight generator returning strict JSON schema.
- [ ] Transparent impact ranking algorithm based on score deviation, volume affected, and negative sentiment share.
- [ ] Bidirectional evidence linking: every insight links to underlying comment IDs and metric charts.
- [ ] Guardrails preventing hallucinated metrics or unwarranted causal claims.

### Phase 7 — Week 7: Reporting, Export, Privacy & Performance
- [ ] Formatted executive PDF report generator with KPI summaries, charts, themes, and insights.
- [ ] CSV table export with formula injection prevention (`=`, `@`, `+`, `-` sanitization).
- [ ] Dataset management & user-controlled hard deletion across database, files, and cache.
- [ ] Security audit: TLS headers, rate limiting, PII protection, secure storage.
- [ ] Performance optimization: index tuning, stream parsing, 10,000-row benchmark execution.

### Phase 8 — Week 8: Integration Testing, Pilot Evaluation & Launch Readiness
- [ ] End-to-end integration test suite covering upload-to-insight user journey.
- [ ] Robustness tests: corrupt files, edge cases, partial failure recoveries, rate limit simulations.
- [ ] Pilot user evaluation protocol and human-annotated sentiment/theme agreement benchmark.
- [ ] Production build verification, Docker containerization, health monitoring, and deployment runbook.
