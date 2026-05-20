import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import Analytics from "./components/Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://writecomics.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "WriteComics — Make a comic in your browser. Free. No sign-up.",
    template: "%s · WriteComics",
  },
  description:
    "Free online comic creator. Drag and drop characters, backgrounds, and speech bubbles to make your own comic strip in minutes. No sign-up. Great for classrooms.",
  applicationName: "WriteComics",
  keywords: [
    "comic creator",
    "free comic maker",
    "online comic strip maker",
    "make your own comic",
    "comic generator",
    "speech bubble maker",
    "classroom comic tool",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "WriteComics",
    title: "WriteComics — Make a comic in your browser. Free. No sign-up.",
    description:
      "Drag, drop, and publish your own comic strip in minutes. Free, no sign-up, classroom-friendly.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "WriteComics — free online comic creator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WriteComics — free online comic creator",
    description:
      "Drag, drop, and publish your own comic strip in minutes. No sign-up.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <SiteHeader />
        <main className="flex-1 w-full">{children}</main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
