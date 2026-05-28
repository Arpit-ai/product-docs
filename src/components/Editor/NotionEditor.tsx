"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import EditorJS, { OutputData, ToolConstructable } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";
import List from "@editorjs/list";
import Code from "@editorjs/code";
import Quote from "@editorjs/quote";
import Image from "@editorjs/image";
// @ts-ignore - @editorjs/embed has type issues
import Embed from "@editorjs/embed";
import Table from "@editorjs/table";
// @ts-ignore - @editorjs/marker has type issues
import Marker from "@editorjs/marker";
// @ts-ignore - @editorjs/inline-code has type issues
import InlineCode from "@editorjs/inline-code";
// @ts-ignore - @editorjs/checklist has type issues
import Checklist from "@editorjs/checklist";
// @ts-ignore - @editorjs/delimiter has type issues
import Delimiter from "@editorjs/delimiter";

interface NotionEditorProps {
  initialData?: OutputData;
  onChange?: (data: OutputData) => void;
  onSave?: (data: OutputData) => void;
  placeholder?: string;
  readOnly?: boolean;
}

// Slash command tool for block insertion
class SlashCommand {
  private editor: EditorJS | null = null;
  private slashMenuElement: HTMLElement | null = null;
  private currentQuery = "";
  private selectedIndex = 0;

  constructor() {
    this.setupSlashCommands();
  }

  render() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(document.createElement("div")), 0);
    });
  }

  private setupSlashCommands() {
    if (typeof window === "undefined") return;

    document.addEventListener("keydown", (e) => {
      if (e.key === "/") {
        this.showSlashMenu();
      }
    });
  }

  private showSlashMenu() {
    const blocks = [
      { name: "Heading 1", shortcut: "h1", action: () => this.insertBlock("header", { level: 1 }) },
      { name: "Heading 2", shortcut: "h2", action: () => this.insertBlock("header", { level: 2 }) },
      { name: "Heading 3", shortcut: "h3", action: () => this.insertBlock("header", { level: 3 }) },
      { name: "Paragraph", shortcut: "p", action: () => this.insertBlock("paragraph") },
      { name: "Bulleted List", shortcut: "ul", action: () => this.insertBlock("list", { style: "unordered" }) },
      { name: "Numbered List", shortcut: "ol", action: () => this.insertBlock("list", { style: "ordered" }) },
      { name: "Checklist", shortcut: "check", action: () => this.insertBlock("checklist") },
      { name: "Code", shortcut: "code", action: () => this.insertBlock("code") },
      { name: "Quote", shortcut: "quote", action: () => this.insertBlock("quote") },
      { name: "Table", shortcut: "table", action: () => this.insertBlock("table", { rows: 3, cols: 3 }) },
      { name: "Image", shortcut: "image", action: () => this.insertBlock("image") },
      { name: "Divider", shortcut: "hr", action: () => this.insertBlock("delimiter") },
    ];

    console.log("Slash commands available:", blocks.map(b => b.name).join(", "));
  }

  private insertBlock(type: string, data?: any) {
    console.log(`Insert block: ${type}`, data);
  }
}

export function NotionEditor({
  initialData,
  onChange,
  onSave,
  placeholder = "Start typing or press / for commands...",
  readOnly = false,
}: NotionEditorProps) {
  const editorContainer = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<EditorJS | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState<OutputData | null>(initialData || null);

  const handleSave = useCallback(async () => {
    if (!editorInstance.current) return;

    setIsSaving(true);
    try {
      const outputData = await editorInstance.current.save();
      setContent(outputData);
      onSave?.(outputData);
    } catch (error) {
      console.error("Saving failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  const handleChange = useCallback(async () => {
    if (!editorInstance.current) return;

    try {
      const outputData = await editorInstance.current.save();
      setContent(outputData);
      onChange?.(outputData);
    } catch (error) {
      console.error("Change detection failed:", error);
    }
  }, [onChange]);

  useEffect(() => {
    if (!editorContainer.current) return;

    const tools: Record<string, ToolConstructable | any> = {
      header: {
        class: Header,
        config: {
          levels: [1, 2, 3, 4, 5, 6],
          defaultLevel: 2,
        },
      },
      paragraph: {
        class: Paragraph,
        inlineToolbar: true,
        config: {
          preserveBlank: true,
        },
      },
      list: {
        class: List,
        inlineToolbar: true,
      },
      code: {
        class: Code,
        config: {
          language: "javascript",
        },
      },
      quote: {
        class: Quote,
        inlineToolbar: true,
      },
      image: {
        class: Image,
        config: {
          endpoints: {
            byFile: "/api/media/upload",
            byUrl: "/api/media/upload",
          },
          field: "file",
          types: ["image/jpeg", "image/gif", "image/png", "image/webp"],
          captionPlaceholder: "Add a caption...",
          buttonContent: "📸 Choose image",
          additionalRequestHeaders: {},
        },
      },
      embed: {
        class: Embed,
        config: {
          services: {
            youtube: true,
            codepen: true,
            gist: true,
            twitter: true,
            instagram: true,
            vimeo: true,
          },
        },
      },
      table: {
        class: Table,
        inlineToolbar: true,
      },
      marker: Marker,
      inlineCode: InlineCode,
      checklist: Checklist,
      delimiter: Delimiter,
    };

    const editor = new EditorJS({
      holder: editorContainer.current,
      tools,
      data: initialData || {
        blocks: [
          {
            type: "paragraph",
            data: { text: placeholder },
          },
        ],
      },
      placeholder: placeholder,
      readOnly: readOnly,
      onReady: () => {
        setIsLoading(false);
        editorInstance.current?.focus();
      },
      onChange: handleChange,
      autofocus: true,
    });

    editorInstance.current = editor;

    return () => {
      if (editorInstance.current) {
        editorInstance.current.destroy();
        editorInstance.current = null;
      }
    };
  }, [initialData, placeholder, readOnly, handleChange]);

  return (
    <div className="notion-editor-wrapper">
      <style>{`
        .notion-editor-wrapper {
          width: 100%;
          background: white;
          border-radius: 12px;
          overflow: hidden;
        }

        .ce-editor {
          padding: 2rem;
        }

        .ce-block {
          margin-bottom: 1rem;
        }

        .ce-paragraph {
          font-size: 1rem;
          line-height: 1.6;
          color: #1f2937;
        }

        .ce-header {
          margin: 0.75rem 0;
          color: #111827;
          font-weight: 700;
        }

        .ce-header--h1 {
          font-size: 2rem;
        }

        .ce-header--h2 {
          font-size: 1.75rem;
        }

        .ce-header--h3 {
          font-size: 1.5rem;
        }

        .ce-code {
          background: #1f2937;
          color: #f3f4f6;
          padding: 1rem;
          border-radius: 8px;
          font-family: "Fira Code", monospace;
          font-size: 0.875rem;
          overflow-x: auto;
        }

        .ce-quote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          color: #6b7280;
          font-style: italic;
        }

        .ce-quote__text {
          font-size: 1.1rem;
        }

        .ce-list__item {
          margin-bottom: 0.5rem;
        }

        .ce-list--ordered {
          list-style: decimal;
        }

        .ce-list--unordered {
          list-style: disc;
        }

        .ce-checklist__item-checkbox {
          margin-right: 0.75rem;
        }

        .ce-image {
          margin: 1.5rem 0;
          border-radius: 8px;
          overflow: hidden;
        }

        .ce-image__image-holder {
          max-width: 100%;
        }

        .ce-image__picture {
          max-width: 100%;
          height: auto;
        }

        .ce-table {
          margin: 1rem 0;
          border-collapse: collapse;
          width: 100%;
        }

        .ce-table td {
          border: 1px solid #e5e7eb;
          padding: 0.75rem;
        }

        .ce-toolbar {
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          padding: 0.75rem;
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .ce-toolbar__plus {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: white;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          transition: all 0.2s;
        }

        .ce-toolbar__plus:hover {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .ce-popover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .ce-popover__item {
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .ce-popover__item:hover {
          background: #f0f9ff;
        }

        .ce-settings {
          padding: 0.5rem;
        }

        .ce-settings__button {
          padding: 0.5rem 0.75rem;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
          background: white;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .ce-settings__button:hover {
          background: #f3f4f6;
        }
      `}</style>

      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      <div
        ref={editorContainer}
        id="notion-editor"
        className={isLoading ? "hidden" : ""}
      />

      <div className="flex gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
        <div className="flex-1" />
        <div className="text-sm text-slate-500">
          {content?.blocks.length || 0} blocks
        </div>
      </div>
    </div>
  );
}
