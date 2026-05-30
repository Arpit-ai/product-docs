import { useState, useEffect } from "react";

interface AccessUser {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "EDITOR" | "COMMENTER" | "VIEWER";
}

interface AccessControlModalProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

interface AccessUser {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "EDITOR" | "COMMENTER" | "VIEWER";
}

interface AccessControlModalProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AccessControlModal({ documentId, isOpen, onClose }: AccessControlModalProps) {
  const [access, setAccess] = useState<AccessUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"VIEWER" | "COMMENTER" | "EDITOR">("VIEWER");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchAccess();
    }
  }, [isOpen, documentId]);

  const fetchAccess = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/documents/${documentId}/access`);
      if (!response.ok) throw new Error("Failed to fetch access");
      const data = await response.json();
      setAccess(data.access);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching access");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/documents/${documentId}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: newEmail, // This would typically be resolved server-side from email
          role: newRole,
        }),
      });

      if (!response.ok) throw new Error("Failed to grant access");

      setSuccess("Access granted successfully");
      setNewEmail("");
      setNewRole("VIEWER");
      await fetchAccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error granting access");
    } finally {
      setAdding(false);
    }
  };

  const handleRevoke = async (userId: string) => {
    if (!confirm("Remove this user's access?")) return;

    try {
      const response = await fetch(`/api/documents/${documentId}/access`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) throw new Error("Failed to revoke access");

      setSuccess("Access revoked");
      await fetchAccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error revoking access");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Manage Access</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <CloseIcon />
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded text-sm">{success}</div>}

        {/* Current Access List */}
        <div className="mb-6">
          <h3 className="font-semibold text-sm mb-3">People with access</h3>
          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : access.length === 0 ? (
            <div className="text-sm text-gray-500">Only you have access</div>
          ) : (
            <div className="space-y-2">
              {access.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {user.role}
                    </span>
                    {user.role !== "OWNER" && (
                      <button
                        onClick={() => handleRevoke(user.id)}
                        className="p-1 hover:bg-red-100 text-red-600 rounded"
                        title="Remove access"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Access Form */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-sm mb-3">Grant access</h3>
          <form onSubmit={handleAddAccess} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@example.com"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="VIEWER">Viewer (read-only)</option>
                <option value="COMMENTER">Commenter (read + comment)</option>
                <option value="EDITOR">Editor (read + edit)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={adding}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              <PlusIcon />
              {adding ? "Adding..." : "Add person"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
