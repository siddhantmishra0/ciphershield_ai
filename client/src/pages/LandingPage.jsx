import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Zap, Eye, Code, GitBranch, ChevronRight, Star, Globe, Cpu, BarChart3, ArrowRight } from 'lucide-react';
import MatrixBackground from '../components/MatrixBackground';

const FEATURES = [
  { icon: Lock, title: 'Dynamic Hill Cipher', desc: 'Enhanced matrix-based encryption with hash-derived invertible keys, timestamp nonces, and salt-based uniqueness.', color: 'emerald' },
  { icon: Zap, title: 'Dual S-Box Layer', desc: 'Two substitution tables applied before matrix multiplication to introduce non-linearity and prevent linear algebra attacks.', color: 'cyan' },
  { icon: Shield, title: 'SPN Architecture', desc: 'Configurable 2-16 round Substitution-Permutation Network with byte mixing for maximum diffusion.', color: 'purple' },
  { icon: Eye, title: 'Image Encryption', desc: 'Pixel-level encryption with entropy, NPCR, UACI, PSNR analysis and side-by-side histogram comparison.', color: 'blue' },
  { icon: BarChart3, title: 'Security Dashboard', desc: 'Real-time avalanche effect, Shannon entropy, correlation, and key sensitivity analysis with interactive charts.', color: 'yellow' },
  { icon: Cpu, title: 'ML Strength Predictor', desc: 'Classify cipher robustness as Weak/Moderate/Strong/Very Strong with confidence scores using our JS-based ML model.', color: 'red' },
];

const TECH_STACK = ['React', 'Vite', 'Node.js', 'Express', 'MongoDB', 'Framer Motion', 'Recharts', 'Zustand'];

const METRICS = [
  { label: 'Shannon Entropy', value: '7.99', unit: '/8.0', color: 'emerald' },
  { label: 'Avalanche Effect', value: '48.7', unit: '%', color: 'cyan' },
  { label: 'NPCR Score', value: '99.61', unit: '%', color: 'purple' },
  { label: 'UACI Score', value: '33.46', unit: '%', color: 'blue' },
];

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.1 } } },
  item: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <MatrixBackground />

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/5 glass-strong">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Shield size={20} className="text-emerald-400" />
          </div>
          <span className="text-lg font-bold text-white">CipherShield <span className="gradient-text-green-cyan">AI</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          {['Features', 'Architecture', 'Metrics', 'Tech Stack'].map(s => (
            <a key={s} href={`#${s.toLowerCase().replace(' ','-')}`} className="hover:text-emerald-400 transition-colors">{s}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm py-2 px-4">Login</Link>
          <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 min-h-[90vh] flex items-center justify-center text-center px-6 bg-hero-gradient">
        <div className="max-w-4xl">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-6">
              <span className="pulse-dot bg-emerald-400" />
              Enhanced Dynamic Hill Cipher with SPN Architecture
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black mb-6 leading-tight text-balance"
          >
            Next-Gen{' '}
            <span className="gradient-text text-glow-green">Cryptography</span>
            <br />Platform
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 text-balance"
          >
            Encrypt text, files, and images using an Enhanced Hill Cipher with dual S-box layers, SPN diffusion rounds,
            dynamic key generation, and ML-based security analysis — all in one platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register" className="btn-primary flex items-center gap-2 text-base">
              Launch Platform <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-ghost flex items-center gap-2 text-base">
              Sign In <ChevronRight size={18} />
            </Link>
          </motion.div>

          {/* Metrics strip */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
          >
            {METRICS.map((m) => (
              <div key={m.label} className="glass rounded-xl p-4 text-center border border-white/5">
                <p className={`text-2xl font-bold font-mono ${m.color === 'emerald' ? 'text-emerald-400' : m.color === 'cyan' ? 'text-cyan-400' : m.color === 'purple' ? 'text-purple-400' : 'text-blue-400'}`}>
                  {m.value}<span className="text-sm opacity-70">{m.unit}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{m.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-400 font-mono text-sm mb-3">// CORE FEATURES</p>
            <h2 className="text-4xl font-bold text-white">Built for Security Research</h2>
          </div>
          <motion.div
            variants={stagger.container} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map(({ icon: Icon, title, desc, color }) => {
              const colorMap = { emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20', blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20', yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', red: 'text-red-400 bg-red-500/10 border-red-500/20' };
              const [textC, bgC, borderC] = colorMap[color].split(' ');
              return (
                <motion.div key={title} variants={stagger.item} className={`glass rounded-xl p-6 border ${borderC} hover:scale-[1.02] transition-transform duration-300`}>
                  <div className={`w-11 h-11 rounded-lg ${bgC} border ${borderC} flex items-center justify-center mb-4`}>
                    <Icon size={22} className={textC} />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="relative z-10 py-24 px-6 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-cyan-400 font-mono text-sm mb-3">// ENCRYPTION WORKFLOW</p>
            <h2 className="text-4xl font-bold text-white">How It Works</h2>
          </div>
          <div className="flex flex-col md:flex-row items-stretch gap-4">
            {[
              { step: '01', title: 'Key Generation', desc: 'Master key + timestamp + nonce → SHA-512 → invertible matrix mod 257', icon: '🔑' },
              { step: '02', title: 'Dual S-Box', desc: 'High/Low byte substitution tables applied for non-linearity and confusion', icon: '🔀' },
              { step: '03', title: 'Matrix Multiply', desc: 'Hill cipher matrix multiplication with prime modular arithmetic (mod 257)', icon: '⊗' },
              { step: '04', title: 'SPN Rounds', desc: 'N rounds of Sub → Permute → Transform → Mix for maximum diffusion', icon: '🌀' },
              { step: '05', title: 'Analysis', desc: 'Entropy, NPCR, UACI, avalanche effect computed and ML strength predicted', icon: '📊' },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex-1 glass rounded-xl p-5 border border-white/5 relative"
              >
                {i < 4 && (
                  <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-emerald-500/60">
                    <ArrowRight size={16} />
                  </div>
                )}
                <span className="text-3xl mb-3 block">{s.icon}</span>
                <span className="text-emerald-500/60 font-mono text-xs">{s.step}</span>
                <h3 className="text-white font-semibold mt-1 mb-2">{s.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section id="tech-stack" className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-purple-400 font-mono text-sm mb-3">// TECHNOLOGY STACK</p>
          <h2 className="text-4xl font-bold text-white mb-12">Built With Modern Technologies</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {TECH_STACK.map((tech, i) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="px-4 py-2 glass rounded-full border border-white/10 text-sm text-gray-300 hover:border-emerald-500/30 hover:text-emerald-400 transition-all duration-200 cursor-default"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass rounded-2xl p-12 border border-emerald-500/20"
          style={{ boxShadow: '0 0 60px rgba(0,255,128,0.08)' }}
        >
          <Shield size={48} className="text-emerald-400 mx-auto mb-4 animate-float" />
          <h2 className="text-4xl font-bold text-white mb-4">Start Encrypting Today</h2>
          <p className="text-gray-400 mb-8">Research-grade cryptographic tools for your final year project, portfolio, or security research.</p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
            Create Free Account <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Shield size={18} className="text-emerald-400" />
          <span className="text-white font-semibold">CipherShield AI</span>
        </div>
        <p className="text-gray-500 text-sm">Enhanced Dynamic Hill Cipher Platform — B.Tech/MCA Final Year Project</p>
        <p className="text-gray-600 text-xs mt-2">© 2024 CipherShield AI. Built with ❤️ for cryptography research.</p>
      </footer>
    </div>
  );
}
