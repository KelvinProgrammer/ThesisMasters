'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Navigation({ currentPage = 'home' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { name: 'Home', href: '/', key: 'home' },
    { name: 'Services', href: '/services', key: 'services' },
    { name: 'Pricing', href: '/pricing', key: 'pricing' },
    { name: 'About', href: '/about', key: 'about' },
    { name: 'Contact', href: '/contact', key: 'contact' },
  ]

  return (
    <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="flex justify-between items-center py-6">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div className="flex-shrink-0 flex items-center">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">ThesisMaster</span>
            <span className="text-sm text-gray-500 ml-1">®</span>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`font-medium transition-colors ${
                currentPage === item.key
                  ? 'text-gray-900'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right side buttons */}
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
          </button>
          
          <button className="text-gray-700 hover:text-gray-900 font-medium">
            Login
          </button>
          
          <button className="hidden md:block bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
            Register
          </button>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="px-4 py-4 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`block py-2 font-medium transition-colors ${
                  currentPage === item.key
                    ? 'text-gray-900'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}