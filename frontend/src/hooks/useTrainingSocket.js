import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

// Always connect same-origin: in dev Vite proxies /socket.io (including the
// websocket upgrade) to the backend, in prod the backend serves the app itself.
// This keeps the socket working regardless of which port the backend runs on.
const socketBaseUrl = window.location.origin;

const getInterSegmentDelayMs = (seg, nextSeg = null) => {
  // Allow server override if present.
  if (typeof seg?.pauseMs === 'number' && Number.isFinite(seg.pauseMs) && seg.pauseMs >= 0) return seg.pauseMs;

  const lang = String(seg?.lang || '').trim().toLowerCase();
  const nextLang = String(nextSeg?.lang || '').trim().toLowerCase();
  const isJa = lang === 'ja' || lang.startsWith('ja-') || lang === 'jp' || lang === 'jpn' || lang === 'japanese';
  const isEn = lang === 'en' || lang.startsWith('en-') || lang === 'english';
  const nextIsJa = nextLang === 'ja' || nextLang.startsWith('ja-') || nextLang === 'jp';
  const nextIsEn = nextLang === 'en' || nextLang.startsWith('en-') || nextLang === 'english';

  // Natural language-learning pacing (like Duolingo / language apps):
  // - After Japanese: brief pause before English translation (350ms), or before next JA (500ms)
  // - After English: slightly longer pause to let the meaning sink in (600ms), or before next JA (700ms)
  // - Same-language consecutive: short breath gap (400ms)
  if (isJa && nextIsEn) return 350;   // JA → EN: translation follows quickly
  if (isJa && nextIsJa) return 500;   // JA → JA: natural sentence pause
  if (isJa) return 400;               // JA → end or other
  if (isEn && nextIsJa) return 700;   // EN → JA: give time to process before next JA
  if (isEn && nextIsEn) return 500;   // EN → EN: sentence pause
  if (isEn) return 600;               // EN → end or other
  return 400;                         // fallback
};

const newRequestId = () => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch { /* ignore */ }
  return `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

// Decode base64 audio to a playable Blob URL
// Default MIME is audio/wav — matches DeepInfra Chatterbox Multilingual output
function base64ToObjectURL(audioData, mime = 'audio/wav') {
  if (!audioData || typeof audioData !== 'string') throw new Error('Invalid audioData');

  let raw = audioData.trim();
  // Some payloads are JSON-stringified ("...") or otherwise wrapped
  raw = raw.replace(/^['"]+|['"]+$/g, '');
  if (raw.startsWith('data:')) {
    // Proper data URL — Audio() can play it directly.
    return raw;
  }

  // Normalize common malformed data-url-ish strings seen in some transports/loggers.
  // Example: "dataaudio/wavbase64UklGR..." (missing punctuation)
  let b64 = raw;
  // Only treat "base64" as a header marker when the string actually looks like a data-url-ish payload.
  // (In raw base64 audio, the substring "base64" can appear by chance; slicing would corrupt it.)
  const looksLikeDataUrlish = /^dataaudio\//i.test(b64) || /^data:/i.test(b64);
  if (looksLikeDataUrlish) {
    if (/^dataaudio\//i.test(b64)) b64 = b64.replace(/^dataaudio\//i, 'data:audio/');
    // If the payload contains a base64 marker but lacks a comma separator,
    // extract everything AFTER the last "base64" occurrence.
    const base64Idx = b64.toLowerCase().lastIndexOf('base64');
    if (base64Idx >= 0 && !b64.includes(',')) {
      b64 = b64.slice(base64Idx + 'base64'.length);
    }
  }
  // Ensure "...base64," separator exists if it looks like a data URL
  if (/^data:/i.test(b64) && /base64/i.test(b64) && !b64.includes(',')) {
    b64 = b64.replace(/base64/i, 'base64,');
  }
  // Extract payload if it looks like data:*;base64,<payload>
  if (/^data:/i.test(b64)) {
    if (b64.includes(',')) b64 = b64.split(',').pop() || '';
    else {
      // Extremely malformed, but try to split on "base64"
      const idx = b64.toLowerCase().lastIndexOf('base64');
      if (idx >= 0) b64 = b64.slice(idx + 'base64'.length);
    }
  }

  // Drop common separators that can remain after slicing
  b64 = b64.replace(/^[\s:;,]+/, '');

  // Remove whitespace and any lingering prefix chars
  b64 = b64.replace(/^data:.*base64,?/i, '').replace(/\s+/g, '');

  // Convert base64url → base64
  b64 = b64.replace(/-/g, '+').replace(/_/g, '/');
  // Strip any non-base64 chars
  b64 = b64.replace(/[^A-Za-z0-9+/=]/g, '');
  // '=' padding is only valid at the end (and at most 2 chars). Some payloads contain stray '=' inside,
  // which makes atob() throw. Remove all '=' then re-pad.
  b64 = b64.replace(/=/g, '');

  // If length % 4 === 1, it's not valid base64; drop the last char and continue.
  if (b64.length % 4 === 1) b64 = b64.slice(0, -1);
  // Pad to multiple of 4 for atob()
  const mod = b64.length % 4;
  if (mod) b64 += '='.repeat(4 - mod);

  // Prefer data: URLs over manual atob()+Blob conversion.
  // - Much faster (no per-byte loop on main thread)
  // - Avoids CSP 'blob:' restrictions when media-src allows data:
  if (!b64) throw new Error('Empty base64 audio payload');
  return `data:${mime};base64,${b64}`;
}

const useTrainingSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessingFeedback, setIsProcessingFeedback] = useState(false);
  const [pronunciationResult, setPronunciationResult] = useState(null);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [aiResponseEnd, setAiResponseEnd] = useState(null);
  const [ttsAudio, setTtsAudio] = useState(null);
  // Streaming segments accumulator (for display + free-talk conversation reconstruction)
  const [segments, setSegments] = useState([]);
  const [currentSegment, setCurrentSegment] = useState(null);
  // True while AI audio is actually playing or still expected — the UI must not
  // report "ready" just because the LLM finished, since audio trails behind it.
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiError, setAiError] = useState(null);

  const socketRef = useRef(null);
  // We can receive segments out-of-order AND we can have overlapping "runs" (user triggers a new
  // attempt while the previous audio is still playing). Keep one active run and a FIFO queue of
  // pending runs so no queued audio gets replaced/dropped.
  const runsRef = useRef({ current: null, pendingQueue: [] });

  const isPlayingRef = useRef(false);
  const currentAudioRef = useRef(null);
  const audioCtxRef = useRef(null);

  const startRun = useCallback((context, requestId) => {
    const id = requestId || newRequestId();

    // If a run with this id already exists (e.g. registered by sendFreeTalkMessage before
    // ai_typing echoes back the same requestId), return it without creating a duplicate.
    const existing = id ? (
      runsRef.current.current?.id === id
        ? runsRef.current.current
        : (runsRef.current.pendingQueue || []).find(r => r.id === id) || null
    ) : null;
    if (existing) return id;

    const run = { id, context, segmentMap: {}, nextExpected: 0, totalSegments: null };

    const hasActiveWork = !!runsRef.current.current && (
      isPlayingRef.current ||
      runsRef.current.current.nextExpected > 0 ||
      Object.keys(runsRef.current.current.segmentMap).length > 0
    );

    if (!runsRef.current.current || !hasActiveWork) {
      runsRef.current.current = run;
      runsRef.current.pendingQueue = [];
      setSegments([]);
      setCurrentSegment(null);
    } else {
      runsRef.current.pendingQueue.push(run);
    }

    return id;
  }, []);

  const findRunById = useCallback((requestId) => {
    if (!requestId) return null;
    if (runsRef.current.current?.id === requestId) return runsRef.current.current;
    return (runsRef.current.pendingQueue || []).find(r => r.id === requestId) || null;
  }, []);

  const maybeSwapToPendingRun = useCallback(() => {
    const cur = runsRef.current.current;
    if (!cur) return false;
    if (cur.totalSegments == null) return false;

    const done = cur.nextExpected >= cur.totalSegments && Object.keys(cur.segmentMap).length === 0;
    if (!done) return false;

    const nextRun = (runsRef.current.pendingQueue || []).shift();
    if (nextRun) {
      runsRef.current.current = nextRun;
      setSegments([]);
      setCurrentSegment(null);
      return true;
    }
    return false;
  }, []);

  // Must be called from a user gesture (click/tap) to avoid autoplay restrictions
  const unlockAudio = useCallback(async () => {
    try {
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return false;
        audioCtxRef.current = new Ctx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }
      // Play a tiny silent buffer once to "unlock" audio output on iOS/Safari
      const ctx = audioCtxRef.current;
      const buffer = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(ctx.destination);
      src.start(0);
      return true;
    } catch (e) {
      console.warn('unlockAudio failed:', e);
      return false;
    }
  }, []);

  // A turn is still "speaking" while audio plays, while queued segments remain,
  // or while more segments are still expected from the server.
  const recomputeSpeaking = useCallback(() => {
    const run = runsRef.current.current;
    const pending = runsRef.current.pendingQueue || [];
    const runBusy = (r) => !!r && (
      Object.keys(r.segmentMap).length > 0 ||
      r.totalSegments == null ||
      r.nextExpected < r.totalSegments
    );
    setIsSpeaking(isPlayingRef.current || runBusy(run) || pending.some(runBusy));
  }, []);

  // Drain the ordered audio queue — only plays segment at nextExpectedRef.current
  const drainQueue = useCallback(() => {
    if (isPlayingRef.current) return;

    // If current run finished and we have a pending run, swap.
    maybeSwapToPendingRun();

    const run = runsRef.current.current;
    if (!run) { recomputeSpeaking(); return; }

    const nextIdx = run.nextExpected;
    const seg = run.segmentMap[nextIdx];
    if (!seg) { recomputeSpeaking(); return; } // next expected segment not yet received — wait

    // Remove from map and advance pointer
    delete run.segmentMap[nextIdx];
    run.nextExpected = nextIdx + 1;

    isPlayingRef.current = true;
    setCurrentSegment(seg);
    recomputeSpeaking();

    // Peek at the next segment (may not have arrived yet) for context-aware gap timing
    const nextSeg = run.segmentMap[run.nextExpected] || null;

    if (seg.audioData) {
      let url;
      try { url = base64ToObjectURL(seg.audioData, seg.audioMime || 'audio/wav'); } catch (err) { url = null; console.error('base64ToObjectURL failed', err); }
      if (url) {
        const audio = new Audio(url);
        currentAudioRef.current = audio;
        const done = () => {
          // Only revoke blob: object URLs (data: URLs are not revokable)
          if (typeof url === 'string' && url.startsWith('blob:')) URL.revokeObjectURL(url);
          currentAudioRef.current = null;
          isPlayingRef.current = false;
          const pauseMs = getInterSegmentDelayMs(seg, nextSeg);
          setTimeout(() => drainQueue(), pauseMs);
        };
        audio.onended = done;
        audio.onerror = (e) => {
          console.error(`Audio error on segment ${seg.index}:`, e);
          done();
        };
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((e) => {
            console.error(`Audio playback rejected on segment ${seg.index} (possible autoplay blocker or invalid format):`, e);
            done();
          });
        }
        return;
      }
    }
    // No playable audio data — show text briefly then advance
    const timer = setTimeout(() => {
      isPlayingRef.current = false;
      drainQueue();
    }, 800 + getInterSegmentDelayMs(seg, nextSeg));
    currentAudioRef.current = { pause: () => clearTimeout(timer) };
  }, [recomputeSpeaking]); // eslint-disable-line react-hooks/exhaustive-deps

  const enqueueSegment = useCallback((seg) => {
    const requestId = seg?.requestId || null;
    let run = findRunById(requestId);
    if (!run) {
      // If server didn't send requestId (older backend), attach to the current run.
      // Creating a new run here can cause "segment 0 plays, segment 1 never plays" because
      // later segments get buffered into a pending run.
      if (!requestId && runsRef.current.current) {
        run = runsRef.current.current;
      } else {
        // Otherwise, register a run for this requestId.
        const id = startRun(seg?.context || 'feedback', requestId);
        run = findRunById(id);
      }
    }

    // Deduplicate by index within the run
    if (run.segmentMap[seg.index] !== undefined) return;
    run.segmentMap[seg.index] = seg;

    // Only show segments of the currently playing run in the UI
    if (runsRef.current.current?.id === run.id) {
      setSegments(prev => {
        if (prev.some(s => s.index === seg.index && (s.requestId || null) === requestId)) return prev;
        const next = [...prev, seg];
        next.sort((a, b) => a.index - b.index);
        return next;
      });
    }

    drainQueue();
    recomputeSpeaking();
  }, [drainQueue, findRunById, startRun, recomputeSpeaking]);

  const resetQueue = useCallback(() => {
    if (currentAudioRef.current) { try { currentAudioRef.current.pause(); } catch { /* */ } }
    currentAudioRef.current = null;
    runsRef.current = { current: null, pendingQueue: [] };
    isPlayingRef.current = false;
    setSegments([]);
    setCurrentSegment(null);
    setIsSpeaking(false);
  }, []);

  // Barge-in: the learner starts talking over the AI. Cut the audio locally and
  // tell the server to abandon the turn so no further segments are generated,
  // billed, or played on top of the learner's new turn.
  const interrupt = useCallback(() => {
    const activeIds = [
      runsRef.current.current?.id,
      ...(runsRef.current.pendingQueue || []).map(r => r.id)
    ].filter(Boolean);

    resetQueue();
    setIsAiTyping(false);

    if (activeIds.length === 0) {
      socketRef.current?.emit('cancel_turn', {});
      return;
    }
    activeIds.forEach(requestId => socketRef.current?.emit('cancel_turn', { requestId }));
  }, [resetQueue]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socket = io(socketBaseUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('connect_error', (err) => {
      console.error('Socket error:', err.message);
      setIsConnected(false);
    });

    // Pronunciation: score arrives immediately, audio segments follow
    socket.on('feedback_processing', () => setIsProcessingFeedback(true));
    socket.on('pronunciation_feedback', (data) => {
      setIsProcessingFeedback(false);
      const run = findRunById(data?.requestId) || runsRef.current.current;
      if (run) run.totalSegments = data?.totalSegments ?? run.totalSegments;
      setPronunciationResult(data); // { score, suggestions, totalSegments, expected, actual }
    });

    // Free talk: segments stream in, then ai_response_end signals completion
    socket.on('ai_typing', (data) => {
      setIsAiTyping(true);
      // Only register a new run if sendFreeTalkMessage hasn't already done so for this requestId.
      // Calling startRun twice for the same requestId can replace or interrupt a run mid-playback.
      if (!findRunById(data?.requestId)) {
        startRun('free_talk', data?.requestId);
      }
      setAiResponseEnd(null);
    });
    socket.on('ai_response_end', (data) => {
      setIsAiTyping(false);
      const run = findRunById(data?.requestId) || runsRef.current.current;
      if (run) run.totalSegments = data?.totalSegments ?? run.totalSegments;
      setAiResponseEnd(data);
      // If we were waiting for completion to swap, let the player re-check.
      drainQueue();
      recomputeSpeaking();
    });

    socket.on('ai_error', (data) => {
      setIsAiTyping(false);
      setAiError(data?.message || 'The AI assistant is temporarily unavailable.');
    });

    // Server confirms a turn was abandoned — make sure nothing keeps "speaking"
    socket.on('turn_cancelled', () => recomputeSpeaking());

    // Shared segment event (context: 'free_talk' | 'feedback')
    socket.on('ai_segment', (seg) => enqueueSegment(seg));

    // On-demand phrase TTS (base64 direct)
    socket.on('tts_audio', (data) => setTtsAudio(data));
    socket.on('tts_error', (data) => console.error('TTS error:', data.message));

    socketRef.current = socket;
    return () => { socket.disconnect(); socketRef.current = null; };
  }, [enqueueSegment, resetQueue, recomputeSpeaking]);

  const joinSession = useCallback((sessionId) => {
    socketRef.current?.emit('join_session', { sessionId });
  }, []);

  const sendPronunciationAttempt = useCallback(({ sessionId, phraseId, expected, actual, romaji, english, topicId, audioData, audioMime }) => {
    setPronunciationResult(null);
    const requestId = startRun('feedback');
    socketRef.current?.emit('pronunciation_attempt', { requestId, sessionId, phraseId, expected, actual, romaji, english, topicId, audioData, audioMime });
  }, [startRun]);

  const sendFreeTalkMessage = useCallback(({ sessionId, text, conversationHistory, topicId, conversationStarter, audioData, audioMime }) => {
    // A new learner turn always supersedes whatever the AI was still saying
    interrupt();
    const requestId = startRun('free_talk');
    setAiResponseEnd(null);
    setAiError(null);
    setIsSpeaking(true);
    socketRef.current?.emit('free_talk_message', { requestId, sessionId, text, conversationHistory, topicId, conversationStarter, audioData, audioMime });
  }, [startRun, interrupt]);

  const requestTTS = useCallback(({ text, phraseId, language = 'ja' }) => {
    setTtsAudio(null);
    const requestId = newRequestId();
    socketRef.current?.emit('request_tts', { requestId, text, phraseId, language });
  }, []);

  const clearPronunciationResult = useCallback(() => {
    setPronunciationResult(null);
    resetQueue();
  }, [resetQueue]);

  return {
    isConnected,
    // Pronunciation (score-first, then audio segments follow via ai_segment)
    pronunciationResult,
    isProcessingFeedback,
    sendPronunciationAttempt,
    clearPronunciationResult,
    // Free Talk (segments stream in, ai_response_end signals done)
    isAiTyping,
    aiResponseEnd,
    aiError,
    sendFreeTalkMessage,
    // True while AI audio is playing or still pending — drives the "speaking" UI
    isSpeaking,
    // Barge-in: stop the AI mid-sentence and abandon its turn server-side
    interrupt,
    // Shared streaming segments + current playing segment
    segments,
    currentSegment,
    // On-demand TTS (base64 audioData)
    ttsAudio,
    requestTTS,
    // Session
    joinSession,
    // Audio
    unlockAudio
  };
};

export default useTrainingSocket;
