import React from "react";

export default function LandingPage({ onStartArchiving }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-gray-900 to-slate-900 px-4 md:px-6">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-96 h-96 bg-emerald-700/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl w-full bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-emerald-900/30 backdrop-blur-xl shadow-2xl shadow-emerald-900/20 rounded-2xl md:rounded-3xl overflow-hidden border border-emerald-700/30">
        
        {/* Header with Logo */}
        <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-10 py-6 border-b border-emerald-700/30 bg-gradient-to-r from-emerald-900/20 via-emerald-800/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="relative">
              {/* Logo Container - Ready for Image */}
              <div className="relative w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/30 border border-emerald-500/20 overflow-hidden">
                {/* Logo Placeholder - Replace with <img> tag */}
                <div className="w-full h-full flex items-center justify-center p-1.5">
                  <div className="w-full h-full bg-gradient-to-br from-gray-700/80 to-gray-800/90 rounded-lg flex items-center justify-center">
                    <div className="text-xs md:text-sm font-semibold text-gray-400">
                      
                      <img 
                        src="public/461661670_1118300596319054_8742723372426556351_n.jpg" 
                        alt="City Civil Registrar Office Logo"
                        className="w-full h-full object-contain p-2"
                      />
                      
                      
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
                City Civil Registrar Office
              </h1>
              <p className="text-xs text-emerald-300/80 font-medium tracking-wider">
                ARCHIVE LOCATOR SYSTEM
              </p>
            </div>
          </div>
          
          {/* Version badge removed */}
        </div>

        <div className="grid md:grid-cols-2">
          {/* Left Content Section */}
          <div className="p-8 md:p-12 flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/50 border border-emerald-700/50">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  DOCUMENT LOCATOR SYSTEM
                </p>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                Modern
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-100">
                  Archive Platform
                </span>
              </h1>
              
              <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-lg">
                Enterprise-grade archive tracking system designed to streamline 
                certificate management with <span className="text-emerald-300 font-medium">precise location mapping</span>, 
                <span className="text-emerald-300 font-medium"> audit-ready logging</span>, and 
                <span className="text-emerald-300 font-medium"> real-time status updates</span>.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-gray-800/50 to-emerald-900/20 rounded-xl p-4 border border-emerald-800/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-900/50 flex items-center justify-center">
                    <span className="text-emerald-400 text-lg">📍</span>
                  </div>
                  <h3 className="font-semibold text-white text-sm">Smart Location</h3>
                </div>
                <p className="text-xs text-gray-300">Precise bay, shelf, row, and box tracking with visual mapping</p>
              </div>

              <div className="bg-gradient-to-br from-gray-800/50 to-emerald-900/20 rounded-xl p-4 border border-emerald-800/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-900/50 flex items-center justify-center">
                    <span className="text-emerald-400 text-lg">📊</span>
                  </div>
                  <h3 className="font-semibold text-white text-sm">Audit Trail</h3>
                </div>
                <p className="text-xs text-gray-300">Comprehensive activity logging for full accountability</p>
              </div>

              <div className="bg-gradient-to-br from-gray-800/50 to-emerald-900/20 rounded-xl p-4 border border-emerald-800/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-900/50 flex items-center justify-center">
                    <span className="text-emerald-400 text-lg">🔍</span>
                  </div>
                  <h3 className="font-semibold text-white text-sm">Quick Search</h3>
                </div>
                <p className="text-xs text-gray-300">Find archives by type, year, and registry number in seconds</p>
              </div>

              <div className="bg-gradient-to-br from-gray-800/50 to-emerald-900/20 rounded-xl p-4 border border-emerald-800/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-900/50 flex items-center justify-center">
                    <span className="text-emerald-400 text-lg">📁</span>
                  </div>
                  <h3 className="font-semibold text-white text-sm">Box Tracking</h3>
                </div>
                <p className="text-xs text-gray-300">Monitor box movements and location changes over time</p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="space-y-4">
              <button
                onClick={onStartArchiving}
                className="group relative w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 transition-all duration-300"
              >
                <span>Start</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              
              {/* Removed the three security info items */}
            </div>
          </div>

          {/* Right Content Section */}
          <div className="relative p-8 md:p-12 bg-gradient-to-br from-emerald-950/80 via-emerald-900/60 to-emerald-800/40 border-l border-emerald-700/30">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `linear-gradient(to right, #10b981 1px, transparent 1px),
                                 linear-gradient(to bottom, #10b981 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
              }}></div>
            </div>

            <div className="relative space-y-10">
              {/* Certificate Types Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                    Certificate Types
                  </p>
                  <span className="text-xs text-emerald-400/60 bg-emerald-900/30 px-2 py-1 rounded-full">3 Types</span>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <CertificateBadge 
                    type="Birth Certificate" 
                    code="COLB"
                    color="from-blue-600/20 to-blue-500/10"
                    borderColor="border-blue-500/30"
                  />
                  <CertificateBadge 
                    type="Marriage Certificate" 
                    code="COM"
                    color="from-rose-600/20 to-rose-500/10"
                    borderColor="border-rose-500/30"
                  />
                  <CertificateBadge 
                    type="Death Certificate" 
                    code="COD"
                    color="from-violet-600/20 to-violet-500/10"
                    borderColor="border-violet-500/30"
                  />
                </div>
              </div>

              {/* Search Example Section */}
              <div className="space-y-4">
                <p className="text-sm font-semibold text-emerald-50">Search Pattern Example</p>
                
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600/30 to-emerald-400/20 rounded-2xl blur-sm"></div>
                  <div className="relative rounded-xl border border-emerald-600/40 bg-gradient-to-br from-emerald-900/40 to-emerald-900/20 p-6">
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Search Code</span>
                        <span className="text-xs text-emerald-400/60">Standard Format</span>
                      </div>
                      
                      <div className="font-mono text-sm text-emerald-100 bg-emerald-950/50 rounded-lg p-4 border border-emerald-700/30">
                        <span className="text-emerald-400">COLB</span>
                        <span className="text-emerald-300">;</span>
                        <span className="text-blue-400">Y-2000</span>
                        <span className="text-emerald-300">;</span>
                        <span className="text-emerald-400">B-3</span>
                        <span className="text-emerald-300">;</span>
                        <span className="text-emerald-400">S-1</span>
                        <span className="text-emerald-300">;</span>
                        <span className="text-emerald-400">R-4</span>
                        <span className="text-emerald-300">;</span>
                        <span className="text-emerald-400">BX-3</span>
                      </div>
                      
                      <div className="text-xs text-emerald-300/80 leading-relaxed">
                        <p className="flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
                          Translates digital codes to physical locations in seconds
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Archive System Info */}
              <div className="space-y-4">
                <p className="text-sm font-semibold text-emerald-50">System Benefits</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-xl bg-emerald-900/20 border border-emerald-700/30">
                    <div className="text-lg font-bold text-emerald-300">⏱️</div>
                    <div className="text-xs text-emerald-300/70 mt-1">Faster Retrieval</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-emerald-900/20 border border-emerald-700/30">
                    <div className="text-lg font-bold text-emerald-300">✅</div>
                    <div className="text-xs text-emerald-300/70 mt-1">Standardized System</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-emerald-900/20 border border-emerald-700/30">
                    <div className="text-lg font-bold text-emerald-300">📋</div>
                    <div className="text-xs text-emerald-300/70 mt-1">Audit Ready</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-emerald-900/20 border border-emerald-700/30">
                    <div className="text-lg font-bold text-emerald-300">🔄</div>
                    <div className="text-xs text-emerald-300/70 mt-1">Live Updates</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-emerald-800/30 bg-gradient-to-r from-emerald-900/10 to-transparent">
          <div className="flex flex-col md:flex-row items-center justify-between text-xs text-emerald-400/60">
            <p>© 2024 City Civil Registrar Office of Iligan • Archive Locator System</p>
            <p className="mt-2 md:mt-0">Restricted to authorized personnel only</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CertificateBadge({ type, code, color, borderColor }) {
  return (
    <div className={`relative group`}>
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300`}></div>
      <div className={`relative flex items-center justify-between p-4 rounded-xl bg-gradient-to-r ${color} border ${borderColor} backdrop-blur-sm`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center border border-white/10">
            <span className="text-xs font-bold text-white">{code}</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">{type}</h4>
            <p className="text-xs text-white/60">Archive Type</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/60">Available</div>
          <div className="text-xs font-medium text-emerald-300">✓ Active</div>
        </div>
      </div>
    </div>
  );
}