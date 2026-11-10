import { NextResponse } from 'next/server';
import { getSession } from '@/lib/mongodb/auth';
import { connectToDatabase } from '@/lib/mongodb/db';
import { JobModel } from '@/lib/mongodb/models/Job';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: Request, { params }: Params) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const job = await JobModel.findOne({
      _id: params.id,
      userId: session.userId,
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const obj = job.toJSON();
    return NextResponse.json({
      job: {
        ...obj,
        id: obj.id || job._id.toString(),
        created_at: job.createdAt?.toISOString() || new Date().toISOString(),
        updated_at: job.updatedAt?.toISOString() || new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Params) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updates = await req.json();
    await connectToDatabase();

    const updated = await JobModel.findOneAndUpdate(
      { _id: params.id, userId: session.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const obj = updated.toJSON();
    return NextResponse.json({
      job: {
        ...obj,
        id: obj.id || updated._id.toString(),
        created_at: updated.createdAt?.toISOString() || new Date().toISOString(),
        updated_at: updated.updatedAt?.toISOString() || new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const deleted = await JobModel.findOneAndDelete({
      _id: params.id,
      userId: session.userId,
    });

    if (!deleted) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Job deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

