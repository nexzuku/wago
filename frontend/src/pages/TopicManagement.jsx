import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Search, X, ChevronRight, ChevronDown,
  BookOpen, Sparkles, Loader2, GripVertical, Volume2, Upload,
  MessageCircle, Brain, ListChecks, Users, Eye, EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { topicsAPI, phrasesAPI } from '../services/api';
import { Button, Card, Input, Modal, Badge, StatCard } from '../components/ui';

const ICON_OPTIONS = ['📚', '💼', '🤝', '👋', '🚨', '⚙️', '🏢', '🗣️', '🎌', '🛡️', '💬', '🏗️', '🧑‍💼', '✈️', '🏥', '🍽️', '📝', '🎓'];

const CATEGORY_OPTIONS = [
  { value: 'greetings', label: 'Greetings', icon: '👋' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'safety', label: 'Safety', icon: '🛡️' },
  { value: 'technical', label: 'Technical', icon: '⚙️' },
  { value: 'daily', label: 'Daily', icon: '🏢' },
  { value: 'emergency', label: 'Emergency', icon: '🚨' },
  { value: 'custom', label: 'Custom', icon: '📚' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Beginner', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-amber-100 text-amber-700' },
  { value: 'advanced', label: 'Advanced', color: 'bg-rose-100 text-rose-700' },
];

const emptyTopicForm = {
  name: '',
  description: '',
  icon: '📚',
  color: '#3B82F6',
  difficulty: 'beginner',
  category: 'custom',
  backgroundContext: '',
  aiInstructions: '',
  vocabularyList: [],
  conversationStarters: [],
  assignedToAll: true,
  isActive: true,
};

const TopicManagement = () => {
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [topicForm, setTopicForm] = useState(emptyTopicForm);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [topicPhrases, setTopicPhrases] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPhraseModal, setShowPhraseModal] = useState(false);
  const [editingPhrase, setEditingPhrase] = useState(null);
  const [phraseForm, setPhraseForm] = useState({ japanese: '', romaji: '', english: '', usageContext: '' });
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    fetchTopics();
  }, [filterCategory]);

  const fetchTopics = async () => {
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      const { data } = await topicsAPI.list(params);
      setTopics(data.data || []);
    } catch (err) {
      console.error('Failed to load topics:', err);
      toast.error('Failed to load topics');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPhrases = async (topicId) => {
    try {
      const { data } = await phrasesAPI.list(topicId);
      setTopicPhrases(prev => ({ ...prev, [topicId]: data.data || [] }));
    } catch (err) {
      console.error('Failed to load phrases:', err);
    }
  };

  const toggleExpand = (topicId) => {
    if (expandedTopic === topicId) {
      setExpandedTopic(null);
    } else {
      setExpandedTopic(topicId);
      if (!topicPhrases[topicId]) {
        loadPhrases(topicId);
      }
    }
  };

  const openCreateTopic = () => {
    setEditingTopic(null);
    setTopicForm(emptyTopicForm);
    setActiveTab('basic');
    setShowTopicModal(true);
  };

  const openEditTopic = (topic) => {
    setEditingTopic(topic);
    setTopicForm({
      name: topic.name || '',
      description: topic.description || '',
      icon: topic.icon || '📚',
      color: topic.color || '#3B82F6',
      difficulty: topic.difficulty || 'beginner',
      category: topic.category || 'custom',
      backgroundContext: topic.backgroundContext || '',
      aiInstructions: topic.aiInstructions || '',
      vocabularyList: topic.vocabularyList || [],
      conversationStarters: topic.conversationStarters || [],
      assignedToAll: topic.assignedToAll !== false,
      isActive: topic.isActive !== false,
    });
    setActiveTab('basic');
    setShowTopicModal(true);
  };

  const saveTopic = async () => {
    if (!topicForm.name.trim()) {
      toast.error('Topic name is required');
      return;
    }
    setIsSaving(true);
    try {
      if (editingTopic) {
        await topicsAPI.update(editingTopic._id, topicForm);
        toast.success('Topic updated');
      } else {
        await topicsAPI.create(topicForm);
        toast.success('Topic created');
      }
      setShowTopicModal(false);
      fetchTopics();
    } catch (err) {
      toast.error('Failed to save topic');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTopic = async (topic) => {
    if (!confirm(`Delete "${topic.name}"? This will deactivate the topic.`)) return;
    try {
      await topicsAPI.delete(topic._id);
      toast.success('Topic deleted');
      fetchTopics();
    } catch (err) {
      toast.error('Failed to delete topic');
    }
  };

  const generatePhrases = async (topicId, count = 5) => {
    setIsGenerating(true);
    try {
      const { data } = await topicsAPI.generatePhrases(topicId, { count, save: true });
      const result = data.data;
      toast.success(`Generated ${result.savedCount || result.generated?.length || 0} phrases`);
      loadPhrases(topicId);
    } catch (err) {
      toast.error('Failed to generate phrases');
    } finally {
      setIsGenerating(false);
    }
  };

  const openCreatePhrase = (topicId) => {
    setEditingPhrase(null);
    setPhraseForm({ japanese: '', romaji: '', english: '', usageContext: '', topicId });
    setShowPhraseModal(true);
  };

  const openEditPhrase = (phrase, topicId) => {
    setEditingPhrase(phrase);
    setPhraseForm({
      japanese: phrase.japanese || '',
      romaji: phrase.romaji || '',
      english: phrase.english || '',
      usageContext: phrase.usageContext || '',
      topicId,
    });
    setShowPhraseModal(true);
  };

  const savePhrase = async () => {
    if (!phraseForm.japanese.trim() || !phraseForm.romaji.trim() || !phraseForm.english.trim()) {
      toast.error('Japanese, Romaji, and English are required');
      return;
    }
    setIsSaving(true);
    try {
      const { topicId, ...phraseData } = phraseForm;
      if (editingPhrase) {
        await topicsAPI.updatePhrase(topicId, editingPhrase._id, phraseData);
        toast.success('Phrase updated');
      } else {
        await topicsAPI.createPhrase(topicId, phraseData);
        toast.success('Phrase added');
      }
      setShowPhraseModal(false);
      loadPhrases(topicId);
    } catch (err) {
      toast.error('Failed to save phrase');
    } finally {
      setIsSaving(false);
    }
  };

  const deletePhrase = async (topicId, phraseId) => {
    if (!confirm('Delete this phrase?')) return;
    try {
      await topicsAPI.deletePhrase(topicId, phraseId);
      toast.success('Phrase deleted');
      loadPhrases(topicId);
    } catch (err) {
      toast.error('Failed to delete phrase');
    }
  };

  const handleCSVImport = async (topicId, file) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) {
        toast.error('CSV must have a header row and at least one data row');
        return;
      }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const jpIdx = headers.findIndex(h => h === 'japanese' || h === 'jp');
      const roIdx = headers.findIndex(h => h === 'romaji' || h === 'ro');
      const enIdx = headers.findIndex(h => h === 'english' || h === 'en');
      const diffIdx = headers.findIndex(h => h === 'difficulty');
      const ctxIdx = headers.findIndex(h => h === 'context' || h === 'usagecontext');

      if (jpIdx === -1 || roIdx === -1 || enIdx === -1) {
        toast.error('CSV must have japanese, romaji, and english columns');
        return;
      }

      const phrases = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (!cols[jpIdx] || !cols[roIdx] || !cols[enIdx]) continue;
        phrases.push({
          japanese: cols[jpIdx],
          romaji: cols[roIdx],
          english: cols[enIdx],
          difficulty: diffIdx !== -1 ? cols[diffIdx] : undefined,
          usageContext: ctxIdx !== -1 ? cols[ctxIdx] : undefined
        });
      }

      if (phrases.length === 0) {
        toast.error('No valid phrases found in CSV');
        return;
      }

      const { data } = await topicsAPI.bulkImportPhrases(topicId, phrases);
      const result = data.data;
      toast.success(`Imported ${result.created} phrases${result.skipped ? `, ${result.skipped} skipped` : ''}`);
      loadPhrases(topicId);
    } catch (err) {
      console.error('CSV import error:', err);
      toast.error('Failed to import CSV');
    }
  };

  const filteredTopics = topics.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: topics.length,
    active: topics.filter(t => t.isActive).length,
    withContext: topics.filter(t => t.backgroundContext?.trim()).length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Topics & Phrases</h1>
          <p className="text-sm text-slate-500 mt-1">Manage learning topics, add AI context, and organize phrases</p>
        </div>
        <Button onClick={openCreateTopic} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Topic
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Topics" value={stats.total} icon={BookOpen} color="from-blue-500 to-blue-600" />
        <StatCard label="Active" value={stats.active} icon={Eye} color="from-emerald-500 to-emerald-600" />
        <StatCard label="With AI Context" value={stats.withContext} icon={Brain} color="from-violet-500 to-violet-600" />
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3 p-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterCategory('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !filterCategory ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {CATEGORY_OPTIONS.map(cat => (
              <button
                key={cat.value}
                onClick={() => setFilterCategory(filterCategory === cat.value ? '' : cat.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterCategory === cat.value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Topics List */}
      {filteredTopics.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No Topics Found</h3>
            <p className="text-sm text-slate-500 mb-4">
              {search ? 'Try adjusting your search.' : 'Create your first topic to get started.'}
            </p>
            <Button onClick={openCreateTopic} size="sm">
              <Plus className="w-4 h-4 mr-1" /> Create Topic
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTopics.map((topic) => (
            <TopicCard
              key={topic._id}
              topic={topic}
              isExpanded={expandedTopic === topic._id}
              onToggle={() => toggleExpand(topic._id)}
              onEdit={() => openEditTopic(topic)}
              onDelete={() => deleteTopic(topic)}
              phrases={topicPhrases[topic._id] || []}
              onGeneratePhrases={() => generatePhrases(topic._id)}
              isGenerating={isGenerating && expandedTopic === topic._id}
              onAddPhrase={() => openCreatePhrase(topic._id)}
              onEditPhrase={(phrase) => openEditPhrase(phrase, topic._id)}
              onDeletePhrase={(phraseId) => deletePhrase(topic._id, phraseId)}
              onCSVImport={(file) => handleCSVImport(topic._id, file)}
            />
          ))}
        </div>
      )}

      {/* Topic Create/Edit Modal */}
      <TopicFormModal
        isOpen={showTopicModal}
        form={topicForm}
        setForm={setTopicForm}
        isEditing={!!editingTopic}
        isSaving={isSaving}
        onSave={saveTopic}
        onClose={() => setShowTopicModal(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Phrase Create/Edit Modal */}
      <Modal isOpen={showPhraseModal} title={editingPhrase ? 'Edit Phrase' : 'Add Phrase'} onClose={() => setShowPhraseModal(false)}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Japanese *</label>
                <input
                  type="text"
                  value={phraseForm.japanese}
                  onChange={(e) => setPhraseForm(f => ({ ...f, japanese: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-japanese text-lg"
                  placeholder="日本語のフレーズ"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Romaji *</label>
                <input
                  type="text"
                  value={phraseForm.romaji}
                  onChange={(e) => setPhraseForm(f => ({ ...f, romaji: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="nihongo no fureezu"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">English *</label>
                <input
                  type="text"
                  value={phraseForm.english}
                  onChange={(e) => setPhraseForm(f => ({ ...f, english: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="English translation"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Usage Context</label>
                <input
                  type="text"
                  value={phraseForm.usageContext}
                  onChange={(e) => setPhraseForm(f => ({ ...f, usageContext: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="When/how to use this phrase"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={() => setShowPhraseModal(false)}>Cancel</Button>
                <Button onClick={savePhrase} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  {editingPhrase ? 'Update' : 'Add'} Phrase
                </Button>
              </div>
            </div>
      </Modal>
    </div>
  );
};

/* ─── Topic Card ─── */
const TopicCard = ({ topic, isExpanded, onToggle, onEdit, onDelete, phrases, onGeneratePhrases, isGenerating, onAddPhrase, onEditPhrase, onDeletePhrase, onCSVImport }) => {
  const diffStyle = DIFFICULTY_OPTIONS.find(d => d.value === topic.difficulty) || DIFFICULTY_OPTIONS[0];
  const hasContext = topic.backgroundContext?.trim();

  return (
    <Card className="overflow-hidden">
      {/* Topic Header */}
      <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={onToggle}>
        <span className="text-2xl">{topic.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-900 text-sm">{topic.name}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${diffStyle.color}`}>
              {diffStyle.label}
            </span>
            {hasContext && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-violet-100 text-violet-700 flex items-center gap-1">
                <Brain className="w-3 h-3" /> AI Context
              </span>
            )}
            {!topic.isActive && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                Inactive
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{topic.description || 'No description'}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-xs text-slate-400 mr-2">{phrases.length || '—'} phrases</span>
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 px-4 py-3">
              {/* AI Context Preview */}
              {hasContext && (
                <div className="mb-3 p-3 bg-violet-50 rounded-lg border border-violet-100">
                  <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Brain className="w-3 h-3" /> AI Background Context
                  </p>
                  <p className="text-xs text-violet-800 line-clamp-3">{topic.backgroundContext}</p>
                </div>
              )}

              {/* Actions Bar */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={onAddPhrase}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                >
                  <Plus className="w-3 h-3" /> Add Phrase
                </button>
                <button
                  onClick={onGeneratePhrases}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors border border-violet-100 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  {isGenerating ? 'Generating...' : 'AI Generate 5 Phrases'}
                </button>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-100 cursor-pointer">
                  <Upload className="w-3 h-3" /> Import CSV
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        onCSVImport(e.target.files[0]);
                        e.target.value = '';
                      }
                    }}
                  />
                </label>
              </div>

              {/* Phrases List */}
              {phrases.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">No phrases yet</p>
                  <p className="text-[10px] text-slate-400">Add manually or use AI to generate phrases</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {phrases.filter(p => p.isActive !== false).map((phrase, i) => (
                    <div key={phrase._id} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 group hover:border-blue-200 transition-colors">
                      <span className="text-[10px] font-bold text-slate-400 w-5 text-center">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 font-japanese">{phrase.japanese}</p>
                        <p className="text-xs text-slate-500">{phrase.romaji} — {phrase.english}</p>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEditPhrase(phrase)} className="p-1 text-slate-400 hover:text-blue-600 rounded">
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button onClick={() => onDeletePhrase(phrase._id)} className="p-1 text-slate-400 hover:text-red-600 rounded">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

/* ─── Topic Form Modal ─── */
const TopicFormModal = ({ isOpen, form, setForm, isEditing, isSaving, onSave, onClose, activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: BookOpen },
    { id: 'ai', label: 'AI Context', icon: Brain },
    { id: 'vocabulary', label: 'Vocabulary', icon: ListChecks },
    { id: 'starters', label: 'Conversation Starters', icon: MessageCircle },
  ];

  const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }));

  return (
    <Modal isOpen={isOpen} title={isEditing ? 'Edit Topic' : 'Create Topic'} onClose={onClose} size="lg">
      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-slate-200 -mx-6 px-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Basic Info Tab */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Topic Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g. Construction Safety"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                rows={2}
                placeholder="Brief description of what this topic covers"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Icon</label>
              <div className="flex flex-wrap gap-1.5">
                {ICON_OPTIONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => updateField('icon', icon)}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                      form.icon === icon ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {CATEGORY_OPTIONS.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Difficulty</label>
                <div className="flex gap-1.5">
                  {DIFFICULTY_OPTIONS.map(d => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => updateField('difficulty', d.value)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        form.difficulty === d.value ? d.color + ' ring-1 ring-current' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => updateField('isActive', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={form.assignedToAll}
                onChange={(e) => updateField('assignedToAll', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Assign to all employees
            </label>
          </div>
        </div>
      )}

      {/* AI Context Tab */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          <div className="p-3 bg-violet-50 rounded-lg border border-violet-100">
            <p className="text-xs text-violet-700 leading-relaxed">
              <strong>Background Context</strong> tells the AI what this topic is about. The AI will use this to generate relevant phrases, give contextual pronunciation feedback, and have topic-aware conversations in Free Talk mode.
            </p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Background Context
            </label>
            <textarea
              value={form.backgroundContext}
              onChange={(e) => updateField('backgroundContext', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              rows={5}
              placeholder="e.g. This topic covers construction site safety terminology. Workers need to communicate about PPE (Personal Protective Equipment), scaffolding safety, crane operations, hazard reporting, and emergency procedures. The work environment involves heavy machinery, heights, and confined spaces."
            />
            <p className="text-[10px] text-slate-400 mt-1">The more detail you provide, the better the AI will understand the domain.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              AI Instructions
            </label>
            <textarea
              value={form.aiInstructions}
              onChange={(e) => updateField('aiInstructions', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              rows={3}
              placeholder="e.g. Use polite keigo forms for supervisor interactions. Focus on safety-critical vocabulary. Be strict about pronunciation of safety commands. Include both formal and informal registers."
            />
            <p className="text-[10px] text-slate-400 mt-1">Special instructions for how the AI should behave when teaching this topic.</p>
          </div>
        </div>
      )}

      {/* Vocabulary Tab */}
      {activeTab === 'vocabulary' && (
        <VocabularyBuilder
          items={form.vocabularyList}
          onChange={(items) => updateField('vocabularyList', items)}
        />
      )}

      {/* Conversation Starters Tab */}
      {activeTab === 'starters' && (
        <StartersBuilder
          items={form.conversationStarters}
          onChange={(items) => updateField('conversationStarters', items)}
        />
      )}

      {/* Save Button */}
      <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-slate-200">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
          {isEditing ? 'Update' : 'Create'} Topic
        </Button>
      </div>
    </Modal>
  );
};

/* ─── Vocabulary Builder ─── */
const VocabularyBuilder = ({ items, onChange }) => {
  const add = () => onChange([...items, { japanese: '', romaji: '', english: '' }]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i, field, value) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    onChange(updated);
  };

  return (
    <div>
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-4">
        <p className="text-xs text-blue-700 leading-relaxed">
          Add key vocabulary terms that the AI should know and use when generating phrases or having conversations about this topic.
        </p>
      </div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vocabulary ({items.length})</label>
        <button type="button" onClick={add} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100">
          <Plus className="w-3 h-3" /> Add Term
        </button>
      </div>
      {items.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
          <p className="text-xs text-slate-400 mb-2">No vocabulary terms yet</p>
          <button type="button" onClick={add} className="text-xs font-medium text-blue-600 hover:text-blue-700">+ Add your first term</button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2.5 border border-slate-200">
              <input
                type="text"
                value={item.japanese}
                onChange={(e) => update(i, 'japanese', e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none font-japanese"
                placeholder="日本語"
              />
              <input
                type="text"
                value={item.romaji}
                onChange={(e) => update(i, 'romaji', e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="romaji"
              />
              <input
                type="text"
                value={item.english}
                onChange={(e) => update(i, 'english', e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="English"
              />
              <button type="button" onClick={() => remove(i)} className="p-1 text-slate-400 hover:text-red-500 rounded">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Conversation Starters Builder ─── */
const StartersBuilder = ({ items, onChange }) => {
  const add = () => onChange([...items, { prompt: '', description: '' }]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i, field, value) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    onChange(updated);
  };

  return (
    <div>
      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 mb-4">
        <p className="text-xs text-emerald-700 leading-relaxed">
          Conversation starters give employees specific scenarios to practice in Free Talk mode. Each starter sets up a situation for the AI conversation.
        </p>
      </div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Starters ({items.length})</label>
        <button type="button" onClick={add} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-100">
          <Plus className="w-3 h-3" /> Add Starter
        </button>
      </div>
      {items.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
          <p className="text-xs text-slate-400 mb-2">No conversation starters yet</p>
          <button type="button" onClick={add} className="text-xs font-medium text-emerald-600 hover:text-emerald-700">+ Add your first starter</button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2">
              <div className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-500 mt-1.5 flex-shrink-0" />
                <input
                  type="text"
                  value={item.prompt}
                  onChange={(e) => update(i, 'prompt', e.target.value)}
                  className="flex-1 px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="e.g. You need to ask your supervisor about safety equipment"
                />
                <button type="button" onClick={() => remove(i)} className="p-1 text-slate-400 hover:text-red-500 rounded flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                type="text"
                value={item.description}
                onChange={(e) => update(i, 'description', e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none ml-6"
                placeholder="Short description (e.g. Practice requesting PPE)"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicManagement;
