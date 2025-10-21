import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { Bold, Italic, List, ListOrdered, Underline as UnderlineIcon } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start writing your cover letter...',
  className = '',
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Disable headings for professional cover letters
        blockquote: false, // Disable blockquotes
        codeBlock: false, // Disable code blocks
        horizontalRule: false, // Disable horizontal rules
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`
        p-2 border-4 border-black transition-all
        ${
          isActive
            ? 'bg-yellow-400 shadow-none translate-x-1 translate-y-1'
            : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none'
        }
      `}
    >
      {children}
    </button>
  );

  const charCount = editor.storage.characterCount?.characters() || editor.getText().length;

  return (
    <div className={`border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b-4 border-black bg-gray-50">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Cmd+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Cmd+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline (Cmd+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-black mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <div className="flex-1" />

        <div className="text-xs text-gray-600 font-mono bg-white border-2 border-black px-2 py-1">
          {charCount} characters
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Keyboard Shortcuts Hint */}
      <div className="px-4 py-2 border-t-4 border-black bg-gray-50 text-xs text-gray-600">
        <span className="font-bold">Tips:</span> Use Cmd+B (bold), Cmd+I (italic), Cmd+U (underline) for quick
        formatting
      </div>
    </div>
  );
};
