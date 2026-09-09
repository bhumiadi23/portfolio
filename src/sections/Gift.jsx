import { motion } from 'framer-motion';
import GiftBox from '../components/GiftBox';
import { siteConfig } from '../data/siteConfig';

export default function Gift() {
  return (
    <div className="relative py-20 px-6 flex items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #F5EFE6 0%, #FDFBF7 100%)' }}>

      <div className="max-w-sm w-full mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] font-ui mb-3" style={{ color: 'rgba(194,24,91,0.6)' }}>
            a surprise
          </p>
          <h2 className="font-serif mb-2" style={{ fontSize: 'clamp(1.8rem, 6vw, 2.8rem)', color: '#1A0A0F' }}>
            Something for you 🎁
          </h2>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.2 }}>
          <GiftBox message={siteConfig.giftBox.message} subtext={siteConfig.giftBox.subtext} />
        </motion.div>
      </div>
    </div>
  );
}
