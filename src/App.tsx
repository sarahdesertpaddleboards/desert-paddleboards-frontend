import type { RouteRecord } from "vite-react-ssg";

import Layout from "./Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import PrivateEvents from "./pages/PrivateEvents";
import CommunityEvents from "./pages/CommunityEvents";
import CommunityPartners from "./pages/CommunityPartners";
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

import StaffLayout from "./staff/StaffLayout";
import StaffHome from "./staff/pages/Home";
import StaffLogin from "./staff/pages/Login";
import StaffVerify from "./staff/pages/Verify";
import StaffProfile from "./staff/pages/Profile";
import StaffPeople from "./staff/pages/People";
import StaffNotFound from "./staff/pages/NotFound";

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
      // Unlinked B2B pitch for HOAs / 55+ communities (see CommunityPartners.tsx).
      { path: "community-partners", element: <CommunityPartners /> },
      { path: "private-events", element: <PrivateEvents /> },
      // Unlinked: trips are moving to Sarah's personal site. Kept live only so
      // old links and ads don't 404 — replace with a 301 in public/_redirects
      // once her site has a domain.
      { path: "adventures", element: <Adventures /> },
      { path: "rentals", element: <Rentals /> },
      // Unlinked: moved to Sarah's personal site as "Consulting for wellness
      // businesses". 301 this (and /adventure-life-coaching) once it has a domain.
      { path: "coaching", element: <Coaching /> },
      { path: "calendar", element: <Calendar /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
      { path: "faq", element: <FAQ /> },
      { path: "santa-paddle", element: <SantaPaddle /> },

      { path: "custom-boards", element: <CustomBoards /> },

      // App-only routes (excluded from pre-render in vite.config.ts)
      { path: "admin", element: <Admin /> },
      { path: "admin-login", element: <AdminLogin /> },
      { path: "admin/login", element: <AdminLogin /> },
      { path: "success", element: <CheckoutSuccess /> },

      { path: "*", element: <NotFound /> },
    ],
  },

  // Standalone hidden minisite — Blue Wave Mobile Wellness Lounge (Airstream).
  // Moving to its own website; until then it lives here, NOT a child of
  // <Layout> and not linked from anywhere on the main site.
  { path: "/airstream", element: <Airstream /> },

  // Staff scheduling tool (ConnectTeam replacement). Own shell, noindex,
  // client-rendered against /staff-api (Cloudflare Pages Functions + D1).
  // Pre-rendered only as empty shells so Pages can serve the routes directly.
  {
    path: "/staff",
    element: <StaffLayout />,
    children: [
      { index: true, element: <StaffHome /> },
      { path: "login", element: <StaffLogin /> },
      { path: "verify", element: <StaffVerify /> },
      { path: "profile", element: <StaffProfile /> },
      { path: "admin/people", element: <StaffPeople /> },
      { path: "*", element: <StaffNotFound /> },
    ],
  },
];

export default routes;
