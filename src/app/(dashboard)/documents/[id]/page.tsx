"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { RichEditor } from "@/components/Editor/RichEditor";

export default function DocumentPage() {
  const [document, setDocument] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const readOnly = userRole === "VIEWER";

  useEffect(() => {
    async function fetchDocument() {
      try {
        const [meRes, docRes] = await Promise.all([
          fetch("/api/auth/me", { credentials: "include" }),
          fetch(`/api/documents/${id}`, { credentials: "include" }),
        ]);

        if (meRes.ok) {
          const me = await meRes.json();
          setUserRole(me.role);
        }

        if (!docRes.ok) {
          router.push("/documents");
          return;
        }

        const data = await docRes.json();
        setDocument(data);
        setTitle(data.title);
        setContent(data.content);
        setStatus(data.status);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching document:", err);
        setLoading(false);
      }
    }

    fetchDocument();
  }, [id, router]);

  async function handleSave() {
    if (readOnly) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, content, status }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to save document");
        return;
      }

      const data = await response.json();
      setDocument(data);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div>Loading document...</div>;
  }

  if (!document) {
    return <div>Document not found</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <Link href="/documents" className="text-blue-600 hover:underline">
          ← Back to Documents
        </Link>
        {!readOnly && (
          <div className="flex gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
        {readOnly && (
          <span className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded">
            Read-only · {status}
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded shadow p-8">
        <div className="mb-6">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Title
          </label>
          {readOnly ? (
            <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          ) : (
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
            />
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          {readOnly ? (
            <div
              className="prose max-w-none border border-gray-200 rounded p-6 min-h-[200px]"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <RichEditor
              value={content}
              onChange={setContent}
              placeholder="Start writing your document..."
            />
          )}
        </div>

        {!readOnly && (
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Document"}
            </button>
            <Link
              href="/documents"
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Back
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
