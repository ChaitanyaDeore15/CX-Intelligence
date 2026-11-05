import React from 'react';
import { prisma } from '@/lib/db';
import { calculateNps, calculateCsat, isSampleReliable } from '@/lib/metrics';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { PieChart, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SegmentsPage() {
  const responses = await prisma.surveyResponse.findMany();

  // Aggregate by Product
  const productMap: Record<string, typeof responses> = {};
  // Aggregate by Region
  const regionMap: Record<string, typeof responses> = {};

  responses.forEach((r) => {
    const prod = r.product || 'Unassigned';
    if (!productMap[prod]) productMap[prod] = [];
    productMap[prod].push(r);

    const reg = r.region || 'Unassigned';
    if (!regionMap[reg]) regionMap[reg] = [];
    regionMap[reg].push(r);
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Segment Analysis & Comparison</h1>
        <p className="text-xs text-slate-500 mt-1">
          Compare CX scores across dimensions (Product, Region, Customer Tier) with automated statistical reliability checks.
        </p>
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
              {Object.entries(productMap).map(([prod, list]) => {
                const nps = calculateNps(list.map((x) => x.npsScore));
                const csat = calculateCsat(list.map((x) => x.csatScore));
                const reliable = isSampleReliable(list.length);

                return (
                  <tr key={prod} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">{prod}</td>
                    <td className="py-3.5 px-5 text-slate-600 font-mono">{list.length}</td>
                    <td className="py-3.5 px-5 font-bold">
                      <span className={nps.npsScore && nps.npsScore > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {nps.npsScore !== null ? `${nps.npsScore > 0 ? '+' : ''}${nps.npsScore}` : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-900">
                      {csat.csatScorePct !== null ? `${csat.csatScorePct}%` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-5 text-slate-700">
                      {csat.averageScore !== null ? `${csat.averageScore} / 5.0` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-5">
                      {reliable ? (
                        <Badge variant="success" size="sm">Sufficient Sample (N ≥ 30)</Badge>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertTriangle className="h-3 w-3" />
                          Small Sample (N &lt; 30)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
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
              {Object.entries(regionMap).map(([reg, list]) => {
                const nps = calculateNps(list.map((x) => x.npsScore));
                const csat = calculateCsat(list.map((x) => x.csatScore));
                const reliable = isSampleReliable(list.length);

                return (
                  <tr key={reg} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">{reg}</td>
                    <td className="py-3.5 px-5 text-slate-600 font-mono">{list.length}</td>
                    <td className="py-3.5 px-5 font-bold">
                      <span className={nps.npsScore && nps.npsScore > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {nps.npsScore !== null ? `${nps.npsScore > 0 ? '+' : ''}${nps.npsScore}` : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-900">
                      {csat.csatScorePct !== null ? `${csat.csatScorePct}%` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-5 text-slate-700">
                      {csat.averageScore !== null ? `${csat.averageScore} / 5.0` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-5">
                      {reliable ? (
                        <Badge variant="success" size="sm">Sufficient Sample (N ≥ 30)</Badge>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertTriangle className="h-3 w-3" />
                          Small Sample (N &lt; 30)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
