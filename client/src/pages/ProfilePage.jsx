import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Mail, Shield, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [msg, setMsg] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [error, setError] = useState('');
  const [pwdError, setPwdError] = useState('');

  const saveProfile = async () => {
    setSaving(true); setMsg(''); setError('');
    try {
      const { data } = await api.put('/auth/profile', { name });
      updateUser(data.user);
      setMsg('Profile updated successfully!');
    } catch (err) { setError(err.response?.data?.error || 'Failed to update profile'); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (pwd.newPwd !== pwd.confirm) { setPwdError('Passwords do not match'); return; }
    setSavingPwd(true); setPwdMsg(''); setPwdError('');
    try {
      await api.put('/auth/change-password', { currentPassword: pwd.current, newPassword: pwd.newPwd });
      setPwdMsg('Password changed successfully!');
      setPwd({ current: '', newPwd: '', confirm: '' });
    } catch (err) { setPwdError(err.response?.data?.error || 'Failed to change password'); }
    finally { setSavingPwd(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <User size={28} className="text-emerald-400" />Profile
        </h1>
        <p className="text-gray-400 mt-1">Manage your account settings</p>
      </div>

      {/* Avatar + Info */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-black">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block font-mono ${user?.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
              {user?.role?.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            ['Total Encryptions', user?.totalEncryptions || 0],
            ['Member Since', new Date(user?.createdAt || Date.now()).toLocaleDateString()],
            ['Last Login', user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'],
          ].map(([k, v]) => (
            <div key={k} className="glass rounded-xl p-4 text-center">
              <p className="text-white text-xl font-bold">{v}</p>
              <p className="text-gray-400 text-xs mt-1">{k}</p>
            </div>
          ))}
        </div>

        {/* Edit Name */}
        {error && <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-3"><AlertCircle size={14} />{error}</div>}
        {msg && <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-3"><CheckCircle size={14} />{msg}</div>}
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-2 font-mono uppercase">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={name} onChange={e => setName(e.target.value)} className="input-cyber pl-10" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2 font-mono uppercase">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={user?.email} disabled className="input-cyber pl-10 opacity-50 cursor-not-allowed" />
            </div>
          </div>
          <button onClick={saveProfile} disabled={saving} className="btn-primary flex items-center gap-2 py-2.5 px-6">
            {saving ? <><Loader2 size={16} className="animate-spin" />Saving...</> : <><Save size={16} />Save Changes</>}
          </button>
        </div>
      </GlassCard>

      {/* Password */}
      <GlassCard className="p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Lock size={18} className="text-cyan-400" />Change Password
        </h3>
        {pwdError && <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-3"><AlertCircle size={14} />{pwdError}</div>}
        {pwdMsg && <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-3"><CheckCircle size={14} />{pwdMsg}</div>}
        <div className="space-y-3">
          {[['Current Password', 'current'], ['New Password', 'newPwd'], ['Confirm New Password', 'confirm']].map(([label, field]) => (
            <div key={field}>
              <label className="block text-xs text-gray-400 mb-2 font-mono uppercase">{label}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="password" value={pwd[field]} onChange={e => setPwd(p => ({ ...p, [field]: e.target.value }))} className="input-cyber pl-10" placeholder="••••••••" />
              </div>
            </div>
          ))}
          <button onClick={changePassword} disabled={savingPwd}
            className="btn-ghost flex items-center gap-2 py-2.5 px-6 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
            {savingPwd ? <><Loader2 size={16} className="animate-spin" />Updating...</> : <><Shield size={16} />Update Password</>}
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
