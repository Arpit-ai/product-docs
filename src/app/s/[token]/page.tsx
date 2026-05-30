"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface ShareResource {
  resource: {
    id: string;
    title?: string;
    name?: string;
    content?: string;
    creator?: { name: string };
    documents?: Array<{ id: string; title: string; slug: string; updatedAt: string }>;
  };
  resourceType: "document" | "folder";
  expiresAt?: string;
}

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<ShareResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchShare = async () => {
      try {
        const response = await fetch(`/api/share/${token}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Share link not found");
          } else if (response.status === 410) {
            setError("This share link has expired");
          } else {
            setError("Unable to access shared content");
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setData(data);
      } catch (err) {
        setError("Error loading shared content");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchShare();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <div className="mb-4 text-4xl">🔗</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Share Link Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const resource = data.resource;
  const title = data.resourceType === "document" ? resource.title : resource.name;
  const creatorName = resource.creator?.name || "Anonymous";
  const expiresDate = data.expiresAt
    ? new Date(data.expiresAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Never";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Shared by <span className="font-medium">{creatorName}</span> • Expires{" "}
                <span className="font-medium">{expiresDate}</span>
              </p>
            </div>
            <Link
              href="/"
              className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Home
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {data.resourceType === "document" ? (
          <div className="bg-white rounded-lg shadow">
            <div className="prose prose-sm max-w-none p-8">
              {resource.content ? (
                <div
                  dangerouslySetInnerHTML={{ __html: resource.content }}
                  className="text-gray-800"
                />
              ) : (
                <p className="text-gray-500">This document has no content yet.</p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contents</h2>
            {resource.documents && resource.documents.length > 0 ? (
              <div className="grid gap-3">
                {resource.documents.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/docs/${doc.slug}`}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{doc.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Updated{" "}
                          {new Date(doc.updatedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">This folder has no documents yet.</p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center text-sm text-gray-600">
          <p>This is a shared document. For questions, contact the document owner.</p>
        </div>
      </div>
    </div>
  );
}
