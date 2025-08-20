import './globals.css'

export const metadata = {
  title: 'ThesisMaster - Thesis & Dissertation Success Using AI',
  description: 'AI-powered platform for thesis writing, research assistance, and dissertation defense preparation. Get expert guidance from research to final defense.',
  keywords: 'thesis, dissertation, PhD, masters, AI writing assistant, research help, defense preparation',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}