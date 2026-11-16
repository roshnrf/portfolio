import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { CommandPalette, type PaletteItem } from "@/components/CommandPalette";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { profile, site } from "@/data/profile";
import { getProjects } from "@/lib/content";
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
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Roshan Abdul Rauof · MSc Data Science at TU Dortmund",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: ["/opengraph-image"],
  },
  alternates: {
    types: { "application/rss+xml": "/updates/feed.xml" },
  },
};

export const viewport: Viewport = {
  themeColor: "#020203",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const paletteItems: PaletteItem[] = [
    { label: "Home", hint: "Page", href: "/" },
    ...getProjects().map((p) => ({
      label: p.title,
      hint: `Project · ${p.tagline}`,
      href: `/projects/${p.slug}`,
    })),
    { label: "Journey", hint: "Education and experience", href: "/#journey" },
    { label: "Skills", hint: "Section", href: "/#skills" },
    { label: "Updates", hint: "Page", href: "/updates" },
    { label: "Writing", hint: "Page", href: "/writing" },
    { label: "ML Playground", hint: "Interactive", href: "/playground" },
    { label: "Contact", hint: "Section", href: "/#contact" },
    { label: "Resume (PDF)", hint: "File", href: profile.links.resume, external: true },
    { label: "GitHub", hint: "External", href: profile.links.github, external: true },
    { label: "LinkedIn", hint: "External", href: profile.links.linkedin, external: true },
  ];

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
        <CommandPalette items={paletteItems} />
      </body>
    </html>
  );
}
