import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";

import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Shop from "./pages/Shop";
import PrivateEvents from "./pages/PrivateEvents";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import SantaPaddle from "./pages/SantaPaddle";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import BuyProductPage from "./pages/BuyProductPage";

// NEW CLASS ROUTES (Wouter)
import ClassesPage from "./pages/classes/index";
import ClassDetailPage from "./pages/classes/[id]";
import SessionDetailPage from "./pages/sessions/[id]";

function Router() {
  return (
    <>
      <Header />

      <Switch>
        <Route path="/" component={Home} />
        <Route path="/shop" component={Shop} />
        <Route path="/private-events" component={PrivateEvents} />
        <Route path="/about" component={About} />
        <Route path="/faq" component={FAQ} />
        <Route path="/santa-paddle" component={SantaPaddle} />

        <Route path="/admin" component={Admin} />
        <Route path="/admin-login" component={AdminLogin} />

        {/* NEW CALENDAR ROUTES */}
        <Route path="/classes" component={ClassesPage} />
        <Route path="/classes/:id" component={ClassDetailPage} />
        <Route path="/sessions/:id" component={SessionDetailPage} />

        <Route path="/success" component={CheckoutSuccess} />
        <Route path="/buy/:productKey" component={BuyProductPage} />

        {/* fallback */}
        <Route component={NotFound} />
      </Switch>

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
