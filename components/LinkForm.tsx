"use client";

import { useState } from "react";

export default function LinkForm({
  onCreate,
}: {
  onCreate: (url: string, code: string) => void;
}) {
  // Local state for URL input
  const [url, setUrl] = useState("");

  // Local state for custom code input
  const [code, setCode] = useState("");

  // Handle form submission
  function handleSubmit(e: any) {
    e.preventDefault(); // Prevent page reload
    onCreate(url, code); // Trigger parent callback with values
    setUrl(""); // Reset URL input
    setCode(""); // Reset code input
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
      {/* Target URL input field */}
      <input
        className="input"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
      />

      {/* Custom code input */}
      <input
        className="input"
        placeholder="custom code (optional)"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      {/* Submit button */}
      <button className="btn-primary" type="submit">
        Create Link
      </button>
    </form>
  );
}
