import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "WebOS Portfolio — Mohammed & Moamen",
  description:
    "An interactive Web OS portfolio featuring Mohammed (Node.js/Discord.js Backend Engineer) and Moamen (Creative Developer & UI/UX Engineer). Built with Next.js 15, Zustand, and Framer Motion.",
  keywords: [
    "portfolio",
    "web os",
    "Mohammed",
    "Moamen",
    "Next.js",
    "Discord.js",
    "Node.js",
    "developer portfolio",
  ],
  authors: [
    { name: "Mohammed" },
    { name: "Moamen" },
  ],
  openGraph: {
    title: "WebOS Portfolio — Mohammed & Moamen",
    description: "Interactive Web OS portfolio built with Next.js 15",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-black text-white overflow-hidden">
        {children}
      </body>
    </html>
  );
}
