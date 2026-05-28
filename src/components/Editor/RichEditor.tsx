"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { useCallback } from "react";
import "./RichEditor.css";

const lowlight = createLowlight(common);

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "plaintext",
      }),
      Image.configure({
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  const addImage = useCallback(() => {
    const url = window.prompt("Enter image URL:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addYoutube = useCallback(() => {
    const url = window.prompt("Enter YouTube URL:");
    if (url && editor) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  }, [editor]);

  const addLink = useCallback(() => {
    const url = window.prompt("Enter URL:");
    if (url && editor) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  }, [editor]);

  const addCodeBlock = useCallback(() => {
    editor?.chain().focus().insertContent("```\n\n```").run();
  }, [editor]);

  return (
    <div className="rich-editor-wrapper">
      <div className="toolbar">
        <div className="toolbar-group">
          <button
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={editor?.isActive("bold") ? "active" : ""}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={editor?.isActive("italic") ? "active" : ""}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            className={editor?.isActive("strike") ? "active" : ""}
            title="Strikethrough"
          >
            <s>S</s>
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor?.isActive("heading", { level: 1 }) ? "active" : ""}
            title="Heading 1"
          >
            H1
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor?.isActive("heading", { level: 2 }) ? "active" : ""}
            title="Heading 2"
          >
            H2
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor?.isActive("heading", { level: 3 }) ? "active" : ""}
            title="Heading 3"
          >
            H3
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={editor?.isActive("bulletList") ? "active" : ""}
            title="Bullet List"
          >
            •
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={editor?.isActive("orderedList") ? "active" : ""}
            title="Ordered List"
          >
            1.
          </button>
          <button onClick={addCodeBlock} title="Code Block">
            &lt;&gt;
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button onClick={addImage} title="Add Image">
            🖼️
          </button>
          <button onClick={addLink} title="Add Link">
            🔗
          </button>
          <button onClick={addYoutube} title="Add YouTube">
            ▶️
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            className={editor?.isActive("blockquote") ? "active" : ""}
            title="Quote"
          >
            &quot; &quot;
          </button>
          <button
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            title="Divider"
          >
            ─
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            onClick={() => editor?.chain().focus().undo().run()}
            title="Undo"
          >
            ↶
          </button>
          <button
            onClick={() => editor?.chain().focus().redo().run()}
            title="Redo"
          >
            ↷
          </button>
        </div>
      </div>

      <EditorContent
        editor={editor}
        placeholder={placeholder || "Start writing..."}
        className="editor-content"
      />
    </div>
  );
}
