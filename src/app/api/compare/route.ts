import { NextRequest, NextResponse } from "next/server";
import { knfApi } from "@/lib/knf-api";
import { SubfundFullProfile } from "@/types/knf";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const idsParam = searchParams.get("ids");

  if (!idsParam) {
    return NextResponse.json({ error: "Missing 'ids' parameter" }, { status: 400 });
  }

  const ids = idsParam
    .split(",")
    .map((id) => parseInt(id.trim(), 10))
    .filter((id) => !isNaN(id))
    .slice(0, 4); // max 4 funds for clean side-by-side comparison

  if (ids.length === 0) {
    return NextResponse.json({ error: "No valid IDs provided" }, { status: 400 });
  }

  try {
    const profiles = (
      await Promise.all(ids.map((id) => knfApi.getSubfundFullProfile(id)))
    ).filter((p): p is SubfundFullProfile => p !== null);

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error("API error /api/compare:", error);
    return NextResponse.json({ error: "Failed to compare funds" }, { status: 500 });
  }
}

