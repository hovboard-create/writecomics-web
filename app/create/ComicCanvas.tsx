"use client";
import { useRef, useEffect, useState, type DragEvent } from "react";
import { Stage, Layer, Image as KImage, Group, Rect, Text, Line } from "react-konva";
import type Konva from "konva";
import {
  PANEL_WIDTH,
  PANEL_HEIGHT,
  type Panel,
  type PanelElement,
  type CharacterElement,
  type BubbleElement,
  type Selection,
} from "@/lib/creator-types";
import { useImage } from "@/lib/use-image";

type Props = {
  panel: Panel;
  panelIndex: number;
  selection: Selection;
  onSelect: (sel: Selection) => void;
  onUpdateElement: (panelId: string, el: PanelElement) => void;
  registerStage: (panelId: string, stage: Konva.Stage | null) => void;
  onDrop?: (
    panelId: string,
    e: DragEvent<HTMLDivElement>,
    panelCoords: { x: number; y: number },
  ) => void;
};

export default function ComicCanvas({
  panel,
  panelIndex,
  selection,
  onSelect,
  onUpdateElement,
  registerStage,
  onDrop,
}: Props) {
  const stageRef = useRef<Konva.Stage | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [stageWidth, setStageWidth] = useState(PANEL_WIDTH);

  useEffect(() => {
    registerStage(panel.id, stageRef.current);
    return () => registerStage(panel.id, null);
  }, [panel.id, registerStage]);

  // Track wrapper width so we can size the Konva Stage responsively while
  // keeping internal coordinates at PANEL_WIDTH × PANEL_HEIGHT.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setStageWidth(w);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = stageWidth / PANEL_WIDTH;
  const stageHeight = stageWidth * (PANEL_HEIGHT / PANEL_WIDTH);

  const isSelectedHere =
    selection?.panelId === panel.id ? selection.elementId : null;

  function clientToPanelCoords(clientX: number, clientY: number) {
    // Account for CSS scaling: stage canvas may be smaller than internal coords.
    const el = wrapRef.current;
    if (!el) return { x: PANEL_WIDTH / 2, y: PANEL_HEIGHT / 2 };
    const rect = el.getBoundingClientRect();
    const sx = PANEL_WIDTH / rect.width;
    const sy = PANEL_HEIGHT / rect.height;
    return {
      x: (clientX - rect.left) * sx,
      y: (clientY - rect.top) * sy,
    };
  }

  return (
    <div
      ref={wrapRef}
      className={`comic-panel-wrap relative w-full ${
        isDragOver ? "ring-4 ring-blue-400 ring-offset-2" : ""
      }`}
      style={{
        maxWidth: `${PANEL_WIDTH}px`,
        aspectRatio: `${PANEL_WIDTH} / ${PANEL_HEIGHT}`,
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragOver={(e) => {
        // preventDefault is REQUIRED to allow drops
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={(e) => {
        // Only un-highlight if leaving the wrapper itself
        if (e.target === wrapRef.current) setIsDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const coords = clientToPanelCoords(e.clientX, e.clientY);
        onDrop?.(panel.id, e, coords);
      }}
    >
      <div className="absolute -top-3 -left-3 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white shadow ring-2 ring-white dark:bg-white dark:text-zinc-900 dark:ring-zinc-900">
        {panelIndex + 1}
      </div>
      <Stage
        ref={stageRef}
        width={stageWidth}
        height={stageHeight}
        scaleX={scale}
        scaleY={scale}
        className="comic-panel-stage block overflow-hidden rounded-xl border-2 border-zinc-900 bg-white shadow-md dark:border-zinc-100 dark:bg-zinc-800"
        onMouseDown={(e) => {
          // Click on empty stage = clear selection
          if (e.target === e.target.getStage()) {
            onSelect(null);
          }
        }}
        onTouchStart={(e) => {
          if (e.target === e.target.getStage()) onSelect(null);
        }}
      >
        <Layer>
          {/* Background layer */}
          {panel.background && (
            <BackgroundImage src={panel.background.src} />
          )}
        </Layer>

        <Layer>
          {/* Element layer */}
          {panel.elements.map((el) => {
            const selected = isSelectedHere === el.id;
            if (el.kind === "character") {
              return (
                <CharacterNode
                  key={el.id}
                  el={el}
                  selected={selected}
                  onSelect={() => onSelect({ panelId: panel.id, elementId: el.id })}
                  onChange={(next) => onUpdateElement(panel.id, next)}
                />
              );
            }
            return (
              <BubbleNode
                key={el.id}
                el={el}
                selected={selected}
                onSelect={() => onSelect({ panelId: panel.id, elementId: el.id })}
                onChange={(next) => onUpdateElement(panel.id, next)}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}

function BackgroundImage({ src }: { src: string }) {
  const [img] = useImage(src);
  if (!img) return null;
  return (
    <KImage
      image={img}
      x={0}
      y={0}
      width={PANEL_WIDTH}
      height={PANEL_HEIGHT}
      listening={false}
    />
  );
}

function CharacterNode({
  el,
  selected,
  onSelect,
  onChange,
}: {
  el: CharacterElement;
  selected: boolean;
  onSelect: () => void;
  onChange: (next: CharacterElement) => void;
}) {
  const [img] = useImage(el.src);
  const w = el.naturalWidth * el.scale;
  const h = el.naturalHeight * el.scale;
  if (!img) return null;
  return (
    <Group
      x={el.x}
      y={el.y}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={(e) => {
        onSelect();
        const c = e.target.getStage()?.container();
        if (c) c.style.cursor = "grabbing";
      }}
      onDragEnd={(e) => {
        const c = e.target.getStage()?.container();
        if (c) c.style.cursor = "grab";
        onChange({ ...el, x: e.target.x(), y: e.target.y() });
      }}
      onMouseEnter={(e) => {
        const c = e.target.getStage()?.container();
        if (c) c.style.cursor = "grab";
      }}
      onMouseLeave={(e) => {
        const c = e.target.getStage()?.container();
        if (c) c.style.cursor = "default";
      }}
    >
      <KImage
        image={img}
        width={w}
        height={h}
        scaleX={el.flipped ? -1 : 1}
        x={el.flipped ? w : 0}
      />
      {selected && (
        <Rect
          x={-2}
          y={-2}
          width={w + 4}
          height={h + 4}
          stroke="#2563eb"
          strokeWidth={2}
          dash={[6, 4]}
          listening={false}
        />
      )}
    </Group>
  );
}

function BubbleNode({
  el,
  selected,
  onSelect,
  onChange,
}: {
  el: BubbleElement;
  selected: boolean;
  onSelect: () => void;
  onChange: (next: BubbleElement) => void;
}) {
  const fill = el.variant === "caption" ? "#fde68a" : "#ffffff";
  const stroke = "#0f172a";
  const isThought = el.variant === "thought";

  // Speech tail (only for speech bubbles, not captions or thought clouds)
  const tailPath =
    el.variant === "speech"
      ? [
          el.width * 0.35,
          el.height,
          el.width * 0.5,
          el.height,
          el.tailX,
          el.tailY,
        ]
      : null;

  return (
    <Group
      x={el.x}
      y={el.y}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={(e) => {
        onSelect();
        const c = e.target.getStage()?.container();
        if (c) c.style.cursor = "grabbing";
      }}
      onDragEnd={(e) => {
        const c = e.target.getStage()?.container();
        if (c) c.style.cursor = "grab";
        onChange({ ...el, x: e.target.x(), y: e.target.y() });
      }}
      onMouseEnter={(e) => {
        const c = e.target.getStage()?.container();
        if (c) c.style.cursor = "grab";
      }}
      onMouseLeave={(e) => {
        const c = e.target.getStage()?.container();
        if (c) c.style.cursor = "default";
      }}
    >
      {tailPath && (
        <Line
          points={tailPath}
          closed
          fill={fill}
          stroke={stroke}
          strokeWidth={2}
          listening={false}
        />
      )}
      <Rect
        width={el.width}
        height={el.height}
        cornerRadius={el.variant === "caption" ? 6 : isThought ? 40 : 28}
        fill={fill}
        stroke={stroke}
        strokeWidth={2}
        dash={isThought ? [6, 6] : undefined}
      />
      <Text
        x={10}
        y={10}
        width={el.width - 20}
        height={el.height - 20}
        text={el.text}
        fontSize={16}
        fontStyle={el.variant === "caption" ? "bold" : "normal"}
        fontFamily="Comic Sans MS, Geist, sans-serif"
        fill="#0f172a"
        align="center"
        verticalAlign="middle"
        listening={false}
      />
      {selected && (
        <Rect
          x={-2}
          y={-2}
          width={el.width + 4}
          height={el.height + 4}
          cornerRadius={el.variant === "caption" ? 8 : 30}
          stroke="#2563eb"
          strokeWidth={2}
          dash={[6, 4]}
          listening={false}
        />
      )}
    </Group>
  );
}
