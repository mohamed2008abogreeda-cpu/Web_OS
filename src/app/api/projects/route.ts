// ============================================================
// API: GET /api/projects — Fetch projects from Cloudflare D1 SQL DB
// falling back gracefully to static mock data if D1 is not initialized.
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { PROJECTS } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    // 1. Attempt to query Cloudflare D1 Database
    if (process.env.DB) {
      let query = "SELECT * FROM projects";
      let stmt;

      if (userId) {
        // Map common app profile usernames to database user_ids
        let targetId = userId;
        if (userId === "Mohammed") targetId = "user-1";
        if (userId === "Moamen") targetId = "user-2";
        if (userId === "Team") targetId = "user-team";

        if (targetId === "user-team") {
          // Team sees all projects
          stmt = process.env.DB.prepare(query + " ORDER BY created_at DESC");
        } else {
          // Filter specifically by user, or common team projects
          stmt = process.env.DB.prepare(
            query + " WHERE user_id = ?1 OR user_id = 'user-team' ORDER BY created_at DESC"
          ).bind(targetId);
        }
      } else {
        stmt = process.env.DB.prepare(query + " ORDER BY created_at DESC");
      }

      const { results } = await stmt.all();

      if (results && results.length > 0) {
        // Parse SQL types to JSON types safely
        const formattedProjects = results.map((row: any) => {
          let parsedTags: string[] = [];
          try {
            parsedTags = typeof row.tags === "string" ? JSON.parse(row.tags) : (row.tags || []);
          } catch {
            parsedTags = [];
          }

          return {
            id: row.id,
            userId: row.user_id,
            title: row.title,
            description: row.description,
            iconUrl: row.icon_url,
            hasIframe: Boolean(row.has_iframe),
            projectUrl: row.project_url,
            liveApiEndpoint: row.live_api_endpoint,
            tags: parsedTags,
          };
        });

        return NextResponse.json({ success: true, projects: formattedProjects });
      }
    }

    // 2. High-performance static fallback from mockData
    let fallbackProjects = PROJECTS;
    if (userId) {
      let targetId = userId;
      if (userId === "Mohammed") targetId = "user-1";
      if (userId === "Moamen") targetId = "user-2";
      if (userId === "Team") targetId = "user-team";

      if (targetId !== "user-team") {
        fallbackProjects = PROJECTS.filter(
          (p) => p.userId === targetId || p.userId === "user-team"
        );
      }
    }

    return NextResponse.json({ success: true, projects: fallbackProjects });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("D1 project fetch error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

