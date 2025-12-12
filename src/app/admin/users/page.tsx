'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UserPlus, Trash2, Lock } from 'lucide-react';
import { useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  lastLogin: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      lastLogin: new Date(Date.now() - 30000).toISOString(),
    },
  ]);

  const [inviteEmail, setInviteEmail] = useState('');

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    alert(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this user?')) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-4xl font-bold">Users</h1>
        <p className="text-slate-600 mt-1">Manage admin and editor accounts</p>
      </div>

      {/* Invite User */}
      <Card>
        <CardHeader>
          <CardTitle>Invite New User</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="email@example.com"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleInvite}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <UserPlus size={20} />
              Invite
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{user.name}</h3>
                  <p className="text-sm text-slate-500">{user.email}</p>
                  <p className="text-xs text-slate-500">Last login: {new Date(user.lastLogin).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    defaultValue={user.role}
                    className="px-3 py-1 border border-slate-300 rounded text-sm"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                  </select>
                  <button className="p-2 hover:bg-slate-200 rounded text-slate-600">
                    <Lock size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
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
