import { NextResponse } from "next/server";
import { getLeadStats } from "@/features/leads/service";
import { errorResponse } from "@/lib/http";

export async function GET() {
  try {
    return NextResponse.json(await getLeadStats());
  } catch (error) {
    return errorResponse(error);
  }
}
