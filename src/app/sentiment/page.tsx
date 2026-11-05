import React from 'react';
import { prisma } from '@/lib/db';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Sparkles, Filter, Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SentimentPage() {
  const sentiments = await prisma.sentimentResult.findMany({
    include: {
      response: true,
    },
    take: 50,
  });

  const total = sentiments.length;
  const positive = sentiments.filter((s) => s.sentiment === 'POSITIVE').length;
  const neutral = sentiments.filter((s) => s.sentiment === 'NEUTRAL').length;
  const negative = sentiments.filter((s) => s.sentiment === 'NEGATIVE').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sentiment Explorer</h1>
          <p className="text-xs text-slate-500 mt-1">
            Comment-level sentiment classification with explicit confidence and source traceability.
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          <span>Run Sentiment Batch</span>
        </Button>
      </div>

      {/* Aggregate Sentiment Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-l-emerald-500">
          <div className="text-xs uppercase font-semibold text-slate-500">Positive Sentiment</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {total ? `${((positive / total) * 100).toFixed(1)}%` : '0%'}
          </div>
          <div className="text-xs text-slate-500 mt-1">{positive} of {total} comments analyzed</div>
        </Card>

        <Card className="p-5 border-l-4 border-l-amber-400">
          <div className="text-xs uppercase font-semibold text-slate-500">Neutral Sentiment</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {total ? `${((neutral / total) * 100).toFixed(1)}%` : '0%'}
          </div>
          <div className="text-xs text-slate-500 mt-1">{neutral} of {total} comments analyzed</div>
        </Card>

        <Card className="p-5 border-l-4 border-l-rose-500">
          <div className="text-xs uppercase font-semibold text-slate-500">Negative Sentiment</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {total ? `${((negative / total) * 100).toFixed(1)}%` : '0%'}
          </div>
          <div className="text-xs text-slate-500 mt-1">{negative} of {total} comments analyzed</div>
        </Card>
      </div>

      {/* Comment explorer table */}
      <Card>
        <CardHeader
          title="Analyzed Feedback Explorer"
          subtitle="Direct link between classified sentiment, raw feedback text, and linked CX scores"
        />
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
              {sentiments.map((s) => (
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
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
