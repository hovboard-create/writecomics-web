"use client";
import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { nanoid } from "nanoid";
import type Konva from "konva";
import {
  PANEL_WIDTH,
  PANEL_HEIGHT,
  DRAG_MIME_CHARACTER,
  DRAG_MIME_BACKGROUND,
  type Panel,
  type PanelElement,
  type CharacterElement,
  type BubbleElement,
  type Selection,
  type CharacterDragPayload,
  type BackgroundDragPayload,
} from "@/lib/creator-types";
import AssetSidebar from "./AssetSidebar";
import PropertiesPanel from "./PropertiesPanel";

// Konva touches `window` at import time → must be client-only.
const ComicCanvas = dynamic(() => import("./ComicCanvas"), { ssr: false });

const MAX_PANELS = 4;

function BubbleTemplate({
  label,
  variant,
  onClick,
}: {
  label: string;
  variant: BubbleElement["variant"];
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-32 flex-col items-center gap-1.5 rounded-xl border border-zinc-300 bg-white p-2 transition hover:border-zinc-900 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-100"
      aria-label={`Add ${label} bubble`}
    >
      <svg
        viewBox="0 0 120 60"
        className="h-12 w-full"
        aria-hidden
      >
        {variant === "speech" && (
          <>
            <path
              d="M10 8 h100 a8 8 0 0 1 8 8 v22 a8 8 0 0 1 -8 8 H60 l-10 10 l2 -10 H10 a8 8 0 0 1 -8 -8 V16 a8 8 0 0 1 8 -8 z"
              fill="white"
              stroke="#0f172a"
              strokeWidth="2"
            />
            <text x="60" y="32" textAnchor="middle" fontSize="14" fill="#0f172a" fontFamily="system-ui">Hi!</text>
          </>
        )}
        {variant === "thought" && (
          <>
            <rect
              x="6" y="6" width="108" height="40" rx="20" ry="20"
              fill="white"
              stroke="#0f172a"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <circle cx="42" cy="52" r="4" fill="white" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="34" cy="56" r="2.5" fill="white" stroke="#0f172a" strokeWidth="1.5" />
            <text x="60" y="32" textAnchor="middle" fontSize="14" fill="#0f172a" fontFamily="system-ui">...</text>
          </>
        )}
        {variant === "caption" && (
          <>
            <rect
              x="6" y="14" width="108" height="32" rx="4" ry="4"
              fill="#fde68a"
              stroke="#0f172a"
              strokeWidth="2"
            />
            <text x="60" y="36" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0f172a" fontFamily="system-ui">MEANWHILE...</text>
          </>
        )}
      </svg>
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}

function newPanel(): Panel {
  return { id: nanoid(8), background: null, elements: [] };
}

export default function ComicCreator() {
  const router = useRouter();
  const [panels, setPanels] = useState<Panel[]>(() => [newPanel()]);
  const [selection, setSelection] = useState<Selection>(null);
  const [saving, setSaving] = useState(false);
  const [activePanelId, setActivePanelId] = useState<string>(() => "");

  // First-render: set the active panel id once panels are populated.
  useEffect(() => {
    if (!activePanelId && panels[0]) setActivePanelId(panels[0].id);
  }, [activePanelId, panels]);

  // Stages registered by panel id, used at save time to export PNGs.
  const stagesRef = useRef<Map<string, Konva.Stage>>(new Map());
  const registerStage = useCallback((panelId: string, stage: Konva.Stage | null) => {
    if (stage) stagesRef.current.set(panelId, stage);
    else stagesRef.current.delete(panelId);
  }, []);

  // Mutate helpers
  const updatePanel = useCallback(
    (panelId: string, updater: (p: Panel) => Panel) => {
      setPanels((prev) =>
        prev.map((p) => (p.id === panelId ? updater(p) : p)),
      );
    },
    [],
  );

  const updateElement = useCallback(
    (panelId: string, next: PanelElement) => {
      updatePanel(panelId, (p) => ({
        ...p,
        elements: p.elements.map((e) => (e.id === next.id ? next : e)),
      }));
    },
    [updatePanel],
  );

  // Internal helper for placing a character at a chosen position.
  const placeCharacterAt = useCallback(
    (
      panelId: string,
      src: string,
      w: number,
      h: number,
      cx: number,
      cy: number,
    ) => {
      const el: CharacterElement = {
        kind: "character",
        id: nanoid(8),
        src,
        naturalWidth: w,
        naturalHeight: h,
        x: Math.round(cx - w / 2),
        y: Math.round(cy - h / 2),
        scale: 1,
        flipped: false,
      };
      updatePanel(panelId, (p) => ({ ...p, elements: [...p.elements, el] }));
      setSelection({ panelId, elementId: el.id });
    },
    [updatePanel],
  );

  // Click-to-add: drops near the bottom-center so the character is "in scene".
  const addCharacter = useCallback(
    (_file: string, src: string, w: number, h: number) => {
      const targetPanelId = activePanelId || panels[0]?.id;
      if (!targetPanelId) return;
      placeCharacterAt(
        targetPanelId,
        src,
        w,
        h,
        PANEL_WIDTH / 2,
        PANEL_HEIGHT - h / 2 - 30,
      );
    },
    [activePanelId, panels, placeCharacterAt],
  );

  // Drag-and-drop from sidebar onto a panel.
  const handleCanvasDrop = useCallback(
    (
      panelId: string,
      e: DragEvent<HTMLDivElement>,
      coords: { x: number; y: number },
    ) => {
      const charData = e.dataTransfer.getData(DRAG_MIME_CHARACTER);
      if (charData) {
        try {
          const p = JSON.parse(charData) as CharacterDragPayload;
          placeCharacterAt(panelId, p.src, p.width, p.height, coords.x, coords.y);
        } catch {
          /* ignore malformed payload */
        }
        return;
      }
      const bgData = e.dataTransfer.getData(DRAG_MIME_BACKGROUND);
      if (bgData) {
        try {
          const p = JSON.parse(bgData) as BackgroundDragPayload;
          updatePanel(panelId, (panel) => ({ ...panel, background: { src: p.src } }));
        } catch {
          /* ignore */
        }
      }
    },
    [placeCharacterAt, updatePanel],
  );

  const setBackground = useCallback(
    (src: string) => {
      const targetPanelId = activePanelId || panels[0]?.id;
      if (!targetPanelId) return;
      updatePanel(targetPanelId, (p) => ({ ...p, background: { src } }));
    },
    [activePanelId, panels, updatePanel],
  );

  const addBubble = useCallback(
    (variant: BubbleElement["variant"]) => {
      const targetPanelId = activePanelId || panels[0]?.id;
      if (!targetPanelId) return;
      const width = 180;
      const height = variant === "caption" ? 50 : 90;
      const el: BubbleElement = {
        kind: "bubble",
        id: nanoid(8),
        variant,
        text:
          variant === "caption"
            ? "MEANWHILE..."
            : variant === "thought"
              ? "Hmm..."
              : "Hello!",
        x: PANEL_WIDTH / 2 - width / 2,
        y: 30,
        width,
        height,
        tailX: width / 2,
        tailY: height + 30,
      };
      updatePanel(targetPanelId, (p) => ({
        ...p,
        elements: [...p.elements, el],
      }));
      setSelection({ panelId: targetPanelId, elementId: el.id });
    },
    [activePanelId, panels, updatePanel],
  );

  const addPanel = useCallback(() => {
    if (panels.length >= MAX_PANELS) return;
    const p = newPanel();
    setPanels((prev) => [...prev, p]);
    setActivePanelId(p.id);
  }, [panels.length]);

  const removePanel = useCallback(
    (panelId: string) => {
      setPanels((prev) => {
        if (prev.length <= 1) return prev; // always keep at least one
        const next = prev.filter((p) => p.id !== panelId);
        if (activePanelId === panelId && next[0]) setActivePanelId(next[0].id);
        return next;
      });
      if (selection?.panelId === panelId) setSelection(null);
    },
    [activePanelId, selection],
  );

  const deleteSelected = useCallback(() => {
    if (!selection) return;
    updatePanel(selection.panelId, (p) => ({
      ...p,
      elements: p.elements.filter((e) => e.id !== selection.elementId),
    }));
    setSelection(null);
  }, [selection, updatePanel]);

  const reorderSelected = useCallback(
    (direction: "back" | "front") => {
      if (!selection) return;
      updatePanel(selection.panelId, (p) => {
        const others = p.elements.filter((e) => e.id !== selection.elementId);
        const target = p.elements.find((e) => e.id === selection.elementId);
        if (!target) return p;
        return {
          ...p,
          elements:
            direction === "back" ? [target, ...others] : [...others, target],
        };
      });
    },
    [selection, updatePanel],
  );

  // Keyboard: delete/backspace removes selected
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!selection) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelected();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selection, deleteSelected]);

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      // Clear selection synchronously so the dashed outline isn't burned into the PNG.
      flushSync(() => setSelection(null));

      // Export each panel at full PANEL_WIDTH × PANEL_HEIGHT × 2 regardless of
      // the responsive stage size on-screen.
      const panelImages: string[] = [];
      for (const p of panels) {
        const stage = stagesRef.current.get(p.id);
        if (!stage) {
          throw new Error(`Stage missing for panel ${p.id}`);
        }
        const currentStageWidth = stage.width();
        const targetWidth = PANEL_WIDTH * 2; // 2x for retina-quality saves
        const pixelRatio = currentStageWidth > 0 ? targetWidth / currentStageWidth : 2;
        const dataUrl = stage.toDataURL({
          pixelRatio,
          mimeType: "image/png",
        });
        panelImages.push(dataUrl);
      }

      const res = await fetch("/api/comics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          panels: panels.map((p, i) => ({
            background: p.background,
            elements: p.elements,
            image: panelImages[i],
          })),
        }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Save failed: ${msg}`);
      }
      const { id } = (await res.json()) as { id: string };
      router.push(`/comics/${id}`);
    } catch (err) {
      console.error(err);
      alert(`Couldn't save comic: ${err instanceof Error ? err.message : err}`);
      setSaving(false);
    }
  }, [panels, router, saving]);

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)_280px]">
      {/* Left: asset picker */}
      <div className="lg:max-h-[calc(100vh-160px)] lg:sticky lg:top-20">
        <div className="lg:h-[calc(100vh-160px)]">
          <AssetSidebar
            onAddCharacter={addCharacter}
            onSetBackground={setBackground}
          />
        </div>
      </div>

      {/* Center: canvas + add controls */}
      <div className="space-y-6">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Add dialog
          </p>
          <div className="flex flex-wrap gap-3">
            <BubbleTemplate
              label="Speech"
              variant="speech"
              onClick={() => addBubble("speech")}
            />
            <BubbleTemplate
              label="Thought"
              variant="thought"
              onClick={() => addBubble("thought")}
            />
            <BubbleTemplate
              label="Caption"
              variant="caption"
              onClick={() => addBubble("caption")}
            />
          </div>
        </div>

        <div className="space-y-8">
          {panels.map((panel, idx) => (
            <div
              key={panel.id}
              className={`relative rounded-xl p-3 transition ${
                activePanelId === panel.id
                  ? "ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-zinc-950"
                  : ""
              }`}
              onMouseDownCapture={() => setActivePanelId(panel.id)}
            >
              <div className="flex justify-center">
                <ComicCanvas
                  panel={panel}
                  panelIndex={idx}
                  selection={selection}
                  onSelect={setSelection}
                  onUpdateElement={updateElement}
                  registerStage={registerStage}
                  onDrop={handleCanvasDrop}
                />
              </div>
              {panels.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePanel(panel.id)}
                  className="absolute right-3 top-3 rounded-md bg-white/95 px-2 py-1 text-xs font-semibold text-red-700 shadow ring-1 ring-zinc-200 hover:bg-red-50 dark:bg-zinc-900/95 dark:text-red-400 dark:ring-zinc-700"
                  aria-label={`Remove panel ${idx + 1}`}
                >
                  Remove panel
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={addPanel}
            disabled={panels.length >= MAX_PANELS}
            className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            + Add panel ({panels.length}/{MAX_PANELS})
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save & share →"}
          </button>
        </div>
      </div>

      {/* Right: properties */}
      <div className="lg:sticky lg:top-20 space-y-4">
        <PropertiesPanel
          selection={selection}
          panels={panels}
          onUpdate={updateElement}
          onDelete={deleteSelected}
          onSendToBack={() => reorderSelected("back")}
          onBringToFront={() => reorderSelected("front")}
        />
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-2 font-medium text-zinc-700 dark:text-zinc-300">
            Tips
          </p>
          <ul className="space-y-1">
            <li>• Click a character or bubble to select it.</li>
            <li>• Drag to move. Press Delete to remove.</li>
            <li>• The blue-ringed panel receives new items.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
