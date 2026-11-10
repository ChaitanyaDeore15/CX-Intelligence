'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Download,
  Info,
  ArrowRight,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';

export default function UploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvRawText, setCsvRawText] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const [step, setStep] = useState<'upload' | 'mapping' | 'validation'>('upload');
  const [uploading, setUploading] = useState(false);

  // Upload response state
  const [datasetId, setDatasetId] = useState<string>('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<Record<string, any>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({
    npsScore: '',
    csatScore: '',
    responseDate: '',
    commentText: '',
    product: '',
    region: '',
    customerType: '',
    sourceId: '',
  });

  // Validation response state
  const [validationResult, setValidationResult] = useState<{
    totalRows: number;
    acceptedRows: number;
    rejectedRows: number;
    issues: Array<{ rowNumber: number; column?: string; message: string; severity: string }>;
  } | null>(null);
  const [confirming, setConfirming] = useState(false);

  const handleFile = async (file: File) => {
    setSelectedFile(file);
    const text = await file.text();
    setCsvRawText(text);

    // Call upload API
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/datasets/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setDatasetId(data.data.datasetId);
        setHeaders(data.data.headers);
        setPreviewRows(data.data.previewRows);
        // Apply detected mapping suggestions
        const newMap: Record<string, string> = { ...mapping };
        for (const [k, v] of Object.entries(data.data.suggestedMapping || {})) {
          if (v) newMap[k] = v as string;
        }
        setMapping(newMap);
        setStep('mapping');
      } else {
        alert(data.error?.message || 'Failed to upload CSV');
      }
    } catch (e) {
      alert('Network error during file upload');
    } finally {
      setUploading(false);
    }
  };

  const handleValidate = async () => {
    setUploading(true);
    try {
      const res = await fetch(`/api/datasets/${datasetId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mapping,
          csvText: csvRawText,
          csatMin: 1,
          csatMax: 5,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setValidationResult(data.data);
        setStep('validation');
      } else {
        alert(data.error?.message || 'Validation failed');
      }
    } catch (e) {
      alert('Error communicating with validation service');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmAndIngest = async () => {
    setConfirming(true);
    try {
      const res = await fetch(`/api/datasets/${datasetId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mapping,
          csvText: csvRawText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/dashboard');
      } else {
        alert(data.error?.message || 'Confirmation failed');
      }
    } catch (e) {
      alert('Error during data ingestion');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Wizard Header Progress */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Survey Ingestion Pipeline</h1>
          <p className="text-xs text-slate-500 mt-1">
            Seamlessly upload, map columns, validate boundaries, and generate CX intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span
            className={`px-3 py-1 rounded-full ${
              step === 'upload' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            1. Upload
          </span>
          <span className="text-slate-300">&rarr;</span>
          <span
            className={`px-3 py-1 rounded-full ${
              step === 'mapping' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            2. Column Mapping
          </span>
          <span className="text-slate-300">&rarr;</span>
          <span
            className={`px-3 py-1 rounded-full ${
              step === 'validation' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            3. Review & Validate
          </span>
        </div>
      </div>

      {/* STEP 1: UPLOAD */}
      {step === 'upload' && (
        <div className="space-y-6">
          <Alert variant="info" title="Deterministic Integrity & Privacy First">
            NPS & CSAT are calculated strictly via mathematical TypeScript algorithms. PII (emails, phone numbers,
            full names) is automatically masked before any AI text analysis.
          </Alert>

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
                    handleFile(e.dataTransfer.files[0]);
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
                  {uploading ? 'Parsing CSV File...' : 'Choose a CSV file or drag & drop here'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Supports UTF-8 and UTF-8 BOM up to 10,000 rows. Quoted commas and multiline comments handled accurately.
                </p>

                <div className="mt-6 flex items-center justify-center gap-3">
                  <label htmlFor="csv-file-input">
                    <input
                      id="csv-file-input"
                      type="file"
                      accept=".csv,text/csv"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFile(e.target.files[0]);
                        }
                      }}
                    />
                    <Button type="button" variant="primary" size="md" isLoading={uploading} className="cursor-pointer">
                      Browse Files
                    </Button>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <Download className="h-4 w-4 text-indigo-600" />
                <span>Download Sample Templates</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Test the platform immediately with our pre-formatted enterprise survey template or synthetic generator.
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
                <span>Supported Standard Columns</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li>• <strong className="text-slate-900">NPS Score</strong>: 0–10 integer scale</li>
                <li>• <strong className="text-slate-900">CSAT Score</strong>: 1–5 rating scale</li>
                <li>• <strong className="text-slate-900">Response Date</strong>: ISO or standard date formats</li>
                <li>• <strong className="text-slate-900">Customer Comment</strong>: Open-text feedback for AI clustering</li>
                <li>• <strong className="text-slate-900">Segments</strong>: Product, Region, Customer Tier</li>
              </ul>
            </Card>
          </div>
        </div>
      )}

      {/* STEP 2: COLUMN MAPPING */}
      {step === 'mapping' && (
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Column Mapping Configuration"
              subtitle="Verify auto-detected mappings or select source columns from your CSV."
              action={
                <Button variant="ghost" size="sm" onClick={() => setStep('upload')}>
                  Upload Different File
                </Button>
              }
            />
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'npsScore', label: 'NPS Score (0–10)', req: false },
                  { key: 'csatScore', label: 'CSAT Score (1–5)', req: false },
                  { key: 'commentText', label: 'Customer Comment Text', req: false },
                  { key: 'responseDate', label: 'Response Date / Timestamp', req: false },
                  { key: 'product', label: 'Product / Service Column', req: false },
                  { key: 'region', label: 'Geographic Region Column', req: false },
                  { key: 'customerType', label: 'Customer Tier / Type Column', req: false },
                  { key: 'sourceId', label: 'Respondent ID (Optional)', req: false },
                ].map((f) => (
                  <div key={f.key} className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                    <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                      <span>{f.label}</span>
                      {f.req && <span className="text-[10px] text-rose-500 font-bold uppercase">Required</span>}
                    </label>
                    <select
                      value={mapping[f.key] || ''}
                      onChange={(e) => setMapping({ ...mapping, [f.key]: e.target.value })}
                      className="w-full text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="">— Unmapped / None —</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Data Preview */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  First 5 Preview Rows
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        {headers.map((h) => (
                          <th key={h} className="py-2.5 px-3 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewRows.slice(0, 5).map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          {headers.map((h) => (
                            <td key={h} className="py-2 px-3 text-slate-700 whitespace-nowrap max-w-xs truncate">
                              {row[h] !== undefined ? String(row[h]) : ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button variant="outline" size="md" onClick={() => setStep('upload')}>
                  Back to Upload
                </Button>
                <Button variant="primary" size="md" isLoading={uploading} onClick={handleValidate} className="gap-2">
                  <span>Validate Data</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* STEP 3: VALIDATION SUMMARY */}
      {step === 'validation' && validationResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 border-l-4 border-l-indigo-500">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Rows Parsed</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{validationResult.totalRows}</div>
            </Card>
            <Card className="p-5 border-l-4 border-l-emerald-500">
              <span className="text-xs font-semibold text-emerald-700 uppercase">Accepted Rows</span>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{validationResult.acceptedRows}</div>
              <span className="text-[11px] text-slate-500">
                {((validationResult.acceptedRows / validationResult.totalRows) * 100).toFixed(1)}% valid
              </span>
            </Card>
            <Card className="p-5 border-l-4 border-l-rose-500">
              <span className="text-xs font-semibold text-rose-700 uppercase">Rejected Rows</span>
              <div className="text-2xl font-bold text-rose-600 mt-1">{validationResult.rejectedRows}</div>
              <span className="text-[11px] text-slate-500">
                {validationResult.rejectedRows === 0 ? 'Clean dataset' : 'Boundary or type errors'}
              </span>
            </Card>
          </div>

          {validationResult.issues.length > 0 && (
            <Card>
              <CardHeader
                title={`Validation Issues Detected (${validationResult.issues.length})`}
                subtitle="Review identified errors and warnings. Invalid rows will be excluded from metrics calculation."
              />
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="py-2.5 px-4">Row #</th>
                      <th className="py-2.5 px-4">Severity</th>
                      <th className="py-2.5 px-4">Column</th>
                      <th className="py-2.5 px-4">Issue Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {validationResult.issues.map((iss, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2 px-4 font-mono font-semibold text-slate-900">#{iss.rowNumber}</td>
                        <td className="py-2 px-4">
                          <Badge variant={iss.severity === 'ERROR' ? 'error' : 'warning'} size="sm">
                            {iss.severity}
                          </Badge>
                        </td>
                        <td className="py-2 px-4 font-mono text-slate-600">{iss.column || 'General'}</td>
                        <td className="py-2 px-4 text-slate-700">{iss.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
            <Button variant="outline" size="md" onClick={() => setStep('mapping')}>
              Adjust Column Mapping
            </Button>
            <Button
              variant="primary"
              size="md"
              isLoading={confirming}
              onClick={handleConfirmAndIngest}
              disabled={validationResult.acceptedRows === 0}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Confirm & Ingest {validationResult.acceptedRows} Records</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
