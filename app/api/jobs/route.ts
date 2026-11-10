import { NextResponse } from 'next/server';
import { getSession } from '@/lib/mongodb/auth';
import { connectToDatabase } from '@/lib/mongodb/db';
import { JobModel } from '@/lib/mongodb/models/Job';
import { jobFormSchema } from '@/lib/validations';

export async function GET() {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const jobs = await JobModel.find({ userId: session.userId }).sort({ createdAt: -1 });

    const formatted = jobs.map((doc) => {
      const obj = doc.toJSON();
      return {
        ...obj,
        id: obj.id || doc._id.toString(),
        created_at: doc.createdAt?.toISOString() || new Date().toISOString(),
        updated_at: doc.updatedAt?.toISOString() || new Date().toISOString(),
      };
    });

    return NextResponse.json({ jobs: formatted });
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = jobFormSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const newJob = await JobModel.create({
      ...result.data,
      userId: session.userId,
    } as any);

    const obj = newJob.toJSON();
    const formatted = {
      ...obj,
      id: obj.id || newJob._id.toString(),
      created_at: newJob.createdAt?.toISOString() || new Date().toISOString(),
      updated_at: newJob.updatedAt?.toISOString() || new Date().toISOString(),
    };

    return NextResponse.json({ job: formatted }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

