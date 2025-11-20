import { NextResponse } from "next/server";
import os from "os";
import { db } from "@/lib/db";

export async function GET() {
  // Track server uptime since process start
  const started = process.uptime();

  let dbOk = false;
  let dbTime: string | undefined;

  try {
    // Simple DB check to confirm connection status
    const rows = await db`SELECT NOW()`;
    dbOk = true;
    dbTime = rows[0]?.now ? String(rows[0].now) : undefined;
  } catch {
    // DB connection failed
    dbOk = false;
  }

  // Return server health + environment metadata
  return NextResponse.json({
    status: "ok",
    uptimeSeconds: Math.round(started),
    nodeVersion: process.version,
    platform: os.platform(),
    arch: os.arch(),

    // Basic memory usage snapshot
    memory: {
      rss: process.memoryUsage().rss,
      heapUsed: process.memoryUsage().heapUsed,
    },

    // Environment-related details
    env: {
      baseUrl: process.env.BASE_URL ?? process.env.NEXT_PUBLIC_BASE_URL ?? null,
      databaseConfigured: !!process.env.DATABASE_URL,
    },

    // Database health check summary
    database: {
      ok: dbOk,
      now: dbTime,
    },
  });
}
