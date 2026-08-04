import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, FileText, X, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { cultureAPI } from '../services/api';
import { Button, Card, Input, Modal, Badge } from '../components/ui';

const ICON_OPTIONS = ['📚', '🎌', '🙇', '🍵', '👔', '🏯', '⛩️', '🗾', '🎎', '📝', '🤝', '💬', '🧑‍💼', '🎓', '✨'];

const emptyForm = {
  title: '',
  subtitle: '',
  icon: '📚',
  contentType: 'rules',
  rules: [],
  tips: [],
  types: [],
  videoUrl: '',
  sortOrder: 0,
  isActive: true,
};

// Visual list builder for Rules (text + isPositive toggle)
const RulesBuilder = ({ rules, onChange }) => {
  const addRule = () => onChange([...rules, { text: '', isPositive: true }]);
  const removeRule = (i) => onChange(rules.filter((_, idx) => idx !== i));
  const updateRule = (i, field, value) => {
    const updated = [...rules];
    updated[i] = { ...updated[i], [field]: value };
    onChange(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rules ({rules.length})</label>
        <button type="button" onClick={addRule} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100">
          <Plus className="w-3 h-3" /> Add Rule
        </button>
      </div>
      {rules.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
          <p className="text-xs text-slate-400 mb-2">No rules yet</p>
          <button type="button" onClick={addRule} className="text-xs font-medium text-blue-600 hover:text-blue-700">+ Add your first rule</button>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2 border border-slate-200">
              <button
                type="button"
                onClick={() => updateRule(i, 'isPositive', !rule.isPositive)}
                className={`flex-shrink-0 p-1.5 rounded-md transition-colors ${rule.isPositive ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                title={rule.isPositive ? 'Do (click to toggle)' : "Don't (click to toggle)"}
              >
                {rule.isPositive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              </button>
              <input
                type="text"
                value={rule.text}
                onChange={(e) => updateRule(i, 'text', e.target.value)}
                placeholder={rule.isPositive ? 'e.g. Arrive 5 minutes early' : "e.g. Don't use first names without permission"}
                className="flex-1 px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100"
              />
              <button type="button" onClick={() => removeRule(i)} className="flex-shrink-0 p-1 text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Visual list builder for Tips (bad/good pairs)
const TipsBuilder = ({ tips, onChange }) => {
  const addTip = () => onChange([...tips, { bad: '', good: '' }]);
  const removeTip = (i) => onChange(tips.filter((_, idx) => idx !== i));
  const updateTip = (i, field, value) => {
    const updated = [...tips];
    updated[i] = { ...updated[i], [field]: value };
    onChange(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tips ({tips.length})</label>
        <button type="button" onClick={addTip} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100">
          <Plus className="w-3 h-3" /> Add Tip
        </button>
      </div>
      {tips.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
          <p className="text-xs text-slate-400 mb-2">No tips yet</p>
          <button type="button" onClick={addTip} className="text-xs font-medium text-blue-600 hover:text-blue-700">+ Add your first tip</button>
        </div>
      ) : (
        <div className="space-y-2">
          {tips.map((tip, i) => (
            <div key={i} className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex-shrink-0 text-[10px] font-bold text-red-500 uppercase tracking-wider w-14">Avoid</span>
                <input
                  type="text"
                  value={tip.bad}
                  onChange={(e) => updateTip(i, 'bad', e.target.value)}
                  placeholder='e.g. "No" or direct refusal'
                  className="flex-1 px-2 py-1.5 text-sm bg-white border border-red-100 rounded-md outline-none focus:border-red-300 focus:ring-1 focus:ring-red-100"
                />
                <button type="button" onClick={() => removeTip(i)} className="flex-shrink-0 p-1 text-slate-400 hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex-shrink-0 text-[10px] font-bold text-emerald-600 uppercase tracking-wider w-14">Say</span>
                <input
                  type="text"
                  value={tip.good}
                  onChange={(e) => updateTip(i, 'good', e.target.value)}
                  placeholder='e.g. ちょっと難しいですね (That is a bit difficult)'
                  className="flex-1 px-2 py-1.5 text-sm bg-white border border-emerald-100 rounded-md outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-100"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Visual list builder for Types (label + description)
const TypesBuilder = ({ types, onChange }) => {
  const addType = () => onChange([...types, { label: '', description: '' }]);
  const removeType = (i) => onChange(types.filter((_, idx) => idx !== i));
  const updateType = (i, field, value) => {
    const updated = [...types];
    updated[i] = { ...updated[i], [field]: value };
    onChange(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Types ({types.length})</label>
        <button type="button" onClick={addType} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100">
          <Plus className="w-3 h-3" /> Add Type
        </button>
      </div>
      {types.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
          <p className="text-xs text-slate-400 mb-2">No types yet</p>
          <button type="button" onClick={addType} className="text-xs font-medium text-blue-600 hover:text-blue-700">+ Add your first type</button>
        </div>
      ) : (
        <div className="space-y-2">
          {types.map((t, i) => (
            <div key={i} className="flex items-start gap-2 bg-slate-50 rounded-lg p-2 border border-slate-200">
              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  value={t.label}
                  onChange={(e) => updateType(i, 'label', e.target.value)}
                  placeholder="e.g. 15° Bow - Casual"
                  className="w-full px-2 py-1.5 text-sm font-medium bg-white border border-slate-200 rounded-md outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100"
                />
                <input
                  type="text"
                  value={t.description}
                  onChange={(e) => updateType(i, 'description', e.target.value)}
                  placeholder="e.g. Eshaku - used for casual greetings"
                  className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-md outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 text-slate-500"
                />
              </div>
              <button type="button" onClick={() => removeType(i)} className="flex-shrink-0 p-1 mt-1 text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CultureManagement = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const { data } = await cultureAPI.list();
      setItems(data.data || []);
    } catch (error) {
      toast.error('Failed to load culture content');
    } finally {
      setIsLoading(false);
    }
  };

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || '',
      subtitle: item.subtitle || '',
      icon: item.icon || '📚',
      contentType: item.contentType || 'rules',
      rules: (item.rules || []).map(r => ({ text: r.text || '', isPositive: r.isPositive !== false })),
      tips: (item.tips || []).map(t => ({ bad: t.bad || '', good: t.good || '' })),
      types: (item.types || []).map(t => ({ label: t.label || '', description: t.description || '' })),
      videoUrl: item.videoUrl || '',
      sortOrder: item.sortOrder || 0,
      isActive: item.isActive !== false,
    });
    setShowModal(true);
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
        subtitle: form.subtitle,
        icon: form.icon,
        contentType: form.contentType,
        rules: form.contentType === 'rules' ? form.rules.filter(r => r.text.trim()) : [],
        tips: form.contentType === 'tips' ? form.tips.filter(t => t.bad.trim() || t.good.trim()) : [],
        types: form.contentType === 'types' ? form.types.filter(t => t.label.trim()) : [],
        videoUrl: form.videoUrl,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      };

      if (editing) {
        await cultureAPI.update(editing._id, payload);
        toast.success('Culture content updated');
      } else {
        await cultureAPI.create(payload);
        toast.success('Culture content created');
      }

      await loadItems();
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to save culture content');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await cultureAPI.delete(item._id);
      toast.success('Culture content deleted');
      await loadItems();
    } catch {
      toast.error('Failed to delete content');
    }
  };

  const getItemCount = (item) => {
    if (item.contentType === 'rules') return item.rules?.length || 0;
    if (item.contentType === 'tips') return item.tips?.length || 0;
    if (item.contentType === 'types') return item.types?.length || 0;
    return 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Culture Content</h1>
          <p className="text-sm text-slate-500">Manage culture and etiquette content for employees.</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openNew}>Add Content</Button>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Items</span>
        </div>
        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-6 text-center text-slate-500">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No culture content yet.</div>
          ) : (
            items.map((item) => (
              <div key={item._id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl flex-shrink-0">{item.icon || '📚'}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{item.title}</h3>
                      <Badge size="sm" variant={item.contentType === 'rules' ? 'success' : item.contentType === 'tips' ? 'warning' : 'primary'}>
                        {item.contentType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
                      <span className="text-xs text-slate-400">{getItemCount(item)} item{getItemCount(item) !== 1 ? 's' : ''}</span>
                    </div>
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
        title={editing ? 'Edit Culture Content' : 'New Culture Content'}
        description="Add cultural rules, communication tips, or etiquette types for your team."
        size="lg"
      >
        <div className="space-y-5">
          <Input label="Title" value={form.title} onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g. Business Card Etiquette" />
          <Input label="Subtitle" value={form.subtitle} onChange={(e) => setForm(prev => ({ ...prev, subtitle: e.target.value }))} placeholder="e.g. Essential rules for exchanging meishi" />

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

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Content Type</label>
            <div className="flex gap-2">
              {[
                { value: 'rules', label: 'Rules', desc: 'Do / Don\'t items' },
                { value: 'tips', label: 'Tips', desc: 'Avoid → Say instead' },
                { value: 'types', label: 'Types', desc: 'Label + description' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, contentType: opt.value }))}
                  className={`flex-1 px-3 py-2.5 rounded-lg border text-left transition-all ${
                    form.contentType === opt.value
                      ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-100'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className={`text-sm font-medium block ${form.contentType === opt.value ? 'text-blue-700' : 'text-slate-700'}`}>{opt.label}</span>
                  <span className="text-[10px] text-slate-400">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {form.contentType === 'rules' && (
            <RulesBuilder rules={form.rules} onChange={(rules) => setForm(prev => ({ ...prev, rules }))} />
          )}
          {form.contentType === 'tips' && (
            <TipsBuilder tips={form.tips} onChange={(tips) => setForm(prev => ({ ...prev, tips }))} />
          )}
          {form.contentType === 'types' && (
            <TypesBuilder types={form.types} onChange={(types) => setForm(prev => ({ ...prev, types }))} />
          )}

          <Input label="Video URL (optional)" value={form.videoUrl} onChange={(e) => setForm(prev => ({ ...prev, videoUrl: e.target.value }))} placeholder="https://youtube.com/..." />

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

export default CultureManagement;
