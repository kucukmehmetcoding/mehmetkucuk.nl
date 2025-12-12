'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Download } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  source: string;
}

export default function LogsPage() {
  const [logs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 5000).toISOString(),
      type: 'info',
      message: 'Post published successfully',
      source: 'api',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 15000).toISOString(),
      type: 'info',
      message: 'Image uploaded',
      source: 'media',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      type: 'warning',
      message: 'FAL.ai API rate limit approaching',
      source: 'ai',
    },
  ]);

  const [typeFilter, setTypeFilter] = useState<'all' | 'info' | 'warning' | 'error'>('all');

  const filteredLogs = typeFilter === 'all' ? logs : logs.filter((l) => l.type === typeFilter);

  const handleDownload = () => {
    const csv = ['timestamp,type,message,source', ...filteredLogs.map((l) => `"${l.timestamp}","${l.type}","${l.message}","${l.source}"`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'logs.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">System Logs</h1>
          <p className="text-slate-600 mt-1">View system events and errors</p>
        </div>
        <button
          onClick={handleDownload}
          className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Download size={20} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            {(['all', 'info', 'warning', 'error'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-4 py-2 rounded-lg ${
                  typeFilter === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Logs ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  log.type === 'error' ? 'bg-red-500' :
                  log.type === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{log.message}</p>
                  <div className="flex gap-4 mt-1 text-xs text-slate-500">
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                    <span className="bg-slate-100 px-2 py-1 rounded">{log.source}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
