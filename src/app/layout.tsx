import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { CSPostHogProvider } from "./providers";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const BASE_URL = "https://gssoc-pa.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "GSSoC Project Admin Tracker — Track PA Activity & Scores",
    template: "%s | GSSoC PA Tracker",
  },
  description:
    "Track Project Admin activity for GirlScript Summer of Code 2026. See issue labelling, merged PR counts, admin scores, and repo health for any GSSoC project.",
  keywords: [
    "GSSoC 2026",
    "GSSoC project admin",
    "GSSoC PA tracker",
    "GSSoC admin score",
    "GirlScript Summer of Code 2026",
    "GSSoC project admin tracker",
    "GSSoC repo stats",
    "GSSoC issue labelling",
    "GSSoC admin leaderboard",
    "GSSoC PA dashboard",
    "open source project admin",
    "GitHub repo tracker GSSoC",
  ],
  authors: [{ name: "Ixotic27", url: "https://github.com/Ixotic27" }],
  creator: "Ixotic27",
  publisher: "Ixotic27",
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "GSSoC PA Tracker",
    title: "GSSoC PA Tracker — Project Admin Activity & Scores",
    description:
      "Track Project Admin activity for GSSoC 2026. Issue labelling, merged PRs, admin scores, and repo health — all in one dashboard.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "GSSoC Project Admin Tracker — admin activity dashboard for GSSoC 2026",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "GSSoC PA Tracker — Project Admin Activity & Scores",
    description:
      "Track Project Admin activity, issue labelling, merged PRs, and admin scores for GirlScript Summer of Code 2026.",
    images: ["/opengraph-image.png"],
  },
  alternates: {
    canonical: BASE_URL,
  },
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
  category: "technology",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${BASE_URL}/#webapp`,
        name: "GSSoC PA Tracker",
        url: BASE_URL,
        description:
          "Track Project Admin activity for GirlScript Summer of Code 2026. Issue labelling, merged PRs, admin scores, and repo health.",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        author: {
          "@type": "Person",
          name: "Ixotic27",
          url: "https://github.com/Ixotic27",
        },
        inLanguage: "en",
      },
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        url: BASE_URL,
        name: "GSSoC PA Tracker",
        description: "Track GSSoC 2026 Project Admin activity, scores, and repo health.",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${BASE_URL}/project-admin/{search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.github.com" />
      </head>
      <body className="min-h-screen" suppressHydrationWarning>
        <CSPostHogProvider>
          {children}
        </CSPostHogProvider>
        <Analytics />
        <Script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
