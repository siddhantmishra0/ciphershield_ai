import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Users, Shield, BarChart3, Activity, Clock, AlertCircle, CheckCircle, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { CipherAreaChart } from '../components/CipherChart';
import api from '../lib/api';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, usersRes, logsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
          api.get('/admin/logs'),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data.users || []);
        setLogs(logsRes.data.logs || []);
      } catch (err) { setError(err.response?.data?.error || 'Failed to load admin data'); }
      finally { setLoading(false); }
    })();
  }, []);

  const toggleUser = async (userId, isActive) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/status`, { isActive: !isActive });
      setUsers(p => p.map(u => u._id === userId ? data.user : u));
    } catch { setError('Failed to update user status'); }
  };

  const setRole = async (userId, role) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/role`, { role });
      setUsers(p => p.map(u => u._id === userId ? data.user : u));
    } catch { setError('Failed to update role'); }
  };

  const areaData = stats?.last7Days?.map(d => ({ name: d._id?.slice(5), encryptions: d.count })) || [];

  const TABS = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'logs', label: 'System Logs', icon: Activity },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Cpu size={28} className="text-purple-400" />Admin Panel
        </h1>
        <p className="text-gray-400 mt-1">System overview, user management, and activity logs</p>
      </div>

      {error && <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"><AlertCircle size={16} />{error}</div>}

      {/* Tab navigation */}
      <div className="flex gap-2 border-b border-white/5 pb-4">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === key ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:text-white'}`}>
            <Icon size={16} />{label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 shimmer rounded-xl" />)}
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-purple-400 bg-purple-500/10' },
                  { label: 'Total Jobs', value: stats?.totalJobs || 0, icon: Shield, color: 'text-emerald-400 bg-emerald-500/10' },
                  { label: 'Total Reports', value: stats?.totalReports || 0, icon: BarChart3, color: 'text-cyan-400 bg-cyan-500/10' },
                  { label: 'Avg Entropy', value: stats?.avgMetrics?.avgEntropy?.toFixed(3) || '—', icon: Activity, color: 'text-blue-400 bg-blue-500/10' },
                ].map(({ label, value, icon: Icon, color }) => {
                  const [text, bg] = color.split(' ');
                  return (
                    <GlassCard key={label} className="p-5">
                      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                        <Icon size={20} className={text} />
                      </div>
                      <p className={`text-2xl font-bold font-mono ${text}`}>{value}</p>
                      <p className="text-gray-400 text-xs mt-1">{label}</p>
                    </GlassCard>
                  );
                })}
              </div>

              {/* Activity Chart */}
              {areaData.length > 0 && (
                <GlassCard className="p-6">
                  <h3 className="text-white font-semibold mb-4">Encryption Activity (Last 7 Days)</h3>
                  <CipherAreaChart data={areaData} areas={[{ key: 'encryptions', color: 'purple', name: 'Encryptions' }]} />
                </GlassCard>
              )}

              {/* Job distribution */}
              {stats?.jobsByType && (
                <div className="grid grid-cols-2 gap-4">
                  <GlassCard className="p-5">
                    <h3 className="text-white font-semibold text-sm mb-3">Jobs by Type</h3>
                    <div className="space-y-2">
                      {stats.jobsByType.map(j => (
                        <div key={j._id} className="flex items-center gap-3">
                          <span className="text-gray-400 text-sm capitalize w-16">{j._id}</span>
                          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(j.count / (stats.totalJobs || 1)) * 100}%` }} />
                          </div>
                          <span className="text-white text-sm font-mono">{j.count}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                  <GlassCard className="p-5">
                    <h3 className="text-white font-semibold text-sm mb-3">System Health</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'API Server', status: true },
                        { label: 'Database', status: true },
                        { label: 'Crypto Engine', status: true },
                        { label: 'ML Predictor', status: true },
                      ].map(({ label, status }) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">{label}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="pulse-dot bg-emerald-400" />
                            <span className="text-emerald-400 text-xs">Online</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <GlassCard className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {['User', 'Email', 'Role', 'Encryptions', 'Joined', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-gray-400 font-mono text-xs uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} className="border-b border-white/5 hover:bg-white/2">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="text-white text-sm">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-xs">{u.email}</td>
                        <td className="py-3 px-4">
                          <select value={u.role} onChange={e => setRole(u._id, e.target.value)}
                            className="bg-transparent border border-white/10 rounded px-2 py-1 text-xs text-gray-300">
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-emerald-400 font-mono text-sm">{u.totalEncryptions || 0}</td>
                        <td className="py-3 px-4 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-0.5 rounded font-mono ${u.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button onClick={() => toggleUser(u._id, u.isActive)} className="text-gray-500 hover:text-white text-xs border border-white/10 px-3 py-1 rounded transition-colors">
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === 'logs' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <GlassCard className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {['User', 'Type', 'Algorithm', 'Enc Time', 'Entropy', 'Strength', 'Date'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-gray-400 font-mono text-xs uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log._id} className="border-b border-white/5 hover:bg-white/2">
                        <td className="py-3 px-4 text-white text-xs">{log.userId?.name || 'N/A'}</td>
                        <td className="py-3 px-4"><span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 capitalize">{log.inputType}</span></td>
                        <td className="py-3 px-4 text-gray-400 text-xs capitalize">{log.algorithm?.replace('_', ' ')}</td>
                        <td className="py-3 px-4 font-mono text-emerald-400 text-xs">{log.encryptionTime}ms</td>
                        <td className="py-3 px-4 font-mono text-cyan-400 text-xs">{log.securityMetrics?.entropy?.toFixed(3)}</td>
                        <td className="py-3 px-4 text-xs font-bold text-emerald-400">{log.securityMetrics?.strengthLabel}</td>
                        <td className="py-3 px-4 text-gray-500 text-xs">{new Date(log.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </GlassCard>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
