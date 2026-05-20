import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Legacy .html pages
      { source: "/ten-tips.html", destination: "/ten-tips", permanent: true },
      { source: "/top-ten-tips.html", destination: "/ten-tips", permanent: true },
      { source: "/404.html", destination: "/404", permanent: true },
      // Legacy PHP comic permalinks
      { source: "/index.php", has: [{ type: "query", key: "op", value: "view_comic" }, { type: "query", key: "comic_id", value: "(?<cid>.*)" }], destination: "/comics/:cid", permanent: true },
      // Anything else hitting index.php → homepage
      { source: "/index.php", destination: "/", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
  images: {
    // Legacy character/background art is already optimized PNGs/GIFs at their natural sizes
    unoptimized: true,
  },
};

export default nextConfig;
