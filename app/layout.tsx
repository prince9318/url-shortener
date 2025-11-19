import "./globals.css";
import type { Metadata } from "next";
import ToastClient from "@/components/ToastClient";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TinyLink – URL Shortener",
  description: "Create your own short links like Bitly",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-[var(--bg-start)] to-[var(--bg-end)] text-gray-900">
        <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand)] text-white font-bold">T</span>
              <span className="text-lg font-semibold tracking-tight">TinyLink</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <a href="/" className="text-gray-700 hover:text-gray-900">Dashboard</a>
              <a href="/healthz" className="text-gray-700 hover:text-gray-900">Health</a>
              <a href="https://bitly.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 hover:bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>
                Inspiration
              </a>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4">
          {children}
        </main>
        <ToastClient />
        <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-gray-600">
          <div className="flex items-center justify-center">
            <p>© {new Date().getFullYear()} TinyLink. 
              <span className="ml-1">Make links that get clicked.</span>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
