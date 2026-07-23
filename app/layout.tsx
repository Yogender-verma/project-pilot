import SonnerProvider from "@/components/providers/SonnerProvider";
import { ThemeProvider } from "@/lib/ThemeProvider";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProjectPilot AI — Choose the Right Career Project",
  description:
    "Your intelligent career co-pilot that scans your resume and GitHub, identifies skill gaps, and recommends professional-grade project roadmaps with dedicated AI mentors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col" suppressHydrationWarning>
          <ThemeProvider>
            <Toaster position="top-right" />
            {children}
            <SonnerProvider />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}