// src/App.tsx
// Clean, stable global router with correct imports and layout wrappers

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";

import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

import Header from "./components/Header";
import Footer from "./components/Footer";

// Public pages
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import PrivateEvents from "./pages/PrivateEvents";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import SantaPaddle from "./pages/SantaPaddle";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import BuyProductPage from "./pages/BuyProductPage";

// Admin pages
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";

// 404
import NotFound from "./pages/NotFound";

// Class system pages (NEW)

import ClassesPage from "./pages/classes/index";
import ClassDetailPage from "./pages/classes/[id]";
import SessionDetailPage from "./pages/sessions/[id]";

function Router() {
  return (
    <>
      {/* Global header */}
      <Header />

      {/* All page routes */}
      <Switch>
        {/* Public site */}
        <Route path="/" component={Home} />
        <Route path="/shop" component={Shop} />
        <Route path="/private-events" component={PrivateEvents} />
        <Route path="/about" component={About} />
        <Route path="/faq" component={FAQ} />
        <Route path="/santa-paddle" component={SantaPaddle} />
        <Route path="/success" component={CheckoutSuccess} />

        {/* Product purchase */}
        <Route path="/buy/:productKey" component={BuyProductPage} />

        {/* Class system */}
        <Route path="/classes" component={ClassesPage} />
        <Route path="/classes/:id" component={ClassDetailPage} />
        <Route path="/sessions/:id" component={SessionDetailPage} />

        {/* Admin */}
        <Route path="/admin" component={Admin} />
        <Route path="/admin-login" component={AdminLogin} />

        {/* Fallback */}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>

      {/* Footer appears on all pages */}
      <Footer />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
