import type { RouteRecord } from "vite-react-ssg";

import Layout from "./Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import PrivateEvents from "./pages/PrivateEvents";
import CommunityEvents from "./pages/CommunityEvents";
import Adventures from "./pages/Adventures";
import Rentals from "./pages/Rentals";
import Coaching from "./pages/Coaching";
import Calendar from "./pages/Calendar";
import SantaPaddle from "./pages/SantaPaddle";
import Membership from "./pages/Membership";
import Shop from "./pages/Shop";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import BlogIndex from "./pages/blog/index";
import BlogPost from "./pages/blog/[slug]";
import LocationsIndex from "./pages/locations/index";
import LocationDetail from "./pages/locations/[slug]";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CustomBoards from "./pages/CustomBoards";
import Airstream from "./pages/Airstream";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

import { experiences } from "./data/locations";
import { cityClassDetailSlugs } from "./data/city-classes";
import { blogPosts } from "./data/blog-posts";

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "locations", element: <LocationsIndex /> },
      {
        path: "locations/:slug",
        element: <LocationDetail />,
        // Tell the SSG which dynamic pages to pre-render — FareHarbor venues
        // plus city-run classes (which share the same detail-page template).
        getStaticPaths: () => [
          ...experiences.map((e) => `/locations/${e.slug}`),
          ...cityClassDetailSlugs.map((s) => `/locations/${s}`),
        ],
      },
      { path: "membership", element: <Membership /> },
      { path: "shop", element: <Shop /> },
      { path: "privacy", element: <Privacy /> },
      { path: "terms", element: <Terms /> },
      { path: "blog", element: <BlogIndex /> },
      {
        path: "blog/:slug",
        element: <BlogPost />,
        getStaticPaths: () => blogPosts.map((p) => `/blog/${p.slug}`),
      },
      { path: "community-events", element: <CommunityEvents /> },
      { path: "private-events", element: <PrivateEvents /> },
      { path: "adventures", element: <Adventures /> },
      { path: "rentals", element: <Rentals /> },
      { path: "coaching", element: <Coaching /> },
      { path: "calendar", element: <Calendar /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
      { path: "faq", element: <FAQ /> },
      { path: "santa-paddle", element: <SantaPaddle /> },

      // UNLISTED preview page — reachable by direct URL only (has header/footer),
      // deliberately NOT linked from nav/homepage/footer/shop yet, and noindex +
      // sitemap-excluded. To launch: add the nav/shop/footer links, remove
      // `noindex` in CustomBoards.tsx, and drop the sitemap exclusion.
      { path: "custom-boards", element: <CustomBoards /> },

      // App-only routes (excluded from pre-render in vite.config.ts)
      { path: "admin", element: <Admin /> },
      { path: "admin-login", element: <AdminLogin /> },
      { path: "admin/login", element: <AdminLogin /> },
      { path: "success", element: <CheckoutSuccess /> },

      { path: "*", element: <NotFound /> },
    ],
  },

  // Standalone hidden minisite — Sarah's Backyard Airstream corporate rental.
  // Deliberately NOT a child of <Layout>, so it renders without the Desert
  // Paddleboards header/footer/nav (its own self-contained site) and is not
  // linked from anywhere on the main site. Still pre-rendered → SEO-indexable.
  { path: "/airstream", element: <Airstream /> },
];

export default routes;
