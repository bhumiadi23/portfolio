import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Loader2, Sparkles, AlertCircle, ArrowUp, MailCheck, HeartHandshake } from 'lucide-react';

import confetti from 'canvas-confetti';
import { apologyConfig } from '../data/apologyConfig';
import { sendYesDecisionNotification } from '../services/notificationService';

export default function FinalDecision() {
  const { decision } = apologyConfig;

  // States: 'idle' | 'sending' | 'yes_success' | 'yes_error' | 'not_ready'
  const [decisionState, setDecisionState] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [hasAlreadySent, setHasAlreadySent] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('annuva_yes_notification_sent')) {
      setHasAlreadySent(true);
    }
  }, []);

  // Heart celebration animation for Yes
  const triggerHeartCelebration = () => {
    try {
      // Multiple waves of soft romantic confetti
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.65 },
        colors: ['#BE123C', '#E11D48', '#FB7185', '#F472B6', '#FCE7F3'],
        shapes: ['circle'],
        scalar: 1.2,
      });

      setTimeout(() => {
        confetti({
          particleCount: 35,
          angle: 60,
          spread: 60,
          origin: { x: 0.15, y: 0.65 },
          colors: ['#9F1239', '#F43F5E', '#FDA4AF'],
        });
        confetti({
          particleCount: 35,
          angle: 120,
          spread: 60,
          origin: { x: 0.85, y: 0.65 },
          colors: ['#9F1239', '#F43F5E', '#FDA4AF'],
        });
      }, 250);
    } catch {
      // safe fallback if confetti fails
    }
  };

  // Handler for Button 1: "Yes, let's talk ❤️"
  const handleYesClick = async () => {
    // If already sent or already loading, prevent duplicates
    if (decisionState === 'sending') return;

    if (hasAlreadySent) {
      triggerHeartCelebration();
      setDecisionState('yes_success');
      return;
    }

    setDecisionState('sending');
    setErrorMessage('');

    try {
      const result = await sendYesDecisionNotification();

      if (result.success) {
        triggerHeartCelebration();
        setHasAlreadySent(true);
        setDecisionState('yes_success');
      } else {
        // Notification failed or not configured
        if (result.notConfigured) {
          // If in dev environment and credentials aren't in .env yet
          setErrorMessage(
            'Notification credentials are not yet configured in .env (VITE_EMAILJS_SERVICE_ID). Please check the setup instructions in README.md.'
          );
        } else {
          setErrorMessage(
            result.error || 'Unable to connect to the notification service. Please check your internet connection.'
          );
        }
        setDecisionState('yes_error');
      }
    } catch (err) {
      setErrorMessage(err?.message || 'A network error occurred. Please try again.');
      setDecisionState('yes_error');
    }
  };

  // Handler for Button 2: "Not ready yet 💗"
  const handleNotReadyClick = () => {
    // Strictly no email notification sent
    setDecisionState('not_ready');
  };

  // Scroll back to letter if she wants to read again
  const scrollToLetter = () => {
    const el = document.getElementById('letter-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="decision-section"
      className="relative min-h-[90vh] py-28 px-4 sm:px-6 md:px-8 flex flex-col items-center justify-center text-center overflow-hidden bg-gradient-to-b from-[#FCEEF3] via-[#FAF0F4] to-[#FDFBF7]"
    >
      {/* Soft floating glow elements */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[620px] h-[380px] sm:h-[620px] bg-gradient-to-tr from-pink-300/35 via-rose-200/25 to-amber-100/20 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-2xl mx-auto flex flex-col items-center">
        {/* Glowing floating heart emblem */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 rounded-full bg-rose-400/35 blur-xl animate-soft-pulse" />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FFFDF9] border border-rose-200/90 shadow-xl flex items-center justify-center">
            <Heart className="w-8 h-8 sm:w-9 sm:h-9 text-[#BE123C] fill-[#BE123C] animate-soft-pulse" />
          </div>
        </motion.div>

        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-playfair text-2xl sm:text-3xl md:text-4xl text-[#2D1B28] font-medium tracking-tight mb-4 leading-tight"
        >
          {decision.title}
        </motion.h2>

        {/* Emotional Question */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-cormorant italic text-xl sm:text-2xl md:text-3xl text-[#881337] font-medium max-w-xl mb-12 leading-relaxed"
        >
          “{decision.subtitle}”
        </motion.p>

        {/* Action Buttons */}
        {decisionState === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-8"
          >
            {/* Button 1: “Yes, let's talk ❤️” */}
            <button
              onClick={handleYesClick}
              className="w-full sm:w-auto px-8 py-4 rounded-full text-base sm:text-lg font-medium text-white bg-gradient-to-r from-[#881337] via-[#9F1239] to-[#BE123C] shadow-lg shadow-rose-900/25 hover:shadow-xl hover:shadow-rose-900/35 hover:scale-[1.03] active:scale-98 transition-all duration-300 flex items-center justify-center gap-2.5"
            >
              <Heart className="w-5 h-5 fill-white text-white" />
              <span>{decision.yesButtonText}</span>
            </button>

            {/* Button 2: “Not ready yet 💗” */}
            <button
              onClick={handleNotReadyClick}
              className="w-full sm:w-auto px-7 py-4 rounded-full text-base sm:text-lg font-medium text-[#881337] bg-[#FFFDF9] border border-rose-200/90 shadow-md hover:bg-rose-50/80 hover:border-rose-300 hover:shadow-lg transition-all duration-300 active:scale-98 flex items-center justify-center gap-2"
            >
              <HeartHandshake className="w-5 h-5 text-rose-400" />
              <span>{decision.noButtonText}</span>
            </button>

          </motion.div>
        )}

        {/* Sending State */}
        {decisionState === 'sending' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#FFFDF9] rounded-3xl p-8 border border-rose-200 shadow-xl max-w-md w-full mb-8 flex flex-col items-center"
          >
            <Loader2 className="w-8 h-8 text-[#BE123C] animate-spin mb-3" />
            <p className="font-playfair text-lg text-[#2D1B28] font-medium">
              Sending your response to Nestle...
            </p>
            <p className="text-xs text-stone-500 mt-1 font-body">
              Please keep this screen open for just a moment.
            </p>
          </motion.div>
        )}

        {/* Success Screen: Only shown when notification request succeeds */}
        <AnimatePresence>
          {decisionState === 'yes_success' && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#FFFDF9] rounded-3xl p-8 sm:p-10 border border-rose-200 shadow-2xl max-w-xl w-full mb-8 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-300 via-[#BE123C] to-pink-300" />

              <div className="flex items-center gap-2.5 text-[#881337] mb-4">
                <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center">
                  <MailCheck className="w-4 h-4 text-[#BE123C]" />
                </div>
                <span className="text-xs font-mono uppercase tracking-widest font-semibold">
                  Response Received & Sent to Nestle
                </span>
              </div>

              <h3 className="font-playfair text-2xl sm:text-3xl text-[#2D1B28] font-medium mb-4 leading-snug">
                Thank you, my Annuva ❤️
              </h3>

              <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-100 mb-6">
                <p className="font-body text-base sm:text-lg text-[#33222B] leading-relaxed">
                  “{decision.yesSuccessMessage}”
                </p>
              </div>

              <div className="text-xs text-stone-500 font-mono flex items-center justify-between border-t border-rose-100 pt-4">
                <span>Notification delivered to Nestle's inbox</span>
                <span className="text-[#881337] font-semibold">✓ Confirmed</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State: Gentle message if notification request fails */}
        <AnimatePresence>
          {decisionState === 'yes_error' && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="bg-[#FFFDF9] rounded-3xl p-8 border border-rose-200 shadow-xl max-w-lg w-full mb-8 text-left"
            >
              <div className="flex items-center gap-2.5 text-amber-700 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span className="text-xs font-mono uppercase tracking-wider font-semibold">
                  Notification Note
                </span>
              </div>

              <h4 className="font-playfair text-xl text-[#2D1B28] font-medium mb-2">
                Your choice means everything, Annuva ❤️
              </h4>

              <p className="font-body text-sm text-stone-700 leading-relaxed mb-4">
                We couldn't automatically deliver the email notification to Nestle right now due to a network connection or configuration issue, but please know your willingness to talk is heard and deeply cherished.
              </p>

              {errorMessage && (
                <div className="p-3 bg-stone-100/80 rounded-xl text-xs font-mono text-stone-600 mb-5 break-words">
                  Details: {errorMessage}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleYesClick}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-medium text-white bg-[#881337] hover:bg-[#9F1239] transition-colors"
                >
                  Try sending again
                </button>
                <button
                  onClick={() => setDecisionState('idle')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                >
                  Back to options
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* "Not ready yet" Screen: Strictly respectful, no email sent */}
        <AnimatePresence>
          {decisionState === 'not_ready' && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="bg-[#FFFDF9] rounded-3xl p-8 sm:p-10 border border-rose-200 shadow-xl max-w-xl w-full mb-8 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-stone-300 via-rose-300 to-stone-300" />

              <div className="flex items-center gap-2 text-stone-600 mb-3 font-mono text-xs uppercase tracking-wider">
                <HeartHandshake className="w-4 h-4 text-rose-400" />
                <span>Zero Pressure • Your Peace Comes First</span>
              </div>


              <h3 className="font-playfair text-2xl text-[#2D1B28] font-medium mb-4">
                Take all the time you need, Annuva 💗
              </h3>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/70 mb-6">
                <p className="font-body text-base text-stone-700 leading-relaxed">
                  “{decision.noMessage}”
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={scrollToLetter}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#881337] hover:text-[#BE123C] transition-colors py-2"
                >
                  <span>Return to the letter 💌</span>
                  <span>↑</span>
                </button>

                <button
                  onClick={() => setDecisionState('idle')}
                  className="w-full sm:w-auto text-xs text-stone-500 hover:text-stone-800 transition-colors py-2"
                >
                  Change your answer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
