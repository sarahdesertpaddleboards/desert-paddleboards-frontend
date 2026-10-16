import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { StaffProvider, useStaff } from "./StaffContext";

/** Routes anyone can open without a session. */
const PUBLIC_PATHS = new Set(["/staff/login", "/staff/verify"]);

/**
 * Shell for the staff tool (/staff/*). Not part of the marketing <Layout>:
 * no SEO chrome, noindex, and everything renders client-side only — at SSG
 * build time this emits a neutral "Loading" shell so the static HTML never
 * contains anyone's data.
 */
export default function StaffLayout() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-[#f4f6f7] text-foreground">
      <Seo title="Staff · Desert Paddleboards" description="Staff scheduling for Desert Paddleboards." noindex />
      {mounted ? (
        <StaffProvider>
          <Chrome />
        </StaffProvider>
      ) : (
        <Shell>
          <p className="text-sm text-muted-foreground">Loading…</p>
        </Shell>
      )}
    </div>
  );
}

function Shell({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3">
          <Link to="/staff" className="flex shrink-0 items-center gap-2 sm:gap-3">
            <img src="/logo.webp" alt="Desert Paddleboards" className="h-8 w-auto sm:h-9" />
            <span className="hidden text-xs font-bold uppercase tracking-[0.14em] text-brand sm:inline">Staff</span>
          </Link>
          {right}
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">{children}</main>
    </>
  );
}

function Chrome() {
  const { staff, loading, logout } = useStaff();
  const location = useLocation();
  const navigate = useNavigate();
  const isPublic = PUBLIC_PATHS.has(location.pathname.replace(/\/+$/, ""));

  // Send logged-out visitors to the login page (remembering where they were).
  useEffect(() => {
    if (!loading && !staff && !isPublic) {
      const next = location.pathname + location.search;
      navigate(`/staff/login${next && next !== "/staff" ? `?next=${encodeURIComponent(next)}` : ""}`, {
        replace: true,
      });
    }
  }, [loading, staff, isPublic, location.pathname, location.search, navigate]);

  const nav = staff ? (
    <nav className="flex items-center gap-0.5 text-sm sm:gap-1">
      <NavItem to="/staff" end>
        Shifts
      </NavItem>
      <NavItem to="/staff/profile">Profile</NavItem>
      {staff.role === "admin" ? <NavItem to="/staff/admin/people">People</NavItem> : null}
      <Button
        variant="ghost"
        size="sm"
        className="px-2 text-muted-foreground sm:px-3"
        onClick={() => {
          void logout().then(() => navigate("/staff/login", { replace: true }));
        }}
      >
        Log out
      </Button>
    </nav>
  ) : null;

  return (
    <Shell right={nav}>
      {loading && !isPublic ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !staff && !isPublic ? null : (
        <Outlet />
      )}
    </Shell>
  );
}

function NavItem({ to, end, children }: { to: string; end?: boolean; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `rounded-md px-2 py-1.5 font-medium transition-colors sm:px-3 ${
          isActive ? "bg-brand-dark text-white" : "text-foreground hover:bg-black/5"
        }`
      }
    >
      {children}
    </NavLink>
  );
}
