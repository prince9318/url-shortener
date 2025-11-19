import { NextResponse } from "next/server";
import os from "os";
import { db } from "@/lib/db";

export async function GET() {
  const started = process.uptime();
  let dbOk = false;
  let dbTime: string | undefined;
  try {
    const rows = await db`SELECT NOW()`;
    dbOk = true;
    dbTime = rows[0]?.now ? String(rows[0].now) : undefined;
  } catch {
    dbOk = false;
  }

  return NextResponse.json({
    status: "ok",
    uptimeSeconds: Math.round(started),
    nodeVersion: process.version,
    platform: os.platform(),
    arch: os.arch(),
    memory: {
      rss: process.memoryUsage().rss,
      heapUsed: process.memoryUsage().heapUsed,
    },
    env: {
      baseUrl: process.env.BASE_URL ?? process.env.NEXT_PUBLIC_BASE_URL ?? null,
      databaseConfigured: !!process.env.DATABASE_URL,
    },
    database: {
      ok: dbOk,
      now: dbTime,
    },
  });
}
