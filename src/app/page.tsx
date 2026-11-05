import React from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  BarChart3,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Database,
  FileSpreadsheet,
} from 'lucide-react';
import { Card, MetricCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { prisma } from '@/lib/db';
import { calculateNps, calculateCsat } from '@/lib/metrics';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Query datasets to show live workspace status
  const datasets = await prisma.dataset.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      _count: {
        select: { responses: true, themes: true, insights: true },
      },
    },
  });

  const responses = await prisma.surveyResponse.findMany({
    take: 100,
    select: { npsScore: true, csatScore: true, commentText: true },
  });

  const nps = calculateNps(responses.map((r) => r.npsScore));
  const csat = calculateCsat(responses.map((r) => r.csatScore));

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            AI-Powered CX Analysis Platform
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Turn Raw Customer Surveys into Confident Strategic Decisions.
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl">
            Upload CSV survey feedback to instantly calculate mathematically accurate NPS & CSAT, 
            detect customer pain points via AI clustering, and generate evidence-grounded CX insights in under 10 minutes.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link href="/upload">
              <Button size="lg" className="bg-indigo-500 hover:bg-indigo-600 font-semibold gap-2 shadow-lg shadow-indigo-500/25">
                <UploadCloud className="h-5 w-5" />
                <span>Upload Survey Data</span>
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-2">
                <BarChart3 className="h-5 w-5" />
                <span>Explore Live CX Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Core Customer Journey Steps */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            step: '01',
            title: 'Survey Ingestion',
            desc: 'Drag & drop CSV files up to 10k rows with automatic header detection and validation.',
            link: '/upload',
          },
          {
            step: '02',
            title: 'Deterministic Metrics',
            desc: 'Audited computation of NPS, CSAT, distributions, and multi-segment comparisons.',
            link: '/dashboard',
          },
          {
            step: '03',
            title: 'Text & Theme AI',
            desc: 'Comment sentiment classification & semantic clustering of recurring pain points.',
            link: '/themes',
          },
          {
            step: '04',
            title: 'Evidence-Linked Insights',
            desc: 'AI-generated prioritized recommendations linking straight back to cited survey IDs.',
            link: '/insights',
          },
        ].map((item) => (
          <Card key={item.step} className="p-5 hover:border-indigo-200 transition-all">
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              STEP {item.step}
            </span>
            <h4 className="font-semibold text-slate-900 mt-3 text-sm">{item.title}</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
            <Link
              href={item.link}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 mt-4 hover:gap-1.5 transition-all"
            >
              <span>Explore</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Card>
        ))}
      </div>

      {/* Live Sample Benchmark KPIs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Current Workspace Benchmark</h2>
            <p className="text-xs text-slate-500">
              Live deterministic metrics computed from seeded sample dataset ({responses.length} responses).
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              View Detailed Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Net Promoter Score"
            value={nps.npsScore !== null ? `${nps.npsScore > 0 ? '+' : ''}${nps.npsScore}` : 'N/A'}
            subtitle={`${nps.promoterPct}% Promoters vs ${nps.detractorPct}% Detractors`}
            denominatorInfo={`${nps.totalValidResponses} valid responses`}
          />
          <MetricCard
            title="Customer Satisfaction"
            value={csat.csatScorePct !== null ? `${csat.csatScorePct}%` : 'N/A'}
            subtitle={`Average score: ${csat.averageScore || 'N/A'} / 5.0`}
            denominatorInfo={`${csat.totalValidResponses} valid ratings`}
          />
          <MetricCard
            title="Total Responses"
            value={responses.length}
            subtitle="Verified survey records"
            denominatorInfo="100% ingested"
          />
          <MetricCard
            title="Open Comments"
            value={responses.filter((r) => !!r.commentText).length}
            subtitle="Available for NLP & Theme extraction"
            denominatorInfo="Comment coverage"
          />
        </div>
      </div>

      {/* Available Datasets Table */}
      <Card>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-base">Loaded Datasets</h3>
            <p className="text-xs text-slate-500">Currently active survey datasets in persistence store.</p>
          </div>
          <Link href="/upload">
            <Button size="sm" className="gap-1.5">
              <UploadCloud className="h-4 w-4" />
              <span>Upload New CSV</span>
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">Dataset Name</th>
                <th className="py-3 px-5">File</th>
                <th className="py-3 px-5">Total Rows</th>
                <th className="py-3 px-5">Valid Rows</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Uploaded</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {datasets.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-slate-900">{d.name}</td>
                  <td className="py-3.5 px-5 text-slate-500 font-mono text-[11px]">{d.fileName}</td>
                  <td className="py-3.5 px-5 text-slate-700">{d.totalRows}</td>
                  <td className="py-3.5 px-5 text-slate-700 font-medium">{d.validRows}</td>
                  <td className="py-3.5 px-5">
                    <Badge variant={d.status === 'READY' ? 'success' : 'info'}>{d.status}</Badge>
                  </td>
                  <td className="py-3.5 px-5 text-slate-500">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <Link href={`/dashboard`}>
                      <span className="text-indigo-600 font-semibold hover:underline">
                        Open Dashboard &rarr;
                      </span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
