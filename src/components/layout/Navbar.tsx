'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, Download, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'checking' | 'degraded'>('checking');
  const [datasetCount, setDatasetCount] = useState<number>(0);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'healthy') {
          setHealthStatus('healthy');
          setDatasetCount(data.database.datasetCount);
        } else {
          setHealthStatus('degraded');
        }
      })
      .catch(() => setHealthStatus('degraded'));
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm font-bold text-lg">
          CX
        </div>
        <div>
          <span className="font-bold text-slate-900 tracking-tight text-base">CX Intelligence</span>
          <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
            MVP v1.0
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Health status badge */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span
            className={`h-2 w-2 rounded-full ${
              healthStatus === 'healthy'
                ? 'bg-emerald-500 animate-pulse'
                : healthStatus === 'checking'
                ? 'bg-amber-400'
                : 'bg-rose-500'
            }`}
          />
          <Activity className="h-3.5 w-3.5 text-slate-400" />
          <span>DB: {healthStatus === 'healthy' ? `Connected (${datasetCount} Datasets)` : healthStatus}</span>
        </div>

        {/* Download sample CSV template */}
        <a
          href="/api/sample-template"
          download="cx_survey_template.csv"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Download className="h-3.5 w-3.5 text-slate-500" />
          <span>Sample CSV</span>
        </a>

        {/* Privacy badge */}
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span className="hidden sm:inline">PII Shield Active</span>
        </div>
      </div>
    </header>
  );
};
