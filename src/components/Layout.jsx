import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CtaBand from "./CtaBand";
import useReveal from "../hooks/useReveal";
import useSitePrefs from "../hooks/useSitePrefs";

export default function Layout() {
  const { pathname } = useLocation();
  useReveal();
  useSitePrefs();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // the home page carries its own hero and closing sections, so it skips the
  // shared CTA band; every other page is unchanged
  const isHome = pathname === "/";

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {/* Every page sits over a hero, so the header is transparent until it
          scrolls. Home matches the flat black bar across its hero video
          instead of the gradient the image heroes use. */}
      <Header transparent onHero={isHome ? "bar" : "gradient"} />
      <main id="main">
        <Outlet />
      </main>
      {!isHome && <CtaBand />}
      <Footer />
    </>
  );
}
