import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Copy, Download, Settings, Zap, Activity, Clock, CheckCircle, AlertCircle, Loader2, ChevronDown } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import MetricCard from '../components/MetricCard';
import StrengthMeter from '../components/StrengthMeter';
import api from '../lib/api';
import { useEncryptionStore } from '../store/encryptionStore';

const MATRIX_SIZES = [2, 3, 4, 8, 16, 32, 64];
const ROUNDS = [2, 4, 8, 16];

export default function TextEncryptPage() {
  const { masterKey, setMasterKey, matrixSize, setMatrixSize, rounds, setRounds } = useEncryptionStore();
  const [mode, setMode] = useState('encrypt');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [keyMeta, setKeyMeta] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleEncrypt = async () => {
    if (!input.trim() || !masterKey) { setError('Enter text and master key'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/encrypt/text', { plaintext: input, masterKey, matrixSize, rounds });
      setOutput(data.ciphertext);
      setKeyMeta(data.keyMetadata);
      setMetrics({ entropy: data.entropy, encTime: data.encryptionTime, prediction: data.prediction, diffusion: data.diffusion });
    } catch (err) { setError(err.response?.data?.error || 'Encryption failed'); }
    finally { setLoading(false); }
  };

  const handleDecrypt = async () => {
    if (!input.trim() || !masterKey || !keyMeta) { setError('Enter ciphertext, master key, and ensure key metadata is loaded'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/encrypt/decrypt-text', { ciphertext: input, masterKey, keyMetadata: keyMeta });
      setOutput(data.plaintext);
    } catch (err) { setError(err.response?.data?.error || 'Decryption failed'); }
    finally { setLoading(false); }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify({ output, keyMetadata: keyMeta, metrics }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `ciphershield_${mode}_${Date.now()}.json`; a.click();
  };

  const switchMode = (m) => {
    setMode(m); setInput(output); setOutput(''); setError('');
    if (m === 'decrypt' && !keyMeta) setError('⚠️ Load key metadata to decrypt');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Lock size={28} className="text-emerald-400" />
            Text Encryption
          </h1>
          <p className="text-gray-400 mt-1">Enhanced Dynamic Hill Cipher with SPN diffusion</p>
        </div>
        {/* Mode Toggle */}
        <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
          {['encrypt', 'decrypt'].map(m => (
            <button key={m} onClick={() => switchMode(m)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${mode === m ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-gray-400 hover:text-white'}`}>
              {m === 'encrypt' ? <Lock size={14} className="inline mr-1.5" /> : <Unlock size={14} className="inline mr-1.5" />}
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
        {/* Main Encryption Panel */}
        <div className="xl:col-span-2 space-y-4">
          {/* Key + Settings */}
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center gap-2"><Settings size={16} className="text-emerald-400" /> Configuration</h3>
              <button onClick={() => setShowSettings(!showSettings)} className="text-gray-400 hover:text-white text-xs flex items-center gap-1">
                Advanced <ChevronDown size={14} className={`transition-transform ${showSettings ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2 font-mono uppercase">Master Key</label>
              <input type="password" value={masterKey} onChange={e => setMasterKey(e.target.value)} className="input-cyber" placeholder="Enter your secret master key..." />
            </div>
            <AnimatePresence>
              {showSettings && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="grid grid-cols-2 gap-4 overflow-hidden">
                  <div>
                    <label className="block text-xs text-gray-400 mb-2 font-mono uppercase">Matrix Size</label>
                    <select value={matrixSize} onChange={e => setMatrixSize(Number(e.target.value))} className="input-cyber">
                      {MATRIX_SIZES.map(s => <option key={s} value={s}>{s}×{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-2 font-mono uppercase">SPN Rounds</label>
                    <select value={rounds} onChange={e => setRounds(Number(e.target.value))} className="input-cyber">
                      {ROUNDS.map(r => <option key={r} value={r}>{r} rounds</option>)}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>

          {/* Input */}
          <GlassCard className="p-5">
            <label className="block text-xs text-gray-400 mb-2 font-mono uppercase">
              {mode === 'encrypt' ? 'Plaintext Input' : 'Ciphertext Input (hex)'}
            </label>
            <textarea
              rows={7}
              value={input}
              onChange={e => setInput(e.target.value)}
              className="input-cyber resize-none font-mono text-sm"
              placeholder={mode === 'encrypt' ? 'Enter text to encrypt...' : 'Paste ciphertext (hex string) here...'}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{input.length} characters</span>
              <button onClick={() => setInput('')} className="text-gray-600 hover:text-gray-400">Clear</button>
            </div>
          </GlassCard>

          {/* Encrypt Button */}
          <button
            onClick={mode === 'encrypt' ? handleEncrypt : handleDecrypt}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4"
          >
            {loading ? <><Loader2 size={20} className="animate-spin" />Processing...</> :
              mode === 'encrypt' ? <><Zap size={20} />Encrypt Text</> : <><Unlock size={20} />Decrypt Text</>}
          </button>

          {/* Output */}
          {output && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard className="p-5 border-emerald-500/20">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs text-emerald-400 font-mono uppercase flex items-center gap-2">
                    <CheckCircle size={14} />{mode === 'encrypt' ? 'Ciphertext (Hex)' : 'Decrypted Plaintext'}
                  </label>
                  <div className="flex gap-2">
                    <button onClick={handleCopy} className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5">
                      {copied ? <CheckCircle size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button onClick={handleDownload} className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5">
                      <Download size={14} />Export
                    </button>
                  </div>
                </div>
                <div className="bg-black/40 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <p className="font-mono text-sm text-emerald-300 break-all">{output}</p>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>

        {/* Metrics Sidebar */}
        <div className="space-y-4">
          {/* Key Info */}
          {keyMeta && (
            <GlassCard className="p-5">
              <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <Lock size={14} className="text-emerald-400" />Key Metadata
              </h3>
              <div className="space-y-2 font-mono text-xs">
                {[
                  ['Matrix', `${keyMeta.matrixSize}×${keyMeta.matrixSize}`],
                  ['Rounds', keyMeta.rounds],
                  ['Key Bits', `${keyMeta.keyLength} bits`],
                  ['Hash', keyMeta.masterKeyHash],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-gray-400">
                    <span>{k}:</span>
                    <span className="text-emerald-300 truncate ml-2 max-w-[120px]">{v}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Metrics */}
          {metrics && (
            <>
              <MetricCard title="Entropy" value={metrics.entropy?.toFixed(3)} unit="/8.0" icon={Activity} color="cyan"
                subtitle="Shannon entropy" trend={parseFloat(metrics.entropy) - 8.0} />
              <MetricCard title="Enc Time" value={metrics.encTime} unit="ms" icon={Clock} color="purple" subtitle="Processing time" />
              {metrics.prediction && (
                <GlassCard className="p-5">
                  <h3 className="text-white font-semibold text-sm mb-3">ML Strength Prediction</h3>
                  <StrengthMeter label={metrics.prediction.label} confidence={metrics.prediction.confidence} />
                  <div className="mt-3 space-y-1">
                    {Object.entries(metrics.prediction.probabilities || {}).map(([lbl, prob]) => (
                      <div key={lbl} className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400 w-20">{lbl}</span>
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500/60 rounded-full" style={{ width: `${prob * 100}%` }} />
                        </div>
                        <span className="text-gray-500 w-10 text-right">{(prob * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </>
          )}

          {!metrics && (
            <GlassCard className="p-5 text-center">
              <Lock size={36} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Metrics will appear after encryption</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
