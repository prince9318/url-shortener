import { db } from "@/lib/db";
import Link from "next/link";

export default async function StatsPage(props: any) {
  const { code } = await props.params;

  const rows = await db`SELECT * FROM links WHERE code = ${code}`;
  if (rows.length === 0) return <div className="p-10">Not found</div>;

  const link = rows[0];

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="section-title mb-4">Stats for {link.code}</h1>

      <div className="card">
        <p>
          <strong>Target URL:</strong> {link.target_url}
        </p>
        <p>
          <strong>Clicks:</strong> {link.clicks}
        </p>
        <p>
          <strong>Created:</strong> {new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: (process.env.NEXT_PUBLIC_TIME_ZONE || process.env.BASE_TIME_ZONE || undefined) }).format(new Date(link.created_at))}
        </p>
        <p>
          <strong>Last Clicked:</strong> {link.last_clicked ? new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: (process.env.NEXT_PUBLIC_TIME_ZONE || process.env.BASE_TIME_ZONE || undefined) }).format(new Date(link.last_clicked)) : "Never"}
        </p>
      </div>

      <Link href="/" className="text-[color:var(--primary)] hover:underline block mt-5">
        ← Back to Dashboard
      </Link>
    </div>
  );
}
