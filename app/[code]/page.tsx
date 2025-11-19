import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

function isBot(ua: string) {
  const bots = [
    "Googlebot",
    "Bingbot",
    "DuckDuckBot",
    "Baiduspider",
    "YandexBot",
    "facebookexternalhit",
    "Facebot",
    "Twitterbot",
    "Slackbot",
    "LinkedInBot",
    "Discordbot",
    "WhatsApp",
    "Pinterest",
  ];
  return bots.some((b) => ua.toLowerCase().includes(b.toLowerCase()));
}

function isLikelyImage(url: string) {
  return /(\.png|\.jpg|\.jpeg|\.gif|\.webp|\.bmp)(\?.*)?$/i.test(url);
}

async function fetchMetaFromTarget(targetUrl: string) {
  try {
    if (isLikelyImage(targetUrl)) {
      return { title: "Shared image", description: targetUrl, image: targetUrl };
    }
    const res = await fetch(targetUrl, { method: "GET", cache: "no-store", signal: (AbortSignal as any).timeout?.(2000) });
    const html = await res.text();
    const titleMatch = html.match(/<title>([^<]{1,200})<\/title>/i);
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
      html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    return {
      title: titleMatch ? titleMatch[1].trim() : targetUrl,
      description: ogDescMatch ? ogDescMatch[1].trim() : `Redirects to ${targetUrl}`,
      image: ogImageMatch ? ogImageMatch[1].trim() : undefined,
    };
  } catch {
    return { title: targetUrl, description: `Redirects to ${targetUrl}` };
  }
}

export async function generateMetadata(props: any) {
  const { code } = await props.params;
  const envBase = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL;
  let origin = envBase || "";
  if (!origin) {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
    const proto = h.get("x-forwarded-proto") ?? "http";
    origin = `${proto}://${host}`;
  }

  const rows = await db`SELECT * FROM links WHERE code = ${code}`;
  if (rows.length === 0) {
    return { title: "Not found" };
  }
  const link = rows[0];
  const preview = await fetchMetaFromTarget(link.target_url);

  const title = preview.title ? `TinyLink – ${preview.title}` : `TinyLink – ${link.code}`;
  const description = preview.description ?? `Short link to ${link.target_url}`;
  const imageUrl = preview.image;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${origin}/${code}`,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  } as any;
}

export default async function RedirectPage(props: any) {
  const { code } = await props.params;
  const sp = props.searchParams || {};
  const h = await headers();
  const ua = h.get("user-agent") || "";

  const rows = await db`SELECT * FROM links WHERE code = ${code}`;
  if (rows.length === 0) redirect("/");
  const link = rows[0];

  const showPreview = isBot(ua) || sp.preview === "1" || sp.preview === 1;
  if (!showPreview) {
    await db`
      UPDATE links 
      SET clicks = clicks + 1, last_clicked = NOW() 
      WHERE code = ${code}
    `;
    redirect(link.target_url);
  }

  const meta = await fetchMetaFromTarget(link.target_url);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="section-title mb-4">{meta.title || link.code}</h1>
      <div className="card">
        {meta.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={meta.image} alt="Preview" className="w-full h-auto rounded-md mb-4" />
        )}
        <p className="text-gray-700"><strong>Target URL:</strong> {link.target_url}</p>
        <p className="text-gray-700 mt-2">This short link provides shareable preview metadata for social apps and chats. Click below to continue.</p>
        <a href={link.target_url} className="btn-primary mt-4 inline-flex">Continue to destination</a>
      </div>
      <p className="text-sm text-gray-500 mt-4">Add <code>?preview=1</code> to force preview: <code>/{code}?preview=1</code></p>
    </div>
  );
}
