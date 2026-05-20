"use client";
import type {
  Panel,
  PanelElement,
  Selection,
  CharacterElement,
  BubbleElement,
} from "@/lib/creator-types";

type Props = {
  selection: Selection;
  panels: Panel[];
  onUpdate: (panelId: string, next: PanelElement) => void;
  onDelete: () => void;
  onSendToBack: () => void;
  onBringToFront: () => void;
};

export default function PropertiesPanel({
  selection,
  panels,
  onUpdate,
  onDelete,
  onSendToBack,
  onBringToFront,
}: Props) {
  if (!selection) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="font-medium text-zinc-700 dark:text-zinc-300">
          Nothing selected
        </p>
        <p className="mt-1">
          Click any character or speech bubble on the canvas to edit it.
        </p>
      </div>
    );
  }

  const panel = panels.find((p) => p.id === selection.panelId);
  const el = panel?.elements.find((e) => e.id === selection.elementId);
  if (!el) return null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          {el.kind === "character" ? "Character" : "Speech bubble"}
        </p>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
        >
          Delete
        </button>
      </div>

      {el.kind === "character" && (
        <CharacterControls
          el={el}
          onChange={(next) => onUpdate(selection.panelId, next)}
        />
      )}
      {el.kind === "bubble" && (
        <BubbleControls
          el={el}
          onChange={(next) => onUpdate(selection.panelId, next)}
        />
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onSendToBack}
          className="rounded-md border border-zinc-300 px-2 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Send to back
        </button>
        <button
          type="button"
          onClick={onBringToFront}
          className="rounded-md border border-zinc-300 px-2 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Bring to front
        </button>
      </div>
    </div>
  );
}

function CharacterControls({
  el,
  onChange,
}: {
  el: CharacterElement;
  onChange: (next: CharacterElement) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Size: {Math.round(el.scale * 100)}%
        </label>
        <input
          type="range"
          min={0.4}
          max={2.5}
          step={0.05}
          value={el.scale}
          onChange={(e) => onChange({ ...el, scale: Number(e.target.value) })}
          className="w-full"
        />
      </div>
      <button
        type="button"
        onClick={() => onChange({ ...el, flipped: !el.flipped })}
        className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        {el.flipped ? "Unflip horizontally" : "Flip horizontally"}
      </button>
    </div>
  );
}

function BubbleControls({
  el,
  onChange,
}: {
  el: BubbleElement;
  onChange: (next: BubbleElement) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Text
        </label>
        <textarea
          value={el.text}
          onChange={(e) => onChange({ ...el, text: e.target.value })}
          rows={3}
          className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Style
        </label>
        <div className="grid grid-cols-3 gap-1">
          {(["speech", "thought", "caption"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onChange({ ...el, variant: v })}
              className={`rounded-md px-2 py-1.5 text-xs font-medium capitalize ${
                el.variant === v
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Width
          </label>
          <input
            type="number"
            min={80}
            max={400}
            value={el.width}
            onChange={(e) =>
              onChange({ ...el, width: Math.max(80, Number(e.target.value)) })
            }
            className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Height
          </label>
          <input
            type="number"
            min={40}
            max={300}
            value={el.height}
            onChange={(e) =>
              onChange({ ...el, height: Math.max(40, Number(e.target.value)) })
            }
            className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>
      </div>
    </div>
  );
}
