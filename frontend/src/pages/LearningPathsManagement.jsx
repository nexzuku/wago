import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Route, ChevronUp, ChevronDown, GripVertical, X, BookOpen, Search, FileText, Video, Headphones, Image, File } from 'lucide-react';
import toast from 'react-hot-toast';
import { learningPathsAPI, contentAPI } from '../services/api';
import { Button, Card, Input, Modal, Badge } from '../components/ui';

const contentTypeIcon = (type) => {
  const icons = { video: Video, audio: Headphones, pdf: FileText, image: Image, document: File };
  const Icon = icons[type] || File;
  return <Icon className="w-3.5 h-3.5" />;
};

const contentTypeColor = (type) => {
  const colors = {
    video: 'bg-purple-50 text-purple-700 border-purple-100',
    audio: 'bg-amber-50 text-amber-700 border-amber-100',
    pdf: 'bg-red-50 text-red-700 border-red-100',
    image: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    document: 'bg-blue-50 text-blue-700 border-blue-100',
  };
  return colors[type] || 'bg-slate-50 text-slate-700 border-slate-100';
};

const emptyForm = {
  level: 'beginner',
  levelLabel: '',
  title: '',
  description: '',
  duration: '',
  modules: [],
  prerequisitePathId: '',
  sortOrder: 0,
  isActive: true,
};

const ModuleCard = ({ module, index, total, contentItems, contentSearch, onContentSearchChange, onUpdate, onRemove, onMoveUp, onMoveDown }) => {
  const toggleContent = (contentId) => {
    const current = module.contentIds || [];
    const updated = current.includes(contentId)
      ? current.filter((id) => id !== contentId)
      : [...current, contentId];
    onUpdate({ ...module, contentIds: updated });
  };

  const selectedContent = (module.contentIds || [])
    .map((id) => contentItems.find((c) => c._id === id))
    .filter(Boolean);

  const filteredContent = contentItems.filter((c) =>
    c.title.toLowerCase().includes((contentSearch || '').toLowerCase())
  );

  return (
    <div className="border border-slate-200 rounded-xl bg-slate-50/50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-slate-100">
        <GripVertical className="w-4 h-4 text-slate-300 flex-shrink-0" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
          Module {index + 1}
        </span>
        <input
          type="text"
          value={module.name || ''}
          onChange={(e) => onUpdate({ ...module, name: e.target.value })}
          placeholder="Module name..."
          className="flex-1 px-2 py-1 text-sm font-medium text-slate-800 bg-transparent border-0 outline-none focus:ring-0 placeholder:text-slate-300"
        />
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Move up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Move down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={onRemove}
            className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
            title="Remove module"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {selectedContent.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Selected Content ({selectedContent.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedContent.map((item) => (
                <span
                  key={item._id}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${contentTypeColor(item.type)}`}
                >
                  {contentTypeIcon(item.type)}
                  {item.title}
                  <button
                    onClick={() => toggleContent(item._id)}
                    className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Available Content
          </p>
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={contentSearch || ''}
              onChange={(e) => onContentSearchChange(e.target.value)}
              placeholder="Search content..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 placeholder:text-slate-300"
            />
          </div>
          <div className="max-h-[160px] overflow-y-auto border border-slate-200 rounded-lg bg-white divide-y divide-slate-50">
            {filteredContent.length === 0 ? (
              <div className="px-3 py-4 text-xs text-slate-400 text-center">
                {contentItems.length === 0 ? 'No content uploaded yet — upload materials in the Content Library first' : 'No content matches your search'}
              </div>
            ) : (
              filteredContent.map((item) => {
                const isSelected = (module.contentIds || []).includes(item._id);
                return (
                  <label
                    key={item._id}
                    className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors hover:bg-slate-50 ${
                      isSelected ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleContent(item._id)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="flex items-center gap-1.5 text-slate-400">
                      {contentTypeIcon(item.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs block truncate ${isSelected ? 'font-medium text-blue-700' : 'text-slate-600'}`}>
                        {item.title}
                      </span>
                      {item.description && (
                        <span className="text-[10px] text-slate-400 block truncate">{item.description}</span>
                      )}
                    </div>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border flex-shrink-0 ${contentTypeColor(item.type)}`}>
                      {item.type}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const LearningPathsManagement = () => {
  const [items, setItems] = useState([]);
  const [contentItems, setContentItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [moduleContentSearches, setModuleContentSearches] = useState({});

  useEffect(() => {
    loadItems();
    loadContent();
  }, []);

  const loadItems = async () => {
    try {
      const { data } = await learningPathsAPI.list();
      setItems(data.data || []);
    } catch {
      toast.error('Failed to load learning paths');
    } finally {
      setIsLoading(false);
    }
  };

  const loadContent = async () => {
    try {
      const { data } = await contentAPI.list();
      setContentItems(data.data || []);
    } catch {
      // Content will just be empty
    }
  };

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setModuleContentSearches({});
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    const modules = (item.modules || []).map((m) => ({
      name: m.name || '',
      contentIds: (m.contentIds || []).map((c) => (typeof c === 'object' ? c._id : c)),
    }));
    setForm({
      level: item.level || 'beginner',
      levelLabel: item.levelLabel || '',
      title: item.title || '',
      description: item.description || '',
      duration: item.duration || '',
      modules,
      prerequisitePathId: item.prerequisitePathId?._id || item.prerequisitePathId || '',
      sortOrder: item.sortOrder || 0,
      isActive: item.isActive !== false,
    });
    setModuleContentSearches({});
    setShowModal(true);
  };

  const addModule = () => {
    setForm((prev) => ({
      ...prev,
      modules: [...prev.modules, { name: '', contentIds: [] }],
    }));
  };

  const updateModule = (index, updated) => {
    setForm((prev) => {
      const modules = [...prev.modules];
      modules[index] = updated;
      return { ...prev, modules };
    });
  };

  const removeModule = (index) => {
    setForm((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index),
    }));
    setModuleContentSearches((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const moveModule = (index, direction) => {
    setForm((prev) => {
      const modules = [...prev.modules];
      const target = index + direction;
      if (target < 0 || target >= modules.length) return prev;
      [modules[index], modules[target]] = [modules[target], modules[index]];
      return { ...prev, modules };
    });
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        level: form.level,
        levelLabel: form.levelLabel,
        title: form.title,
        description: form.description,
        duration: form.duration,
        modules: form.modules.map((m) => ({
          name: m.name,
          contentIds: m.contentIds,
        })),
        prerequisitePathId: form.prerequisitePathId || null,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      };

      if (editing) {
        await learningPathsAPI.update(editing._id, payload);
        toast.success('Learning path updated');
      } else {
        await learningPathsAPI.create(payload);
        toast.success('Learning path created');
      }

      await loadItems();
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to save learning path');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await learningPathsAPI.delete(item._id);
      toast.success('Learning path deleted');
      await loadItems();
    } catch {
      toast.error('Failed to delete learning path');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Learning Paths</h1>
          <p className="text-sm text-slate-500">Manage structured learning paths for employees.</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openNew}>Add Path</Button>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <Route className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Paths</span>
        </div>
        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-6 text-center text-slate-500">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No learning paths yet.</div>
          ) : (
            items.map((item) => (
              <div key={item._id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    <Badge size="sm" variant={item.level === 'advanced' ? 'danger' : item.level === 'intermediate' ? 'warning' : 'success'}>
                      {item.levelLabel || item.level}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-slate-500">{item.duration || 'No duration set'}</p>
                    {item.modules?.length > 0 && (
                      <span className="text-xs text-slate-400">
                        {item.modules.length} module{item.modules.length !== 1 ? 's' : ''}
                      </span>
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
        title={editing ? 'Edit Learning Path' : 'New Learning Path'}
        description="Set up your learning path details and add modules with content from your library."
        size="lg"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Level</label>
              <select
                value={form.level}
                onChange={(e) => setForm(prev => ({ ...prev, level: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-blue-300 focus:ring-1 focus:ring-blue-100 outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <Input label="Level Label" value={form.levelLabel} onChange={(e) => setForm(prev => ({ ...prev, levelLabel: e.target.value }))} placeholder="e.g. N5, Starter" />
          </div>
          <Input label="Title" value={form.title} onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g. Business Japanese Basics" />
          <Input label="Duration" value={form.duration} onChange={(e) => setForm(prev => ({ ...prev, duration: e.target.value }))} placeholder="e.g. 4 weeks" />

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prerequisite Path</label>
            <select
              value={form.prerequisitePathId}
              onChange={(e) => setForm(prev => ({ ...prev, prerequisitePathId: e.target.value }))}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-blue-300 focus:ring-1 focus:ring-blue-100 outline-none"
            >
              <option value="">None (no prerequisite)</option>
              {items
                .filter((p) => p._id !== editing?._id)
                .map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title} ({p.levelLabel || p.level})
                  </option>
                ))}
            </select>
          </div>

          {/* Modules Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Modules ({form.modules.length})
              </label>
              <button
                type="button"
                onClick={addModule}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Module
              </button>
            </div>

            {form.modules.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400 mb-3">No modules yet</p>
                <button
                  type="button"
                  onClick={addModule}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add your first module
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {form.modules.map((mod, i) => (
                  <ModuleCard
                    key={i}
                    module={mod}
                    index={i}
                    total={form.modules.length}
                    contentItems={contentItems}
                    contentSearch={moduleContentSearches[i] || ''}
                    onContentSearchChange={(val) =>
                      setModuleContentSearches((prev) => ({ ...prev, [i]: val }))
                    }
                    onUpdate={(updated) => updateModule(i, updated)}
                    onRemove={() => removeModule(i)}
                    onMoveUp={() => moveModule(i, -1)}
                    onMoveDown={() => moveModule(i, 1)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm(prev => ({ ...prev, sortOrder: e.target.value }))} />
            <div className="flex items-center gap-2">
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

export default LearningPathsManagement;
