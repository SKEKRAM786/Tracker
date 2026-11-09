'use client';

import React, { useState, useEffect } from 'react';
import {
  Job,
  JobInsert,
  JobStatus,
  ConnectionStatus,
  ALL_STATUSES,
  STATUS_CONFIG,
  InterviewDateItem,
} from '@/lib/types';
import { jobFormSchema } from '@/lib/validations';
import { InterviewDatesEditor } from './InterviewDatesEditor';
import {
  X,
  Briefcase,
  UserPlus,
  Calendar,
  FileText,
  AlertCircle,
  Loader2,
  Trash2,
} from 'lucide-react';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job?: Job | null; // null if adding new
  initialStatus?: JobStatus;
  onSave: (data: JobInsert) => Promise<void>;
  onDelete?: (jobId: string) => Promise<void>;
}

export function JobModal({
  isOpen,
  onClose,
  job,
  initialStatus,
  onSave,
  onDelete,
}: JobModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'referral' | 'interviews' | 'jd'>('details');

  // Form states
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [status, setStatus] = useState<JobStatus>('saved');
  const [source, setSource] = useState('LinkedIn');
  const [appliedOn, setAppliedOn] = useState('');
  const [resumeVersion, setResumeVersion] = useState('');

  // Referral
  const [referralContactName, setReferralContactName] = useState('');
  const [referralContactRole, setReferralContactRole] = useState('');
  const [referralContactLinkedinUrl, setReferralContactLinkedinUrl] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('none');
  const [connectionSentOn, setConnectionSentOn] = useState('');
  const [nextFollowupOn, setNextFollowupOn] = useState('');

  // Interviews & notes
  const [interviewDates, setInterviewDates] = useState<InterviewDateItem[]>([]);
  const [notes, setNotes] = useState('');
  const [jdText, setJdText] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (job) {
      setCompany(job.company || '');
      setRole(job.role || '');
      setJobUrl(job.job_url || '');
      setLocation(job.location || '');
      setSalary(job.salary || '');
      setStatus(job.status || 'saved');
      setSource(job.source || 'LinkedIn');
      setAppliedOn(job.applied_on || '');
      setResumeVersion(job.resume_version || '');

      setReferralContactName(job.referral_contact_name || '');
      setReferralContactRole(job.referral_contact_role || '');
      setReferralContactLinkedinUrl(job.referral_contact_linkedin_url || '');
      setConnectionStatus(job.connection_status || 'none');
      setConnectionSentOn(job.connection_sent_on || '');
      setNextFollowupOn(job.next_followup_on || '');

      setInterviewDates(job.interview_dates || []);
      setNotes(job.notes || '');
      setJdText(job.jd_text || '');
    } else {
      // New Job defaults
      setCompany('');
      setRole('');
      setJobUrl('');
      setLocation('');
      setSalary('');
      setStatus(initialStatus || 'saved');
      setSource('LinkedIn');
      setAppliedOn('');
      setResumeVersion('');

      setReferralContactName('');
      setReferralContactRole('');
      setReferralContactLinkedinUrl('');
      setConnectionStatus('none');
      setConnectionSentOn('');
      setNextFollowupOn('');

      setInterviewDates([]);
      setNotes('');
      setJdText('');
    }
    setErrors({});
    setActiveTab('details');
  }, [job, initialStatus, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      company: company.trim(),
      role: role.trim(),
      job_url: jobUrl.trim() || null,
      location: location.trim() || null,
      salary: salary.trim() || null,
      status,
      source,
      applied_on: appliedOn || null,
      resume_version: resumeVersion.trim() || null,
      referral_contact_name: referralContactName.trim() || null,
      referral_contact_role: referralContactRole.trim() || null,
      referral_contact_linkedin_url: referralContactLinkedinUrl.trim() || null,
      connection_status: connectionStatus,
      connection_sent_on: connectionSentOn || null,
      next_followup_on: nextFollowupOn || null,
      interview_dates: interviewDates,
      notes: notes.trim() || null,
      jd_text: jdText.trim() || null,
    };

    const result = jobFormSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      // Switch to tab where error is located
      if (fieldErrors.company || fieldErrors.role || fieldErrors.job_url) {
        setActiveTab('details');
      } else if (fieldErrors.referral_contact_linkedin_url) {
        setActiveTab('referral');
      }
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        ...result.data,
        id: job?.id,
        user_id: job?.user_id || 'usr_me',
      });
      onClose();
    } catch {
      setErrors({ form: 'Failed to save job. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!job || !onDelete) return;
    if (confirm(`Are you sure you want to delete "${job.company} - ${job.role}"?`)) {
      try {
        setIsDeleting(true);
        await onDelete(job.id);
        onClose();
      } catch {
        alert('Failed to delete job');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/70">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {job ? `Edit Job Application` : `Add Job Application`}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {job ? `${job.company} — ${job.role}` : 'Track another opportunity with full details'}
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'details'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Job Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('referral')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'referral'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Referral & Follow-up</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('interviews')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'interviews'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Interviews</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('jd')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'jd'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Job Description & Notes</span>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errors.form && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Stripe"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className={`w-full text-xs px-3 py-2 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                      errors.company
                        ? 'border-rose-400 ring-1 ring-rose-400'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.company && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.company}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role / Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Software Engineer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className={`w-full text-xs px-3 py-2 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                      errors.role
                        ? 'border-rose-400 ring-1 ring-rose-400'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.role && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.role}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as JobStatus)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {ALL_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {STATUS_CONFIG[st].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Source
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="company site">Company Site</option>
                    <option value="referral">Referral</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Remote / New York"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $180k - $210k"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Resume Version
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Resume_v3_FullStack.pdf"
                    value={resumeVersion}
                    onChange={(e) => setResumeVersion(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Job Posting URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://company.com/jobs/..."
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className={`w-full text-xs px-3 py-2 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                      errors.job_url
                        ? 'border-rose-400 ring-1 ring-rose-400'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.job_url && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.job_url}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Applied On Date
                  </label>
                  <input
                    type="date"
                    value={appliedOn}
                    onChange={(e) => setAppliedOn(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REFERRAL & FOLLOW-UP */}
          {activeTab === 'referral' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300">
                Tracking connections ensures you never forget to follow up! If a connection request is waiting 5+ days, it will be automatically highlighted on your board.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Referral Contact Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Chen"
                    value={referralContactName}
                    onChange={(e) => setReferralContactName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Role at Company
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Staff Software Engineer"
                    value={referralContactRole}
                    onChange={(e) => setReferralContactRole(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contact LinkedIn URL
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={referralContactLinkedinUrl}
                  onChange={(e) => setReferralContactLinkedinUrl(e.target.value)}
                  className={`w-full text-xs px-3 py-2 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                    errors.referral_contact_linkedin_url
                      ? 'border-rose-400 ring-1 ring-rose-400'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {errors.referral_contact_linkedin_url && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.referral_contact_linkedin_url}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Connection Status
                  </label>
                  <select
                    value={connectionStatus}
                    onChange={(e) => setConnectionStatus(e.target.value as ConnectionStatus)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="none">None</option>
                    <option value="sent">Connection Sent</option>
                    <option value="accepted">Accepted</option>
                    <option value="referral_given">Referral Given</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Connection Sent Date
                  </label>
                  <input
                    type="date"
                    value={connectionSentOn}
                    onChange={(e) => setConnectionSentOn(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Next Follow-up Due
                  </label>
                  <input
                    type="date"
                    value={nextFollowupOn}
                    onChange={(e) => setNextFollowupOn(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INTERVIEWS */}
          {activeTab === 'interviews' && (
            <div className="space-y-4">
              <InterviewDatesEditor
                items={interviewDates}
                onChange={setInterviewDates}
              />
            </div>
          )}

          {/* TAB 4: JD & NOTES */}
          {activeTab === 'jd' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Full Job Description (Paste JD)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Never lose requirements when the posting expires
                  </span>
                </div>
                <textarea
                  rows={8}
                  placeholder="Paste the full JD text here..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Personal Notes / Strategy / Salary Discussion
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Spoke with recruiter about remote flexibility; highlight distributed systems project..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            {job && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  job ? 'Update Job' : 'Add Job'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

