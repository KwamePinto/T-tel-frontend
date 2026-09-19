import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminIcon from "./AdminIcon";
import { IconButton } from "./ui";
import UnreadBanner from "./UnreadBanner";
import { useAuth } from "../context/AuthContext";
import s from "./AdminLayout.module.css";

/** Sidebar groups and labels mirror the live CMS exactly, so the client's
 *  muscle memory carries over. Only items T-TEL would never use are dropped
 *  (the plugin/module registry), and T-TEL's own sections are added. */
// Events and Sliders are built and working in the API and the admin, but no
// public page renders either one — content filed there would be invisible on
// the site. They are hidden rather than deleted: restore the entries here and
// they work again, once there is somewhere for them to appear.
export const NAV = [
  {
    group: "MAIN",
    items: [{ to: "/admin/dashboard", label: "Dashboard", icon: "dashboard" }],
  },
  {
    group: "CONTENT",
    items: [
      { to: "/admin/posts", label: "Posts", icon: "posts" },
      { to: "/admin/pages", label: "Pages", icon: "pages" },
      { to: "/admin/content-types", label: "Content Types", icon: "types" },
      { to: "/admin/media", label: "Media", icon: "media" },
      { to: "/admin/menus", label: "Menus", icon: "menus" },
      { to: "/admin/forms", label: "Forms", icon: "forms" },
      { to: "/admin/trash", label: "Trash", icon: "trash" },
    ],
  },
  {
    group: "T-TEL",
    items: [
      { to: "/admin/people", label: "Our People", icon: "people" },
      { to: "/admin/partners", label: "Partners", icon: "partners" },
      { to: "/admin/documents", label: "Knowledge Hub", icon: "documents" },
    ],
  },
  {
    group: "ADMINISTRATION",
    items: [
      { to: "/admin/users", label: "Users", icon: "users" },
      { to: "/admin/authentication", label: "Authentication", icon: "auth" },
      { to: "/admin/theme", label: "Theme", icon: "theme" },
    ],
  },
];

const ALL_ITEMS = NAV.flatMap((g) => g.items.map((i) => ({ ...i, group: g.group })));

function initials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("") || "?";
}

/* ----------------------------------------------------------- command palette */
function CommandPalette({ onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_ITEMS;
    return ALL_ITEMS.filter(
      (i) => i.label.toLowerCase().includes(q) || i.group.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => setCursor(0), [query]);

  function go(item) {
    if (!item) return;
    navigate(item.to);
    onClose();
  }

  function onKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[cursor]);
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  return (
    <div className={s.cmdOverlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={s.cmdPanel} role="dialog" aria-modal="true" aria-label="Command search">
        <div className={s.cmdField}>
          <AdminIcon name="search" size={18} />
          <input
            autoFocus
            value={query}
            placeholder="Search the dashboard…"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <span className={s.kbd}>Esc</span>
        </div>
        <div className={s.cmdList}>
          {results.length === 0 && <div className={s.cmdEmpty}>No matches for “{query}”.</div>}
          {results.map((item, i) => (
            <button
              key={item.to}
              type="button"
              className={`${s.cmdItem} ${i === cursor ? s.cmdItemOn : ""}`}
              onMouseEnter={() => setCursor(i)}
              onClick={() => go(item)}
            >
              <AdminIcon name={item.icon} size={17} />
              {item.label}
              <span className={s.cmdGroup}>{item.group}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ layout */
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // close transient UI whenever the route changes
  useEffect(() => {
    setNavOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menuOpen]);

  // the admin area shows role-appropriate sections only
  const visible = NAV.map((g) => ({
    ...g,
    items: g.items.filter((i) => {
      if (user?.role === "admin") return true;
      if (g.group === "ADMINISTRATION") return false;
      if (user?.role === "editor") return true;
      return !["Menus", "Sliders", "Forms", "Content Types"].includes(i.label);
    }),
  })).filter((g) => g.items.length);

  return (
    <div className={s.shell}>
      {navOpen && <div className={s.scrim} onClick={() => setNavOpen(false)} />}

      <aside className={`${s.sidebar} ${navOpen ? s.sidebarOpen : ""}`}>
        <div className={s.brand}>
          <img src="/images/logo-white.png" alt="" />
          <span>T-TEL CMS</span>
        </div>
        <nav className={s.nav}>
          {visible.map((g) => (
            <div key={g.group} className={s.group}>
              <span className={s.groupLabel}>{g.group}</span>
              {g.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `${s.link} ${isActive ? s.linkOn : ""}`}
                >
                  <AdminIcon name={item.icon} size={17} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className={s.main}>
        <header className={s.topbar}>
          <span className={s.burger}>
            <IconButton icon="menus" label="Menu" onClick={() => setNavOpen((o) => !o)} />
          </span>

          <button type="button" className={s.cmdBtn} onClick={() => setPaletteOpen(true)}>
            <AdminIcon name="search" size={16} />
            <span>Search…</span>
            <span className={s.kbd}>⌘K</span>
          </button>

          <div className={s.topRight}>
            <a className={s.viewSite} href="/" target="_blank" rel="noreferrer">
              <AdminIcon name="external" size={16} />
              <span>View site</span>
            </a>

            <div className={s.account} onClick={(e) => e.stopPropagation()}>
              <button type="button" className={s.avatarBtn} onClick={() => setMenuOpen((o) => !o)}>
                <span className={s.avatar}>{initials(user?.name)}</span>
                <span>
                  <span className={s.avatarName}>{user?.name || "Account"}</span>
                  <span className={s.avatarRole} style={{ display: "block" }}>{user?.role}</span>
                </span>
                <AdminIcon name="chevronDown" size={15} />
              </button>

              {menuOpen && (
                <div className={s.menu}>
                  <button type="button" className={s.menuItem} onClick={() => navigate("/admin/profile")}>
                    <AdminIcon name="users" size={16} /> Edit profile
                  </button>
                  <div className={s.menuSep} />
                  <button
                    type="button"
                    className={s.menuItem}
                    onClick={async () => {
                      await logout();
                      navigate("/admin/login", { replace: true });
                    }}
                  >
                    <AdminIcon name="logout" size={16} /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={s.content}>
          <Outlet />
        </main>
      </div>

      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
      <UnreadBanner />
    </div>
  );
}
