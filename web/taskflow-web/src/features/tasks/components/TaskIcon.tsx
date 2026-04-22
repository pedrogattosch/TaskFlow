import type { IconName } from '../types';

export function TaskIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0',
    plus: 'M12 5v14M5 12h14',
    pencil: 'm4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Zm11.5-14.5 3 3',
    x: 'M6 6l12 12M18 6 6 18',
    list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
    grid: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z',
    kanban: 'M4 5h5v14H4V5Zm11 0h5v8h-5V5ZM10 5h4v5h-4V5Zm0 7h4v7h-4v-7Zm5 3h5v4h-5v-4Z',
  };

  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d={paths[name]} />
    </svg>
  );
}
