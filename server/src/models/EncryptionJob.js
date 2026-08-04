import mongoose from 'mongoose';

const encryptionJobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inputType: {
    type: String,
    enum: ['text', 'file', 'image'],
    required: true
  },
  algorithm: {
    type: String,
    enum: ['hill_cipher', 'enhanced_hill', 'aes128', 'aes256'],
    default: 'enhanced_hill'
  },
  matrixSize: {
    type: Number,
    enum: [2, 3, 4, 8],
    default: 4
  },
  rounds: {
    type: Number,
    enum: [2, 4, 8, 16],
    default: 4
  },
  keyMetadata: {
    keyLength: Number,
    masterKeyHash: String,
    sessionNonce: String,
    salt: String,
    timestamp: Date
  },
  encryptionTime: Number, // in ms
  decryptionTime: Number,
  fileSize: Number, // bytes
  fileName: String,
  securityMetrics: {
    entropy: Number,
    avalancheEffect: Number,
    npcr: Number,
    uaci: Number,
    correlation: Number,
    diffusionScore: Number,
    strengthLabel: String,
    strengthConfidence: Number
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  }
}, { timestamps: true });

export default mongoose.model('EncryptionJob', encryptionJobSchema);
