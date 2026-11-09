'use client';

import React, { useState } from 'react';
import { quickAddSchema, QuickAddFormValues } from '@/lib/validations';
import { JobInsert } from '@/lib/types';
import { X, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: JobInsert) => Promise<void>;
}

export function QuickAddModal({ isOpen, onClose, onSave }: QuickAddModalProps) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [jdText, setJdText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = quickAddSchema.safeParse({
      company,
      role,
      job_url: jobUrl.trim() || null,
      jd_text: jdText,
      status: 'saved',
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        company: result.data.company,
        role: result.data.role,
        job_url: result.data.job_url || null,
        jd_text: result.data.jd_text || null,
        status: 'saved',
        source: 'LinkedIn',
        connection_status: 'none',
        interview_dates: [],
        user_id: 'usr_me',
      });
      // Reset
      setCompany('');
      setRole('');
      setJobUrl('');
      setJdText('');
      onClose();
    } catch {
      setErrors({ form: 'Failed to save job. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-base text-slate-900 dark:text-white">
                Quick Save Job
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Save in under 10 seconds. You can fill in the rest later.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {errors.form && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Stripe, OpenAI"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className={`w-full text-sm px-3 py-2 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  errors.company
                    ? 'border-rose-400 ring-1 ring-rose-400'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.company && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.company}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Role / Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Eng"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`w-full text-sm px-3 py-2 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  errors.role
                    ? 'border-rose-400 ring-1 ring-rose-400'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.role && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.role}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Job URL
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              className={`w-full text-sm px-3 py-2 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                errors.job_url
                  ? 'border-rose-400 ring-1 ring-rose-400'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            />
            {errors.job_url && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.job_url}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Job Description (Paste JD) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Kept permanently even if post closes
              </span>
            </div>
            <textarea
              rows={6}
              placeholder="Paste full job description text here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              className={`w-full text-xs font-mono px-3 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y leading-relaxed ${
                errors.jd_text
                  ? 'border-rose-400 ring-1 ring-rose-400'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            />
            {errors.jd_text && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.jd_text}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
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
                'Save Job (<10s)'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

