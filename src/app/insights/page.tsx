'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Sparkles, RefreshCw, Quote } from 'lucide-react';

export default function InsightsPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [insights, setInsights] = useState<any[]>([]);

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

  const loadInsights = () => {
    if (!selectedDatasetId) return;
    setLoading(true);
    fetch(`/api/datasets/${selectedDatasetId}/insights`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setInsights(res.data);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInsights();
  }, [selectedDatasetId]);

  const handleGenerateInsights = async () => {
    if (!selectedDatasetId) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/datasets/${selectedDatasetId}/insights`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        loadInsights();
      } else {
        alert(data.error?.message || 'Insight generation failed');
      }
    } catch (e) {
      alert('Error communicating with insight engine');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI-Generated CX Insights</h1>
          <p className="text-xs text-slate-500 mt-1">
            Grounded, ranked strategic findings answering &ldquo;Why did scores change and what should we investigate next?&rdquo;
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
            isLoading={generating}
            onClick={handleGenerateInsights}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-sm"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate Fresh Insights</span>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => (
          <Card key={insight.id} className="p-6 border-l-4 border-l-indigo-600">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  PRIORITY #{insight.impactRank}
                </span>
                <Badge variant={insight.evidenceStrength === 'STRONG' ? 'success' : 'info'}>
                  Evidence: {insight.evidenceStrength}
                </Badge>
                <span className="text-xs text-slate-400 font-medium">Category: {insight.category}</span>
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-900 mt-3">{insight.title}</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{insight.summary}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                <span className="font-semibold text-slate-700 block">Recommended Investigation:</span>
                <p className="text-slate-600">{insight.recommendation}</p>
              </div>
              <div className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100 space-y-1">
                <span className="font-semibold text-indigo-900 block">Suggested Business Action:</span>
                <p className="text-indigo-800">{insight.suggestedAction}</p>
              </div>
            </div>

            {/* Evidence Linkage */}
            {insight.evidences && insight.evidences.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Linked Supporting Customer Feedback (Evidence)
                </span>
                <div className="space-y-2">
                  {insight.evidences.map((ev: any) => (
                    <div
                      key={ev.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs flex items-start gap-2 text-slate-700"
                    >
                      <Quote className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <span>&ldquo;{ev.excerpt}&rdquo;</span>
                        {ev.response && (
                          <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">
                            Respondent: {ev.response.sourceId || ev.response.id.slice(0, 8)} | NPS: {ev.response.npsScore ?? '—'} | CSAT: {ev.response.csatScore ?? '—'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}

        {insights.length === 0 && (
          <Card className="p-12 text-center text-slate-500 space-y-3">
            <Sparkles className="h-8 w-8 text-slate-300 mx-auto" />
            <h4 className="font-semibold text-slate-800">No Insights Generated Yet</h4>
            <p className="text-xs max-w-sm mx-auto">
              Click &ldquo;Generate Fresh Insights&rdquo; to analyze the selected dataset and extract actionable findings.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
