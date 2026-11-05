import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Shield, Key, Database, Trash2, Cpu } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings & Data Privacy</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure AI provider credentials, data retention policies, and PII masking thresholds.
        </p>
      </div>

      {/* AI Provider Configuration */}
      <Card>
        <CardHeader
          title="AI Provider Settings"
          subtitle="Configure provider-independent LLM backend (OpenAI, Google Gemini, Anthropic, or Local Fallback)"
        />
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
              <Cpu className="h-5 w-5 text-indigo-600" />
              <div>
                <span className="font-semibold text-slate-900 text-xs block">Active AI Provider</span>
                <span className="text-slate-500 text-[11px]">Configured via environment variables</span>
              </div>
            </div>
            <Badge variant="info">MOCK / LOCAL DETERMINISTIC</Badge>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
            <strong>Rule Compliance:</strong> All numerical calculations (NPS, CSAT, distributions) remain 100% deterministic in code. AI provider is solely utilized for open-text classification and narrative synthesis.
          </div>
        </CardContent>
      </Card>

      {/* Data Privacy & Retention */}
      <Card>
        <CardHeader
          title="Privacy & Data Retention Controls"
          subtitle="Customer privacy and PII protection policies"
        />
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <div className="text-xs font-semibold text-slate-900">Automated PII Masking</div>
              <div className="text-[11px] text-slate-500">Scrub customer email addresses, phone numbers, and full names before LLM processing</div>
            </div>
            <Badge variant="success">ENABLED</Badge>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <div className="text-xs font-semibold text-slate-900">Storage Protection</div>
              <div className="text-[11px] text-slate-500">Uploaded survey files stored strictly in private server storage</div>
            </div>
            <Badge variant="success">PRIVATE</Badge>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-xs font-semibold text-slate-900">User-Controlled Hard Deletion</div>
              <div className="text-[11px] text-slate-500">Cascade delete all survey responses, themes, insights, and cached exports</div>
            </div>
            <Badge variant="default">AVAILABLE</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
