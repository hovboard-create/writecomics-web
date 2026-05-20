"use client";
import { useEffect } from "react";

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdSlot({
  slot,
  format = "auto",
  responsive = true,
  className,
}: {
  slot: string;
  format?: string;
  responsive?: boolean;
  className?: string;
}) {
  useEffect(() => {
    if (!ADSENSE_CLIENT) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* AdSense not loaded yet — silent */
    }
  }, []);

  if (!ADSENSE_CLIENT) {
    return (
      <div
        className={`flex items-center justify-center rounded border border-dashed border-zinc-300 bg-zinc-50 p-4 text-xs text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 ${className ?? ""}`}
      >
        Ad slot ({slot}) — AdSense not configured
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle block ${className ?? ""}`}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? "true" : "false"}
    />
  );
}
