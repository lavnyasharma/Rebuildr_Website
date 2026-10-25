import Hero from './home/Hero'
import ScrollTunnel from './home/ScrollTunnel'
import HowItWorks from './home/HowItWorks'
import Difference from './home/Difference'
import Capabilities from './home/Capabilities'
import Compare from './home/Compare'
import PricingSection from './home/PricingSection'
import Testimonials from './home/Testimonials'

export default function Home() {
  return (
    <div id="top">
      <Hero />
      <ScrollTunnel />
      <HowItWorks />
      <Difference />
      <Capabilities />
      <Compare />
      <PricingSection />
      <Testimonials />
    </div>
  )
}
