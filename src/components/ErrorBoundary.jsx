import React from "react";

/**
 * Catches React render errors (e.g. "Objects are not valid as a React child")
 * and shows a fallback UI instead of a blank screen.
 */
export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen bg-amber-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-6">
            <h2 className="text-lg font-bold text-amber-800 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-700 mb-4">
              {this.state.error?.message || "An error occurred while rendering."}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
            >
              Reload app
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
