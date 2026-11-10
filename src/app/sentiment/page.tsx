'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Sparkles, RefreshCw, Search } from 'lucide-react';

export default function SentimentPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [sentimentData, setSentimentData] = useState<{
    total: number;
    positive: number;
    neutral: number;
    negative: number;
    sentiments: any[];
  }>({
    total: 0,
    positive: 0,
    neutral: 0,
    negative: 0,
    sentiments: [],
  });

  const [searchQuery, setSearchQuery] = useState('');

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

  const loadSentiments = () => {
    if (!selectedDatasetId) return;
    setLoading(true);
    fetch(`/api/datasets/${selectedDatasetId}/sentiment`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setSentimentData(res.data);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSentiments();
  }, [selectedDatasetId]);

  const handleRunBatch = async () => {
    if (!selectedDatasetId) return;
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/datasets/${selectedDatasetId}/sentiment/analyze`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        loadSentiments();
      } else {
        alert(data.error?.message || 'Failed to analyze sentiments');
      }
    } catch (e) {
      alert('Error communicating with sentiment engine');
    } finally {
      setAnalyzing(false);
    }
  };

  const filtered = sentimentData.sentiments.filter((s) =>
    (s.response?.commentText || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sentiment Explorer</h1>
          <p className="text-xs text-slate-500 mt-1">
            Comment-level sentiment classification with explicit confidence and source traceability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {datasets.length > 0 && (
            <select
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 text-slate-800 shadow-sm"
            >
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.totalRows} rows)
                </option>
              ))}
            </select>
          )}
          <Button
            size="sm"
            isLoading={analyzing}
            onClick={handleRunBatch}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <Sparkles className="h-4 w-4" />
            <span>Run Sentiment Batch</span>
          </Button>
        </div>
      </div>

      {/* Aggregate Sentiment Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-l-emerald-500">
          <div className="text-xs uppercase font-semibold text-slate-500">Positive Sentiment</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {sentimentData.total ? `${((sentimentData.positive / sentimentData.total) * 100).toFixed(1)}%` : '0%'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {sentimentData.positive} of {sentimentData.total} comments analyzed
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-amber-400">
          <div className="text-xs uppercase font-semibold text-slate-500">Neutral Sentiment</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {sentimentData.total ? `${((sentimentData.neutral / sentimentData.total) * 100).toFixed(1)}%` : '0%'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {sentimentData.neutral} of {sentimentData.total} comments analyzed
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-rose-500">
          <div className="text-xs uppercase font-semibold text-slate-500">Negative Sentiment</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {sentimentData.total ? `${((sentimentData.negative / sentimentData.total) * 100).toFixed(1)}%` : '0%'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {sentimentData.negative} of {sentimentData.total} comments analyzed
          </div>
        </Card>
      </div>

      {/* Comment explorer table */}
      <Card>
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900 text-base">Analyzed Feedback Explorer</h3>
            <p className="text-xs text-slate-500">
              Direct link between classified sentiment, raw feedback text, and linked CX scores
            </p>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search comments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">Source ID</th>
                <th className="py-3 px-5">Feedback Comment</th>
                <th className="py-3 px-5">Sentiment</th>
                <th className="py-3 px-5">NPS</th>
                <th className="py-3 px-5">CSAT</th>
                <th className="py-3 px-5">Product / Segment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-5 font-mono text-[11px] text-slate-500">
                    {s.response.sourceId || s.response.id.slice(0, 8)}
                  </td>
                  <td className="py-3.5 px-5 text-slate-800 max-w-md">
                    &ldquo;{s.response.commentText}&rdquo;
                  </td>
                  <td className="py-3.5 px-5">
                    <Badge
                      variant={
                        s.sentiment === 'POSITIVE'
                          ? 'success'
                          : s.sentiment === 'NEGATIVE'
                          ? 'error'
                          : 'warning'
                      }
                    >
                      {s.sentiment}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-slate-900">
                    {s.response.npsScore ?? '—'}
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-slate-900">
                    {s.response.csatScore ? `${s.response.csatScore}/5` : '—'}
                  </td>
                  <td className="py-3.5 px-5 text-slate-500">
                    {s.response.product} • {s.response.region}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    {sentimentData.total === 0
                      ? "No comments analyzed yet. Click 'Run Sentiment Batch' to classify feedback."
                      : 'No comments matched your search criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
