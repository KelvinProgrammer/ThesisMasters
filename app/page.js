import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Services from '@/components/Services'
import Workflows from '@/components/Workflows'
import Integrations from '@/components/Integrations'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation currentPage="home" />
      <Hero />
      <Features />
      <Services />
      <Workflows />
      <Integrations />
      <CTA />
      <Footer />
    </main>
  )
}