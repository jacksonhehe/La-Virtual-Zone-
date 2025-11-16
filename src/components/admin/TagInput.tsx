import { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

const TagInput = ({ tags, onChange, placeholder = "Agregar etiqueta...", maxTags = 10, className = '' }: TagInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim().toLowerCase();
    if (trimmedValue && !tags.includes(trimmedValue) && tags.length < maxTags) {
      onChange([...tags, trimmedValue]);
      setInputValue('');
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className={`border border-gray-600 rounded-lg p-3 bg-gray-800 ${className}`}>
      <div
        className="flex flex-wrap gap-2 min-h-[2.5rem] cursor-text"
        onClick={handleContainerClick}
      >
        {/* Tags existentes */}
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 bg-primary/20 text-primary px-2 py-1 rounded-full text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
              className="hover:bg-primary/30 rounded-full p-0.5"
            >
              <X size={12} />
            </button>
          </span>
        ))}

        {/* Input para nuevas tags */}
        {tags.length < maxTags && (
          <div className="flex items-center gap-1 flex-1 min-w-[120px]">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder={tags.length === 0 ? placeholder : ''}
              className="bg-transparent border-none outline-none text-gray-200 placeholder-gray-500 flex-1 min-w-0"
            />
            {inputValue.trim() && (
              <button
                type="button"
                onClick={addTag}
                className="text-primary hover:text-primary/80 p-1"
                title="Agregar etiqueta"
              >
                <Plus size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Indicador de límite */}
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
        <span>
          {tags.length === 0
            ? 'Etiquetas ayudan a organizar y encontrar artículos más fácilmente'
            : `${tags.length} etiqueta${tags.length !== 1 ? 's' : ''}`
          }
        </span>
        {tags.length >= maxTags && (
          <span className="text-orange-400">Máximo {maxTags} etiquetas</span>
        )}
      </div>
    </div>
  );
};

export default TagInput;
