export type JobStatus =
  | 'saved'
  | 'awaiting_referral'
  | 'referred'
  | 'applied'
  | 'interviewing'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export type ConnectionStatus =
  | 'none'
  | 'sent'
  | 'accepted'
  | 'referral_given';

export type JobSource =
  | 'LinkedIn'
  | 'company site'
  | 'referral'
  | 'other';

export interface InterviewDateItem {
  id?: string;
  date: string; // YYYY-MM-DD
  note: string;
}

export interface Job {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  
  // Job details
  company: string;
  role: string;
  job_url?: string | null;
  location?: string | null;
  salary?: string | null;
  status: JobStatus;
  jd_text?: string | null;
  resume_version?: string | null;
  applied_on?: string | null; // YYYY-MM-DD
  source: JobSource | string;
  
  // Referral tracking
  referral_contact_name?: string | null;
  referral_contact_role?: string | null;
  referral_contact_linkedin_url?: string | null;
  connection_status: ConnectionStatus;
  connection_sent_on?: string | null; // YYYY-MM-DD
  next_followup_on?: string | null; // YYYY-MM-DD
  
  // Interview tracking & notes
  interview_dates: InterviewDateItem[];
  notes?: string | null;
}

export type JobInsert = Omit<Job, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type JobUpdate = Partial<JobInsert>;

export const STATUS_CONFIG: Record<
  JobStatus,
  {
    label: string;
    color: string;
    badgeBg: string;
    badgeText: string;
    border: string;
    columnBg: string;
  }
> = {
  saved: {
    label: 'Saved',
    color: 'text-slate-600 dark:text-slate-400',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-800',
    columnBg: 'bg-slate-50/70 dark:bg-slate-900/40',
  },
  awaiting_referral: {
    label: 'Awaiting Referral',
    color: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/70',
    badgeText: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-900/60',
    columnBg: 'bg-amber-50/40 dark:bg-amber-950/20',
  },
  referred: {
    label: 'Referred',
    color: 'text-indigo-600 dark:text-indigo-400',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-950/70',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-900/60',
    columnBg: 'bg-indigo-50/40 dark:bg-indigo-950/20',
  },
  applied: {
    label: 'Applied',
    color: 'text-blue-600 dark:text-blue-400',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/70',
    badgeText: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-900/60',
    columnBg: 'bg-blue-50/40 dark:bg-blue-950/20',
  },
  interviewing: {
    label: 'Interviewing',
    color: 'text-purple-600 dark:text-purple-400',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/70',
    badgeText: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-900/60',
    columnBg: 'bg-purple-50/40 dark:bg-purple-950/20',
  },
  offer: {
    label: 'Offer',
    color: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/70',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-900/60',
    columnBg: 'bg-emerald-50/40 dark:bg-emerald-950/20',
  },
  rejected: {
    label: 'Rejected',
    color: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-rose-100 dark:bg-rose-950/70',
    badgeText: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-900/60',
    columnBg: 'bg-rose-50/40 dark:bg-rose-950/20',
  },
  withdrawn: {
    label: 'Withdrawn',
    color: 'text-zinc-500 dark:text-zinc-400',
    badgeBg: 'bg-zinc-100 dark:bg-zinc-800',
    badgeText: 'text-zinc-700 dark:text-zinc-300',
    border: 'border-zinc-200 dark:border-zinc-800',
    columnBg: 'bg-zinc-50/40 dark:bg-zinc-900/20',
  },
};

export const ALL_STATUSES: JobStatus[] = [
  'saved',
  'awaiting_referral',
  'referred',
  'applied',
  'interviewing',
  'offer',
  'rejected',
  'withdrawn',
];

