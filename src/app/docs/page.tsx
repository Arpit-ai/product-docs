import Link from "next/link";
import { prisma } from "@/lib/db";

function getExcerpt(content: string) {
  const text = content.replace(/<[^>]+>/g, "");
  return text.length > 180 ? `${text.substring(0, 180)}...` : text;
}

export default async function DocsPage(props: any) {
  const folderSlug = props.searchParams?.folder;
  let folderName: string | null = null;

  const where: any = { status: "PUBLISHED" };
  if (folderSlug === "uncategorized") {
    where.folderId = null;
    folderName = "Uncategorized";
  } else if (folderSlug) {
    const folder = await prisma.folder.findUnique({
      where: { slug: folderSlug },
      select: { name: true, id: true },
    });
    if (folder) {
      where.folderId = folder.id;
      folderName = folder.name;
    }
  }

  const docs = await prisma.document.findMany({
    where,
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      updatedAt: true,
      folder: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  return (
    <main>
      <div className="space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <header className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-600 font-semibold">Public Documentation</p>
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                {folderName ? `${folderName} docs` : "Browse published docs"}
              </h1>
              <p className="mt-4 max-w-2xl text-base text-slate-600">
                Public-facing documentation for your product, user guides, and knowledge base.
                Author content in the editor, publish it, and share it externally.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/login" className="rounded bg-blue-600 px-5 py-3 text-white shadow hover:bg-blue-700">
                Author sign in
              </Link>
              <Link href="/documents" className="rounded border border-slate-200 bg-white px-5 py-3 text-slate-700 hover:bg-slate-100">
                Dashboard
              </Link>
            </div>
          </div>
        </header>

        <section>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                {folderName ? `Published docs in ${folderName}` : "Latest published docs"}
              </h2>
              <p className="text-sm text-slate-600">
                Updated content that your audience can access publicly.
              </p>
            </div>
            <div className="text-sm text-slate-500">Total {docs.length} docs</div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {docs.map((doc) => (
              <article key={doc.slug} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:bg-white hover:shadow-lg">
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 uppercase tracking-[0.18em] font-semibold">
                  <span>{doc.folder?.name || "Documentation"}</span>
                  <span>•</span>
                  <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-900">
                  <Link href={`/docs/${doc.slug}`} className="hover:text-blue-600">{doc.title}</Link>
                </h3>
                <p className="mt-3 text-slate-600 leading-7">{getExcerpt(doc.content)}</p>
                <div className="mt-6">
                  <Link href={`/docs/${doc.slug}`} className="text-blue-600 font-medium hover:underline">
                    Read the guide →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
