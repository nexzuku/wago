import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Volume2, Headphones, Target, MessageCircle,
  ChevronDown, ChevronRight, ChevronLeft, Bookmark, BookmarkCheck,
  SkipForward, Trophy, Zap, X, Loader2, Info, Play, Square,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { trainingAPI, aiAPI, speechAPI } from '../../services/api';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import useAudioRecorder from '../../hooks/useAudioRecorder';
import useTrainingSocket from '../../hooks/useTrainingSocket';
import useAuthStore from '../../store/authStore';

const blobToBase64Parts = (blob) => new Promise((resolve, reject) => {
  try {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== 'string') return reject(new Error('Failed to read blob'));
      const [meta, b64] = dataUrl.split(',');
      const mimeMatch = meta?.match(/data:([^;]+);base64/i);
      resolve({
        b64,
        mime: mimeMatch?.[1] || blob.type || 'application/octet-stream'
      });
    };
    reader.onerror = () => reject(reader.error || new Error('FileReader error'));
    reader.readAsDataURL(blob);
  } catch (e) {
    reject(e);
  }
});

const modes = [
  { id: 'listen_repeat', label: 'Listen & Repeat', shortLabel: 'Listen', icon: Headphones, color: 'from-blue-500 to-indigo-600' },
  { id: 'test', label: 'Test Yourself', shortLabel: 'Test', icon: Target, color: 'from-amber-500 to-orange-600' },
  { id: 'free_talk', label: 'Free Talk', shortLabel: 'Talk', icon: MessageCircle, color: 'from-emerald-500 to-teal-600' },
];

const LearnPage = () => {
  const { user } = useAuthStore();
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeMode, setActiveMode] = useState('listen_repeat');
  const [phrases, setPhrases] = useState([]);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTopicSheet, setShowTopicSheet] = useState(false);
  const [topicFilter, setTopicFilter] = useState('all');
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bookmarked, setBookmarked] = useState(new Set());
  const [showFreeTalk, setShowFreeTalk] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [freeTalkStatus, setFreeTalkStatus] = useState('ready');
  const [conversationStarter, setConversationStarter] = useState(null);

  const shouldAnalyzeRef = useRef(false);
  const lastWavRef = useRef(null);
  const recordingStartRef = useRef(null);

  const {
    isListening, fullTranscript, isSupported,
    startListening, stopListening, resetTranscript,
    getFullTranscript
  } = useSpeechRecognition({ lang: 'ja-JP' });

  const {
    startRecording,
    stopRecording
  } = useAudioRecorder();

  const {
    isConnected,
    pronunciationResult,
    isProcessingFeedback,
    sendPronunciationAttempt,
    isAiTyping,
    aiResponseEnd,
    aiError,
    sendFreeTalkMessage,
    isSpeaking,
    interrupt,
    segments,
    currentSegment,
    ttsAudio,
    requestTTS,
    joinSession,
    unlockAudio
  } = useTrainingSocket();

  // Load topics and saved phrase IDs
  useEffect(() => {
    loadTopics();
    loadSavedPhraseIds();
  }, []);

  const loadSavedPhraseIds = async () => {
    try {
      const { data } = await trainingAPI.getSavedPhraseIds();
      setBookmarked(new Set(data.data || []));
    } catch (err) {
      // silently fail
    }
  };

  const loadTopics = async () => {
    try {
      const { data } = await trainingAPI.getTopics();
      const loaded = data.data || [];
      setTopics(loaded);
      if (loaded.length > 0) {
        selectTopic(loaded[0]);
      }
    } catch (err) {
      console.error('Failed to load topics:', err);
      toast.error('Failed to load topics. Please try again.');
      setTopics([]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectTopic = async (topic) => {
    setSelectedTopic(topic);
    setShowTopicSheet(false);
    setPhraseIndex(0);
    setScore(null);
    setFeedback(null);
    resetTranscript();
    setConversationStarter(null);

    try {
      const { data } = await trainingAPI.getPhrases(topic._id, { limit: 20 });
      setPhrases(data.data || []);
    } catch (err) {
      console.error('Failed to load phrases:', err);
      setPhrases([]);
    }

    // Start session
    try {
      const { data } = await trainingAPI.startSession(topic._id, activeMode);
      setSession(data.data);
    } catch (err) {
      console.error('Failed to start session:', err);
      setSession({ _id: 'demo' });
    }
  };

  useEffect(() => {
    if (session?._id) {
      joinSession(session._id);
    }
  }, [session?._id, joinSession]);

  // Score arrives immediately on pronunciation_feedback
  useEffect(() => {
    if (pronunciationResult) {
      setScore(pronunciationResult.score);
      setFeedback(null); // feedback text comes via ai_segment events
    }
  }, [pronunciationResult]);

  // First English feedback segment text → shown in feedback card
  useEffect(() => {
    const feedbackSegs = segments.filter(s => s.context === 'feedback' && s.lang === 'en');
    if (feedbackSegs.length > 0) {
      setFeedback(feedbackSegs.map(s => s.text).join(' '));
    }
  }, [segments]);

  useEffect(() => {
    setIsProcessing(isProcessingFeedback);
  }, [isProcessingFeedback]);

  // Accumulate free-talk segments in a ref so they're always current when ai_response_end fires
  const freeTalkSegmentsRef = useRef([]);
  useEffect(() => {
    const freeSegs = segments.filter(s => s.context === 'free_talk');
    if (freeSegs.length > 0) freeTalkSegmentsRef.current = freeSegs;
  }, [segments]);

  // When ai_response_end fires, reconstruct the conversation message from accumulated segments
  useEffect(() => {
    if (!aiResponseEnd || !showFreeTalk) return;
    // Transcript is complete here, but the AI may still be speaking the queued
    // audio — the status is driven by `isSpeaking` below, not by this event.
    const freeSegs = freeTalkSegmentsRef.current;
    const jaText = freeSegs.filter(s => s.lang === 'ja').map(s => s.text).join(' ');
    const enText = freeSegs.filter(s => s.lang === 'en').map(s => s.text).join(' ');
    if (!jaText && !enText) return;
    setConversation(prev => ([
      ...prev,
      {
        role: 'assistant',
        content: jaText || enText,
        english: enText,
        correction: aiResponseEnd.correction || null,
        timestamp: new Date()
      }
    ]));
    freeTalkSegmentsRef.current = [];
  }, [aiResponseEnd, showFreeTalk]); // eslint-disable-line react-hooks/exhaustive-deps

  // Free Talk status follows real audio state: 'speaking' while the AI talks,
  // back to 'ready' only once it has actually finished. Listening/processing are
  // owned by the panel itself, so don't stomp on them here.
  useEffect(() => {
    if (!showFreeTalk) return;
    setFreeTalkStatus(prev => {
      if (prev === 'listening') return prev;
      if (isSpeaking) return 'speaking';
      return prev === 'speaking' || prev === 'processing' ? 'ready' : prev;
    });
  }, [isSpeaking, showFreeTalk]);

  // Surface AI provider failures instead of leaving the user on a silent spinner
  useEffect(() => {
    if (aiError) toast.error(aiError);
  }, [aiError]);

  // tts_audio now carries base64 audioData instead of a URL
  useEffect(() => {
    if (!ttsAudio?.audioData) { setIsPlaying(false); return; }
    let url;
    let b64;
    try {
      b64 = String(ttsAudio.audioData).trim();
      // Some payloads are wrapped in quotes
      b64 = b64.replace(/^['"]+|['"]+$/g, '');
      // Only treat "base64" as a header marker when the string looks like a data-url-ish payload.
      // (In raw base64, the substring "base64" can appear by chance; slicing would corrupt it.)
      const looksLikeDataUrlish = /^dataaudio\//i.test(b64) || /^data:/i.test(b64);
      if (looksLikeDataUrlish) {
        const base64Idx = b64.toLowerCase().lastIndexOf('base64');
        if (base64Idx >= 0 && !b64.includes(',')) b64 = b64.slice(base64Idx + 'base64'.length);
      }

      // Handle both raw base64 and data URLs (and tolerate "dataaudio/...base64" malformed strings)
      if (/^dataaudio\//i.test(b64)) b64 = b64.replace(/^dataaudio\//i, 'data:audio/');
      if (/^data:audio\//i.test(b64) && /base64/i.test(b64) && !b64.includes(',')) b64 = b64.replace(/base64/i, 'base64,');
      if (/^data:/i.test(b64)) {
        if (b64.includes(',')) b64 = b64.split(',').pop() || '';
        else {
          const idx = b64.toLowerCase().lastIndexOf('base64');
          if (idx >= 0) b64 = b64.slice(idx + 'base64'.length);
        }
      }
      b64 = b64.replace(/^[\s:;,]+/, '');
      b64 = b64.replace(/^data:.*base64,?/i, '').replace(/\s+/g, '');
      b64 = b64.replace(/-/g, '+').replace(/_/g, '/');
      b64 = b64.replace(/[^A-Za-z0-9+/=]/g, '');
      // Remove stray '=' and re-pad (valid base64 only has 0-2 '=' at the end)
      b64 = b64.replace(/=/g, '');
      if (b64.length % 4 === 1) b64 = b64.slice(0, -1);
      const mod = b64.length % 4;
      if (mod) b64 += '='.repeat(4 - mod);

      if (!b64) throw new Error('Empty base64 audio payload');
      url = `data:${ttsAudio.audioMime || 'audio/wav'};base64,${b64}`;
    } catch (e) {
      console.error('Failed to decode tts_audio base64:', e, {
        mime: ttsAudio.audioMime,
        normalizedLen: typeof b64 === 'string' ? b64.length : null,
        mod4: typeof b64 === 'string' ? (b64.length % 4) : null,
        normalizedHead: typeof b64 === 'string' ? b64.slice(0, 24) : null,
        normalizedTail: typeof b64 === 'string' ? b64.slice(-24) : null
      });
      setIsPlaying(false);
      return;
    }
    const audio = new Audio(url);
    const cleanup = () => { setIsPlaying(false); };
    audio.onended = cleanup;
    audio.onerror = cleanup;
    audio.play().catch(cleanup);
  }, [ttsAudio]);

  // Analyze after mic stops
  useEffect(() => {
    if (!isListening && shouldAnalyzeRef.current) {
      shouldAnalyzeRef.current = false;

      const processRecording = async () => {
        // Show loader immediately — don't wait for the socket round-trip
        setIsProcessing(true);
        try {
          const wavBlob = await stopRecording();
          lastWavRef.current = wavBlob;
        } catch (err) {
          console.error('Failed to capture audio:', err);
        }
        analyzePronunciation();
      };

      processRecording();
    }
  }, [isListening]);

  const handleMicClick = async () => {
    if (isListening) {
      stopListening();
    } else {
      // Unlock audio output for subsequent ai_segment playback
      try { await unlockAudio?.(); } catch { /* ignore */ }
      resetTranscript();
      setScore(null);
      setFeedback(null);
      shouldAnalyzeRef.current = true;
      recordingStartRef.current = Date.now();
      try {
        await startRecording();
      } catch (err) {
        console.error('Microphone access error:', err);
      }
      startListening();
    }
  };

  const uploadAudioMetrics = async ({ expectedText, actualText, phraseId }) => {
    if (!lastWavRef.current) return;
    if (!actualText?.trim()) {
      lastWavRef.current = null;
      recordingStartRef.current = null;
      return;
    }
    const formData = new FormData();
    formData.append('audio', lastWavRef.current, 'attempt.wav');
    formData.append('expectedText', expectedText || '');
    formData.append('actualText', actualText || '');
    if (recordingStartRef.current) {
      formData.append('responseLatencyMs', String(Date.now() - recordingStartRef.current));
    }
    if (session?._id) formData.append('sessionId', session._id);
    if (selectedTopic?._id) formData.append('topicId', selectedTopic._id);
    if (phraseId) formData.append('phraseId', phraseId);
    formData.append('mode', activeMode);

    try {
      await speechAPI.analyzeMetrics(formData);
    } catch (err) {
      console.error('Audio metrics upload failed:', err);
    } finally {
      lastWavRef.current = null;
      recordingStartRef.current = null;
    }
  };

  const analyzePronunciation = async () => {
    const phrase = phrases[phraseIndex];
    const actualText = getFullTranscript ? getFullTranscript() : fullTranscript;
    if (!actualText?.trim()) {
      toast.error('No speech detected. Try again.');
      return;
    }
    try {
      if (isConnected) {
        let audioData = null;
        let audioMime = null;
        if (lastWavRef.current) {
          try {
            const parts = await blobToBase64Parts(lastWavRef.current);
            audioData = parts.b64;
            audioMime = parts.mime;
          } catch (e) {
            console.warn('Failed to encode WAV for socket upload:', e);
          }
        }
        sendPronunciationAttempt({
          sessionId: session?._id,
          phraseId: phrase._id,
          expected: phrase.japanese,
          actual: actualText.trim(),
          romaji: phrase.romaji,
          english: phrase.english,
          topicId: selectedTopic?._id,
          audioData,
          audioMime
        });
        uploadAudioMetrics({ expectedText: phrase.japanese, actualText: actualText, phraseId: phrase._id });
        return;
      }

      setIsProcessing(true);
      const { data } = await aiAPI.getPronunciationFeedback(
        phrase.japanese, actualText,
        { romaji: phrase.romaji, english: phrase.english, topicId: selectedTopic?._id }
      );
      setScore(data.data.score);
      setFeedback(data.data.feedback);
      uploadAudioMetrics({ expectedText: phrase.japanese, actualText: actualText, phraseId: phrase._id });
    } catch (err) {
      console.error('Failed to analyze pronunciation:', err);
      toast.error('Could not analyze pronunciation. Please try again.');
    } finally {
      if (!isConnected) {
        setIsProcessing(false);
      }
    }
  };

  const playAudio = async () => {
    if (isPlaying) return;
    const phrase = phrases[phraseIndex];
    if (!phrase) return;
    setIsPlaying(true);
    try {
      if (isConnected) {
        // user gesture: unlock audio before requesting TTS
        try { await unlockAudio?.(); } catch { /* ignore */ }
        requestTTS({ text: phrase.japanese, phraseId: phrase._id });
        return;
      }
      const { data } = await speechAPI.textToSpeech(phrase.japanese);
      const url = data.data?.url || data.data?.audioUrl;
      if (url) {
        const audio = new Audio(url);
        audio.onended = () => setIsPlaying(false);
        audio.play();
      } else throw new Error();
    } catch {
      toast.error('Could not play audio');
      setIsPlaying(false);
    }
  };

  const goToPhrase = (dir) => {
    const next = phraseIndex + dir;
    if (next >= 0 && next < phrases.length) {
      setPhraseIndex(next);
      resetTranscript();
      setScore(null);
      setFeedback(null);
    }
  };

  const completeCurrentSession = async () => {
    try {
      if (session?._id && session._id !== 'demo-session') {
        await trainingAPI.completeSession(session._id);
      }
      toast.success('Session complete! Great work! 🎉');
    } catch (error) {
      console.error('Failed to complete session:', error);
      toast.success('Session complete!');
    }
    setSession(null);
    setPhraseIndex(0);
    setScore(null);
    setFeedback(null);
  };

  const toggleBookmark = async () => {
    const id = phrases[phraseIndex]?._id;
    if (!id) return;
    setBookmarked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    try {
      const { data } = await trainingAPI.toggleSavePhrase(id, selectedTopic?._id);
      if (data.data?.saved) {
        toast.success('Phrase saved to favorites');
      }
    } catch (err) {
      // revert on error
      setBookmarked(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    }
  };

  const currentPhrase = phrases[phraseIndex];
  const progress = phrases.length > 0 ? ((phraseIndex + 1) / phrases.length) * 100 : 0;
  const difficultyLevel = currentPhrase?.difficulty === 'advanced' ? 3 : currentPhrase?.difficulty === 'intermediate' ? 2 : 1;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* ─── Top Bar: Topic + Progress ─── */}
      <div className="flex-shrink-0 px-4 md:px-6 lg:px-8 pt-4 pb-2">
        <div className="max-w-4xl mx-auto">
          {/* Topic & Progress Row */}
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setShowTopicSheet(true)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-white/[0.08] hover:border-primary-500/30 transition-all group"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <span className="text-lg">{selectedTopic?.icon || '📚'}</span>
              <div className="text-left">
                <span className="font-display font-semibold text-white text-sm">{selectedTopic?.name || 'Select Topic'}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-primary-400 transition-colors" />
            </button>

            {/* Progress Pill */}
            <div className="flex-1 flex items-center gap-3">
              <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-xs font-bold text-slate-400 tabular-nums flex-shrink-0">
                {phraseIndex + 1}/{phrases.length}
              </span>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex gap-2">
            {modes.map(mode => {
              const isActive = activeMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    if (activeMode === mode.id) return;
                    setActiveMode(mode.id);
                    if (mode.id === 'free_talk') setShowFreeTalk(true);
                    else setShowFreeTalk(false);
                    if (selectedTopic) {
                      setPhraseIndex(0);
                      setScore(null);
                      setFeedback(null);
                      resetTranscript();
                      setConversationStarter(null);
                      trainingAPI.startSession(selectedTopic._id, mode.id)
                        .then(res => setSession(res.data.data))
                        .catch(err => setSession({ _id: 'demo' }));
                    }
                  }}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${isActive
                    ? 'text-white shadow-lg'
                    : 'text-slate-400 border border-white/[0.08] hover:border-white/[0.15] hover:text-slate-200'
                    }`}
                  style={isActive
                    ? { background: `linear-gradient(135deg, var(--tw-gradient-stops))`, '--tw-gradient-from': mode.color.split(' ')[0].replace('from-', '').replace('-500', ''), backgroundImage: `linear-gradient(135deg, rgba(var(--primary-600), 1), rgba(var(--primary-500), 0.8))` }
                    : { background: 'rgba(255,255,255,0.03)' }
                  }
                >
                  <mode.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{mode.label}</span>
                  <span className="sm:hidden">{mode.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 md:px-6 lg:px-8 py-4">

          {/* ─── Phrase Practice Mode ─── */}
          {!showFreeTalk && currentPhrase && (
            <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6">

              {/* Phrase Card - Main Focus */}
              <div className="flex-1 flex flex-col min-h-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={phraseIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="flex-1 flex flex-col rounded-2xl border border-white/[0.08] overflow-hidden"
                    style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)' }}
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map(i => (
                            <span key={i} className={`text-[10px] ${i <= difficultyLevel ? 'text-amber-400' : 'text-slate-700'}`}>★</span>
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {currentPhrase.difficulty || 'beginner'}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button onClick={playAudio} disabled={isPlaying} className={`p-2 rounded-lg transition-all ${isPlaying ? 'text-primary-400 bg-primary-500/10' : 'text-slate-500 hover:text-white hover:bg-white/[0.06]'}`}>
                          <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
                        </button>
                        <button onClick={toggleBookmark} className="p-2 text-slate-500 hover:text-amber-400 rounded-lg hover:bg-white/[0.06] transition-all">
                          {bookmarked.has(currentPhrase._id) ? <BookmarkCheck className="w-4 h-4 text-amber-400" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Phrase Content */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-8 md:py-12">
                      <h2 className="font-japanese text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight tracking-wide">
                        {currentPhrase.japanese}
                      </h2>
                      {activeMode !== 'test' && (
                        <div className="space-y-1.5">
                          <p className="text-lg sm:text-xl text-primary-400 font-medium">{currentPhrase.romaji}</p>
                          <p className="text-sm sm:text-base text-slate-400 italic">"{currentPhrase.english}"</p>
                        </div>
                      )}
                      {activeMode === 'test' && (
                        <p className="text-sm text-slate-500 mt-2">Listen and try to pronounce this phrase</p>
                      )}
                    </div>

                    {/* Context Footer */}
                    {currentPhrase.usageContext && activeMode !== 'test' && (
                      <div className="px-4 pb-4">
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-slate-400 border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <Info className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                          {currentPhrase.usageContext}
                        </div>
                      </div>
                    )}

                    {/* Navigation Footer */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
                      <button
                        onClick={() => goToPhrase(-1)}
                        disabled={phraseIndex === 0}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-white/[0.06] transition-all"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {phrases.slice(Math.max(0, phraseIndex - 2), Math.min(phrases.length, phraseIndex + 3)).map((_, i) => {
                          const actualIndex = Math.max(0, phraseIndex - 2) + i;
                          return (
                            <button
                              key={actualIndex}
                              onClick={() => { setPhraseIndex(actualIndex); resetTranscript(); setScore(null); setFeedback(null); }}
                              className={`w-2 h-2 rounded-full transition-all ${actualIndex === phraseIndex ? 'bg-primary-400 w-5' : 'bg-white/10 hover:bg-white/20'}`}
                            />
                          );
                        })}
                      </div>
                      <button
                        onClick={() => goToPhrase(1)}
                        disabled={phraseIndex >= phrases.length - 1}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-white/[0.06] transition-all"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right Panel - Mic + Feedback */}
              <div className="lg:w-[320px] flex flex-col gap-3">
                {/* Score Feedback */}
                <AnimatePresence>
                  {score !== null && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`flex items-center gap-3 p-4 rounded-2xl border ${score >= 80 ? 'bg-emerald-500/10 border-emerald-500/20' :
                        score >= 50 ? 'bg-amber-500/10 border-amber-500/20' :
                          'bg-rose-500/10 border-rose-500/20'
                        }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}>
                        <span className="text-xl font-black text-white">{score}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {score >= 80 ? <Trophy className="w-3.5 h-3.5 text-emerald-400" /> :
                            score >= 50 ? <Zap className="w-3.5 h-3.5 text-amber-400" /> :
                              <X className="w-3.5 h-3.5 text-rose-400" />}
                          <span className={`text-xs font-bold ${score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400'
                            }`}>
                            {score >= 80 ? 'Excellent!' : score >= 50 ? 'Good try!' : 'Keep practicing'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{feedback}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Mic Zone */}
                <div className="flex flex-col items-center py-6 lg:py-8 rounded-2xl border border-white/[0.08]" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {isProcessing ? (
                    <div className="w-24 h-24 rounded-full bg-white/[0.06] flex items-center justify-center border-2 border-white/[0.06]">
                      <Loader2 className="w-10 h-10 animate-spin text-primary-400" />
                    </div>
                  ) : (
                    <motion.button
                      onClick={handleMicClick}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      disabled={!isSupported}
                      className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all ${isListening
                        ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/30'
                        : 'text-white hover:shadow-xl hover:shadow-primary-500/20'
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                      style={!isListening ? { background: 'linear-gradient(135deg, rgba(var(--primary-600), 1), rgba(var(--primary-500), 0.9))' } : {}}
                    >
                      {isListening && (
                        <>
                          <span className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-20" />
                          <span className="absolute inset-[-6px] rounded-full border-2 border-rose-300/50 animate-pulse" />
                        </>
                      )}
                      {isListening ? <MicOff className="w-9 h-9 relative z-10" /> : <Mic className="w-9 h-9" />}
                    </motion.button>
                  )}

                  <p className="mt-4 text-[11px] font-bold text-slate-500 uppercase tracking-[0.12em]">
                    {isProcessing ? 'Analyzing your speech...' : isListening ? 'Listening... Tap to stop' : 'Tap to speak'}
                  </p>

                  {/* Recording indicator */}
                  {isListening && (
                    <div className="flex items-center gap-1 mt-3">
                      {[...Array(7)].map((_, i) => (
                        <motion.span
                          key={i}
                          className="w-1 bg-rose-400 rounded-full"
                          animate={{ height: [6, 22, 6] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.08 }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Voice indicator */}
                  <div className="flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-lg bg-white/[0.04] text-[10px] text-slate-500">
                    <span>🏢</span> Using <strong className="text-slate-300">Tokyo Accent</strong>
                  </div>
                </div>

                {/* Session Complete Button */}
                {phraseIndex >= phrases.length - 1 && score !== null && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={completeCurrentSession}
                    className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Trophy className="w-4 h-4" />
                    Complete Session
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                )}

                {/* Next Phrase Preview */}
                {phraseIndex < phrases.length - 1 && phrases[phraseIndex + 1] && (
                  <button
                    onClick={() => goToPhrase(1)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/[0.06] hover:border-primary-500/20 transition-all group"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-500 min-w-0">
                      <SkipForward className="w-3.5 h-3.5 flex-shrink-0 group-hover:text-primary-400 transition-colors" />
                      <span className="flex-shrink-0">Up next:</span>
                      <span className="font-japanese truncate text-slate-400">{phrases[phraseIndex + 1].japanese}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-primary-400 transition-colors flex-shrink-0" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ─── Free Talk Interface ─── */}
          {showFreeTalk && (
            <FreeTalkPanel
              topic={selectedTopic}
              conversation={conversation}
              setConversation={setConversation}
              status={freeTalkStatus}
              setStatus={setFreeTalkStatus}
              isAiTyping={isAiTyping}
              unlockAudio={unlockAudio}
              onInterrupt={interrupt}
              conversationStarter={conversationStarter}
              setConversationStarter={setConversationStarter}
              onSendMessage={async (text, wavBlob, latencyMs) => {
                setConversation(prev => ([
                  ...prev,
                  { role: 'user', content: text, timestamp: new Date() }
                ]));
                setFreeTalkStatus('processing');

                let audioData = null;
                let audioMime = null;
                if (wavBlob) {
                  try {
                    const parts = await blobToBase64Parts(wavBlob);
                    audioData = parts.b64;
                    audioMime = parts.mime;
                  } catch (e) {
                    console.warn('Failed to encode free-talk WAV for socket upload:', e);
                  }
                }
                sendFreeTalkMessage({
                  sessionId: session?._id,
                  text,
                  conversationHistory: conversation,
                  topicId: selectedTopic?._id,
                  conversationStarter,
                  audioData,
                  audioMime
                });

                if (wavBlob) {
                  lastWavRef.current = wavBlob;
                  recordingStartRef.current = latencyMs ? Date.now() - latencyMs : null;
                  uploadAudioMetrics({ actualText: text });
                }
              }}
            />
          )}

          {/* ─── No Phrases State ─── */}
          {!showFreeTalk && !currentPhrase && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
              <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
                <Headphones className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-display font-bold text-slate-300 mb-2">No Phrases Available</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                {selectedTopic ? 'This topic has no phrases yet. Try selecting a different topic.' : 'Select a topic to start learning.'}
              </p>
              <button
                onClick={() => setShowTopicSheet(true)}
                className="mt-4 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
              >
                Browse Topics
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Topic Selection Sheet ─── */}
      <AnimatePresence>
        {showTopicSheet && (
          <TopicSheet
            topics={topics}
            selectedTopic={selectedTopic}
            filter={topicFilter}
            setFilter={setTopicFilter}
            onSelect={selectTopic}
            onClose={() => setShowTopicSheet(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Topic Selection Sheet ─── */
const TopicSheet = ({ topics, selectedTopic, filter, setFilter, onSelect, onClose }) => {
  const grouped = topics.reduce((acc, t) => {
    const cat = t.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});

  const catIcons = {
    Safety: '🛡️', Basic: '💬', Business: '💼', Workplace: '🏗️', General: '📚'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end lg:items-center lg:justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full lg:w-[560px] lg:max-h-[80vh] max-h-[85vh] rounded-t-2xl lg:rounded-2xl shadow-2xl flex flex-col border border-white/[0.08]"
        style={{ background: 'linear-gradient(180deg, #1e293b, #0f172a)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle (mobile only) */}
        <div className="flex justify-center pt-3 pb-1 lg:hidden">
          <div className="w-10 h-1 bg-white/10 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 lg:pt-5">
          <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
            📚 Select Topic
          </h3>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 px-5 pb-3">
          {['all', 'assigned', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f ? 'bg-primary-600 text-white' : 'bg-white/[0.06] text-slate-400 hover:bg-white/[0.1] hover:text-slate-300'
                }`}
            >
              {f === 'all' ? 'All Topics' : f === 'assigned' ? 'Assigned' : 'Completed'}
            </button>
          ))}
        </div>

        {/* Topics List */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 scrollbar-thin">
          {Object.entries(grouped).map(([category, catTopics]) => (
            <div key={category} className="mb-4">
              <h4 className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                <span>{catIcons[category] || '📚'}</span> {category}
              </h4>
              <div className="space-y-1.5">
                {catTopics.map(topic => (
                  <button
                    key={topic._id}
                    onClick={() => onSelect(topic)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border ${selectedTopic?._id === topic._id
                      ? 'bg-primary-500/10 border-primary-500/30'
                      : 'border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1]'
                      }`}
                    style={selectedTopic?._id !== topic._id ? { background: 'rgba(255,255,255,0.02)' } : {}}
                  >
                    <span className="text-2xl">{topic.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="font-display font-semibold text-white text-sm truncate">{topic.name}</h5>
                        <span className="text-[10px] font-bold text-primary-400 bg-primary-500/10 px-1.5 py-0.5 rounded flex-shrink-0">
                          Assigned
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{topic.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─── Free Talk Panel ─── */
const FreeTalkPanel = ({ topic, conversation, status, setStatus, isAiTyping, onSendMessage, unlockAudio, conversationStarter, setConversationStarter, onInterrupt }) => {
  const {
    isListening, fullTranscript, isSupported,
    startListening, stopListening, resetTranscript,
    getFullTranscript
  } = useSpeechRecognition({ lang: 'ja-JP' });

  const {
    startRecording,
    stopRecording
  } = useAudioRecorder();

  const chatEndRef = useRef(null);
  const recordingStartRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleAction = async () => {
    // Barge-in: tapping the mic while the AI is talking cuts it off and hands
    // the turn straight back to the learner, the way a real conversation works.
    if (status === 'speaking' || status === 'processing') {
      onInterrupt?.();
      resetTranscript();
      recordingStartRef.current = Date.now();
      try { await startRecording(); } catch (err) { console.error('Mic access error:', err); }
      startListening();
      setStatus('listening');
      return;
    }

    if (status === 'ready' || status === 'idle') {
      resetTranscript();
      recordingStartRef.current = Date.now();
      // Unlock audio once via user gesture for upcoming ai_segment playback
      try { await unlockAudio?.(); } catch { /* ignore */ }
      try {
        await startRecording();
      } catch (err) {
        console.error('Mic access error:', err);
      }
      startListening();
      setStatus('listening');
    } else if (status === 'listening') {
      stopListening();
      let wavBlob = null;
      try {
        wavBlob = await stopRecording();
      } catch (err) {
        console.error('Failed to capture audio:', err);
      }

      const duration = recordingStartRef.current ? Date.now() - recordingStartRef.current : 0;

      const actualText = getFullTranscript ? getFullTranscript() : fullTranscript;

      if (actualText?.trim()) {
        setStatus('processing');
        onSendMessage(actualText.trim(), wavBlob, duration);
      } else {
        setStatus('idle');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Chat Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white block leading-tight">Free Talk</span>
            <span className="text-[10px] text-slate-500">{topic?.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04]">
          <span className={`w-2 h-2 rounded-full ${status === 'listening' ? 'bg-rose-500 animate-pulse' : (status === 'processing' || isAiTyping) ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            {status === 'listening' ? 'Listening' : (status === 'processing' || isAiTyping) ? 'Thinking' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Conversation Starters */}
      {topic?.conversationStarters?.length > 0 && (
        <div className="mb-3 rounded-2xl border border-white/[0.08] p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MessageCircle className="w-3 h-3 text-emerald-400" /> Conversation Starters
            </span>
            {conversationStarter && (
              <button
                onClick={() => setConversationStarter(null)}
                className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {topic.conversationStarters.map((starter, i) => {
              const isActive = conversationStarter === starter.prompt;
              return (
                <button
                  key={`${starter.prompt}-${i}`}
                  onClick={() => setConversationStarter(starter.prompt)}
                  className={`text-left px-3 py-2 rounded-xl border text-xs transition-all ${isActive
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                    : 'border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/[0.16]'
                    }`}
                >
                  <p className="font-medium leading-tight">{starter.prompt}</p>
                  {starter.description && (
                    <p className="text-[10px] mt-1 text-slate-500">{starter.description}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Conversation Area */}
      <div className="flex-1 rounded-2xl border border-white/[0.08] p-4 overflow-y-auto scrollbar-thin min-h-0" style={{ background: 'rgba(255,255,255,0.02)' }}>
        {conversation.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
              <MessageCircle className="w-7 h-7 text-slate-600" />
            </div>
            <p className="text-sm font-semibold text-slate-300 mb-1">Start a conversation</p>
            <p className="text-xs text-slate-500 max-w-xs">Press the button below to practice Japanese conversation with AI</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversation.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">🤖</span>
                  </div>
                )}
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-md'
                  : 'bg-white/[0.06] text-slate-200 rounded-bl-md border border-white/[0.06]'
                  }`}>
                  <p className="font-japanese">{msg.content}</p>
                  {msg.romaji && <p className="text-[11px] mt-1 opacity-60">{msg.romaji}</p>}
                  {msg.english && <p className="text-[11px] mt-0.5 opacity-50 italic">{msg.english}</p>}
                </div>
              </motion.div>
            ))}
            {isAiTyping && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">🤖</span>
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white/[0.06] border border-white/[0.06]">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.span key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex justify-center mt-4 pb-2">
        <motion.button
          onClick={handleAction}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!isSupported}
          className={`flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-semibold text-sm transition-all ${status === 'listening'
            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
            : status === 'speaking'
              ? 'bg-slate-700 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-600'
              : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/20 hover:shadow-xl'
            } disabled:opacity-50`}
        >
          {status === 'listening' ? (
            <>
              <Square className="w-4 h-4" /> Stop Recording
              <div className="flex items-center gap-0.5 ml-1">
                {[0, 1, 2].map(i => (
                  <motion.span key={i} className="w-1 bg-white/60 rounded-full" animate={{ height: [4, 12, 4] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }} />
                ))}
              </div>
            </>
          ) : status === 'speaking' ? (
            // Stays enabled: tapping here is the barge-in that cuts the AI off
            <>
              <Mic className="w-4 h-4" /> Interrupt & Reply
              <div className="flex items-center gap-0.5 ml-1">
                {[0, 1, 2].map(i => (
                  <motion.span key={i} className="w-1 bg-white/60 rounded-full" animate={{ height: [4, 12, 4] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </div>
            </>
          ) : status === 'processing' ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
          ) : (
            <><Mic className="w-4 h-4" /> Start Talking</>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default LearnPage;
