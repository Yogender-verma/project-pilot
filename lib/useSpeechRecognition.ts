'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  start: () => void;
  stop: () => void;
  error: string | null;
}

/**
 * Custom hook that wraps the browser's Web Speech API (SpeechRecognition)
 * for voice-to-text functionality.
 *
 * Handles browser compatibility, permission prompts, and provides
 * clean start/stop controls with interim transcript updates.
 */
export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const {
    lang = 'en-US',
    continuous = true,
    interimResults = true,
    onResult,
    onError,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);

  // Keep refs current without triggering re-renders
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Check browser support
  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const start = useCallback(() => {
    if (!isSupported) {
      const msg = 'Speech recognition is not supported in this browser.';
      setError(msg);
      onErrorRef.current?.(msg);
      return;
    }

    // Stop any existing session before starting a new one
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();

    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = 1;

    let finalTranscriptBuffer = '';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript('');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;

        if (result.isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }

      if (final) {
        finalTranscriptBuffer += final;
        onResultRef.current?.(finalTranscriptBuffer, true);
        setTranscript(finalTranscriptBuffer);
      } else if (interim) {
        onResultRef.current?.(finalTranscriptBuffer + interim, false);
        setTranscript(finalTranscriptBuffer + interim);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let message = 'Speech recognition error.';

      switch (event.error) {
        case 'not-allowed':
          message =
            'Microphone access denied. Please allow microphone permissions in your browser settings.';
          break;
        case 'no-speech':
          message = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          message =
            'No microphone found. Please connect a microphone and try again.';
          break;
        case 'network':
          message =
            'Network error during speech recognition. Check your connection.';
          break;
        case 'aborted':
          message = '';
          break;
        default:
          message = `Speech recognition error: ${event.error}`;
      }

      if (message) {
        setError(message);
        onErrorRef.current?.(message);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      const msg = 'Failed to start speech recognition.';
      setError(msg);
      onErrorRef.current?.(msg);
      setIsListening(false);
    }
  }, [isSupported, lang, continuous, interimResults]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    start,
    stop,
    error,
  };
}
