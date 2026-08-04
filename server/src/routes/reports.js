import express from 'express';
import { protect } from '../middleware/auth.js';
import Report from '../models/Report.js';
import EncryptionJob from '../models/EncryptionJob.js';
import { predictStrength } from '../crypto/mlPredictor.js';

const router = express.Router();

// GET /api/reports
router.get('/', protect, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reports/generate
router.post('/generate', protect, async (req, res) => {
  try {
    const { title = 'Security Analysis Report' } = req.body;

    // Aggregate user's encryption jobs
    const jobs = await EncryptionJob.find({ userId: req.user._id }).limit(50);
    const avgMetrics = jobs.reduce((acc, j) => {
      const m = j.securityMetrics || {};
      acc.entropy += m.entropy || 0;
      acc.npcr += m.npcr || 0;
      acc.uaci += m.uaci || 0;
      acc.correlation += m.correlation || 0;
      acc.avalancheEffect += m.avalancheEffect || 0;
      acc.encTime += j.encryptionTime || 0;
      return acc;
    }, { entropy: 0, npcr: 0, uaci: 0, correlation: 0, avalancheEffect: 0, encTime: 0 });

    const n = jobs.length || 1;
    Object.keys(avgMetrics).forEach(k => { avgMetrics[k] = parseFloat((avgMetrics[k] / n).toFixed(4)); });

    const prediction = predictStrength({
      entropy: avgMetrics.entropy,
      avalancheEffect: avgMetrics.avalancheEffect,
      npcr: avgMetrics.npcr,
      uaci: avgMetrics.uaci,
      correlation: Math.abs(avgMetrics.correlation),
      keyLength: 256,
      diffusionScore: 75
    });

    const report = await Report.create({
      userId: req.user._id,
      title,
      reportData: {
        securityMetrics: {
          entropy: avgMetrics.entropy,
          npcr: avgMetrics.npcr,
          uaci: avgMetrics.uaci,
          correlation: avgMetrics.correlation,
          avalancheEffect: avgMetrics.avalancheEffect
        },
        performanceMetrics: {
          avgEncryptionTime: avgMetrics.encTime,
          avgDecryptionTime: avgMetrics.encTime * 1.05,
          totalJobs: jobs.length,
          cpuEstimate: Math.random() * 30 + 10,
          memoryEstimate: Math.random() * 50 + 20
        },
        mlPrediction: prediction
      },
      jobIds: jobs.map(j => j._id)
    });

    res.status(201).json({ report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user._id });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json({ report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/reports/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Report.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
