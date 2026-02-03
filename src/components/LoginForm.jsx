import React, { useState } from "react";

const DEMO_USER = {
  username: "admin",
  password: "ccro123",
  role: "Records Officer",
};

export default function LoginForm({ onBack, onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    setTimeout(() => {
      if (
        username.trim() === DEMO_USER.username &&
        password === DEMO_USER.password
      ) {
        onLoginSuccess({ username: DEMO_USER.username, role: DEMO_USER.role });
      } else {
        setError("Invalid credentials. Use admin / ccro123 for demo access.");
      }
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-700 to-emerald-500 px-6">
      <div className="w-full max-w-md bg-white/95 rounded-3xl shadow-2xl border border-emerald-100 p-8">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-medium text-emerald-700 hover:text-emerald-900 mb-4 inline-flex items-center gap-1"
        >
          <span className="text-lg leading-none">←</span> Back to landing
        </button>

        <h2 className="text-2xl font-semibold text-gray-900">
          Authorized Personnel Login
        </h2>
        <p className="mt-1.5 text-sm text-gray-600">
          Access the dashboard to manage document locations and box records.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="text-xs font-medium text-gray-700 uppercase tracking-[0.16em]"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter username"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-xs font-medium text-gray-700 uppercase tracking-[0.16em]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-[11px] text-gray-500 text-center mt-2">
            Demo credentials: <span className="font-mono">admin / ccro123</span>
          </p>
        </form>
      </div>
    </div>
  );
}

