import { NextRequest, NextResponse } from "next/server";
import { fetchArticles } from "@/lib/scraper-api";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const force = url.searchParams.get("refresh") === "1";
  const result = await fetchArticles({ force });
  return NextResponse.json(result);
}
