import { useLayoutEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CtaBand from "./CtaBand";
import PageTransition from "./PageTransition";
import useReveal from "../hooks/useReveal";
import useSitePrefs from "../hooks/useSitePrefs";

export default function Layout() {
  const { pathname } = useLocation();
  useReveal();
  useSitePrefs();

  // `html { scroll-behavior: smooth }` is set globally, for in-page anchor
  // links and things like a "back to top" button — but it also applies to
  // this call, turning what should be an instant reset into an animated
  // scroll from wherever the old page left off. On a page navigated to from
  // near the bottom of a taller one, that animation visibly passes through
  // the footer and CTA band on the way up, which is exactly the "wrong
  // content flashes first" this was reported as; useLayoutEffect firing
  // before paint doesn't help, because the scroll itself is still the thing
  // taking hundreds of milliseconds. behavior: "instant" overrides the CSS
  // default for this one call, so a route change is a hard jump and every
  // other smooth-scroll on the site is untouched.
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
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
        <PageTransition pathKey={pathname}>
          <Outlet />
        </PageTransition>
      </main>
      {!isHome && <CtaBand />}
      <Footer />
    </>
  );
}
