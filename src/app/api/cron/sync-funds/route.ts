import { NextRequest, NextResponse } from "next/server";
import { knfApi } from "@/lib/knf-api";
import { revalidatePath } from "next/cache";

export const maxDuration = 60; // Up to 60 seconds for cron execution
export const dynamic = "force-dynamic";

/**
 * Universal Cron Sync Route Handler
 * Compatible with Vercel Cron and Linux crontab (e.g. RHEL)
 * 
 * Invocation:
 * - Vercel: Configured in vercel.json, triggers daily at 03:00 UTC with Bearer token
 * - RHEL / curl:
 *   curl -fsSL -H "Authorization: Bearer $CRON_SECRET" "https://wybieramfundusze.pl/api/cron/sync-funds?mode=quick"
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // In production, strictly require CRON_SECRET to prevent unauthorized public execution.
  // In development, allow testing without a secret if CRON_SECRET is not set in .env.local.
  if (process.env.NODE_ENV === "production" || cronSecret) {
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or invalid CRON_SECRET" },
        { status: 401 }
      );
    }
  }

  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("mode") || "quick";
  const limit = parseInt(searchParams.get("limit") || (mode === "quick" ? "50" : "500"), 10);
  const delayMs = parseInt(searchParams.get("delay") || "50", 10);

  console.log(`[Cron] Sync started at ${new Date().toISOString()} (mode=${mode}, limit=${limit})`);

  try {
    const result = await knfApi.syncFunds({ limit, delayMs });
    console.log(`[Cron] Sync finished successfully: updated ${result.updatedCount} funds in ${result.durationMs}ms`);

    // Invalidate Next.js Data Cache so fresh data is served immediately
    try {
      revalidatePath("/");
      revalidatePath("/statystyki");
    } catch (e) {
      console.warn("[Cron] Revalidation notice:", e);
    }

    return NextResponse.json({
      success: true,
      mode,
      updatedCount: result.updatedCount,
      durationMs: result.durationMs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Sync funds error:", error);
    return NextResponse.json(
      { error: "Failed to execute fund synchronization" },
      { status: 500 }
    );
  }
}
