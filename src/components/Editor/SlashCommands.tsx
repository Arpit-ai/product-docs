"use client";

import { useEffect, useRef, useState } from "react";

interface SlashCommandProps {
  onCommand: (command: string, data?: any) => void;
  editorElement: HTMLElement | null;
}

export function SlashCommandHandler({ onCommand, editorElement }: SlashCommandProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const commands = [
    { label: "H1", icon: "H1", action: "heading", data: { level: 1 } },
    { label: "H2", icon: "H2", action: "heading", data: { level: 2 } },
    { label: "H3", icon: "H3", action: "heading", data: { level: 3 } },
    { label: "Text", icon: "T", action: "paragraph" },
    { label: "Bullet List", icon: "•", action: "list", data: { style: "unordered" } },
    { label: "Numbered List", icon: "1.", action: "list", data: { style: "ordered" } },
    { label: "Checklist", icon: "☑", action: "checklist" },
    { label: "Code Block", icon: "<>", action: "code" },
    { label: "Quote", icon: "❝", action: "quote" },
    { label: "Table", icon: "▦", action: "table", data: { rows: 3, cols: 3 } },
    { label: "Image", icon: "🖼", action: "image" },
    { label: "Video", icon: "▶", action: "embed", data: { service: "youtube" } },
    { label: "Divider", icon: "─", action: "delimiter" },
  ];

  const filteredCommands = query
    ? commands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(query.toLowerCase()) ||
          cmd.action.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        setIsOpen(true);
        setQuery("");
        setSelectedIndex(0);
      } else if (isOpen) {
        if (e.key === "Escape") {
          setIsOpen(false);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => 
            prev === 0 ? filteredCommands.length - 1 : prev - 1
          );
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            handleSelectCommand(filteredCommands[selectedIndex]);
          }
        } else if (e.key.match(/^[a-zA-Z0-9 ]$/)) {
          setQuery((prev) => prev + e.key);
        } else if (e.key === "Backspace") {
          setQuery((prev) => prev.slice(0, -1));
        }
      }
    };

    editorElement?.addEventListener("keydown", handleKeyDown);
    return () => editorElement?.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, editorElement]);

  const handleSelectCommand = (command: any) => {
    onCommand(command.action, command.data);
    setIsOpen(false);
    setQuery("");
  };

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed bottom-0 left-0 z-50 w-64 max-h-80 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl"
    >
      <div className="sticky top-0 border-b border-slate-200 bg-slate-50 px-3 py-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search commands..."
          className="w-full rounded border border-slate-300 px-2 py-1 text-sm outline-none focus:border-blue-500"
          autoFocus
        />
      </div>

      <div className="py-1">
        {filteredCommands.length === 0 ? (
          <div className="px-3 py-2 text-xs text-slate-500">No commands found</div>
        ) : (
          filteredCommands.map((cmd, idx) => (
            <button
              key={cmd.action}
              onClick={() => handleSelectCommand(cmd)}
              className={`w-full px-3 py-2 text-left text-sm transition ${
                idx === selectedIndex
                  ? "bg-blue-100 text-blue-900"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="inline-block w-6 text-center font-mono text-lg">
                {cmd.icon}
              </span>
              <span className="ml-3">{cmd.label}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export const slashCommands = {
  heading: (level: number) => ({
    type: "header",
    data: { level, text: "" },
  }),
  paragraph: () => ({
    type: "paragraph",
    data: { text: "" },
  }),
  list: (style: "ordered" | "unordered") => ({
    type: "list",
    data: {
      style,
      items: [""],
    },
  }),
  checklist: () => ({
    type: "checklist",
    data: {
      items: [{ text: "", checked: false }],
    },
  }),
  code: () => ({
    type: "code",
    data: {
      code: "",
      language: "javascript",
    },
  }),
  quote: () => ({
    type: "quote",
    data: {
      text: "",
      caption: "",
      alignment: "left",
    },
  }),
  table: (rows: number, cols: number) => ({
    type: "table",
    data: {
      content: Array(rows).fill(null).map(() => Array(cols).fill("")),
    },
  }),
  image: () => ({
    type: "image",
    data: {
      file: { url: "" },
      caption: "",
      withBorder: false,
      withBackground: false,
      stretched: false,
    },
  }),
  delimiter: () => ({
    type: "delimiter",
    data: {},
  }),
};
