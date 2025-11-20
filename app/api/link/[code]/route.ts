import { db, ensureSchema } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, ctx: any) {
  try {
    // Ensures database schema/tables exist before running queries
    await ensureSchema();

    const { code } = await ctx.params;

    // Fetch the short link by code
    const rows = await db`SELECT * FROM links WHERE code = ${code}`;

    // Return 404 if link does not exist
    if (rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Return link details
    return NextResponse.json(rows[0]);
  } catch (err: any) {
    // Handle missing DB config or general database errors
    const message = err?.message?.includes("DATABASE_URL")
      ? "Database not configured. Set DATABASE_URL in .env.local."
      : err?.message || "Database error";

    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(req: Request, ctx: any) {
  try {
    // Ensures database schema/tables exist
    await ensureSchema();

    const { code } = await ctx.params;

    // Deletes the link from the database
    await db`DELETE FROM links WHERE code = ${code}`;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    // Handle DB configuration issues or other errors
    const message = err?.message?.includes("DATABASE_URL")
      ? "Database not configured. Set DATABASE_URL in .env.local."
      : err?.message || "Database error";

    return NextResponse.json({ error: message }, { status: 503 });
  }
}
