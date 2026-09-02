'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Search, Briefcase, Shield } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';
import Header from '@/components/shared/Header';

interface PendingUser {
  id: string;
  name: string;
  role: 'worker' | 'recruiter';
  phone: string;
  wilaya: string;
  status: 'pending' | 'approved' | 'rejected';
}

const ALL_USERS: PendingUser[] = [
  { id: 'p1', name: 'Yacine Khelifi', role: 'recruiter', phone: '0555111222', wilaya: '16', status: 'pending' },
  { id: 'p2', name: 'Nassim Boudiaf', role: 'worker', phone: '0666333444', wilaya: '19', status: 'pending' },
  { id: 'p3', name: 'Lina Ferhat', role: 'recruiter', phone: '0777555666', wilaya: '31', status: 'pending' },
  { id: 'a1', name: 'Ahmed Bouzid', role: 'worker', phone: '0555123456', wilaya: '16', status: 'approved' },
  { id: 'a2', name: 'Mohamed Benali', role: 'recruiter', phone: '0666123456', wilaya: '16', status: 'approved' },
  { id: 'r1', name: 'Karim Hadj', role: 'worker', phone: '0777456789', wilaya: '25', status: 'rejected' },
];

export default function UsersContent() {
  const { lang } = useLanguage();
  const [users, setUsers] = useState(ALL_USERS);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter((u) => {
    const matchesFilter = filter === 'all' || u.status === filter;
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);
    return matchesFilter && matchesSearch;
  });

  const handleAction = (userId: string, action: 'approved' | 'rejected') => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: action } : u))
    );
  };

  const counts = {
    all: users.length,
    pending: users.filter((u) => u.status === 'pending').length,
    approved: users.filter((u) => u.status === 'approved').length,
    rejected: users.filter((u) => u.status === 'rejected').length,
  };

  return (
    <div className="page-container">
      <Header title={t(lang, 'userManagement')} showBack />

      <main className="max-w-lg mx-auto px-4 pb-8">
        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-text-muted/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t(lang, 'searchPlaceholder')}
            className="input-field ps-10"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 p-1 bg-surface rounded-xl mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-mint text-midnight'
                   : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {f === 'all' ? t(lang, 'viewAll') : t(lang, f)}
              <span className="ms-1 text-[10px]">({counts[f]})</span>
            </button>
          ))}
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div key={user.id} className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  user.role === 'worker' ? 'bg-mint/10' : 'bg-blue-500/10'
                }`}>
                  {user.role === 'worker' ? (
                    <Briefcase size={18} className="text-mint" />
                  ) : (
                    <Shield size={18} className="text-blue-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-text-primary font-semibold text-sm">{user.name}</h3>
                    <span className={`badge text-[10px] ${
                      user.status === 'pending'
                        ? 'bg-warning/15 text-warning'
                        : user.status === 'approved'
                        ? 'bg-mint/15 text-mint'
                        : 'bg-danger/15 text-danger'
                    }`}>
                      {t(lang, user.status)}
                    </span>
                  </div>
                  <p className="text-text-secondary text-xs">
                    {user.role === 'worker' ? t(lang, 'worker') : t(lang, 'recruiter')} · {user.phone}
                  </p>
                </div>
              </div>

              {user.status === 'pending' && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleAction(user.id, 'approved')}
                    className="btn-mint flex-1 flex items-center justify-center gap-1.5 py-2 text-xs"
                  >
                    <CheckCircle size={14} />
                    {t(lang, 'approve')}
                  </button>
                  <button
                    onClick={() => handleAction(user.id, 'rejected')}
                    className="bg-danger/10 text-danger rounded-xl flex-1 flex items-center justify-center gap-1.5 py-2 text-xs active:scale-95 transition-all"
                  >
                    <XCircle size={14} />
                    {t(lang, 'reject')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
