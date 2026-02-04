import React from "react";

export default function LandingPage({ onStartArchiving }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-r from-emerald-900 via-emerald-800 to-sky-300 text-white">
      {/* Background accents – smooth wave effect */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-1/4 top-1/3 h-[32rem] w-[160%] opacity-75"
          style={{
            backgroundImage:
              "linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(240,253,250,0.9) 35%, rgba(240,253,250,0) 70%)",
            transform: "skewY(-14deg)",
          }}
        />
        <div
          className="absolute -left-1/4 top-1/2 h-[34rem] w-[170%] opacity-55"
          style={{
            backgroundImage:
              "repeating-linear-gradient(120deg, rgba(209,250,229,0.9) 0, rgba(209,250,229,0.9) 2px, rgba(240,253,250,0) 4px, rgba(240,253,250,0) 8px)",
            transform: "skewY(-16deg)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-emerald-900/30" />
      </div>

      {/* Page shell */}
      <div className="relative flex min-h-screen w-full flex-col px-6 py-6 md:px-10 md:py-8">
        {/* Top navigation */}
        <header className="relative z-10 flex flex-col gap-4 pb-4 md:flex-row md:items-center md:justify-between md:gap-6 border-b border-emerald-400/60">
          {/* Logo + brand */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-400 bg-white/10 shadow-inner md:h-16 md:w-16">
                <img
                  src="/461661670_1118300596319054_8742723372426556351_n.jpg"
                  alt="City Civil Registrar Office Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-50/85">
                  City Civil Registrar Office • Iligan City
                </p>
                <p className="mt-1 text-sm font-semibold tracking-[0.16em] text-white md:text-base">
                  CCRO Archive Locator System
                </p>
              </div>
            </div>
          </div>

          {/* Centered navigation with hover dropdowns */}
          <div className="flex flex-1 flex-col items-center gap-2 md:items-center">
            <nav className="hidden gap-8 text-sm font-medium text-emerald-50/90 md:flex">
              <HoverNavItem label="Expected benefits">
                <div className="space-y-2 text-left">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                    How the system helps
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="flex items-start gap-2 rounded-lg bg-emerald-900/70 px-2.5 py-2">
                      <span className="mt-0.5 h-4 w-4 rounded-full bg-emerald-400/90 shadow-[0_0_0_4px_rgba(16,185,129,0.18)]" />
                      <div>
                        <p className="text-[11px] font-semibold text-emerald-50">
                          Faster retrieval
                        </p>
                        <p className="text-[11px] text-emerald-100/80">
                          Staff go straight to the right bay and box.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 rounded-lg bg-emerald-900/70 px-2.5 py-2">
                      <span className="mt-0.5 h-4 w-4 rounded-full bg-emerald-300/90" />
                      <div>
                        <p className="text-[11px] font-semibold text-emerald-50">
                          Reduced workload
                        </p>
                        <p className="text-[11px] text-emerald-100/80">
                          Less time spent manually searching shelves.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 rounded-lg bg-emerald-900/70 px-2.5 py-2">
                      <span className="mt-0.5 h-4 w-4 rounded-full bg-sky-300/90" />
                      <div>
                        <p className="text-[11px] font-semibold text-emerald-50">
                          Cleaner records
                        </p>
                        <p className="text-[11px] text-emerald-100/80">
                          Locations are stored in one standard format.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 rounded-lg bg-emerald-900/70 px-2.5 py-2">
                      <span className="mt-0.5 h-4 w-4 rounded-full bg-amber-300/90" />
                      <div>
                        <p className="text-[11px] font-semibold text-emerald-50">
                          Audit‑ready
                        </p>
                        <p className="text-[11px] text-emerald-100/80">
                          Easier to show how and where records are kept.
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-200/90">
                    Designed to fit into current CCRO workflows with minimal change.
                  </p>
                </div>
              </HoverNavItem>

              <HoverNavItem label="Type of certificate">
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                    Certificate profiles
                  </p>
                  <p className="text-[11px] text-emerald-100/90">
                    Selected from a controlled drop‑down list.
                  </p>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between rounded-md bg-sky-600/80 px-2 py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-sky-200" />
                        <span className="font-semibold">Birth (COLB)</span>
                      </div>
                      <span className="text-emerald-50/90">Blue</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-red-600/80 px-2 py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-red-200" />
                        <span className="font-semibold">Marriage (COM)</span>
                      </div>
                      <span className="text-emerald-50/90">Red</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-violet-600/80 px-2 py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-violet-200" />
                        <span className="font-semibold">Death (COD)</span>
                      </div>
                      <span className="text-emerald-50/90">Violet</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-100/80">
                    Each type drives default color‑coding on screen and labels.
                  </p>
                </div>
              </HoverNavItem>

              <HoverNavItem label="Search code display">
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                    Example search code
                  </p>
                  <p className="rounded-md bg-emerald-900/80 px-2 py-1.5 font-mono text-[11px] text-emerald-50">
                    COB;Y-2000;B-3;S-G;R-4;B-3
                  </p>
                  <div className="grid gap-1.5 text-[11px]">
                    <div className="flex items-center justify-between rounded-md bg-emerald-900/70 px-2 py-1">
                      <span className="text-emerald-100/90">COB</span>
                      <span className="text-emerald-200/90">Certificate of Death</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-emerald-900/70 px-2 py-1">
                      <span className="text-emerald-100/90">Y-2000</span>
                      <span className="text-emerald-200/90">Year</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-emerald-900/70 px-2 py-1">
                      <span className="text-emerald-100/90">B-3 / S-G / R-4 / B-3</span>
                      <span className="text-emerald-200/90">Bay • Shelf • Row • Box</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-100/80">
                    Staff can copy this code directly into box labels and logs.
                  </p>
                </div>
              </HoverNavItem>
            </nav>
          </div>

          {/* Right-side meta (intentionally left blank for now) */}
        </header>

        {/* Main content – simple hero like reference image */}
        <main className="relative z-10 mt-24 flex flex-1 items-end pb-12 md:pb-16">
          <div className="max-w-xl space-y-4 md:space-y-6">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              A modern locator for
              <span className="block text-emerald-50">
                real CCRO archive shelves.
              </span>
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-emerald-50/90 md:text-base">
              Staff search using familiar certificate details then walk straight to the exact bay,
              shelf, row, and box on the physical archive shelves.
            </p>

            <div className="pt-4">
              <button
                onClick={onStartArchiving}
                className="inline-flex items-center gap-3 rounded-full bg-emerald-600/95 px-7 py-2.5 text-sm font-semibold text-emerald-50 shadow-[0_18px_45px_-24px_rgba(15,118,110,0.9)] transition hover:bg-emerald-500"
              >
                Continue to login
                <span className="text-lg leading-none">↗</span>
              </button>
              <p className="mt-3 text-[11px] text-emerald-50/80">
                For authorized CCRO personnel only.
              </p>
            </div>
          </div>
        </main>

        <footer className="relative z-10 border-t border-emerald-50/40 pt-3 text-[11px] text-emerald-50/85">
          <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
            <p>© 2026 City Civil Registrar Office of Iligan • Archive Locator System</p>
            <p>Restricted access • Do not share credentials</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-white/60">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function PreviewChip({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-white/60">
        {label}
      </p>
      <p className="mt-1 text-xs font-semibold text-white">{value}</p>
    </div>
  );
}

function FeatureRow({ title, description }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 h-9 w-9 rounded-xl border border-white/10 bg-gradient-to-br from-emerald-400/20 to-sky-400/10 flex items-center justify-center">
          <svg className="h-4 w-4 text-emerald-200/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-xs text-white/60 leading-relaxed">{description}</p>
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

function HoverNavItem({ label, children }) {
  return (
    <div className="group relative inline-block text-left">
      <button
        className="cursor-default rounded-full border border-emerald-200/60 bg-emerald-900/40 px-3 py-1 transition hover:bg-emerald-800/70 hover:text-white"
        style={{ fontFamily: 'Helvetica, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
      >
        {label}
      </button>
      <div
        className="pointer-events-none invisible absolute left-1/2 top-full z-20 mt-3 w-max min-w-[16rem] max-w-xs -translate-x-1/2 translate-y-1 rounded-xl border border-emerald-400/40 bg-emerald-950/95 p-3 text-xs text-emerald-50/90 shadow-xl ring-1 ring-emerald-400/30 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:-translate-x-1/2 group-hover:translate-y-0 group-hover:opacity-100"
        style={{ fontFamily: 'Helvetica, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
      >
        {children}
      </div>
    </div>
  );
}