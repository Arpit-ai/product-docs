"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Folder {
  id: string;
  name: string;
  slug: string;
  documents: { id: string }[];
}

interface DocsNavigationProps {
  folders: Folder[];
  uncategorizedCount: number;
  totalCount: number;
}

export function DocsNavigation({
  folders,
  uncategorizedCount,
  totalCount,
}: DocsNavigationProps) {
  const searchParams = useSearchParams();
  const activeFolder = searchParams.get("folder");

  const isActive = (folder: string | null): boolean => {
    if (folder === null) {
      return !activeFolder;
    }
    return activeFolder === folder;
  };

  const getLinkClass = (isCurrentActive: boolean): string => {
    return `block rounded-xl px-3 py-2 transition ${
      isCurrentActive
        ? "bg-blue-50 text-blue-700 font-medium"
        : "text-slate-600 hover:bg-slate-50"
    }`;
  };

  return (
    <nav className="space-y-2 text-sm text-slate-700">
      <Link
        href="/docs"
        className={getLinkClass(isActive(null))}
      >
        All docs ({totalCount})
      </Link>
      {folders.map((folder) => (
        <Link
          key={folder.id}
          href={`/docs?folder=${folder.slug}`}
          className={getLinkClass(isActive(folder.slug))}
        >
          {folder.name} ({folder.documents.length})
        </Link>
      ))}
      <Link
        href="/docs?folder=uncategorized"
        className={getLinkClass(isActive("uncategorized"))}
      >
        Uncategorized ({uncategorizedCount})
      </Link>
    </nav>
  );
}
