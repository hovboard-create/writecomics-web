import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { ensureSchema, insertComic } from "@/lib/db";
import { uploadComicPanel } from "@/lib/storage";

export const runtime = "nodejs";

const MAX_PANELS = 4;
const MAX_DATAURL_BYTES = 4 * 1024 * 1024; // 4MB per panel

type PanelPayload = {
  background: { src: string } | null;
  elements: unknown[];
  image: string; // data:image/png;base64,...
};

function decodePng(dataUrl: string): Buffer {
  const m = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!m) throw new Error("Invalid PNG dataURL");
  return Buffer.from(m[1], "base64");
}

export async function POST(req: Request) {
  let body: { panels?: PanelPayload[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const panels = body.panels;
  if (!Array.isArray(panels) || panels.length < 1 || panels.length > MAX_PANELS) {
    return NextResponse.json(
      { error: `Need 1–${MAX_PANELS} panels` },
      { status: 400 },
    );
  }
  for (const p of panels) {
    if (typeof p?.image !== "string" || p.image.length > MAX_DATAURL_BYTES) {
      return NextResponse.json(
        { error: "Each panel needs a valid PNG (max 4MB)" },
        { status: 400 },
      );
    }
  }

  await ensureSchema();

  const id = nanoid(10);

  // Decode + persist each panel; collect storage URLs.
  const panelUrls: string[] = [];
  for (let i = 0; i < panels.length; i++) {
    let buf: Buffer;
    try {
      buf = decodePng(panels[i].image);
    } catch {
      return NextResponse.json(
        { error: `Panel ${i + 1}: invalid PNG dataURL` },
        { status: 400 },
      );
    }
    const url = await uploadComicPanel(id, i, buf);
    panelUrls.push(url);
  }

  // Persist metadata (without the heavy dataURL).
  const stripped = panels.map((p) => ({
    background: p.background,
    elements: p.elements,
  }));
  await insertComic({
    id,
    panel_count: panels.length,
    metadata_json: JSON.stringify(stripped),
    panel_urls_json: JSON.stringify(panelUrls),
    created_at: Date.now(),
  });

  return NextResponse.json({ id, urls: panelUrls });
}
