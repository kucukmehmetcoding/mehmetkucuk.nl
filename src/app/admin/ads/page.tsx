'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Edit, Eye } from 'lucide-react';

interface AdSlot {
  id: string;
  name: string;
  placement: string;
  size: string;
  status: 'active' | 'inactive';
  impressions: number;
  clicks: number;
  ctr: number;
}

export default function AdsPage() {
  const [slots, setSlots] = useState<AdSlot[]>([
    {
      id: '1',
      name: 'Header Banner',
      placement: 'Header',
      size: '728x90',
      status: 'active',
      impressions: 12500,
      clicks: 245,
      ctr: 1.96,
    },
    {
      id: '2',
      name: 'Sidebar AD',
      placement: 'Sidebar',
      size: '300x250',
      status: 'active',
      impressions: 8750,
      clicks: 156,
      ctr: 1.78,
    },
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newSlot, setNewSlot] = useState({ name: '', placement: 'Header', size: '728x90' });

  const handleCreate = () => {
    if (!newSlot.name.trim()) return;

    const slot: AdSlot = {
      id: String(slots.length + 1),
      name: newSlot.name,
      placement: newSlot.placement,
      size: newSlot.size,
      status: 'inactive',
      impressions: 0,
      clicks: 0,
      ctr: 0,
    };

    setSlots([...slots, slot]);
    setNewSlot({ name: '', placement: 'Header', size: '728x90' });
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this ad slot?')) {
      setSlots(slots.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Ad Management</h1>
          <p className="text-slate-600 mt-1">Manage ad slots and campaigns</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          New Ad Slot
        </button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Ad Slot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              value={newSlot.name}
              onChange={(e) => setNewSlot({ ...newSlot, name: e.target.value })}
              placeholder="Ad slot name..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newSlot.placement}
              onChange={(e) => setNewSlot({ ...newSlot, placement: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Header">Header</option>
              <option value="Sidebar">Sidebar</option>
              <option value="Footer">Footer</option>
              <option value="In-Article">In-Article</option>
            </select>
            <select
              value={newSlot.size}
              onChange={(e) => setNewSlot({ ...newSlot, size: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="728x90">Leaderboard (728x90)</option>
              <option value="300x250">Medium Rectangle (300x250)</option>
              <option value="320x50">Mobile Banner (320x50)</option>
              <option value="970x90">Wide Skyscraper (970x90)</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                Create
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-700 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ad Slots */}
      <Card>
        <CardHeader>
          <CardTitle>Active Ad Slots ({slots.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {slots.map((slot) => (
              <div key={slot.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-slate-500">Slot</p>
                    <p className="font-medium">{slot.name}</p>
                    <p className="text-xs text-slate-500">{slot.placement} • {slot.size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Impressions</p>
                    <p className="font-medium text-lg">{slot.impressions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Clicks</p>
                    <p className="font-medium text-lg">{slot.clicks.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">CTR</p>
                    <p className="font-medium text-lg">{slot.ctr.toFixed(2)}%</p>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button className="p-2 hover:bg-slate-200 rounded text-slate-600">
                    <Eye size={18} />
                  </button>
                  <button className="p-2 hover:bg-slate-200 rounded text-slate-600">
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(slot.id)}
                    className="p-2 hover:bg-red-100 rounded text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
