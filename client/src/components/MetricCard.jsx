import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export default function MetricCard({ title, value, unit, icon: Icon, color = 'emerald', subtitle, trend }) {
  const colors = {
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'rgba(0,255,128,0.2)' },
    cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', glow: 'rgba(0,200,255,0.2)' },
    purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', glow: 'rgba(147,51,234,0.2)' },
    blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', glow: 'rgba(59,130,246,0.2)' },
    yellow: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', glow: 'rgba(234,179,8,0.2)' },
    red: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', glow: 'rgba(239,68,68,0.2)' },
  };

  const c = colors[color] || colors.emerald;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'glass rounded-xl p-5 border',
        c.border
      )}
      style={{ boxShadow: `0 4px 24px ${c.glow}` }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">{title}</p>
        {Icon && (
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', c.bg)}>
            <Icon size={16} className={c.text} />
          </div>
        )}
      </div>
      <div className="flex items-end gap-1">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn('text-3xl font-bold font-mono', c.text)}
        >
          {value}
        </motion.span>
        {unit && <span className="text-sm text-gray-500 mb-1">{unit}</span>}
      </div>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      {trend !== undefined && (
        <div className={cn('text-xs mt-2', trend >= 0 ? 'text-emerald-400' : 'text-red-400')}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% vs ideal
        </div>
      )}
    </motion.div>
  );
}
