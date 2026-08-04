import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export default function GlassCard({ children, className, hover = true, glow = false, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'glass rounded-xl',
        hover && 'transition-all duration-300 hover:border-emerald-500/20',
        glow && 'glow-green',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
