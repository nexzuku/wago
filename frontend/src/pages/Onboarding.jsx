import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Globe, 
  FileText, 
  Mic2, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  Check,
  Upload,
  Sparkles,
  Download,
  Link,
  Edit3,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { aiAPI, topicsAPI } from '../services/api';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const steps = [
  { id: 'quick-setup', title: 'Company', icon: Building2 },
  { id: 'review', title: 'Review', icon: Edit3 },
  { id: 'topics', title: 'Topics', icon: FileText },
  { id: 'voice', title: 'Voice', icon: Mic2 },
];

const fallbackTopics = [
  { id: 'greetings', name: 'Business Greetings', icon: '👋' },
  { id: 'meetings', name: 'Meeting Phrases', icon: '🤝' },
  { id: 'safety', name: 'Safety & Emergency', icon: '🚨' },
  { id: 'daily', name: 'Daily Workplace', icon: '🏢' },
  { id: 'technical', name: 'Technical Terms', icon: '⚙️' },
  { id: 'phone', name: 'Phone Etiquette', icon: '📞' },
];

const accents = [
  { id: 'tokyo', name: 'Tokyo Standard', desc: 'Most common in business' },
  { id: 'kansai', name: 'Kansai (Osaka)', desc: 'Western Japan dialect' },
  { id: 'kyushu', name: 'Kyushu', desc: 'Southern Japan region' },
  { id: 'neutral', name: 'Neutral', desc: 'Clear, easy to understand' },
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [topics, setTopics] = useState([]);
  const [isTopicsLoading, setIsTopicsLoading] = useState(true);
  const [extractedContent, setExtractedContent] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  // Form data
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    address: '',
    introduction: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    selectedTopics: [],
    voiceAccent: 'tokyo',
    useCustomVoice: false
  });

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const { data } = await topicsAPI.list({ active: true });
      const items = (data.data || []).map((topic) => ({
        id: topic._id,
        name: topic.name,
        icon: topic.icon || '📚'
      }));
      setTopics(items.length > 0 ? items : fallbackTopics);
    } catch {
      setTopics(fallbackTopics);
    } finally {
      setIsTopicsLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleTopic = (topicId) => {
    setFormData(prev => ({
      ...prev,
      selectedTopics: prev.selectedTopics.includes(topicId)
        ? prev.selectedTopics.filter(id => id !== topicId)
        : [...prev.selectedTopics, topicId]
    }));
  };

  const handleUrlExtraction = async () => {
    if (!websiteUrl) {
      toast.error('Please enter a website URL');
      return;
    }

    setIsExtracting(true);
    try {
      const { data } = await aiAPI.extractCompanyInfo(null, 'url', websiteUrl);
      const extracted = data.data;
      if (extracted) {
        updateFormData('companyName', extracted.name || '');
        updateFormData('industry', extracted.industry || '');
        updateFormData('address', extracted.address || '');
        updateFormData('introduction', extracted.introduction || '');
        setExtractedContent(extracted.extractedContent || '');
        toast.success('Company information loaded successfully!');
        setCurrentStep(1); // Move to review step
      }
    } catch (error) {
      // The API explains *why* (bad URL, unreachable site, AI service down) — show it
      toast.error(
        error.response?.data?.error?.message || 'Failed to load company information from URL'
      );
      console.error('URL extraction error:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      toast.error('Please select a PDF file');
    }
  };

  const handlePdfExtraction = async () => {
    if (!selectedFile) {
      toast.error('Please select a PDF document');
      return;
    }

    setIsExtracting(true);
    try {
      const { data } = await aiAPI.extractFromPDF(selectedFile);
      const extracted = data.data;
      if (extracted) {
        updateFormData('companyName', extracted.name || '');
        updateFormData('industry', extracted.industry || '');
        updateFormData('address', extracted.address || '');
        updateFormData('introduction', extracted.introduction || '');
        setExtractedContent(extracted.extractedContent || '');
        toast.success('Company information extracted from PDF!');
        setCurrentStep(1); // Move to review step
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message || 'Failed to extract information from PDF'
      );
      console.error('PDF extraction error:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSkipExtraction = () => {
    setCurrentStep(1); // Go to review step for manual entry
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true; // Quick setup step is optional
      case 1:
        return formData.companyName.trim().length >= 2;
      case 2:
        return formData.selectedTopics.length > 0 &&
          formData.email.trim().length > 0 &&
          formData.password.length >= 8 &&
          formData.companyName.trim().length >= 2;
      case 3:
        return formData.voiceAccent;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleExtractAndProceed = async () => {
    if (websiteUrl) {
      await handleUrlExtraction();
    } else if (selectedFile) {
      await handlePdfExtraction();
    } else {
      toast.error('Please provide a URL or upload a PDF document');
    }
  };

  const handleSubmit = async () => {
    if (!formData.companyName.trim()) {
      toast.error('Company name is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      await register(formData);
      toast.success('Welcome to WaGo!');
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.error?.message
        || error.response?.data?.error?.details?.map(d => d.message).join(', ')
        || 'Registration failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-1 px-4">
      {/* Progress Indicator */}
      <div className="relative mb-6">
        {/* Progress Bar Background */}
        <div className="absolute top-5 left-8 right-8 h-1 bg-slate-200 rounded-full" />
        {/* Progress Bar Fill */}
        <div 
          className="absolute top-5 left-8 h-1 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full transition-all duration-500"
          style={{ width: `calc(${(currentStep / (steps.length - 1)) * 100}% - 4rem)` }}
        />
        
        <div className="relative flex justify-between">
          {steps.map((step, i) => (
            <div key={step.id} className="flex flex-col items-center z-10">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: i === currentStep ? 1.05 : 1 }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  i < currentStep
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                    : i === currentStep
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 ring-4 ring-primary-100'
                    : 'bg-white text-slate-400 border-2 border-slate-200'
                }`}
              >
                {i < currentStep ? (
                  <Check className="w-5 h-5" strokeWidth={3} />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </motion.div>
              <span className={`mt-2 text-xs font-semibold transition-colors ${
                i <= currentStep ? 'text-slate-800' : 'text-slate-400'
              }`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Step 0: Quick Company Setup */}
            {currentStep === 0 && (
              <div>
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-8 text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Quick Company Setup</h2>
                  </div>
                  <p className="text-primary-100 text-sm">Let AI extract your company info automatically</p>
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-5">
                  {/* Method Selection Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Website URL Card */}
                    <div className={`rounded-xl border-2 p-4 transition-all ${
                      websiteUrl ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-300'
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Globe className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Website URL</h3>
                          <span className="text-xs text-blue-600 font-medium">Recommended</span>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="url"
                          value={websiteUrl}
                          onChange={(e) => { setWebsiteUrl(e.target.value); setSelectedFile(null); }}
                          placeholder="https://yourcompany.com"
                          className="w-full pl-10 pr-3 py-3 text-sm border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                        />
                      </div>
                    </div>

                    {/* PDF Upload Card */}
                    <div className={`rounded-xl border-2 p-4 transition-all ${
                      selectedFile ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-300'
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Upload PDF</h3>
                          <span className="text-xs text-slate-500 font-medium">Alternative</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => { fileInputRef.current?.click(); setWebsiteUrl(''); }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-primary-400 hover:bg-white transition-all text-sm"
                      >
                        <Upload className="w-4 h-4 text-slate-500" />
                        <span className="font-medium text-slate-600 truncate">
                          {selectedFile ? selectedFile.name : 'Choose PDF'}
                        </span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Extract Button */}
                  <button
                    onClick={handleExtractAndProceed}
                    disabled={isExtracting || (!websiteUrl && !selectedFile)}
                    className="w-full py-3 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Extracting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Extract with AI</span>
                      </>
                    )}
                  </button>

                  {/* Skip Option */}
                  <div className="text-center">
                    <button
                      onClick={handleSkipExtraction}
                      className="text-sm text-slate-500 hover:text-primary-600 font-medium transition-colors"
                    >
                      or enter information manually →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Review & Edit Company Introduction */}
            {currentStep === 1 && (
              <div>
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-8 text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Edit3 className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Review & Edit</h2>
                  </div>
                  <p className="text-primary-100 text-sm">Fine-tune your company information</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                  {/* Example */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <span className="text-amber-500">💡</span>
                      <p className="text-sm text-amber-800 leading-relaxed">
                        <strong>Example:</strong> "ABC Construction Co., Ltd. is a leading construction company based in Tokyo, Japan..."
                      </p>
                    </div>
                  </div>

                  {/* Company Introduction Textarea */}
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-500" />
                      Company Introduction
                    </label>
                    <textarea
                      value={formData.introduction}
                      onChange={(e) => updateFormData('introduction', e.target.value)}
                      placeholder="Describe your company, including name, location, industry, and key details..."
                      rows={6}
                      className="w-full px-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none transition-all"
                    />
                  </div>

                  {/* Company Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-slate-700 mb-2 block">Company Name</label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => updateFormData('companyName', e.target.value)}
                        placeholder="Enter company name"
                        className="w-full px-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 mb-2 block">Industry</label>
                      <input
                        type="text"
                        value={formData.industry}
                        onChange={(e) => updateFormData('industry', e.target.value)}
                        placeholder="e.g., Construction"
                        className="w-full px-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Training Topics */}
            {currentStep === 2 && (
              <div>
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-8 text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Training Focus</h2>
                  </div>
                  <p className="text-primary-100 text-sm">Select topics relevant to your team</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                  {/* Topics Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {isTopicsLoading ? (
                      <div className="col-span-3 flex items-center justify-center py-6">
                        <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                      </div>
                    ) : topics.length === 0 ? (
                      <div className="col-span-3 text-center text-sm text-slate-500">
                        No topics available yet.
                      </div>
                    ) : (
                      topics.map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => toggleTopic(topic.id)}
                          className={`relative p-3 rounded-xl border-2 text-center transition-all ${
                            formData.selectedTopics.includes(topic.id)
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-slate-200 hover:border-primary-300'
                          }`}
                        >
                          {formData.selectedTopics.includes(topic.id) && (
                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <span className="text-2xl block mb-1">{topic.icon}</span>
                          <span className={`text-xs font-semibold block ${
                            formData.selectedTopics.includes(topic.id) ? 'text-primary-700' : 'text-slate-600'
                          }`}>{topic.name}</span>
                        </button>
                      ))
                    )}
                  </div>

                  {/* Company Name (if not already filled) */}
                  {!formData.companyName && (
                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1 block">Company Name *</label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => updateFormData('companyName', e.target.value)}
                        placeholder="Your Company Name"
                        className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                  )}

                  {/* Admin Account Setup */}
                  <form className="bg-slate-50 rounded-xl p-5 space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <h3 className="text-sm font-bold text-slate-800">Admin Account</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">First Name</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => updateFormData('firstName', e.target.value)}
                          placeholder="John"
                          className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">Last Name</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => updateFormData('lastName', e.target.value)}
                          placeholder="Doe"
                          className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1 block">Email Address *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        placeholder="admin@company.com"
                        className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1 block">Password *</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => updateFormData('password', e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                      <p className="text-xs text-slate-400 mt-1">Min. 8 characters</p>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Step 3: Voice Setup */}
            {currentStep === 3 && (
              <div>
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-8 text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Mic2 className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">AI Voice Profile</h2>
                  </div>
                  <p className="text-primary-100 text-sm">Choose your training assistant's accent</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                  {/* Accent Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    {accents.map((accent) => (
                      <button
                        key={accent.id}
                        onClick={() => updateFormData('voiceAccent', accent.id)}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                          formData.voiceAccent === accent.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-slate-200 hover:border-primary-300'
                        }`}
                      >
                        {formData.voiceAccent === accent.id && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div className={`text-sm font-bold mb-1 ${
                          formData.voiceAccent === accent.id ? 'text-primary-700' : 'text-slate-800'
                        }`}>{accent.name}</div>
                        <p className={`text-xs ${
                          formData.voiceAccent === accent.id ? 'text-primary-600' : 'text-slate-500'
                        }`}>{accent.desc}</p>
                      </button>
                    ))}
                  </div>

                  {/* Tip */}
                  <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-primary-700">
                        You can upload custom voice samples later in settings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-1 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || isLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Setting Up...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Setup</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
