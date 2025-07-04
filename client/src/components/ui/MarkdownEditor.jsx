import React, { useState, useRef, useEffect, useCallback } from 'react';
import { marked } from 'marked';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  Quote, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  Eye,
  EyeOff,
  Type,
  Minus,
  AlignLeft,
  Save,
  RotateCcw
} from 'lucide-react';

const MarkdownEditor = ({ value, onChange, placeholder = "Write your content here...", className = "" }) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const textareaRef = useRef(null);

  // Save to undo stack
  const saveToUndoStack = useCallback((newValue) => {
    if (newValue !== value) {
      setUndoStack(prev => [...prev.slice(-19), value]); // Keep last 20 states
      setRedoStack([]);
    }
  }, [value]);

  // Helper function to insert text at cursor position
  const insertText = useCallback((beforeText, afterText = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const textToInsert = selectedText || placeholder;
    const newText = beforeText + textToInsert + afterText;
    
    const newValue = value.substring(0, start) + newText + value.substring(end);
    
    // Save current state before change
    saveToUndoStack(value);
    
    onChange({ target: { value: newValue } });

    // Set cursor position after insertion
    setTimeout(() => {
      const newCursorPos = start + beforeText.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos + afterText.length);
      textarea.focus();
    }, 0);
  }, [value, onChange, saveToUndoStack]);

  // Undo/Redo functionality
  const handleUndo = useCallback(() => {
    if (undoStack.length > 0) {
      const previousValue = undoStack[undoStack.length - 1];
      setRedoStack(prev => [value, ...prev.slice(0, 19)]);
      setUndoStack(prev => prev.slice(0, -1));
      onChange({ target: { value: previousValue } });
    }
  }, [undoStack, value, onChange]);

  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      const nextValue = redoStack[0];
      setUndoStack(prev => [...prev.slice(-19), value]);
      setRedoStack(prev => prev.slice(1));
      onChange({ target: { value: nextValue } });
    }
  }, [redoStack, value, onChange]);

  // Formatting functions
  const formatBold = useCallback(() => insertText('**', '**', 'bold text'), [insertText]);
  const formatItalic = useCallback(() => insertText('*', '*', 'italic text'), [insertText]);
  const formatUnderline = useCallback(() => insertText('<u>', '</u>', 'underlined text'), [insertText]);
  const formatCode = useCallback(() => insertText('`', '`', 'code'), [insertText]);
  const formatHeading1 = useCallback(() => insertText('# ', '', 'Heading 1'), [insertText]);
  const formatHeading2 = useCallback(() => insertText('## ', '', 'Heading 2'), [insertText]);
  const formatHeading3 = useCallback(() => insertText('### ', '', 'Heading 3'), [insertText]);
  const formatQuote = useCallback(() => insertText('> ', '', 'Quote'), [insertText]);
  const formatUnorderedList = useCallback(() => insertText('- ', '', 'List item'), [insertText]);
  const formatOrderedList = useCallback(() => insertText('1. ', '', 'List item'), [insertText]);
  const formatLink = useCallback(() => insertText('[', '](url)', 'link text'), [insertText]);
  const formatImage = useCallback(() => insertText('![', '](image-url)', 'alt text'), [insertText]);
  const formatHorizontalRule = useCallback(() => insertText('\n---\n', '', ''), [insertText]);
  const formatParagraph = useCallback(() => insertText('\n\n', '', ''), [insertText]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!textareaRef.current || document.activeElement !== textareaRef.current) return;

      // Ctrl/Cmd + B = Bold
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        formatBold();
      }
      // Ctrl/Cmd + I = Italic
      else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        formatItalic();
      }
      // Ctrl/Cmd + K = Link
      else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        formatLink();
      }
      // Ctrl/Cmd + Z = Undo
      else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl/Cmd + Shift + Z = Redo
      else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      }
      // Ctrl/Cmd + P = Preview
      else if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setIsPreviewMode(!isPreviewMode);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [value, isPreviewMode, formatBold, formatItalic, formatLink, handleUndo, handleRedo]);

  // Convert markdown to HTML for preview
  const markdownToHtml = (markdown) => {
    try {
      return marked(markdown, {
        breaks: true,
        sanitize: false,
        gfm: true
      });
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return markdown.replace(/\n/g, '<br />');
    }
  };

  const toolbarButtons = [
    { icon: Heading1, action: formatHeading1, title: 'Heading 1' },
    { icon: Heading2, action: formatHeading2, title: 'Heading 2' },
    { icon: Heading3, action: formatHeading3, title: 'Heading 3' },
    { icon: Bold, action: formatBold, title: 'Bold (Ctrl+B)' },
    { icon: Italic, action: formatItalic, title: 'Italic (Ctrl+I)' },
    { icon: Underline, action: formatUnderline, title: 'Underline' },
    { icon: Code, action: formatCode, title: 'Code' },
    { icon: Quote, action: formatQuote, title: 'Quote' },
    { icon: List, action: formatUnorderedList, title: 'Bullet List' },
    { icon: ListOrdered, action: formatOrderedList, title: 'Numbered List' },
    { icon: Link, action: formatLink, title: 'Link (Ctrl+K)' },
    { icon: Image, action: formatImage, title: 'Image' },
    { icon: Minus, action: formatHorizontalRule, title: 'Horizontal Rule' },
    { icon: AlignLeft, action: formatParagraph, title: 'New Paragraph' },
  ];

  const actionButtons = [
    { icon: RotateCcw, action: handleUndo, title: 'Undo (Ctrl+Z)', disabled: undoStack.length === 0 },
    { icon: Save, action: handleRedo, title: 'Redo (Ctrl+Shift+Z)', disabled: redoStack.length === 0 },
  ];

  return (
    <div className={`border border-gray-300 rounded-md overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-2">
        <div className="flex items-center gap-1 flex-wrap">
          {/* Action buttons (Undo/Redo) */}
          {actionButtons.map((button, index) => (
            <button
              key={`action-${index}`}
              type="button"
              onClick={button.action}
              disabled={button.disabled}
              className={`p-2 rounded transition-colors ${
                button.disabled 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'hover:bg-gray-200'
              }`}
              title={button.title}
            >
              <button.icon size={16} />
            </button>
          ))}
          
          {/* Separator */}
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          {/* Format buttons */}
          {toolbarButtons.map((button, index) => (
            <button
              key={`format-${index}`}
              type="button"
              onClick={button.action}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              title={button.title}
            >
              <button.icon size={16} />
            </button>
          ))}
          
          {/* Separator */}
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          {/* Preview Toggle */}
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`p-2 rounded transition-colors ${
              isPreviewMode ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'
            }`}
            title={isPreviewMode ? 'Edit Mode (Ctrl+P)' : 'Preview Mode (Ctrl+P)'}
          >
            {isPreviewMode ? <Type size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div className="relative">
        {isPreviewMode ? (
          <div className="p-4 min-h-[300px] bg-white">
            <div 
              className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-code:text-pink-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-blockquote:border-l-blue-500 prose-blockquote:text-gray-600"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
            />
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full p-4 border-0 resize-none focus:outline-none focus:ring-0 min-h-[300px] bg-white"
            style={{ fontFamily: 'Monaco, Consolas, "Courier New", monospace', fontSize: '14px', lineHeight: '1.5' }}
          />
        )}
      </div>

      {/* Markdown Help */}
      <div className="bg-gray-50 border-t border-gray-200 p-2 text-xs text-gray-600">
        <details className="cursor-pointer">
          <summary className="font-medium">Markdown Quick Reference & Shortcuts</summary>
          <div className="mt-2 grid grid-cols-3 gap-4">
            <div>
              <strong>Headers:</strong> # H1, ## H2, ### H3<br/>
              <strong>Bold:</strong> **bold text** (Ctrl+B)<br/>
              <strong>Italic:</strong> *italic text* (Ctrl+I)<br/>
              <strong>Code:</strong> `code`
            </div>
            <div>
              <strong>Quote:</strong> &gt; quote<br/>
              <strong>List:</strong> - item or 1. item<br/>
              <strong>Link:</strong> [text](url) (Ctrl+K)<br/>
              <strong>Image:</strong> ![alt](url)
            </div>
            <div>
              <strong>Shortcuts:</strong><br/>
              <strong>Ctrl+P:</strong> Toggle Preview<br/>
              <strong>Ctrl+Z:</strong> Undo<br/>
              <strong>Ctrl+Shift+Z:</strong> Redo
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default MarkdownEditor;
