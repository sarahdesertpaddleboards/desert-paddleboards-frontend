import { Outlet } from "react-router-dom";
import { Head } from "vite-react-ssg";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Analytics from "./components/Analytics";
import JsonLd from "./components/JsonLd";
import ScrollToTop from "./components/ScrollToTop";
import { graph, organizationLd, webSiteLd } from "./lib/jsonld";

const queryClient = new QueryClient();

/**
 * Root layout — wraps every page with the app providers, header and footer.
 * Rendered as the parent route; pages render into <Outlet />.
 */
export default function Layout() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            {/* Default head — pages override title/description via their own <Head> */}
            <Head>
              <title>
                Desert Paddleboards — Floating Soundbaths &amp; Wellness in Arizona
              </title>
              <meta
                name="description"
                content="Floating soundbaths, paddleboard yoga and wellness experiences across Arizona. Find a session near you and book online."
              />
            </Head>
            <JsonLd data={graph([organizationLd(), webSiteLd()])} />
            <ScrollToTop />
            <Toaster />
            <Analytics />
            <Header />
            <Outlet />
            <Footer />
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
