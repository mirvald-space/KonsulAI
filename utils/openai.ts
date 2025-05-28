import OpenAI from 'openai';
import { headers } from 'next/headers';

// Создаем функцию для получения экземпляра клиента OpenAI
// Эта функция должна вызываться только на сервере
export function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Функция для преобразования речи в текст (используется в API endpoint)
export async function speechToText(audioFile: File) {
  const openai = getOpenAIClient();
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "ru", // Указываем русский язык
    });
    
    return transcription.text;
  } catch (error) {
    throw error;
  }
} 