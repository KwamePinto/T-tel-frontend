/** Minimal stroke-icon set for the admin UI (feather-style, 24x24 grid). */
const PATHS = {
  dashboard: "M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z",
  posts: "M4 4h16v16H4zM8 8h8M8 12h8M8 16h5",
  pages: "M6 2h8l4 4v16H6zM14 2v4h4",
  types: "M4 6h16M4 12h16M4 18h10",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3",
  media: "M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M8.5 9.5a1 1 0 1 0 0-.001",
  menus: "M4 6h16M4 12h11M4 18h7M18 15l3 3-3 3",
  sliders: "M3 6h18v12H3zM8 21h8M12 18v3",
  forms: "M5 3h14v18H5zM9 8h6M9 12h6M9 16h3",
  users: "M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 20v-2a4 4 0 0 0-3-3.9M16 2.1a4 4 0 0 1 0 7.8",
  auth: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
  theme: "M12 2a10 10 0 1 0 0 20c1 0 2-.8 2-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .9-1.8 2-1.8h2c2.8 0 5-2.2 5-5 0-4.4-4.5-9-10-9M6.5 12a1 1 0 1 0 0-.01M9.5 7.5a1 1 0 1 0 0-.01M14.5 7.5a1 1 0 1 0 0-.01M17.5 12a1 1 0 1 0 0-.01",
  events: "M3 6h18v15H3zM3 10h18M8 3v4M16 3v4",
  people: "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1",
  partners: "M7 9h10M5 5h14v9l-7 6-7-6zM9 14h6",
  documents: "M6 2h8l4 4v16H6zM14 2v4h4M9 13h6M9 17h6",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16M21 21l-4.3-4.3",
  help: "M9.5 9a2.5 2.5 0 1 1 4.1 1.9c-.9.7-1.6 1.2-1.6 2.6M12 17h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20",
  plus: "M12 5v14M5 12h14",
  edit: "M4 20h4l11-11-4-4L4 16zM14 5l4 4",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
  close: "M6 6l12 12M18 6L6 18",
  chevronLeft: "M15 5l-7 7 7 7",
  chevronRight: "M9 5l7 7-7 7",
  chevronDown: "M6 9l6 6 6-6",
  external: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  logout: "M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4M16 17l5-5-5-5M21 12H9",
  upload: "M12 17V3M7 8l5-5 5 5M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3",
  folder: "M3 6h6l2 3h10v11H3z",
  restore: "M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5",
  check: "M5 13l4 4L19 7",
  drag: "M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01",
  mail: "M3 5h18v14H3zM3 6l9 7 9-7",
  bell: "M18 9a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7M11 21h2",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.9 19.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 7.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1.3",
};

export default function AdminIcon({ name, size = 18, ...rest }) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <path d={d} />
    </svg>
  );
}
