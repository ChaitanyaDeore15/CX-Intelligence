'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Download,
  Info,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Upload Survey Dataset</h1>
        <p className="text-sm text-slate-500 mt-1">
          Ingest raw CSV survey feedback. The engine validates boundaries, normalizes column mappings, and computes CX KPIs.
        </p>
      </div>

      <Alert variant="info" title="Zero-Data-Leakage Guarantee">
        Customer comments are scrubbed for PII (names, phone numbers, email addresses) before any text analysis.
        All numerical metrics are computed purely in deterministic code.
      </Alert>

      {/* Upload Box */}
      <Card>
        <CardContent className="p-8">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                setSelectedFile(e.dataTransfer.files[0]);
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
              dragOver
                ? 'border-indigo-500 bg-indigo-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <div className="mx-auto h-16 w-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
              <UploadCloud className="h-8 w-8" />
            </div>

            <h3 className="text-base font-semibold text-slate-900">
              {selectedFile ? selectedFile.name : 'Choose a CSV file or drag & drop here'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Supported format: CSV (UTF-8, UTF-8 BOM, up to 25MB and 10,000 rows).
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <label htmlFor="csv-input">
                <input
                  id="csv-input"
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button type="button" variant="outline" size="md" className="cursor-pointer">
                  Browse Files
                </Button>
              </label>

              {selectedFile && (
                <Link href="/workspace">
                  <Button variant="primary" size="md" className="gap-2">
                    <span>Proceed to Mapping</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>

            {selectedFile && (
              <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Download Templates & Format Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <Download className="h-4 w-4 text-indigo-600" />
            <span>Download Sample Templates</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Quickly test the platform using our verified pre-formatted CSV template or generate synthetic test data.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <a href="/api/sample-template" download="cx_survey_template.csv">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Download Clean CSV Template</span>
              </Button>
            </a>
            <a href="/api/sample-template?type=synthetic&count=250" download="synthetic_cx_survey_250_rows.csv">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Download className="h-3.5 w-3.5" />
                <span>250-Row Synthetic Benchmark</span>
              </Button>
            </a>
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <Info className="h-4 w-4 text-slate-600" />
            <span>Supported Data Columns</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5">
            <li>• <strong className="text-slate-900">NPS Score</strong>: Numeric 0–10 (Required for NPS)</li>
            <li>• <strong className="text-slate-900">CSAT Score</strong>: Numeric 1–5 (Required for CSAT)</li>
            <li>• <strong className="text-slate-900">Response Date</strong>: ISO YYYY-MM-DD or standard formats</li>
            <li>• <strong className="text-slate-900">Open Comment</strong>: Text feedback for NLP & AI theme analysis</li>
            <li>• <strong className="text-slate-900">Segments</strong>: Product, Region, Customer Tier, Channel</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
