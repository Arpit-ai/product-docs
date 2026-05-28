"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SearchBox } from "@/components/Search/SearchBox";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include", // Include httpOnly cookies
        });

        if (!response.ok) {
          router.push("/login");
          return;
        }

        const userData = await response.json();
        setUser(userData);
        setLoading(false);
      } catch {
        router.push("/login");
      }
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/login");
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">Product Docs</h1>
        </div>
        <div className="px-4 mt-4">
          <SearchBox />
        </div>
        <nav className="mt-6 px-4 space-y-2">
          <Link
            href="/documents"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
          >
            Documents
          </Link>
          {user?.role === "ADMIN" && (
            <>
              <Link
                href="/users"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                Users
              </Link>
              <Link
                href="/activity"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                Activity
              </Link>
            </>
          )}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 w-64 p-6 border-t">
          <div className="text-sm text-gray-600 mb-4">
            <p className="font-medium">{user?.name}</p>
            <p className="text-gray-500">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
