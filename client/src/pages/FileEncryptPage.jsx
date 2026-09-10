import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Download, Shield, Loader2, CheckCircle, AlertCircle, X, Lock, Unlock } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import MetricCard from '../components/MetricCard';
import StrengthMeter from '../components/StrengthMeter';
import api from '../lib/api';
import { useEncryptionStore } from '../store/encryptionStore';

export default function FileEncryptPage() {
  const { masterKey, setMasterKey, matrixSize, setMatrixSize, rounds, setRounds } = useEncryptionStore();
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('encrypt');
  const [result, setResult] = useState(null);
  const [decInput, setDecInput] = useState(null); // for decrypt: { encryptedData, keyMetadata }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f); setResult(null); setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleEncrypt = async () => {
    if (!file || !masterKey) { setError('Select a file and enter master key'); return; }
    setLoading(true); setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('masterKey', masterKey);
      formData.append('matrixSize', matrixSize);
      formData.append('rounds', rounds);
      const { data } = await api.post('/encrypt/file', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(data);
    } catch (err) { setError(err.response?.data?.error || 'Encryption failed'); }
    finally { setLoading(false); }
  };

  const handleDecrypt = async () => {
    if (!decInput || !masterKey) { setError('Encrypt a file first to get the encrypted data, then decrypt'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/encrypt/decrypt-file', { encryptedData: decInput.encryptedData, masterKey, keyMetadata: decInput.keyMetadata });
      const bytes = atob(data.decryptedData);
      const arr = new Uint8Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
      const blob = new Blob([arr]);
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = `decrypted_${file?.name || 'file'}`; a.click();
      setError('');
    } catch (err) { setError(err.response?.data?.error || 'Decryption failed'); }
    finally { setLoading(false); }
  };

  const downloadEncrypted = () => {
    if (!result) return;
    const bytes = atob(result.encryptedData);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    const blob = new Blob([arr]);
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `encrypted_${result.originalName}`; a.click();
    // Store for later decryption
    setDecInput({ encryptedData: result.encryptedData, keyMetadata: result.keyMetadata });
  };

  const downloadKeyMetadata = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify({ keyMetadata: result.keyMetadata, originalName: result.originalName }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `key_metadata_${Date.now()}.json`; a.click();
  };

  const fmt = (bytes) => bytes < 1024 ? `${bytes}B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)}KB` : `${(bytes / 1048576).toFixed(2)}MB`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileText size={28} className="text-cyan-400" />File Encryption
          </h1>
          <p className="text-gray-400 mt-1">Encrypt TXT, PDF, DOCX files with the Hill Cipher engine</p>
        </div>
        <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
          {['encrypt', 'decrypt'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${mode === m ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-white'}`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={16} />{error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          {/* Config */}
          <GlassCard className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-xs text-gray-400 mb-2 font-mono uppercase">Master Key</label>
                <input type="password" value={masterKey} onChange={e => setMasterKey(e.target.value)} className="input-cyber" placeholder="Secret key..." />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 font-mono uppercase">Matrix Size</label>
                <select value={matrixSize} onChange={e => setMatrixSize(Number(e.target.value))} className="input-cyber">
                  {[2,3,4,8,16,32,64].map(s => <option key={s} value={s}>{s}×{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 font-mono uppercase">Rounds</label>
                <select value={rounds} onChange={e => setRounds(Number(e.target.value))} className="input-cyber">
                  {[2,4,8,16].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </GlassCard>

          {/* File Drop Zone */}
          <GlassCard
            className={`p-8 border-2 border-dashed transition-all duration-300 text-center cursor-pointer ${dragOver ? 'border-cyan-400 bg-cyan-500/5' : 'border-white/10 hover:border-cyan-500/30'}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".txt,.pdf,.docx,.doc" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            {file ? (
              <div className="flex items-center justify-center gap-4">
                <FileText size={36} className="text-cyan-400" />
                <div className="text-left">
                  <p className="text-white font-semibold">{file.name}</p>
                  <p className="text-gray-400 text-sm">{fmt(file.size)}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); setFile(null); setResult(null); }} className="text-gray-500 hover:text-red-400 ml-4">
                  <X size={20} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={44} className="text-gray-500 mx-auto mb-4" />
                <p className="text-white font-semibold mb-1">Drop file here or click to browse</p>
                <p className="text-gray-400 text-sm">Supports TXT, PDF, DOCX (max 10MB)</p>
              </>
            )}
          </GlassCard>

          {/* Action Button */}
          <button
            onClick={mode === 'encrypt' ? handleEncrypt : handleDecrypt}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4"
            style={{ background: mode === 'encrypt' ? undefined : 'linear-gradient(135deg,#0ea5e9,#6366f1)' }}
          >
            {loading ? <><Loader2 size={20} className="animate-spin" />Processing...</> :
              mode === 'encrypt' ? <><Shield size={20} />Encrypt File</> : <><Unlock size={20} />Decrypt & Download</>}
          </button>

          {/* Result */}
          {result && mode === 'encrypt' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard className="p-5 border-cyan-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle size={20} className="text-emerald-400" />
                  <h3 className="text-white font-semibold">Encryption Complete!</h3>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                  {[
                    ['Original', fmt(result.originalSize)],
                    ['Encrypted', fmt(result.encryptedSize)],
                    ['Enc Time', `${result.encryptionTime}ms`],
                  ].map(([l, v]) => (
                    <div key={l} className="glass rounded-lg p-3">
                      <p className="text-gray-400 text-xs">{l}</p>
                      <p className="text-white font-mono font-semibold mt-1">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={downloadEncrypted} className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm">
                    <Download size={16} />Download Encrypted
                  </button>
                  <button onClick={downloadKeyMetadata} className="btn-ghost flex-1 flex items-center justify-center gap-2 py-2.5 text-sm">
                    <Download size={16} />Key Metadata
                  </button>
                </div>
                <p className="text-yellow-400/80 text-xs mt-3 text-center">⚠️ Save key metadata to decrypt later</p>
              </GlassCard>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {result ? (
            <>
              <MetricCard title="Entropy" value={result.entropy?.toFixed(3)} unit="/8.0" icon={Shield} color="cyan" />
              {result.prediction && (
                <GlassCard className="p-5">
                  <h3 className="text-white font-semibold text-sm mb-3">Cipher Strength</h3>
                  <StrengthMeter label={result.prediction.label} confidence={result.prediction.confidence} />
                </GlassCard>
              )}
              <GlassCard className="p-5">
                <h3 className="text-white font-semibold text-sm mb-3">Diffusion Stats</h3>
                <div className="space-y-2 text-sm">
                  {[
                    ['Branch Number', result.diffusion?.branchNumber],
                    ['Diffusion Rate', `${result.diffusion?.diffusionRate}%`],
                    ['Round Efficiency', `${result.diffusion?.roundEfficiency}%`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-gray-400">{k}</span>
                      <span className="text-emerald-400 font-mono">{v}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </>
          ) : (
            <GlassCard className="p-8 text-center">
              <FileText size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Upload and encrypt a file to see security metrics</p>
            </GlassCard>
          )}

          {/* Supported formats */}
          <GlassCard className="p-5">
            <h3 className="text-white font-semibold text-sm mb-3">Supported Formats</h3>
            {['.txt', '.pdf', '.docx', '.doc'].map(f => (
              <div key={f} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
                <CheckCircle size={14} className="text-emerald-400" />
                <span className="text-gray-300 text-sm font-mono">{f}</span>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
