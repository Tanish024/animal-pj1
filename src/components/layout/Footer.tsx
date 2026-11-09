import { Link } from 'react-router-dom';
import { Container } from '@/components/ui';
import { PawPrint, Mail, Phone } from 'lucide-react';

interface FooterProps {
  onOpenCorrection: () => void;
  onOpenListBusiness: () => void;
}

export function Footer({ onOpenCorrection, onOpenListBusiness }: FooterProps) {
  return (
    <footer className="bg-surface border-t border-border theme-transition">
      <Container className="py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 mb-4 lg:mb-0">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <PawPrint className="w-5 h-5 text-primary" />
              <span className="font-heading font-semibold text-foreground text-base">
                Practo<span className="text-primary"> for Animals</span>
              </span>
            </Link>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              Connecting pet parents with trusted veterinary care across India.
            </p>
            <div className="flex flex-col gap-2 mt-5">
              <a
                href="mailto:hello@practoforanimals.in"
                className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                hello@practoforanimals.in
              </a>
              <a
                href="tel:+911800123456"
                className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                1800-123-456 (Toll Free)
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-foreground mb-3">Company</h4>
            <ul className="space-y-2">
              {['About Us', 'How It Works', 'Careers', 'Press'].map((label) => (
                <li key={label}>
                  <Link to="#" className="text-sm text-muted hover:text-foreground transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-foreground mb-3">For Providers</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenListBusiness}
                  className="text-sm text-muted hover:text-foreground transition-colors duration-200"
                >
                  List Your Business
                </button>
              </li>
              <li>
                <Link to="#" className="text-sm text-muted hover:text-foreground transition-colors duration-200">
                  Provider Dashboard
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-muted hover:text-foreground transition-colors duration-200">
                  Pricing
                </Link>
              </li>
              <li>
                <button
                  onClick={onOpenCorrection}
                  className="text-sm text-muted hover:text-foreground transition-colors duration-200"
                >
                  Submit a Correction
                </button>
              </li>
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-foreground mb-3">Explore</h4>
            <ul className="space-y-2">
              {[
                { label: 'Find a Vet', href: '/search' },
                { label: 'Emergency Services', href: '/search?emergency=true' },
                { label: 'Pet Boarding', href: '/search?service=Boarding' },
                { label: 'Diagnostics', href: '/search?service=Diagnostics' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-muted hover:text-foreground transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-foreground mb-3">Legal</h4>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((label) => (
                <li key={label}>
                  <Link to="#" className="text-sm text-muted hover:text-foreground transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      <div className="border-t border-border">
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-5">
            <p className="text-xs text-muted">
              &copy; {new Date().getFullYear()} Practo for Animals. All rights reserved.
            </p>
            <p className="text-xs text-muted">
              Made with care for every paw, hoof, wing &amp; fin 🐾
            </p>
          </div>
        </Container>
      </div>

      {/* Prototype note */}
      <div className="bg-background">
        <Container>
          <p className="text-center text-[10px] text-muted/60 py-3">
            This is an MVP prototype built for demonstration purposes. Provider data is simulated and no real bookings are processed.
          </p>
        </Container>
      </div>
    </footer>
  );
}
