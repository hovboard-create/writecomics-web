// State model for the comic creator.
// A Comic is an ordered list of Panels.
// A Panel has an optional background, a list of placed characters, and a list of speech bubbles/captions.

export const PANEL_WIDTH = 900;
export const PANEL_HEIGHT = 600;

// MIME types used by HTML5 drag-and-drop from the sidebar onto the canvas.
export const DRAG_MIME_CHARACTER = "application/x-writecomics-character";
export const DRAG_MIME_BACKGROUND = "application/x-writecomics-background";

export type CharacterDragPayload = {
  src: string;
  width: number;
  height: number;
};

export type BackgroundDragPayload = {
  src: string;
};

export type ElementId = string; // nanoid

export type CharacterElement = {
  kind: "character";
  id: ElementId;
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  x: number;
  y: number;
  scale: number;
  flipped: boolean;
};

export type BubbleElement = {
  kind: "bubble";
  id: ElementId;
  variant: "speech" | "thought" | "caption";
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  tailX: number; // anchor for the speech tail (relative to bubble x)
  tailY: number;
};

export type PanelElement = CharacterElement | BubbleElement;

export type Panel = {
  id: string;
  background: { src: string } | null;
  elements: PanelElement[];
};

export type Comic = {
  panels: Panel[];
};

export type Selection =
  | { panelId: string; elementId: ElementId }
  | null;
