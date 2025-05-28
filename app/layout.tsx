import type { Metadata } from "next";
import { Overpass } from "next/font/google";
import "./globals.css";
import { cn } from "@/utils";
import { Analytics } from "@vercel/analytics/next";

const overpass = Overpass({
  subsets: ["latin"],
  variable: "--font-overpass",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Подготовка к собеседованию на Карту Поляка — онлайн тренажер и ассистент",
  description:
    "Онлайн сервис для подготовки к собеседованию на Карту Поляка: тренажер вопросов и ответов, практика устной речи, голосовой диалог с искусственным интеллектом. Помощь в изучении польского языка и успешном прохождении интервью на Карту Поляка.",
  keywords: [
    "Карта Поляка",
    "подготовка к собеседованию",
    "тренажер Карта Поляка",
    "вопросы и ответы Карта Поляка",
    "онлайн ассистент Карта Поляка",
    "польский язык",
    "AI собеседование",
    "интервью Карта Поляка"
  ].join(", "),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={cn(
          overpass.variable,
          "flex flex-col min-h-screen"
        )}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
