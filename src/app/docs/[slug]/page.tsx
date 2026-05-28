import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";

function sanitizeHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/on[a-z]+\s*=\s*(['\"]).*?\1/gi, "");
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildToc(html: string) {
  const headings: Array<{ id: string; title: string; level: number }> = [];
  const content = html.replace(/<(h[2-3])>(.*?)<\/\1>/gi, (_, tag, text) => {
    const title = text.replace(/<[^>]+>/g, "");
    const id = slugify(title);
    headings.push({ id, title, level: Number(tag[1]) });
    return `<${tag} id="${id}">${text}</${tag}>`;
  });
  return { content, headings };
}

export default async function DocDetailPage(props: any) {
  const params = props.params as { slug: string };
  const document = await prisma.document.findUnique({
    where: { slug: params.slug },
    include: {
      creator: { select: { name: true, email: true } },
      folder: { select: { name: true } },
    },
  });

  if (!document || document.status !== "PUBLISHED") {
    notFound();
  }

  const { content, headings } = buildToc(document.content);

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/docs" className="text-blue-600 hover:underline text-sm">
              ← Back to published docs
            </Link>
            <h1 className="mt-4 text-4xl font-bold text-slate-900">{document.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span>{document.folder?.name || "Documentation"}</span>
              <span>•</span>
              <span>{new Date(document.updatedAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>By {document.creator?.name || document.creator?.email || "Author"}</span>
            </div>
          </div>
          <Link href="/login" className="rounded bg-white px-4 py-2 text-sm text-slate-700 border border-slate-200 hover:bg-slate-100">
            Author sign in
          </Link>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.35fr_280px]">
          <article className="prose prose-slate max-w-none rounded-3xl bg-white p-8 shadow-sm">
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
          </article>

          <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                On this page
              </p>
              {headings.length === 0 ? (
                <p className="mt-4 text-sm text-slate-600">Add headings to your document for a table of contents.</p>
              ) : (
                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                  {headings.map((heading) => (
                    <li key={heading.id} className={heading.level === 3 ? "pl-4" : ""}>
                      <a
                        href={`#${heading.id}`}
                        className="block rounded px-2 py-1 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      >
                        {heading.title}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
