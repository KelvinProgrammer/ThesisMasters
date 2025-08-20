export default function Integrations() {
  return (
    <div className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Connect. Research. Excel.
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            You don't need to hire multiple research assistants anymore. Join our quest to bring you success across all academic platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Academic Integrations */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Academic integrations</h3>
            <p className="text-gray-600 mb-8">
              Over 30+ integrations including research databases, reference managers, writing tools and our API.
            </p>

            {/* Integration Icons Grid */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {/* Row 1 */}
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">JSTOR</span>
              </div>
              <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-red-600">PUBMED</span>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-green-600">ZOTERO</span>
              </div>
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-purple-600">MENDELEY</span>
              </div>
              
              {/* Row 2 */}
              <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-yellow-600">GOOGLE</span>
              </div>
              <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-indigo-600">IEEE</span>
              </div>
              <div className="w-16 h-16 bg-pink-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-pink-600">SCOPUS</span>
              </div>
              <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-teal-600">LATEX</span>
              </div>
            </div>

            <button className="flex items-center text-gray-700 hover:text-gray-900 font-medium group">
              Check all integrations
              <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>

          {/* University Support */}
          <div className="space-y-8">
            {/* University Systems */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-bold text-green-600">BLACKBOARD</span>
                  <span className="text-sm font-bold text-purple-600 ml-4">CANVAS</span>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4">University support</h3>
              <p className="text-gray-600">
                Easily connect university systems, so you can sync progress and communicate with advisors simultaneously.
              </p>
            </div>

            {/* Collaboration Tools */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="font-medium text-gray-900">Supervisor approval</span>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                  </div>
                  <span className="font-medium text-gray-900">Committee review</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="font-medium text-gray-900">Share public progress</span>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4">Multi-level approvals</h3>
              <p className="text-gray-600">
                Get feedback from supervisors, committee members, or external reviewers. Share public links, track status and collaborate effectively.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section - Writing Tools */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">WORD</span>
                </div>
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-white">LATEX</span>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-white">OVERLEAF</span>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Powerful writing tools</h3>
              <p className="text-gray-600">
                Forget complicated formatting. Discover seamless integration with your favorite writing platforms and reference managers.
              </p>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 text-center">
                <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.379-8.379-2.828-2.828z"/>
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Smart Writing Assistant</h4>
                <p className="text-gray-600 text-sm">
                  AI-powered suggestions for better academic writing
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}