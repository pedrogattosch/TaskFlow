import { useEffect, useRef, useState } from 'react';

const categoryEmojiOptions = [
  '📌',
  '💼',
  '🏠',
  '🛒',
  '💡',
  '📚',
  '💪',
  '💰',
  '✈️',
  '🎯',
  '🧾',
  '❤️',
];

export const defaultCategoryEmoji = categoryEmojiOptions[0];

type CategoryEmojiPickerProps = {
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
  value?: string | null;
  onChange: (emoji: string) => void;
};

export function CategoryEmojiPicker({
  ariaLabel,
  className,
  disabled = false,
  value,
  onChange,
}: CategoryEmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const normalizedValue = value?.trim() ?? '';

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen]);

  function handleSelect(emoji: string) {
    onChange(emoji);
    setIsOpen(false);
  }

  return (
    <div className={className ? `emoji-picker ${className}` : 'emoji-picker'} ref={pickerRef}>
      <button
        className="emoji-picker__trigger"
        type="button"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
      >
        {normalizedValue || defaultCategoryEmoji}
      </button>

      {isOpen && !disabled && (
        <div className="emoji-picker__menu" role="listbox" aria-label={ariaLabel}>
          {categoryEmojiOptions.map((emoji) => (
            <button
              className="emoji-picker__option"
              type="button"
              key={emoji}
              role="option"
              aria-selected={emoji === normalizedValue}
              onClick={() => handleSelect(emoji)}
            >
              {emoji}
            </button>
          ))}
          <button
            className="emoji-picker__clear"
            type="button"
            onClick={() => handleSelect('')}
            disabled={!normalizedValue}
          >
            Remover
          </button>
        </div>
      )}
    </div>
  );
}
