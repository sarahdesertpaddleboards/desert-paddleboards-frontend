import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { GA_ID, initAnalytics, trackPageView } from "@/lib/analytics";

/**
 * Mounts Google Analytics (when VITE_GA4_ID is set) and reports a page view
 * on every route change. Renders nothing. Lives inside the router so
 * useLocation works.
 */
export default function Analytics() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    if (!GA_ID) return;
    trackPageView(pathname + search);
  }, [pathname, search]);

  return null;
}
