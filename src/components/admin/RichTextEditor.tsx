'use client';

import {useEditor, EditorContent} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import {Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2, ImageIcon, LinkIcon} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({value, onChange, placeholder}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value,
    onUpdate: ({editor}) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert prose-sm max-w-none focus:outline-none min-h-[300px] p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // TODO: Upload to S3/R2 and get presigned URL
        // For now, read as base64
        const reader = new FileReader();
        reader.onload = () => {
          const src = reader.result as string;
          editor.chain().focus().setImage({src}).run();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const addLink = () => {
    const url = prompt('Bağlantı URL:');
    if (url) {
      editor.chain().focus().setLink({href: url}).run();
    }
  };

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
            editor.isActive('bold') ? 'bg-slate-200 dark:bg-slate-700' : ''
          }`}
          title="Kalın"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
            editor.isActive('italic') ? 'bg-slate-200 dark:bg-slate-700' : ''
          }`}
          title="İtalik"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-px bg-slate-300 dark:bg-slate-600 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleHeading({level: 1}).run()}
          className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
            editor.isActive('heading', {level: 1}) ? 'bg-slate-200 dark:bg-slate-700' : ''
          }`}
          title="Başlık 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({level: 2}).run()}
          className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
            editor.isActive('heading', {level: 2}) ? 'bg-slate-200 dark:bg-slate-700' : ''
          }`}
          title="Başlık 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <div className="w-px bg-slate-300 dark:bg-slate-600 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
            editor.isActive('bulletList') ? 'bg-slate-200 dark:bg-slate-700' : ''
          }`}
          title="Madde listesi"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
            editor.isActive('orderedList') ? 'bg-slate-200 dark:bg-slate-700' : ''
          }`}
          title="Numaralı liste"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px bg-slate-300 dark:bg-slate-600 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
            editor.isActive('blockquote') ? 'bg-slate-200 dark:bg-slate-700' : ''
          }`}
          title="Alıntı"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="w-px bg-slate-300 dark:bg-slate-600 mx-1" />

        <button onClick={addImage} className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="Resim ekle">
          <ImageIcon className="w-4 h-4" />
        </button>
        <button onClick={addLink} className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="Bağlantı ekle">
          <LinkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
