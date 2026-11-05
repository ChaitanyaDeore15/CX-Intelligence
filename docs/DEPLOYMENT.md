# CX Intelligence — Deployment & Environment Guide

## 1. Prerequisites
- Node.js >= 20.x (Detected v22.13.0)
- npm >= 10.x
- Git

## 2. Environment Variables (`.env.example`)
```env
# Application
PORT=3000
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
# For local SQLite development (zero external dependencies):
DATABASE_URL="file:./dev.db"
# For production PostgreSQL:
# DATABASE_URL="postgresql://cx_user:cx_password@localhost:5432/cx_intelligence?schema=public"

# AI Provider Configuration (Optional for deterministic operation, required for cloud AI)
AI_PROVIDER="mock" # Options: mock, openai, gemini, anthropic
AI_API_KEY=""
AI_MODEL_NAME="gemini-1.5-flash"

# File Upload Constraints
MAX_FILE_SIZE_BYTES=26214400 # 25MB
MAX_ROW_COUNT=10000
```

## 3. Local Development Runbook
```bash
# 1. Install dependencies
npm install

# 2. Set up database and generate Prisma Client
npx prisma db push

# 3. Seed sample demonstration datasets
npm run db:seed

# 4. Start Next.js development server
npm run dev

# 5. Run automated test suite
npm run test
```

## 4. Production Build & Verification
```bash
npm run build
npm run start
```
