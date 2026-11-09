import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle, Container } from '@/components/ui';
import { Footer } from '@/components/layout/Footer';
import { SubmitCorrectionModal } from '@/components/modals/SubmitCorrectionModal';
import { ListBusinessModal } from '@/components/modals/ListBusinessModal';
import type { LayoutContext } from '@/lib/types';
import {
  PawPrint,
  Menu,
  X,
  Home,
  Search,
  AlertCircle,
  User,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const bottomNavItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Search', href: '/search', icon: Search },
  { label: 'Emergency', href: '/search?emergency=true', icon: AlertCircle },
  { label: 'Profile', href: '#', icon: User },
];

export function RootLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // ── Modal state ──────────────────────────────────
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [correctionProvider, setCorrectionProvider] = useState('');
  const [listBusinessOpen, setListBusinessOpen] = useState(false);

  const openCorrectionModal = (providerName?: string) => {
    setCorrectionProvider(providerName ?? '');
    setCorrectionOpen(true);
  };

  const openListBusinessModal = () => setListBusinessOpen(true);

  const context: LayoutContext = { openCorrectionModal, openListBusinessModal };

  // ── Nav actions ──────────────────────────────────
  const navLinks = [
    { label: 'Find a Vet', action: () => navigate('/search') },
    { label: 'Services', action: () => { navigate('/'); setTimeout(() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' }), 100); } },
    { label: 'List Your Business', action: openListBusinessModal },
    { label: 'Submit a Correction', action: () => openCorrectionModal() },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background theme-transition">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-lg border-b border-border theme-transition">
        <Container>
          <nav className="flex items-center justify-between h-14">
            <Link
              to="/"
              className="flex items-center gap-2 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-lg px-1"
            >
              <PawPrint className="w-5 h-5 text-primary" />
              <span className="font-heading font-semibold text-foreground text-base">
                Practo<span className="text-primary"> for Animals</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={link.action}
                  className="px-3 py-1.5 text-sm text-muted hover:text-foreground rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                onClick={() => setDrawerOpen(true)}
                className="md:hidden p-2 rounded-xl hover:bg-background transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </nav>
        </Container>
      </header>

      {/* ── Mobile Drawer ──────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-surface border-l border-border p-6 flex flex-col md:hidden theme-transition"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-heading font-semibold text-foreground text-base">Menu</span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-xl hover:bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-muted" />
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => { setDrawerOpen(false); link.action(); }}
                    className="text-left px-3 py-2.5 text-sm text-foreground hover:bg-background rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>

              <div className="flex-1" />
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted text-center">
                  &copy; {new Date().getFullYear()} Practo for Animals
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main ───────────────────────────────────────── */}
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet context={context} />
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <Footer
        onOpenCorrection={() => openCorrectionModal()}
        onOpenListBusiness={openListBusinessModal}
      />

      {/* ── Mobile Bottom Nav ──────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-lg border-t border-border md:hidden theme-transition">
        <div className="flex items-center justify-around h-16 px-2">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.href.split('?')[0]) && item.href !== '#';
            const isEmergency = item.label === 'Emergency';

            return (
              <Link
                key={item.label}
                to={item.href}
                className={[
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  isEmergency ? 'text-danger' : isActive ? 'text-primary' : 'text-muted hover:text-foreground',
                ].join(' ')}
                aria-label={item.label}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>

      {/* ── Modals ─────────────────────────────────────── */}
      <SubmitCorrectionModal
        open={correctionOpen}
        onClose={() => setCorrectionOpen(false)}
        prefillProvider={correctionProvider}
      />
      <ListBusinessModal
        open={listBusinessOpen}
        onClose={() => setListBusinessOpen(false)}
      />
    </div>
  );
}
