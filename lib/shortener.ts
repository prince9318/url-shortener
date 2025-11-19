export function generateCode(length = 6) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length })
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join("");
}

export function isValidUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidCode(code: string) {
  // Allow letters, numbers, dash, underscore. 3–10 chars to match DB (VARCHAR(10)).
  const c = (code || "").trim();
  return /^[A-Za-z0-9_-]{3,10}$/.test(c);
}
