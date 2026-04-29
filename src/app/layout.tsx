import "../index.css";
import { ThemeProvider } from "../context/ThemeProvider";
import { TrackerProvider } from "../context/TrackerContext";
import Navbar from "../components/Navbar";
import { Geist } from "next/font/google";
import Script from "next/script";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export const metadata = {
  title: "Leetcode Tracker | Track Your LeetCode Progress",
  description:
    "Leetcode Tracker is a modern LeetCode progress tracker with spaced repetition. Track solved problems, review them at optimal intervals, and boost your retention.",
  openGraph: {
    title: "Leetcode Tracker | Track Your LeetCode Progress",
    description:
      "Track your LeetCode progress and review problems with spaced repetition to boost retention.",
    url: "https://leetcodetracker.utkarshchourasia.in",
    siteName: "Leetcode Tracker",
    images: [
      {
        url: "https://leetcodetracker.utkarshchourasia.in/og-image.png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Leetcode Tracker | Track Your LeetCode Progress",
    description:
      "Track your LeetCode progress and review problems with spaced repetition to boost retention.",
    images: ["https://leetcodetracker.utkarshchourasia.in/og-image.png"],
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
            name: "Leetcode Tracker",
            url: "https://leetcodetracker.utkarshchourasia.in",
            description:
              "A modern LeetCode progress tracker with spaced repetition for better retention.",
            applicationCategory: "EducationalApplication",
            operatingSystem: "Web",
            image: "https://leetcodetracker.utkarshchourasia.in/og-image.png",
          })}
        </Script>
      </head>
      <body className="bg-background text-foreground">
        <Analytics />
        <SpeedInsights />
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
