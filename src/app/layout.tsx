import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "WebOS Portfolio — Mohammed & Moamen",
  description:
    "An interactive Web OS portfolio featuring Mohammed (Node.js/Discord.js Backend Engineer) and Moamen (Creative Developer & UI/UX Engineer). Built with Next.js 16, Zustand, and Framer Motion.",
  keywords: [
    "portfolio",
    "web os",
    "Mohammed",
    "Moamen",
    "Next.js",
    "React",
    "Zustand",
    "TailwindCSS",
    "Framer Motion",
  ],
  authors: [
    { name: "Mohammed" },
    { name: "Moamen" },
  ],
  openGraph: {
    title: "WebOS Portfolio — Mohammed & Moamen",
    description: "Interactive Web OS portfolio built with Next.js 16",
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
      className="font-sans antialiased"
    >
      <body className="min-h-full bg-black text-white overflow-hidden">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster theme="dark" position="top-right" closeButton richColors />
      </body>
    </html>
  );
}

