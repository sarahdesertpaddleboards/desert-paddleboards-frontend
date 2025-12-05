import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Shop from "./pages/Shop";
import PrivateEvents from "./pages/PrivateEvents";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import SantaPaddle from "./pages/SantaPaddle";
import SonoranEchoes from "./pages/SonoranEchoes";
import AlbumSuccess from "./pages/AlbumSuccess";
import TrackSuccess from "./pages/TrackSuccess";
import Analytics from "./pages/Analytics";
import Admin from "./pages/Admin";
import EventDetail from "./pages/EventDetail";
import BookingSuccess from "./pages/BookingSuccess";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <>
      <Header />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/events" component={Events} />
        <Route path="/events/:id" component={EventDetail} />
        <Route path="/booking/success" component={BookingSuccess} />
        <Route path="/shop" component={Shop} />
        <Route path="/sonoran-echoes" component={SonoranEchoes} />
        <Route path="/album-success" component={AlbumSuccess} />
        <Route path="/track-success" component={TrackSuccess} />
        <Route path="/private-events" component={PrivateEvents} />
        <Route path="/about" component={About} />
        <Route path="/faq" component={FAQ} />
        <Route path="/santa-paddle" component={SantaPaddle} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/admin" component={Admin} />
        <Route path="/404" component={NotFound} />
        {/* Final fallback route */}
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
