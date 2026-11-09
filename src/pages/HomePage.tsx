import { useState, useRef } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { Container, Button, Card, Badge } from '@/components/ui';
import { providers, typeLabels } from '@/data/providers';
import type { Provider } from '@/data/providers';
import type { LayoutContext } from '@/lib/types';
import { useDocTitle } from '@/hooks/useDocTitle';
import {
  Search,
  MapPin,
  Crosshair,
  ChevronDown,
  ChevronRight,
  Zap,
  Clock,
  Home as HomeIcon,
  Siren,
  ArrowRight,
  Stethoscope,
  Building2,
  BedDouble,
  FlaskConical,
  Truck,
  HeartHandshake,
  Star,
  ShieldCheck,
  MapPinned,
  Users,
  Phone,
  ChevronLeft,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

/* ═══════════════════ animation ══════════════════════════ */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
};

/* ═══════════════════ data ══════════════════════════════= */

const serviceTypes = ['Vet Clinic', 'Hospital', 'Boarding', 'Diagnostics', 'Ambulance', 'NGO'];
const animalTypes = ['Dog', 'Cat', 'Bird', 'Livestock', 'Exotic'];

const quickChips = [
  { label: '24×7 Emergency', icon: Zap, href: '/search?emergency=true' },
  { label: 'Open Now', icon: Clock, href: '/search?openNow=true' },
  { label: 'Home Visit', icon: HomeIcon, href: '/search?homeVisit=true' },
];

const categories = [
  { title: 'Vet Clinics', description: 'Check-ups, vaccinations and routine care.', icon: Stethoscope, service: 'Vet Clinic' },
  { title: 'Animal Hospitals', description: 'Surgery, ICU and emergency treatment.', icon: Building2, service: 'Hospital' },
  { title: 'Boarding', description: "Safe, comfy stays while you're away.", icon: BedDouble, service: 'Boarding' },
  { title: 'Diagnostics', description: 'X-ray, blood work and lab testing.', icon: FlaskConical, service: 'Diagnostics' },
  { title: 'Ambulance', description: 'Emergency transport with first-aid.', icon: Truck, service: 'Ambulance' },
  { title: 'NGOs', description: 'Rescue, adoption and community care.', icon: HeartHandshake, service: 'NGO' },
];

const steps = [
  { number: '01', title: 'Search', description: 'Enter your location and what you need — we show verified providers nearby.', icon: Search },
  { number: '02', title: 'Compare', description: 'Browse ratings, reviews and prices side by side.', icon: Star },
  { number: '03', title: 'Book or Call', description: 'Book online or call the clinic directly.', icon: Phone },
];

const stats = [
  { value: '2,400+', label: 'Verified Providers', icon: ShieldCheck },
  { value: '85', label: 'Cities Covered', icon: MapPinned },
  { value: '1.2M+', label: 'Pet Parents Helped', icon: Users },
];

const featuredProviders = providers.filter((p) => p.verified).slice(0, 6);

/* ═══════════════════ sub-components ═════════════════════ */

function HeroBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg className="absolute -top-24 -right-32 w-[420px] h-[420px] opacity-[0.07] dark:opacity-[0.05]" viewBox="0 0 400 400" fill="none">
        <path d="M300 60c70 40 110 130 80 210s-120 120-200 100S30 260 50 180 230 20 300 60Z" fill="var(--pr)" />
      </svg>
      <svg className="absolute -bottom-20 -left-28 w-[340px] h-[340px] opacity-[0.08] dark:opacity-[0.05]" viewBox="0 0 340 340" fill="none">
        <path d="M170 30c80-10 160 60 155 140s-60 150-140 155S20 270 25 190 90 40 170 30Z" fill="var(--ac)" />
      </svg>
      <svg className="absolute top-1/3 left-[12%] w-16 h-16 opacity-[0.10] dark:opacity-[0.06]" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="30" fill="var(--pr)" />
      </svg>
      <svg className="absolute bottom-1/4 right-[18%] w-10 h-10 opacity-[0.12] dark:opacity-[0.07]" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="18" fill="var(--ac)" />
      </svg>
    </div>
  );
}

interface InlineSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}

function InlineSelect({ label, value, options, onChange }: InlineSelectProps) {
  return (
    <div className="relative flex-1 min-w-0">
      <label className="sr-only">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-transparent text-sm text-foreground py-2.5 pr-7 cursor-pointer focus-visible:outline-none"
        aria-label={label}
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
    </div>
  );
}

function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <Card className="min-w-[280px] max-w-[320px] shrink-0 flex flex-col overflow-hidden p-0 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      <div className="h-20 relative" style={{ backgroundColor: provider.imageColor }}>
        {provider.verified && (
          <span className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-white/90 dark:bg-surface/90 backdrop-blur-sm text-xs font-medium text-primary px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3" />
            Verified
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2.5">
        <div>
          <h3 className="font-heading font-semibold text-sm text-foreground leading-snug line-clamp-1">{provider.name}</h3>
          <p className="text-xs text-muted mt-0.5">{provider.area}, {provider.city}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="primary">{typeLabels[provider.type]}</Badge>
          {provider.is24x7 && <Badge variant="accent">24×7</Badge>}
          {provider.emergency && <Badge variant="danger">Emergency</Badge>}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted mt-auto pt-1">
          <span className="inline-flex items-center gap-1 text-foreground font-medium">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            {provider.rating}
            <span className="text-muted font-normal">({provider.reviews})</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {provider.distanceKm} km
          </span>
          <span className={provider.openNow ? 'text-primary font-medium' : 'text-danger font-medium'}>
            {provider.openNow ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>
    </Card>
  );
}

/* ══════════════════════ PAGE ════════════════════════════ */

export default function HomePage() {
  useDocTitle('Find Trusted Veterinary Care');
  const { openListBusinessModal } = useOutletContext<LayoutContext>();
  const navigate = useNavigate();

  const [location, setLocation] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [animalType, setAnimalType] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -310 : 310, behavior: 'smooth' });
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (serviceType) params.set('service', serviceType);
    if (animalType) params.set('animal', animalType);
    navigate(`/search${params.toString() ? '?' + params.toString() : ''}`);
  };

  const scrollToCategories = () => {
    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* ═════════════ HERO ═════════════════════════════ */}
      <section className="relative overflow-hidden">
        <HeroBlobs />
        <Container className="relative z-10 pt-12 pb-16 sm:pt-20 sm:pb-24">
          <motion.div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14" initial="hidden" animate="show" variants={staggerContainer}>
            <motion.h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground leading-tight tracking-tight" variants={fadeItem}>
              Find trusted care for{' '}
              <span className="text-primary">every animal</span> you love.
            </motion.h1>
            <motion.p className="mt-4 text-muted text-base sm:text-lg max-w-md mx-auto" variants={fadeItem}>
              Vets, clinics and pet services — all in one place.
            </motion.p>
          </motion.div>

          <motion.div className="max-w-3xl mx-auto" custom={2} initial="hidden" animate="show" variants={fadeUp}>
            <div className="bg-surface border border-border rounded-2xl shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] dark:shadow-[0_2px_12px_0_rgba(0,0,0,0.2)] p-3 sm:p-4 theme-transition">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:divide-x sm:divide-border">
                <div className="relative flex items-center gap-2 sm:pr-4 flex-1 min-w-0">
                  <MapPin className="w-4 h-4 text-muted shrink-0" />
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Enter your location" className="w-full bg-transparent text-sm text-foreground placeholder:text-muted py-2.5 focus-visible:outline-none" aria-label="Location" />
                  <button onClick={() => setLocation('Using current location')} className="shrink-0 p-1.5 rounded-lg hover:bg-background text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40" aria-label="Use my location" title="Use my location">
                    <Crosshair className="w-4 h-4" />
                  </button>
                </div>
                <div className="sm:px-4 flex-1 min-w-0">
                  <InlineSelect label="Service type" value={serviceType} options={serviceTypes} onChange={setServiceType} />
                </div>
                <div className="sm:pl-4 flex-1 min-w-0">
                  <InlineSelect label="Animal type" value={animalType} options={animalTypes} onChange={setAnimalType} />
                </div>
              </div>
              <div className="my-3 sm:hidden border-t border-border" />
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4">
                <Button size="lg" className="w-full sm:w-auto gap-2" onClick={handleSearch}>
                  <Search className="w-4 h-4" />
                  Find a Vet
                </Button>
                <Button variant="secondary" size="lg" className="w-full sm:w-auto" onClick={scrollToCategories}>
                  Explore Services
                </Button>
              </div>
            </div>

            <motion.div className="flex flex-wrap items-center gap-2 mt-5 justify-center" custom={3} initial="hidden" animate="show" variants={fadeUp}>
              <span className="text-xs text-muted mr-1">Popular:</span>
              {quickChips.map((chip) => {
                const Icon = chip.icon;
                return (
                  <Link
                    key={chip.label}
                    to={chip.href}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-full text-xs font-medium text-foreground hover:bg-background transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background theme-transition"
                  >
                    <Icon className="w-3 h-3 text-muted" />
                    {chip.label}
                  </Link>
                );
              })}
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* ═════════════ Emergency Strip ══════════════════ */}
      <section className="bg-danger/8 dark:bg-danger/10 border-y border-danger/15 theme-transition">
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <span className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-danger/12">
                <Siren className="w-[18px] h-[18px] text-danger" />
              </span>
              <p className="text-sm text-foreground">
                <span className="font-medium">Emergency?</span>{' '}
                <span className="text-muted">Find a 24×7 vet or ambulance near you.</span>
              </p>
            </div>
            <Link to="/search?emergency=true" className="shrink-0">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-danger text-white text-sm font-medium rounded-2xl hover:bg-danger/90 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                Get Help Now
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </Container>
      </section>

      {/* ═════════════ CATEGORIES ═══════════════════════ */}
      <section id="categories" className="py-12 sm:py-20">
        <Container>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={staggerContainer}>
            <motion.div className="text-center mb-10 sm:mb-14" variants={fadeItem}>
              <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground">What does your pet need?</h2>
              <p className="mt-2 text-muted text-sm sm:text-base max-w-md mx-auto">Pick a category to get started.</p>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <motion.div key={cat.title} variants={fadeItem}>
                    <Link to={`/search?service=${encodeURIComponent(cat.service)}`}>
                      <Card className="group flex flex-col items-center text-center p-5 sm:p-7 cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                        <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-primary/8 dark:bg-primary/12 mb-4 group-hover:bg-primary/14 transition-colors">
                          <Icon className="w-5 h-5 text-primary" />
                        </span>
                        <h3 className="font-heading font-semibold text-sm text-foreground mb-1">{cat.title}</h3>
                        <p className="text-xs text-muted leading-relaxed">{cat.description}</p>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
            <motion.div className="text-center mt-8" variants={fadeItem}>
              <Link to="/search">
                <Button variant="secondary" className="gap-1.5">
                  See All Providers
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* ═════════════ FEATURED PROVIDERS ═══════════════ */}
      <section className="py-12 sm:py-20 bg-background">
        <Container>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={staggerContainer}>
            <motion.div className="flex items-end justify-between mb-8 sm:mb-10" variants={fadeItem}>
              <div>
                <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground">Top-rated near you</h2>
                <p className="mt-2 text-muted text-sm sm:text-base">Verified providers pet parents love.</p>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <button onClick={() => scroll('left')} className="p-2 rounded-xl border border-border hover:bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40" aria-label="Scroll left">
                  <ChevronLeft className="w-4 h-4 text-foreground" />
                </button>
                <button onClick={() => scroll('right')} className="p-2 rounded-xl border border-border hover:bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40" aria-label="Scroll right">
                  <ChevronRight className="w-4 h-4 text-foreground" />
                </button>
              </div>
            </motion.div>
            <motion.div variants={fadeItem}>
              <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                {featuredProviders.map((p) => (
                  <div key={p.id} className="snap-start">
                    <ProviderCard provider={p} />
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div className="text-center mt-8" variants={fadeItem}>
              <Link to="/search">
                <Button variant="secondary" className="gap-1.5">
                  See All Providers
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* ═════════════ HOW IT WORKS ═════════════════════ */}
      <section className="py-12 sm:py-20">
        <Container>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={staggerContainer}>
            <motion.div className="text-center mb-10 sm:mb-14" variants={fadeItem}>
              <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground">How it works</h2>
              <p className="mt-2 text-muted text-sm sm:text-base max-w-md mx-auto">Three simple steps to the care your animal deserves.</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto">
              {steps.map((s) => {
                const Icon = s.icon;
                return (
                  <motion.div key={s.number} variants={fadeItem}>
                    <div className="flex flex-col items-center text-center">
                      <span className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/8 dark:bg-primary/12 mb-5">
                        <Icon className="w-6 h-6 text-primary" />
                        <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 rounded-full bg-accent text-white text-[10px] font-semibold">{s.number}</span>
                      </span>
                      <h3 className="font-heading font-semibold text-foreground mb-1.5">{s.title}</h3>
                      <p className="text-sm text-muted leading-relaxed max-w-[260px]">{s.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* ═════════════ TRUST / STATS ════════════════════ */}
      <section className="py-12 sm:py-20 bg-surface border-y border-border theme-transition">
        <Container>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={staggerContainer} className="max-w-3xl mx-auto">
            <motion.div className="text-center mb-10 sm:mb-14" variants={fadeItem}>
              <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground">Trusted by pet parents across India</h2>
            </motion.div>
            <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-10">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <motion.div key={stat.label} variants={fadeItem} className="text-center">
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/8 dark:bg-primary/12 mx-auto mb-3">
                      <Icon className="w-5 h-5 text-primary" />
                    </span>
                    <p className="font-heading text-2xl sm:text-3xl font-semibold text-foreground">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-muted mt-1">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>
            <motion.div variants={fadeItem}>
              <Card className="text-center py-6 px-6 sm:px-10">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span className="font-heading font-semibold text-sm text-foreground">How we verify providers</span>
                </div>
                <p className="text-sm text-muted leading-relaxed max-w-lg mx-auto">
                  Every listing is reviewed for valid registration, qualifications and infrastructure. We collect real feedback from pet parents and re-verify annually so you can book with confidence.
                </p>
              </Card>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* ═════════════ PROVIDER BANNER ══════════════════ */}
      <section className="py-12 sm:py-20">
        <Container>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={staggerContainer}>
            <motion.div variants={fadeItem}>
              <div className="relative overflow-hidden rounded-2xl bg-primary/6 dark:bg-primary/10 border border-primary/12 p-8 sm:p-12">
                <svg className="absolute -top-16 -right-16 w-64 h-64 opacity-[0.06]" viewBox="0 0 256 256" fill="none" aria-hidden="true">
                  <circle cx="128" cy="128" r="128" fill="var(--pr)" />
                </svg>
                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="font-heading text-xl sm:text-2xl font-semibold text-foreground mb-2">Run a clinic, shelter or boarding facility?</h2>
                    <p className="text-sm text-muted max-w-md">List your business for free and reach thousands of pet parents looking for trusted care.</p>
                  </div>
                  <Button size="lg" className="shrink-0 gap-2" onClick={openListBusinessModal}>
                    List Your Business
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </section>
    </>
  );
}
