import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const STRENGTH_CONFIG = {
  'Weak': { color: 'text-red-400', bg: 'bg-red-500', width: '25%', label: 'Weak' },
  'Moderate': { color: 'text-yellow-400', bg: 'bg-yellow-500', width: '50%', label: 'Moderate' },
  'Strong': { color: 'text-blue-400', bg: 'bg-blue-500', width: '75%', label: 'Strong' },
  'Very Strong': { color: 'text-emerald-400', bg: 'bg-emerald-500', width: '100%', label: 'Very Strong' },
};

export default function StrengthMeter({ label = 'Very Strong', confidence = 0.95 }) {
  const config = STRENGTH_CONFIG[label] || STRENGTH_CONFIG['Strong'];
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 font-mono">CIPHER STRENGTH</span>
        <span className={cn('text-sm font-bold', config.color)}>{config.label}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', config.bg)}
          initial={{ width: 0 }}
          animate={{ width: config.width }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Weak</span>
        <span className={config.color}>{Math.round(confidence * 100)}% confidence</span>
        <span>Very Strong</span>
      </div>
    </div>
  );
}
