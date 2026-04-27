import type { CSSProperties } from 'react';
import { defaultCategoryColor } from '../constants';
import type { CategoryColorInputProps } from '../types';
import { TaskIcon } from './TaskIcon';

export function CategoryColorInput({
  ariaLabel,
  className,
  disabled = false,
  iconName = 'palette',
  iconOnly = false,
  showPreview = true,
  value,
  onChange,
}: CategoryColorInputProps) {
  const resolvedValue = value ?? defaultCategoryColor;

  return (
    <label
      className={[
        'color-picker',
        iconOnly ? 'color-picker--icon-only' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      title={ariaLabel}
    >
      <span className="color-picker__trigger">
        <span className="color-picker__leading" aria-hidden="true">
          <TaskIcon name={iconName} />
        </span>
        {showPreview ? (
          <span
            className="color-picker__preview"
            style={{ '--color-picker-preview': resolvedValue } as CSSProperties}
            aria-hidden="true"
          />
        ) : null}
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
