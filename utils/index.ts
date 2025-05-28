import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { NextResponse } from "next/server"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Общий обработчик ошибок для API эндпоинтов
export function handleApiError(error: any, customMessage?: string) {
  return NextResponse.json(
    { 
      error: `${customMessage || 'Ошибка API'}: ${error.message}` 
    },
    { status: 500 }
  );
}

// Общая функция для валидации входных данных API
export function validateApiInput<T>(
  input: T | null | undefined, 
  errorMessage: string, 
  validator?: (input: T) => boolean
): { isValid: boolean; response?: NextResponse } {
  if (!input) {
    return {
      isValid: false,
      response: NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    };
  }
  
  if (validator && !validator(input)) {
    return {
      isValid: false,
      response: NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    };
  }
  
  return { isValid: true };
}

// Функция для создания стандартизированных успешных ответов API
export function createApiResponse<T>(
  data: T, 
  status: number = 200, 
  headers: Record<string, string> = {}
) {
  return NextResponse.json(
    { success: true, data },
    { status, headers }
  );
}
