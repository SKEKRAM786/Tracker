'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Job, STATUS_CONFIG, JobStatus } from '@/lib/types';
import { JobRepository } from '@/lib/storage';
import { CopyJdButton } from '@/components/jobs/CopyJdButton';
import { JobModal } from '@/components/jobs/JobModal';
import {
  formatFriendlyDate,
  formatShortDate,
  isWaitingFivePlusDays,
  getDaysDiff,
} from '@/lib/date-utils';
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  MapPin,
  DollarSign,
  Calendar,
  UserCheck,
  AlertCircle,
  FileText,
  Edit,
  Clock,
  Briefcase,
  ChevronRight,
  Share2,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  const loadJob = async () => {
    if (!id) return;
    setLoading(true);
    const found = await JobRepository.getJobById(id);
    setJob(found);
    setLoading(false);
  };

  useEffect(() => {
    loadJob();
  }, [id]);

  const handleUpdate = async (updates: any) => {
    if (!job) return;
    const updated = await JobRepository.updateJob(job.id, updates);
    if (updated) {
      setJob(updated);
      toast('Job updated successfully', 'success');
    }
  };

  const handleDelete = async (jobId: string) => {
    await JobRepository.deleteJob(jobId);
    toast('Job deleted', 'info');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Job Not Found</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
          This job may have been deleted or does not exist.
        </p>
        <Link
          href="/"
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-xs inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Board</span>
        </Link>
      </div>
    );
  }

  const config = STATUS_CONFIG[job.status];
  const needsFollowup = isWaitingFivePlusDays(job.connection_status, job.connection_sent_on);
  const daysWaiting = job.connection_sent_on ? getDaysDiff(job.connection_sent_on) : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Top Header / Breadcrumb */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Link href="/" className="hover:text-slate-800 dark:hover:text-slate-200">
                Jobs
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                {job.company}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CopyJdButton jdText={job.jd_text} />
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Job</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Hero Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {job.company}
                </h1>
                {job.job_url && (
                  <a
                    href={job.job_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    <span>View original posting</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <p className="text-base font-semibold text-slate-700 dark:text-slate-300 mt-1">
                {job.role}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${config.badgeBg} ${config.badgeText} ${config.border}`}
              >
                {config.label}
              </span>
            </div>
          </div>

          {/* Quick Details Badges */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800">
              <div className="text-[11px] font-medium text-slate-400">Location</div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{job.location || 'Not specified'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800">
              <div className="text-[11px] font-medium text-slate-400">Salary Range</div>
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 shrink-0" />
                <span>{job.salary || 'Not specified'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800">
              <div className="text-[11px] font-medium text-slate-400">Applied Date</div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{job.applied_on ? formatShortDate(job.applied_on) : 'Not yet'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800">
              <div className="text-[11px] font-medium text-slate-400">Resume Version</div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{job.resume_version || 'Default'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Section: Referral & Follow-up + Interviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Referral Card */}
          <div
            className={`rounded-2xl bg-white dark:bg-slate-900 border p-5 shadow-sm ${
              needsFollowup
                ? 'border-amber-400 dark:border-amber-500/80 ring-1 ring-amber-400/40'
                : 'border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Referral & Networking
                </h3>
              </div>
              {needsFollowup && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Follow up ({daysWaiting}d waiting)
                </span>
              )}
            </div>

            <div className="pt-3 space-y-2.5 text-xs">
              {job.referral_contact_name ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Contact:</span>
                    <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {job.referral_contact_name}
                      {job.referral_contact_linkedin_url && (
                        <a
                          href={job.referral_contact_linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-600 hover:text-brand-700"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </span>
                  </div>
                  {job.referral_contact_role && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Role:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {job.referral_contact_role}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Connection:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                      {job.connection_status.replace('_', ' ')}
                    </span>
                  </div>
                  {job.connection_sent_on && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Sent on:</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {formatFriendlyDate(job.connection_sent_on)} ({daysWaiting} days ago)
                      </span>
                    </div>
                  )}
                  {job.next_followup_on && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Next Follow-up:</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        {formatFriendlyDate(job.next_followup_on)}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-slate-400 italic py-2">
                  No referral contact assigned. Edit this job to track a referral.
                </p>
              )}
            </div>
          </div>

          {/* Interview Timeline Card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Interview Schedule
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {job.interview_dates?.length || 0} rounds
              </span>
            </div>

            <div className="pt-3 space-y-2.5">
              {!job.interview_dates || job.interview_dates.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  No interview rounds logged yet. Add dates when screening calls or technical rounds are scheduled.
                </p>
              ) : (
                job.interview_dates.map((round, idx) => (
                  <div
                    key={round.id || idx}
                    className="p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 flex items-start justify-between gap-2"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {round.note}
                      </h4>
                      <p className="text-[11px] text-purple-700 dark:text-purple-300 mt-0.5">
                        {formatFriendlyDate(round.date)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Full Pasted Job Description */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                Job Description
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pasted snapshot saved permanently for your interview preparation
              </p>
            </div>
            <CopyJdButton jdText={job.jd_text} />
          </div>

          <div className="pt-5">
            {job.jd_text ? (
              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans bg-slate-50/60 dark:bg-slate-950/40 p-5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                {job.jd_text}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                <p>No Job Description text was pasted for this position.</p>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="mt-2 text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                >
                  Edit job to paste JD
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Personal Strategy & Notes */}
        {job.notes && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Notes & Negotiation Strategy
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {job.notes}
            </p>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <JobModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          job={job}
          onSave={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

