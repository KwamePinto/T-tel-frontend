import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { NAV_ITEMS, HEADER_CTA } from "../data/nav";
import Icon from "./Icon";
import AccessibilityPanel from "./AccessibilityPanel";
import styles from "./Header.module.css";

function DesktopNavItem({ item }) {
  const [open, setOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(null);
  const closeTimer = useRef(null);

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

  useEffect(() => () => clearTimeout(closeTimer.current), []);

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
              <Link to={child.to}>
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
                        <Link to={leaf.to}>
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

export default function Header({ transparent = false }) {
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

  return (
    <header className={`${styles.header} ${solid ? styles.solid : styles.clear}`}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo} aria-label="T-TEL home">
          <img src="/images/logo-ink.png" alt="T-TEL" className={styles.logoInk} />
          <img src="/images/logo-white.png" alt="" aria-hidden="true" className={styles.logoLight} />
        </Link>

        <nav className={styles.nav} aria-label="Main">
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <DesktopNavItem key={item.label} item={item} />
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <button
            className={styles.iconBtn}
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
            aria-expanded={searchOpen}
          >
            <Icon name="search" size={20} />
          </button>

          <div className={styles.a11yWrap}>
            <button
              className={`${styles.iconBtn} ${styles.gearBtn} ${a11yOpen ? styles.gearOn : ""}`}
              onClick={() => setA11yOpen((v) => !v)}
              aria-label="Accessibility and display settings"
              aria-expanded={a11yOpen}
            >
              <Icon name="settings" size={20} />
            </button>
            {a11yOpen && <AccessibilityPanel onClose={() => setA11yOpen(false)} />}
          </div>

          <Link to={HEADER_CTA.to} className={`${styles.cta} btn`}>
            {HEADER_CTA.label}
          </Link>

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

      {searchOpen && (
        <div className={styles.searchBar}>
          <div className="container">
            <form
              className={styles.searchForm}
              onSubmit={(e) => {
                e.preventDefault();
                setSearchOpen(false);
              }}
            >
              <Icon name="search" size={20} />
              <input
                type="search"
                placeholder="Search T-TEL — reports, programmes, people…"
                aria-label="Search the site"
                autoFocus
              />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search">
                <Icon name="close" size={20} />
              </button>
            </form>
          </div>
        </div>
      )}

      <div className={styles.stripe} aria-hidden="true">
        <span /><span /><span />
      </div>

      {mobileOpen && (
        <nav className={styles.mobileNav} aria-label="Mobile">
          <ul>
            {NAV_ITEMS.map((item) => (
              <MobileNavItem key={item.label} item={item} onNavigate={() => setMobileOpen(false)} />
            ))}
            <li>
              <Link to={HEADER_CTA.to} className={`btn ${styles.mCta}`} onClick={() => setMobileOpen(false)}>
                {HEADER_CTA.label}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
