import React from 'react';
import { prisma } from '@/lib/db';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tag, Sparkles, MessageSquare } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ThemesPage() {
  const themes = await prisma.theme.findMany({
    include: {
      _count: {
        select: { assignments: true },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Theme Analysis & Customer Pain Points</h1>
          <p className="text-xs text-slate-500 mt-1">
            Semantic clustering of customer feedback into actionable problem categories.
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          <span>Discover Themes</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {themes.map((theme) => (
          <Card key={theme.id} className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">{theme.name}</h3>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{theme.description}</p>
              </div>
              <Badge variant="purple" size="md">
                {theme.commentCount} comments
              </Badge>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Satisfaction Impact Score</span>
              <span className="font-bold text-rose-600 font-mono">
                {theme.impactScore ? `${(theme.impactScore * 100).toFixed(0)}% negative correlation` : 'Calculated'}
              </span>
            </div>
          </Card>
        ))}

        {themes.length === 0 && (
          <div className="col-span-2">
            <Card className="p-12 text-center text-slate-500 space-y-3">
              <Tag className="h-8 w-8 text-slate-300 mx-auto" />
              <h4 className="font-semibold text-slate-800">No Themes Discovered Yet</h4>
              <p className="text-xs max-w-sm mx-auto">
                Trigger theme discovery to cluster feedback comments into recurring topics.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
