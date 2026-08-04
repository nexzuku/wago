import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Briefcase, Search, X, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { scenariosAPI, topicsAPI } from '../services/api';
import { Button, Card, Input, Modal, Badge } from '../components/ui';

const ICON_OPTIONS = ['🏢', '💼', '🤝', '📞', '🏭', '🚗', '🍽️', '🏥', '🛒', '📋', '⚠️', '🔧', '💻', '📊', '🎯'];

const emptyForm = {
  title: '',
  description: '',
  icon: '🏢',
  category: 'daily',
  categoryLabel: '',
  difficulty: 'beginner',
  duration: '',
  topicIds: [],
  prerequisiteScenarioId: '',
  sortOrder: 0,
  isActive: true,
};

const ScenariosManagement = () => {
  const [items, setItems] = useState([]);
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [topicSearch, setTopicSearch] = useState('');

  useEffect(() => {
    loadItems();
    loadTopics();
  }, []);

  const loadItems = async () => {
    try {
      const { data } = await scenariosAPI.list();
      setItems(data.data || []);
    } catch {
      toast.error('Failed to load scenarios');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTopics = async () => {
    try {
      const { data } = await topicsAPI.list();
      setTopics(data.data || []);
    } catch {
      // Topics will just be empty
    }
  };

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setTopicSearch('');
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || '',
      description: item.description || '',
      icon: item.icon || '🏢',
      category: item.category || 'daily',
      categoryLabel: item.categoryLabel || '',
      difficulty: item.difficulty || 'beginner',
      duration: item.duration || '',
      topicIds: (item.topicIds || []).map(t => t._id || t),
      prerequisiteScenarioId: item.prerequisiteScenarioId?._id || item.prerequisiteScenarioId || '',
      sortOrder: item.sortOrder || 0,
      isActive: item.isActive !== false,
    });
    setTopicSearch('');
    setShowModal(true);
  };

  const toggleTopic = (topicId) => {
    setForm(prev => ({
      ...prev,
      topicIds: prev.topicIds.includes(topicId)
        ? prev.topicIds.filter(id => id !== topicId)
        : [...prev.topicIds, topicId],
    }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        icon: form.icon,
        category: form.category,
        categoryLabel: form.categoryLabel,
        difficulty: form.difficulty,
        duration: form.duration,
        topicIds: form.topicIds,
        prerequisiteScenarioId: form.prerequisiteScenarioId || null,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      };

      if (editing) {
        await scenariosAPI.update(editing._id, payload);
        toast.success('Scenario updated');
      } else {
        await scenariosAPI.create(payload);
        toast.success('Scenario created');
      }

      await loadItems();
      setShowModal(false);
    } catch {
      toast.error('Failed to save scenario');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await scenariosAPI.delete(item._id);
      toast.success('Scenario deleted');
      await loadItems();
    } catch {
      toast.error('Failed to delete scenario');
    }
  };

  const selectedTopics = form.topicIds
    .map(id => topics.find(t => t._id === id))
    .filter(Boolean);

  const filteredTopics = topics.filter(t =>
    t.name.toLowerCase().includes(topicSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Workplace Scenarios</h1>
          <p className="text-sm text-slate-500">Manage training scenarios shown to employees.</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openNew}>Add Scenario</Button>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scenarios</span>
        </div>
        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-6 text-center text-slate-500">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No scenarios yet.</div>
          ) : (
            items.map((item) => (
              <div key={item._id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.icon || '🏢'}</span>
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    <Badge size="sm" variant={item.difficulty === 'advanced' ? 'danger' : item.difficulty === 'intermediate' ? 'warning' : 'success'}>
                      {item.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-slate-500">{item.categoryLabel || item.category}</p>
                    {item.topicIds?.length > 0 && (
                      <span className="text-xs text-slate-400">{item.topicIds.length} topic{item.topicIds.length !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button size="sm" variant="secondary" leftIcon={<Edit2 className="w-4 h-4" />} onClick={() => openEdit(item)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" leftIcon={<Trash2 className="w-4 h-4" />} onClick={() => handleDelete(item)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Scenario' : 'New Scenario'}
        description="Configure the scenario details and assign relevant topics."
        size="lg"
      >
        <div className="space-y-5">
          <Input label="Title" value={form.title} onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g. Client Meeting Preparation" />

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this scenario covers..."
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm min-h-[80px] resize-none outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {ICON_OPTIONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, icon }))}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all border ${
                    form.icon === icon
                      ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-100 scale-110'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100"
              >
                <option value="daily">Daily</option>
                <option value="safety">Safety</option>
                <option value="client">Client</option>
                <option value="technical">Technical</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Category Label" value={form.categoryLabel} onChange={(e) => setForm(prev => ({ ...prev, categoryLabel: e.target.value }))} placeholder="e.g. Office Life" />
            <Input label="Duration" value={form.duration} onChange={(e) => setForm(prev => ({ ...prev, duration: e.target.value }))} placeholder="e.g. 15 min" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prerequisite Scenario</label>
            <select
              value={form.prerequisiteScenarioId}
              onChange={(e) => setForm(prev => ({ ...prev, prerequisiteScenarioId: e.target.value }))}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100"
            >
              <option value="">None (no prerequisite)</option>
              {items
                .filter(s => s._id !== editing?._id)
                .map(s => (
                  <option key={s._id} value={s._id}>
                    {s.icon} {s.title} ({s.difficulty})
                  </option>
                ))}
            </select>
          </div>

          {/* Topics Section */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Linked Topics ({form.topicIds.length})
            </label>

            {selectedTopics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {selectedTopics.map(topic => (
                  <span
                    key={topic._id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-100"
                  >
                    <BookOpen className="w-3 h-3" />
                    {topic.name}
                    <button onClick={() => toggleTopic(topic._id)} className="ml-0.5 hover:text-blue-900 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                placeholder="Search topics..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 placeholder:text-slate-300"
              />
            </div>
            <div className="max-h-[140px] overflow-y-auto border border-slate-200 rounded-lg bg-white divide-y divide-slate-50">
              {filteredTopics.length === 0 ? (
                <div className="px-3 py-4 text-xs text-slate-400 text-center">
                  {topics.length === 0 ? 'No topics available' : 'No topics match your search'}
                </div>
              ) : (
                filteredTopics.map(topic => {
                  const isSelected = form.topicIds.includes(topic._id);
                  return (
                    <label
                      key={topic._id}
                      className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors hover:bg-slate-50 ${isSelected ? 'bg-blue-50/50' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleTopic(topic._id)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                      />
                      <span className={`text-xs ${isSelected ? 'font-medium text-blue-700' : 'text-slate-600'}`}>
                        {topic.icon} {topic.name}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm(prev => ({ ...prev, sortOrder: e.target.value }))} />
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-slate-600">Active</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSubmit} isLoading={isSaving}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ScenariosManagement;
