"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Activity {
  id: string;
  action: string;
  userId: string;
  documentId?: string;
  user: {
    name: string;
    email: string;
  };
  document?: {
    title: string;
  };
  metadata?: Record<string, any>;
  createdAt: string;
}

interface ActivityResponse {
  activities: Activity[];
  total: number;
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await fetch("/api/activity?limit=50", {
          credentials: "include",
        });

        if (!response.ok) {
          setError("Failed to load activity log");
          setLoading(false);
          return;
        }

        const data: ActivityResponse = await response.json();
        setActivities(data.activities);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching activities:", err);
        setError("Failed to load activity log");
        setLoading(false);
      }
    }

    fetchActivities();
  }, []);

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      CREATE_DOCUMENT: "Created document",
      UPDATE_DOCUMENT: "Updated document",
      DELETE_DOCUMENT: "Deleted document",
      PUBLISH_DOCUMENT: "Published document",
      ARCHIVE_DOCUMENT: "Archived document",
      CREATE_FOLDER: "Created folder",
      UPDATE_FOLDER: "Updated folder",
      DELETE_FOLDER: "Deleted folder",
      UPLOAD_MEDIA: "Uploaded media",
      CREATE_USER: "Created user",
      UPDATE_USER: "Updated user",
      DELETE_USER: "Deleted user",
      LOGIN: "Logged in",
      LOGOUT: "Logged out",
    };
    return labels[action] || action;
  };

  if (loading) {
    return <div className="text-center py-12">Loading activity log...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Activity Log</h1>
        <p className="text-gray-600">Recent user activities in the system</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {activities.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No activities yet
        </div>
      ) : (
        <div className="bg-white rounded shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900">
                      {getActionLabel(activity.action)}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      <div className="font-medium">{activity.user.name}</div>
                      <div className="text-xs text-gray-500">
                        {activity.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {activity.document ? (
                        <Link
                          href={`/documents/${activity.documentId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {activity.document.title}
                        </Link>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {new Date(activity.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
