import React from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import MediaImage from '../common/MediaImage';
import { Calendar, Sparkles } from 'lucide-react';
import HiddenHeart from '../common/HiddenHeart';

export const TimelineSection = () => {
  const events = siteConfig.timeline || [];

  return (
    <section id="story" className="relative py-24 px-6 bg-gradient-to-b from-[#07050d] via-[#12071f] to-[#07050d]">
      {/* Hidden Heart #4 */}
      <div className="absolute top-12 left-10">
        <HiddenHeart index={4} />
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs uppercase tracking-widest font-semibold">
            <Calendar className="w-3.5 h-3.5 text-rose-400" />
            <span>Our Journey Together</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
            Our Love Story
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto">
            Every chapter with you is my absolute favorite story.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Central Glowing Line (Desktop) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-0.5 bg-gradient-to-b from-rose-500/20 via-rose-500 to-purple-500/20" />
          {/* Mobile Vertical Line */}
          <div className="md:hidden absolute left-4 top-0 bottom-0 w-0.5 bg-rose-500/40" />

          <div className="space-y-12">
            {events.map((event, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={event.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.7, delay: index * 0.1 }}
                  className={`relative flex flex-col ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  } items-center gap-8 pl-10 md:pl-0`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-rose-600 border-4 border-[#07050d] shadow-[0_0_15px_rgba(244,63,94,0.9)] z-10 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  </div>

                  {/* Card Content */}
                  <div className="w-full md:w-1/2">
                    <div className="glass-panel p-6 rounded-2xl border border-rose-500/20 bg-black/40 hover:border-rose-500/40 transition-all duration-300 shadow-xl group">
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <span className="text-xs font-mono font-semibold text-rose-400 uppercase tracking-wider bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                          {event.date}
                        </span>
                        {event.tag && (
                          <span className="text-[11px] text-amber-300/80 flex items-center gap-1 font-medium">
                            <Sparkles className="w-3 h-3" /> {event.tag}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-rose-300 transition-colors">
                        {event.title}
                      </h3>

                      <p className="text-slate-300 text-sm leading-relaxed mb-4">
                        {event.description}
                      </p>

                      {event.image && (
                        <div className="overflow-hidden rounded-xl h-48 border border-white/10">
                          <MediaImage
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Spacer for desktop layout alignment */}
                  <div className="hidden md:block w-1/2" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
