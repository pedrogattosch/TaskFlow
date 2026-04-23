import type { CSSProperties } from 'react';
import { defaultCategoryColor } from '../constants';
import { TaskIcon } from './TaskIcon';

type CategoryColorInputProps = {
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
  value?: string | null;
  onChange: (color: string) => void;
};

export function CategoryColorInput({
  ariaLabel,
  className,
  disabled = false,
  value,
  onChange,
}: CategoryColorInputProps) {
  const resolvedValue = value ?? defaultCategoryColor;

  return (
    <label className={['color-picker', className ?? ''].filter(Boolean).join(' ')}>
      <span className="color-picker__trigger">
        <span className="color-picker__leading" aria-hidden="true">
          <TaskIcon name="palette" />
        </span>
        <span
          className="color-picker__preview"
          style={{ '--color-picker-preview': resolvedValue } as CSSProperties}
          aria-hidden="true"
        />
      </span>
      <input
        className="color-picker__input"
        type="color"
        value={resolvedValue}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-label={ariaLabel}
      />
    </label>
  );
}
