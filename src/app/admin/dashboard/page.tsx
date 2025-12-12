'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface KPIData {
  totalPosts: number;
  publishedToday: number;
  pendingApprovals: number;
  dailyAverage: number;
}

interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  status: string;
}

const mockChartData = [
  { date: 'Mon', published: 4, views: 2400 },
  { date: 'Tue', published: 3, views: 1398 },
  { date: 'Wed', published: 2, views: 9800 },
  { date: 'Thu', published: 5, views: 3908 },
  { date: 'Fri', published: 4, views: 4800 },
  { date: 'Sat', published: 6, views: 3800 },
  { date: 'Sun', published: 3, views: 4300 },
];

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch KPI data
        const kpiRes = await fetch('/api/admin/kpis', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          },
        });

        if (kpiRes.ok) {
          const data = await kpiRes.json();
          setKpis(data);
        }

        // Fetch logs
        const logsRes = await fetch('/api/admin/logs?limit=10', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          },
        });

        if (logsRes.ok) {
          const data = await logsRes.json();
          setLogs(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-slate-600">Welcome to your admin panel</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kpis?.totalPosts || 0}</p>
            <p className="text-xs text-slate-500">All published posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Published Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{kpis?.publishedToday || 0}</p>
            <p className="text-xs text-slate-500">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{kpis?.pendingApprovals || 0}</p>
            <p className="text-xs text-slate-500">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Daily Average</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{kpis?.dailyAverage || 0}</p>
            <p className="text-xs text-slate-500">30-day average</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Published Articles Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="published" stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.length === 0 ? (
              <p className="text-slate-500 text-sm">No recent activity</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-3 border-b border-slate-200 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{log.action}</p>
                    <p className="text-xs text-slate-500">{log.user} · {log.timestamp}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    log.status === 'success' ? 'bg-green-100 text-green-800' :
                    log.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {log.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
