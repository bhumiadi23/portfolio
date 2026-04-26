import { BrowserRouter, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import AppRouter from './router'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import { useTheme } from './hooks/useTheme'
import { CompareProvider } from './context/CompareContext'
import { GarageProvider } from './context/GarageContext'

/** Scroll to top on every route change */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])
  return null
}

function AppContent() {
  useTheme()

  return (
    <div className="min-h-screen flex flex-col bg-primary transition-colors duration-300">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <AppRouter />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CompareProvider>
        <GarageProvider>
          <AppContent />
        </GarageProvider>
      </CompareProvider>
    </BrowserRouter>
  )
}
