import { Link } from "react-router-dom";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Floating Sessions", href: "/locations" },
  { name: "Community Events", href: "/community-events" },
  { name: "Private Events", href: "/private-events" },
  { name: "Rentals", href: "/rentals" },
  { name: "Shop", href: "/shop" },
  { name: "Adventures", href: "/adventures" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const moreLinks = [
  { name: "Airstream Lounge", href: "/airstream" },
  { name: "Blog", href: "/blog" },
  { name: "FAQ", href: "/faq" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
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

        <div className="hidden md:flex flex-wrap items-center gap-x-5 gap-y-1 lg:gap-x-6">
          {navigation.map((item) => (
            <Link key={item.name} to={item.href}>
              <span className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors cursor-pointer">
                {item.name}
              </span>
            </Link>
          ))}

          {/* More dropdown */}
          <div ref={moreRef} className="relative">
            <button
              onClick={() => setMoreOpen((o) => !o)}
              className="flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-primary transition-colors cursor-pointer"
            >
              More <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-background shadow-lg py-1 z-50">
                {moreLinks.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMoreOpen(false)}
                    className="block px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-muted transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <a href="tel:6024560884" className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
            <Phone className="h-4 w-4" />
            <span>602.456.0884</span>
          </a>
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
            {navigation.map((item) => (
              <Link key={item.name} to={item.href}>
                <div
                  className="block py-2 text-base font-medium text-foreground/80 hover:text-primary transition-colors cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </div>
              </Link>
            ))}
            {moreLinks.map((item) => (
              <Link key={item.name} to={item.href}>
                <div
                  className="block py-2 text-base font-medium text-foreground/80 hover:text-primary transition-colors cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </div>
              </Link>
            ))}
            <div className="pt-4 space-y-3">
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
