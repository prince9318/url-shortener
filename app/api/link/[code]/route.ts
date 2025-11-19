import { db, ensureSchema } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, ctx: any) {
  try {
    await ensureSchema();
    const { code } = await ctx.params;
    const rows = await db`SELECT * FROM links WHERE code = ${code}`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (err: any) {
    const message =
      err?.message?.includes("DATABASE_URL")
        ? "Database not configured. Set DATABASE_URL in .env.local."
        : err?.message || "Database error";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(req: Request, ctx: any) {
  try {
    await ensureSchema();
    const { code } = await ctx.params;
    await db`DELETE FROM links WHERE code = ${code}`;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const message =
      err?.message?.includes("DATABASE_URL")
        ? "Database not configured. Set DATABASE_URL in .env.local."
        : err?.message || "Database error";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
