export type IconName =
  | 'user'
  | 'plus'
  | 'pencil'
  | 'x'
  | 'list'
  | 'grid'
  | 'kanban'
  | 'logout'
  | 'palette'
  | 'sparkles'
  | 'trash';

export function TaskIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0',
    plus: 'M12 5v14M5 12h14',
    pencil: 'm4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Zm11.5-14.5 3 3',
    x: 'M6 6l12 12M18 6 6 18',
    list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
    grid: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z',
    kanban: 'M4 5h5v14H4V5Zm11 0h5v8h-5V5ZM10 5h4v5h-4V5Zm0 7h4v7h-4v-7Zm5 3h5v4h-5v-4Z',
    logout: 'M15 17l5-5-5-5M20 12H9M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3',
    palette:
      'M12 3a9 9 0 1 0 0 18h1.2a2.8 2.8 0 0 0 0-5.6H12a1.8 1.8 0 0 1 0-3.6h3.2A5.8 5.8 0 0 0 21 6a3 3 0 0 0-3-3h-6ZM7.5 10.5h.01M8.5 7.5h.01M12 6.5h.01M15.5 8h.01',
    sparkles: 'M12 3l1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Zm6 10 1 2.9 2.9 1-2.9 1-1 2.9-1-2.9-2.9-1 2.9-1 1-2.9ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z',
    trash:
      'M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3',
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
