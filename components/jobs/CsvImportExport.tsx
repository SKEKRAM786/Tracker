'use client';

import React, { useRef, useState } from 'react';
import { Job, JobInsert } from '@/lib/types';
import { JobRepository } from '@/lib/storage';
import { Download, Upload, Loader2, FileSpreadsheet, X, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface CsvImportExportProps {
  jobs: Job[];
  onImportCompleted: () => void;
}

export function CsvImportExport({ jobs, onImportCompleted }: CsvImportExportProps) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [parsedJobs, setParsedJobs] = useState<JobInsert[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleExport = () => {
    if (jobs.length === 0) {
      toast('No jobs to export', 'info');
      return;
    }

    const csvContent = JobRepository.exportToCsv(jobs);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.setAttribute('download', `job-applications-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast(`Exported ${jobs.length} jobs to CSV`, 'success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        try {
          const parsed = JobRepository.parseCsv(text);
          setParsedJobs(parsed);
          if (parsed.length === 0) {
            toast('No valid job rows found in CSV. Ensure company and role are present.', 'error');
          }
        } catch {
          toast('Failed to parse CSV file', 'error');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (parsedJobs.length === 0) return;

    try {
      setIsImporting(true);
      for (const item of parsedJobs) {
        await JobRepository.createJob(item);
      }
      toast(`Successfully imported ${parsedJobs.length} jobs!`, 'success');
      setIsImportModalOpen(false);
      setParsedJobs([]);
      setFileName('');
      onImportCompleted();
    } catch {
      toast('Failed while importing jobs', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          title="Export jobs to CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>

        <button
          type="button"
          onClick={() => setIsImportModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          title="Import jobs from CSV"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Import CSV</span>
        </button>
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Import Jobs from CSV
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setParsedJobs([]);
                  setFileName('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Upload a CSV file containing columns like <code className="text-brand-600 dark:text-brand-400 font-mono">company</code>, <code className="text-brand-600 dark:text-brand-400 font-mono">role</code>, <code className="text-brand-600 dark:text-brand-400 font-mono">job_url</code>, and <code className="text-brand-600 dark:text-brand-400 font-mono">jd_text</code>.
              </p>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  {fileName ? fileName : 'Click to choose a CSV file'}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Supports CSV exported from this app or custom sheets
                </span>
              </div>

              {parsedJobs.length > 0 && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Found {parsedJobs.length} valid jobs ready to import!</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setParsedJobs([]);
                  setFileName('');
                }}
                disabled={isImporting}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={parsedJobs.length === 0 || isImporting}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Importing...
                  </>
                ) : (
                  `Import ${parsedJobs.length > 0 ? `(${parsedJobs.length})` : ''}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

