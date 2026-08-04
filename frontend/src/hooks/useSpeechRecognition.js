import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeechRecognition = (options = {}) => {
  const { lang = 'ja-JP', continuous = false, interimResults = true } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef(null);

  const transcriptRef = useRef('');
  const interimRef = useRef('');

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser');
      return;
    }

    setIsSupported(true);

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    // Request multiple alternatives — pick the highest-confidence one for better Japanese accuracy
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      // 'no-speech' is common with short pauses — don't surface it as a blocking error
      if (event.error === 'no-speech') return;
      setError(event.error);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          // Pick the alternative with the highest confidence score
          let bestTranscript = result[0].transcript;
          let bestConfidence = result[0].confidence ?? 0;
          for (let a = 1; a < result.length; a++) {
            if ((result[a].confidence ?? 0) > bestConfidence) {
              bestConfidence = result[a].confidence;
              bestTranscript = result[a].transcript;
            }
          }
          final += bestTranscript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        transcriptRef.current += final;
        setTranscript(transcriptRef.current);
      }

      interimRef.current = interim;
      setInterimTranscript(interim);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [lang, continuous, interimResults]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setInterimTranscript('');
      transcriptRef.current = '';
      interimRef.current = '';
      setError(null);

      try {
        recognitionRef.current.start();
      } catch (err) {
        // Already started
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    transcriptRef.current = '';
    interimRef.current = '';
  }, []);

  const getFullTranscript = useCallback(() => {
    return transcriptRef.current + interimRef.current;
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    fullTranscript: transcript + interimTranscript,
    getFullTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  };
};

export default useSpeechRecognition;
