import React, { Suspense } from "react";

import "./globals.css";

import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import Header from "@/src/components/Header";
import Footer from "@/src/components/Footer";
import { siteMetadata } from "@/src/utils/siteMetadata";
import GoogleAnalytics from "@/src/components/GoogleAnalytics";
import ToastProvider from "@/src/lib/react-toastify/ToastProvider";
import { cx } from "@/src/utils/cx";
import { SearchModal } from "@/src/components/SearchModal/SearchModal";
import { getAllPosts } from "@/src/content/generated";
import { isPublicPost } from "@/src/utils/Post";

const inter = localFont({
  src: "./fonts/Inter-VariableFont_opsz,wght.ttf",
  display: "swap",
  variable: "--font-in",
  weight: "100 900",
});
const manrope = localFont({
  src: "./fonts/Manrope-VariableFont_wght.ttf",
  display: "swap",
  variable: "--font-mr",
  weight: "200 800",
});

const {
  title: siteTitle,
  description: siteDescription,
  siteUrl,
  socialBanner,
  locale,
  author,
} = siteMetadata;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: `%s | ${siteTitle}`,
    default: siteTitle,
  },
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: siteTitle,
    images: [socialBanner],
    locale: locale,
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    creator: author,
    images: [socialBanner],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const publicPosts = (await getAllPosts()).filter((post) =>
    isPublicPost(post),
  );

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ? (
          <GoogleAnalytics ga_id={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS} />
        ) : null}
        <meta
          name="google-site-verification"
          content="_yFDj3ZFcpCdUJ2n7v7G3jFgOoqdmNruyo4DPD0ueHg"
        />
      </head>
      <body
        suppressHydrationWarning
        className={cx(
          inter.variable,
          manrope.variable,
          "bg-light font-mr dark:bg-dark flex min-h-screen flex-col",
        )}
      >
        <Script id="theme-switcher" strategy="beforeInteractive">
          {`if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }`}
        </Script>
        <Analytics />
        <SpeedInsights />
        <ToastProvider>
          <Header />
          {children}
          <Footer />
        </ToastProvider>
        <Suspense fallback={<>Loading...</>}>
          <SearchModal posts={publicPosts} />
        </Suspense>
      </body>
    </html>
  );
}
