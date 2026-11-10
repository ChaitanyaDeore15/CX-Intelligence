'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function SegmentsPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [segmentsData, setSegmentsData] = useState<{
    byProduct: any[];
    byRegion: any[];
    byCustomerType: any[];
  } | null>(null);

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

  const loadSegments = () => {
    if (!selectedDatasetId) return;
    setLoading(true);
    fetch(`/api/datasets/${selectedDatasetId}/analytics`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data.segments) {
          setSegmentsData(res.data.segments);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSegments();
  }, [selectedDatasetId]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Segment Analysis & Comparison</h1>
          <p className="text-xs text-slate-500 mt-1">
            Compare CX scores across dimensions (Product, Region, Customer Tier) with automated statistical reliability checks.
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
          <Button variant="outline" size="sm" onClick={loadSegments} className="gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Product breakdown */}
      <Card>
        <CardHeader
          title="Product CX Performance"
          subtitle="NPS, CSAT, and response volume breakdown by product family"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">Product</th>
                <th className="py-3 px-5">Sample Size (N)</th>
                <th className="py-3 px-5">NPS Score</th>
                <th className="py-3 px-5">CSAT Satisfied %</th>
                <th className="py-3 px-5">Average CSAT</th>
                <th className="py-3 px-5">Reliability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {segmentsData?.byProduct?.map((item: any) => (
                <tr key={item.segmentValue} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-5 font-semibold text-slate-900">{item.segmentValue}</td>
                  <td className="py-3.5 px-5 text-slate-600 font-mono">{item.totalResponses}</td>
                  <td className="py-3.5 px-5 font-bold">
                    <span className={item.nps.npsScore && item.nps.npsScore > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {item.nps.npsScore !== null ? `${item.nps.npsScore > 0 ? '+' : ''}${item.nps.npsScore}` : 'N/A'}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-medium text-slate-900">
                    {item.csat.csatScorePct !== null ? `${item.csat.csatScorePct}%` : 'N/A'}
                  </td>
                  <td className="py-3.5 px-5 text-slate-700">
                    {item.csat.averageScore !== null ? `${item.csat.averageScore} / 5.0` : 'N/A'}
                  </td>
                  <td className="py-3.5 px-5">
                    {item.isReliable ? (
                      <Badge variant="success" size="sm">Sufficient Sample (N ≥ 30)</Badge>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <AlertTriangle className="h-3 w-3" />
                        Small Sample (N &lt; 30)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {(!segmentsData?.byProduct || segmentsData.byProduct.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No product breakdown data found for the selected dataset.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Region breakdown */}
      <Card>
        <CardHeader
          title="Regional CX Performance"
          subtitle="NPS, CSAT, and response volume breakdown by geographic market"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">Region</th>
                <th className="py-3 px-5">Sample Size (N)</th>
                <th className="py-3 px-5">NPS Score</th>
                <th className="py-3 px-5">CSAT Satisfied %</th>
                <th className="py-3 px-5">Average CSAT</th>
                <th className="py-3 px-5">Reliability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {segmentsData?.byRegion?.map((item: any) => (
                <tr key={item.segmentValue} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-5 font-semibold text-slate-900">{item.segmentValue}</td>
                  <td className="py-3.5 px-5 text-slate-600 font-mono">{item.totalResponses}</td>
                  <td className="py-3.5 px-5 font-bold">
                    <span className={item.nps.npsScore && item.nps.npsScore > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {item.nps.npsScore !== null ? `${item.nps.npsScore > 0 ? '+' : ''}${item.nps.npsScore}` : 'N/A'}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-medium text-slate-900">
                    {item.csat.csatScorePct !== null ? `${item.csat.csatScorePct}%` : 'N/A'}
                  </td>
                  <td className="py-3.5 px-5 text-slate-700">
                    {item.csat.averageScore !== null ? `${item.csat.averageScore} / 5.0` : 'N/A'}
                  </td>
                  <td className="py-3.5 px-5">
                    {item.isReliable ? (
                      <Badge variant="success" size="sm">Sufficient Sample (N ≥ 30)</Badge>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <AlertTriangle className="h-3 w-3" />
                        Small Sample (N &lt; 30)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {(!segmentsData?.byRegion || segmentsData.byRegion.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No regional breakdown data found for the selected dataset.
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
