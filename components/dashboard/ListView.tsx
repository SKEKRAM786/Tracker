'use client';

import React, { useState, useMemo } from 'react';
import { Job, JobStatus, STATUS_CONFIG, ALL_STATUSES } from '@/lib/types';
import {
  formatShortDate,
  formatFriendlyDate,
  isWaitingFivePlusDays,
  getDaysDiff,
} from '@/lib/date-utils';
import {
  ArrowUpDown,
  ExternalLink,
  ChevronDown,
  AlertCircle,
  FileText,
  Building2,
  Calendar,
  Filter,
} from 'lucide-react';

interface ListViewProps {
  jobs: Job[];
  onOpenJob: (job: Job) => void;
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
  onAddJobClick?: () => void;
}

type SortField = 'company' | 'role' | 'status' | 'applied_on' | 'created_at';
type SortOrder = 'asc' | 'desc';

export function ListView({
  jobs,
  onOpenJob,
  onStatusChange,
  onAddJobClick,
}: ListViewProps) {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchStatus =
        statusFilter === 'all' ? true : job.status === statusFilter;
      const matchCompany =
        !companyFilter ||
        job.company.toLowerCase().includes(companyFilter.toLowerCase()) ||
        job.role.toLowerCase().includes(companyFilter.toLowerCase());
      return matchStatus && matchCompany;
    });
  }, [jobs, statusFilter, companyFilter]);

  const sortedJobs = useMemo(() => {
    return [...filteredJobs].sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      switch (sortField) {
        case 'company':
          valA = a.company.toLowerCase();
          valB = b.company.toLowerCase();
          break;
        case 'role':
          valA = a.role.toLowerCase();
          valB = b.role.toLowerCase();
          break;
        case 'status':
          valA = a.status;
          valB = b.status;
          break;
        case 'applied_on':
          valA = a.applied_on ? new Date(a.applied_on).getTime() : 0;
          valB = b.applied_on ? new Date(b.applied_on).getTime() : 0;
          break;
        case 'created_at':
        default:
          valA = new Date(a.created_at).getTime();
          valB = new Date(b.created_at).getTime();
          break;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredJobs, sortField, sortOrder]);

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Table:</span>
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Statuses ({jobs.length})</option>
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st}>
                {STATUS_CONFIG[st].label} (
                {jobs.filter((j) => j.status === st).length})
              </option>
            ))}
          </select>

          {/* Filter company search */}
          <input
            type="text"
            placeholder="Filter by company or role..."
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 w-48 sm:w-60"
          />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing {sortedJobs.length} of {jobs.length} jobs
        </div>
      </div>

      {/* Table container */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/70 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <th
                  onClick={() => handleSort('company')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Company & Role</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Referral Contact</th>
                <th className="py-3 px-4">Location / Salary</th>
                <th
                  onClick={() => handleSort('applied_on')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Applied Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center justify-center">
                      <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        No jobs matched your filter
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                        Try resetting filters or add a new job application.
                      </p>
                      {onAddJobClick && (
                        <button
                          type="button"
                          onClick={onAddJobClick}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-brand-600 hover:bg-brand-700 text-white shadow-xs"
                        >
                          Add a job
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                sortedJobs.map((job) => {
                  const config = STATUS_CONFIG[job.status];
                  const needsFollowup = isWaitingFivePlusDays(
                    job.connection_status,
                    job.connection_sent_on
                  );
                  const daysWaiting = job.connection_sent_on
                    ? getDaysDiff(job.connection_sent_on)
                    : null;

                  return (
                    <tr
                      key={job.id}
                      onClick={() => onOpenJob(job)}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-850/60 transition-colors cursor-pointer ${
                        needsFollowup
                          ? 'bg-amber-50/30 dark:bg-amber-950/10'
                          : ''
                      }`}
                    >
                      {/* Company & Role */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2">
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{job.company}</span>
                              {job.job_url && (
                                <a
                                  href={job.job_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-slate-400 hover:text-brand-600"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                              {job.role}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block">
                          <select
                            value={job.status}
                            onChange={(e) =>
                              onStatusChange(job.id, e.target.value as JobStatus)
                            }
                            className={`appearance-none text-xs font-semibold pl-2.5 pr-6 py-1 rounded-full border cursor-pointer ${config.badgeBg} ${config.badgeText} ${config.border}`}
                          >
                            {ALL_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {STATUS_CONFIG[st].label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-2 pointer-events-none" />
                        </div>
                      </td>

                      {/* Referral Contact & Followup indicator */}
                      <td className="py-3.5 px-4">
                        {job.referral_contact_name ? (
                          <div>
                            <div className="font-medium text-slate-800 dark:text-slate-200">
                              {job.referral_contact_name}
                            </div>
                            {needsFollowup ? (
                              <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
                                <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                                Follow up ({daysWaiting}d waiting)
                              </span>
                            ) : job.connection_status === 'sent' && daysWaiting !== null ? (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                Sent {daysWaiting}d ago
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">
                                Status: {job.connection_status.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Location / Salary */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <div>{job.location || '—'}</div>
                        {job.salary && (
                          <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {job.salary}
                          </div>
                        )}
                      </td>

                      {/* Applied Date */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {job.applied_on ? formatShortDate(job.applied_on) : 'Not applied'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onOpenJob(job)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          View / Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

