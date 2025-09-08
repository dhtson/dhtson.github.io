import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { SiteFooter } from "@/components/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Harshfeudal - Personal Blog",
    template: "%s - Harshfeudal"
  },
  description: "Personal blog of Đặng Hữu Trung Sơn (harshfeudal) - Computer Science student sharing insights on cybersecurity, CTF writeups, machine learning, and personal experiences.",
  keywords: ["harshfeudal", "cybersecurity", "CTF", "writeups", "computer science", "machine learning", "Vietnamese German University", "security research", "programming"],
  authors: [{ name: "Đặng Hữu Trung Sơn", url: "https://github.com/harshfeudal" }],
  creator: "Đặng Hữu Trung Sơn",
  publisher: "Harshfeudal",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dhtson.github.io",
    title: "Harshfeudal - Personal Blog",
    description: "Personal blog sharing insights on cybersecurity, CTF writeups, machine learning, and personal experiences.",
    siteName: "Harshfeudal Blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Harshfeudal - Personal Blog",
    description: "Personal blog sharing insights on cybersecurity, CTF writeups, machine learning, and personal experiences.",
    creator: "@harshfeudal",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <div className="min-h-screen flex flex-col">
          <main className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
