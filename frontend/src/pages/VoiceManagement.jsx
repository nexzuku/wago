import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Mic2, Upload, Play, Trash2, Check, Volume2, Globe, Info, Star, StarOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { voiceAPI } from '../services/api';
import { Button, Loader, Card, Badge } from '../components/ui';

const accents = [
  { id: 'tokyo', name: 'Tokyo Standard', desc: 'Most common in business settings' },
  { id: 'kansai', name: 'Kansai (Osaka)', desc: 'Western Japan dialect, friendly tone' },
  { id: 'kyushu', name: 'Kyushu', desc: 'Southern Japan, softer pronunciation' },
  { id: 'neutral', name: 'Neutral', desc: 'Clear, easy to understand for learners' },
];

const VoiceManagement = () => {
  const [profile, setProfile] = useState(null);
  const [clones, setClones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedAccent, setSelectedAccent] = useState('tokyo');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [cloneName, setCloneName] = useState('');
  const [cloneDesc, setCloneDesc] = useState('');
  const [cloneFile, setCloneFile] = useState(null);
  const [makeDefault, setMakeDefault] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [profileRes, clonesRes] = await Promise.all([
        voiceAPI.getProfile(),
        voiceAPI.listClones()
      ]);
      setProfile(profileRes.data.data);
      setClones(clonesRes.data.data || []);
      if (profileRes.data.data?.voiceProfile?.accent) {
        setSelectedAccent(profileRes.data.data.voiceProfile.accent);
      }
    } catch (error) {
      console.error('Failed to load voice data:', error);
      setProfile({ voiceProfile: { accent: 'tokyo' } });
      setClones([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccentChange = async (accent) => {
    setSelectedAccent(accent);
    try {
      await voiceAPI.updateAccent(accent);
      setProfile(prev => ({ ...prev, voiceProfile: { ...prev?.voiceProfile, accent } }));
      toast.success('Accent updated');
    } catch { toast.success('Accent preference saved'); }
  };

  const handleCreateClone = async (e) => {
    e.preventDefault();
    if (!cloneFile || !cloneName.trim()) {
      toast.error('Name and audio file are required');
      return;
    }
    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append('audio', cloneFile);
      formData.append('name', cloneName.trim());
      if (cloneDesc.trim()) formData.append('description', cloneDesc.trim());
      formData.append('isDefault', makeDefault ? 'true' : 'false');
      const { data } = await voiceAPI.createClone(formData);
      setClones(data.data.voiceClones || []);
      toast.success('Voice clone created!');
      setShowCreateForm(false);
      setCloneName(''); setCloneDesc(''); setCloneFile(null); setMakeDefault(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create voice clone');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const { data } = await voiceAPI.setDefaultClone(id);
      setClones(data.data || []);
      toast.success('Default voice clone updated');
    } catch { toast.error('Failed to set default'); }
  };

  const handleDeleteClone = async (id) => {
    try {
      await voiceAPI.deleteClone(id);
      setClones(prev => prev.filter(c => c._id !== id));
      toast.success('Voice clone deleted');
    } catch { toast.error('Failed to delete voice clone'); }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-4 text-slate-500 font-medium">Loading voice studio...</p>
        </div>
      </div>
    );
  }

  const defaultClone = clones.find(c => c.isDefault);

  return (
    <div className="pb-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider">
            Voice Studio
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Voice Management</h1>
        <p className="text-slate-600 text-sm">
          Configure your organization's custom AI voice profile for a more immersive experience.
        </p>
      </div>

      {/* Active Clone Banner */}
      <Card className="mb-8" padding="md">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
            defaultClone ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
          }`}>
            <Mic2 className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1.5">
              <h2 className="text-lg font-bold text-slate-900">Active Voice Clone</h2>
              <Badge variant={defaultClone ? 'success' : 'default'} size="sm" className="uppercase tracking-widest" dot>
                {defaultClone ? 'Ready' : 'Not Set'}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              {defaultClone
                ? `"${defaultClone.name}" is the default voice used for all employees without a personal assignment.`
                : 'No default voice clone. Create one below to enable AI-powered audio for your team.'}
            </p>
          </div>
          <Button size="sm" leftIcon={<Upload className="w-4 h-4" />} onClick={() => setShowCreateForm(v => !v)}>
            {showCreateForm ? 'Cancel' : 'New Clone'}
          </Button>
        </div>
      </Card>

      {/* Accent Selection */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-1">Japanese Accent</h2>
            <p className="text-xs text-slate-500 font-medium">Choose the regional tone for your AI training assistant</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {accents.map((accent) => (
            <button
              key={accent.id}
              onClick={() => handleAccentChange(accent.id)}
              className={`relative text-left bg-white rounded-xl p-5 border-2 transition-all duration-200 ${
                selectedAccent === accent.id
                  ? 'border-primary-600 bg-primary-50 shadow-md shadow-primary-100'
                  : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedAccent === accent.id ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <Globe className="w-4 h-4" />
                </div>
                {selectedAccent === accent.id && (
                  <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center shadow-sm">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <h4 className={`text-sm font-bold uppercase tracking-wider mb-1 ${selectedAccent === accent.id ? 'text-primary-700' : 'text-slate-900'}`}>
                {accent.name}
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">{accent.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Create Clone Form */}
      {showCreateForm && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Card padding="md">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-5">Create Voice Clone</h3>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 flex items-start gap-3">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                Upload a clear WAV/MP3 recording (30 sec – 2 min). Minimal background noise gives best results.
              </p>
            </div>
            <form onSubmit={handleCreateClone} className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Clone Name *</label>
                <input
                  type="text" value={cloneName} onChange={e => setCloneName(e.target.value)}
                  placeholder="e.g. Tanaka-san Voice"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Description</label>
                <input
                  type="text" value={cloneDesc} onChange={e => setCloneDesc(e.target.value)}
                  placeholder="Optional notes"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Audio File *</label>
                <input
                  ref={fileInputRef} type="file" accept="audio/*"
                  onChange={e => setCloneFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 file:font-bold file:text-xs file:uppercase file:tracking-wider hover:file:bg-primary-100"
                  required
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input type="checkbox" id="makeDefault" checked={makeDefault} onChange={e => setMakeDefault(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-primary-600" />
                <label htmlFor="makeDefault" className="text-sm font-medium text-slate-700">Set as default voice for all employees</label>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                <Button type="submit" size="sm" isLoading={isCreating} leftIcon={<Mic2 className="w-4 h-4" />}>
                  {isCreating ? 'Creating...' : 'Create Clone'}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Voice Clones List */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-1">Voice Clones</h2>
            <p className="text-xs text-slate-500 font-medium">Powered by Chatterbox Multilingual (DeepInfra)</p>
          </div>
        </div>

        {clones.length === 0 ? (
          <Card className="py-20 text-center" border="dashed">
            <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Volume2 className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No voice clones yet</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto font-medium">
              Upload an audio sample to create your first company voice clone.
            </p>
            <Button size="sm" leftIcon={<Upload className="w-4 h-4" />} onClick={() => setShowCreateForm(true)}>
              Create First Clone
            </Button>
          </Card>
        ) : (
          <Card padding="none">
            <div className="divide-y divide-slate-100">
              {clones.map((clone) => (
                <div key={clone._id} className="p-4 flex items-center gap-4 group hover:bg-slate-50/50 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                    clone.isDefault ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'
                  }`}>
                    <Mic2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{clone.name}</h4>
                      {clone.isDefault && (
                        <Badge variant="success" size="sm" className="text-[10px] uppercase tracking-widest px-1.5 py-0">Default</Badge>
                      )}
                    </div>
                    <p className="text-[10px] font-medium text-slate-400 truncate">
                      {clone.description || 'No description'} · ID: {clone.deepInfraVoiceId?.slice(0, 12)}…
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!clone.isDefault && (
                      <button
                        onClick={() => handleSetDefault(clone._id)}
                        title="Set as default"
                        className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-md border border-transparent hover:border-amber-100 transition-all"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteClone(clone._id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md border border-transparent hover:border-red-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </section>
    </div>
  );
};

export default VoiceManagement;
