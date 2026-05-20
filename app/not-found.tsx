import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-7xl font-black tracking-tight">404</p>
      <h1 className="mt-4 text-2xl font-bold">This panel is missing</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        The page you&apos;re looking for couldn&apos;t be found. Maybe it was
        deleted, or maybe the link is wrong.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-zinc-900 px-6 py-3 font-semibold text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Back to home
      </Link>
    </div>
  );
}
