import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Palette,
  Shield,
  CreditCard,
  Upload,
  Save,
  Check,
  Sparkles,
  Settings as SettingsIcon,
  Lock,
  Crown,
  ChevronRight,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import { companyAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { Button, Input, Card } from '../components/ui';

const tabs = [
  { id: 'company', label: 'Company Profile', icon: Building2, gradient: 'from-violet-500 to-purple-600' },
  { id: 'branding', label: 'Branding', icon: Palette, gradient: 'from-rose-500 to-pink-600' },
  { id: 'security', label: 'Security', icon: Shield, gradient: 'from-emerald-500 to-teal-600' },
  { id: 'billing', label: 'Billing', icon: CreditCard, gradient: 'from-amber-500 to-orange-600' },
];

const Settings = () => {
  const { company, updateCompany } = useAuthStore();
  const [activeTab, setActiveTab] = useState('company');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: company?.name || '',
    industry: company?.industry || '',
    address: company?.address || '',
    contactEmail: company?.contactEmail || '',
    primaryColor: company?.primaryColor || '#0891b2',
    loginMessage: company?.loginMessage || ''
  });

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      const { data } = await companyAPI.getCurrent();
      const c = data.data;
      if (c) {
        updateCompany(c);
        setFormData({
          name: c.name || '',
          industry: c.industry || '',
          address: c.address || '',
          contactEmail: c.contactEmail || '',
          primaryColor: c.primaryColor || '#0891b2',
          loginMessage: c.loginMessage || ''
        });
      }
    } catch (error) {
      console.error('Failed to load company:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Save company profile fields
      if (activeTab === 'company') {
        const { data } = await companyAPI.update({
          name: formData.name,
          industry: formData.industry,
          address: formData.address,
          contactEmail: formData.contactEmail
        });
        updateCompany(data.data);
      }
      // Save branding fields
      if (activeTab === 'branding') {
        const brandingData = new FormData();
        brandingData.append('primaryColor', formData.primaryColor);
        brandingData.append('loginMessage', formData.loginMessage);
        const { data } = await companyAPI.updateBranding(brandingData);
        updateCompany(data.data);
      }
      toast.success('Settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

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
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider border border-slate-200">
              Administration
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Platform Settings</h1>
          <p className="text-slate-500 text-sm font-medium">
            Configure your organization profile, branding, and security preferences
          </p>
        </div>

        <Button size="sm" onClick={handleSave} isLoading={isLoading} leftIcon={<Save className="w-4 h-4" />}>
          Save Changes
        </Button>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tabs Navigation */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-white rounded-lg border border-slate-200 p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-all text-sm font-medium ${activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <Card className="shadow-xl shadow-slate-200/50" padding="lg">
            {/* Company Profile */}
            {activeTab === 'company' && (
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Company Profile</h3>
                    <p className="text-sm text-slate-500 font-medium">Basic information about your organization</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <Input
                    label="Company Name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter company name"
                    icon={Building2}
                  />
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Input
                      label="Industry"
                      value={formData.industry}
                      onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                      placeholder="e.g. Technology"
                    />
                    <Input
                      label="Contact Email"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="contact@company.com"
                    />
                  </div>
                  <Input
                    label="Address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Company address"
                    icon={Globe}
                  />
                </div>
              </div>
            )}

            {/* Branding */}
            {activeTab === 'branding' && (
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Branding & Theme</h3>
                    <p className="text-sm text-slate-500 font-medium">Customize your company's visual identity</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Company Logo</label>
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-lg bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                        {company?.logo ? (
                          <img src={company.logo} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-8 h-8 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <label className="cursor-pointer">
                          <Button variant="secondary" size="sm" leftIcon={<Upload className="w-4 h-4" />}>
                            Upload Logo
                          </Button>
                          <input type="file" accept="image/*" className="hidden" />
                        </label>
                        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">PNG, JPG up to 2MB</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Primary Brand Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-10 h-10 rounded cursor-pointer border-0 p-0 overflow-hidden"
                      />
                      <Input
                        value={formData.primaryColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-32 font-mono"
                        containerClassName="space-y-0"
                      />
                    </div>
                  </div>
                  <Input
                    label="Login Page Message"
                    type="textarea"
                    value={formData.loginMessage}
                    onChange={(e) => setFormData(prev => ({ ...prev, loginMessage: e.target.value }))}
                    placeholder="Welcome message for employees on login page..."
                  />
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Security Settings</h3>
                    <p className="text-sm text-slate-500 font-medium">Configure password policies and authentication</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      Password Policy
                    </h4>
                    <div className="space-y-4 bg-slate-50 rounded-xl p-6 border border-slate-200">
                      {[
                        { label: 'Require minimum 8 characters', checked: true },
                        { label: 'Require uppercase letter', checked: true },
                        { label: 'Require number', checked: true },
                        { label: 'Require special character', checked: false },
                      ].map((item, i) => (
                        <label key={i} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            defaultChecked={item.checked}
                            className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer transition-all"
                          />
                          <span className="text-sm text-slate-600 group-hover:text-slate-900 font-medium transition-colors">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-[0.2em]">SSO Configuration</h4>
                    <Card className="bg-primary-50 border-primary-100" padding="md">
                      <div className="flex items-start gap-4">
                        <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                          <Sparkles className="w-4.5 h-4.5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-bold text-primary-900 text-sm mb-1 uppercase tracking-wider">Enterprise Feature</p>
                          <p className="text-primary-800/80 text-xs leading-relaxed font-medium">
                            SSO integration with SAML 2.0 and OAuth is available on Enterprise plans.
                            Enable centralized user management for your organization.
                          </p>
                          <Button variant="secondary" size="sm" className="mt-4 bg-white border-primary-200 text-primary-700 hover:bg-primary-100">
                            Contact Sales
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Billing */}
            {activeTab === 'billing' && (
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Billing & Subscription</h3>
                    <p className="text-sm text-slate-500 font-medium">Manage your plan and payment details</p>
                  </div>
                </div>

                <Card className="bg-slate-900 border-0 text-white mb-10 shadow-2xl shadow-slate-200 overflow-hidden" variant="dark" padding="lg" gradient>
                  <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <Crown className="w-5 h-5 text-amber-400" />
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em]">Current Status</span>
                      </div>
                      <h4 className="text-3xl font-bold mb-2 tracking-tight">
                        {company?.subscription?.plan || 'Starter'} Enterprise
                      </h4>
                      <p className="text-slate-200 text-sm font-medium">
                        Allocated for up to <span className="text-white">{company?.subscription?.employeeLimit || 10} employees</span>
                      </p>
                      <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 w-fit px-3 py-1.5 rounded-md border border-white/10">
                        <span>Active until: {company?.subscription?.validUntil
                          ? new Date(company.subscription.validUntil).toLocaleDateString()
                          : 'Perpetual License'}</span>
                      </div>
                    </div>
                    <Button size="lg" className="relative z-10 bg-primary-500 hover:bg-primary-600 text-white border-0 shadow-xl shadow-primary-500/20">
                      Upgrade Account
                    </Button>
                  </div>
                </Card>

                <div className="pt-8 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-[0.2em]">Transaction History</h4>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm text-slate-300">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">No history found</p>
                    <p className="text-slate-400 text-xs mt-1 font-medium">Your platform invoices will appear here.</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
