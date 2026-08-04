import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Image, Upload, Download, Shield, Loader2, CheckCircle, AlertCircle, X, BarChart3 } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import MetricCard from '../components/MetricCard';
import StrengthMeter from '../components/StrengthMeter';
import { HistogramChart } from '../components/CipherChart';
import api from '../lib/api';
import { useEncryptionStore } from '../store/encryptionStore';

export default function ImageEncryptPage() {
  const { masterKey, setMasterKey, matrixSize, setMatrixSize, rounds, setRounds } = useEncryptionStore();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) { setError('Please select a valid image file'); return; }
    setFile(f); setResult(null); setError('');
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const handleEncrypt = async () => {
    if (!file || !masterKey) { setError('Select an image and enter master key'); return; }
    setLoading(true); setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('masterKey', masterKey);
      formData.append('matrixSize', matrixSize);
      formData.append('rounds', rounds);
      const { data } = await api.post('/encrypt/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(data);
    } catch (err) { setError(err.response?.data?.error || 'Image encryption failed'); }
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
  };

  const encryptedPreview = result ? `data:image/png;base64,${result.encryptedData.slice(0, 100)}` : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Image size={28} className="text-purple-400" />Image Encryption
        </h1>
        <p className="text-gray-400 mt-1">Pixel-level Hill Cipher encryption with entropy and correlation analysis</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={16} />{error}
        </div>
      )}

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
              {[2,3,4,8].map(s => <option key={s} value={s}>{s}×{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2 font-mono uppercase">SPN Rounds</label>
            <select value={rounds} onChange={e => setRounds(Number(e.target.value))} className="input-cyber">
              {[2,4,8,16].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Upload */}
        <div className="space-y-4">
          <GlassCard
            className={`p-8 border-2 border-dashed transition-all duration-300 text-center cursor-pointer ${dragOver ? 'border-purple-400 bg-purple-500/5' : 'border-white/10 hover:border-purple-500/30'}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept="image/png,image/jpg,image/jpeg" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                <button onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); setResult(null); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-500/80">
                  <X size={14} />
                </button>
                <p className="text-gray-400 text-sm mt-3">{file?.name} ({(file?.size / 1024).toFixed(1)}KB)</p>
              </div>
            ) : (
              <>
                <Upload size={44} className="text-gray-500 mx-auto mb-4" />
                <p className="text-white font-semibold mb-1">Drop image here or click</p>
                <p className="text-gray-400 text-sm">PNG, JPG, JPEG supported</p>
              </>
            )}
          </GlassCard>

          <button onClick={handleEncrypt} disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#3b82f6)' }}>
            {loading ? <><Loader2 size={20} className="animate-spin" />Encrypting...</> : <><Shield size={20} />Encrypt Image</>}
          </button>

          {/* Histograms */}
          {result?.histograms && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <GlassCard className="p-4">
                <HistogramChart data={result.histograms.original} color="cyan" title="ORIGINAL PIXEL DISTRIBUTION" />
              </GlassCard>
              <GlassCard className="p-4">
                <HistogramChart data={result.histograms.encrypted} color="purple" title="ENCRYPTED PIXEL DISTRIBUTION" />
              </GlassCard>
            </motion.div>
          )}
        </div>

        {/* Metrics */}
        <div className="space-y-4">
          {result ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              {/* Image comparison */}
              <GlassCard className="p-4">
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <BarChart3 size={16} className="text-purple-400" />Encrypted Output (Raw)
                </h3>
                <div className="bg-black/40 rounded-lg p-3 text-center">
                  <div className="w-full h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded flex items-center justify-center">
                    <p className="text-gray-400 text-xs font-mono">Binary encrypted data<br />{result.encryptedSize} bytes</p>
                  </div>
                </div>
                <button onClick={downloadEncrypted} className="btn-primary w-full mt-3 flex items-center justify-center gap-2 py-2.5 text-sm">
                  <Download size={16} />Download Encrypted
                </button>
              </GlassCard>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-3">
                <MetricCard title="Entropy" value={result.metrics?.entropy?.toFixed(3)} unit="/8.0" icon={Shield} color="purple" />
                <MetricCard title="NPCR" value={result.metrics?.npcr?.toFixed(2)} unit="%" icon={BarChart3} color="cyan" />
                <MetricCard title="UACI" value={result.metrics?.uaci?.toFixed(2)} unit="%" icon={CheckCircle} color="blue" />
                <MetricCard title="PSNR" value={result.metrics?.psnr} unit="dB" icon={BarChart3} color="yellow" />
              </div>

              {result.prediction && (
                <GlassCard className="p-5">
                  <h3 className="text-white font-semibold text-sm mb-3">ML Security Prediction</h3>
                  <StrengthMeter label={result.prediction.label} confidence={result.prediction.confidence} />
                </GlassCard>
              )}

              <GlassCard className="p-4">
                <h3 className="text-white font-semibold text-sm mb-3">Image Analysis Summary</h3>
                <div className="space-y-2 text-xs font-mono">
                  {[
                    ['Encryption Time', `${result.encryptionTime}ms`],
                    ['Original Size', `${(result.originalSize / 1024).toFixed(1)}KB`],
                    ['Encrypted Size', `${(result.encryptedSize / 1024).toFixed(1)}KB`],
                    ['Diffusion Rate', `${result.diffusion?.diffusionRate}%`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1 border-b border-white/5 last:border-0">
                      <span className="text-gray-400">{k}</span>
                      <span className="text-emerald-400">{v}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            <GlassCard className="p-12 text-center">
              <Image size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Upload and encrypt an image to view pixel analysis, histograms, and security metrics</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
