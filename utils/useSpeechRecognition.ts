import { useState, useCallback, useRef, useEffect } from 'react';

interface UseSpeechRecognitionProps {
  onResult?: (text: string) => void;
  onEnd?: () => void;
  language?: string;
}

export function useSpeechRecognition({ 
  onResult, 
  onEnd, 
  language = 'ru-RU' 
}: UseSpeechRecognitionProps = {}) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Инициализация распознавания речи
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Проверяем поддержку SpeechRecognition в браузере
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Ваш браузер не поддерживает распознавание речи');
      return;
    }

    // Создаем экземпляр распознавания речи
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language;

    // Настраиваем обработчики событий
    recognitionRef.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      if (onResult) onResult(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      setError(`Ошибка распознавания: ${event.error}`);
      stopListening();
    };

    recognitionRef.current.onend = () => {
      if (isListening) {
        // Если мы все еще в режиме прослушивания, перезапускаем
        recognitionRef.current?.start();
      } else if (onEnd) {
        onEnd();
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        
        if (isListening) {
          recognitionRef.current.stop();
        }
      }
    };
  }, [language, onResult, onEnd, isListening]);

  // Функция для начала записи
  const startListening = useCallback(async () => {
    setError(null);
    
    try {
      // Запрашиваем доступ к микрофону
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Настраиваем MediaRecorder для записи аудио
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Запускаем запись
      mediaRecorderRef.current.start();
      
      // Запускаем распознавание речи
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }
    } catch (err: any) {
      setError(`Не удалось получить доступ к микрофону: ${err.message}`);
    }
  }, []);

  // Функция для остановки записи
  const stopListening = useCallback(async () => {
    // Останавливаем распознавание речи
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Останавливаем запись аудио
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      return new Promise<Blob>((resolve) => {
        mediaRecorderRef.current!.onstop = async () => {
          // Создаем Blob из записанных чанков
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Останавливаем все треки в медиапотоке
          mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
          
          setIsListening(false);
          resolve(audioBlob);
        };
        
        mediaRecorderRef.current!.stop();
      });
    }
    
    setIsListening(false);
    return new Blob();
  }, []);

  // Функция для отправки записанного аудио на сервер для транскрибации
  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.text;
    } catch (err: any) {
      setError(`Ошибка при транскрибации: ${err.message}`);
      return null;
    }
  }, []);

  // Функция для записи и транскрибации аудио
  const recordAndTranscribe = useCallback(async () => {
    await startListening();
    
    // Устанавливаем таймаут для записи (например, 5 секунд)
    return new Promise<string | null>((resolve) => {
      setTimeout(async () => {
        const audioBlob = await stopListening();
        const transcript = await transcribeAudio(audioBlob);
        resolve(transcript);
      }, 5000); // 5 секунд на запись
    });
  }, [startListening, stopListening, transcribeAudio]);

  return {
    isListening,
    error,
    startListening,
    stopListening,
    transcribeAudio,
    recordAndTranscribe,
  };
} 