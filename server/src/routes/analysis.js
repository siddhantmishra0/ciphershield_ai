import express from 'express';
import { protect } from '../middleware/auth.js';
import { shannonEntropy, avalancheEffect, imageCorrelation, calculateNPCR, calculateUACI, diffusionMetrics, keySensitivity, computeSecurityScore, computeHistogram } from '../crypto/securityAnalysis.js';
import { encryptText } from '../crypto/hillCipher.js';

const router = express.Router();

// POST /api/analysis/entropy
router.post('/entropy', protect, async (req, res) => {
  try {
    const { data } = req.body; // hex string or base64
    if (!data) return res.status(400).json({ error: 'data required' });
    const bytes = Buffer.from(data, 'hex');
    const entropy = shannonEntropy(bytes);
    const histogram = computeHistogram(bytes);
    res.json({ entropy, ideal: 8.0, deviation: parseFloat((8.0 - entropy).toFixed(4)), histogram });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/analysis/avalanche
router.post('/avalanche', protect, async (req, res) => {
  try {
    const { plaintext, masterKey, matrixSize = 4, rounds = 4 } = req.body;
    if (!plaintext || !masterKey) return res.status(400).json({ error: 'plaintext and masterKey required' });

    const result = avalancheEffect(
      (text, key, opts) => encryptText(text, key, opts),
      plaintext, masterKey,
      { matrixSize: parseInt(matrixSize), rounds: parseInt(rounds) }
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/analysis/correlation
router.post('/correlation', protect, async (req, res) => {
  try {
    const { pixelData, width, height } = req.body;
    if (!pixelData || !width || !height) return res.status(400).json({ error: 'pixelData, width, height required' });
    const data = new Uint8Array(Buffer.from(pixelData, 'base64'));
    const correlation = imageCorrelation(data, width, height);
    res.json(correlation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/analysis/diffusion
router.post('/diffusion', protect, async (req, res) => {
  try {
    const { rounds = 4, matrixSize = 4 } = req.body;
    const metrics = diffusionMetrics(parseInt(rounds), parseInt(matrixSize));
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/analysis/key-sensitivity
router.post('/key-sensitivity', protect, async (req, res) => {
  try {
    const { plaintext, masterKey, matrixSize = 4, rounds = 4 } = req.body;
    if (!plaintext || !masterKey) return res.status(400).json({ error: 'plaintext and masterKey required' });
    const result = keySensitivity(
      (text, key, opts) => encryptText(text, key, opts),
      plaintext, masterKey,
      { matrixSize: parseInt(matrixSize), rounds: parseInt(rounds) }
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/analysis/npcr-uaci
router.post('/npcr-uaci', protect, async (req, res) => {
  try {
    const { data1, data2 } = req.body;
    if (!data1 || !data2) return res.status(400).json({ error: 'data1 and data2 required (base64)' });
    const b1 = new Uint8Array(Buffer.from(data1, 'base64'));
    const b2 = new Uint8Array(Buffer.from(data2, 'base64'));
    res.json({
      npcr: calculateNPCR(b1, b2),
      uaci: calculateUACI(b1, b2)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analysis/metrics/:jobId
router.get('/metrics/:jobId', protect, async (req, res) => {
  try {
    const { EncryptionJob } = await import('../models/EncryptionJob.js');
    const job = await EncryptionJob.findOne({ _id: req.params.jobId, userId: req.user._id });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ metrics: job.securityMetrics, job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
