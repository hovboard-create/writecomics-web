import Link from "next/link";
import ComicCreator from "./create/ComicCreator";
import RecentComics from "./components/RecentComics";
import { CHARACTERS, BACKGROUNDS } from "@/lib/assets";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://writecomics.com";

// Re-render at most every 30s so newly saved comics show up in the "recently
// created" strip without forcing a full SSR on every request.
export const revalidate = 30;

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "WriteComics",
    url: SITE_URL,
    applicationCategory: "DesignApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Free in-browser comic creator. Drag characters, backgrounds, and speech bubbles to make your own comic strip.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Compact intro — keeps the SEO copy without burying the creator */}
      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
          <p className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold tracking-wide text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
            Free · No sign-up · Works in your browser
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Make a comic strip — start below.
          </h1>
          <p className="mt-1 max-w-prose text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
            Pick a scene, drop in characters, add speech bubbles. {CHARACTERS.length}{" "}
            characters and {BACKGROUNDS.length} backgrounds, classroom-friendly.{" "}
            <Link
              href="/ten-tips"
              className="font-semibold underline decoration-2 underline-offset-4 hover:no-underline"
            >
              Need ideas? Read 10 tips →
            </Link>
          </p>
        </div>
      </section>

      {/* Recently created — horizontal strip across the top */}
      <RecentComics limit={16} />

      {/* The embedded creator — front and center */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <ComicCreator />
      </section>

      {/* SEO social proof + tips link, below the fold */}
      <section className="bg-zinc-100 dark:bg-zinc-900">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Recognized by educators
          </p>
          <blockquote className="mt-3 text-lg font-medium text-zinc-900 dark:text-zinc-100 sm:text-xl">
            &ldquo;A great way for students to create comic strips —&nbsp;no
            account required, just pick characters, add a background, and add
            dialog.&rdquo;
          </blockquote>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            — Featured as Tech Tool of the Month,{" "}
            <a
              href="https://teachersfirst.com/blog/2017/09/tech-tool-of-the-month-writecomics-com/"
              className="underline hover:no-underline"
              target="_blank"
              rel="noopener"
            >
              TeachersFirst
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
