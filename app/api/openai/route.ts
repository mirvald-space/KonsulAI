import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/utils/openai';
import { handleApiError, validateApiInput } from '@/utils';

// Обработчик для текстовых запросов к GPT-4o
export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    // Валидируем входные данные
    const validation = validateApiInput(
      messages, 
      'Неверный формат запроса. Ожидается массив сообщений.',
      (msgs) => Array.isArray(msgs)
    );
    if (!validation.isValid) {
      return validation.response;
    }

    // Получаем клиент OpenAI и создаем поток ответа
    const openai = getOpenAIClient();
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-realtime-preview",
      messages,
      stream: true,
    });

    // Создаем и возвращаем поток для клиента
    const textEncoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) {
            controller.enqueue(textEncoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }
        controller.enqueue(textEncoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    return handleApiError(error, 'Ошибка при вызове OpenAI API');
  }
} 