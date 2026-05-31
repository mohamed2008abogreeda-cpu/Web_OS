// ============================================================
// API: /api/projects — D1 SQL & R2 Storage Admin Integration
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { getD1Database, getR2Bucket } from "@/lib/db";
import { PROJECTS } from "@/lib/mockData";

/**
 * Timing-safe string comparison to prevent timing attacks.
 * Fully Edge and Cloudflare Workers compatible (O(N) runtime based on string length).
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Edge-compatible admin session validator
 */
async function validateAdmin(request: NextRequest): Promise<boolean> {
  const adminSession = request.cookies.get('admin_session')?.value || 
                       request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!adminSession) return false;

  const expectedToken = process.env.ADMIN_HASH || '0e2df64939a0f3ffff872b1e534018c73ec22765f27ae16e05398717662674d7';

  return timingSafeEqual(adminSession, expectedToken);
}

/**
 * GET: Fetch all projects or filter by userId
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    const db = getD1Database();

    if (db) {
      let query = "SELECT * FROM projects";
      let stmt;

      if (userId) {
        let targetId = userId;
        if (userId === "Mohammed") targetId = "user-1";
        if (userId === "Moamen") targetId = "user-2";
        if (userId === "Team") targetId = "user-team";

        if (targetId === "user-team") {
          stmt = db.prepare(query + " ORDER BY created_at DESC");
        } else {
          stmt = db.prepare(
            query + " WHERE user_id = ?1 OR user_id = 'user-team' ORDER BY created_at DESC"
          ).bind(targetId);
        }
      } else {
        stmt = db.prepare(query + " ORDER BY created_at DESC");
      }

      const { results } = await stmt.all();

      if (results && results.length > 0) {
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

        const response = NextResponse.json({ success: true, projects: formattedProjects });
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
        return response;
      }
    }

    // Static fallback if D1 database is unbound or empty during local Next.js node runs
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

    const response = NextResponse.json({ success: true, projects: fallbackProjects });
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error occurred" },
      { status: 500 }
    );
  }
}

/**
 * POST: Create a new project (Admin CMS with R2 Multipart Uploads)
 */
export async function POST(request: NextRequest) {
  try {
    // Zero-Trust Enforce Admin Authentication
    const isAdminValid = await validateAdmin(request);
    if (!isAdminValid) {
      return new Response("Unauthorized", { status: 401 });
    }

    const db = getD1Database();
    const bucket = getR2Bucket();

    if (!db) {
      throw new Error("D1 Database binding is required for writing database records.");
    }

    const formData = await request.formData();
    const id = formData.get("id") as string || `proj-${Math.random().toString(36).substring(2, 9)}`;
    const userId = formData.get("userId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string || "";
    const hasIframe = formData.get("hasIframe") === "true" || formData.get("hasIframe") === "1" ? 1 : 0;
    const projectUrl = formData.get("projectUrl") as string || "";
    const liveApiEndpoint = formData.get("liveApiEndpoint") as string || null;
    const tags = formData.get("tags") as string || "[]";
    
    let iconUrl = formData.get("iconUrl") as string || "📦";

    // 1. Process Multipart File Upload to R2 Bucket
    const file = formData.get("image") as File | null;
    if (file && file.size > 0 && bucket) {
      const fileExt = file.name.split(".").pop() || "png";
      const key = `projects/${id}-${Date.now()}.${fileExt}`;
      const fileBuffer = await file.arrayBuffer();

      // Stream binary to R2
      await bucket.put(key, fileBuffer, {
        httpMetadata: { contentType: file.type },
      });

      // Point image icon directly to the high-speed public R2 CDN/bucket subdomain, with fallback to local API storage
      const cdnDomain = process.env.NEXT_PUBLIC_CDN_DOMAIN;
      if (cdnDomain) {
        iconUrl = `${cdnDomain}/${key}`;
      } else {
        const origin = request.headers.get("origin") || "http://localhost:3000";
        iconUrl = `${origin}/api/storage?key=${key}`;
      }
    }

    // 2. Insert SQL Record to D1 Database
    await db
      .prepare(
        `INSERT INTO projects (id, user_id, title, description, icon_url, has_iframe, project_url, live_api_endpoint, tags)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`
      )
      .bind(id, userId, title, description, iconUrl, hasIframe, projectUrl, liveApiEndpoint, tags)
      .run();

    return NextResponse.json({ success: true, projectId: id, iconUrl });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error occurred" },
      { status: 500 }
    );
  }
}

/**
 * PUT: Update an existing project
 */
export async function PUT(request: NextRequest) {
  try {
    // Zero-Trust Enforce Admin Authentication
    const isAdminValid = await validateAdmin(request);
    if (!isAdminValid) {
      return new Response("Unauthorized", { status: 401 });
    }

    const db = getD1Database();
    const bucket = getR2Bucket();

    if (!db) {
      throw new Error("D1 Database binding is required for writing database records.");
    }

    const formData = await request.formData();
    const id = formData.get("id") as string;
    
    if (!id) {
      throw new Error("Missing project ID parameter for updating records.");
    }

    const userId = formData.get("userId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string || "";
    const hasIframe = formData.get("hasIframe") === "true" || formData.get("hasIframe") === "1" ? 1 : 0;
    const projectUrl = formData.get("projectUrl") as string || "";
    const liveApiEndpoint = formData.get("liveApiEndpoint") as string || null;
    const tags = formData.get("tags") as string || "[]";
    
    let iconUrl = formData.get("iconUrl") as string;

    // 1. Process Multipart File Upload if user uploads a new image
    const file = formData.get("image") as File | null;
    if (file && file.size > 0 && bucket) {
      const fileExt = file.name.split(".").pop() || "png";
      const key = `projects/${id}-${Date.now()}.${fileExt}`;
      const fileBuffer = await file.arrayBuffer();

      await bucket.put(key, fileBuffer, {
        httpMetadata: { contentType: file.type },
      });

      const cdnDomain = process.env.NEXT_PUBLIC_CDN_DOMAIN;
      if (cdnDomain) {
        iconUrl = `${cdnDomain}/${key}`;
      } else {
        const origin = request.headers.get("origin") || "http://localhost:3000";
        iconUrl = `${origin}/api/storage?key=${key}`;
      }
    }

    // 2. Update SQL Record in D1
    await db
      .prepare(
        `UPDATE projects 
         SET user_id = ?2, title = ?3, description = ?4, icon_url = ?5, has_iframe = ?6, project_url = ?7, live_api_endpoint = ?8, tags = ?9, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?1`
      )
      .bind(id, userId, title, description, iconUrl, hasIframe, projectUrl, liveApiEndpoint, tags)
      .run();

    return NextResponse.json({ success: true, projectId: id, iconUrl });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error occurred" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Delete a project (Admin CMS with R2 file cleanup)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Zero-Trust Enforce Admin Authentication
    const isAdminValid = await validateAdmin(request);
    if (!isAdminValid) {
      return new Response("Unauthorized", { status: 401 });
    }

    const db = getD1Database();
    if (!db) {
      throw new Error("D1 Database binding is required for deleting database records.");
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      throw new Error("Missing project ID parameter for deleting records.");
    }

    // Retrieve project icon url first to clean up R2 file if applicable
    const selectStmt = db.prepare("SELECT icon_url FROM projects WHERE id = ?1").bind(id);
    const project = (await selectStmt.first()) as any;
    
    if (project && project.icon_url && project.icon_url.includes("projects/")) {
      const bucket = getR2Bucket();
      if (bucket) {
        const parts = project.icon_url.split("projects/");
        if (parts.length > 1) {
          const key = `projects/${parts[1]}`;
          await bucket.delete(key);
        }
      }
    }

    await db.prepare("DELETE FROM projects WHERE id = ?1").bind(id).run();

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error occurred" },
      { status: 500 }
    );
  }
}
