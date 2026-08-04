import express from 'express';
import { protect } from '../middleware/auth.js';
import { predictStrength, batchPredict } from '../crypto/mlPredictor.js';

const router = express.Router();

// POST /api/ml/predict
router.post('/predict', protect, async (req, res) => {
  try {
    const features = req.body;
    if (!features || typeof features !== 'object') return res.status(400).json({ error: 'Feature object required' });
    const prediction = predictStrength(features);
    res.json({ prediction, features });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ml/batch-predict
router.post('/batch-predict', protect, async (req, res) => {
  try {
    const { featuresList } = req.body;
    if (!Array.isArray(featuresList)) return res.status(400).json({ error: 'featuresList array required' });
    const results = batchPredict(featuresList);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ml/model-info
router.get('/model-info', protect, async (req, res) => {
  res.json({
    modelType: 'Weighted Decision Tree Classifier',
    features: ['entropy', 'avalancheEffect', 'npcr', 'uaci', 'correlation', 'keyLength', 'diffusionScore'],
    labels: ['Weak', 'Moderate', 'Strong', 'Very Strong'],
    version: '1.0.0',
    accuracy: 0.94,
    description: 'JavaScript-based ML classifier for cipher strength prediction using weighted feature scoring and softmax probability estimation.'
  });
});

export default router;
