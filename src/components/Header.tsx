import { Link } from "react-router-dom";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type NavLink = { name: string; href: string };
type NavItem = NavLink | { name: string; children: NavLink[] };

const navigation: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "Floating Sessions", href: "/locations" },
  { name: "Community Events", href: "/community-events" },
  {
    name: "Other Services",
    children: [
      { name: "Private Events", href: "/private-events" },
      { name: "Rentals", href: "/rentals" },
      { name: "Shop", href: "/shop" },
      { name: "Custom Boards", href: "/custom-boards" },
    ],
  },
  {
    name: "About",
    children: [
      { name: "Our Story", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "FAQ", href: "/faq" },
    ],
  },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Name of the open desktop dropdown, if any.
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenMenu(null);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <nav className="container flex items-center justify-between py-4">
        <Link to="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="text-2xl font-bold text-primary">
              <span>Desert Paddleboards</span>
            </div>
          </div>
        </Link>

        <div ref={navRef} className="hidden md:flex flex-wrap items-center gap-x-5 gap-y-1 lg:gap-x-6">
          {navigation.map((item) =>
            "children" in item ? (
              // Dropdown links are always in the DOM (hidden with CSS, not
              // unmounted) so they're in the pre-rendered HTML for crawlers.
              <div
                key={item.name}
                className="group relative"
              >
                <button
                  type="button"
                  aria-expanded={openMenu === item.name}
                  onClick={() => setOpenMenu((o) => (o === item.name ? null : item.name))}
                  className="flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-primary transition-colors cursor-pointer"
                >
                  {item.name}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openMenu === item.name ? "rotate-180" : ""}`} />
                </button>
                <div
                  className={`absolute left-0 top-full z-50 pt-2 ${openMenu === item.name ? "block" : "hidden group-hover:block"}`}
                >
                  <div className="w-48 rounded-xl border border-border bg-background py-1 shadow-lg">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        onClick={() => setOpenMenu(null)}
                        className="block px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-muted transition-colors"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link key={item.name} to={item.href}>
                <span className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors cursor-pointer">
                  {item.name}
                </span>
              </Link>
            ),
          )}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <a href="tel:6024560884" aria-label="Call 602.456.0884" className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
            <Phone className="h-4 w-4" />
            <span className="hidden lg:inline">602.456.0884</span>
          </a>
          <Link
            to="/calendar"
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Book a float
          </Link>
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container py-4 space-y-4">
            {navigation.map((item) =>
              "children" in item ? (
                <div key={item.name} className="pt-2">
                  <div className="pb-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {item.name}
                  </div>
                  {item.children.map((child) => (
                    <Link key={child.href} to={child.href}>
                      <div
                        className="block py-2 pl-3 text-base font-medium text-foreground/80 hover:text-primary transition-colors cursor-pointer"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {child.name}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <Link key={item.name} to={item.href}>
                  <div
                    className="block py-2 text-base font-medium text-foreground/80 hover:text-primary transition-colors cursor-pointer"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </div>
                </Link>
              ),
            )}
            <div className="pt-4 space-y-3">
              <Link
                to="/calendar"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-full bg-primary px-5 py-3 text-center text-base font-semibold text-primary-foreground"
              >
                Book a float
              </Link>
              <a
                href="tel:6024560884"
                className="flex items-center gap-2 text-base font-medium text-foreground/80"
              >
                <Phone className="h-5 w-5" />
                <span>602.456.0884</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
