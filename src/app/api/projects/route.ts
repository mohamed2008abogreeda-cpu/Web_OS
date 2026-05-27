// ============================================================
// API: GET /api/projects — Fetch projects for a user
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { PROJECTS, getProjectsForUser } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ projects: PROJECTS });
  }

  const projects = getProjectsForUser(userId);
  return NextResponse.json({ projects });
}
