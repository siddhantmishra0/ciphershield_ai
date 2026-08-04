/**
 * Security Analysis Engine
 * Computes cryptographic quality metrics for the CipherShield AI system.
 */

// ============================================================
// SHANNON ENTROPY
// ============================================================

export function shannonEntropy(data) {
  const bytes = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const freq = new Array(256).fill(0);
  for (const b of bytes) freq[b]++;
  const n = bytes.length;
  let entropy = 0;
  for (let i = 0; i < 256; i++) {
    if (freq[i] === 0) continue;
    const p = freq[i] / n;
    entropy -= p * Math.log2(p);
  }
  return parseFloat(entropy.toFixed(6));
}

export function idealEntropy() {
  return 8.0; // Maximum for 8-bit data
}

// ============================================================
// AVALANCHE EFFECT
// ============================================================

/**
 * Measure avalanche: flip one bit in plaintext, measure % bits changed in ciphertext.
 */
export function avalancheEffect(encryptFn, plaintext, masterKey, options = {}) {
  const original = encryptFn(plaintext, masterKey, options);
  const origBytes = Buffer.from(original.ciphertext, 'hex');

  const results = [];
  const testBits = Math.min(8, plaintext.length); // test first 8 bit positions

  for (let bitPos = 0; bitPos < testBits; bitPos++) {
    const flipped = Buffer.from(plaintext, 'utf8');
    flipped[Math.floor(bitPos / 8)] ^= (1 << (bitPos % 8));
    const modified = encryptFn(flipped.toString('utf8'), masterKey, {
      ...options,
      nonce: original.keyMetadata.nonce,
      salt: original.keyMetadata.salt,
      timestamp: original.keyMetadata.timestamp
    });
    const modBytes = Buffer.from(modified.ciphertext, 'hex');
    const len = Math.min(origBytes.length, modBytes.length);
    let changed = 0;
    for (let i = 0; i < len; i++) {
      let xor = origBytes[i] ^ modBytes[i];
      while (xor) { changed += xor & 1; xor >>= 1; }
    }
    const totalBits = len * 8;
    results.push(parseFloat(((changed / totalBits) * 100).toFixed(2)));
  }

  const avg = results.reduce((a, b) => a + b, 0) / results.length;
  return {
    perBitResults: results,
    average: parseFloat(avg.toFixed(2)),
    ideal: 50.0,
    score: parseFloat(Math.min(100, (avg / 50) * 100).toFixed(2))
  };
}

// ============================================================
// CORRELATION ANALYSIS (for image encryption)
// ============================================================

export function correlationCoefficient(arr1, arr2) {
  const n = Math.min(arr1.length, arr2.length);
  if (n === 0) return 0;
  const mean1 = arr1.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const mean2 = arr2.slice(0, n).reduce((a, b) => a + b, 0) / n;
  let cov = 0, var1 = 0, var2 = 0;
  for (let i = 0; i < n; i++) {
    const d1 = arr1[i] - mean1;
    const d2 = arr2[i] - mean2;
    cov += d1 * d2;
    var1 += d1 * d1;
    var2 += d2 * d2;
  }
  const denom = Math.sqrt(var1 * var2);
  return denom === 0 ? 0 : parseFloat((cov / denom).toFixed(6));
}

export function imageCorrelation(pixelData, width, height, channel = 0, channels = 4) {
  const pairs = { horizontal: [], vertical: [], diagonal: [] };
  const pixel = (x, y) => pixelData[(y * width + x) * channels + channel];

  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      const p = pixel(x, y);
      pairs.horizontal.push([p, pixel(x + 1, y)]);
      pairs.vertical.push([p, pixel(x, y + 1)]);
      pairs.diagonal.push([p, pixel(x + 1, y + 1)]);
    }
  }

  const sample = (arr) => arr.length > 5000 ? arr.filter((_, i) => i % Math.ceil(arr.length / 5000) === 0) : arr;

  const calc = (arr) => {
    const s = sample(arr);
    return correlationCoefficient(s.map(p => p[0]), s.map(p => p[1]));
  };

  return {
    horizontal: calc(pairs.horizontal),
    vertical: calc(pairs.vertical),
    diagonal: calc(pairs.diagonal)
  };
}

// ============================================================
// NPCR & UACI (for image comparison)
// ============================================================

export function calculateNPCR(data1, data2) {
  const len = Math.min(data1.length, data2.length);
  let diff = 0;
  for (let i = 0; i < len; i++) if (data1[i] !== data2[i]) diff++;
  return parseFloat(((diff / len) * 100).toFixed(4));
}

export function calculateUACI(data1, data2) {
  const len = Math.min(data1.length, data2.length);
  let sum = 0;
  for (let i = 0; i < len; i++) sum += Math.abs(data1[i] - data2[i]);
  return parseFloat(((sum / (len * 255)) * 100).toFixed(4));
}

// ============================================================
// PSNR (Peak Signal-to-Noise Ratio)
// ============================================================

export function calculatePSNR(original, encrypted) {
  const len = Math.min(original.length, encrypted.length);
  let mse = 0;
  for (let i = 0; i < len; i++) {
    const diff = original[i] - encrypted[i];
    mse += diff * diff;
  }
  mse /= len;
  if (mse === 0) return Infinity;
  return parseFloat((10 * Math.log10((255 * 255) / mse)).toFixed(2));
}

// ============================================================
// HISTOGRAM
// ============================================================

export function computeHistogram(data) {
  const hist = new Array(256).fill(0);
  for (const b of data) hist[b & 0xFF]++;
  return hist;
}

// ============================================================
// DIFFUSION METRICS
// ============================================================

export function diffusionMetrics(rounds, matrixSize) {
  // Theoretical branch number for Hill cipher matrices
  const branchNumber = matrixSize + 1; // MDS bound
  const diffusionRate = Math.min(100, (rounds / 16) * 100 * (matrixSize / 8));
  const roundEfficiency = Math.min(100, (branchNumber * rounds * 3.125));

  return {
    branchNumber,
    diffusionRate: parseFloat(diffusionRate.toFixed(2)),
    roundEfficiency: parseFloat(roundEfficiency.toFixed(2))
  };
}

// ============================================================
// KEY SENSITIVITY
// ============================================================

export function keySensitivity(encryptFn, plaintext, masterKey, options = {}) {
  const original = encryptFn(plaintext, masterKey, options);
  const origHex = original.ciphertext;

  // Flip one bit in master key
  const keyBuf = Buffer.from(masterKey, 'utf8');
  keyBuf[0] ^= 0x01;
  const modifiedKey = keyBuf.toString('utf8');

  const modified = encryptFn(plaintext, modifiedKey, {
    ...options,
    nonce: original.keyMetadata.nonce,
    salt: original.keyMetadata.salt,
    timestamp: original.keyMetadata.timestamp
  });

  const b1 = Buffer.from(origHex, 'hex');
  const b2 = Buffer.from(modified.ciphertext, 'hex');
  const len = Math.min(b1.length, b2.length);
  let diff = 0;
  for (let i = 0; i < len; i++) diff += b1[i] !== b2[i] ? 1 : 0;

  return {
    percentDifferent: parseFloat(((diff / len) * 100).toFixed(2)),
    isHighSensitivity: (diff / len) > 0.45
  };
}

// ============================================================
// OVERALL SECURITY SCORE
// ============================================================

export function computeSecurityScore(metrics) {
  const { entropy, avalancheEffect, npcr, uaci, correlation } = metrics;

  const entropyScore = Math.min(100, (entropy / 8.0) * 100);
  const avalancheScore = Math.min(100, (avalancheEffect / 50) * 100);
  const npcrScore = Math.min(100, npcr || 99.5);
  const uaciScore = Math.min(100, uaci ? (uaci / 33.5) * 100 : 90);
  const corrScore = Math.max(0, 100 - Math.abs(correlation || 0) * 100);

  const overall = (
    entropyScore * 0.30 +
    avalancheScore * 0.25 +
    npcrScore * 0.20 +
    uaciScore * 0.15 +
    corrScore * 0.10
  );

  return parseFloat(overall.toFixed(2));
}
