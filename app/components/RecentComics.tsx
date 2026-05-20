import Link from "next/link";
import Image from "next/image";
import { recentComics } from "@/lib/db";
import { legacyLocalPanelUrl } from "@/lib/storage";

function firstPanelUrl(c: {
  id: string;
  panel_count: number;
  panel_urls_json: string;
}): string {
  try {
    const parsed = JSON.parse(c.panel_urls_json);
    if (Array.isArray(parsed) && parsed.length > 0) return String(parsed[0]);
  } catch {
    /* fall through */
  }
  return legacyLocalPanelUrl(c.id, 0);
}

export default async function RecentComics({ limit = 16 }: { limit?: number }) {
  let rows;
  try {
    rows = await recentComics(limit);
  } catch {
    // DB unavailable (first deploy, schema not migrated yet, etc.) — fail
    // silently and render nothing.
    return null;
  }
  if (rows.length === 0) return null;

  return (
    <section
      aria-label="Recently created comics"
      className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Recently created comics
          </h2>
          <span className="text-xs text-zinc-500">
            {rows.length} comic{rows.length === 1 ? "" : "s"}
          </span>
        </div>
        <ul
          className="-mx-2 flex snap-x snap-mandatory gap-3 overflow-x-auto px-2 pb-2"
          style={{ scrollbarWidth: "thin" }}
        >
          {rows.map((c) => {
            const created = new Date(c.created_at);
            return (
              <li key={c.id} className="shrink-0 snap-start">
                <Link
                  href={`/comics/${c.id}`}
                  className="group block w-44 overflow-hidden rounded-lg border-2 border-zinc-900 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-100 dark:bg-zinc-900"
                  aria-label={`Comic ${c.id}, ${c.panel_count} panel${c.panel_count === 1 ? "" : "s"}`}
                >
                  <div className="aspect-[3/2] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <Image
                      src={firstPanelUrl(c)}
                      alt=""
                      width={300}
                      height={200}
                      className="h-full w-full object-cover transition group-hover:scale-[1.03]"
                      unoptimized
                    />
                  </div>
                  <div className="flex items-center justify-between border-t border-zinc-900 px-2 py-1 text-[10px] dark:border-zinc-100">
                    <span className="font-semibold">
                      {c.panel_count} panel{c.panel_count === 1 ? "" : "s"}
                    </span>
                    <span className="text-zinc-500">
                      {created.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
