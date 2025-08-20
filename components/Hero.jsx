'use client'

import { useState } from 'react'

export default function Hero() {
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  return (
    <div className="relative bg-gray-50 overflow-hidden">
      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Thesis & dissertation success.
              <br />
              <span className="block">Using AI.</span>
            </h1>
            
            <div className="mt-6 space-y-4">
              <p className="text-xl text-gray-600">
                Write with confidence, defend with excellence.
              </p>
              <p className="text-lg text-gray-600">
                Research guidance, writing assistance and defense preparation at your fingertips.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                Try free
              </button>
              <button 
                onClick={() => setIsVideoOpen(true)}
                className="flex items-center text-gray-700 hover:text-gray-900 font-medium"
              >
                Watch intro
                <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white"></div>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="font-semibold">LIVE</span>
                <span className="ml-2">Trusted by 15,847 students worldwide.</span>
              </div>
            </div>
          </div>

          {/* Right side - Image/Illustration */}
          <div className="mt-12 lg:mt-0">
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900">AI-Powered Writing</h3>
                  <p className="text-gray-600">Create and structure your thesis with the help of advanced AI research tools.</p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 text-left">
                    <div className="text-sm text-gray-500 mb-2">Chapter progress</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Introduction</span>
                        <span className="text-green-600 font-semibold">100%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full w-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                Made for researchers
              </div>
              
              <div className="absolute bottom-8 -left-4 bg-white rounded-lg shadow-lg p-4 transform -rotate-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold">Dr. Sarah Chen</div>
                    <div className="text-xs text-gray-500">PhD Supervisor</div>
                  </div>
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}