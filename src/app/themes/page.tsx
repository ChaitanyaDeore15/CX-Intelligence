'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tag, Sparkles, RefreshCw } from 'lucide-react';

export default function ThemesPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [themes, setThemes] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/datasets')
      .then((res) => res.json())
      .then((d) => {
        if (d.success && d.data.length > 0) {
          setDatasets(d.data);
          setSelectedDatasetId(d.data[0].id);
        } else {
          setLoading(false);
        }
      });
  }, []);

  const loadThemes = () => {
    if (!selectedDatasetId) return;
    setLoading(true);
    fetch(`/api/datasets/${selectedDatasetId}/themes`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setThemes(res.data);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadThemes();
  }, [selectedDatasetId]);

  const handleDiscoverThemes = async () => {
    if (!selectedDatasetId) return;
    setDiscovering(true);
    try {
      const res = await fetch(`/api/datasets/${selectedDatasetId}/themes/discover`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        loadThemes();
      } else {
        alert(data.error?.message || 'Theme discovery failed');
      }
    } catch (e) {
      alert('Error communicating with theme engine');
    } finally {
      setDiscovering(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Theme Analysis & Customer Pain Points</h1>
          <p className="text-xs text-slate-500 mt-1">
            Semantic clustering of customer feedback into actionable problem categories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {datasets.length > 0 && (
            <select
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 text-slate-800 shadow-sm"
            >
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.totalRows} rows)
                </option>
              ))}
            </select>
          )}
          <Button
            size="sm"
            isLoading={discovering}
            onClick={handleDiscoverThemes}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <Sparkles className="h-4 w-4" />
            <span>Discover Themes</span>
          </Button>
        </div>
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
                {theme.impactScore !== null
                  ? `${(theme.impactScore * 100).toFixed(0)}% detractor correlation`
                  : 'Calculated'}
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
                Click &ldquo;Discover Themes&rdquo; to cluster feedback comments into recurring topics for this dataset.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
