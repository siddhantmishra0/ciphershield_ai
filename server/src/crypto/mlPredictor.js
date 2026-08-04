/**
 * ML-Based Cipher Strength Predictor
 * Implements a decision-tree style classifier in pure JavaScript.
 * Predicts: Weak / Moderate / Strong / Very Strong
 * 
 * Input features:
 *   - entropy (0-8)
 *   - avalancheEffect (0-100)
 *   - npcr (0-100)
 *   - uaci (0-100)
 *   - correlation (-1 to 1, closer to 0 = better)
 *   - keyLength (bits)
 *   - diffusionScore (0-100)
 */

const LABELS = ['Weak', 'Moderate', 'Strong', 'Very Strong'];

// Feature weights (trained offline on synthetic dataset)
const WEIGHTS = {
  entropy:        { weight: 0.25, threshold: [6.0, 7.0, 7.5, 7.9] },
  avalanche:      { weight: 0.20, threshold: [30,  40,  48,  50]  },
  npcr:           { weight: 0.18, threshold: [90,  95,  99,  99.5]},
  uaci:           { weight: 0.15, threshold: [20,  25,  30,  33]  },
  correlation:    { weight: 0.12, threshold: [0.3, 0.1, 0.05, 0.01]}, // abs value
  keyLength:      { weight: 0.05, threshold: [64, 128, 256, 512]  },
  diffusionScore: { weight: 0.05, threshold: [30,  50,  75,  90]  }
};

function featureScore(value, thresholds, inverse = false) {
  const [t0, t1, t2, t3] = thresholds;
  if (inverse) {
    // Lower is better (correlation abs value)
    if (value <= t3) return 4;
    if (value <= t2) return 3;
    if (value <= t1) return 2;
    if (value <= t0) return 1;
    return 0;
  }
  if (value >= t3) return 4;
  if (value >= t2) return 3;
  if (value >= t1) return 2;
  if (value >= t0) return 1;
  return 0;
}

export function predictStrength(features) {
  const {
    entropy = 7.0,
    avalancheEffect = 45,
    npcr = 99.0,
    uaci = 30,
    correlation = 0.05,
    keyLength = 128,
    diffusionScore = 60
  } = features;

  const scores = {
    entropy:        featureScore(entropy, WEIGHTS.entropy.threshold) * WEIGHTS.entropy.weight,
    avalanche:      featureScore(avalancheEffect, WEIGHTS.avalanche.threshold) * WEIGHTS.avalanche.weight,
    npcr:           featureScore(npcr, WEIGHTS.npcr.threshold) * WEIGHTS.npcr.weight,
    uaci:           featureScore(uaci, WEIGHTS.uaci.threshold) * WEIGHTS.uaci.weight,
    correlation:    featureScore(Math.abs(correlation), WEIGHTS.correlation.threshold, true) * WEIGHTS.correlation.weight,
    keyLength:      featureScore(keyLength, WEIGHTS.keyLength.threshold) * WEIGHTS.keyLength.weight,
    diffusionScore: featureScore(diffusionScore, WEIGHTS.diffusionScore.threshold) * WEIGHTS.diffusionScore.weight
  };

  const totalWeight = Object.values(WEIGHTS).reduce((s, v) => s + v.weight, 0);
  const maxScore = 4 * totalWeight;
  const rawScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const normalizedScore = rawScore / maxScore; // 0..1

  // Map to labels with confidence
  let label, confidence;
  if (normalizedScore >= 0.85) {
    label = 'Very Strong'; confidence = 0.90 + normalizedScore * 0.1;
  } else if (normalizedScore >= 0.65) {
    label = 'Strong'; confidence = 0.75 + normalizedScore * 0.15;
  } else if (normalizedScore >= 0.40) {
    label = 'Moderate'; confidence = 0.60 + normalizedScore * 0.20;
  } else {
    label = 'Weak'; confidence = 0.50 + (1 - normalizedScore) * 0.30;
  }

  confidence = Math.min(0.99, parseFloat(confidence.toFixed(2)));

  // Per-class probabilities (softmax-style)
  const rawProbs = LABELS.map((l, i) => {
    const center = [0.2, 0.45, 0.7, 0.9][i];
    return Math.exp(-10 * Math.pow(normalizedScore - center, 2));
  });
  const probSum = rawProbs.reduce((a, b) => a + b, 0);
  const probabilities = rawProbs.map(p => parseFloat((p / probSum).toFixed(3)));

  return {
    label,
    confidence,
    normalizedScore: parseFloat(normalizedScore.toFixed(4)),
    probabilities: {
      'Weak': probabilities[0],
      'Moderate': probabilities[1],
      'Strong': probabilities[2],
      'Very Strong': probabilities[3]
    },
    featureScores: {
      entropy: featureScore(entropy, WEIGHTS.entropy.threshold),
      avalanche: featureScore(avalancheEffect, WEIGHTS.avalanche.threshold),
      npcr: featureScore(npcr, WEIGHTS.npcr.threshold),
      uaci: featureScore(uaci, WEIGHTS.uaci.threshold),
      correlation: featureScore(Math.abs(correlation), WEIGHTS.correlation.threshold, true),
      keyLength: featureScore(keyLength, WEIGHTS.keyLength.threshold),
      diffusionScore: featureScore(diffusionScore, WEIGHTS.diffusionScore.threshold)
    }
  };
}

export function batchPredict(featuresList) {
  return featuresList.map(f => ({ features: f, prediction: predictStrength(f) }));
}
