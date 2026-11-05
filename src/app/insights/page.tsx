import React from 'react';
import { prisma } from '@/lib/db';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, AlertOctagon } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InsightsPage() {
  const insights = await prisma.generatedInsight.findMany({
    orderBy: { impactRank: 'asc' },
    include: {
      evidences: {
        include: { response: true },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI-Generated CX Insights</h1>
          <p className="text-xs text-slate-500 mt-1">
            Grounded, ranked strategic findings answering &ldquo;Why did scores change and what should we investigate next?&rdquo;
          </p>
        </div>
        <Button size="sm" className="gap-2 shadow-sm">
          <Sparkles className="h-4 w-4" />
          <span>Generate Fresh Insights</span>
        </Button>
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
          </Card>
        ))}

        {insights.length === 0 && (
          <Card className="p-12 text-center text-slate-500 space-y-3">
            <Sparkles className="h-8 w-8 text-slate-300 mx-auto" />
            <h4 className="font-semibold text-slate-800">No Insights Generated Yet</h4>
            <p className="text-xs max-w-sm mx-auto">
              Click &ldquo;Generate Fresh Insights&rdquo; to analyze the active dataset.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
