# GPT-4o Realtime API Голосовой ассистент

Голосовой ассистент на русском языке с использованием OpenAI GPT-4o-realtime-preview через Realtime API.

## Особенности

- 🎙️ Голосовое общение в реальном времени через WebRTC
- 🔊 Синтез речи в реальном времени
- ⚡ Минимальная задержка благодаря Realtime API
- 🅰️ Современный шрифт [Overpass](https://fonts.google.com/specimen/Overpass) из Google Fonts для всего интерфейса

## Используемый шрифт

В проекте используется шрифт Overpass из Google Fonts, подключённый через [next/font/google](https://nextjs.org/docs/app/building-your-application/optimizing/fonts#google-fonts) и интегрированный с Tailwind CSS:

- Импортируется в `app/layout.tsx`:
  ```ts
  import { Overpass } from "next/font/google";
  const overpass = Overpass({
    subsets: ["latin"],
    variable: "--font-overpass",
    display: "swap",
  });
  ```
- В Tailwind (`tailwind.config.ts`):
  ```js
  fontFamily: {
    'sans': ['var(--font-overpass)', ...defaultTheme.fontFamily.sans],
    // ...
  },
  ```
- Весь интерфейс использует класс `font-sans`.

## Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/yourusername/speech-to-speech-assistant.git
cd speech-to-speech-assistant
```

2. Установите зависимости:
```bash
npm install
# или
yarn install
# или
pnpm install
```

3. Создайте файл `.env.local` в корне проекта и добавьте свой API ключ OpenAI:
```
OPENAI_API_KEY=ваш_ключ_api_openai
```

## Запуск

Запустите приложение в режиме разработки:

```bash
npm run dev
# или
yarn dev
# или
pnpm dev
```

Откройте [http://localhost:3000](http://localhost:3000) в вашем браузере.

## Использование

1. Нажмите кнопку "Начать разговор"
2. Дождитесь подключения к Realtime API
3. Нажмите на кнопку микрофона, чтобы начать говорить
4. Ассистент ответит вам голосом в реальном времени

## Технологии

- Next.js 14
- React
- OpenAI Realtime API (GPT-4o-realtime-preview)
- WebRTC
- Tailwind CSS
- Framer Motion
- Google Fonts (Overpass)

## О Realtime API

Realtime API - это новый API от OpenAI, который позволяет создавать приложения с минимальной задержкой для голосового общения в реальном времени. Он использует WebRTC для передачи аудио напрямую между клиентом и моделью, что обеспечивает более естественное общение.

## Лицензия

MIT
