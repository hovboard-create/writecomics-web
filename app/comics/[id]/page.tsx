import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getComic } from "@/lib/db";
import { legacyLocalPanelUrl } from "@/lib/storage";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://writecomics.com";

type Props = { params: Promise<{ id: string }> };

/**
 * Resolve panel image URLs from the DB row, with a fallback for legacy rows
 * created before the panel_urls_json column existed.
 */
function resolvePanelUrls(
  panelUrlsJson: string,
  comicId: string,
  panelCount: number,
): string[] {
  try {
    const parsed = JSON.parse(panelUrlsJson);
    if (Array.isArray(parsed) && parsed.length === panelCount) {
      return parsed.map((u) => String(u));
    }
  } catch {
    /* fall through to legacy reconstruction */
  }
  // Legacy rows: assume the original /gen/{id}_{i}.png convention.
  return Array.from({ length: panelCount }, (_, i) =>
    legacyLocalPanelUrl(comicId, i),
  );
}

function absoluteUrl(maybeRelative: string): string {
  if (/^https?:\/\//.test(maybeRelative)) return maybeRelative;
  return `${SITE_URL}${maybeRelative}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!/^[a-zA-Z0-9_-]{1,32}$/.test(id)) return { title: "Comic not found" };
  const comic = await getComic(id);
  if (!comic) return { title: "Comic not found" };
  const urls = resolvePanelUrls(comic.panel_urls_json, id, comic.panel_count);
  const ogImage = absoluteUrl(urls[0] ?? "/og.png");
  const title = `Comic #${id}`;
  return {
    title,
    description: `View this user-created ${comic.panel_count}-panel comic strip on WriteComics. Make your own — free, no sign-up.`,
    alternates: { canonical: `/comics/${id}` },
    openGraph: {
      type: "article",
      title: `${title} on WriteComics`,
      description: "A user-created comic strip on WriteComics.",
      images: [{ url: ogImage, width: 1200, height: 800 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} on WriteComics`,
      images: [ogImage],
    },
  };
}

export default async function ComicPage({ params }: Props) {
  const { id } = await params;
  if (!/^[a-zA-Z0-9_-]{1,32}$/.test(id)) notFound();
  const comic = await getComic(id);
  if (!comic) notFound();

  const panelImages = resolvePanelUrls(comic.panel_urls_json, id, comic.panel_count);
  const created = new Date(comic.created_at);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Comic #{id}
          </p>
          <h1 className="text-2xl font-bold sm:text-3xl">
            A {comic.panel_count}-panel comic
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Created{" "}
            {created.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        <Link
          href="/create"
          className="hidden sm:inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Make your own →
        </Link>
      </header>

      <div className="space-y-4">
        {panelImages.map((src, i) => (
          <figure
            key={src}
            className="overflow-hidden rounded-xl border-2 border-zinc-900 bg-white shadow-md dark:border-zinc-100 dark:bg-zinc-900"
          >
            <Image
              src={src}
              alt={`Panel ${i + 1} of comic ${id}`}
              width={1200}
              height={800}
              className="h-auto w-full"
              unoptimized
              priority={i === 0}
            />
          </figure>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <p className="font-semibold">Want to make one?</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            It&apos;s free, takes a couple of minutes, and needs no account.
          </p>
        </div>
        <Link
          href="/create"
          className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Open the creator →
        </Link>
      </div>
    </div>
  );
}
