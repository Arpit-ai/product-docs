"use client";

import { useTheme } from "@/components/ThemeProvider";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your preferences and workspace appearance.
        </p>
      </div>

      {/* Appearance */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">Appearance</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Color theme
            </label>
            <div className="flex gap-3">
              {(["light", "dark"] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setTheme(option)}
                  className={`flex-1 flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${
                    theme === option
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                  }`}
                >
                  <div
                    className={`w-12 h-8 rounded-md border ${
                      option === "dark"
                        ? "bg-slate-800 border-slate-600"
                        : "bg-white border-slate-200"
                    }`}
                  />
                  <span className="text-sm font-medium capitalize text-slate-700 dark:text-slate-300">
                    {option}
                  </span>
                  {theme === option && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Active</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Keyboard shortcuts reference */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">Keyboard shortcuts</h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          {[
            ["Ctrl / Cmd + S", "Save document"],
            ["Ctrl / Cmd + /", "Slash commands"],
            ["Ctrl / Cmd + K", "Search"],
            ["Tab", "Indent list item"],
            ["Shift + Tab", "Outdent list item"],
            ["Ctrl / Cmd + B", "Bold"],
            ["Ctrl / Cmd + I", "Italic"],
            ["Ctrl / Cmd + Z", "Undo"],
          ].map(([key, description]) => (
            <div key={key} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-700 col-span-1">
              <span className="text-slate-500 dark:text-slate-400">{description}</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs">
                {key}
              </kbd>
            </div>
          ))}
        </dl>
      </section>

      {/* About */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-3">About</h2>
        <dl className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex gap-4">
            <dt className="w-32 font-medium text-slate-700 dark:text-slate-300">Product</dt>
            <dd>Product Docs</dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-32 font-medium text-slate-700 dark:text-slate-300">Phase</dt>
            <dd>3 — Boards, Permissions &amp; Branding</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
