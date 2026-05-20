"use client";
import { useEffect, useState } from "react";

// Tiny replacement for the `use-image` package — fewer deps.
// Returns [image, status]. Image is HTMLImageElement once loaded.
export function useImage(
  url: string | undefined,
): [HTMLImageElement | undefined, "loading" | "loaded" | "failed"] {
  const [state, setState] = useState<{
    image?: HTMLImageElement;
    status: "loading" | "loaded" | "failed";
  }>({ status: "loading" });

  useEffect(() => {
    if (!url) {
      setState({ status: "loading" });
      return;
    }
    let cancelled = false;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => {
      if (!cancelled) setState({ image: img, status: "loaded" });
    };
    img.onerror = () => {
      if (!cancelled) setState({ status: "failed" });
    };
    return () => {
      cancelled = true;
    };
  }, [url]);

  return [state.image, state.status];
}
