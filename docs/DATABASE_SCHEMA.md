# CX Intelligence — Database Schema Specification

## 1. Overview
The persistence layer is modeled using Prisma ORM. It supports relational databases (PostgreSQL in production and containerized environments, with SQLite enabled for friction-free local execution and test environments).

## 2. Entity Relationship Model

```
+-------------------------------------------------------+
|                       Dataset                         |
|-------------------------------------------------------|
| id: String (UUID, PK)                                 |
| name: String                                          |
| fileName: String                                      |
| fileSizeBytes: Int                                    |
| totalRows: Int                                        |
| validRows: Int                                        |
| status: Enum (UPLOADED, MAPPED, VALIDATED, READY, ...) |
| createdAt: DateTime                                   |
| updatedAt: DateTime                                   |
+-------------------------------------------------------+
        | 1                     | 1                 | 1
        |                       |                   |
        | *                     | *                 | *
+-------v--------------+ +------v-------------+ +---v-----------------+
|   SurveyResponse     | |  ValidationIssue   | |    AnalysisJob      |
|----------------------| |--------------------| |---------------------|
| id: String (UUID, PK)| | id: String (PK)    | | id: String (PK)     |
| datasetId: String(FK)| | datasetId: String  | | datasetId: String   |
| rowNumber: Int       | | rowNumber: Int     | | type: JobType       |
| npsScore: Int?       | | column: String?    | | status: JobStatus   |
| csatScore: Int?      | | errorType: String  | | progress: Float     |
| responseDate: Date?  | | message: String    | | errorMessage: String|
| commentText: String? | | severity: Severity | | createdAt: DateTime |
| product: String?     | +--------------------+ +---------------------+
| region: String?      |
| customerType: String?|
| metadataJson: String?|
+----------------------+
        | 1                     | 1
        |                       |
        | *                     | *
+-------v--------------+ +------v-------------+
|   SentimentResult    | |  CommentThemeAssign|
|----------------------| |--------------------|
| id: String (PK)      | | id: String (PK)    |
| responseId: String   | | responseId: String |
| sentiment: Enum      | | themeId: String(FK)|
| confidence: Float    | | relevance: Float   |
| explanation: String? | +--------------------+
+----------------------+           | *
                                   |
                                   | 1
                         +---------v----------+
                         |       Theme        |
                         |--------------------|
                         | id: String (PK)    |
                         | datasetId: String  |
                         | name: String       |
                         | description: String|
                         | commentCount: Int  |
                         +--------------------+
                                   | 1
                                   |
                                   | *
                         +---------v----------+
                         | GeneratedInsight   |
                         |--------------------|
                         | id: String (PK)    |
                         | datasetId: String  |
                         | title: String      |
                         | summary: String    |
                         | impactRank: Int    |
                         | category: String   |
                         | metricImpactJson   |
                         | recommendation: Str|
                         +--------------------+
                                   | 1
                                   |
                                   | *
                         +---------v----------+
                         |  InsightEvidence   |
                         |--------------------|
                         | id: String (PK)    |
                         | insightId: String  |
                         | responseId: String |
                         | excerpt: String    |
                         +--------------------+
```

## 3. Key Indexes & Performance Optimization
- `SurveyResponse(datasetId, npsScore)`
- `SurveyResponse(datasetId, csatScore)`
- `SurveyResponse(datasetId, responseDate)`
- `SurveyResponse(datasetId, product)`
- `SurveyResponse(datasetId, region)`
- `SentimentResult(responseId)`
- `CommentThemeAssignment(responseId, themeId)`
- `GeneratedInsight(datasetId, impactRank)`
