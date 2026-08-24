'use client';

import React, { useCallback, useEffect } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  label: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, label, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      // the editor loses its selection when a toolbar button takes focus,
      // so the mousedown default is suppressed rather than the click
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={isActive}
      className={cn(
        'min-w-8 h-8 px-2 flex items-center justify-center rounded-md text-sm font-semibold transition-colors',
        isActive
          ? 'bg-primary text-white'
          : 'text-slate-500 hover:bg-white hover:text-slate-800'
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = useCallback(() => {
    const current = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', current ?? 'https://');

    if (url === null) return;
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
      <ToolbarButton
        label="Bold"
        isActive={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <span className="font-extrabold">B</span>
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        isActive={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <span className="italic font-serif">I</span>
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        isActive={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <span className="underline">U</span>
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        isActive={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <span className="line-through">S</span>
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-slate-200" />

      <ToolbarButton
        label="Heading 2"
        isActive={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        label="Heading 3"
        isActive={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </ToolbarButton>
      <ToolbarButton
        label="Paragraph"
        isActive={editor.isActive('paragraph')}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        ¶
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-slate-200" />

      <ToolbarButton
        label="Bullet list"
        isActive={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        •&nbsp;≡
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        isActive={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1.
      </ToolbarButton>
      <ToolbarButton
        label="Quote"
        isActive={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        &ldquo;
      </ToolbarButton>
      <ToolbarButton
        label="Divider"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        —
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-slate-200" />

      <ToolbarButton label="Link" isActive={editor.isActive('link')} onClick={setLink}>
        🔗
      </ToolbarButton>
      <ToolbarButton
        label="Clear formatting"
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
      >
        ✕
      </ToolbarButton>

      <span className="ml-auto flex items-center gap-0.5">
        <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
          ↺
        </ToolbarButton>
        <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
          ↻
        </ToolbarButton>
      </span>
    </div>
  );
}

/**
 * Rich text editor backing the blog and package description fields.
 * Emits HTML, which the API sanitizes before storing — the same markup is
 * then rendered through the shared `.rte-content` styles, so what an author
 * sees here is what a reader gets.
 */
export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    // Next renders this on the server first; letting Tiptap hydrate immediately
    // would mismatch the client tree, so the DOM is built after mount.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        },
      }),
      Placeholder.configure({ placeholder: placeholder ?? 'Write the full article…' }),
    ],
    content: value || '',
    onUpdate: ({ editor: current }) => {
      // an empty document still serializes to "<p></p>"; store nothing instead
      // so the API sees a blank description rather than an empty paragraph
      onChange(current.isEmpty ? '' : current.getHTML());
    },
  });

  // The form can swap records under the editor (opening a different blog to
  // edit). Content is pushed in only when it genuinely differs, otherwise
  // every keystroke would reset the cursor to the start of the document.
  useEffect(() => {
    if (!editor) return;
    const incoming = value || '';
    if (incoming !== editor.getHTML() && !(editor.isEmpty && incoming === '')) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
  }, [value, editor]);

  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 bg-white overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15',
        className
      )}
    >
      {editor && <Toolbar editor={editor} />}
      <EditorContent
        editor={editor}
        className="rte-content px-4 py-3 text-sm max-h-[26rem] overflow-y-auto"
      />
    </div>
  );
}

/**
 * Read-only counterpart. The HTML has already been sanitized server-side on
 * write, so it is injected as-is rather than sanitized again per render.
 */
export function RichTextContent({ html, className }: { html?: string | null; className?: string }) {
  if (!html) return null;
  return <div className={cn('rte-content', className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
