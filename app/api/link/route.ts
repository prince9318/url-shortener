import { db, ensureSchema } from "@/lib/db";
import { generateCode, isValidCode, isValidUrl } from "@/lib/shortener";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Ensure DB schema exists before querying
    await ensureSchema();

    // Fetch all short links, newest first
    const links = await db`SELECT * FROM links ORDER BY created_at DESC`;

    return NextResponse.json(links);
  } catch (err: any) {
    // Handle DB configuration or general DB errors
    const message = err?.message?.includes("DATABASE_URL")
      ? "Database not configured. Set DATABASE_URL in .env.local."
      : err?.message || "Database error";

    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { targetUrl, code } = body;

  // Validate URL format
  if (!isValidUrl(targetUrl)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Use custom code if valid, otherwise auto-generate
  let shortCode = code && code.trim() !== "" ? code.trim() : generateCode();

  // Validate user-provided custom short code
  if (code && !isValidCode(shortCode)) {
    return NextResponse.json(
      {
        error: "Invalid custom code. Use 3–10 chars: letters, numbers, - or _",
      },
      { status: 400 }
    );
  }

  try {
    await ensureSchema();

    // Check if URL was already shortened to avoid duplicates
    const existing = await db`
      SELECT * FROM links WHERE target_url = ${targetUrl} LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "URL already shortened", code: existing[0].code },
        { status: 409 }
      );
    }

    // Insert new short link and return the created record
    const row = await db`
      INSERT INTO links (code, target_url)
      VALUES (${shortCode}, ${targetUrl})
      RETURNING *
    `;

    return NextResponse.json(row[0]);
  } catch (err: any) {
    // Handle duplicate code errors (same short code already exists)
    if (err.message.includes("duplicate key")) {
      return NextResponse.json(
        { error: "Code already exists" },
        { status: 409 }
      );
    }

    // General DB error fallback
    return NextResponse.json(
      { error: err?.message || "Database error" },
      { status: 500 }
    );
  }
}
