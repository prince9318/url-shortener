"use client";

import { useState } from "react";

export default function LinkForm({
  onCreate,
}: {
  onCreate: (url: string, code: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");

  function handleSubmit(e: any) {
    e.preventDefault();
    onCreate(url, code);
    setUrl("");
    setCode("");
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
      <input
        className="input"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
      />

      <input
        className="input"
        placeholder="custom code (optional)"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <button className="btn-primary" type="submit">
        Create Link
      </button>
    </form>
  );
}
