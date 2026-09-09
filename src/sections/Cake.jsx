import { motion } from 'framer-motion';
import BirthdayCake from '../components/BirthdayCake';

export default function Cake() {
  return (
    <div className="relative py-20 px-6 flex items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #FDFBF7 0%, #F5EFE6 100%)' }}>

      <div className="max-w-sm w-full mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] font-ui mb-3" style={{ color: 'rgba(194,24,91,0.6)' }}>
            make a wish
          </p>
          <h2 className="font-serif mb-2" style={{ fontSize: 'clamp(1.8rem, 6vw, 2.8rem)', color: '#1A0A0F' }}>
            Make a wish, Annuva.
          </h2>
          <p className="text-sm font-ui" style={{ color: 'rgba(26,10,15,0.5)' }}>
            Tap the candles or blow into your mic ✨
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.2 }}>
          <BirthdayCake name="Annuva" />
        </motion.div>
      </div>
    </div>
  );
}
