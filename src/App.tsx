import type { RouteRecord } from "vite-react-ssg";

import Layout from "./Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import PrivateEvents from "./pages/PrivateEvents";
import SantaPaddle from "./pages/SantaPaddle";
import Membership from "./pages/Membership";
import LocationsIndex from "./pages/locations/index";
import LocationDetail from "./pages/locations/[slug]";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

import { experiences } from "./data/locations";

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
        // Tell the SSG which dynamic pages to pre-render
        getStaticPaths: () =>
          experiences.map((e) => `/locations/${e.slug}`),
      },
      { path: "membership", element: <Membership /> },
      { path: "private-events", element: <PrivateEvents /> },
      { path: "about", element: <About /> },
      { path: "faq", element: <FAQ /> },
      { path: "santa-paddle", element: <SantaPaddle /> },

      // App-only routes (excluded from pre-render in vite.config.ts)
      { path: "admin", element: <Admin /> },
      { path: "admin-login", element: <AdminLogin /> },
      { path: "admin/login", element: <AdminLogin /> },
      { path: "success", element: <CheckoutSuccess /> },

      { path: "*", element: <NotFound /> },
    ],
  },
];

export default routes;
