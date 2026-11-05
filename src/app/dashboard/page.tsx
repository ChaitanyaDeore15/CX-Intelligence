'use client';

import React, { useEffect, useState } from 'react';
import { MetricCard, Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import {
  TrendingUp,
  BarChart3,
  Users,
  MessageSquare,
  Filter,
  Download,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

export default function DashboardPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Filters
  const [productFilter, setProductFilter] = useState('ALL');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('ALL');

  // Analytics data
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Fetch available datasets
  useEffect(() => {
    fetch('/api/datasets')
      .then((res) => res.json())
      .then((d) => {
        if (d.success && d.data.length > 0) {
          setDatasets(d.data);
          setSelectedDatasetId(d.data[0].id);
        } else {
          setLoading(false);
        }
      });
  }, []);

  // Fetch filtered analytics
  const fetchAnalytics = () => {
    if (!selectedDatasetId) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (productFilter !== 'ALL') params.append('product', productFilter);
    if (regionFilter !== 'ALL') params.append('region', regionFilter);
    if (customerTypeFilter !== 'ALL') params.append('customerType', customerTypeFilter);

    fetch(`/api/datasets/${selectedDatasetId}/analytics?${params.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setAnalyticsData(res.data);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedDatasetId, productFilter, regionFilter, customerTypeFilter]);

  const nps = analyticsData?.nps;
  const csat = analyticsData?.csat;
  const trends = analyticsData?.trends;

  // Chart data for trends
  const trendChartData = (trends?.buckets || []).map((b: any) => ({
    period: b.period,
    NPS: b.nps.npsScore ?? 0,
    CSAT_Pct: b.csat.csatScorePct ?? 0,
    Volume: b.totalResponses,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header & Global Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">CX Intelligence Dashboard</h1>
            <p className="text-xs text-slate-500 mt-1">
              Deterministic calculations matching mathematical reference standards with 100% precision.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {datasets.length > 1 && (
              <select
                value={selectedDatasetId}
                onChange={(e) => setSelectedDatasetId(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
              >
                {datasets.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.totalRows} rows)
                  </option>
                ))}
              </select>
            )}
            <Button variant="outline" size="sm" onClick={fetchAnalytics} className="gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Global Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-600">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700"
          >
            <option value="ALL">All Products</option>
            {analyticsData?.availableFilters?.products?.map((p: string) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700"
          >
            <option value="ALL">All Regions</option>
            {analyticsData?.availableFilters?.regions?.map((r: string) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            value={customerTypeFilter}
            onChange={(e) => setCustomerTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700"
          >
            <option value="ALL">All Customer Tiers</option>
            {analyticsData?.availableFilters?.customerTypes?.map((t: string) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {(productFilter !== 'ALL' || regionFilter !== 'ALL' || customerTypeFilter !== 'ALL') && (
            <button
              onClick={() => {
                setProductFilter('ALL');
                setRegionFilter('ALL');
                setCustomerTypeFilter('ALL');
              }}
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Reset Filters
            </button>
          )}

          <div className="ml-auto text-slate-400 font-mono text-[11px]">
            Filtered Sample: <strong>{analyticsData?.totalFilteredRecords || 0}</strong> records
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Net Promoter Score (NPS)"
          value={nps?.npsScore !== null && nps?.npsScore !== undefined ? `${nps.npsScore > 0 ? '+' : ''}${nps.npsScore}` : 'N/A'}
          subtitle={nps ? `${nps.promoterPct}% Promoters vs ${nps.detractorPct}% Detractors` : 'No valid responses'}
          denominatorInfo={`${nps?.totalValidResponses || 0} valid responses`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          title="Customer Satisfaction"
          value={csat?.csatScorePct !== null && csat?.csatScorePct !== undefined ? `${csat.csatScorePct}%` : 'N/A'}
          subtitle={`Avg score: ${csat?.averageScore || 'N/A'} / 5.0`}
          denominatorInfo={`${csat?.totalValidResponses || 0} ratings (threshold >= 4)`}
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <MetricCard
          title="Filtered Volume"
          value={analyticsData?.totalFilteredRecords || 0}
          subtitle="Survey responses in scope"
          denominatorInfo="Active filter selection"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Open Comments"
          value={analyticsData?.commentCount || 0}
          subtitle={`${(
            ((analyticsData?.commentCount || 0) / (analyticsData?.totalFilteredRecords || 1)) *
            100
          ).toFixed(1)}% feedback share`}
          denominatorInfo="Verbatim feedback"
          icon={<MessageSquare className="h-4 w-4" />}
        />
      </div>

      {/* Time Series Trend Chart */}
      {trendChartData.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Weekly CX Metric Trends</h3>
              <p className="text-xs text-slate-500">
                Chronological time-series tracking of NPS and CSAT satisfaction percentages.
              </p>
            </div>
            {trends?.overallChange?.npsDelta !== null && (
              <Badge variant={trends.overallChange.npsDelta >= 0 ? 'success' : 'error'}>
                NPS Shift: {trends.overallChange.npsDelta > 0 ? '+' : ''}
                {trends.overallChange.npsDelta} pts
              </Badge>
            )}
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[-100, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="NPS" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="CSAT_Pct" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Score Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NPS Breakdown */}
        <Card>
          <CardHeader
            title="NPS Distribution Breakdown"
            subtitle="Promoters (9-10), Passives (7-8), and Detractors (0-6)"
          />
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-700">Promoters (9–10)</span>
                  <span className="text-slate-900">{nps?.promoters || 0} ({nps?.promoterPct || 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${nps?.promoterPct || 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-700">Passives (7–8)</span>
                  <span className="text-slate-900">{nps?.passives || 0} ({nps?.passivePct || 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all"
                    style={{ width: `${nps?.passivePct || 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-rose-700">Detractors (0–6)</span>
                  <span className="text-slate-900">{nps?.detractors || 0} ({nps?.detractorPct || 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all"
                    style={{ width: `${nps?.detractorPct || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CSAT Breakdown */}
        <Card>
          <CardHeader
            title="CSAT Distribution Breakdown"
            subtitle="Proportion of satisfied respondents on configured scale"
          />
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-700">Satisfied (Score 4–5)</span>
                  <span className="text-slate-900">{csat?.satisfiedCount || 0} ({csat?.satisfiedPct || 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all"
                    style={{ width: `${csat?.satisfiedPct || 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Neutral (Score 3)</span>
                  <span className="text-slate-900">{csat?.neutralCount || 0}</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-slate-400 h-full rounded-full transition-all"
                    style={{
                      width: `${(((csat?.neutralCount || 0) / (csat?.totalValidResponses || 1)) * 100).toFixed(1)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-rose-700">Dissatisfied (Score 1–2)</span>
                  <span className="text-slate-900">{csat?.dissatisfiedCount || 0}</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-400 h-full rounded-full transition-all"
                    style={{
                      width: `${(((csat?.dissatisfiedCount || 0) / (csat?.totalValidResponses || 1)) * 100).toFixed(1)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
