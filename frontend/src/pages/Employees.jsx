import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Upload, 
  Search, 
  Mail,
  Users,
  UserCheck,
  TrendingUp,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  Trash2,
  Send,
  Building2,
  MoreHorizontal,
  Sparkles,
  GraduationCap,
  Star,
  ArrowUpRight,
  Clock,
  RefreshCw,
  X,
  Calendar,
  Briefcase,
  Shield,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usersAPI } from '../services/api';
import { Button, Loader, Badge, Avatar, ProgressBar, Modal, Input, Card, StatCard } from '../components/ui';

// ─── Helpers ───
const getInviteStatus = (employee) => {
  if (employee.status !== 'invited') return null;
  if (!employee.inviteExpiresAt) return 'expired';
  return new Date() > new Date(employee.inviteExpiresAt) ? 'expired' : 'pending';
};

const getTimeRemaining = (expiresAt) => {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
};

const getStatusConfig = (employee) => {
  const inviteStatus = getInviteStatus(employee);
  if (inviteStatus === 'expired') {
    return { label: 'Expired', variant: 'danger' };
  }
  const configs = {
    active: { label: 'Active', variant: 'success' },
    invited: { label: 'Invited', variant: 'warning' },
    inactive: { label: 'Inactive', variant: 'default' },
    expired: { label: 'Expired', variant: 'danger' }
  };
  return configs[employee.status] || configs.inactive;
};

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewEmployee, setViewEmployee] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  useEffect(() => {
    fetchEmployees();
  }, [pagination.page, search, statusFilter]);

  const fetchEmployees = async () => {
    try {
      const { data } = await usersAPI.list({ 
        page: pagination.page, 
        limit: 10,
        search: search || undefined,
        status: statusFilter || undefined
      });
      setEmployees(data.data || []);
      setPagination(prev => ({ ...prev, ...data.meta }));
    } catch (error) {
      console.error('Failed to load employees:', error);
      setEmployees([]);
      setPagination({ page: 1, total: 0, totalPages: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const activeCount = employees.filter(e => e.status === 'active').length;
  const invitedCount = employees.filter(e => e.status === 'invited' || e.status === 'expired').length;

  const stats = [
    { label: 'Total Members', value: pagination.total || employees.length, icon: Users, color: 'from-primary-500 to-primary-600' },
    { label: 'Active Now', value: activeCount, icon: UserCheck, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Avg Progress', value: '73%', icon: TrendingUp, color: 'from-amber-500 to-amber-600' },
    { label: 'Pending Invites', value: invitedCount, icon: UserPlus, color: 'from-violet-500 to-violet-600' },
  ];

  const handleDeleteEmployee = async (employee) => {
    if (!confirm(`Remove ${employee.profile?.firstName || employee.email}?`)) return;
    try {
      await usersAPI.delete(employee._id);
      toast.success('Employee removed');
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to remove employee');
    }
  };

  const handleReinvite = async (employee) => {
    try {
      await usersAPI.reinvite(employee._id);
      toast.success(`Re-invitation sent to ${employee.email}`);
      fetchEmployees();
      if (viewEmployee?._id === employee._id) {
        // Refresh detail view
        const { data } = await usersAPI.get(employee._id);
        setViewEmployee(data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to re-invite');
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
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-primary-50 to-cyan-50 text-primary-700 text-xs font-bold uppercase tracking-wider border border-primary-100">
              Organization
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Team Management</h1>
          <p className="text-slate-500 text-sm font-medium">
            Manage your global workforce and monitor their learning progress
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" leftIcon={<Upload className="w-4 h-4" />}>
            Import CSV
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Add Member
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search members by name, email, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[140px]"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="invited">Invited</option>
                <option value="expired">Expired</option>
                <option value="inactive">Inactive</option>
              </select>
              <select className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[150px]">
                <option value="">All Departments</option>
                <option value="engineering">Engineering</option>
                <option value="sales">Sales</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
          </div>
        </div>

        {/* Employee List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="lg" />
          </div>
        ) : employees.length === 0 ? (
          <div className="py-20 text-center px-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center mx-auto mb-5">
              <Users className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No team members found</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
              Start building your team by adding your first member to the platform.
            </p>
            <Button size="sm" onClick={() => setShowAddModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Add First Member
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {employees.map((employee, i) => {
              const statusConfig = getStatusConfig(employee);
              const progress = employee.progress?.skills?.pronunciation || 0;
              const inviteStatus = getInviteStatus(employee);
              const timeLeft = getTimeRemaining(employee.inviteExpiresAt);
              
              return (
                <motion.div 
                  key={employee._id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 hover:bg-slate-50/80 transition-all duration-200 group cursor-pointer"
                  onClick={() => setViewEmployee(employee)}
                >
                  <div className="flex items-center gap-4">
                    <Avatar 
                      name={employee.profile?.firstName 
                        ? `${employee.profile.firstName} ${employee.profile.lastName || ''}`
                        : employee.email
                      }
                      size="md"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 text-sm">
                          {employee.profile?.firstName 
                            ? `${employee.profile.firstName} ${employee.profile.lastName || ''}`
                            : employee.email?.split('@')[0]
                          }
                        </h3>
                        <Badge variant={statusConfig.variant} size="sm">
                          {statusConfig.label}
                        </Badge>
                        {inviteStatus === 'pending' && timeLeft && (
                          <span className="text-[10px] font-semibold text-amber-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeLeft}
                          </span>
                        )}
                        {inviteStatus === 'expired' && (
                          <span className="text-[10px] font-semibold text-rose-500 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Invite expired
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{employee.email}</p>
                    </div>

                    <div className="hidden md:block w-40">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department</p>
                      <p className="text-sm font-semibold text-slate-700">{employee.profile?.department || 'Unassigned'}</p>
                    </div>

                    <div className="hidden lg:block w-48">
                      {employee.status === 'active' ? (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Proficiency</span>
                            <span className="text-sm font-bold text-slate-900">{progress}%</span>
                          </div>
                          <ProgressBar value={progress} size="sm" animated={false} />
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not started</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => setViewEmployee(employee)}
                        className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all shadow-sm"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {(employee.status === 'invited' || employee.status === 'expired') && (
                        <button 
                          onClick={() => handleReinvite(employee)}
                          className="p-2.5 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl border border-transparent hover:border-amber-200 transition-all shadow-sm"
                          title="Re-invite"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteEmployee(employee)}
                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition-all shadow-sm"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-900">{((pagination.page - 1) * 10) + 1}</span> - <span className="text-slate-900">{Math.min(pagination.page * 10, pagination.total)}</span> of <span className="text-slate-900">{pagination.total}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="p-2 text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                  className={`w-8 h-8 rounded text-[10px] font-bold transition-all ${
                    pagination.page === i + 1 
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20' 
                      : 'text-slate-500 hover:bg-white border border-transparent hover:border-slate-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddEmployeeModal 
            onClose={() => setShowAddModal(false)} 
            onSuccess={() => {
              setShowAddModal(false);
              fetchEmployees();
            }}
          />
        )}
      </AnimatePresence>

      {/* View Employee Detail Modal */}
      <AnimatePresence>
        {viewEmployee && (
          <EmployeeDetailModal 
            employee={viewEmployee}
            onClose={() => setViewEmployee(null)}
            onReinvite={handleReinvite}
            onDelete={handleDeleteEmployee}
            onRefresh={fetchEmployees}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ━━━ Employee Detail Modal ━━━
const EmployeeDetailModal = ({ employee, onClose, onReinvite, onDelete, onRefresh }) => {
  const [detail, setDetail] = useState(employee);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [reinviting, setReinviting] = useState(false);

  useEffect(() => {
    loadDetail();
  }, [employee._id]);

  const loadDetail = async () => {
    setIsLoadingDetail(true);
    try {
      const { data } = await usersAPI.get(employee._id);
      setDetail(data.data);
    } catch {
      setDetail(employee);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const inviteStatus = getInviteStatus(detail);
  const timeLeft = getTimeRemaining(detail.inviteExpiresAt);
  const statusConfig = getStatusConfig(detail);
  const canReinvite = inviteStatus === 'expired' || detail.status === 'expired';
  const invitePending = inviteStatus === 'pending';

  const handleReinviteClick = async () => {
    setReinviting(true);
    try {
      await usersAPI.reinvite(detail._id);
      toast.success(`Re-invitation sent to ${detail.email}`);
      await loadDetail();
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to re-invite');
    } finally {
      setReinviting(false);
    }
  };

  const skills = detail.progress?.skills || {};

  return (
    <Modal isOpen={true} onClose={onClose} title="" size="lg">
      {isLoadingDetail ? (
        <div className="flex items-center justify-center py-16">
          <Loader size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start gap-5">
            <Avatar
              name={detail.profile?.firstName
                ? `${detail.profile.firstName} ${detail.profile.lastName || ''}`
                : detail.email
              }
              size="xl"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {detail.profile?.firstName
                  ? `${detail.profile.firstName} ${detail.profile.lastName || ''}`
                  : detail.email?.split('@')[0]
                }
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-0.5">{detail.email}</p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                <Badge variant="default">{detail.role || 'employee'}</Badge>
              </div>
            </div>
          </div>

          {/* Invite Status Banner */}
          {invitePending && timeLeft && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-800">Invitation Pending</p>
                <p className="text-xs text-amber-600 mt-0.5">Invite expires in <strong>{timeLeft}</strong>. The user hasn't accepted yet.</p>
              </div>
            </div>
          )}
          {canReinvite && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-rose-800">Invitation Expired</p>
                <p className="text-xs text-rose-600 mt-0.5">The 48-hour invite window has passed. You can re-invite this user.</p>
              </div>
              <button
                onClick={handleReinviteClick}
                disabled={reinviting}
                className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${reinviting ? 'animate-spin' : ''}`} />
                {reinviting ? 'Sending...' : 'Re-invite'}
              </button>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <InfoItem icon={Mail} label="Email" value={detail.email} />
            <InfoItem icon={Building2} label="Department" value={detail.profile?.department || 'Unassigned'} />
            <InfoItem icon={Briefcase} label="Position" value={detail.profile?.position || 'Not set'} />
            <InfoItem icon={Shield} label="Role" value={detail.role ? detail.role.charAt(0).toUpperCase() + detail.role.slice(1) : 'Employee'} />
            <InfoItem icon={Calendar} label="Joined" value={detail.createdAt ? new Date(detail.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'} />
            <InfoItem icon={Clock} label="Last Active" value={detail.progress?.lastActiveAt ? new Date(detail.progress.lastActiveAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Never'} />
          </div>

          {/* Skills Progress */}
          {detail.status === 'active' && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Training Progress</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <SkillBar label="Pronunciation" value={skills.pronunciation || 0} color="primary" />
                <SkillBar label="Fluency" value={skills.fluency || 0} color="emerald" />
                <SkillBar label="Grammar" value={skills.grammar || 0} color="amber" />
                <SkillBar label="Pitch" value={skills.pitch || 0} color="violet" />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-5">
                <MiniStat label="Phrases Practiced" value={detail.progress?.totalPhrasesPracticed || 0} />
                <MiniStat label="Time (min)" value={detail.progress?.totalTimeMinutes || 0} />
                <MiniStat label="Current Streak" value={`${detail.progress?.currentStreak || 0}d`} />
              </div>
            </div>
          )}

          {/* Assigned Topics */}
          {detail.assignedTopics?.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Assigned Topics</h3>
              <div className="flex flex-wrap gap-2">
                {detail.assignedTopics.map((topic) => (
                  <span
                    key={topic._id || topic}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 text-xs font-bold border border-primary-100"
                  >
                    {topic.name || topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => { onDelete(detail); onClose(); }}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove Member
            </button>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

// ─── Sub-components ───
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-slate-400" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
    </div>
  </div>
);

const SkillBar = ({ label, value, color = 'primary' }) => {
  const colors = {
    primary: 'bg-primary-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    violet: 'bg-violet-500'
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-slate-600">{label}</span>
        <span className="text-xs font-bold text-slate-900">{value}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colors[color]} transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
};

const MiniStat = ({ label, value }) => (
  <div className="text-center p-3 bg-slate-50 rounded-xl">
    <p className="text-lg font-bold text-slate-900">{value}</p>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
  </div>
);

// ━━━ Add Employee Modal ━━━
const AddEmployeeModal = ({ onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    department: '',
    role: 'employee'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await usersAPI.create(formData);
      toast.success('Employee invited successfully');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to add employee');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Add New Member"
      description="Invite a new team member to start their Japanese training."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="name@company.com"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            placeholder="John"
          />
          <Input
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            placeholder="Doe"
          />
        </div>

        <Input
          label="Department"
          value={formData.department}
          onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
          placeholder="e.g. Engineering"
        />

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Role
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 mt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            isLoading={isLoading}
            leftIcon={<Send className="w-4 h-4" />}
            size="sm"
          >
            Send Invitation
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default Employees;
