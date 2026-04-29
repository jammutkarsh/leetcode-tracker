import "../index.css";
import { ThemeProvider } from "../context/ThemeProvider";
import { TrackerProvider } from "../context/TrackerContext";
import Navbar from "../components/Navbar";
import { Geist } from "next/font/google";
import Script from "next/script";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export const metadata = {
  title: "LeetCode Progress Tracker | CodeTrack Pro",
  description:
    "CodeTrack Pro is a modern LeetCode progress tracker with spaced repetition. Track solved problems, review them at optimal intervals, and boost your retention.",
  openGraph: {
    title: "LeetCode Progress Tracker | CodeTrack Pro",
    description:
      "Track your LeetCode progress and review problems with spaced repetition to boost retention.",
    url: "https://track-leetcode.vercel.app/",
    siteName: "CodeTrack Pro",
    images: [
      {
        url: "https://track-leetcode.vercel.app/og-image.png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LeetCode Progress Tracker | CodeTrack Pro",
    description:
      "Track your LeetCode progress and review problems with spaced repetition to boost retention.",
    images: ["https://track-leetcode.vercel.app/og-image.png"],
  },
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("dark font-sans", geist.variable)}
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(() => {
  try {
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme ? savedTheme === "dark" : true;
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  } catch {
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
  }
})();`}
        </Script>
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "CodeTrack Pro",
            url: "https://track-leetcode.vercel.app/",
            description:
              "A modern LeetCode progress tracker with spaced repetition for better retention.",
            applicationCategory: "EducationalApplication",
            operatingSystem: "Web",
            image: "https://track-leetcode.vercel.app/og-image.png",
          })}
        </Script>
      </head>
      <body className="bg-background text-foreground">
        <ThemeProvider>
          <TrackerProvider>
            <TooltipProvider>
              <div className="min-h-screen bg-background transition-colors">
                <a
                  href="#main-content"
                  className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-background focus-visible:px-4 focus-visible:py-2 focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Skip to content
                </a>
                <Navbar />
                <main id="main-content">{children}</main>
              </div>
            </TooltipProvider>
          </TrackerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
