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

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header transparent />
      <main id="main">
        <Outlet />
      </main>
      <CtaBand />
      <Footer />
    </>
  );
}
