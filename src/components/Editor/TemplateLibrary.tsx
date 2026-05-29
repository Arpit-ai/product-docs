"use client";

import { useEffect, useState } from "react";

export interface TemplateRecord {
  id: string;
  name: string;
  blocks: any[];
  folderId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TemplateLibraryProps {
  open: boolean;
  onClose: () => void;
  onInsert: (blocks: any[]) => void;
  onSave: (name: string) => Promise<void>;
}

export function TemplateLibrary({ open, onClose, onInsert, onSave }: TemplateLibraryProps) {
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/templates", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load templates");
        return res.json();
      })
      .then((data) => setTemplates(data.templates || []))
      .catch((err) => {
        console.error(err);
        setError("Unable to load templates.");
      })
      .finally(() => setLoading(false));
  }, [open]);

  const handleSave = async () => {
    if (!newTemplateName.trim()) {
      setError("Please provide a template name.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave(newTemplateName.trim());
      setNewTemplateName("");
      setTimeout(() => {
        fetch("/api/templates", { credentials: "include" })
          .then(async (res) => {
            if (!res.ok) throw new Error("Failed to reload templates");
            return res.json();
          })
          .then((data) => setTemplates(data.templates || []))
          .catch((err) => {
            console.error(err);
          });
      }, 200);
    } catch (err) {
      console.error(err);
      setError("Failed to save template.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Delete failed");
      setTemplates((current) => current.filter((template) => template.id !== templateId));
    } catch (err) {
      console.error(err);
      setError("Unable to delete template.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black/40 p-6">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Template library</h2>
            <p className="mt-1 text-sm text-slate-500">
              Save reusable block groups and insert them into any document.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Create new template</h3>
              <p className="mt-2 text-sm text-slate-600">
                Save the current document structure as a reusable template.
              </p>

              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(event) => setNewTemplateName(event.target.value)}
                  placeholder="Template name"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving template..." : "Save current page as template"}
                </button>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-slate-900">Templates</h3>
                <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  {templates.length} saved
                </span>
              </div>

              {loading ? (
                <div className="text-sm text-slate-500">Loading templates…</div>
              ) : templates.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  No templates saved yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="rounded-3xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900">{template.name}</h4>
                          <p className="mt-1 text-xs text-slate-500">
                            {template.blocks?.length ?? 0} blocks · saved {new Date(template.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onInsert(template.blocks)}
                            className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 hover:bg-slate-100"
                          >
                            Insert
                          </button>
                          <button
                            onClick={() => handleDelete(template.id)}
                            className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-700 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">How templates work</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Templates capture the current editor block structure. Inserting a template adds its blocks directly into the current document, so you can reuse sections like onboarding flows, release notes, or page layouts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
