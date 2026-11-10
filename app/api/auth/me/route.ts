import { NextResponse } from 'next/server';
import { getSession } from '@/lib/mongodb/auth';
import { connectToDatabase } from '@/lib/mongodb/db';
import { UserModel } from '@/lib/mongodb/models/User';

export async function GET() {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const user = await UserModel.findById(session.userId).select('-password');
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

