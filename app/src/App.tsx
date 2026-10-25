import { Route, Routes } from 'react-router-dom'
import { LazyMotion, domAnimation } from 'framer-motion'
import SmoothScroll from './components/SmoothScroll'
import ScrollManager from './components/ScrollManager'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import { useSeo } from './useSeo'
import WaitlistProvider from './components/WaitlistProvider'
import Analytics from './components/Analytics'

export default function App() {
  useSeo()
  return (
    <LazyMotion features={domAnimation} strict>
    <SmoothScroll>
      <WaitlistProvider>
      <ScrollManager />
      <Analytics />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      </WaitlistProvider>
    </SmoothScroll>
    </LazyMotion>
  )
}
