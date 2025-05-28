import type { Metadata } from "next";
import { Overpass } from "next/font/google";
import "./globals.css";
import { cn } from "@/utils";
import { Analytics } from "@vercel/analytics/next";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";

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
      <head>
        <meta property="og:title" content="Подготовка к собеседованию на Карту Поляка — онлайн тренажер и ассистент" />
        <meta property="og:description" content="Онлайн сервис для подготовки к собеседованию на Карту Поляка: тренажер вопросов и ответов, практика устной речи, голосовой диалог с искусственным интеллектом. Помощь в изучении польского языка и успешном прохождении интервью на Карту Поляка." />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ru_RU" />
        <meta property="og:url" content="https://konsulai.polishdom.com" />
        <meta property="og:image" content="/favicon.ico" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Подготовка к собеседованию на Карту Поляка — онлайн тренажер и ассистент" />
        <meta name="twitter:description" content="Онлайн сервис для подготовки к собеседованию на Карту Поляка: тренажер вопросов и ответов, практика устной речи, голосовой диалог с искусственным интеллектом." />
        <meta name="twitter:image" content="/favicon.ico" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={cn(
          overpass.variable,
          "flex flex-col min-h-screen"
        )}
      >
        <Header />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
