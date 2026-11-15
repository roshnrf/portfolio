import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { site } from "@/data/profile";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jb = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jb" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s · ${site.name}` },
  description: site.description,
  authors: [{ name: site.name, url: site.url }],
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#020203",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jb.variable}`}>
      <body className="min-h-screen">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <div className="blobs" aria-hidden="true">
          <div className="blob blob-a" />
          <div className="blob blob-b" />
          <div className="blob blob-c" />
        </div>
        <Nav />
        <main id="main" className="mx-auto max-w-5xl px-5 pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
