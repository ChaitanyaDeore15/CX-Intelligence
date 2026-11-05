import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Download, Printer, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ReportsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports & Data Exports</h1>
        <p className="text-xs text-slate-500 mt-1">
          Generate formatted PDF executive summaries and spreadsheet-safe CSV exports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Executive CX Summary (PDF)</h3>
              <p className="text-xs text-slate-500">Publication-ready PDF document for executive leadership</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Includes headline NPS/CSAT KPI summaries, trend charts, sentiment distribution, 
            top customer pain-point themes, and prioritized AI insights.
          </p>
          <div className="pt-2">
            <Button size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              <span>Generate Executive PDF</span>
            </Button>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Spreadsheet Data Export (CSV)</h3>
              <p className="text-xs text-slate-500">Filtered dataset export with formula injection defense</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Sanitizes cells against CSV injection (=, +, -, @), preserving all mapped columns, 
            computed sentiment labels, and theme associations.
          </p>
          <div className="pt-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              <span>Export Raw Records (CSV)</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
