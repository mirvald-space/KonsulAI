import { NextRequest, NextResponse } from 'next/server';
import { speechToText } from '@/utils/openai';
import { handleApiError, validateApiInput, createApiResponse } from '@/utils';

export async function POST(req: NextRequest) {
  try {
    // Получаем аудио файл из запроса
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    // Валидируем входные данные
    const validation = validateApiInput(audioFile, 'Аудио файл не найден в запросе');
    if (!validation.isValid) {
      return validation.response;
    }

    // Используем общую функцию для преобразования аудио в текст
    const text = await speechToText(audioFile);

    return createApiResponse({ text });
  } catch (error: any) {
    return handleApiError(error, 'Ошибка при транскрибации аудио');
  }
} 