import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/utils/openai';
import { handleApiError, createApiResponse } from '@/utils';

// API для создания сессии Realtime API
export async function POST(req: NextRequest) {
  try {
    // Проверяем наличие API ключа
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY не найден в переменных окружения');
    }
    
    // Создаем тело запроса
    const body = JSON.stringify({
      model: "gpt-4o-realtime-preview",
      voice: "alloy",
    });

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "realtime=v1"
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const responseData = await response.json();
    
    // Проверяем, содержит ли ответ необходимые данные
    if (!responseData.client_secret) {
      throw new Error('Ответ от API не содержит требуемые данные (client_secret)');
    }
    
    // Возвращаем напрямую ключ, без дополнительной вложенности
    const data = {
      client_secret: responseData.client_secret,
      id: responseData.id
    };

    return createApiResponse(data);
  } catch (error: any) {
    return handleApiError(error, 'Ошибка при создании сессии Realtime');
  }
} 