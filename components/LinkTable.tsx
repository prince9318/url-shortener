"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

export default function LinkTable({
  links,
  onDelete,
}: {
  links: any[];
  onDelete: (code: string) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  return (
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
                  className="text-(--primary)] hover:underline font-medium"
                >
                  {l.code}
                </a>
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

            <td className="p-3 max-w-xs">
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
                  <span>
                    {shown}
                    {text.length > limit && (
                      <button
                        onClick={() =>
                          setExpanded((prev) => ({
                            ...prev,
                            [l.code]: !isExpanded,
                          }))
                        }
                        className="ml-2 text-blue-600 hover:underline"
                      >
                        {isExpanded ? "Hide" : "See more"}
                      </button>
                    )}
                  </span>
                );
              })()}
            </td>

            <td className="p-3">
              <span className="badge">{l.clicks}</span>
            </td>

            <td className="p-3">
              <button
                onClick={() => onDelete(l.code)}
                className="inline-flex items-center gap-1 text-red-600 hover:underline"
              >
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

        {links.length === 0 && (
          <tr>
            <td colSpan={4} className="text-center py-4 text-gray-500">
              No links created yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
