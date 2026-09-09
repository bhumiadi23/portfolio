import { motion } from 'framer-motion';
import { siteConfig } from '../data/siteConfig';

export default function LoveLetter() {
  return (
    <div className="relative py-20 px-6 flex items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #3E0020 0%, #6B1A2A 50%, #3E0020 100%)' }}>

      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(194,24,91,0.15) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-2xl w-full mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.3em] font-ui mb-3 text-[#F8BBD9]/50">
            from the heart
          </p>
          <h2 className="font-serif text-white" style={{ fontSize: 'clamp(2rem, 7vw, 3.5rem)' }}>
            A letter for you
          </h2>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.9 }}
          className="rounded-3xl p-8 md:p-12 shadow-2xl border border-white/10"
          style={{
            background: 'rgba(253,251,247,0.06)',
            backdropFilter: 'blur(20px)',
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, rgba(248,187,217,0.08) 27px, rgba(248,187,217,0.08) 28px)',
          }}>
          <pre className="font-cormorant text-base md:text-lg leading-relaxed whitespace-pre-wrap text-[#F8BBD9]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            {siteConfig.loveLetter}
          </pre>
        </motion.div>
      </div>
    </div>
  );
}
