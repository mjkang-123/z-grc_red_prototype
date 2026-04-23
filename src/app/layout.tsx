import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Z-GRC — EN 18031 Self-Assessment",
  description: "RED Article 3.3 (d)(e)(f) self-assessment tool based on EN 18031-1/2/3.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b bg-card/60 backdrop-blur">
          <div className="container mx-auto flex h-14 items-center justify-between px-4">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="text-lg font-bold tracking-tight text-primary">Z-GRC</span>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                EN 18031 자가 평가 도구 · Self-Assessment
              </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                홈 / Home
              </Link>
            </nav>
          </div>
        </header>
        <main className="container mx-auto flex-1 px-4 py-8">{children}</main>
        <footer className="border-t py-4 text-center text-xs text-muted-foreground">
          Z-GRC · RED Art. 3.3 (d)(e)(f) · EN 18031-1 / -2 / -3
        </footer>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
