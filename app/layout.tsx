import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import StructuredData from "@/components/StructuredData";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://quotenest.com";

export const metadata: Metadata = {
  title: {
    default: "QuoteNest – Smarter Insurance Quotes",
    template: "%s | QuoteNest",
  },
  description: "Compare insurance options and get AI-generated coverage summaries.",
  keywords: ["insurance quotes", "insurance comparison", "insurance quotes online", "auto insurance", "home insurance", "insurance quotes AI", "QuoteNest"],
  authors: [{ name: "QuoteNest" }],
  creator: "QuoteNest",
  publisher: "QuoteNest",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "QuoteNest – Smarter Insurance Quotes",
    description: "Compare insurance options and get AI-generated coverage summaries.",
    url: siteUrl,
    siteName: "QuoteNest",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "QuoteNest – Smarter Insurance Quotes",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QuoteNest – Smarter Insurance Quotes",
    description: "Compare insurance options and get AI-generated coverage summaries.",
    images: [`${siteUrl}/twitter-card.jpg`],
    creator: "@quotenest",
    site: "@quotenest",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#000000" },
    ],
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add verification codes when available
    // google: "verification-token",
    // yandex: "verification-token",
    // yahoo: "verification-token",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StructuredData type="Organization" />
        <StructuredData type="WebSite" />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
