'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RefreshCw, Play } from 'lucide-react';

interface Source {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  priority: number;
  interval: number;
  lastFetch: string;
  lastStatus: 'success' | 'error' | 'pending';
}

export default function AutomationsPage() {
  const [sources, setSources] = useState<Source[]>([
    {
      id: '1',
      name: 'Tech News RSS',
      url: 'https://example.com/feed',
      enabled: true,
      priority: 1,
      interval: 60,
      lastFetch: new Date(Date.now() - 5 * 60000).toISOString(),
      lastStatus: 'success',
    },
  ]);

  const handleRunSource = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/automations/${id}/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      if (response.ok) {
        alert('Source run started');
      }
    } catch (error) {
      console.error('Run failed:', error);
    }
  };

  const handleToggleSource = (id: string) => {
    setSources(
      sources.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Automations</h1>
        <p className="text-slate-600 mt-1">Manage RSS sources and automation rules</p>
      </div>

      {/* Global Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Global Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span>Enable all automations</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span>Suspend if FAL.ai credits low</span>
          </label>
        </CardContent>
      </Card>

      {/* Sources */}
      <Card>
        <CardHeader>
          <CardTitle>RSS Sources ({sources.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sources.map((source) => (
            <div key={source.id} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium">{source.name}</h3>
                  <p className="text-sm text-slate-500 break-all">{source.url}</p>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={source.enabled}
                    onChange={() => handleToggleSource(source.id)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{source.enabled ? 'Enabled' : 'Disabled'}</span>
                </label>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                <div>
                  <p className="text-slate-500">Interval</p>
                  <p className="font-medium">{source.interval} min</p>
                </div>
                <div>
                  <p className="text-slate-500">Last Status</p>
                  <p className={`font-medium ${
                    source.lastStatus === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {source.lastStatus}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Last Fetch</p>
                  <p className="font-medium">{new Date(source.lastFetch).toLocaleTimeString()}</p>
                </div>
              </div>

              <button
                onClick={() => handleRunSource(source.id)}
                className="w-full flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded"
              >
                <Play size={16} />
                Run Now
              </button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
