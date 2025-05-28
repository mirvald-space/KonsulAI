"use client";

import { useState } from "react";
import { useRealtimeApi } from "@/utils/useRealtimeApi";
import { AnimatePresence } from "framer-motion";
import { Loader2, PhoneOff } from "lucide-react";
import { Button } from "./ui/button";
import { AIVoiceInput } from "./ai-voice-input";
import HomePage from "./HomePage";

const SYSTEM_PROMPT = `Ты - польский консул, проводящий собеседование для получения Карты поляка.
После приветствия пользователя обязательно представься (например: "Dzień dobry, jestem konsul Polski [имя]. Będę przeprowadzać rozmowę kwalifikacyjną na Kartę Polaka.").
Задай ровно 2 вопроса на польском языке об истории, культуре или традициях Польши.
После получения ответов на оба вопроса, оцени результат и сообщи, прошел ли пользователь собеседование, основываясь на его ответах.
Будь строгим, но справедливым. Веди себя официально, как на настоящем собеседовании.`;

export default function CallInterface() {
  const [isStarted, setIsStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const {
    state,
    connect,
    disconnect,
    sendMessage,
  } = useRealtimeApi();

  // Обработчик начала разговора
  const handleStart = async () => {
    setIsStarted(true);
    try {
      // Подключаемся к Realtime API с системным промптом
      await connect(SYSTEM_PROMPT);
    } catch (error) {
      // Ошибка обрабатывается в useRealtimeApi
    }
  };

  // Обработчик завершения разговора
  const handleEndCall = () => {
    disconnect();
    setIsStarted(false);
  };

  // Обработчик переключения микрофона
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted && state.transcript) {
      sendMessage(state.transcript);
    }
  };

  // Обработчики для AIVoiceInput
  const handleVoiceStart = () => {
    setIsMuted(false);
  };

  const handleVoiceStop = (duration: number) => {
    if (state.transcript) {
      sendMessage(state.transcript);
    }
    setIsMuted(true);
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full min-h-screen">
      <AnimatePresence>
        {!isStarted && <HomePage onStartCall={handleStart} />}
      </AnimatePresence>
      
      {isStarted && (
        <div className="flex flex-col items-center justify-center w-full h-full">
          {state.isConnecting ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Подключение к польскому консулу...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              {/* Заменяем визуализацию аудио на AIVoiceInput */}
              <div className="mb-8 w-full max-w-md">
                <AIVoiceInput 
                  onStart={handleVoiceStart}
                  onStop={handleVoiceStop}
                  visualizerBars={36}
                />
                
                {state.transcript && (
                  <p className="mt-2 text-muted-foreground max-w-md text-center">
                    {state.transcript}
                  </p>
                )}
              </div>
              
              {/* Кнопка завершения звонка */}
              <div className="flex items-center gap-4">
                <Button
                  size="lg"
                  className="rounded-full h-16 w-16 bg-red-500 hover:bg-red-600"
                  onClick={handleEndCall}
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </div>
            </div>
          )}
          
          {state.error && (
            <div className="absolute top-4 left-0 right-0 mx-auto max-w-md bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{state.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 