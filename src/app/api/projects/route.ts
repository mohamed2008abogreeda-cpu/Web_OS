// ============================================================
// API: /api/projects — Drizzle ORM & R2 Storage Admin Integration
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { getD1Database, getR2Bucket, getDrizzle } from "@/lib/db";
import { projects } from "@/db/schema";
import { eq, or, desc, sql } from "drizzle-orm";
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
    const drizzleDb = getDrizzle();

    if (drizzleDb) {
      let results;

      if (userId) {
        let targetId = userId;
        if (userId === "Mohammed") targetId = "user-1";
        if (userId === "Moamen") targetId = "user-2";
        if (userId === "Team") targetId = "user-team";

        if (targetId === "user-team") {
          results = await drizzleDb
            .select()
            .from(projects)
            .orderBy(desc(projects.createdAt));
        } else {
          results = await drizzleDb
            .select()
            .from(projects)
            .where(
              or(
                eq(projects.userId, targetId),
                eq(projects.userId, 'user-team')
              )
            )
            .orderBy(desc(projects.createdAt));
        }
      } else {
        results = await drizzleDb
          .select()
          .from(projects)
          .orderBy(desc(projects.createdAt));
      }

      if (results && results.length > 0) {
        const formattedProjects = results.map((row) => {
          let parsedTags: string[] = [];
          try {
            parsedTags = typeof row.tags === "string" ? JSON.parse(row.tags) : (row.tags || []);
          } catch {
            parsedTags = [];
          }

          return {
            id: row.id,
            userId: row.userId,
            title: row.title,
            description: row.description,
            iconUrl: row.iconUrl,
            hasIframe: Boolean(row.hasIframe),
            projectUrl: row.projectUrl,
            liveApiEndpoint: row.liveApiEndpoint,
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

    const drizzleDb = getDrizzle(db);
    if (!drizzleDb) {
      throw new Error("Failed to initialize Drizzle ORM database instance.");
    }

    const formData = await request.formData();
    const id = formData.get("id") as string || `proj-${Math.random().toString(36).substring(2, 9)}`;
    const userId = formData.get("userId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string || "";
    const hasIframe = formData.get("hasIframe") === "true" || formData.get("hasIframe") === "1";
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

    // 2. Insert SQL Record to D1 Database using Drizzle
    await drizzleDb
      .insert(projects)
      .values({
        id,
        userId,
        title,
        description,
        iconUrl,
        hasIframe,
        projectUrl,
        liveApiEndpoint,
        tags,
      });

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

    const drizzleDb = getDrizzle(db);
    if (!drizzleDb) {
      throw new Error("Failed to initialize Drizzle ORM database instance.");
    }

    const formData = await request.formData();
    const id = formData.get("id") as string;
    
    if (!id) {
      throw new Error("Missing project ID parameter for updating records.");
    }

    const userId = formData.get("userId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string || "";
    const hasIframe = formData.get("hasIframe") === "true" || formData.get("hasIframe") === "1";
    const projectUrl = formData.get("projectUrl") as string || "";
    const liveApiEndpoint = formData.get("liveApiEndpoint") as string || null;
    const tags = formData.get("tags") as string || "[]";
    
    let iconUrl = formData.get("iconUrl") as string;

    // Retrieve project icon url first to clean up R2 file if applicable to prevent orphaned objects
    let oldIconUrl = "";
    try {
      const oldProjects = await drizzleDb
        .select({ iconUrl: projects.iconUrl })
        .from(projects)
        .where(eq(projects.id, id));
      if (oldProjects && oldProjects.length > 0 && oldProjects[0].iconUrl) {
        oldIconUrl = oldProjects[0].iconUrl;
      }
    } catch (err) {
      console.warn("[PUT Projects Route] Failed to fetch old iconUrl for cleanup:", err);
    }

    // 1. Process Multipart File Upload if user uploads a new image
    const file = formData.get("image") as File | null;
    if (file && file.size > 0 && bucket) {
      const fileExt = file.name.split(".").pop() || "png";
      const key = `projects/${id}-${Date.now()}.${fileExt}`;
      const fileBuffer = await file.arrayBuffer();

      await bucket.put(key, fileBuffer, {
        httpMetadata: { contentType: file.type },
      });

      // Cleanup old R2 file to prevent orphaned objects
      if (oldIconUrl && oldIconUrl.includes("projects/")) {
        try {
          const parts = oldIconUrl.split("projects/");
          if (parts.length > 1) {
            const oldKey = `projects/${parts[1]}`;
            await bucket.delete(oldKey);
            console.log("[PUT Projects Route] Cleaned up orphaned R2 object:", oldKey);
          }
        } catch (err) {
          console.warn("[PUT Projects Route] Orphaned R2 object cleanup failed:", err);
        }
      }

      const cdnDomain = process.env.NEXT_PUBLIC_CDN_DOMAIN;
      if (cdnDomain) {
        iconUrl = `${cdnDomain}/${key}`;
      } else {
        const origin = request.headers.get("origin") || "http://localhost:3000";
        iconUrl = `${origin}/api/storage?key=${key}`;
      }
    }

    // 2. Update SQL Record in D1 using Drizzle
    await drizzleDb
      .update(projects)
      .set({
        userId,
        title,
        description,
        iconUrl,
        hasIframe,
        projectUrl,
        liveApiEndpoint,
        tags,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(projects.id, id));

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
    // Zero-Zero Enforce Admin Authentication
    const isAdminValid = await validateAdmin(request);
    if (!isAdminValid) {
      return new Response("Unauthorized", { status: 401 });
    }

    const db = getD1Database();
    if (!db) {
      throw new Error("D1 Database binding is required for deleting database records.");
    }

    const drizzleDb = getDrizzle(db);
    if (!drizzleDb) {
      throw new Error("Failed to initialize Drizzle ORM database instance.");
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      throw new Error("Missing project ID parameter for deleting records.");
    }

    // Retrieve project icon url first to clean up R2 file if applicable
    const oldProjects = await drizzleDb
      .select({ iconUrl: projects.iconUrl })
      .from(projects)
      .where(eq(projects.id, id));
    
    if (oldProjects && oldProjects.length > 0) {
      const iconUrl = oldProjects[0].iconUrl;
      if (iconUrl && iconUrl.includes("projects/")) {
        const bucket = getR2Bucket();
        if (bucket) {
          const parts = iconUrl.split("projects/");
          if (parts.length > 1) {
            const key = `projects/${parts[1]}`;
            await bucket.delete(key);
          }
        }
      }
    }

    // Delete project record using Drizzle
    await drizzleDb
      .delete(projects)
      .where(eq(projects.id, id));

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error occurred" },
      { status: 500 }
    );
  }
}

