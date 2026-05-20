"use client";
import { useState } from "react";
import Image from "next/image";
import {
  CHARACTERS,
  BACKGROUNDS,
  CHARACTER_CATEGORIES,
  type CharCategory,
} from "@/lib/assets";
import {
  DRAG_MIME_CHARACTER,
  DRAG_MIME_BACKGROUND,
  type CharacterDragPayload,
  type BackgroundDragPayload,
} from "@/lib/creator-types";

type Tab = CharCategory | "backgrounds";

type Props = {
  onAddCharacter: (file: string, src: string, w: number, h: number) => void;
  onSetBackground: (src: string) => void;
  initialTab?: Tab;
};

export default function AssetSidebar({
  onAddCharacter,
  onSetBackground,
  initialTab = "backgrounds",
}: Props) {
  const [tab, setTab] = useState<Tab>(initialTab);

  const tabs: { key: Tab; label: string; count: number }[] = [
    ...CHARACTER_CATEGORIES.map((cat) => ({
      key: cat as Tab,
      label: cat[0].toUpperCase() + cat.slice(1),
      count: CHARACTERS.filter((c) => c.category === cat).length,
    })),
    { key: "backgrounds", label: "Scenes", count: BACKGROUNDS.length },
  ];

  return (
    <aside className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap gap-1 border-b border-zinc-200 p-2 dark:border-zinc-800">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              tab === t.key
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-[10px] opacity-60">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {tab === "backgrounds" ? (
          <div className="grid grid-cols-2 gap-2">
            {BACKGROUNDS.map((b) => {
              const payload: BackgroundDragPayload = { src: b.src };
              return (
                <button
                  key={b.file}
                  type="button"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      DRAG_MIME_BACKGROUND,
                      JSON.stringify(payload),
                    );
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  onClick={() => onSetBackground(b.src)}
                  className="cursor-grab overflow-hidden rounded-md border border-zinc-200 transition hover:ring-2 hover:ring-blue-500 active:cursor-grabbing dark:border-zinc-800"
                  aria-label={`Set background: ${b.file}`}
                  title="Click to apply, or drag onto a panel"
                >
                  <Image
                    src={b.src}
                    alt=""
                    width={b.width}
                    height={b.height}
                    className="h-full w-full object-cover"
                    draggable={false}
                    unoptimized
                  />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {CHARACTERS.filter((c) => c.category === tab).map((c) => {
              const payload: CharacterDragPayload = {
                src: c.src,
                width: c.width,
                height: c.height,
              };
              return (
                <button
                  key={c.file}
                  type="button"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      DRAG_MIME_CHARACTER,
                      JSON.stringify(payload),
                    );
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  onClick={() => onAddCharacter(c.file, c.src, c.width, c.height)}
                  className="flex aspect-square cursor-grab items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 p-1.5 transition hover:ring-2 hover:ring-blue-500 active:cursor-grabbing dark:border-zinc-800 dark:bg-zinc-800"
                  aria-label={`Add ${c.category} character`}
                  title="Click to add, or drag onto a panel"
                >
                  <Image
                    src={c.src}
                    alt={`${c.category} character`}
                    width={c.width}
                    height={c.height}
                    className="max-h-full max-w-full"
                    draggable={false}
                    unoptimized
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <p className="border-t border-zinc-200 p-3 text-[11px] text-zinc-500 dark:border-zinc-800">
        Click or drag onto a panel. Drag on the canvas to reposition.
      </p>
    </aside>
  );
}
