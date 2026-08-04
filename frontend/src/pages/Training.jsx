import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  RefreshCw,
  Check,
  X,
  MessageCircle,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  BookOpen,
  Target,
  Headphones,
  ArrowLeft,
  Trophy,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { trainingAPI, aiAPI, speechAPI } from '../services/api';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { Button, Loader, Card, Badge } from '../components/ui';
import { getTopicIcon } from '../components/ui/TopicIcons';

const modes = [
  { id: 'listen_repeat', name: 'Listen & Repeat', icon: Headphones, desc: 'Listen to phrases and practice your pronunciation', color: 'bg-primary-50 text-primary-600' },
  { id: 'test', name: 'Challenge Mode', icon: Target, desc: 'Test your knowledge without any hints', color: 'bg-rose-50 text-rose-600' },
  { id: 'free_talk', name: 'Free Conversation', icon: MessageCircle, desc: 'Practice natural conversation with AI', color: 'bg-emerald-50 text-emerald-600' },
];

const Training = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [phrases, setPhrases] = useState([]);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const {
    isListening,
    fullTranscript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({ lang: 'ja-JP' });

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const { data } = await trainingAPI.getTopics();
      setTopics(data.data || []);
    } catch (error) {
      console.error('Failed to load topics:', error);
      toast.error('Failed to load topics. Please try again.');
      setTopics([]);
    } finally {
      setIsLoading(false);
    }
  };

  const startTraining = async (topic, mode) => {
    setSelectedTopic(topic);
    setSelectedMode(mode);
    setIsLoading(true);

    try {
      const [phrasesRes, sessionRes] = await Promise.all([
        trainingAPI.getPhrases(topic._id, { limit: 10, random: true }),
        trainingAPI.startSession(topic._id, mode)
      ]);
      setPhrases(phrasesRes.data.data || []);
      setSession(sessionRes.data.data);
      setCurrentPhraseIndex(0);
    } catch (error) {
      console.error('Failed to start training:', error);
      toast.error('Failed to start training session.');
      setPhrases([]);
      setSelectedTopic(null);
      setSelectedMode(null);
    } finally {
      setIsLoading(false);
    }
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const shouldAnalyzeRef = useRef(false);

  // Trigger analysis when listening stops if intention was to analyze
  useEffect(() => {
    if (!isListening && shouldAnalyzeRef.current) {
      shouldAnalyzeRef.current = false;
      analyzePronunciation();
    }
  }, [isListening]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
      // Analysis continues in useEffect
    } else {
      resetTranscript();
      setScore(null);
      setFeedback(null);
      shouldAnalyzeRef.current = true;
      startListening();
    }
  };

  const analyzePronunciation = async () => {
    const currentPhrase = phrases[currentPhraseIndex];
    const textToAnalyze = fullTranscript; // Use current value from hook state

    if (!textToAnalyze || textToAnalyze.trim().length === 0) {
      if (currentPhrase) {
        toast.error('No speech detected. Please try again.');
      }
      return;
    }

    setIsProcessing(true);
    try {
      const { data } = await aiAPI.getPronunciationFeedback(
        currentPhrase.japanese,
        textToAnalyze,
        { romaji: currentPhrase.romaji, english: currentPhrase.english, topicId: selectedTopic?._id }
      );
      setScore(data.data.score);
      setFeedback(data.data.feedback);
    } catch (error) {
      console.error('Failed to analyze pronunciation:', error);
      toast.error('Could not analyze pronunciation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = async () => {
    if (isPlaying || !currentPhrase) return;

    setIsPlaying(true);
    try {
      // In a real app, this would use a proper TTS endpoint ensuring Japanese voice
      // specific to the phrase's content
      const { data } = await speechAPI.textToSpeech(currentPhrase.japanese, 'alloy');

      const audioUrl = data.data?.url || data.data?.audioUrl || data.url;
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsPlaying(false);
        audio.play();
      } else {
        throw new Error('No audio URL returned');
      }
    } catch (error) {
      console.error('Failed to play audio:', error);
      toast.error('Could not play audio');
      setIsPlaying(false);
    }
  };

  const nextPhrase = () => {
    if (currentPhraseIndex < phrases.length - 1) {
      setCurrentPhraseIndex(prev => prev + 1);
      resetTranscript();
      setScore(null);
      setFeedback(null);
    } else {
      completeSession();
    }
  };

  const completeSession = async () => {
    try {
      if (session?._id && session._id !== 'demo-session') {
        await trainingAPI.completeSession(session._id);
      }
    } catch (error) {
      console.error('Failed to complete session:', error);
    }
    toast.success('Session complete! Great work! 🎉');
    setSelectedTopic(null);
    setSelectedMode(null);
    setSession(null);
    setPhrases([]);
    setCurrentPhraseIndex(0);
  };

  const currentPhrase = phrases[currentPhraseIndex];
  const progress = phrases.length > 0 ? ((currentPhraseIndex + 1) / phrases.length) * 100 : 0;

  // Selection View
  if (!selectedTopic || !selectedMode) {
    return (
      <div className="pb-8">
        {/* Page Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider">
              Training Academy
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            What would you like to learn today?
          </h1>
          <p className="text-slate-600">
            Choose a training mode and a topic to start your Japanese session
          </p>

        </div>

        {/* Mode Selection */}
        <section className="mb-12">
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-6">
            1. Select Mode
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {modes.map((mode) => (
              <Card
                key={mode.id}
                as="button"
                onClick={() => setSelectedMode(mode.id)}
                className={`relative group text-left transition-all border-2 ${selectedMode === mode.id
                  ? 'border-primary-600 shadow-lg shadow-primary-50'
                  : 'border-transparent'
                  }`}
                hover
              >
                <div className={`w-12 h-12 rounded-lg ${mode.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <mode.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{mode.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{mode.desc}</p>

                {selectedMode === mode.id && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center shadow-sm">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Topic Selection */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              2. Choose Topic
            </h2>
            {!selectedMode && (
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3" />
                Please select a mode first
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader size="lg" />
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl block mb-4">📚</span>
              <h3 className="text-lg font-bold text-slate-700 mb-2">No Topics Available</h3>
              <p className="text-sm text-slate-400">No training topics have been set up yet. Ask your admin to add topics.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((topic) => (
                <Card
                  key={topic._id}
                  as="button"
                  onClick={() => selectedMode && startTraining(topic, selectedMode)}
                  disabled={!selectedMode}
                  className={`group text-left transition-all ${!selectedMode ? 'opacity-50 grayscale cursor-not-allowed' : ''
                    }`}
                  hover={!!selectedMode}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="w-12 h-12 inline-block group-hover:scale-110 transition-transform">
                      {getTopicIcon(topic.name, "w-full h-full")}
                    </span>
                    <Badge variant={
                      topic.difficulty === 'Beginner' ? 'success' :
                        topic.difficulty === 'Intermediate' ? 'warning' :
                          'danger'
                    } size="sm">
                      {topic.difficulty}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 group-hover:text-primary-600 transition-colors">
                    {topic.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <BookOpen className="w-3 h-3" />
                    <span>{topic.phraseCount || '20+'} phrases</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  // Training Session View
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Session Progress Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setSelectedTopic(null);
              setSelectedMode(null);
            }}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 inline-block">{getTopicIcon(selectedTopic.name, "w-full h-full")}</span>
              <h2 className="font-bold text-slate-900">{selectedTopic.name}</h2>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {modes.find(m => m.id === selectedMode)?.name}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-xs font-bold text-slate-900">
            Phrase {currentPhraseIndex + 1} of {phrases.length}
          </span>
          <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Training Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full relative">
        <AnimatePresence mode="wait">
          {currentPhrase && (
            <motion.div
              key={currentPhraseIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full text-center"
            >
              <div className="mb-12">
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-6">
                  Target Phrase
                </span>
                <h3 className="font-japanese text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
                  {currentPhrase.japanese}
                </h3>
                {selectedMode !== 'test' && (
                  <div className="space-y-2">
                    <p className="text-xl font-medium text-primary-600">{currentPhrase.romaji}</p>
                    <p className="text-lg text-slate-500 italic">"{currentPhrase.english}"</p>
                  </div>
                )}
              </div>

              {/* Interaction Elements */}
              <div className="grid gap-8 max-w-md mx-auto">
                <button
                  onClick={playAudio}
                  disabled={isPlaying}
                  className={`flex items-center justify-center gap-3 w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-widest rounded-xl transition-all border border-slate-200 ${isPlaying ? 'opacity-75 cursor-wait' : ''}`}
                >
                  <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse text-primary-500' : ''}`} />
                  {isPlaying ? 'Playing...' : 'Listen to Native'}
                </button>

                {/* Feedback State */}
                {score !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Card
                      className={`text-left flex items-start gap-4 border-2 ${score >= 80 ? 'bg-emerald-50 border-emerald-100' :
                        score >= 50 ? 'bg-amber-50 border-amber-100' :
                          'bg-rose-50 border-rose-100'
                        }`}
                      padding="md"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}>
                        {score >= 80 ? <Trophy className="w-5 h-5 text-white" /> :
                          score >= 50 ? <Zap className="w-5 h-5 text-white" /> :
                            <X className="w-5 h-5 text-white" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-2xl font-black ${score >= 80 ? 'text-emerald-700' : score >= 50 ? 'text-amber-700' : 'text-rose-700'
                            }`}>
                            {score}%
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accuracy Score</span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">{feedback}</p>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* Microphone Section */}
                <div className="flex flex-col items-center">
                  {!isSupported ? (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Browser speech not supported
                    </div>
                  ) : (
                    <>
                      <motion.button
                        onClick={handleMicClick}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isListening
                          ? 'bg-rose-500 text-white shadow-xl shadow-rose-200 animate-pulse'
                          : 'bg-slate-900 text-white shadow-xl shadow-slate-200 hover:bg-slate-800'
                          }`}
                      >
                        {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
                      </motion.button>
                      <span className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {isListening ? 'Stop recording' : 'Press to Speak'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Session Footer Navigation */}
      <div className="p-6 border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSelectedTopic(null);
              setSelectedMode(null);
            }}
            className="bg-white"
          >
            Quit
          </Button>

          <Button
            onClick={nextPhrase}
            className="flex-1 shadow-lg shadow-primary-900/10"
            rightIcon={currentPhraseIndex < phrases.length - 1 ? <ChevronRight className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          >
            {currentPhraseIndex < phrases.length - 1 ? 'Continue' : 'Finish Session'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Training;
