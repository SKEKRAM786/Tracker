'use client';

import React, { useState } from 'react';
import { Job, JobStatus, ALL_STATUSES, STATUS_CONFIG } from '@/lib/types';
import { JobCard } from './JobCard';
import { Plus } from 'lucide-react';

interface BoardViewProps {
  jobs: Job[];
  onOpenJob: (job: Job) => void;
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
  onAddNewToStatus?: (status: JobStatus) => void;
}

export function BoardView({
  jobs,
  onOpenJob,
  onStatusChange,
  onAddNewToStatus,
}: BoardViewProps) {
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<JobStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, jobId: string) => {
    e.dataTransfer.setData('text/plain', jobId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedJobId(jobId);
  };

  const handleDragOver = (e: React.DragEvent, status: JobStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: JobStatus) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('text/plain') || draggedJobId;
    setDragOverColumn(null);
    setDraggedJobId(null);
    if (jobId) {
      onStatusChange(jobId, status);
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
      <div className="flex gap-4 min-w-[1280px] lg:min-w-0">
        {ALL_STATUSES.map((status) => {
          const columnJobs = jobs.filter((j) => j.status === status);
          const config = STATUS_CONFIG[status];
          const isDragTarget = dragOverColumn === status;

          return (
            <div
              key={status}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
              className={`flex-1 min-w-[280px] max-w-[320px] rounded-2xl flex flex-col transition-all duration-150 ${
                config.columnBg
              } border ${
                isDragTarget
                  ? 'border-brand-500 ring-2 ring-brand-500/30'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {/* Column Header */}
              <div className="p-3.5 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      status === 'saved'
                        ? 'bg-slate-400'
                        : status === 'awaiting_referral'
                        ? 'bg-amber-500'
                        : status === 'referred'
                        ? 'bg-indigo-500'
                        : status === 'applied'
                        ? 'bg-blue-500'
                        : status === 'interviewing'
                        ? 'bg-purple-500'
                        : status === 'offer'
                        ? 'bg-emerald-500'
                        : status === 'rejected'
                        ? 'bg-rose-500'
                        : 'bg-zinc-400'
                    }`}
                  />
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {config.label}
                  </h3>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-2xs">
                    {columnJobs.length}
                  </span>
                </div>

                {onAddNewToStatus && (
                  <button
                    type="button"
                    onClick={() => onAddNewToStatus(status)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800"
                    title={`Add job to ${config.label}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Cards Container */}
              <div className="p-2.5 flex-1 space-y-2.5 min-h-[160px] overflow-y-auto max-h-[calc(100vh-280px)]">
                {columnJobs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      No jobs in {config.label.toLowerCase()}
                    </p>
                  </div>
                ) : (
                  columnJobs.map((job) => (
                    <div
                      key={job.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, job.id)}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <JobCard
                        job={job}
                        onClick={() => onOpenJob(job)}
                        onStatusChange={onStatusChange}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

