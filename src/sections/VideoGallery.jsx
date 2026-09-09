import { motion } from 'framer-motion';
import { siteConfig } from '../data/siteConfig';
import VideoPlayer from '../components/VideoPlayer';

export default function VideoGallery() {
  return (
    <div className="relative py-20 px-6 md:px-10"
      style={{ background: 'linear-gradient(180deg, #FDFBF7 0%, #F5EFE6 100%)' }}>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="text-center mb-14">
        <p className="text-xs uppercase tracking-[0.3em] font-ui mb-3" style={{ color: 'rgba(194,24,91,0.6)' }}>
          some things are better shown than said
        </p>
        <h2 className="font-serif" style={{ fontSize: 'clamp(2rem, 7vw, 3.5rem)', color: '#1A0A0F' }}>
          Our moments
        </h2>
      </motion.div>

      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        {siteConfig.videos.length > 0 ? siteConfig.videos.map((v, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.7, delay: i * 0.1 }}>
            <VideoPlayer src={v.src} poster={v.poster} title={v.title} caption={v.caption} />
          </motion.div>
        )) : (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="rounded-2xl p-10 text-center border border-[#C2185B]/15"
            style={{ background: 'linear-gradient(135deg, #F5EFE6, #FDFBF7)' }}>
            <span className="text-4xl block mb-3">🎬</span>
            <p className="font-serif text-lg text-[#1A0A0F] mb-2">Add your videos</p>
            <p className="text-sm text-[#C2185B]/60 font-ui">Place .mp4 files in /public/media/videos/ and update siteConfig.js</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
