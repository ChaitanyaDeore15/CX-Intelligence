import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'CX Intelligence — AI-Powered Customer Experience Analysis Platform',
  description: 'Enterprise-grade deterministic CX analytics, sentiment classification, theme clustering, and evidence-grounded AI insights.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans antialiased">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
