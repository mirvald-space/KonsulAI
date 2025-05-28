import { useState, useEffect, useRef, useCallback } from 'react';

interface RealtimeApiState {
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  transcript: string;
  isListening: boolean;
  isSpeaking: boolean;
}

export function useRealtimeApi() {
  const [state, setState] = useState<RealtimeApiState>({
    isConnecting: false,
    isConnected: false,
    error: null,
    transcript: '',
    isListening: false,
    isSpeaking: false,
  });

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const ephemeralKeyRef = useRef<string | null>(null);
  const messagesRef = useRef<Array<{ role: string, content: string }>>([]);

  // Инициализация аудио элемента
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioElementRef.current = new Audio();
      audioElementRef.current.autoplay = true;
    }

    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      
      // Закрываем соединение при размонтировании
      disconnect();
    };
  }, []);

  // Функция для получения ephemeral token
  const getEphemeralToken = async () => {
    try {
      const response = await fetch('/api/realtime', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}. ${errorText}`);
      }

      const responseData = await response.json();
      
      // Проверяем новый формат ответа (с success и data)
      const data = responseData.data || responseData;
      
      let token;
      
      // Обрабатываем возможные форматы вложенности
      if (data.client_secret?.value?.value) {
        // Двойная вложенность {client_secret: {value: {value: "token"}}}
        token = data.client_secret.value.value;
      } else if (data.client_secret?.value) {
        // Обычная вложенность {client_secret: {value: "token"}}
        token = data.client_secret.value;
      } else if (typeof data.client_secret === 'string') {
        // Прямой строковый токен {client_secret: "token"}
        token = data.client_secret;
      }
      
      if (!token) {
        throw new Error('Не удалось извлечь ephemeral token: неверный формат ответа');
      }
      
      ephemeralKeyRef.current = token;
      return token;
    } catch (error: any) {
      setState(prev => ({ ...prev, error: `Ошибка получения токена: ${error.message}` }));
      throw error;
    }
  };

  // Функция для инициализации WebRTC соединения
  const connect = useCallback(async (systemPrompt?: string) => {
    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));

      // Получаем ephemeral token
      const ephemeralKey = await getEphemeralToken();

      // Создаем peer connection с более конкретными настройками
      const rtcConfig = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        sdpSemantics: 'unified-plan',
      };
      
      peerConnectionRef.current = new RTCPeerConnection(rtcConfig);

      // Настраиваем обработку аудио от модели
      peerConnectionRef.current.ontrack = (e) => {
        if (audioElementRef.current && e.streams[0]) {
          audioElementRef.current.srcObject = e.streams[0];
          setState(prev => ({ ...prev, isSpeaking: true }));
        }
      };

      // Мониторинг состояния подключения
      peerConnectionRef.current.oniceconnectionstatechange = () => {
        if (peerConnectionRef.current?.iceConnectionState === 'failed' || 
            peerConnectionRef.current?.iceConnectionState === 'disconnected') {
          setState(prev => ({ 
            ...prev, 
            error: `Ошибка ICE подключения: ${peerConnectionRef.current?.iceConnectionState}` 
          }));
        }
      };

      // Запрашиваем доступ к микрофону
      try {
        localStreamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: true
        });
      } catch (micError: any) {
        setState(prev => ({ ...prev, error: `Ошибка доступа к микрофону: ${micError.message}` }));
        throw micError;
      }

      // Добавляем локальный аудио трек
      localStreamRef.current.getTracks().forEach(track => {
        if (peerConnectionRef.current) {
          peerConnectionRef.current.addTrack(track, localStreamRef.current!);
        }
      });

      // Настраиваем data channel для обмена сообщениями
      dataChannelRef.current = peerConnectionRef.current.createDataChannel("oai-events", {
        ordered: true
      });
      dataChannelRef.current.addEventListener("message", handleDataChannelMessage);

      // Обработчики событий для data channel
      dataChannelRef.current.onopen = () => {};
      
      dataChannelRef.current.onclose = () => {};
      dataChannelRef.current.onerror = (e) => {};

      // Создаем offer с конкретными настройками для медиалиний
      const offerOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
        voiceActivityDetection: true
      };

      // Инициализируем соединение с помощью SDP
      const offer = await peerConnectionRef.current.createOffer(offerOptions);

      // Устанавливаем локальное описание
      const modifiedSDP = offer.sdp;
      await peerConnectionRef.current.setLocalDescription(offer);

      // Отправляем SDP на сервер
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview";
      
      // Проверяем, что ephemeral token получен корректно
      if (!ephemeralKey) {
        throw new Error("Ephemeral token отсутствует. Невозможно установить соединение.");
      }
      
      // Формируем заголовок авторизации
      const authHeader = `Bearer ${ephemeralKey}`;
      
      // Создаем URL с параметрами
      let apiUrl = `${baseUrl}?model=${model}`;
      
      // Если есть системный промпт, добавляем его как параметр instructions
      if (systemPrompt) {
        // Кодируем системный промпт для URL
        const encodedInstructions = encodeURIComponent(systemPrompt);
        apiUrl += `&instructions=${encodedInstructions}`;
      }
      
      let answerSDP;
      
      try {
        const sdpResponse = await fetch(apiUrl, {
          method: "POST",
          body: modifiedSDP,
          headers: {
            "Authorization": authHeader,
            "Content-Type": "application/sdp",
            "OpenAI-Beta": "realtime=v1"
          },
        });

        if (!sdpResponse.ok) {
          const errorText = await sdpResponse.text();
          throw new Error(`HTTP error! Status: ${sdpResponse.status}. ${errorText}`);
        }
        
        answerSDP = await sdpResponse.text();
      } catch (error) {
        throw error;
      }
      
      const answer = {
        type: "answer" as RTCSdpType,
        sdp: answerSDP,
      };

      // Добавляем таймаут перед установкой удаленного описания
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await peerConnectionRef.current.setRemoteDescription(answer);
      
      // Сохраняем системный промпт в истории сообщений
      if (systemPrompt) {
        messagesRef.current = [{ role: 'system', content: systemPrompt }];
      } else {
        messagesRef.current = [];
      }

      setState(prev => ({ 
        ...prev, 
        isConnected: true, 
        isConnecting: false 
      }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: `Ошибка подключения к Realtime API: ${error.message}`, 
        isConnecting: false 
      }));
      
      // Очищаем ресурсы при ошибке
      disconnect();
    }
  }, []);

  // Обработчик сообщений от data channel
  const handleDataChannelMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      
      // Обрабатываем различные типы сообщений от OpenAI Realtime API
      
      // Обработка начала речи пользователя
      if (data.type === 'input_audio_buffer.speech_started') {
        setState(prev => ({ 
          ...prev, 
          isListening: true,
          isSpeaking: false
        }));
      } 
      // Обработка окончания речи пользователя
      else if (data.type === 'input_audio_buffer.speech_stopped') {
        setState(prev => ({ 
          ...prev, 
          isListening: false
        }));
      }
      // Обработка начала аудио ответа
      else if (data.type === 'output_audio_buffer.started') {
        setState(prev => ({ 
          ...prev, 
          isSpeaking: true,
          isListening: false 
        }));
      }
      // Обработка окончания аудио ответа
      else if (data.type === 'output_audio_buffer.stopped') {
        setState(prev => ({ 
          ...prev, 
          isSpeaking: false
        }));
      }
      // Обработка текста транскрипции (старый формат)
      else if (data.type === 'transcript') {
        setState(prev => ({ 
          ...prev, 
          transcript: data.text,
          isListening: true 
        }));
      } 
      // Обработка текста транскрипции (новый формат)
      else if (data.type === 'response.audio_transcript.delta' && data.delta?.text) {
        setState(prev => ({ 
          ...prev, 
          transcript: prev.transcript + data.delta.text
        }));
      }
      // Обработка создания нового элемента разговора
      else if (data.type === 'conversation.item.created' && data.item?.content) {
        const role = data.item.role || 'unknown';
        const content = data.item.content || '';
        
        // Если это ответ ассистента
        if (role === 'assistant') {
          setState(prev => ({ 
            ...prev, 
            isSpeaking: true,
            isListening: false
          }));
        }
        
        // Добавляем сообщение только если оно от пользователя или ассистента
        if (role === 'user' || role === 'assistant') {
          messagesRef.current.push({ role, content });
        }
      }
      // Обработка сообщения (старый формат)
      else if (data.type === 'message') {
        const role = data.message?.role || 'unknown';
        const content = data.message?.content || '';
        
        // Добавляем сообщение только если оно от пользователя или ассистента
        if (role === 'user' || role === 'assistant') {
          messagesRef.current.push({ role, content });
        }
        
        // Если это ответ ассистента
        if (role === 'assistant') {
          setState(prev => ({ 
            ...prev, 
            isSpeaking: true,
            isListening: false
          }));
        }
      }
      // Обработка ошибки
      else if (data.type === 'error') {
        setState(prev => ({ 
          ...prev, 
          error: `Ошибка API: ${data.message}` 
        }));
      }
    } catch (error) {
      // Ошибка обработки сообщения
    }
  };

  // Функция для отправки сообщения
  const sendMessage = useCallback((message: string) => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
      setState(prev => ({ 
        ...prev, 
        error: 'Соединение не установлено. Невозможно отправить сообщение.' 
      }));
      return;
    }

    try {
      // Очищаем транскрипцию при отправке нового сообщения
      setState(prev => ({
        ...prev,
        transcript: '',
        isListening: false
      }));
      
      // Добавляем сообщение в историю
      messagesRef.current.push({
        role: 'user',
        content: message
      });

      // Отправляем сообщение через data channel
      const event = {
        type: 'message',
        message: {
          role: 'user',
          content: message
        }
      };

      dataChannelRef.current.send(JSON.stringify(event));
    } catch (error: any) {
      setState(prev => ({ ...prev, error: `Ошибка отправки сообщения: ${error.message}` }));
    }
  }, []);

  // Функция для отключения
  const disconnect = useCallback(() => {
    // Закрываем data channel
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    // Останавливаем все треки локального стрима
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Закрываем peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Сбрасываем состояние
    setState({
      isConnecting: false,
      isConnected: false,
      error: null,
      transcript: '',
      isListening: false,
      isSpeaking: false,
    });

    // Очищаем историю сообщений
    messagesRef.current = [];
  }, []);

  return {
    state,
    connect,
    disconnect,
    sendMessage,
    messages: messagesRef.current,
  };
} 