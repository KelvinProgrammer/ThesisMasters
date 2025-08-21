// app/layout.jsx
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ThesisMaster - AI-Powered Thesis & Dissertation Success',
  description: 'Transform your thesis journey with AI-powered research assistance, smart writing coaching, and comprehensive defense preparation.',
  keywords: 'thesis, dissertation, AI, academic writing, research, university',
  authors: [{ name: 'ThesisMaster Team' }],
  openGraph: {
    title: 'ThesisMaster - AI-Powered Thesis Success',
    description: 'AI-powered platform for thesis and dissertation success',
    type: 'website',
    url: 'https://thesismaster.com',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}