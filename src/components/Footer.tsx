import { Link } from "wouter";
import { Facebook, Instagram, Mail, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t border-border mt-20">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">
              Desert Paddleboards
            </h3>
            <p className="text-sm text-muted-foreground">
              Transformative water-based wellness experiences in Arizona and California.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com/desertpaddleboards"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/desertpaddleboards"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://tiktok.com/@desertpaddleboards"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="TikTok"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/events">
                  <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Classes & Events
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/shop">
                  <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Shop
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/private-events">
                  <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Private Events
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    About Us
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Floating Soundbaths</li>
              <li>Floating Yoga</li>
              <li>Water Aerobics</li>
              <li>Paddleboard Rentals</li>
              <li>Private Group Events</li>
              <li>Gift Certificates</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="tel:4802019520"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>480.201.9520</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:sarah@desertpaddleboards.com"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>sarah@desertpaddleboards.com</span>
                </a>
              </li>
              <li className="text-muted-foreground pt-2">
                Based in Mesa, AZ
                <br />
                Serving Arizona & California
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {currentYear} Desert Paddleboards. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy">
                <span className="hover:text-primary transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </Link>
              <Link href="/terms">
                <span className="hover:text-primary transition-colors cursor-pointer">
                  Terms of Service
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
