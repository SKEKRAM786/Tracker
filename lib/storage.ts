'use client';

import { Job, JobInsert, JobUpdate } from './types';
import { INITIAL_SAMPLE_JOBS } from './sample-data';
import { createClient, isSupabaseConfigured } from './supabase/client';

const LOCAL_STORAGE_KEY = 'job_tracker_jobs_v1';
const LOCAL_USER_KEY = 'job_tracker_current_user_v1';

export interface AppUser {
  id: string;
  email: string;
}

export class JobRepository {
  private static getLocalJobs(): Job[] {
    if (typeof window === 'undefined') return INITIAL_SAMPLE_JOBS;
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_JOBS));
      return INITIAL_SAMPLE_JOBS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SAMPLE_JOBS;
    }
  }

  private static setLocalJobs(jobs: Job[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(jobs));
  }

  public static getCurrentUser(): AppUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    if (!raw) {
      const defaultUser: AppUser = {
        id: 'usr_me',
        email: 'me@jobtracker.local',
      };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(defaultUser));
      return defaultUser;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public static setCurrentUser(user: AppUser | null) {
    if (typeof window === 'undefined') return;
    if (!user) {
      localStorage.removeItem(LOCAL_USER_KEY);
    } else {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    }
  }

  /**
   * Fetch all jobs
   */
  public static async getJobs(): Promise<Job[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          // Normalize interview_dates
          return data.map((j) => ({
            ...j,
            interview_dates: Array.isArray(j.interview_dates)
              ? j.interview_dates
              : [],
          })) as Job[];
        }
      }
    }

    return this.getLocalJobs();
  }

  /**
   * Fetch a single job by ID
   */
  public static async getJobById(id: string): Promise<Job | null> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          return {
            ...data,
            interview_dates: Array.isArray(data.interview_dates)
              ? data.interview_dates
              : [],
          } as Job;
        }
      }
    }

    const local = this.getLocalJobs();
    return local.find((j) => j.id === id) || null;
  }

  /**
   * Create a new job
   */
  public static async createJob(jobData: JobInsert): Promise<Job> {
    const user = this.getCurrentUser();
    const newId =
      jobData.id ||
      (typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'job_' + Date.now());
    const now = new Date().toISOString();

    const newJob: Job = {
      ...jobData,
      id: newId,
      user_id: user?.id || 'usr_me',
      created_at: jobData.created_at || now,
      updated_at: now,
      interview_dates: jobData.interview_dates || [],
    };

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('jobs')
          .insert([
            {
              company: newJob.company,
              role: newJob.role,
              job_url: newJob.job_url,
              location: newJob.location,
              salary: newJob.salary,
              status: newJob.status,
              jd_text: newJob.jd_text,
              resume_version: newJob.resume_version,
              applied_on: newJob.applied_on || null,
              source: newJob.source,
              referral_contact_name: newJob.referral_contact_name,
              referral_contact_role: newJob.referral_contact_role,
              referral_contact_linkedin_url: newJob.referral_contact_linkedin_url,
              connection_status: newJob.connection_status,
              connection_sent_on: newJob.connection_sent_on || null,
              next_followup_on: newJob.next_followup_on || null,
              interview_dates: newJob.interview_dates,
              notes: newJob.notes,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          return {
            ...data,
            interview_dates: Array.isArray(data.interview_dates)
              ? data.interview_dates
              : [],
          } as Job;
        }
      }
    }

    // Local fallback
    const jobs = this.getLocalJobs();
    const updated = [newJob, ...jobs];
    this.setLocalJobs(updated);
    return newJob;
  }

  /**
   * Update an existing job
   */
  public static async updateJob(id: string, updates: JobUpdate): Promise<Job | null> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('jobs')
          .update({
            ...updates,
            updated_at: now,
          })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return {
            ...data,
            interview_dates: Array.isArray(data.interview_dates)
              ? data.interview_dates
              : [],
          } as Job;
        }
      }
    }

    // Local fallback
    const jobs = this.getLocalJobs();
    const index = jobs.findIndex((j) => j.id === id);
    if (index === -1) return null;

    const updatedJob: Job = {
      ...jobs[index],
      ...updates,
      updated_at: now,
    };
    jobs[index] = updatedJob;
    this.setLocalJobs([...jobs]);
    return updatedJob;
  }

  /**
   * Delete a job
   */
  public static async deleteJob(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase.from('jobs').delete().eq('id', id);
        if (!error) return true;
      }
    }

    const jobs = this.getLocalJobs();
    const filtered = jobs.filter((j) => j.id !== id);
    this.setLocalJobs(filtered);
    return true;
  }

  /**
   * Reset to initial sample jobs
   */
  public static resetSampleData(): Job[] {
    this.setLocalJobs(INITIAL_SAMPLE_JOBS);
    return INITIAL_SAMPLE_JOBS;
  }

  /**
   * Export all jobs to CSV string
   */
  public static exportToCsv(jobs: Job[]): string {
    const headers = [
      'id',
      'company',
      'role',
      'job_url',
      'location',
      'salary',
      'status',
      'applied_on',
      'source',
      'referral_contact_name',
      'referral_contact_role',
      'referral_contact_linkedin_url',
      'connection_status',
      'connection_sent_on',
      'next_followup_on',
      'interview_dates',
      'resume_version',
      'notes',
      'jd_text',
    ];

    const escapeCsv = (val: unknown): string => {
      if (val === null || val === undefined) return '""';
      if (typeof val === 'object') {
        const str = JSON.stringify(val);
        return `"${str.replace(/"/g, '""')}"`;
      }
      const str = String(val);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = jobs.map((job) => [
      escapeCsv(job.id),
      escapeCsv(job.company),
      escapeCsv(job.role),
      escapeCsv(job.job_url || ''),
      escapeCsv(job.location || ''),
      escapeCsv(job.salary || ''),
      escapeCsv(job.status),
      escapeCsv(job.applied_on || ''),
      escapeCsv(job.source || ''),
      escapeCsv(job.referral_contact_name || ''),
      escapeCsv(job.referral_contact_role || ''),
      escapeCsv(job.referral_contact_linkedin_url || ''),
      escapeCsv(job.connection_status || 'none'),
      escapeCsv(job.connection_sent_on || ''),
      escapeCsv(job.next_followup_on || ''),
      escapeCsv(job.interview_dates || []),
      escapeCsv(job.resume_version || ''),
      escapeCsv(job.notes || ''),
      escapeCsv(job.jd_text || ''),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  }

  /**
   * Parse CSV content and import jobs
   */
  public static parseCsv(csvText: string): JobInsert[] {
    const lines = parseCsvRows(csvText);
    if (lines.length < 2) return [];

    const headers = lines[0].map((h) => h.trim().toLowerCase());
    const jobsToInsert: JobInsert[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i];
      if (row.length === 0 || (row.length === 1 && !row[0].trim())) continue;

      const getCol = (name: string): string => {
        const idx = headers.indexOf(name.toLowerCase());
        return idx !== -1 && row[idx] ? row[idx].trim() : '';
      };

      const company = getCol('company');
      const role = getCol('role');
      if (!company || !role) continue; // Skip rows missing mandatory fields

      let interviewDates = [];
      try {
        const rawInterviews = getCol('interview_dates');
        if (rawInterviews) {
          const parsed = JSON.parse(rawInterviews);
          if (Array.isArray(parsed)) interviewDates = parsed;
        }
      } catch {
        interviewDates = [];
      }

      const validStatuses = [
        'saved',
        'awaiting_referral',
        'referred',
        'applied',
        'interviewing',
        'offer',
        'rejected',
        'withdrawn',
      ];
      const rawStatus = getCol('status').toLowerCase();
      const status = validStatuses.includes(rawStatus)
        ? (rawStatus as Job['status'])
        : 'saved';

      const validConnStatuses = ['none', 'sent', 'accepted', 'referral_given'];
      const rawConnStatus = getCol('connection_status').toLowerCase();
      const connectionStatus = validConnStatuses.includes(rawConnStatus)
        ? (rawConnStatus as Job['connection_status'])
        : 'none';

      jobsToInsert.push({
        company,
        role,
        job_url: getCol('job_url') || null,
        location: getCol('location') || null,
        salary: getCol('salary') || null,
        status,
        jd_text: getCol('jd_text') || null,
        resume_version: getCol('resume_version') || null,
        applied_on: getCol('applied_on') || null,
        source: getCol('source') || 'LinkedIn',
        referral_contact_name: getCol('referral_contact_name') || null,
        referral_contact_role: getCol('referral_contact_role') || null,
        referral_contact_linkedin_url: getCol('referral_contact_linkedin_url') || null,
        connection_status: connectionStatus,
        connection_sent_on: getCol('connection_sent_on') || null,
        next_followup_on: getCol('next_followup_on') || null,
        interview_dates: interviewDates,
        notes: getCol('notes') || null,
        user_id: 'usr_me',
      });
    }

    return jobsToInsert;
  }
}

/**
 * Robust RFC 4180 CSV parser handling multiline text, escapes and quotes
 */
function parseCsvRows(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let col = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        col += '"';
        i += 2;
        continue;
      } else if (char === '"') {
        inQuotes = false;
        i++;
        continue;
      } else {
        col += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (char === ',') {
        row.push(col);
        col = '';
        i++;
        continue;
      } else if (char === '\r' && nextChar === '\n') {
        row.push(col);
        col = '';
        result.push(row);
        row = [];
        i += 2;
        continue;
      } else if (char === '\n' || char === '\r') {
        row.push(col);
        col = '';
        result.push(row);
        row = [];
        i++;
        continue;
      } else {
        col += char;
        i++;
        continue;
      }
    }
  }

  if (col.length > 0 || row.length > 0) {
    row.push(col);
    result.push(row);
  }

  return result;
}

