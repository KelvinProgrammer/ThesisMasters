export default function Features() {
  return (
    <div className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* For Masters Students */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">For Masters students</h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Structured guidance through your entire thesis journey with personalized research assistance.
            </p>
            
            <button className="flex items-center mx-auto text-gray-700 hover:text-gray-900 font-medium group">
              See pricing
              <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>

            {/* Illustration */}
            <div className="mt-12 relative">
              <div className="bg-gray-50 rounded-2xl p-8 h-80 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">Research Planner</h3>
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full w-3/4"></div>
                    </div>
                    <div className="text-sm text-gray-500">Progress: 75%</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-4 left-4 flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Active session</span>
              </div>
              
              <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 transform rotate-6">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-xs font-medium">Chapter 2 complete</span>
                </div>
              </div>
            </div>
          </div>

          {/* For PhD Candidates */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">For PhD candidates</h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Advanced research tools powered by AI, comprehensive literature review and defense preparation.
            </p>
            
            <button className="flex items-center mx-auto text-gray-700 hover:text-gray-900 font-medium group">
              See pricing
              <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>

            {/* Illustration */}
            <div className="mt-12 relative">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 h-80 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="flex justify-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-sm text-gray-500 mb-2">Create a template for my...</div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z"/>
                          <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5a.75.75 0 001.5 0v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg"></div>
                    <div className="w-16 h-16 bg-green-100 rounded-lg"></div>
                    <div className="w-16 h-16 bg-purple-100 rounded-lg"></div>
                    <div className="w-16 h-16 bg-yellow-100 rounded-lg"></div>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg px-3 py-1">
                <span className="text-xs font-medium text-gray-700">AI Assistant</span>
              </div>
            </div>
          </div>

          {/* For Universities */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">For universities</h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Comprehensive student management and progress tracking with institutional oversight and analytics.
            </p>
            
            <button className="flex items-center mx-auto text-gray-700 hover:text-gray-900 font-medium group">
              See pricing
              <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>

            {/* Illustration */}
            <div className="mt-12 relative">
              <div className="bg-gray-50 rounded-2xl p-8 h-80 flex items-center justify-center">
                <div className="space-y-4">
                  <div className="flex justify-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">JS</span>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-green-600">AM</span>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm text-left">
                    <div className="text-xs text-gray-500 mb-2">Student Progress</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">John Smith</span>
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Anna Martinez</span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 transform -rotate-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-semibold">24 Students</div>
                    <div className="text-xs text-gray-500">Active this week</div>
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