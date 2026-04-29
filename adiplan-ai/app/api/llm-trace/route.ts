import { NextResponse } from "next/server";
import { ensureTraceSeed, readTraces, clearTraces } from "@/lib/llm-trace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  ensureTraceSeed();
  const traces = readTraces(150);
  return NextResponse.json({ traces });
}

export async function DELETE() {
  clearTraces();
  return NextResponse.json({ ok: true });
}
