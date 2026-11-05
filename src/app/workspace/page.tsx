import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Layers, UploadCloud, Trash2, BarChart2, Calendar, FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function WorkspacePage() {
  const datasets = await prisma.dataset.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          responses: true,
          validationIssues: true,
          themes: true,
          insights: true,
        },
      },
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dataset Workspace</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage uploaded survey datasets, view data health, and monitor analysis stages.
          </p>
        </div>
        <Link href="/upload">
          <Button size="md" className="gap-2">
            <UploadCloud className="h-4 w-4" />
            <span>Upload New Dataset</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {datasets.map((d) => (
          <Card key={d.id} className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-slate-900">{d.name}</h3>
                  <Badge variant={d.status === 'READY' ? 'success' : 'warning'}>
                    {d.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="font-mono text-slate-600">{d.fileName}</span>
                  <span>•</span>
                  <span>Size: {(d.fileSizeBytes / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span>Total Rows: {d.totalRows}</span>
                  <span>•</span>
                  <span className="font-medium text-emerald-600">Valid Rows: {d.validRows}</span>
                  <span>•</span>
                  <span>Uploaded: {new Date(d.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/dashboard">
                  <Button variant="primary" size="sm" className="gap-1.5">
                    <BarChart2 className="h-3.5 w-3.5" />
                    <span>View Dashboard</span>
                  </Button>
                </Link>
                <Link href="/insights">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    <span>Insights ({d._count.insights})</span>
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Survey Responses</span>
                <span className="text-slate-900 font-bold text-sm mt-0.5 block">{d._count.responses}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Validation Issues</span>
                <span className="text-slate-900 font-bold text-sm mt-0.5 block">{d._count.validationIssues}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Extracted Themes</span>
                <span className="text-slate-900 font-bold text-sm mt-0.5 block">{d._count.themes}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">AI Insights</span>
                <span className="text-slate-900 font-bold text-sm mt-0.5 block">{d._count.insights}</span>
              </div>
            </div>
          </Card>
        ))}

        {datasets.length === 0 && (
          <Card className="p-12 text-center text-slate-500 space-y-3">
            <Layers className="h-10 w-10 text-slate-300 mx-auto" />
            <h4 className="font-semibold text-slate-800">No Datasets Found</h4>
            <p className="text-xs max-w-sm mx-auto">
              Get started by uploading your first CSV customer survey dataset.
            </p>
            <Link href="/upload">
              <Button size="sm" className="mt-2">Upload Survey</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
