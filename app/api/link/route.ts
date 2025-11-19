import { db } from "@/lib/db";
import { generateCode, isValidCode, isValidUrl } from "@/lib/shortener";
import { NextResponse } from "next/server";

export async function GET() {
  const links = await db`SELECT * FROM links ORDER BY created_at DESC`;
  return NextResponse.json(links);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { targetUrl, code } = body;

  if (!isValidUrl(targetUrl)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  let shortCode = code && code.trim() !== "" ? code.trim() : generateCode();

  if (code && !isValidCode(shortCode)) {
    return NextResponse.json(
      { error: "Invalid custom code. Use 3–10 chars: letters, numbers, - or _" },
      { status: 400 }
    );
  }

  try {
    // Prevent duplicating the same target URL
    const existing = await db`SELECT * FROM links WHERE target_url = ${targetUrl} LIMIT 1`;
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "URL already shortened", code: existing[0].code },
        { status: 409 }
      );
    }

    const row =
      await db`INSERT INTO links (code, target_url) VALUES (${shortCode}, ${targetUrl}) RETURNING *`;

    return NextResponse.json(row[0]);
  } catch (err: any) {
    if (err.message.includes("duplicate key")) {
      return NextResponse.json(
        { error: "Code already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
