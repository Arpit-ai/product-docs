"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const canEdit = userRole === "ADMIN" || userRole === "EDITOR";

  useEffect(() => {
    async function fetchData() {
      try {
        const [meRes, docsRes] = await Promise.all([
          fetch("/api/auth/me", { credentials: "include" }),
          fetch("/api/documents", { credentials: "include" }),
        ]);

        if (meRes.ok) {
          const me = await meRes.json();
          setUserRole(me.role);
        }

        if (docsRes.ok) {
          const data = await docsRes.json();
          setDocuments(data);
        }
      } catch (err) {
        console.error("Error fetching documents:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading documents...</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Documents</h1>
          {userRole === "VIEWER" && (
            <p className="text-sm text-gray-500 mt-1">Read-only access</p>
          )}
        </div>
        {canEdit && (
          <Link
            href="/documents/new"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            New Document
          </Link>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No documents yet</p>
          {canEdit && (
            <Link
              href="/documents/new"
              className="text-blue-600 hover:text-blue-700"
            >
              Create your first document
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc: any) => (
            <div
              key={doc.id}
              className="p-4 bg-white rounded shadow hover:shadow-lg transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Link href={`/documents/${doc.id}`}>
                  <h3 className="text-lg font-semibold text-blue-600 hover:underline">
                    {doc.title}
                  </h3>
                </Link>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {doc.status}
                </span>
              </div>
              <div className="mt-3 text-sm text-gray-600 flex flex-wrap gap-2">
                {doc.folder ? (
                  <span className="px-2 py-1 bg-gray-100 rounded">Folder: {doc.folder.name}</span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 rounded">No folder</span>
                )}
                <span>Updated {new Date(doc.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
