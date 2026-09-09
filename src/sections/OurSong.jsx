import { motion } from 'framer-motion';
import MusicPlayer from '../components/MusicPlayer';
import { siteConfig } from '../data/siteConfig';

export default function OurSong() {
  return (
    <div className="relative py-20 px-6 flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #3E0020 0%, #6B1A2A 50%, #3E0020 100%)' }}>

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(194,24,91,0.2) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-sm w-full mx-auto text-center">
        <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.3em] font-ui mb-3 text-[#F8BBD9]/60">
          our song
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="font-serif text-white mb-10"
          style={{ fontSize: 'clamp(1.8rem, 6vw, 2.8rem)' }}>
          The one that reminds me of you
        </motion.h2>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="relative rounded-3xl p-6 border border-white/10"
          style={{ background: 'rgba(253,251,247,0.07)', backdropFilter: 'blur(20px)' }}>
          <MusicPlayer
            src={siteConfig.ourSong}
            title={siteConfig.ourSongTitle}
            artist={siteConfig.ourSongArtist}
          />
        </motion.div>

        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-sm font-cormorant italic text-[#F8BBD9]/60">
          Add your song to /public/media/music/our-song.mp3
        </motion.p>
      </div>
    </div>
  );
}
