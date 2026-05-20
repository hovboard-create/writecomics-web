import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-8 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
        <p>
          © {new Date().getFullYear()} WriteComics. Make comics. Have fun.
        </p>
        <nav className="flex gap-4">
          <Link href="/create" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            Create
          </Link>
          <Link href="/ten-tips" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            Tips
          </Link>
        </nav>
      </div>
    </footer>
  );
}
