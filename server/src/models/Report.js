import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'Security Analysis Report'
  },
  reportData: {
    securityMetrics: {
      entropy: Number,
      npcr: Number,
      uaci: Number,
      correlation: Number,
      avalancheEffect: Number
    },
    performanceMetrics: {
      avgEncryptionTime: Number,
      avgDecryptionTime: Number,
      totalJobs: Number,
      cpuEstimate: Number,
      memoryEstimate: Number
    },
    comparisonData: mongoose.Schema.Types.Mixed,
    mlPrediction: mongoose.Schema.Types.Mixed
  },
  jobIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EncryptionJob'
  }],
  exportedFiles: [{
    format: String,
    path: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);
