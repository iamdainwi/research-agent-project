import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const ibm_plex_sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-ibm-plex-sans",
});

export const metadata: Metadata = {
  title: "Research Assistant",
  description:
    "An AI-powered research assistant that transforms complex questions into comprehensive, citation-backed reports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${ibm_plex_sans.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
