import { z } from 'zod';

export const jobStatusSchema = z.enum([
  'saved',
  'awaiting_referral',
  'referred',
  'applied',
  'interviewing',
  'offer',
  'rejected',
  'withdrawn',
]);

export const connectionStatusSchema = z.enum([
  'none',
  'sent',
  'accepted',
  'referral_given',
]);

export const interviewItemSchema = z.object({
  id: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  note: z.string().min(1, 'Note or stage is required'),
});

export const jobFormSchema = z.object({
  company: z.string().min(1, 'Company name is required').max(100),
  role: z.string().min(1, 'Role or job title is required').max(150),
  job_url: z
    .string()
    .url('Must be a valid URL (e.g. https://...)')
    .or(z.literal(''))
    .nullable()
    .optional(),
  location: z.string().max(100).nullable().optional(),
  salary: z.string().max(100).nullable().optional(),
  status: jobStatusSchema,
  jd_text: z.string().nullable().optional(),
  resume_version: z.string().max(100).nullable().optional(),
  applied_on: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
    .or(z.literal(''))
    .nullable()
    .optional(),
  source: z.string().default('LinkedIn'),
  referral_contact_name: z.string().max(100).nullable().optional(),
  referral_contact_role: z.string().max(100).nullable().optional(),
  referral_contact_linkedin_url: z
    .string()
    .url('Must be a valid URL')
    .or(z.literal(''))
    .nullable()
    .optional(),
  connection_status: connectionStatusSchema.default('none'),
  connection_sent_on: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
    .or(z.literal(''))
    .nullable()
    .optional(),
  next_followup_on: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
    .or(z.literal(''))
    .nullable()
    .optional(),
  interview_dates: z.array(interviewItemSchema).default([]),
  notes: z.string().nullable().optional(),
});

export type JobFormValues = z.infer<typeof jobFormSchema>;

export const quickAddSchema = z.object({
  company: z.string().min(1, 'Company name is required').max(100),
  role: z.string().min(1, 'Role or job title is required').max(150),
  job_url: z
    .string()
    .url('Must be a valid URL')
    .or(z.literal(''))
    .nullable()
    .optional(),
  jd_text: z.string().min(1, 'Pasting the Job Description is recommended').max(50000),
  status: jobStatusSchema.default('saved'),
});

export type QuickAddFormValues = z.infer<typeof quickAddSchema>;

export const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type AuthFormValues = z.infer<typeof authSchema>;

