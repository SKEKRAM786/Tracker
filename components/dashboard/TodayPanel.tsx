'use client';

import { useState } from 'react';
import { Job } from '@/lib/types';
import {
  isFollowupDue,
  isInterviewInNext7Days,
  isStaleSavedJob,
  formatFriendlyDate,
  formatShortDate,
  getDaysDiff,
} from '@/lib/date-utils';
import {
  Calendar,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

interface TodayPanelProps {
  jobs: Job[];
  onOpenJob: (job: Job) => void;
  onUpdateJobStatus?: (jobId: string, newStatus: Job['status']) => void;
  onDismissFollowup?: (job: Job) => void;
}

export function TodayPanel({ jobs, onOpenJob, onUpdateJobStatus, onDismissFollowup }: TodayPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // 1. Follow-ups due (next_followup_on is today or overdue)
  const followupsDue = jobs.filter((j) => isFollowupDue(j.next_followup_on));

  // 2. Interviews in the next 7 days
  const upcomingInterviews: { job: Job; date: string; note: string }[] = [];
  jobs.forEach((job) => {
    if (Array.isArray(job.interview_dates)) {
      job.interview_dates.forEach((item) => {
        if (isInterviewInNext7Days(item.date)) {
          upcomingInterviews.push({
            job,
            date: item.date,
            note: item.note,
          });
        }
      });
    }
  });
  // Sort interviews chronologically
  upcomingInterviews.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 3. Jobs saved but not applied to for 7+ days
  const staleSavedJobs = jobs.filter((j) => isStaleSavedJob(j.status, j.created_at));

  const totalActionItems =
    followupsDue.length + upcomingInterviews.length + staleSavedJobs.length;

  if (totalActionItems === 0) {
    return (
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-900 dark:text-white">Today&apos;s Focus:</span>
            <span>You&apos;re completely caught up! No overdue follow-ups or pending actions.</span>
          </div>
          <span className="text-xs font-medium text-slate-400">0 pending</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all">
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-5 py-3.5 bg-slate-50/80 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800 cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-xs">
            {totalActionItems}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              Today&apos;s Action Items
              {followupsDue.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800">
                  {followupsDue.length} follow-up{followupsDue.length > 1 ? 's' : ''}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interviews this week, connections needing attention, and stale saved jobs
            </p>
          </div>
        </div>

        <button
          type="button"
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          aria-label={isExpanded ? 'Collapse Today panel' : 'Expand Today panel'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Follow-ups due */}
          <div className="rounded-xl p-3.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Follow-ups Due ({followupsDue.length})
                </span>
              </div>

              {followupsDue.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-2">
                  No follow-ups due today.
                </p>
              ) : (
                <div className="space-y-2 mt-2">
                  {followupsDue.map((job) => {
                    const daysAgo = job.connection_sent_on
                      ? getDaysDiff(job.connection_sent_on)
                      : null;
                    return (
                      <div
                        key={job.id}
                        className="p-2.5 rounded-lg bg-white dark:bg-slate-900/90 border border-amber-200/80 dark:border-amber-900/50 shadow-xs hover:border-amber-400 transition-all cursor-pointer"
                        onClick={() => onOpenJob(job)}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {job.company}
                          </h4>
                          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                            Due {formatShortDate(job.next_followup_on)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5">
                          {job.referral_contact_name
                            ? `Contact: ${job.referral_contact_name}${daysAgo !== null ? ` (sent ${daysAgo}d ago)` : ''}`
                            : job.role}
                        </p>
                        {job.notes && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-1 italic">
                            &ldquo;{job.notes}&rdquo;
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Interviews in next 7 days */}
          <div className="rounded-xl p-3.5 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-900/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  Upcoming Interviews ({upcomingInterviews.length})
                </span>
              </div>

              {upcomingInterviews.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-2">
                  No interviews scheduled in the next 7 days.
                </p>
              ) : (
                <div className="space-y-2 mt-2">
                  {upcomingInterviews.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white dark:bg-slate-900/90 border border-purple-200/80 dark:border-purple-900/50 shadow-xs hover:border-purple-400 transition-all cursor-pointer"
                      onClick={() => onOpenJob(item.job)}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.job.company}
                        </h4>
                        <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 whitespace-nowrap bg-purple-100 dark:bg-purple-900/50 px-1.5 py-0.5 rounded">
                          {formatShortDate(item.date)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate mt-0.5">
                        {item.note || item.job.role}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Stale Saved Jobs (>7 days) */}
          <div className="rounded-xl p-3.5 bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
                  Saved 7+ Days Ago ({staleSavedJobs.length})
                </span>
              </div>

              {staleSavedJobs.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-2">
                  All saved jobs have been applied to recently!
                </p>
              ) : (
                <div className="space-y-2 mt-2">
                  {staleSavedJobs.map((job) => {
                    const daysOld = getDaysDiff(job.created_at);
                    return (
                      <div
                        key={job.id}
                        className="p-2.5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-brand-400 transition-all cursor-pointer flex items-center justify-between"
                        onClick={() => onOpenJob(job)}
                      >
                        <div className="min-w-0 pr-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {job.company}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {job.role} &bull; saved {daysOld}d ago
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

