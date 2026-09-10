import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Image, Upload, Download, Shield, Loader2, CheckCircle, AlertCircle, X, BarChart3, Lock, Unlock, FileJson } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import MetricCard from '../components/MetricCard';
import StrengthMeter from '../components/StrengthMeter';
import { HistogramChart } from '../components/CipherChart';
import api from '../lib/api';
import { useEncryptionStore } from '../store/encryptionStore';

const MATRIX_SIZES = [2, 3, 4, 8, 16, 32, 64];

export default function ImageEncryptPage() {
  const { masterKey, setMasterKey, matrixSize, setMatrixSize, rounds, setRounds } = useEncryptionStore();
  const [mode, setMode] = useState('encrypt');

  // Encrypt state
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);

  // Decrypt state
  const [decFile, setDecFile] = useState(null);
  const [decKeyMeta, setDecKeyMeta] = useState(null);
  const [decResult, setDecResult] = useState(null);
  const [decPreview, setDecPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();
  const decFileRef = useRef();
  const decKeyRef = useRef();

  // ── Encrypt helpers ─────────────────────────────────────────
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

  const downloadKeyMetadata = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify({ keyMetadata: result.keyMetadata, originalName: result.originalName }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `image_key_metadata_${Date.now()}.json`; a.click();
  };

  // ── Decrypt helpers ─────────────────────────────────────────
  const handleDecFile = (f) => {
    if (!f) return;
    setDecFile(f); setDecResult(null); setDecPreview(null); setError('');
  };

  const handleDecKeyFile = (f) => {
    if (!f) { setError('Select a key metadata JSON file'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target.result);
        setDecKeyMeta(parsed.keyMetadata || parsed);
        setError('');
      } catch { setError('Invalid key metadata JSON file'); }
    };
    reader.readAsText(f);
  };

  const handleDecrypt = async () => {
    if (!decFile || !masterKey) { setError('Select encrypted image file and enter master key'); return; }
    if (!decKeyMeta) { setError('Load key metadata JSON file to decrypt'); return; }
    setLoading(true); setError('');
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const bytes = new Uint8Array(e.target.result);
          let binary = '';
          const CHUNK = 8192;
          for (let i = 0; i < bytes.length; i += CHUNK) {
            binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
          }
          const base64 = btoa(binary);
          const { data } = await api.post('/encrypt/decrypt-image', {
            encryptedData: base64,
            masterKey,
            keyMetadata: decKeyMeta,
          });
          setDecResult(data);
          // Try rendering as image
          const imgBlob = new Blob([Uint8Array.from(atob(data.decryptedData), c => c.charCodeAt(0))]);
          const url = URL.createObjectURL(imgBlob);
          setDecPreview(url);
        } catch (err) {
          setError(err.response?.data?.error || 'Image decryption failed');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(decFile);
    } catch (err) {
      setError('Failed to read file');
      setLoading(false);
    }
  };

  const downloadDecrypted = () => {
    if (!decResult) return;
    const bytes = atob(decResult.decryptedData);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    const blob = new Blob([arr]);
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `decrypted_image_${Date.now()}.png`; a.click();
  };

  const switchMode = (m) => {
    setMode(m); setError('');
    if (m === 'encrypt') { setDecResult(null); setDecPreview(null); }
    else { setResult(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Image size={28} className="text-purple-400" />Image Encryption
          </h1>
          <p className="text-gray-400 mt-1">Pixel-level Hill Cipher encryption with entropy and correlation analysis</p>
        </div>
        {/* Mode Toggle */}
        <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
          {['encrypt', 'decrypt'].map(m => (
            <button key={m} onClick={() => switchMode(m)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${mode === m ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:text-white'}`}>
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

      {/* Config */}
      <GlassCard className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-xs text-gray-400 mb-2 font-mono uppercase">Master Key</label>
            <input type="password" value={masterKey} onChange={e => setMasterKey(e.target.value)} className="input-cyber" placeholder="Secret key..." />
          </div>
          {mode === 'encrypt' && (
            <>
              <div>
                <label className="block text-xs text-gray-400 mb-2 font-mono uppercase">Matrix Size</label>
                <select value={matrixSize} onChange={e => setMatrixSize(Number(e.target.value))} className="input-cyber">
                  {MATRIX_SIZES.map(s => <option key={s} value={s}>{s}×{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 font-mono uppercase">SPN Rounds</label>
                <select value={rounds} onChange={e => setRounds(Number(e.target.value))} className="input-cyber">
                  {[2,4,8,16].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </>
          )}
          {mode === 'decrypt' && (
            <div className="md:col-span-2 flex items-end">
              <p className="text-gray-500 text-xs font-mono">Matrix size & rounds are read from the key metadata file</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* ══ ENCRYPT MODE ══════════════════════════════════════════ */}
      {mode === 'encrypt' && (
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
                {/* Download buttons */}
                <GlassCard className="p-4">
                  <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                    <BarChart3 size={16} className="text-purple-400" />Encrypted Output
                  </h3>
                  <div className="bg-black/40 rounded-lg p-3 text-center mb-3">
                    <div className="w-full h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded flex items-center justify-center">
                      <p className="text-gray-400 text-xs font-mono">Binary encrypted data<br />{result.encryptedSize} bytes</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={downloadEncrypted} className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm">
                      <Download size={16} />Download Encrypted
                    </button>
                    <button onClick={downloadKeyMetadata} className="btn-ghost flex-1 flex items-center justify-center gap-2 py-2.5 text-sm">
                      <FileJson size={16} />Key Metadata
                    </button>
                  </div>
                  <p className="text-yellow-400/80 text-xs mt-3 text-center">⚠️ Save key metadata JSON to decrypt later</p>
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
                      ['Matrix Size', `${result.keyMetadata?.matrixSize}×${result.keyMetadata?.matrixSize}`],
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
      )}

      {/* ══ DECRYPT MODE ══════════════════════════════════════════ */}
      {mode === 'decrypt' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            {/* Encrypted file drop */}
            <GlassCard
              className={`p-8 border-2 border-dashed transition-all duration-300 text-center cursor-pointer ${dragOver ? 'border-purple-400 bg-purple-500/5' : 'border-white/10 hover:border-purple-500/30'}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleDecFile(e.dataTransfer.files[0]); }}
              onClick={() => decFileRef.current?.click()}
            >
              <input ref={decFileRef} type="file" className="hidden" onChange={e => handleDecFile(e.target.files[0])} />
              {decFile ? (
                <div className="flex items-center justify-center gap-4">
                  <Lock size={36} className="text-purple-400" />
                  <div className="text-left">
                    <p className="text-white font-semibold">{decFile.name}</p>
                    <p className="text-gray-400 text-sm">{(decFile.size / 1024).toFixed(1)}KB — encrypted image</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setDecFile(null); setDecResult(null); setDecPreview(null); }}
                    className="text-gray-500 hover:text-red-400 ml-4">
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={44} className="text-gray-500 mx-auto mb-4" />
                  <p className="text-white font-semibold mb-1">Drop encrypted image file here or click</p>
                  <p className="text-gray-400 text-sm">The file downloaded after encryption</p>
                </>
              )}
            </GlassCard>

            {/* Key metadata upload */}
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  <FileJson size={16} className="text-purple-400" />Key Metadata
                </h3>
                {decKeyMeta && <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle size={12} />Loaded</span>}
              </div>
              {decKeyMeta ? (
                <div className="space-y-1.5 font-mono text-xs">
                  {[
                    ['Matrix', `${decKeyMeta.matrixSize}×${decKeyMeta.matrixSize}`],
                    ['Rounds', decKeyMeta.rounds],
                    ['Key Bits', `${decKeyMeta.keyLength} bits`],
                    ['Hash', decKeyMeta.masterKeyHash],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-gray-400">
                      <span>{k}:</span>
                      <span className="text-purple-300 truncate ml-2 max-w-[160px]">{v}</span>
                    </div>
                  ))}
                  <button onClick={() => { setDecKeyMeta(null); setError(''); }}
                    className="text-xs text-red-400 hover:text-red-300 mt-2">Clear metadata</button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-400 text-xs mb-3">Upload the <code className="bg-white/10 px-1 rounded">image_key_metadata_*.json</code> file saved during encryption</p>
                  <button onClick={() => decKeyRef.current?.click()}
                    className="btn-ghost w-full flex items-center justify-center gap-2 py-2.5 text-sm">
                    <FileJson size={16} />Load Key Metadata JSON
                  </button>
                  <input ref={decKeyRef} type="file" accept=".json" className="hidden" onChange={e => handleDecKeyFile(e.target.files[0])} />
                </div>
              )}
            </GlassCard>

            <button onClick={handleDecrypt} disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              {loading ? <><Loader2 size={20} className="animate-spin" />Decrypting...</> : <><Unlock size={20} />Decrypt Image</>}
            </button>
          </div>

          {/* Decrypt result */}
          <div className="space-y-4">
            {decResult ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <GlassCard className="p-4 border-emerald-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle size={20} className="text-emerald-400" />
                    <h3 className="text-white font-semibold">Decryption Successful!</h3>
                  </div>
                  {decPreview && (
                    <div className="mb-4 bg-black/40 rounded-lg p-3 text-center">
                      <img src={decPreview} alt="Decrypted" className="max-h-52 mx-auto rounded-lg object-contain"
                        onError={() => setDecPreview(null)} />
                      <p className="text-gray-400 text-xs mt-2">Decrypted Image Preview</p>
                    </div>
                  )}
                  {!decPreview && (
                    <div className="mb-4 bg-black/40 rounded-lg p-4 text-center">
                      <p className="text-gray-400 text-xs font-mono">Decrypted data ready — {(decResult.size / 1024).toFixed(1)}KB</p>
                    </div>
                  )}
                  <div className="space-y-2 text-xs font-mono mb-4">
                    {[
                      ['Decryption Time', `${decResult.decryptionTime}ms`],
                      ['Recovered Size', `${(decResult.size / 1024).toFixed(1)}KB`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-1 border-b border-white/5 last:border-0">
                        <span className="text-gray-400">{k}</span>
                        <span className="text-emerald-400">{v}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={downloadDecrypted} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-sm">
                    <Download size={16} />Download Decrypted Image
                  </button>
                </GlassCard>
              </motion.div>
            ) : (
              <GlassCard className="p-12 text-center">
                <Unlock size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Upload the encrypted image file and key metadata to decrypt</p>
                <p className="text-gray-600 text-xs font-mono">Master key + Key metadata JSON required</p>
              </GlassCard>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
