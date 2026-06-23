import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ANALYTICS_ENABLED, initAnalytics, trackPageView } from "@/lib/analytics";

/**
 * Mounts the configured analytics (Google Analytics 4 and/or the Meta Pixel)
 * and reports a page view on every route change. Renders nothing. Lives inside
 * the router so useLocation works.
 */
export default function Analytics() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    if (!ANALYTICS_ENABLED) return;
    trackPageView(pathname + search);
  }, [pathname, search]);

  return null;
}
