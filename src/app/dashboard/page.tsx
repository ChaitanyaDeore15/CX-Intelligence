import React from 'react';
import { prisma } from '@/lib/db';
import { calculateNps, calculateCsat } from '@/lib/metrics';
import { MetricCard, Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Filter,
  Download,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const responses = await prisma.surveyResponse.findMany({
    select: {
      npsScore: true,
      csatScore: true,
      product: true,
      region: true,
      customerType: true,
      commentText: true,
    },
  });

  const nps = calculateNps(responses.map((r) => r.npsScore));
  const csat = calculateCsat(responses.map((r) => r.csatScore));
  const commentCount = responses.filter((r) => !!r.commentText).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header & Global Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CX Intelligence Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time deterministic calculations across {responses.length} customer feedback records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/segments">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Filter className="h-3.5 w-3.5" />
              <span>Segment Cuts</span>
            </Button>
          </Link>
          <Link href="/reports">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              <span>Export Report</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Net Promoter Score (NPS)"
          value={nps.npsScore !== null ? `${nps.npsScore > 0 ? '+' : ''}${nps.npsScore}` : 'N/A'}
          subtitle={`${nps.promoterPct}% Promoters, ${nps.detractorPct}% Detractors`}
          denominatorInfo={`${nps.totalValidResponses} responses`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          title="CSAT Satisfaction"
          value={csat.csatScorePct !== null ? `${csat.csatScorePct}%` : 'N/A'}
          subtitle={`Avg rating: ${csat.averageScore || 'N/A'} / 5.0`}
          denominatorInfo={`${csat.totalValidResponses} ratings (threshold >= 4)`}
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <MetricCard
          title="Total Survey Volume"
          value={responses.length}
          subtitle="100% verified ingestion"
          denominatorInfo="Full population sample"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Comment Availability"
          value={commentCount}
          subtitle={`${((commentCount / (responses.length || 1)) * 100).toFixed(1)}% feedback rate`}
          denominatorInfo={`${commentCount} text comments`}
          icon={<MessageSquare className="h-4 w-4" />}
        />
      </div>

      {/* Score Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NPS Breakdown */}
        <Card>
          <CardHeader
            title="NPS Distribution Breakdown"
            subtitle="Deterministic breakdown of Promoters (9-10), Passives (7-8), and Detractors (0-6)"
          />
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-700">Promoters (9–10)</span>
                  <span className="text-slate-900">{nps.promoters} ({nps.promoterPct}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${nps.promoterPct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-700">Passives (7–8)</span>
                  <span className="text-slate-900">{nps.passives} ({nps.passivePct}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all"
                    style={{ width: `${nps.passivePct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-rose-700">Detractors (0–6)</span>
                  <span className="text-slate-900">{nps.detractors} ({nps.detractorPct}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all"
                    style={{ width: `${nps.detractorPct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500">
              <strong>Calculation Rule:</strong> NPS is calculated as{' '}
              <code>% Promoters ({nps.promoterPct}%) - % Detractors ({nps.detractorPct}%) = {nps.npsScore}</code>.
              Passives are included in the denominator but do not contribute directly to the net score.
            </div>
          </CardContent>
        </Card>

        {/* CSAT Breakdown */}
        <Card>
          <CardHeader
            title="CSAT Distribution Breakdown"
            subtitle="Proportion of satisfied respondents on a standard 5-point scale"
          />
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-700">Satisfied (Score 4–5)</span>
                  <span className="text-slate-900">{csat.satisfiedCount} ({csat.satisfiedPct}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all"
                    style={{ width: `${csat.satisfiedPct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Neutral (Score 3)</span>
                  <span className="text-slate-900">{csat.neutralCount}</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-slate-400 h-full rounded-full transition-all"
                    style={{
                      width: `${((csat.neutralCount / (csat.totalValidResponses || 1)) * 100).toFixed(1)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-rose-700">Dissatisfied (Score 1–2)</span>
                  <span className="text-slate-900">{csat.dissatisfiedCount}</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-400 h-full rounded-full transition-all"
                    style={{
                      width: `${((csat.dissatisfiedCount / (csat.totalValidResponses || 1)) * 100).toFixed(1)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500">
              <strong>Configuration:</strong> Standard 5-point scale. CSAT % = ({csat.satisfiedCount} /{' '}
              {csat.totalValidResponses}) × 100 = <strong>{csat.csatScorePct}%</strong>. Average score:{' '}
              <strong>{csat.averageScore} / 5.0</strong>.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
