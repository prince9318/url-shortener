import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, ctx: any) {
  const { code } = await ctx.params;

  const rows = await db`SELECT * FROM links WHERE code = ${code}`;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(rows[0]);
}

export async function DELETE(req: Request, ctx: any) {
  const { code } = await ctx.params;

  await db`DELETE FROM links WHERE code = ${code}`;
  return NextResponse.json({ ok: true });
}
