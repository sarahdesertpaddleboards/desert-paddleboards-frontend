import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Scrolls to the top of the page on every route change (react-router doesn't do this by default). */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
