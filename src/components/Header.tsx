import { Link } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Experiences", href: "/locations" },
    { name: "Membership", href: "/membership" },
    { name: "Shop", href: "/shop" },
    { name: "Community Events", href: "/community-events" },
    { name: "Private Events", href: "/private-events" },
    { name: "Blog", href: "/blog" },
    { name: "About", href: "/about" },
    { name: "FAQ", href: "/faq" },
  ];

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

        <div className="hidden md:flex items-center gap-8">
          {navigation.map((item) => (
            <Link key={item.name} to={item.href}>
              <span className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors cursor-pointer">
                {item.name}
              </span>
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <a href="tel:4802019520" className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
            <Phone className="h-4 w-4" />
            <span>480.201.9520</span>
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
            <div className="pt-4 space-y-3">
              <a
                href="tel:4802019520"
                className="flex items-center gap-2 text-base font-medium text-foreground/80"
              >
                <Phone className="h-5 w-5" />
                <span>480.201.9520</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
