import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileBarChart, Plus, Download, Trash2, Loader2, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import api from '../lib/api';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [title, setTitle] = useState('Security Analysis Report');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reports');
      setReports(data.reports || []);
    } catch { setError('Failed to load reports'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, []);

  const generateReport = async () => {
    setGenerating(true); setError('');
    try {
      const { data } = await api.post('/reports/generate', { title });
      setReports(p => [data.report, ...p]);
      setSelected(data.report);
    } catch (err) { setError(err.response?.data?.error || 'Failed to generate report'); }
    finally { setGenerating(false); }
  };

  const deleteReport = async (id) => {
    try {
      await api.delete(`/reports/${id}`);
      setReports(p => p.filter(r => r._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch { setError('Failed to delete report'); }
  };

  const exportCSV = (report) => {
    const m = report.reportData?.securityMetrics || {};
    const p = report.reportData?.performanceMetrics || {};
    const rows = [
      ['Metric', 'Value'],
      ['Entropy', m.entropy], ['NPCR', m.npcr], ['UACI', m.uaci],
      ['Correlation', m.correlation], ['Avalanche Effect', m.avalancheEffect],
      ['Avg Enc Time (ms)', p.avgEncryptionTime], ['Total Jobs', p.totalJobs],
      ['Strength', report.reportData?.mlPrediction?.label],
      ['Confidence', report.reportData?.mlPrediction?.confidence],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `report_${report._id}.csv`; a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileBarChart size={28} className="text-red-400" />Reports
          </h1>
          <p className="text-gray-400 mt-1">Generate and export academic-style security analysis reports</p>
        </div>
      </div>

      {error && <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"><AlertCircle size={16} />{error}</div>}

      {/* Generator */}
      <GlassCard className="p-5">
        <div className="flex gap-4 items-end flex-col sm:flex-row">
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-2 font-mono uppercase">Report Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="input-cyber" placeholder="Report title..." />
          </div>
          <button onClick={generateReport} disabled={generating}
            className="btn-primary flex items-center gap-2 py-3 px-6 whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg,#dc2626,#7c3aed)' }}>
            {generating ? <><Loader2 size={18} className="animate-spin" />Generating...</> : <><Plus size={18} />Generate Report</>}
          </button>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report List */}
        <div className="space-y-3">
          <h3 className="text-white font-semibold text-sm">Your Reports ({reports.length})</h3>
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 shimmer rounded-xl" />)}</div>
          ) : reports.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <FileBarChart size={36} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No reports yet. Generate one!</p>
            </GlassCard>
          ) : (
            reports.map(report => (
              <motion.div key={report._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={() => setSelected(report)}
                className={`glass rounded-xl p-4 border cursor-pointer transition-all ${selected?._id === report._id ? 'border-red-500/40 bg-red-500/5' : 'border-white/5 hover:border-white/15'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{report.title}</p>
                    <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                      <Calendar size={11} />{new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteReport(report._id); }} className="text-gray-600 hover:text-red-400 flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Report Detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <motion.div key={selected._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold text-lg">{selected.title}</h3>
                  <button onClick={() => exportCSV(selected)} className="btn-ghost text-sm flex items-center gap-2 py-2 px-4">
                    <Download size={16} />Export CSV
                  </button>
                </div>
                <p className="text-gray-500 text-xs mb-6">Generated: {new Date(selected.createdAt).toLocaleString()}</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {Object.entries(selected.reportData?.securityMetrics || {}).map(([key, val]) => (
                    <div key={key} className="glass rounded-xl p-4 text-center">
                      <p className="text-emerald-400 text-xl font-bold font-mono">{typeof val === 'number' ? val.toFixed(4) : val}</p>
                      <p className="text-gray-400 text-xs mt-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                    </div>
                  ))}
                </div>

                <h4 className="text-white font-semibold mb-3">Performance Metrics</h4>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {Object.entries(selected.reportData?.performanceMetrics || {}).map(([key, val]) => (
                    <div key={key} className="glass rounded-lg p-3">
                      <p className="text-gray-400 text-xs capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-white font-semibold text-sm mt-1 font-mono">{typeof val === 'number' ? val.toFixed(2) : val}</p>
                    </div>
                  ))}
                </div>

                {selected.reportData?.mlPrediction && (
                  <div className="glass rounded-xl p-4 border border-emerald-500/20">
                    <div className="flex items-center gap-3">
                      <CheckCircle size={20} className="text-emerald-400" />
                      <div>
                        <p className="text-white font-semibold">ML Prediction: {selected.reportData.mlPrediction.label}</p>
                        <p className="text-gray-400 text-sm">Confidence: {Math.round((selected.reportData.mlPrediction.confidence || 0) * 100)}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          ) : (
            <GlassCard className="p-12 text-center h-full flex flex-col items-center justify-center">
              <FileBarChart size={48} className="text-gray-600 mb-4" />
              <p className="text-gray-400">Select a report to view details</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
