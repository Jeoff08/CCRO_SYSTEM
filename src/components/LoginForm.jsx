import React, { useState } from "react";
import { authAPI } from "../api.js";

export default function LoginForm({ onBack, onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await authAPI.login(username.trim(), password);
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || "Invalid credentials. Use admin / ccro123 for demo access.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 md:px-6 py-10 bg-slate-950 text-white">
      {/* Background inspired by polygon gradient image */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, #10b981 0%, #0ea5e9 45%, #1d4ed8 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-50 mix-blend-soft-light"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(15,23,42,0.35) 25%, transparent 25%, transparent 50%, rgba(15,23,42,0.35) 50%, rgba(15,23,42,0.35) 75%, transparent 75%, transparent)",
            backgroundSize: "140px 140px",
          }}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(215deg, rgba(15,23,42,0.5) 0%, transparent 40%, transparent 60%, rgba(8,47,73,0.65) 100%)",
          }}
        />
      </div>

      <div className="relative w-full max-w-5xl rounded-3xl border border-white/10 bg-slate-950/70 shadow-[0_24px_80px_-28px_rgba(15,23,42,0.9)] backdrop-blur-2xl overflow-hidden">
        <div className="grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          {/* Left: login form */}
          <div className="relative p-7 md:p-10 lg:p-12 bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-950/90 text-white">
            {/* Logo + back */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-400 bg-slate-900/60 shadow-[0_10px_30px_-18px_rgba(16,185,129,0.9)]">
                  <img
                    src="/461661670_1118300596319054_8742723372426556351_n.jpg"
                    alt="City Civil Registrar Office Logo"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="leading-tight">
                  <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-emerald-200">
                    CCRO
                  </p>
                  <p className="text-sm font-semibold text-white/90">
                    Archive Locator
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onBack}
                className="text-[11px] font-medium text-slate-300 hover:text-white inline-flex items-center gap-1"
              >
                <span className="text-base leading-none">←</span>
                Back to landing
              </button>
            </div>

            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-emerald-200/90">
                City Civil Registrar Office
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
                Sign in to archive locator
              </h2>
              <p className="text-sm text-slate-300">
                Restricted access for CCRO records staff. Use your assigned credentials to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="username"
                  className="text-[11px] font-semibold text-slate-200 uppercase tracking-[0.18em]"
                >
                  Username
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                    <span className="text-slate-500 text-xs">@</span>
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    className="w-full rounded-full border border-slate-500/70 bg-slate-900/40 pl-9 pr-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    placeholder="admin"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-[11px] font-semibold text-slate-200 uppercase tracking-[0.18em]"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full rounded-full border border-slate-500/70 bg-slate-900/40 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <p className="text-xs text-red-100 bg-red-900/40 border border-red-500/60 rounded-2xl px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_-20px_rgba(16,185,129,0.9)] hover:from-emerald-400 hover:via-emerald-300 hover:to-sky-300 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>

              <p className="text-[11px] text-slate-300 text-center">
                Demo credentials:
                <span className="font-mono ml-1 bg-slate-800/60 rounded-full px-2 py-0.5 text-slate-100">
                  admin / ccro123
                </span>
              </p>
            </form>
          </div>

          {/* Right: small context panel */}
          <div className="relative hidden md:flex flex-col justify-between border-l border-white/10 bg-gradient-to-br from-emerald-900/80 via-sky-900/70 to-blue-900/70 p-8 lg:p-10">
            <div className="absolute inset-0 opacity-[0.1]">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(16,185,129,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,185,129,0.4) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
            </div>

            <div className="relative space-y-4">
              <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-emerald-200">
                Archive locator
              </p>
              <h3 className="text-lg font-semibold text-white">
                Secure access for Records Officers
              </h3>
              <p className="text-xs text-emerald-100/80 leading-relaxed">
                Every login is tied to an activity trail. Use your account only for official
                transactions involving birth, marriage, and death certificate records.
              </p>

              <div className="mt-4 space-y-2 text-xs text-emerald-100/90">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Quickly locate boxes by certificate type, year, and registry number.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Location output is based on the active shelf mapping profile.</span>
                </div>
              </div>
            </div>

            <div className="relative mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-900/40 p-4 space-y-2">
              <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-emerald-200">
                Current demo user
              </p>
              <p className="text-sm font-medium text-white">admin</p>
              <p className="text-xs text-emerald-100/80">Role: Records Officer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

