# CX Intelligence — API Specification (v1)

## 1. Overview
All endpoints follow standard RESTful conventions, returning JSON with unified error and response structures.

Standard response envelope:
```json
{
  "success": true,
  "data": {},
  "meta": { "timestamp": "2026-10-12T12:00:00Z" }
}
```

Standard error envelope:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_COLUMN_MAPPING",
    "message": "NPS score column must contain numeric values between 0 and 10",
    "details": []
  }
}
```

## 2. API Endpoints

### System & Health
- `GET /api/health` — System status, DB connectivity, memory and uptime.

### Datasets & Ingestion
- `POST /api/datasets/upload` — Upload multipart survey CSV file. Returns dataset draft ID, detected headers, and preview rows.
- `GET /api/datasets` — List all datasets with metadata and processing status.
- `GET /api/datasets/:id` — Retrieve single dataset details and summary metrics.
- `DELETE /api/datasets/:id` — Hard delete dataset, response rows, insights, and analysis artifacts.
- `POST /api/datasets/:id/map` — Submit column mapping configuration.
- `POST /api/datasets/:id/validate` — Execute validation check; returns counts of accepted/rejected rows and row-level issues.
- `POST /api/datasets/:id/confirm` — Commit valid rows to database for analytical querying.

### Analytics & Metrics (Deterministic)
- `GET /api/datasets/:id/metrics` — Overall NPS (promoters/passives/detractors), CSAT (satisfied %, average), response volume. Query params: `product`, `region`, `customerType`, `startDate`, `endDate`.
- `GET /api/datasets/:id/trends` — Weekly or monthly time-series buckets for NPS, CSAT, and response volume.
- `GET /api/datasets/:id/segments` — Cross-segment comparison matrix (NPS by region, CSAT by product, etc.).

### AI & Text Analytics
- `POST /api/datasets/:id/sentiment/analyze` — Trigger comment sentiment analysis job.
- `GET /api/datasets/:id/sentiment` — Retrieve comment sentiment aggregates and paginated comment explorer.
- `POST /api/datasets/:id/themes/discover` — Trigger theme discovery and clustering.
- `GET /api/datasets/:id/themes` — Retrieve discovered themes, sentiment distribution, linked scores, and examples.
- `POST /api/datasets/:id/insights/generate` — Generate ranked CX insights with evidence citations.
- `GET /api/datasets/:id/insights` — Retrieve generated insights and linked evidence.

### Reporting & Export
- `GET /api/datasets/:id/export/csv` — Stream filtered survey response records as CSV.
- `GET /api/datasets/:id/export/pdf` — Download compiled executive summary PDF report.
