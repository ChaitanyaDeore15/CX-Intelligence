'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UploadCloud,
  Layers,
  PieChart,
  BarChart3,
  MessageSquare,
  Tag,
  Sparkles,
  FileText,
  Shield,
  HelpCircle,
} from 'lucide-react';

const navigationItems = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Upload Survey', href: '/upload', icon: UploadCloud },
  { name: 'Dataset Workspace', href: '/workspace', icon: Layers },
  { name: 'CX Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Segment Analysis', href: '/segments', icon: PieChart },
  { name: 'Sentiment Explorer', href: '/sentiment', icon: MessageSquare },
  { name: 'Theme Analysis', href: '/themes', icon: Tag },
  { name: 'AI Insights', href: '/insights', icon: Sparkles },
  { name: 'Reports & Export', href: '/reports', icon: FileText },
  { name: 'Settings & Privacy', href: '/settings', icon: Shield },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      <div className="p-4 border-b border-slate-800">
        <div className="text-xs uppercase font-semibold tracking-wider text-slate-400">
          Navigation
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer info box */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400 space-y-1.5">
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-300">CX Intelligence Platform</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Deterministic CX metrics, PII redaction, and evidence-grounded AI insights.
        </p>
      </div>
    </aside>
  );
};
