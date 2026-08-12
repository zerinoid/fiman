import { useState, useRef, useEffect } from 'react';

interface TagInputComboboxProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags?: string[];
  placeholder?: string;
  id?: string;
}

export function TagInputCombobox({
  tags,
  onTagsChange,
  availableTags = [],
  placeholder = 'ex: rolê, ifood, farmácia',
  id = 'tag-combobox-input',
}: TagInputComboboxProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter available tags based on user input and currently selected tags
  const suggestions = availableTags.filter(t => {
    const isAlreadyAdded = tags.some(existing => existing.toLowerCase() === t.toLowerCase());
    if (isAlreadyAdded) return false;
    if (!inputValue.trim()) return true;
    return t.toLowerCase().includes(inputValue.trim().toLowerCase());
  });

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (rawTag: string) => {
    const trimmed = rawTag.trim();
    if (!trimmed) return;

    // Support comma or semicolon delimited strings
    const newItems = trimmed
      .split(/[,;]/)
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const updated = [...tags];
    let changed = false;

    for (const item of newItems) {
      if (!updated.some(t => t.toLowerCase() === item.toLowerCase())) {
        updated.push(item);
        changed = true;
      }
    }

    if (changed) {
      onTagsChange(updated);
    }
    setInputValue('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) setIsOpen(true);
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) setIsOpen(true);
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
      e.preventDefault();
      if (isOpen && selectedIndex >= 0 && suggestions[selectedIndex]) {
        addTag(suggestions[selectedIndex]);
      } else if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Tab') {
      if (isOpen && selectedIndex >= 0 && suggestions[selectedIndex]) {
        e.preventDefault();
        addTag(suggestions[selectedIndex]);
      } else if (inputValue.trim()) {
        e.preventDefault();
        addTag(inputValue);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <input
        ref={inputRef}
        id={id}
        type="text"
        className="form-input"
        placeholder={placeholder}
        value={inputValue}
        onFocus={() => setIsOpen(true)}
        onChange={e => {
          setInputValue(e.target.value);
          setIsOpen(true);
          setSelectedIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          // Add tag on blur if user typed something and didn't pick from dropdown
          setTimeout(() => {
            if (inputValue.trim()) {
              addTag(inputValue);
            }
          }, 150);
        }}
        autoComplete="off"
      />

      {/* Autocomplete Combobox Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul className="combobox-dropdown">
          {suggestions.map((suggestion, index) => {
            const isSelected = index === selectedIndex;
            return (
              <li
                key={suggestion}
                className={`combobox-option ${isSelected ? 'selected' : ''}`}
                onMouseDown={e => {
                  e.preventDefault(); // Prevent input blur
                  addTag(suggestion);
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="combobox-option-icon">🏷️</span>
                <span>{suggestion}</span>
              </li>
            );
          })}
        </ul>
      )}

      {/* Active Selected Tags */}
      {tags.length > 0 && (
        <div className="tag-chips-container">
          {tags.map(t => (
            <span key={t} className="tag-chip">
              #{t}
              <button
                type="button"
                className="tag-chip-remove"
                onClick={() => removeTag(t)}
                aria-label={`Remover tag ${t}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
