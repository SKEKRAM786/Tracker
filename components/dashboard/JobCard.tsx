'use client';

import React, { useState } from 'react';
import { Job, JobStatus, STATUS_CONFIG, ALL_STATUSES } from '@/lib/types';
import {
  isWaitingFivePlusDays,
  getDaysDiff,
  formatShortDate,
} from '@/lib/date-utils';
import {
  Building2,
  MapPin,
  DollarSign,
  ExternalLink,
  UserCheck,
  AlertCircle,
  Clock,
  ChevronDown,
  Calendar,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface JobCardProps {
  job: Job;
  onClick: () => void;
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
}

export function JobCard({ job, onClick, onStatusChange }: JobCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const isAwaitingReferral = job.status === 'awaiting_referral';
  const hasSentConnection = job.connection_status === 'sent' && job.connection_sent_on;
  const daysWaiting = job.connection_sent_on ? getDaysDiff(job.connection_sent_on) : null;
  const needsFollowup = isWaitingFivePlusDays(job.connection_status, job.connection_sent_on);

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleStatusSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    onStatusChange(job.id, e.target.value as JobStatus);
  };

  const handleCopyJd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!job.jd_text) return;
    try {
      await navigator.clipboard.writeText(job.jd_text);
      setCopied(true);
      toast(`Copied JD for ${job.company}`, 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Failed to copy JD', 'error');
    }
  };

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-xl p-4 bg-white dark:bg-slate-900 border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${
        needsFollowup
          ? 'border-amber-400 dark:border-amber-500/80 ring-1 ring-amber-400/50 bg-amber-50/20 dark:bg-amber-950/10'
          : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Top row: Company, Role & Quick Move Dropdown */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {job.company}
            </h3>
            {job.job_url && (
              <a
                href={job.job_url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 p-0.5"
                title="Open job posting"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate mt-0.5">
            {job.role}
          </p>
        </div>

        {/* Status Dropdown */}
        <div className="shrink-0" onClick={handleDropdownClick}>
          <div className="relative inline-block text-left">
            <select
              value={job.status}
              onChange={handleStatusSelect}
              className="appearance-none text-[11px] font-medium pl-2.5 pr-6 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
              title="Change Status"
            >
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {STATUS_CONFIG[st].label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Meta tags: Location, Salary */}
      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        {job.location && (
          <span className="inline-flex items-center gap-1 truncate max-w-[130px]">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{job.location}</span>
          </span>
        )}
        {job.salary && (
          <span className="inline-flex items-center gap-1 truncate max-w-[140px] text-slate-700 dark:text-slate-300 font-medium">
            <DollarSign className="w-3 h-3 shrink-0 text-emerald-500" />
            <span className="truncate">{job.salary}</span>
          </span>
        )}
      </div>

      {/* Referral tracking highlight & badge */}
      {job.referral_contact_name && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 truncate">
              <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate font-medium">{job.referral_contact_name}</span>
              {job.referral_contact_linkedin_url && (
                <a
                  href={job.referral_contact_linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 shrink-0 p-0.5"
                  title="Open LinkedIn profile"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {hasSentConnection && daysWaiting !== null && (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0 ${
                  needsFollowup
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {needsFollowup && <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />}
                {needsFollowup ? `Follow up (${daysWaiting}d ago)` : `Sent ${daysWaiting}d ago`}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Upcoming interview tag if any */}
      {job.interview_dates && job.interview_dates.length > 0 && (
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2 py-1 rounded-md">
          <Calendar className="w-3 h-3 text-purple-500 shrink-0" />
          <span className="truncate">
            {job.interview_dates[job.interview_dates.length - 1].note} (
            {formatShortDate(job.interview_dates[job.interview_dates.length - 1].date)})
          </span>
        </div>
      )}

      {/* Footer: JD indicator & applied date */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-2">
          {job.jd_text && (
            <button
              type="button"
              onClick={handleCopyJd}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                copied
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
              title="Click to copy full JD text"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'JD'}</span>
            </button>
          )}
          {job.resume_version && (
            <span className="truncate max-w-[100px]" title={job.resume_version}>
              {job.resume_version}
            </span>
          )}
        </div>

        {job.applied_on && (
          <span>Applied {formatShortDate(job.applied_on)}</span>
        )}
      </div>
    </div>
  );
}

