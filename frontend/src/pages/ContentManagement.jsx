import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Search,
  FolderOpen,
  Plus,
  Eye,
  Download,
  Trash2,
  Grid3X3,
  List,
  TrendingUp,
  Play,
  Layers,
  FileText,
  ArrowUpRight,
  Zap,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { getTypeIcon } from '../components/ui/TypeIcons';
import toast from 'react-hot-toast';
import { contentAPI, topicsAPI } from '../services/api';
import { Button, Loader, Badge, Modal, Input, Card, StatCard } from '../components/ui';



const ContentManagement = () => {
  const [content, setContent] = useState([]);
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ type: '', topic: '' });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchData();
  }, [filter, search]);

  const fetchData = async () => {
    try {
      const [contentRes, topicsRes] = await Promise.all([
        contentAPI.list({ search, type: filter.type || undefined, topicId: filter.topic || undefined }),
        topicsAPI.list()
      ]);
      setContent(contentRes.data.data || []);
      setTopics(topicsRes.data.data || []);
    } catch (error) {
      console.error('Failed to load content:', error);
      // Mock data for demo
      setContent([
        { _id: '1', title: 'Business Japanese Basics', type: 'video', views: 234, createdAt: new Date().toISOString(), description: 'Introduction to business Japanese' },
        { _id: '2', title: 'Common Phrases Guide', type: 'pdf', views: 156, createdAt: new Date().toISOString(), description: 'Essential phrases for daily use' },
        { _id: '3', title: 'Pronunciation Audio Pack', type: 'audio', views: 89, createdAt: new Date().toISOString(), description: 'Native speaker recordings' },
        { _id: '4', title: 'Kanji Flashcards', type: 'document', views: 312, createdAt: new Date().toISOString(), description: 'N5-N3 level kanji' },
      ]);
      setTopics([
        { _id: '1', name: 'Business', icon: '💼' },
        { _id: '2', name: 'Daily Life', icon: '🏠' },
        { _id: '3', name: 'Travel', icon: '✈️' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteContent = async (item) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await contentAPI.delete(item._id);
      toast.success('Content deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete content');
    }
  };

  const stats = [
    { label: 'Total Materials', value: content.length || 0, icon: Layers, color: 'from-primary-500 to-primary-600' },
    { label: 'Total Views', value: content.reduce((acc, c) => acc + (c.views || 0), 0), icon: Eye, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Engagement Rate', value: '+12%', icon: TrendingUp, color: 'from-amber-500 to-amber-600' },
  ];

  return (
    <div className="pb-8 space-y-8">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 text-xs font-bold uppercase tracking-wider border border-violet-100">
              Resources
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Training Library</h1>
          <p className="text-slate-500 text-sm font-medium">
            Manage and organize learning resources for your organization's Japanese curriculum.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" leftIcon={<ArrowUpRight className="w-4 h-4" />}>
            View All
          </Button>
          <Button size="sm" onClick={() => setShowUploadModal(true)} leftIcon={<Upload className="w-4 h-4" />}>
            Upload Material
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((stat, i) => (
          <StatCard
            key={i}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            delay={i * 0.1}
          />
        ))}
      </section>

      {/* Search & Filters */}
      <Card className="overflow-hidden" padding="none" animate delay={0.4}>
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search materials by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                value={filter.type}
                onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
                className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[140px]"
              >
                <option value="">All Types</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="pdf">PDFs</option>
                <option value="document">Documents</option>
              </select>
              <select
                value={filter.topic}
                onChange={(e) => setFilter(prev => ({ ...prev, topic: e.target.value }))}
                className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[140px]"
              >
                <option value="">All Topics</option>
                {topics.map(topic => (
                  <option key={topic._id} value={topic._id}>{topic.name}</option>
                ))}
              </select>
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-100 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Content Display */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size="lg" />
        </div>
      ) : content.length === 0 ? (
        <Card className="py-20 text-center">
          <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No materials found</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            Upload your first training material to start building your organization's library.
          </p>
          <Button size="sm" onClick={() => setShowUploadModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Upload First Content
          </Button>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {content.map((item, i) => {
            // const Icon = typeIcons[item.type] || FileText;

            return (
              <Card
                key={item._id}
                className="group h-full"
                padding="none"
                hover
              >
                {/* Preview Area */}
                <div className="aspect-[16/10] bg-slate-50 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getTypeIcon(item.type, "w-16 h-16")}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="p-2.5 bg-white text-slate-900 rounded-lg shadow-lg hover:bg-slate-50 transition-colors">
                      {item.type === 'video' ? <Play className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button className="p-2.5 bg-white text-slate-900 rounded-lg shadow-lg hover:bg-slate-50 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteContent(item)}
                      className="p-2.5 bg-white text-rose-600 rounded-lg shadow-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="absolute top-3 right-3">
                    <Badge variant="default" size="sm" className="bg-white/90 backdrop-blur-sm border-slate-200">
                      {item.type}
                    </Badge>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h4 className="font-bold text-slate-900 truncate mb-1 group-hover:text-primary-600 transition-colors">{item.title}</h4>
                  <p className="text-slate-500 text-xs truncate mb-4 font-medium">{item.description || 'No description provided'}</p>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3 h-3 text-slate-300" />
                      <span>{item.views || 0} views</span>
                    </div>
                    <span className="text-slate-300">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card padding="none">
          <div className="divide-y divide-slate-100">
            {content.map((item, i) => {
              // const Icon = typeIcons[item.type] || FileText;

              return (
                <div key={item._id} className="p-4 hover:bg-slate-50/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100 group-hover:border-primary-100 transition-colors">
                      {getTypeIcon(item.type, "w-5 h-5 text-slate-400 group-hover:text-primary-500 transition-colors")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 truncate text-sm">{item.title}</h4>
                      <p className="text-slate-500 text-xs truncate font-medium">{item.description || 'No description provided'}</p>
                    </div>
                    <div className="hidden md:block">
                      <Badge variant="default" size="sm" className="uppercase tracking-widest">{item.type}</Badge>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider w-20">
                      <Eye className="w-3 h-3" />
                      <span>{item.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-all">
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteContent(item)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md border border-transparent hover:border-red-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <UploadModal
            topics={topics}
            onClose={() => setShowUploadModal(false)}
            onSuccess={() => {
              setShowUploadModal(false);
              fetchData();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const UploadModal = ({ topics: initialTopics, onClose, onSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [file, setFile] = useState(null);
  const [topics, setTopics] = useState(initialTopics);
  const [detectedResult, setDetectedResult] = useState(null); // { matchedTopics, suggestedTopics, existingTopics, wordCount, truncated }
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topicIds: [],
    visibility: 'all'
  });

  const isPdf = file?.type === 'application/pdf';

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    setFile(selected || null);
    setDetectedResult(null);
  };

  const toggleTopic = (id) => {
    setFormData(prev => ({
      ...prev,
      topicIds: prev.topicIds.includes(id)
        ? prev.topicIds.filter(tid => tid !== id)
        : [...prev.topicIds, id]
    }));
  };

  const handleDetectTopics = async () => {
    if (!file) return;
    setIsDetecting(true);
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await contentAPI.detectTopics(data);
      const result = res.data.data;
      setDetectedResult(result);

      // Auto-select matched existing topics
      const matchedIds = result.existingTopics
        .filter(t => result.matchedTopics.includes(t.name))
        .map(t => t._id);
      if (matchedIds.length > 0) {
        setFormData(prev => ({
          ...prev,
          topicIds: [...new Set([...prev.topicIds, ...matchedIds])]
        }));
      }
      const total = result.matchedTopics.length + result.suggestedTopics.length;
      toast.success(`Detected ${total} topic${total !== 1 ? 's' : ''} from your content`);
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message || 'Failed to detect topics. Please try again.'
      );
    } finally {
      setIsDetecting(false);
    }
  };

  const handleAddSuggestedTopic = async (suggested) => {
    try {
      const res = await topicsAPI.create({
        name: suggested.name,
        description: suggested.description,
        category: suggested.category || 'custom',
        difficulty: 'beginner'
      });
      const newTopic = res.data.data;
      setTopics(prev => [...prev, newTopic]);
      setFormData(prev => ({ ...prev, topicIds: [...prev.topicIds, newTopic._id] }));
      // Remove from suggestions list
      setDetectedResult(prev => ({
        ...prev,
        suggestedTopics: prev.suggestedTopics.filter(t => t.name !== suggested.name)
      }));
      toast.success(`Topic "${suggested.name}" created and selected`);
    } catch (error) {
      toast.error('Failed to create topic');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    const data = new FormData();
    data.append('file', file);
    data.append('title', formData.title || file.name);
    data.append('description', formData.description);
    data.append('topicIds', JSON.stringify(formData.topicIds));
    data.append('visibility', formData.visibility);

    setIsUploading(true);
    try {
      await contentAPI.upload(data);
      toast.success('Content uploaded successfully');
      onSuccess();
    } catch (error) {
      toast.error('Failed to upload content');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Upload Content" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* File drop zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            file ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          {file ? (
            <div>
              <FileText className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="font-bold text-slate-900 text-sm">{file.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                type="button"
                onClick={() => { setFile(null); setDetectedResult(null); }}
                className="mt-3 text-[10px] font-black text-red-600 hover:text-red-700 uppercase tracking-[0.2em] border-b border-transparent hover:border-red-700 transition-all"
              >
                Remove file
              </button>
            </div>
          ) : (
            <label className="cursor-pointer block group">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2 group-hover:text-primary-500 group-hover:-translate-y-1 transition-all" />
              <p className="text-sm text-slate-600 font-bold uppercase tracking-wider group-hover:text-primary-600 transition-colors">
                Click to upload or drag and drop
              </p>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">PDF, Video, Audio, Images up to 100MB</p>
              <input type="file" onChange={handleFileChange} className="hidden" />
            </label>
          )}
        </div>

        {/* AI Topic Detection — only for PDFs */}
        {file && isPdf && !detectedResult && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleDetectTopics}
            isLoading={isDetecting}
            leftIcon={<Zap className="w-4 h-4" />}
            className="w-full border-dashed border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
          >
            {isDetecting ? 'Detecting topics…' : 'Auto-detect Topics from PDF'}
          </Button>
        )}

        {/* Detection results */}
        {detectedResult && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">AI Topic Detection</span>
              </div>
              <span className="text-[10px] text-amber-600 font-medium">
                {detectedResult.wordCount} words analysed{detectedResult.truncated ? ' (first 2000)' : ''}
              </span>
            </div>

            {detectedResult.matchedTopics.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Matched existing topics
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {detectedResult.existingTopics
                    .filter(t => detectedResult.matchedTopics.includes(t.name))
                    .map(topic => (
                      <button
                        key={topic._id}
                        type="button"
                        onClick={() => toggleTopic(topic._id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                          formData.topicIds.includes(topic._id)
                            ? 'bg-primary-600 border-primary-600 text-white'
                            : 'bg-white border-amber-300 text-amber-700 hover:bg-amber-50'
                        }`}
                      >
                        {formData.topicIds.includes(topic._id) ? '✓ ' : ''}{topic.name}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {detectedResult.suggestedTopics.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> New topic suggestions — click to create &amp; add
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {detectedResult.suggestedTopics.map((t, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAddSuggestedTopic(t)}
                      title={t.description}
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold border border-dashed border-amber-400 bg-white text-amber-700 hover:bg-amber-50 transition-all"
                    >
                      + {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {detectedResult.matchedTopics.length === 0 && detectedResult.suggestedTopics.length === 0 && (
              <p className="text-xs text-amber-600">No specific topics detected. Please select topics manually below.</p>
            )}
          </div>
        )}

        <Input
          label="Content Title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="e.g. Q3 Sales Presentation"
        />

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Briefly describe this learning material..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[80px] resize-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Relevant Topics
            </label>
            {file && isPdf && !detectedResult && (
              <button
                type="button"
                onClick={handleDetectTopics}
                disabled={isDetecting}
                className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 disabled:opacity-50"
              >
                <Zap className="w-3 h-3" />
                {isDetecting ? 'Detecting…' : 'Auto-detect'}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {topics.map(topic => (
              <button
                key={topic._id}
                type="button"
                onClick={() => toggleTopic(topic._id)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                  formData.topicIds.includes(topic._id)
                    ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-900/20'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {topic.icon} {topic.name}
              </button>
            ))}
            {topics.length === 0 && (
              <p className="text-xs text-slate-400">No topics yet. Create topics in Topic Management first.</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Platform Visibility</label>
          <select
            value={formData.visibility}
            onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value }))}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Enterprise Members</option>
            <option value="managers">Managers Only</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 mt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            disabled={isUploading || !file}
            isLoading={isUploading}
            size="sm"
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Upload to Library
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ContentManagement;
