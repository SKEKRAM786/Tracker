'use client';

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Job, JobInsert, JobStatus } from '@/lib/types';
import { JobRepository, AppUser } from '@/lib/storage';
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client';
import { BoardView } from '@/components/dashboard/BoardView';
import { ListView } from '@/components/dashboard/ListView';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { TodayPanel } from '@/components/dashboard/TodayPanel';
import { QuickAddModal } from '@/components/jobs/QuickAddModal';
import { JobModal } from '@/components/jobs/JobModal';
import { CsvImportExport } from '@/components/jobs/CsvImportExport';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useToast } from '@/components/ui/Toast';
import {
  Briefcase,
  LayoutGrid,
  List,
  Search,
  Plus,
  Zap,
  Sparkles,
  LogOut,
  LogIn,
  RotateCcw,
  X,
  Filter,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // User state
  const [user, setUser] = useState<AppUser | null>(null);

  // Modals
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isFullModalOpen, setIsFullModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [initialStatusForModal, setInitialStatusForModal] = useState<JobStatus>('saved');

  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Load jobs and user
  const fetchAllJobs = async () => {
    try {
      const data = await JobRepository.getJobs();
      setJobs(data);
    } catch {
      toast('Failed to load jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check user
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        supabase.auth.getUser().then(({ data }) => {
          if (data.user) {
            setUser({
              id: data.user.id,
              email: data.user.email || '',
            });
          } else {
            setUser(null);
          }
        });
      }
    } else {
      setUser(JobRepository.getCurrentUser());
    }

    fetchAllJobs();
  }, []);

  const handleSignOut = async () => {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    JobRepository.setCurrentUser(null);
    setUser(null);
    toast('Signed out', 'info');
    router.refresh();
  };

  // Optimistic status change
  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    const previousJobs = [...jobs];
    // Optimistically update
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );

    try {
      const updated = await JobRepository.updateJob(jobId, { status: newStatus });
      if (!updated) {
        setJobs(previousJobs);
        toast('Failed to update status', 'error');
      } else {
        toast(`Moved to ${newStatus.replace('_', ' ')}`, 'success');
      }
    } catch {
      setJobs(previousJobs);
      toast('Network error updating status', 'error');
    }
  };

  // Create Job (from full modal or quick add)
  const handleSaveJob = async (jobData: JobInsert) => {
    if (selectedJob) {
      // Editing
      const previousJobs = [...jobs];
      setJobs((prev) =>
        prev.map((j) =>
          j.id === selectedJob.id ? ({ ...j, ...jobData } as Job) : j
        )
      );
      try {
        const updated = await JobRepository.updateJob(selectedJob.id, jobData);
        if (updated) {
          toast('Job updated', 'success');
          fetchAllJobs();
        } else {
          setJobs(previousJobs);
          toast('Failed to save update', 'error');
        }
      } catch {
        setJobs(previousJobs);
        toast('Error saving job', 'error');
      }
    } else {
      // Adding new
      try {
        const created = await JobRepository.createJob(jobData);
        setJobs((prev) => [created, ...prev]);
        toast(`Added ${created.company} (${created.role})`, 'success');
      } catch {
        toast('Failed to create job', 'error');
      }
    }
  };

  // Delete Job
  const handleDeleteJob = async (jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    await JobRepository.deleteJob(jobId);
    toast('Job deleted', 'info');
  };

  // Clear all jobs
  const handleClearAll = () => {
    if (confirm('Clear all jobs from your tracker?')) {
      const empty = JobRepository.clearAllJobs();
      setJobs(empty);
      toast('All jobs cleared', 'info');
    }
  };

  // Filtered jobs by Search and Stats status filter
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Filter by status if selected from stats row
      if (statusFilter && job.status !== statusFilter) {
        return false;
      }

      // Search across company, role, contact name and JD text
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inCompany = job.company.toLowerCase().includes(query);
        const inRole = job.role.toLowerCase().includes(query);
        const inContact = job.referral_contact_name
          ? job.referral_contact_name.toLowerCase().includes(query)
          : false;
        const inJd = job.jd_text
          ? job.jd_text.toLowerCase().includes(query)
          : false;

        return inCompany || inRole || inContact || inJd;
      }

      return true;
    });
  }, [jobs, searchQuery, statusFilter]);

  const openAddModalForStatus = (status: JobStatus) => {
    setSelectedJob(null);
    setInitialStatusForModal(status);
    setIsFullModalOpen(true);
  };

  const openEditModal = (job: Job) => {
    setSelectedJob(job);
    setIsFullModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & App Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                  JobTracker
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Personal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">
                All applications &bull; JD archive &bull; Referral alerts
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* CSV Export & Import */}
            <CsvImportExport jobs={jobs} onImportCompleted={fetchAllJobs} />

            {/* Clear all jobs button */}
            {jobs.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Clear all jobs"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Quick Add (<10s) */}
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-xs inline-flex items-center gap-1.5 transition-colors"
              title="Quick save in under 10 seconds"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Quick Add (&lt;10s)</span>
            </button>

            {/* Full Add Job */}
            <button
              type="button"
              onClick={() => {
                setSelectedJob(null);
                setInitialStatusForModal('saved');
                setIsFullModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-xs inline-flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Job</span>
            </button>

            {/* User Account / Auth */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 hidden md:inline truncate max-w-[120px]">
                  {user.email}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Sign in"
              >
                <LogIn className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* 1. Today Action Panel */}
        <TodayPanel
          jobs={jobs}
          onOpenJob={openEditModal}
          onUpdateJobStatus={handleStatusChange}
        />

        {/* 2. Stats Row (Click to filter) */}
        <StatsRow
          jobs={jobs}
          activeFilter={statusFilter}
          onSelectFilter={setStatusFilter}
        />

        {/* 3. Controls Bar: Search, Status Filter badge, Board/List Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search company, role, contact or JD text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm pl-10 pr-9 py-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            {/* Active filter badge if any */}
            {statusFilter && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-xs text-brand-700 dark:text-brand-300 font-medium">
                <span>Filter: {statusFilter.replace('_', ' ')}</span>
                <button
                  type="button"
                  onClick={() => setStatusFilter(null)}
                  className="hover:text-brand-900 dark:hover:text-brand-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Board / List Toggle */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === 'board'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Board</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. Main View (Board or List) */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Loading your applications...</p>
          </div>
        ) : filteredJobs.length === 0 && jobs.length === 0 ? (
          /* Empty State when no jobs at all */
          <div className="py-20 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-8 max-w-lg mx-auto">
            <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No jobs yet. Add your first one.
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6 max-w-sm mx-auto">
              Save job descriptions permanently, track referrals so you don&apos;t forget to follow up, and monitor your interview stages.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm inline-flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Quick Add (&lt;10s)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedJob(null);
                  setInitialStatusForModal('saved');
                  setIsFullModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Full Job Details</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            {viewMode === 'board' ? (
              <BoardView
                jobs={filteredJobs}
                onOpenJob={openEditModal}
                onStatusChange={handleStatusChange}
                onAddNewToStatus={openAddModalForStatus}
              />
            ) : (
              <ListView
                jobs={filteredJobs}
                onOpenJob={openEditModal}
                onStatusChange={handleStatusChange}
                onAddJobClick={() => {
                  setSelectedJob(null);
                  setIsFullModalOpen(true);
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* Floating Action Button (Mobile-first prominent button) */}
      <div className="fixed bottom-6 right-6 z-40 sm:hidden">
        <button
          type="button"
          onClick={() => setIsQuickAddOpen(true)}
          className="w-14 h-14 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-xl flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-brand-500/30"
          title="Quick Add Job"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Quick Add Modal */}
      {isQuickAddOpen && (
        <QuickAddModal
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          onSave={handleSaveJob}
        />
      )}

      {/* Full Add / Edit Modal */}
      {isFullModalOpen && (
        <JobModal
          isOpen={isFullModalOpen}
          onClose={() => {
            setIsFullModalOpen(false);
            setSelectedJob(null);
          }}
          job={selectedJob}
          initialStatus={initialStatusForModal}
          onSave={handleSaveJob}
          onDelete={handleDeleteJob}
        />
      )}
    </div>
  );
}

