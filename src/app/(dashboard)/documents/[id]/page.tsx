"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { NotionEditor } from "@/components/Editor/NotionEditor";
import { OutputData } from "@editorjs/editorjs";

export default function DocumentPage() {
  const [document, setDocument] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [editorContent, setEditorContent] = useState<OutputData | null>(null);
  const [status, setStatus] = useState("DRAFT");
  const [folderId, setFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const readOnly = userRole === "VIEWER";

  useEffect(() => {
    async function loadData() {
      try {
        const meRes = await fetch("/api/auth/me", { credentials: "include" });
        const docRes = await fetch(`/api/documents/${id}`, { credentials: "include" });
        const foldersRes = await fetch("/api/folders", { credentials: "include" });
        const versionsRes = await fetch(`/api/documents/${id}/versions`, { credentials: "include" });

        if (meRes.ok) {
          const me = await meRes.json();
          setUserRole(me.role);
        }

        if (!docRes.ok) {
          router.push("/documents");
          return;
        }

        const doc = await docRes.json();
        setDocument(doc);
        setTitle(doc.title);

        try {
          setEditorContent(JSON.parse(doc.content));
        } catch {
          setEditorContent({
            blocks: [
              {
                type: "paragraph",
                data: { text: doc.content || "" },
              },
            ],
          });
        }

        setStatus(doc.status);
        setFolderId(doc.folder?.id ?? null);

        if (foldersRes.ok) {
          const foldersData = await foldersRes.json();
          setFolders(foldersData);
        }

        if (versionsRes.ok) {
          const versionsData = await versionsRes.json();
          setVersions(versionsData);
        }
      } catch (err) {
        console.error("Error fetching document:", err);
        setError("Failed to load document");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, router]);

  async function handleSave(data: OutputData) {
    if (readOnly) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title || "Untitled",
          content: JSON.stringify(data),
          status,
          folderId: folderId || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to save document");
        return;
      }

      const updatedDoc = await response.json();
      setDocument(updatedDoc);
      setSuccess("Document saved successfully!");

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error saving document:", err);
      setError("An error occurred while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href="/documents"
                  className="text-slate-500 hover:text-slate-700 transition"
                >
                  ← Documents
                </Link>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled document..."
                className="w-full bg-transparent text-3xl font-bold text-slate-900 outline-none"
                disabled={readOnly}
              />
            </div>
            <div className="flex gap-2">
              {document?.status && (
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={readOnly}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:border-slate-400 disabled:opacity-50"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
            <div>
              {document?.author && (
                <>by <span className="font-medium">{document.author.name}</span></>
              )}
            </div>
            {document?.createdAt && (
              <div>
                Created{" "}
                <time dateTime={document.createdAt}>
                  {new Date(document.createdAt).toLocaleDateString()}
                </time>
              </div>
            )}
            {document?.updatedAt && (
              <div>
                Updated{" "}
                <time dateTime={document.updatedAt}>
                  {new Date(document.updatedAt).toLocaleDateString()}
                </time>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
            ✓ {success}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div>
            <div className="rounded-2xl bg-white shadow-sm border border-slate-200">
              {editorContent ? (
                <NotionEditor
                  initialData={editorContent}
                  onSave={handleSave}
                  readOnly={readOnly}
                  placeholder="Start typing or press / for commands..."
                />
              ) : (
                <div className="p-8 text-center text-slate-500">
                  Loading editor...
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            {!readOnly && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Folder
                </label>
                <select
                  value={folderId || ""}
                  onChange={(e) => setFolderId(e.target.value || null)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">No folder</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <button
                onClick={() => setShowVersions(!showVersions)}
                className="w-full flex items-center justify-between text-sm font-semibold text-slate-900 hover:text-blue-600 transition mb-3"
              >
                <span>Version History</span>
                <span className="text-xs bg-slate-100 rounded-full px-2 py-1">
                  {versions.length}
                </span>
              </button>

              {showVersions && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {versions.length === 0 ? (
                    <p className="text-xs text-slate-500 p-2">No versions yet</p>
                  ) : (
                    versions.slice(0, 10).map((version) => (
                      <div
                        key={version.id}
                        className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-200"
                      >
                        <div className="font-medium text-slate-900">
                          {new Date(version.createdAt).toLocaleString()}
                        </div>
                        <div className="text-slate-600 mt-1 text-xs line-clamp-2">
                          {version.message || "No message"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">
                Document Info
              </div>
              <dl className="space-y-2 text-xs">
                <div>
                  <dt className="text-slate-600">ID</dt>
                  <dd className="font-mono text-slate-900 break-all">{id}</dd>
                </div>
                <div>
                  <dt className="text-slate-600">Status</dt>
                  <dd>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      status === "PUBLISHED"
                        ? "bg-green-100 text-green-800"
                        : status === "DRAFT"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {status}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
