import type { Metadata, Viewport } from "next";
// 1. Import your chosen font from Google Fonts
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// 2. Configure the font weights and subsets
const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], 
});

export const metadata: Metadata = {
  title: "GenLayer Bounty Platform",
  description: "AI-evaluated developer bounties on the GenLayer blockchain. Submit your work, let the AI verify it, and get paid instantly.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#9B6AF6", // GenLayer brand purple
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 3. Inject the font's class name into the body tag */}
      <body className={spaceGrotesk.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}