import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "10 tips for writing a good comic",
  description:
    "Ten practical tips for writing a great comic strip, from picking characters and choosing a theme to defining dialogue and storyboarding.",
  alternates: { canonical: "/ten-tips" },
  openGraph: {
    type: "article",
    title: "10 tips for writing a good comic",
    description:
      "Ten practical tips for writing a great comic strip — characters, theme, narrative, scenery, plotting, dialogue, storyboarding.",
  },
};

const tips: { title: string; body: string }[] = [
  {
    title: "Create your characters",
    body: "Decide on the characters you'll use. Characters are as important as the plot of the comic.",
  },
  {
    title: "Choose a theme",
    body: "Selecting the right theme decides how the plot plays out. Will it be fiction? Comical? Slice-of-life?",
  },
  {
    title: "Choose the tone of the narrative",
    body: "Is it a love story? A great adventure? Horror? Epic? Humorous? Build your first script in the spirit you like best — variation comes later.",
  },
  {
    title: "Choose or create the setting",
    body: "Set the scene. Where and when does your story unfold? What's the occupation of your main character, and what's their past?",
  },
  {
    title: "Find and organize your ideas",
    body: "Jot down notes — even if they aren't well-organized yet. You can structure them later.",
  },
  {
    title: "Construct a general plan",
    body: "Stick to a classic narrative shape: introduction → development & disruption (climax) → conclusion. This is a logical sequence readers know, and it reassures them that the story is going somewhere.",
  },
  {
    title: "Define the highlights of your comic",
    body: "Stories alternate between weak times (calm) and highlights (action, surprise). Before locking in a big event, imagine the consequences. If your heroes blow up the building they're fighting on — everyone's dead, story's over. Leave room for development.",
  },
  {
    title: "Develop and order the narrative",
    body: "List the key moments and highlights of your story. To see the shape clearly, sketch a chronological timeline.",
  },
  {
    title: "Define the dialogue",
    body: "Dialogue depends on the characters and the situation. Don't fixate on the first line you write — re-read several times, speak the characters out loud, vary the phrasing. The right line will come out naturally.",
  },
  {
    title: "Conduct the storyboard",
    body: "The final step bridges the writing of the story and the drawing of the panels. You can still correct or improve scenes, dialogue, even whole chapters at this stage.",
  },
];

export default function TenTipsPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
        Guide · 5 min read
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
        10 tips for writing a good comic
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
        A lot of people ask how to make a comic that stands out. Here are the
        ten things that matter most. Pick the ideas that fit your style — these
        aren&apos;t rules, they&apos;re prompts.
      </p>
      <ol className="mt-10 space-y-7">
        {tips.map((t, i) => (
          <li key={i} className="flex gap-4">
            <span
              aria-hidden
              className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white dark:bg-white dark:text-zinc-900"
            >
              {i + 1}
            </span>
            <div>
              <h2 className="text-xl font-semibold">{t.title}</h2>
              <p className="mt-1 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {t.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <hr className="my-10 border-zinc-200 dark:border-zinc-800" />
      <p className="text-lg">
        Ready to put it into practice?{" "}
        <Link
          href="/create"
          className="font-semibold text-zinc-900 underline decoration-2 underline-offset-4 hover:no-underline dark:text-zinc-100"
        >
          Start creating your own comic →
        </Link>
      </p>
    </article>
  );
}
