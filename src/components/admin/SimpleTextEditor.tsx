import { useState, useRef } from 'react';
import { Bold, Italic, Link, List, Quote } from 'lucide-react';

interface SimpleTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showCharCount?: boolean;
  minLength?: number;
  maxLength?: number;
}

const SimpleTextEditor = ({
  value,
  onChange,
  placeholder,
  className = '',
  showCharCount = false,
  minLength,
  maxLength
}: SimpleTextEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newText);

    // Restaurar la selección después del cambio
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const handleBold = () => insertText('**', '**');
  const handleItalic = () => insertText('*', '*');
  const handleLink = () => {
    const url = prompt('Ingresa la URL:');
    if (url) {
      insertText('[', `](${url})`);
    }
  };
  const handleList = () => insertText('- ', '');
  const handleQuote = () => insertText('> ', '');

  return (
    <div className={`border border-gray-600 rounded-lg overflow-hidden ${className}`}>
      {/* Barra de herramientas */}
      <div className="bg-gray-700 px-3 py-2 border-b border-gray-600 flex gap-1">
        <button
          type="button"
          onClick={handleBold}
          className="p-1.5 rounded hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
          title="Negrita"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className="p-1.5 rounded hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
          title="Cursiva"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={handleLink}
          className="p-1.5 rounded hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
          title="Enlace"
        >
          <Link size={16} />
        </button>
        <button
          type="button"
          onClick={handleList}
          className="p-1.5 rounded hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
          title="Lista"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={handleQuote}
          className="p-1.5 rounded hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
          title="Cita"
        >
          <Quote size={16} />
        </button>
      </div>

      {/* Área de texto */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          if (maxLength && e.target.value.length > maxLength) {
            return; // No permitir más caracteres que el máximo
          }
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        className="w-full min-h-[160px] bg-gray-800 text-gray-100 p-3 resize-y focus:outline-none"
        style={{ fontFamily: 'monospace' }}
      />

      {/* Contador de caracteres */}
      {showCharCount && (
        <div className="flex justify-between items-center px-3 py-2 text-xs text-gray-500 border-t border-gray-600">
          <span>
            {minLength && value.length < minLength ? (
              <span className="text-orange-400">
                Mínimo {minLength} caracteres (faltan {minLength - value.length})
              </span>
            ) : (
              'Caracteres válidos'
            )}
          </span>
          <span className={`${maxLength && value.length > maxLength * 0.9 ? 'text-orange-400' : ''}`}>
            {value.length}{maxLength ? `/${maxLength}` : ''}
          </span>
        </div>
      )}
    </div>
  );
};

export default SimpleTextEditor;
