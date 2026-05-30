import { useState, useEffect } from "react";

interface ShareLink {
  id: string;
  token: string;
  url: string;
  expiresAt?: string;
  viewCount: number;
  createdAt: string;
}

interface ShareModalProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

interface ShareLink {
  id: string;
  token: string;
  url: string;
  expiresAt?: string;
  viewCount: number;
  createdAt: string;
}

interface ShareModalProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ documentId, isOpen, onClose }: ShareModalProps) {
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expiresIn, setExpiresIn] = useState<string>(""); // empty = no expiration
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchLinks();
    }
  }, [isOpen, documentId]);

  const fetchLinks = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/documents/${documentId}/share`);
      if (!response.ok) throw new Error("Failed to fetch share links");
      const data = await response.json();
      setLinks(data.links);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching links");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const body: any = {};

      // Parse expiration time
      if (expiresIn) {
        const match = expiresIn.match(/(\d+)([dmh])/);
        if (match) {
          const value = parseInt(match[1]);
          const unit = match[2];
          const ms =
            unit === "d"
              ? value * 24 * 60 * 60 * 1000
              : unit === "h"
                ? value * 60 * 60 * 1000
                : value * 60 * 1000;
          body.expiresIn = ms;
        }
      }

      const response = await fetch(`/api/documents/${documentId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to create share link");

      setSuccess("Share link created!");
      setExpiresIn("");
      await fetchLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating link");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (linkId: string) => {
    if (!confirm("Delete this share link?")) return;

    try {
      const response = await fetch(`/api/documents/${documentId}/share`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId }),
      });

      if (!response.ok) throw new Error("Failed to delete link");

      setSuccess("Share link deleted");
      await fetchLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting link");
    }
  };

  const copyToClipboard = (url: string, linkId: string) => {
    navigator.clipboard.writeText(url);
    setCopied(linkId);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Share Document</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <CloseIcon />
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded text-sm">{success}</div>}

        {/* Existing Links */}
        <div className="mb-6">
          <h3 className="font-semibold text-sm mb-3">Active share links</h3>
          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : links.length === 0 ? (
            <div className="text-sm text-gray-500">No share links yet</div>
          ) : (
            <div className="space-y-2">
              {links.map((link) => (
                <div key={link.id} className="p-3 bg-gray-50 rounded">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <button
                      onClick={() => copyToClipboard(link.url, link.id)}
                      className="flex-1 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm truncate"
                    >
                      <LinkIcon />
                      <span className="truncate">{link.token.slice(0, 8)}...</span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(link.url, link.id)}
                      className="p-1 hover:bg-blue-100 text-blue-600 rounded transition"
                    >
                      {copied === link.id ? <CheckIcon /> : <CopyIcon />}
                    </button>
                    <button
                      onClick={() => handleRevoke(link.id)}
                      className="p-1 hover:bg-red-100 text-red-600 rounded"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{link.viewCount} views</span>
                    {link.expiresAt && (
                      <span className="flex items-center gap-1">
                        <CalendarIcon />
                        Expires {formatDate(link.expiresAt)}
                      </span>
                    )}
                    {!link.expiresAt && <span>Never expires</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create New Link */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-sm mb-3">Create new link</h3>
          <form onSubmit={handleCreateLink} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Expiration</label>
              <select
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Never expires</option>
                <option value="1h">1 hour</option>
                <option value="24h">1 day</option>
                <option value="7d">7 days</option>
                <option value="30d">30 days</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              <LinkIcon />
              {creating ? "Creating..." : "Create share link"}
            </button>
          </form>

          <p className="text-xs text-gray-600 mt-3">
            Anyone with the link can view this document (if set to public)
          </p>
        </div>
      </div>
    </div>
  );
}
