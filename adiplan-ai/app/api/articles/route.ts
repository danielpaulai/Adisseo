import { NextResponse } from "next/server";
import { fetchArticles } from "@/lib/scraper-api";

export async function GET() {
  const articles = await fetchArticles();
  return NextResponse.json({ articles });
}
