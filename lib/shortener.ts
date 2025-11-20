// Generate a random short code (default length = 6)
export function generateCode(length = 6) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  return Array.from({ length })
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join("");
}

// Validate URL format (must start with http or https)
export function isValidUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// Validate custom code format (3–10 chars, only letters, numbers, - and _)
export function isValidCode(code: string) {
  const c = (code || "").trim();
  return /^[A-Za-z0-9_-]{3,10}$/.test(c);
}
