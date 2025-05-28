import type { Metadata } from "next";
import { Overpass } from "next/font/google";
import "./globals.css";
import { cn } from "@/utils";

const overpass = Overpass({
  subsets: ["latin"],
  variable: "--font-overpass",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Realtime Speech-to-Speech Assistant",
  description: "A Next.js application for realtime speech-to-speech conversation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          overpass.variable,
          "flex flex-col min-h-screen"
        )}
      >
        {children}
      </body>
    </html>
  );
}
