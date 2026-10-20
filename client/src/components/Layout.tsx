import React, { ReactNode } from "react";
import { Link } from "react-router-dom";

/**
 * Simple layout component used across the app.
 * It provides a consistent page container, a top navigation bar
 * (already present in App.tsx) and optional footer.
 * All children are rendered inside a centered column that respects
 * the light/dark theme and the design system (Tailwind, indigo accent).
 */
export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header – could be expanded later */}
      <header className="bg-white dark:bg-gray-800 shadow py-4">
        <div className="max-w-5xl mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-indigo-600 hover:underline">
            SignBridge
          </Link>
        </div>
      </header>
      {/* Main content area */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6">{children}</main>
      {/* Footer – simple */}
      <footer className="bg-white dark:bg-gray-800 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
        © {new Date().getFullYear()} SignBridge – built with React, Tailwind, MediaPipe
      </footer>
    </div>
  );
};
