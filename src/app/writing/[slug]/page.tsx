import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getPost, getPosts } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

// Only the slugs in /content/writing exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    openGraph: { type: "article", title: post.title, description: post.summary },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl pb-8 pt-12 sm:pt-16">
      <Link href="/writing" className="text-sm text-ink2 hover:text-ink">
        <span aria-hidden="true">←</span> All writing
      </Link>
      <header className="mt-8">
        <p className="font-mono text-xs text-ink3">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post.readingTime && ` · ${post.readingTime}`}
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {post.title}
        </h1>
      </header>
      <div
        className="prose-md mt-8"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
    </article>
  );
}
