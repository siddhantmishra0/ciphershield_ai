import crypto from 'crypto';

// ============================================================
// CONSTANTS & S-BOXES
// ============================================================

// Modulo for arithmetic (256 ensures exact mapping to bytes)
const PRIME_MOD = 256;

// High Byte S-Box (256 entries, non-linear permutation)
const SBOX_HIGH = (() => {
  const box = new Uint8Array(256);
  // AES-inspired S-box construction using affine transformation
  const inv = new Uint8Array(256);
  inv[0] = 0;
  let p = 1, q = 1;
  for (let i = 0; i < 255; i++) {
    p = p ^ (p << 1) ^ (p & 0x80 ? 0x1B : 0);
    p &= 0xFF;
    q ^= q << 1; q ^= q << 2; q ^= q << 4;
    q ^= q & 0x80 ? 0x09 : 0;
    q &= 0xFF;
    inv[p] = q;
  }
  for (let i = 0; i < 256; i++) {
    const x = inv[i];
    const s = x ^ rotl8(x, 1) ^ rotl8(x, 2) ^ rotl8(x, 3) ^ rotl8(x, 4);
    box[i] = (s ^ 0x63) & 0xFF;
  }
  return box;
})();

// Low Byte S-Box (inverted and shifted variant)
const SBOX_LOW = (() => {
  const box = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    box[i] = (SBOX_HIGH[(i * 137 + 89) & 0xFF] ^ 0xA5) & 0xFF;
  }
  return box;
})();

// Inverse S-boxes
const INV_SBOX_HIGH = invertSBox(SBOX_HIGH);
const INV_SBOX_LOW = invertSBox(SBOX_LOW);

function rotl8(x, n) {
  return ((x << n) | (x >>> (8 - n))) & 0xFF;
}

function invertSBox(sbox) {
  const inv = new Uint8Array(256);
  for (let i = 0; i < 256; i++) inv[sbox[i]] = i;
  return inv;
}

// ============================================================
// MODULAR ARITHMETIC
// ============================================================

function modMul(a, b, mod) {
  return ((a % mod) * (b % mod)) % mod;
}

function modAdd(a, b, mod) {
  return (a + b) % mod;
}

// Extended GCD for modular inverse
function extGCD(a, b) {
  if (a === 0) return [b, 0, 1];
  const [g, x1, y1] = extGCD(b % a, a);
  return [g, y1 - Math.floor(b / a) * x1, x1];
}

function modInverse(a, mod) {
  const [g, x] = extGCD(((a % mod) + mod) % mod, mod);
  if (g !== 1) return null; // not invertible
  return ((x % mod) + mod) % mod;
}

// ============================================================
// MATRIX OPERATIONS (mod PRIME_MOD)
// ============================================================

function matMul(A, B, n, mod) {
  const C = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      for (let k = 0; k < n; k++)
        C[i][j] = (C[i][j] + A[i][k] * B[k][j]) % mod;
  return C;
}

function matVecMul(A, v, n, mod) {
  return A.map(row => row.reduce((s, a, j) => (s + a * v[j]) % mod, 0));
}

function matDet(A, n, mod) {
  // Gaussian elimination to compute determinant mod prime
  const M = A.map(r => [...r]);
  let det = 1;
  for (let col = 0; col < n; col++) {
    let pivotRow = -1;
    for (let row = col; row < n; row++) {
      // For mod 256, a pivot is invertible if and only if it is odd
      if (M[row][col] % 2 !== 0) { pivotRow = row; break; }
    }
    if (pivotRow === -1) return 0;
    if (pivotRow !== col) {
      [M[col], M[pivotRow]] = [M[pivotRow], M[col]];
      det = (mod - det) % mod;
    }
    det = modMul(det, M[col][col], mod);
    const invPivot = modInverse(M[col][col], mod);
    for (let row = col + 1; row < n; row++) {
      const factor = modMul(M[row][col], invPivot, mod);
      for (let k = col; k < n; k++) {
        M[row][k] = (M[row][k] - modMul(factor, M[col][k], mod) + mod) % mod;
      }
    }
  }
  return det;
}

function matInverse(A, n, mod) {
  // Augmented Gauss-Jordan elimination
  const M = A.map((r, i) => {
    const aug = new Array(2 * n).fill(0);
    r.forEach((v, j) => { aug[j] = ((v % mod) + mod) % mod; });
    aug[n + i] = 1;
    return aug;
  });
  for (let col = 0; col < n; col++) {
    let pivotRow = -1;
    for (let row = col; row < n; row++) {
      // For mod 256, a pivot is invertible if and only if it is odd
      if (M[row][col] % 2 !== 0) { pivotRow = row; break; }
    }
    if (pivotRow === -1) return null;
    [M[col], M[pivotRow]] = [M[pivotRow], M[col]];
    const invPivot = modInverse(M[col][col], mod);
    for (let k = 0; k < 2 * n; k++) M[col][k] = modMul(M[col][k], invPivot, mod);
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = M[row][col];
      for (let k = 0; k < 2 * n; k++) {
        M[row][k] = (M[row][k] - modMul(factor, M[col][k], mod) + mod) % mod;
      }
    }
  }
  return M.map(row => row.slice(n));
}

// ============================================================
// DYNAMIC KEY GENERATION
// ============================================================

function generateDynamicKey(masterKey, matrixSize = 4, timestamp = Date.now(), nonce = null, salt = null) {
  if (!nonce) nonce = crypto.randomBytes(16).toString('hex');
  if (!salt) salt = crypto.randomBytes(16).toString('hex');

  const combined = `${masterKey}:${timestamp}:${nonce}:${salt}`;
  const hash = crypto.createHash('sha512').update(combined).digest('hex');

  // Try to build an invertible matrix using hash bytes
  const n = matrixSize;
  let matrix = null;
  let attempt = 0;
  
  const maxOffset = (hash.length / 2) - (n * n);

  while (!matrix && attempt < 20) {
    const offset = maxOffset > 0 ? (attempt * n * n) % maxOffset : 0;
    const candidate = [];
    for (let i = 0; i < n; i++) {
      const row = [];
      for (let j = 0; j < n; j++) {
        const byteVal = parseInt(hash.slice((offset + i * n + j) * 2, (offset + i * n + j) * 2 + 2), 16);
        row.push((byteVal % (PRIME_MOD - 1)) + 1); // 1..256
      }
      candidate.push(row);
    }
    // Ensure invertibility
    const det = matDet(candidate, n, PRIME_MOD);
    if (det !== 0 && modInverse(det, PRIME_MOD) !== null) {
      matrix = candidate;
    }
    attempt++;
  }

  // Fallback: identity-ish matrix
  if (!matrix) {
    matrix = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => i === j ? (parseInt(hash.slice(i * 2, i * 2 + 2), 16) % 254 + 2) : (i + j + 1) % PRIME_MOD)
    );
  }

  const inverseMatrix = matInverse(matrix, n, PRIME_MOD);

  return {
    matrix,
    inverseMatrix: inverseMatrix || matrix,
    nonce,
    salt,
    timestamp,
    masterKeyHash: crypto.createHash('sha256').update(masterKey).digest('hex').slice(0, 16),
    keyLength: n * n * 8 // bits
  };
}

// ============================================================
// DUAL S-BOX SUBSTITUTION
// ============================================================

function applyDualSBox(byte) {
  let b = SBOX_LOW[byte & 0xFF];
  b = ((b >> 4) & 0x0F) | ((b & 0x0F) << 4);
  return SBOX_HIGH[b];
}

function applyInvDualSBox(byte) {
  // Reverse: try all inputs to find the one that maps to byte
  for (let i = 0; i < 256; i++) {
    if (applyDualSBox(i) === byte) return i;
  }
  return byte;
}

// Precompute inverse dual S-box for performance
const DUAL_SBOX = new Uint8Array(256).map((_, i) => applyDualSBox(i));
const INV_DUAL_SBOX = new Uint8Array(256);
for (let i = 0; i < 256; i++) INV_DUAL_SBOX[DUAL_SBOX[i]] = i;

// ============================================================
// PERMUTATION LAYER
// ============================================================

function buildPermutation(n, seed) {
  const perm = Array.from({ length: n }, (_, i) => i);
  // Fisher-Yates shuffle with deterministic seed
  const seedBuf = crypto.createHash('sha256').update(String(seed)).digest();
  for (let i = n - 1; i > 0; i--) {
    const j = seedBuf[i % 32] % (i + 1);
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  return perm;
}

function applyPermutation(bytes, perm) {
  const out = new Uint8Array(bytes.length);
  const pLen = perm.length;
  for (let i = 0; i < bytes.length; i++) {
    const blockStart = Math.floor(i / pLen) * pLen;
    if (blockStart + pLen <= bytes.length) {
      out[blockStart + perm[i % pLen]] = bytes[i];
    } else {
      out[i] = bytes[i]; // Leave partial block unpermuted to avoid out-of-bounds
    }
  }
  return out;
}

function invertPermutation(perm) {
  const inv = new Array(perm.length);
  for (let i = 0; i < perm.length; i++) inv[perm[i]] = i;
  return inv;
}

// ============================================================
// SPN ROUND FUNCTION
// ============================================================

function spnRound(block, matrix, n, perm, roundNum, encrypt) {
  let data = new Uint8Array(block);

  if (encrypt) {
    // 1. Substitution
    data = data.map(b => DUAL_SBOX[b]);
    // 2. Permutation
    data = applyPermutation(data, perm);
    // 3. Matrix transformation
    const chunks = Math.ceil(data.length / n);
    const out = new Uint8Array(data.length);
    for (let c = 0; c < chunks; c++) {
      const vec = Array.from(data.slice(c * n, c * n + n));
      while (vec.length < n) vec.push(roundNum % PRIME_MOD);
      const result = matVecMul(matrix, vec, n, PRIME_MOD);
      for (let i = 0; i < n && c * n + i < out.length; i++) {
        out[c * n + i] = result[i] & 0xFF;
      }
    }
    data = out;
    // 4. Mixing (byte rotation)
    const shifted = new Uint8Array(data.length);
    const shift = roundNum % data.length || 1;
    for (let i = 0; i < data.length; i++) {
      shifted[(i + shift) % data.length] = data[i];
    }
    data = shifted;
  } else {
    // Reverse order
    // 4. Unmix
    const shift = roundNum % data.length || 1;
    const unshifted = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      unshifted[i] = data[(i + shift) % data.length];
    }
    data = unshifted;
    // 3. Inverse matrix transformation
    const invMatrix = matInverse(matrix, n, PRIME_MOD) || matrix;
    const chunks = Math.ceil(data.length / n);
    const out = new Uint8Array(data.length);
    for (let c = 0; c < chunks; c++) {
      const vec = Array.from(data.slice(c * n, c * n + n));
      while (vec.length < n) vec.push(roundNum % PRIME_MOD);
      const result = matVecMul(invMatrix, vec, n, PRIME_MOD);
      for (let i = 0; i < n && c * n + i < out.length; i++) {
        out[c * n + i] = result[i] & 0xFF;
      }
    }
    data = out;
    // 2. Inverse permutation
    data = applyPermutation(data, invertPermutation(perm));
    // 1. Inverse substitution
    data = data.map(b => INV_DUAL_SBOX[b]);
  }

  return data;
}

// ============================================================
// MAIN ENCRYPT / DECRYPT
// ============================================================

function encryptBytes(plainBytes, keyData, rounds = 4) {
  const { matrix, nonce, timestamp } = keyData;
  const n = matrix.length;
  const perm = buildPermutation(Math.max(n * 2, 16), nonce + timestamp);
  const roundCount = rounds;

  // Pad to multiple of n
  const padLen = n - (plainBytes.length % n);
  const padded = new Uint8Array(plainBytes.length + padLen);
  padded.set(plainBytes);
  padded[plainBytes.length] = 0x80;
  for (let i = 1; i < padLen; i++) padded[plainBytes.length + i] = 0;

  // Store original length in first 4 bytes prepended
  const lenBuf = new Uint8Array(4);
  new DataView(lenBuf.buffer).setUint32(0, plainBytes.length, false);

  let data = new Uint8Array([...lenBuf, ...padded]);

  for (let r = 0; r < roundCount; r++) {
    data = spnRound(data, matrix, n, perm, r + 1, true);
  }

  return data;
}

function decryptBytes(cipherBytes, keyData, rounds = 4) {
  const { matrix, nonce, timestamp } = keyData;
  const n = matrix.length;
  const perm = buildPermutation(Math.max(n * 2, 16), nonce + timestamp);

  let data = new Uint8Array(cipherBytes);

  for (let r = rounds - 1; r >= 0; r--) {
    data = spnRound(data, matrix, n, perm, r + 1, false);
  }

  // Extract original length
  const view = new DataView(data.buffer);
  const origLen = view.getUint32(0, false);
  return data.slice(4, 4 + origLen);
}

// ============================================================
// TEXT ENCRYPT / DECRYPT (returns hex string)
// ============================================================

function encryptText(plaintext, masterKey, options = {}) {
  const { matrixSize = 4, rounds = 4, timestamp = Date.now(), nonce, salt } = options;
  const keyData = generateDynamicKey(masterKey, matrixSize, timestamp, nonce, salt);
  const bytes = Buffer.from(plaintext, 'utf8');
  const start = Date.now();
  const encrypted = encryptBytes(bytes, keyData, rounds);
  const encTime = Date.now() - start;

  return {
    ciphertext: Buffer.from(encrypted).toString('hex'),
    keyMetadata: {
      nonce: keyData.nonce,
      salt: keyData.salt,
      timestamp: keyData.timestamp,
      masterKeyHash: keyData.masterKeyHash,
      keyLength: keyData.keyLength,
      matrixSize,
      rounds
    },
    encryptionTime: encTime,
    originalLength: bytes.length
  };
}

function decryptText(cipherhex, masterKey, keyMetadata) {
  const { nonce, salt, timestamp, matrixSize = 4, rounds = 4 } = keyMetadata;
  const keyData = generateDynamicKey(masterKey, matrixSize, timestamp, nonce, salt);
  const cipherBytes = Buffer.from(cipherhex, 'hex');
  const start = Date.now();
  const decrypted = decryptBytes(cipherBytes, keyData, rounds);
  const decTime = Date.now() - start;

  return {
    plaintext: Buffer.from(decrypted).toString('utf8'),
    decryptionTime: decTime
  };
}

// ============================================================
// BUFFER ENCRYPT / DECRYPT (for files and images)
// ============================================================

function encryptBuffer(inputBuffer, masterKey, options = {}) {
  const { matrixSize = 4, rounds = 4, timestamp = Date.now(), nonce, salt } = options;
  const keyData = generateDynamicKey(masterKey, matrixSize, timestamp, nonce, salt);
  const bytes = new Uint8Array(inputBuffer);
  const start = Date.now();
  const encrypted = encryptBytes(bytes, keyData, rounds);
  const encTime = Date.now() - start;

  return {
    encryptedBuffer: Buffer.from(encrypted),
    keyMetadata: {
      nonce: keyData.nonce,
      salt: keyData.salt,
      timestamp: keyData.timestamp,
      masterKeyHash: keyData.masterKeyHash,
      keyLength: keyData.keyLength,
      matrixSize,
      rounds
    },
    encryptionTime: encTime
  };
}

function decryptBuffer(encryptedBuffer, masterKey, keyMetadata) {
  const { nonce, salt, timestamp, matrixSize = 4, rounds = 4 } = keyMetadata;
  const keyData = generateDynamicKey(masterKey, matrixSize, timestamp, nonce, salt);
  const start = Date.now();
  const decrypted = decryptBytes(new Uint8Array(encryptedBuffer), keyData, rounds);
  const decTime = Date.now() - start;

  return {
    decryptedBuffer: Buffer.from(decrypted),
    decryptionTime: decTime
  };
}

const counts = new Uint8Array(256);
for(let i=0; i<256; i++) counts[DUAL_SBOX[i]]++;
let missing = 0;
for(let i=0; i<256; i++) if(counts[i] === 0) missing++;
console.log('Missing values: ' + missing);