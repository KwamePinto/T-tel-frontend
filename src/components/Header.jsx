import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useSite } from "../context/SiteContext";
import Icon from "./Icon";
import { mediaUrl } from "../lib/cms";
import AccessibilityPanel from "./AccessibilityPanel";
import SiteSearch from "./SiteSearch";
import styles from "./Header.module.css";

function DesktopNavItem({ item }) {
  const [open, setOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(null);
  const closeTimer = useRef(null);
  const { pathname } = useLocation();

  function show() {
    clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function hide() {
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setSubOpen(null);
    }, 120);
  }
  function close() {
    clearTimeout(closeTimer.current);
    setOpen(false);
    setSubOpen(null);
  }

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  // Navigating leaves the pointer sitting over the panel, so it would stay
  // open on the new page until the mouse moved. Close it on every route change.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open || subOpen) close();
  }

  if (!item.children) {
    return (
      <li className={styles.navItem}>
        <NavLink
          to={item.to}
          className={({ isActive }) => (isActive ? styles.active : undefined)}
        >
          {item.label}
        </NavLink>
      </li>
    );
  }

  return (
    <li className={styles.navItem} onMouseEnter={show} onMouseLeave={hide}>
      <NavLink
        to={item.to}
        className={({ isActive }) => (isActive ? styles.active : undefined)}
        aria-expanded={open}
      >
        {item.label}
        <Icon name="chevronDown" size={15} className={styles.caret} />
      </NavLink>

      <div className={`${styles.dropdown} ${open ? styles.dropdownOpen : ""}`}>
        <ul>
          {item.children.map((child) => (
            <li
              key={child.label}
              onMouseEnter={() => setSubOpen(child.label)}
              onMouseLeave={() => setSubOpen(null)}
              className={child.children ? styles.hasSub : undefined}
            >
              <Link to={child.to} onClick={close}>
                <span>{child.label}</span>
                {child.children && <Icon name="chevronRight" size={16} />}
              </Link>

              {child.children && (
                <div
                  className={`${styles.subDropdown} ${
                    subOpen === child.label ? styles.dropdownOpen : ""
                  }`}
                >
                  <ul>
                    {child.children.map((leaf) => (
                      <li key={leaf.label}>
                        <Link to={leaf.to} onClick={close}>
                          <span>{leaf.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

function MobileNavItem({ item, onNavigate }) {
  const [open, setOpen] = useState(false);

  if (!item.children) {
    return (
      <li>
        <Link to={item.to} onClick={onNavigate} className={styles.mLink}>
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        className={`${styles.mLink} ${styles.mToggle}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {item.label}
        <Icon name="chevronDown" size={18} style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <ul className={styles.mSub}>
          <li>
            <Link to={item.to} onClick={onNavigate} className={styles.mSubLink}>
              Overview
            </Link>
          </li>
          {item.children.map((child) => (
            <li key={child.label}>
              <Link to={child.to} onClick={onNavigate} className={styles.mSubLink}>
                {child.label}
              </Link>
              {child.children && (
                <ul className={styles.mSub}>
                  {child.children.map((leaf) => (
                    <li key={leaf.label}>
                      <Link to={leaf.to} onClick={onNavigate} className={styles.mLeafLink}>
                        {leaf.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/** Menu records use url/children; the nav components expect to/children. */
function toNavItem(item) {
  const external = /^https?:\/\//i.test(item.url || "");
  return {
    label: item.label,
    to: external ? undefined : item.url || "/",
    href: external ? item.url : undefined,
    children: item.children?.length ? item.children.map(toNavItem) : undefined,
  };
}

export default function Header({ transparent = false, onHero = "gradient" }) {
  const { menu, settings, flag } = useSite();
  const navItems = (menu(settings.main_menu || "main") || []).map(toNavItem);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [a11yOpen, setA11yOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close every open panel when the route changes (React's
  // "adjust state during render" pattern, not an effect)
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMobileOpen(false);
    setSearchOpen(false);
    setA11yOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const solid = !transparent || scrolled || mobileOpen;
  // .clearBar rides on top of .clear so it inherits the light-on-dark styling
  const overlay = onHero === "bar" ? `${styles.clear} ${styles.clearBar}` : styles.clear;

  return (
    <header className={`${styles.header} ${solid ? styles.solid : overlay}`}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo} aria-label="T-TEL home">
          <img src={mediaUrl(settings.logo_url) || "/images/logo-ink.png"} alt={settings.site_name || "T-TEL"} className={styles.logoInk} />
          <img src={mediaUrl(settings.logo_dark_url) || "/images/logo-white.png"} alt="" aria-hidden="true" className={styles.logoLight} />
        </Link>

        <nav className={styles.nav} aria-label="Main">
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <DesktopNavItem key={item.label} item={item} />
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          {flag("enable_search") && (
          <button
            className={styles.iconBtn}
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
            aria-expanded={searchOpen}
          >
            <Icon name="search" size={20} />
          </button>
          )}

          <div className={styles.a11yWrap}>
            <button
              className={`${styles.iconBtn} ${a11yOpen ? styles.gearOn : ""}`}
              onClick={() => setA11yOpen((v) => !v)}
              aria-label="Accessibility and display settings"
              aria-expanded={a11yOpen}
            >
              <Icon name="settings" size={20} />
            </button>
            {a11yOpen && <AccessibilityPanel onClose={() => setA11yOpen(false)} />}
          </div>


          <button
            className={`${styles.iconBtn} ${styles.burger}`}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <Icon name={mobileOpen ? "close" : "menu"} size={26} />
          </button>
        </div>
      </div>

      {searchOpen && <SiteSearch onClose={() => setSearchOpen(false)} />}


      {mobileOpen && (
        <nav className={styles.mobileNav} aria-label="Mobile">
          <ul>
            {navItems.map((item) => (
              <MobileNavItem key={item.label} item={item} onNavigate={() => setMobileOpen(false)} />
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
