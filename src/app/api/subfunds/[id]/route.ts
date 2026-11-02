import { NextRequest, NextResponse } from "next/server";
import { knfApi } from "@/lib/knf-api";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const subfundId = parseInt(id, 10);

  if (isNaN(subfundId)) {
    return NextResponse.json({ error: "Invalid subfund ID" }, { status: 400 });
  }

  try {
    const profile = await knfApi.getSubfundFullProfile(subfundId);
    if (!profile) {
      return NextResponse.json({ error: "Subfund not found" }, { status: 404 });
    }
    return NextResponse.json(profile);
  } catch (error) {
    console.error(`API error /api/subfunds/${subfundId}:`, error);
    return NextResponse.json({ error: "Failed to fetch subfund details" }, { status: 500 });
  }
}

