"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

type ShortLink = {
  code: string;
  target_url: string;
  clicks?: number;
};

export default function Dashboard() {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const clicksRef = useRef<Record<string, number>>({});

  // Load all links
  async function fetchLinks() {
    try {
      const res = await fetch("/api/link", { cache: "no-store" });
      if (!res.ok) {
        // Non-JSON or error response; surface and bail
        const text = await res.text();
        console.error("/api/link error", res.status, text);
        toast.error("Failed to refresh links");
        return;
      }

      // Some environments may return empty body; guard JSON parsing
      let data: ShortLink[] = [];
      try {
        data = await res.json();
      } catch (parseErr) {
        console.error("Failed to parse links JSON", parseErr);
        toast.error("Invalid response while refreshing links");
        return;
      }
      setLinks(data);
      // Detect click count increases
      const prev = clicksRef.current;
      const next: Record<string, number> = {};
      data.forEach((l) => {
        next[l.code] = l.clicks || 0;
        if (prev[l.code] != null && (l.clicks || 0) > prev[l.code]) {
          const diff = (l.clicks || 0) - prev[l.code];
          toast.success(`Clicks updated for ${l.code} (+${diff})`);
        }
      });
      clicksRef.current = next;
    } catch (e) {
      console.error("Failed to fetch links", e);
      toast.error("Network error while refreshing links");
    }
  }

  useEffect(() => {
    fetchLinks();
    function handleFocus() {
      fetchLinks();
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // Create Short Link
  async function createLink(e: any) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/link", {
      method: "POST",
      body: JSON.stringify({ targetUrl: url, code }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Error creating link");
      toast.error(data.error || "Error creating link");
      setLoading(false);
      return;
    }

    setUrl("");
    setCode("");
    setLoading(false);
    toast.success("Short URL created");
    fetchLinks();
  }

  // Delete Short Link
  async function deleteLink(c: string) {
    const res = await fetch(`/api/link/${c}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Short URL deleted");
    } else {
      toast.error("Failed to delete");
    }
    fetchLinks();
  }

  return (
    <div className="py-10">
      {/* Hero section */}
      <section className="hero mx-auto max-w-6xl rounded-2xl border border-gray-200 bg-white/70 p-8 md:p-12 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="section-title">Shorten links that get clicked.</h1>
            <p className="section-subtitle">
              Create memorable, trackable URLs in seconds. Keep control of your brand with custom codes—no feature changes, just a better experience.
            </p>
            <div className="mt-6 flex gap-2">
              <span className="badge brand">Fast</span>
              <span className="badge">Custom codes</span>
              <span className="badge">No tracking bloat</span>
            </div>
          </div>

          {/* Create link form */}
          <form onSubmit={createLink} className="card flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target URL</label>
              <input
                className="input"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom code (optional)</label>
              <input
                className="input"
                placeholder="my-awesome-link"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <button className="btn-primary" disabled={loading} type="submit">
              {loading ? "Creating..." : "Create Link"}
            </button>
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </form>
        </div>
      </section>

      <h2 className="text-xl font-semibold mt-10 mb-4">Your Links</h2>

      <table className="table">
        <thead>
          <tr className="text-left">
            <th className="p-3">Code</th>
            <th className="p-3">URL</th>
            <th className="p-3">Clicks</th>
            <th className="p-3"></th>
          </tr>
        </thead>

        <tbody>
          {links.map((l) => (
            <tr key={l.code} className="border-t">
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <a
                    href={`/${l.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[color:var(--primary)] hover:underline font-medium"
                  >
                    {l.code}
                  </a>
                  <button
                    onClick={() =>
                      navigator.clipboard
                        .writeText(`${(process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin)}/${l.code}`)
                        .then(() => toast.success("Copied short URL"))
                        .catch(() => toast.error("Copy failed"))
                    }
                    className="p-1 rounded hover:bg-gray-200"
                    title="Copy short URL"
                  >
                    {/* Clipboard icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-600">
                      <path d="M9 2a2 2 0 0 0-2 2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V8l-6-6H9zm8 9h-3a2 2 0 0 1-2-2V4l5 5z" />
                    </svg>
                  </button>
                </div>
              </td>

              {/* Original URL with See more/Hide toggle */}
              <td className="p-3 max-w-xs">
                {(() => {
                  const text: string = l.target_url || "";
                  const limit = 60;
                  const isExpanded = !!expanded[l.code];
                  const shown = isExpanded ? text : (text.length > limit ? `${text.slice(0, limit)}…` : text);
                  return (
                    <span>
                      {shown}
                      {text.length > limit && (
                        <button
                          onClick={() => setExpanded((prev) => ({ ...prev, [l.code]: !isExpanded }))}
                          className="ml-2 text-[color:var(--primary)] hover:underline"
                        >
                          {isExpanded ? "Hide" : "See more"}
                        </button>
                      )}
                    </span>
                  );
                })()}
              </td>

              <td className="p-3"><span className="badge">{l.clicks}</span></td>

              <td className="p-3">
                <button
                  onClick={() => deleteLink(l.code)}
                  className="inline-flex items-center gap-1 text-red-600 hover:underline"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {links.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-4 text-gray-500">
                No links created yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
