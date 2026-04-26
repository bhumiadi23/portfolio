/**
 * AppRouter — Lazy-loaded routes with AnimatePresence page transitions.
 *
 * Every page chunk is code-split. A shimmering PageLoader is shown while
 * the chunk fetches. Framer Motion handles cross-page fade/slide transitions.
 */
import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { PageLoader } from '../components/ui/Skeleton'

// ─── Lazy page imports ─────────────────────────────────────────────────────
const Home               = lazy(() => import('../pages/Home'))
const CarDatabase        = lazy(() => import('../pages/CarDatabase'))
const CarDetail          = lazy(() => import('../pages/CarDetail'))
const Compare            = lazy(() => import('../pages/Compare'))
const AIAdvisor          = lazy(() => import('../pages/AIAdvisor'))
const Tools              = lazy(() => import('../pages/Tools'))
const EVTools            = lazy(() => import('../pages/EVTools'))
const Community          = lazy(() => import('../pages/Community'))
const CarQuiz            = lazy(() => import('../pages/CarQuiz'))
const EngineSounds       = lazy(() => import('../pages/EngineSounds'))
const Performance        = lazy(() => import('../pages/Performance'))
const CarReviews         = lazy(() => import('../pages/CarReviews'))
const Garage             = lazy(() => import('../pages/Garage'))
const FinancialDashboard = lazy(() => import('../pages/FinancialDashboard'))
const Awards             = lazy(() => import('../pages/Awards'))
const EnthusiastTools    = lazy(() => import('../pages/Enthusiast'))
const Presentation       = lazy(() => import('../pages/Presentation'))
const NotFound           = lazy(() => import('../pages/NotFound'))

// ─── Shared page transition variants ──────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0,  transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </motion.div>
  )
}

// ─── Router ───────────────────────────────────────────────────────────────
export default function AppRouter() {
  const location = useLocation()

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/"              element={<PageTransition><Home /></PageTransition>} />
          <Route path="/cars"          element={<PageTransition><CarDatabase /></PageTransition>} />
          <Route path="/cars/:id"      element={<PageTransition><CarDetail /></PageTransition>} />
          <Route path="/compare"       element={<PageTransition><Compare /></PageTransition>} />
          <Route path="/ai-advisor"    element={<PageTransition><AIAdvisor /></PageTransition>} />
          <Route path="/tools"         element={<PageTransition><Tools /></PageTransition>} />
          <Route path="/ev-tools"      element={<PageTransition><EVTools /></PageTransition>} />
          <Route path="/community"     element={<PageTransition><Community /></PageTransition>} />
          <Route path="/quiz"          element={<PageTransition><CarQuiz /></PageTransition>} />
          <Route path="/sounds"        element={<PageTransition><EngineSounds /></PageTransition>} />
          <Route path="/race"          element={<PageTransition><Performance /></PageTransition>} />
          <Route path="/reviews/:carId" element={<PageTransition><CarReviews /></PageTransition>} />
          <Route path="/garage"        element={<PageTransition><Garage /></PageTransition>} />
          <Route path="/finance"       element={<PageTransition><FinancialDashboard /></PageTransition>} />
          <Route path="/awards"        element={<PageTransition><Awards /></PageTransition>} />
          <Route path="/enthusiast"    element={<PageTransition><EnthusiastTools /></PageTransition>} />
          <Route path="/presentation"  element={<PageTransition><Presentation /></PageTransition>} />
          <Route path="*"             element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  )
}
