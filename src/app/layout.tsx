import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { ScrollProgressBar } from "@/components/motion/scroll-progress-bar";
import { ScrollToTopButton } from "@/components/motion/scroll-to-top-button";
import "./globals.css";

const bricolageDisplay = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "skilled4U — Book Verified Skilled Artisans in Minutes",
  description:
    "Connect with top-rated plumbers, electricians, carpenters, AC technicians, and cleaners across Abuja and Nigeria in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolageDisplay.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-surface-pearl text-ink-primary"
      >
        <ScrollProgressBar />
        {children}
        <ScrollToTopButton />
      </body>
    </html>
  );
}
