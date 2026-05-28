import { prisma } from "@/lib/db";
import { PublicSearchBox } from "@/components/Search/PublicSearchBox";
import { DocsNavigation } from "@/components/Docs/DocsNavigation";
import { Suspense } from "react";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const folders = await prisma.folder.findMany({
    include: {
      documents: {
        where: { status: "PUBLISHED" },
        select: { id: true },
      },
    },
    orderBy: { order: "asc" },
  });

  const uncategorizedCount = await prisma.document.count({
    where: { status: "PUBLISHED", folderId: null },
  });

  const totalCount = folders.reduce(
    (sum, folder) => sum + folder.documents.length,
    uncategorizedCount
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Categories
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Browse public docs by category.
                </p>
              </div>

              <nav className="space-y-2 text-sm text-slate-700">
                <Suspense fallback={<div className="h-64 bg-slate-100 rounded animate-pulse" />}>
                  <DocsNavigation
                    folders={folders}
                    uncategorizedCount={uncategorizedCount}
                    totalCount={totalCount}
                  />
                </Suspense>
              </nav>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Search
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Search published docs instantly.
              </p>
              <div className="mt-4">
                <PublicSearchBox />
              </div>
            </div>
          </aside>

          <section className="space-y-10">{children}</section>
        </div>
      </div>
    </div>
  );
}
