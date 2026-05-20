import path from "node:path";
import fs from "node:fs";

/**
 * Blob storage abstraction.
 *
 * - Production (BLOB_READ_WRITE_TOKEN set): uses @vercel/blob — durable,
 *   CDN-backed, returns a public https URL per panel.
 * - Development (no token): writes to `public/gen/{id}_{i}.png` so the
 *   existing /gen/* static path keeps working locally.
 */

const LOCAL_GEN_DIR = path.join(process.cwd(), "public", "gen");

function isProdBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function uploadComicPanel(
  comicId: string,
  panelIndex: number,
  data: Buffer,
): Promise<string> {
  const filename = `${comicId}_${panelIndex}.png`;

  if (isProdBlob()) {
    // Lazy import so dev installs don't pay the cost when unused.
    const { put } = await import("@vercel/blob");
    const blob = await put(`comics/${filename}`, data, {
      access: "public",
      contentType: "image/png",
      // Vercel Blob assigns a stable URL; no need to randomize within our scoped path.
      addRandomSuffix: false,
    });
    return blob.url;
  }

  // Local fs fallback
  fs.mkdirSync(LOCAL_GEN_DIR, { recursive: true });
  fs.writeFileSync(path.join(LOCAL_GEN_DIR, filename), data);
  return `/gen/${filename}`;
}

/**
 * Backfill helper for a row missing panel_urls_json (legacy data created
 * before the column existed). Reconstructs the local /gen/ path.
 */
export function legacyLocalPanelUrl(comicId: string, panelIndex: number): string {
  return `/gen/${comicId}_${panelIndex}.png`;
}
