import React from "react";

export default function LandingPage({ onStartArchiving }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 md:px-6 py-10">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[34rem] w-[34rem] rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[22rem] w-[22rem] rounded-full bg-emerald-300/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(16,185,129,0.65) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative w-full max-w-6xl rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.75)] backdrop-blur-xl overflow-hidden">
        {/* Top bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-6 md:px-10 py-6 border-b border-white/10 bg-gradient-to-r from-white/5 via-transparent to-transparent">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/0 border border-white/10 shadow-inner overflow-hidden flex items-center justify-center">
              <img
                src="/461661670_1118300596319054_8742723372426556351_n.jpg"
                alt="City Civil Registrar Office Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-emerald-200/80">
                City Civil Registrar Office • Iligan City
              </p>
              <h1 className="text-lg md:text-xl font-semibold text-white tracking-tight truncate">
                CCRO Archive Locator System
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" />
              Authorized personnel only
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2">
          {/* Left: copy + CTA */}
          <div className="p-7 md:p-10 lg:p-12">
            <div className="max-w-xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-semibold tracking-[0.22em] uppercase text-emerald-200/90">
                Document Retrieval • Location Mapping • Audit Log
              </p>

              <h2 className="mt-5 text-3xl md:text-4xl font-semibold tracking-tight text-white">
                Find records fast.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-emerald-100 to-sky-200">
                  Keep the archive consistent.
                </span>
              </h2>

              <p className="mt-4 text-sm md:text-base text-white/70 leading-relaxed">
                A clean, reliable system for locating physical certificate boxes using standardized codes,
                profile-based shelf mapping, and activity logging—built for day‑to‑day office workflow.
              </p>

              <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MetricCard label="Certificate types" value="3" />
                <MetricCard label="Search inputs" value="Type • Year • Registry" />
                <MetricCard label="Output" value="Bay • Shelf • Row • Box" />
              </div>

              <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
                <button
                  onClick={onStartArchiving}
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-emerald-950 shadow-[0_12px_30px_-12px_rgba(16,185,129,0.65)] hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition"
                >
                  Continue to login
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>

                <div className="text-xs text-white/60">
                  Use this system only for official CCRO archiving and retrieval.
                </div>
              </div>
            </div>
          </div>

          {/* Right: realistic product preview */}
          <div className="relative border-t md:border-t-0 md:border-l border-white/10 bg-gradient-to-br from-white/5 to-transparent p-7 md:p-10 lg:p-12">
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "100% 38px" }} />

            <div className="relative space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold tracking-[0.22em] uppercase text-white/70">
                  System preview
                </p>
                <span className="text-[11px] text-white/60 rounded-full border border-white/10 bg-white/5 px-2 py-1">
                  v1 • Internal
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 shadow-inner">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">Document Locator</p>
                    <p className="text-xs text-white/60 truncate">
                      Standard search → standardized physical output
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-200/90 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2.5 py-1">
                    Ready
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <PreviewChip label="Type" value="COLB" />
                  <PreviewChip label="Year" value="2000" />
                  <PreviewChip label="Registry" value="012345" />
                </div>

                <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-white/60">
                    Location result
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    Bay 3 → Shelf S‑C → Row R‑4 → Box #3
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-emerald-100/90 bg-slate-950/40 border border-white/10 rounded-lg px-2.5 py-2">
                    COB;Y-2000;B-3;S-C;R-4;B-3
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <FeatureRow
                  title="Profile-based mapping"
                  description="Active shelf/row labels come from Location Management."
                />
                <FeatureRow
                  title="Controlled updates"
                  description="Update actions can be confirmed before saving changes."
                />
                <FeatureRow
                  title="Audit trail"
                  description="Search and box actions can be logged for accountability."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 md:px-10 py-4 border-t border-white/10 bg-gradient-to-r from-white/5 via-transparent to-transparent">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/50">
            <p>© 2024 City Civil Registrar Office of Iligan • Archive Locator System</p>
            <p>Restricted access • Do not share credentials</p>
          </div>
        </div>
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