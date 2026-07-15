import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/lib/ThemeProvider';
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
  description: "Your intelligent career co-pilot that scans your resume and GitHub, identifies skill gaps, and recommends professional-grade project roadmaps with dedicated AI mentors.",
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
        <head>
          {/*
           * Anti-Flash Script (inline, runs before React hydration)
           *
           * Reads the stored theme from localStorage and sets `data-theme`
           * on <html> synchronously so users never see a flash of the wrong
           * theme when they revisit the page with a saved light-mode preference.
           */}
          <script suppressHydrationWarning dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('projectpilot-theme');
                  var theme = stored === 'light' ? 'light' : 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {
                  // localStorage unavailable (e.g. private-browsing restrictions) — use dark
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `
          }} />
        </head>
        <body className="min-h-full flex flex-col">
          {/* ThemeProvider wraps the entire app so every client component
              can access useTheme() to read or change the active theme */}
          <ThemeProvider>
            {children}
          </ThemeProvider>
          {/* Hide Clerk dev-mode badge in development */}
          <script suppressHydrationWarning dangerouslySetInnerHTML={{
            __html: `
              setInterval(() => {
                const elements = document.querySelectorAll('div[class*="cl-"]');
                for (let i = 0; i < elements.length; i++) {
                  if (elements[i].innerText && elements[i].innerText.includes('Configure your application')) {
                    elements[i].style.display = 'none';
                  }
                }
              }, 100);
            `
          }} />
        </body>
      </html>
    </ClerkProvider>
  );
}
