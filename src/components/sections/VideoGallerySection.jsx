import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import MediaVideo from '../common/MediaVideo';
import { Video as VideoIcon, Play, X } from 'lucide-react';

export const VideoGallerySection = () => {
  const [activeVideo, setActiveVideo] = useState(null);
  const videos = siteConfig.videos || [];

  return (
    <section id="videos" className="relative py-24 px-6 bg-gradient-to-b from-[#07050d] via-[#10061e] to-[#07050d]">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs uppercase tracking-widest font-semibold">
            <VideoIcon className="w-3.5 h-3.5 text-purple-400" />
            <span>Video Memories</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
            Our Live Moments
          </h2>
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {videos.map((vid, i) => (
            <motion.div
              key={vid.id || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setActiveVideo(vid)}
              className="glass-panel p-4 rounded-3xl border border-purple-500/20 bg-black/40 cursor-pointer group shadow-2xl"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 border border-white/10">
                <MediaVideo
                  src={vid.src}
                  poster={vid.poster}
                  autoPlay={false}
                  muted={true}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-rose-950/30 transition-colors flex items-center justify-center">
                  <div className="p-4 rounded-full bg-rose-600/90 text-white shadow-xl shadow-rose-950/80 group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-white" />
                  </div>
                </div>
              </div>

              <div className="p-2 space-y-1 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-white group-hover:text-rose-300 transition-colors">
                    {vid.title}
                  </h3>
                  <span className="text-xs font-mono text-purple-300/80">{vid.date}</span>
                </div>
                <p className="text-xs text-slate-300">{vid.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Video Modal Viewer */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-slate-950 border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl p-4"
            >
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-6 right-6 p-3 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors z-30"
              >
                <X className="w-5 h-5" />
              </button>

              <MediaVideo
                src={activeVideo.src}
                poster={activeVideo.poster}
                caption={activeVideo.title}
                autoPlay={true}
                muted={false}
                className="w-full aspect-video rounded-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default VideoGallerySection;
