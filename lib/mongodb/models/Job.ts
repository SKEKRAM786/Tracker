import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInterviewDate {
  id?: string;
  date: string;
  note: string;
}

export interface IJob extends Document {
  id?: string;
  userId: string;
  company: string;
  role: string;
  job_url?: string | null;
  location?: string | null;
  salary?: string | null;
  status: string;
  jd_text?: string | null;
  resume_version?: string | null;
  applied_on?: string | null;
  source: string;
  referral_contact_name?: string | null;
  referral_contact_role?: string | null;
  referral_contact_linkedin_url?: string | null;
  connection_status: string;
  connection_sent_on?: string | null;
  next_followup_on?: string | null;
  interview_dates: IInterviewDate[];
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    job_url: { type: String, default: null },
    location: { type: String, default: null },
    salary: { type: String, default: null },
    status: {
      type: String,
      required: true,
      default: 'saved',
      enum: [
        'saved',
        'awaiting_referral',
        'referred',
        'applied',
        'interviewing',
        'offer',
        'rejected',
        'withdrawn',
      ],
    },
    jd_text: { type: String, default: null },
    resume_version: { type: String, default: null },
    applied_on: { type: String, default: null },
    source: { type: String, default: 'LinkedIn' },
    referral_contact_name: { type: String, default: null },
    referral_contact_role: { type: String, default: null },
    referral_contact_linkedin_url: { type: String, default: null },
    connection_status: {
      type: String,
      default: 'none',
      enum: ['none', 'sent', 'accepted', 'referral_given'],
    },
    connection_sent_on: { type: String, default: null },
    next_followup_on: { type: String, default: null },
    interview_dates: {
      type: [
        {
          id: { type: String },
          date: { type: String },
          note: { type: String },
        },
      ],
      default: [],
    },
    notes: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

// Format output to return id instead of _id
JobSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: any) {
    ret.id = ret._id?.toString() || ret.id;
    delete ret._id;
  },
});

export const JobModel: Model<IJob> =
  mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);
