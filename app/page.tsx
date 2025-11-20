"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

// Type for each short link item
type ShortLink = {
  code: string;
  target_url: string;
  clicks?: number;
  created_at?: string;
  last_clicked?: string | null;
};

export default function Dashboard() {
  // State variables
  const [links, setLinks] = useState<ShortLink[]>([]); // All links
  const [filter, setFilter] = useState(""); // Search filter
  const [url, setUrl] = useState(""); // Target URL input
  const [code, setCode] = useState(""); // Custom code input
  const [loading, setLoading] = useState(false); // Loader
  const [error, setError] = useState(""); // Error message
  const [expanded, setExpanded] = useState<Record<string, boolean>>({}); // URL expand/collapse
  const clicksRef = useRef<Record<string, number>>({}); // Track previous click counts

  // Fetch all links from API
  async function fetchLinks() {
    try {
      const res = await fetch("/api/link", { cache: "no-store" });

      if (!res.ok) {
        const text = await res.text(); // Handle non-JSON responses
        console.error("/api/link error", res.status, text);
        toast.error("Failed to refresh links");
        return;
      }

      // Parse JSON safely
      let data: ShortLink[] = [];
      try {
        data = await res.json();
      } catch (parseErr) {
        console.error("Failed to parse links JSON", parseErr);
        toast.error("Invalid response while refreshing links");
        return;
      }

      setLinks(data);

      // Detect increased click counts and show a toast
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

  // Load links on mount + refresh when tab gets focus
  useEffect(() => {
    fetchLinks();
    function handleFocus() {
      fetchLinks();
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // Filter links by code or URL
  const filteredLinks = links.filter((l) => {
    if (!filter.trim()) return true;
    const q = filter.toLowerCase();
    return (
      (l.code || "").toLowerCase().includes(q) ||
      (l.target_url || "").toLowerCase().includes(q)
    );
  });

  // Format timestamps into readable local date/time
  function formatLocal(ts?: string | null) {
    if (!ts) return "Never";
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return String(ts);
    const tz = process.env.NEXT_PUBLIC_TIME_ZONE || undefined;

    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZoneName: "short",
      timeZone: tz,
    }).format(d);
  }

  // Create a new short link
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

    setUrl(""); // Reset form
    setCode("");
    setLoading(false);
    toast.success("Short URL created");
    fetchLinks(); // Refresh list
  }

  // Delete a short link using its code
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
              Create memorable, trackable URLs in seconds. Keep control of your
              brand with custom codes—no feature changes, just a better
              experience.
            </p>
            <div className="mt-6 flex gap-2">
              <span className="badge brand">Fast</span>
              <span className="badge">Custom codes</span>
              <span className="badge">No tracking bloat</span>
            </div>
          </div>

          {/* Form to create a link */}
          <form onSubmit={createLink} className="card flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target URL
              </label>
              <input
                className="input"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom code (optional)
              </label>
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

      {/* Search + table heading */}
      <div className="mt-10 mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Your Links</h2>
        <input
          className="input max-w-xs"
          placeholder="Search by code or URL"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Links table */}
      <table className="table">
        <thead>
          <tr className="text-left">
            <th className="p-3">Short Code</th>
            <th className="p-3">Target URL</th>
            <th className="p-3">Total Clicks</th>
            <th className="p-3">Last Clicked</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredLinks.map((l) => (
            <tr key={l.code} className="border-t">
              {/* Short code cell */}
              <td className="p-3" data-label="Short Code">
                <div className="flex items-center gap-2">
                  {/* Link preview */}
                  <a
                    href={`/${l.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-(--primary) hover:underline font-medium"
                  >
                    {l.code}
                  </a>

                  {/* Copy button */}
                  <button
                    onClick={() =>
                      navigator.clipboard
                        .writeText(
                          `${
                            process.env.NEXT_PUBLIC_BASE_URL ??
                            window.location.origin
                          }/${l.code}`
                        )
                        .then(() => toast.success("Copied short URL"))
                        .catch(() => toast.error("Copy failed"))
                    }
                    className="p-1 rounded hover:bg-gray-200"
                    title="Copy short URL"
                  >
                    {/* Clipboard icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4 text-gray-600"
                    >
                      <path d="M9 2a2 2 0 0 0-2 2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V8l-6-6H9zm8 9h-3a2 2 0 0 1-2-2V4l5 5z" />
                    </svg>
                  </button>
                </div>
              </td>

              {/* Target URL with See more/ Hide toggle */}
              <td className="p-3 align-top" data-label="Target URL">
                {(() => {
                  const text: string = l.target_url || "";
                  const limit = 60;
                  const isExpanded = !!expanded[l.code];

                  const shown = isExpanded
                    ? text
                    : text.length > limit
                    ? `${text.slice(0, limit)}…`
                    : text;

                  return (
                    <div className="wrap-break-word">
                      {shown}
                      {text.length > limit && (
                        <button
                          onClick={() =>
                            setExpanded((prev) => ({
                              ...prev,
                              [l.code]: !isExpanded,
                            }))
                          }
                          className="ml-2 text-(--primary) hover:underline"
                        >
                          {isExpanded ? "Hide" : "See more"}
                        </button>
                      )}
                    </div>
                  );
                })()}
              </td>

              {/* Click count */}
              <td className="p-3" data-label="Total Clicks">
                <span className="badge">{l.clicks}</span>
              </td>

              {/* Last click time */}
              <td className="p-3" data-label="Last Clicked">
                <span className="text-gray-700">
                  {formatLocal(l.last_clicked)}
                </span>
              </td>

              {/* Delete button */}
              <td className="p-3" data-label="Actions">
                <button
                  onClick={() => deleteLink(l.code)}
                  className="inline-flex items-center gap-1 text-red-600 hover:underline"
                >
                  {/* Delete icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                  >
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {/* Empty state */}
          {links.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-4 text-gray-500">
                No links created yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
