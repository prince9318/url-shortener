"use client";

import { useState, Fragment } from "react";
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
    <div className="overflow-x-auto">
      <table className="table table-fixed w-full">
        <colgroup>
          <col style={{ width: "15%" }} />
          <col style={{ width: "55%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "20%" }} />
        </colgroup>

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
            <Fragment key={l.code}>
              <tr className="border-t">
                {/* Short code */}
                <td className="p-3" data-label="Short Code">
                  <div className="flex items-center gap-2">
                    <a
                      href={`/${l.code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-(--primary) hover:underline font-medium"
                    >
                      {l.code}
                    </a>

                    {/* Copy short URL */}
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

                {/* Target URL with See More (correct behavior) */}
                <td className="p-3 min-w-0 align-top" data-label="Target URL">
                  {(() => {
                    const text: string = l.target_url || "";
                    const limit = 80;
                    const isExpanded = !!expanded[l.code];

                    return (
                      <div className="text-sm text-gray-800 whitespace-normal wrap-break-word">
                        {/* Truncated text */}
                        {!isExpanded && (
                          <div className="truncate">
                            {text.length > limit
                              ? `${text.slice(0, limit)}…`
                              : text}
                          </div>
                        )}

                        {/* Full expanded text INSIDE SAME CELL */}
                        {isExpanded && (
                          <div className="whitespace-normal wrap-break-word">
                            {text}
                          </div>
                        )}

                        {/* Toggle button */}
                        {text.length > limit && (
                          <button
                            onClick={() =>
                              setExpanded((prev) => ({
                                ...prev,
                                [l.code]: !isExpanded,
                              }))
                            }
                            className="mt-1 inline-block text-(--primary) hover:underline text-sm"
                          >
                            {isExpanded ? "Hide" : "See more"}
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </td>

                {/* Click count */}
                <td className="p-3" data-label="Clicks">
                  <span className="badge">{l.clicks}</span>
                </td>

                {/* Delete button */}
                <td className="p-3" data-label="Actions">
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
            </Fragment>
          ))}

          {/* Empty state */}
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
