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
  <Route path="/analytics" component={Analytics} />
  <Route path="/admin" component={Admin} />
  <Route path="/admin-login" component={AdminLogin} />
  <Route path="/success" component={CheckoutSuccess} />
  <Route path="/buy/:productKey" component={BuyProductPage} />

  <Route path="/404" component={NotFound} />
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
