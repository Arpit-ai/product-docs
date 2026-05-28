"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("/api/users", {
          credentials: "include",
        });

        if (!response.ok) {
          setError("Failed to load users");
          return;
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  async function updateUser(id: string, updates: { role?: string; active?: boolean }) {
    setError("");
    setFeedback("");
    setSavingUserId(id);

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to update user");
        return;
      }

      const updated = await response.json();
      setUsers((current) => current.map((user) => (user.id === id ? updated : user)));
      setFeedback("User updated successfully.");
    } catch (err) {
      console.error("Error updating user:", err);
      setError("Failed to update user");
    } finally {
      setSavingUserId(null);
    }
  }

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">User Management</h1>
      <p className="text-gray-600 mb-8">All registered users in the system</p>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {feedback && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800">{feedback}</p>
        </div>
      )}

      {users.length === 0 ? (
        <p className="text-gray-500">No users found</p>
      ) : (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium">{user.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-3 text-sm">
                    <select
                      value={user.role}
                      onChange={(e) => updateUser(user.id, { role: e.target.value })}
                      disabled={savingUserId === user.id}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="EDITOR">Editor</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                        user.active
                          ? "bg-green-50 text-green-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {user.active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 text-sm space-x-2">
                    <button
                      type="button"
                      onClick={() => updateUser(user.id, { active: !user.active })}
                      disabled={savingUserId === user.id}
                      className="rounded px-3 py-1 text-sm border border-gray-300 bg-white hover:bg-gray-50"
                    >
                      {user.active ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
