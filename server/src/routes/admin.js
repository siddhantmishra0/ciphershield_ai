import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import User from '../models/User.js';
import EncryptionJob from '../models/EncryptionJob.js';
import Report from '../models/Report.js';

const router = express.Router();

// GET /api/admin/users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users, total: users.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/users/:id/status
router.put('/users/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobs = await EncryptionJob.countDocuments();
    const totalReports = await Report.countDocuments();

    const jobsByType = await EncryptionJob.aggregate([
      { $group: { _id: '$inputType', count: { $sum: 1 } } }
    ]);
    const jobsByAlgo = await EncryptionJob.aggregate([
      { $group: { _id: '$algorithm', count: { $sum: 1 } } }
    ]);
    const avgMetrics = await EncryptionJob.aggregate([
      { $group: {
        _id: null,
        avgEntropy: { $avg: '$securityMetrics.entropy' },
        avgAvalanche: { $avg: '$securityMetrics.avalancheEffect' },
        avgEncTime: { $avg: '$encryptionTime' }
      }}
    ]);

    // Last 7 days jobs
    const last7Days = await EncryptionJob.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({ totalUsers, totalJobs, totalReports, jobsByType, jobsByAlgo, avgMetrics: avgMetrics[0] || {}, last7Days });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/logs
router.get('/logs', protect, adminOnly, async (req, res) => {
  try {
    const jobs = await EncryptionJob.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ logs: jobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
