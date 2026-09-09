import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const LINES = [
  { text: 'Annuva...', style: 'serif', size: 'clamp(2rem, 8vw, 3.5rem)', color: '#1A0A0F', delay: 0 },
  { text: 'Ek chhoti si baat bolni thi.', style: 'cormorant', size: 'clamp(1.2rem, 4vw, 1.8rem)', color: '#6B1A2A', delay: 1.2, italic: true },
  { text: 'Tu mere liye sirf ek person nahi hai.', style: 'serif', size: 'clamp(1rem, 3.5vw, 1.5rem)', color: '#1A0A0F', delay: 2.6 },
  { text: 'Tu woh insaan hai jo mere liye bahut baar apni cheezein side mein rakh deti hai.', style: 'ui', size: 'clamp(0.9rem, 3vw, 1.1rem)', color: '#3E0020', delay: 4.2 },
  { text: 'Tu sacrifice karti hai. Compromise karti hai.', style: 'ui', size: 'clamp(0.9rem, 3vw, 1.1rem)', color: '#3E0020', delay: 5.8 },
  { text: 'Bas isliye kyunki tujhe meri khushi matter karti hai.', style: 'cormorant', size: 'clamp(1rem, 3.5vw, 1.3rem)', color: '#C2185B', delay: 7.2, italic: true },
  { text: 'aur main?', style: 'serif', size: 'clamp(1.5rem, 5vw, 2.2rem)', color: '#1A0A0F', delay: 9 },
  { text: 'Main kabhi tujhe tang karta hoon,\nkabhi irritate karta hoon,\nkabhi tera dimaag khaata hoon.', style: 'ui', size: 'clamp(0.85rem, 2.8vw, 1rem)', color: '#6B1A2A', delay: 10.2 },
  { text: 'haan... ye main maanta hoon 😂', style: 'cormorant', size: 'clamp(1rem, 3.5vw, 1.4rem)', color: '#C2185B', delay: 12, italic: true },
  { text: 'But even when I make your days a little harder,\nyou still somehow make my life better.', style: 'serif', size: 'clamp(1rem, 3.5vw, 1.5rem)', color: '#1A0A0F', delay: 13.5 },
];

function Line({ line, startDelay }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setVisible(true), line.delay * 1000);
    return () => clearTimeout(t);
  }, [inView, line.delay]);

  const fontClass = line.style === 'serif' ? 'font-serif' : line.style === 'cormorant' ? 'font-cormorant' : 'font-ui';

  return (
    <div ref={ref}>
      <motion.p
        initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
        animate={visible ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className={`${fontClass} ${line.italic ? 'italic' : ''} leading-relaxed whitespace-pre-line`}
        style={{ fontSize: line.size, color: line.color }}>
        {line.text}
      </motion.p>
    </div>
  );
}

export default function PersonalMessage() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="section-full flex items-center justify-center relative py-20"
      style={{ background: 'linear-gradient(180deg, #FDFBF7 0%, #F5EFE6 50%, #FDFBF7 100%)' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(194,24,91,0.04) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-2xl mx-auto px-6 md:px-10 flex flex-col gap-8">
        {LINES.map((line, i) => (
          <Line key={i} line={line} />
        ))}

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }} whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }} transition={{ duration: 1, delay: 0.3 }}
          className="h-px w-full origin-left"
          style={{ background: 'linear-gradient(90deg, transparent, #C2185B, transparent)' }} />
      </div>
    </div>
  );
}
