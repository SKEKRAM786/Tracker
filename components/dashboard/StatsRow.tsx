'use client';

import { Job } from '@/lib/types';
import { Bookmark, Clock, Send, Users, Trophy } from 'lucide-react';

interface StatsRowProps {
  jobs: Job[];
  activeFilter?: string | null;
  onSelectFilter?: (status: string | null) => void;
}

export function StatsRow({ jobs, activeFilter, onSelectFilter }: StatsRowProps) {
  const savedCount = jobs.filter((j) => j.status === 'saved').length;
  const waitingReferralCount = jobs.filter((j) => j.status === 'awaiting_referral').length;
  const appliedCount = jobs.filter((j) => j.status === 'applied' || j.status === 'referred').length;
  const interviewingCount = jobs.filter((j) => j.status === 'interviewing').length;
  const offerCount = jobs.filter((j) => j.status === 'offer').length;

  const stats = [
    {
      id: 'saved',
      label: 'Saved',
      count: savedCount,
      icon: Bookmark,
      color: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-100 dark:bg-slate-800/60',
      activeBorder: 'border-slate-400 dark:border-slate-500',
    },
    {
      id: 'awaiting_referral',
      label: 'Waiting on Referral',
      count: waitingReferralCount,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      activeBorder: 'border-amber-500',
      isAmber: true,
    },
    {
      id: 'applied',
      label: 'Applied',
      count: appliedCount,
      icon: Send,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      activeBorder: 'border-blue-500',
    },
    {
      id: 'interviewing',
      label: 'Interviewing',
      count: interviewingCount,
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      activeBorder: 'border-purple-500',
    },
    {
      id: 'offer',
      label: 'Offers',
      count: offerCount,
      icon: Trophy,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      activeBorder: 'border-emerald-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((s) => {
        const Icon = s.icon;
        const isActive = activeFilter === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelectFilter?.(isActive ? null : s.id)}
            className={`flex items-center gap-3 p-3.5 rounded-xl border bg-white dark:bg-slate-900 text-left transition-all hover:shadow-sm ${
              isActive
                ? `${s.activeBorder} ring-2 ring-brand-500/20 shadow-sm`
                : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className={`p-2 rounded-lg ${s.bg} shrink-0`}>
              <Icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="min-w-0">
              <div className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {s.count}
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                {s.label}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

