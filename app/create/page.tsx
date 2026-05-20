import type { Metadata } from "next";
import ComicCreator from "./ComicCreator";

export const metadata: Metadata = {
  title: "Create a comic",
  description:
    "Drag and drop characters, backgrounds, and speech bubbles to make your own comic strip. Free, no sign-up.",
  alternates: { canonical: "/create" },
};

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Create a comic</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Pick from the sidebar, drag on the canvas, save when you&apos;re done.
        </p>
      </header>
      <ComicCreator />
    </div>
  );
}
