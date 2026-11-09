import { useState, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { Container, Card, Badge, Skeleton, BottomSheet, Button } from '@/components/ui';
import { providers, typeLabels } from '@/data/providers';
import type { Provider } from '@/data/providers';
import type { LayoutContext } from '@/lib/types';
import { useDocTitle } from '@/hooks/useDocTitle';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  ShieldCheck,
  Phone as PhoneIcon,
  Navigation,
  Heart,
  X,
  Zap,
  ChevronDown,
  List,
  Map as MapIcon,
  SearchX,
  ExternalLink,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

/* ═══════════════════ types ══════════════════════════════ */

interface Filters {
  serviceType: string[];
  animalType: string[];
  maxDistance: number;
  openNow: boolean;
  is24x7: boolean;
  minRating: number | null;
  priceRange: string[];
  homeVisit: boolean;
  verifiedOnly: boolean;
}

type SortKey = 'nearest' | 'top-rated' | 'price-low';

const INITIAL_FILTERS: Filters = {
  serviceType: [],
  animalType: [],
  maxDistance: 50,
  openNow: false,
  is24x7: false,
  minRating: null,
  priceRange: [],
  homeVisit: false,
  verifiedOnly: false,
};

/* ═══════════════════ constants ══════════════════════════ */

const SERVICE_OPTIONS = ['Vet Clinic', 'Hospital', 'Boarding', 'Diagnostics', 'Ambulance', 'NGO'];
const ANIMAL_OPTIONS = ['Dog', 'Cat', 'Bird', 'Livestock', 'Exotic'];
const PRICE_OPTIONS = ['₹', '₹₹', '₹₹₹'];
const RATING_OPTIONS = [
  { label: '4+ Stars', value: 4 },
  { label: '4.5+ Stars', value: 4.5 },
];
const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: 'Nearest', value: 'nearest' },
  { label: 'Top Rated', value: 'top-rated' },
  { label: 'Price: Low → High', value: 'price-low' },
];

const SERVICE_TO_TYPE: Record<string, Provider['type']> = {
  'Vet Clinic': 'vet-clinic',
  Hospital: 'hospital',
  Boarding: 'boarding',
  Diagnostics: 'diagnostics',
  Ambulance: 'ambulance',
  NGO: 'ngo',
};

const PRICE_RANK: Record<string, number> = { '₹': 1, '₹₹': 2, '₹₹₹': 3 };

const fadeItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] } },
};

/* ═══════════════════ helpers ════════════════════════════ */

function toggleInArray(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

function hasActiveFilters(f: Filters): boolean {
  return (
    f.serviceType.length > 0 ||
    f.animalType.length > 0 ||
    f.maxDistance < 50 ||
    f.openNow ||
    f.is24x7 ||
    f.minRating !== null ||
    f.priceRange.length > 0 ||
    f.homeVisit ||
    f.verifiedOnly
  );
}

function getActiveChips(f: Filters): { key: string; label: string }[] {
  const chips: { key: string; label: string }[] = [];
  f.serviceType.forEach((s) => chips.push({ key: `svc-${s}`, label: s }));
  f.animalType.forEach((a) => chips.push({ key: `ani-${a}`, label: a }));
  if (f.maxDistance < 50) chips.push({ key: 'dist', label: `Within ${f.maxDistance} km` });
  if (f.openNow) chips.push({ key: 'open', label: 'Open Now' });
  if (f.is24x7) chips.push({ key: '24x7', label: '24×7 Emergency' });
  if (f.minRating) chips.push({ key: 'rating', label: `${f.minRating}+ Stars` });
  f.priceRange.forEach((p) => chips.push({ key: `price-${p}`, label: p }));
  if (f.homeVisit) chips.push({ key: 'home', label: 'Home Visit' });
  if (f.verifiedOnly) chips.push({ key: 'verified', label: 'Verified Only' });
  return chips;
}

function removeChip(f: Filters, key: string): Filters {
  const next = { ...f };
  if (key.startsWith('svc-')) next.serviceType = next.serviceType.filter((s) => s !== key.slice(4));
  else if (key.startsWith('ani-')) next.animalType = next.animalType.filter((a) => a !== key.slice(4));
  else if (key === 'dist') next.maxDistance = 50;
  else if (key === 'open') next.openNow = false;
  else if (key === '24x7') next.is24x7 = false;
  else if (key === 'rating') next.minRating = null;
  else if (key.startsWith('price-')) next.priceRange = next.priceRange.filter((p) => p !== key.slice(6));
  else if (key === 'home') next.homeVisit = false;
  else if (key === 'verified') next.verifiedOnly = false;
  return next;
}

/* ═══════════════════ sub-components ═════════════════════ */

/* ── Toggle Chip ───────────────────────────────────────── */

function ToggleChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        selected
          ? 'bg-primary text-white'
          : 'bg-background border border-border text-foreground hover:bg-surface',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

/* ── Toggle Switch ─────────────────────────────────────── */

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-foreground">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative w-10 h-[22px] rounded-full transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
          checked ? 'bg-primary' : 'bg-border',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200',
            checked ? 'translate-x-[18px]' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </label>
  );
}

/* ── Filter Controls (shared between sidebar & sheet) ──── */

function FilterControls({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-col gap-6">
      {/* Service type */}
      <div>
        <h4 className="text-xs font-medium text-muted uppercase tracking-wider mb-2.5">
          Service Type
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {SERVICE_OPTIONS.map((s) => (
            <ToggleChip
              key={s}
              selected={filters.serviceType.includes(s)}
              onClick={() => set('serviceType', toggleInArray(filters.serviceType, s))}
            >
              {s}
            </ToggleChip>
          ))}
        </div>
      </div>

      {/* Animal type */}
      <div>
        <h4 className="text-xs font-medium text-muted uppercase tracking-wider mb-2.5">
          Animal Type
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {ANIMAL_OPTIONS.map((a) => (
            <ToggleChip
              key={a}
              selected={filters.animalType.includes(a)}
              onClick={() => set('animalType', toggleInArray(filters.animalType, a))}
            >
              {a}
            </ToggleChip>
          ))}
        </div>
      </div>

      {/* Distance */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-medium text-muted uppercase tracking-wider">Distance</h4>
          <span className="text-xs font-medium text-foreground">{filters.maxDistance} km</span>
        </div>
        <input
          type="range"
          min={1}
          max={50}
          value={filters.maxDistance}
          onChange={(e) => set('maxDistance', Number(e.target.value))}
          className="w-full"
          aria-label="Maximum distance"
        />
        <div className="flex justify-between text-[10px] text-muted mt-1">
          <span>1 km</span>
          <span>50 km</span>
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="text-xs font-medium text-muted uppercase tracking-wider mb-2.5">
          Minimum Rating
        </h4>
        <div className="flex gap-1.5">
          {RATING_OPTIONS.map((r) => (
            <ToggleChip
              key={r.value}
              selected={filters.minRating === r.value}
              onClick={() => set('minRating', filters.minRating === r.value ? null : r.value)}
            >
              {r.label}
            </ToggleChip>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h4 className="text-xs font-medium text-muted uppercase tracking-wider mb-2.5">
          Price Range
        </h4>
        <div className="flex gap-1.5">
          {PRICE_OPTIONS.map((p) => (
            <ToggleChip
              key={p}
              selected={filters.priceRange.includes(p)}
              onClick={() => set('priceRange', toggleInArray(filters.priceRange, p))}
            >
              {p}
            </ToggleChip>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-col gap-3.5">
        <Toggle label="Open Now" checked={filters.openNow} onChange={(v) => set('openNow', v)} />
        <Toggle label="24×7 Emergency" checked={filters.is24x7} onChange={(v) => set('is24x7', v)} />
        <Toggle label="Home Visit" checked={filters.homeVisit} onChange={(v) => set('homeVisit', v)} />
        <Toggle label="Verified Only" checked={filters.verifiedOnly} onChange={(v) => set('verifiedOnly', v)} />
      </div>
    </div>
  );
}

/* ── Skeleton Card ─────────────────────────────────────── */

function SkeletonCard() {
  return (
    <Card className="overflow-hidden p-0">
      <Skeleton className="h-28 rounded-none rounded-t-2xl" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-8 flex-1 rounded-xl" />
          <Skeleton className="h-8 flex-1 rounded-xl" />
        </div>
      </div>
    </Card>
  );
}

/* ── Provider Card ─────────────────────────────────────── */

function ProviderCard({
  provider,
  onSelect,
  saved,
  onToggleSave,
}: {
  provider: Provider;
  onSelect: () => void;
  saved: boolean;
  onToggleSave: () => void;
}) {
  return (
    <Card className="overflow-hidden p-0 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer group">
      {/* Image area */}
      <div
        className="h-28 relative"
        style={{ backgroundColor: provider.imageColor }}
        onClick={onSelect}
      >
        {provider.verified && (
          <span className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-white/90 dark:bg-surface/90 backdrop-blur-sm text-xs font-medium text-primary px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3" />
            Verified
          </span>
        )}

        {/* Save heart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/80 dark:bg-surface/80 backdrop-blur-sm hover:bg-white dark:hover:bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label={saved ? 'Unsave' : 'Save'}
        >
          <Heart
            className={[
              'w-4 h-4 transition-colors',
              saved ? 'fill-danger text-danger' : 'text-muted',
            ].join(' ')}
          />
        </button>

        {/* Status badges */}
        <div className="absolute bottom-2.5 left-2.5 flex gap-1.5">
          {provider.is24x7 && (
            <span className="flex items-center gap-1 bg-accent/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
              <Zap className="w-2.5 h-2.5" />
              24×7
            </span>
          )}
          {provider.emergency && (
            <span className="flex items-center gap-1 bg-danger/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
              Emergency
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4" onClick={onSelect}>
        {/* Name + type */}
        <div className="mb-2">
          <h3 className="font-heading font-semibold text-sm text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
            {provider.name}
          </h3>
          <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" />
            {provider.area}, {provider.city} &middot; {provider.distanceKm} km
          </p>
        </div>

        {/* Rating + status + price */}
        <div className="flex items-center gap-2.5 mb-3 text-xs">
          <span className="inline-flex items-center gap-1 font-medium text-foreground">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            {provider.rating}
            <span className="text-muted font-normal">({provider.reviews})</span>
          </span>
          <span className={provider.openNow ? 'text-primary font-medium' : 'text-danger font-medium'}>
            {provider.openNow ? 'Open' : 'Closed'}
          </span>
          <span className="text-muted">{provider.priceRange}</span>
        </div>

        {/* Service chips */}
        <div className="flex flex-wrap gap-1 mb-3">
          {provider.services.slice(0, 3).map((s) => (
            <span
              key={s}
              className="px-2 py-0.5 bg-background text-[10px] text-muted rounded-md"
            >
              {s}
            </span>
          ))}
          {provider.services.length > 3 && (
            <span className="px-2 py-0.5 text-[10px] text-muted">
              +{provider.services.length - 3}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <a
            href={`tel:${provider.phone.replace(/\s/g, '')}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-white text-xs font-medium rounded-xl hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <PhoneIcon className="w-3.5 h-3.5" />
            Call
          </a>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(provider.area + ', ' + provider.city)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-surface border border-border text-xs font-medium text-foreground rounded-xl hover:bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Navigation className="w-3.5 h-3.5" />
            Directions
          </a>
        </div>
      </div>
    </Card>
  );
}

/* ── Provider Detail ───────────────────────────────────── */

const MOCK_TIMINGS = [
  { day: 'Mon – Fri', hours: '9:00 AM – 8:00 PM' },
  { day: 'Saturday', hours: '9:00 AM – 5:00 PM' },
  { day: 'Sunday', hours: '10:00 AM – 2:00 PM' },
];

function ProviderDetail({
  provider,
  open,
  onClose,
  onCorrection,
}: {
  provider: Provider | null;
  open: boolean;
  onClose: () => void;
  onCorrection: (name: string) => void;
}) {
  if (!provider) return null;

  return (
    <BottomSheet open={open} onClose={onClose} title={provider.name}>
      <div className="space-y-5">
        {/* Header badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="primary">{typeLabels[provider.type]}</Badge>
          {provider.verified && (
            <Badge variant="primary">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            </Badge>
          )}
          {provider.is24x7 && <Badge variant="accent">24×7</Badge>}
          {provider.emergency && <Badge variant="danger">Emergency</Badge>}
          {provider.homeVisit && <Badge>Home Visit</Badge>}
        </div>

        {/* Rating + location */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-medium text-foreground">{provider.rating}</span>
            <span className="text-muted">({provider.reviews} reviews)</span>
            <span className="text-muted">&middot; {provider.priceRange}</span>
          </div>
          <p className="text-sm text-muted flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            {provider.area}, {provider.city} &middot; {provider.distanceKm} km away
          </p>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
            Services
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {provider.services.map((s) => (
              <span
                key={s}
                className="px-2.5 py-1 bg-background border border-border text-xs text-foreground rounded-lg"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Animals */}
        <div>
          <h4 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
            Animals Treated
          </h4>
          <p className="text-sm text-foreground">{provider.animals.join(', ')}</p>
        </div>

        {/* Timings */}
        <div>
          <h4 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
            Timings
          </h4>
          <div className="space-y-1">
            {provider.is24x7 ? (
              <p className="text-sm text-primary font-medium">Open 24 hours, 7 days a week</p>
            ) : (
              MOCK_TIMINGS.map((t) => (
                <div key={t.day} className="flex justify-between text-sm">
                  <span className="text-muted">{t.day}</span>
                  <span className="text-foreground">{t.hours}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
            Contact
          </h4>
          <a
            href={`tel:${provider.phone.replace(/\s/g, '')}`}
            className="text-sm text-primary hover:underline flex items-center gap-1.5"
          >
            <PhoneIcon className="w-3.5 h-3.5" />
            {provider.phone}
          </a>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <a
            href={`tel:${provider.phone.replace(/\s/g, '')}`}
            className="flex-1"
          >
            <Button size="lg" className="w-full gap-2">
              <PhoneIcon className="w-4 h-4" />
              Call Now
            </Button>
          </a>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(provider.area + ', ' + provider.city)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="secondary" size="lg" className="w-full gap-2">
              <Navigation className="w-4 h-4" />
              Directions
            </Button>
          </a>
        </div>

        {/* Submit correction */}
        <div className="text-center pt-2 border-t border-border">
          <button
            onClick={() => { onClose(); onCorrection(provider.name); }}
            className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-lg px-2 py-1"
          >
            <ExternalLink className="w-3 h-3" />
            Submit a Correction
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

/* ── Map Placeholder ───────────────────────────────────── */

const PIN_COLORS: Record<Provider['type'], string> = {
  'vet-clinic': '#5E8C73',
  hospital: '#7C6BAF',
  boarding: '#C49A6C',
  diagnostics: '#5B8FA8',
  ambulance: '#D97B7B',
  ngo: '#6BAF8C',
};

function MapPlaceholder({
  results,
  selectedId,
  onSelect,
}: {
  results: Provider[];
  selectedId: string | null;
  onSelect: (p: Provider) => void;
}) {
  // Position pins in a grid-like layout
  const positions = useMemo(() => {
    return results.map((_, i) => ({
      left: 12 + ((i * 37 + i * i * 7) % 76),
      top: 10 + ((i * 29 + i * i * 11) % 75),
    }));
  }, [results]);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-background rounded-2xl border border-border overflow-hidden theme-transition">
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.25]" aria-hidden="true">
        {[20, 40, 60, 80].map((p) => (
          <line key={`h${p}`} x1="0%" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="var(--bd)" strokeWidth="1" />
        ))}
        {[25, 50, 75].map((p) => (
          <line key={`v${p}`} x1={`${p}%`} y1="0%" x2={`${p}%`} y2="100%" stroke="var(--bd)" strokeWidth="1" />
        ))}
        {/* "Roads" */}
        <line x1="10%" y1="30%" x2="90%" y2="30%" stroke="var(--bd)" strokeWidth="3" strokeLinecap="round" />
        <line x1="35%" y1="5%" x2="35%" y2="95%" stroke="var(--bd)" strokeWidth="3" strokeLinecap="round" />
        <line x1="10%" y1="65%" x2="70%" y2="65%" stroke="var(--bd)" strokeWidth="2" strokeLinecap="round" />
        <line x1="65%" y1="15%" x2="65%" y2="85%" stroke="var(--bd)" strokeWidth="2" strokeLinecap="round" />
      </svg>

      {/* Pins */}
      {results.map((p, i) => {
        const pos = positions[i];
        if (!pos) return null;
        const isSelected = selectedId === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className="absolute z-10 group focus-visible:outline-none"
            style={{ left: `${pos.left}%`, top: `${pos.top}%`, transform: 'translate(-50%, -100%)' }}
            aria-label={p.name}
          >
            {/* Pin shape */}
            <div
              className={[
                'flex items-center justify-center w-8 h-8 rounded-full border-2 border-white dark:border-surface shadow-md transition-transform duration-150',
                isSelected ? 'scale-125 ring-2 ring-primary/40' : 'hover:scale-110',
              ].join(' ')}
              style={{ backgroundColor: PIN_COLORS[p.type] }}
            >
              <span className="text-[10px] font-semibold text-white">
                {p.name.charAt(0)}
              </span>
            </div>
            {/* Pin tail */}
            <div
              className="w-2 h-2 mx-auto -mt-1 rotate-45 border-b-2 border-r-2 border-white dark:border-surface"
              style={{ backgroundColor: PIN_COLORS[p.type] }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-surface border border-border rounded-lg shadow-lg text-[10px] font-medium text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity pointer-events-none">
              {p.name}
            </div>
          </button>
        );
      })}

      {/* Empty map state */}
      {results.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-muted">No providers to display</p>
        </div>
      )}

      {/* Map label */}
      <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-surface/80 backdrop-blur-sm border border-border rounded-lg text-[10px] text-muted">
        Map placeholder &middot; {results.length} providers
      </div>
    </div>
  );
}

/* ── Empty State ───────────────────────────────────────── */

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-background border border-border mb-4">
        <SearchX className="w-6 h-6 text-muted" />
      </span>
      <h3 className="font-heading font-semibold text-foreground mb-1">No providers found</h3>
      <p className="text-sm text-muted mb-5 max-w-xs">
        Try widening your filters or searching in a different area.
      </p>
      <Button variant="secondary" onClick={onClear}>
        Clear All Filters
      </Button>
    </div>
  );
}

/* ══════════════════════ MAIN PAGE ══════════════════════ */

export default function SearchPage() {
  useDocTitle('Search Providers');
  const { openCorrectionModal } = useOutletContext<LayoutContext>();
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [sort, setSort] = useState<SortKey>('nearest');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Temp filters for mobile sheet (apply on button press)
  const [tempFilters, setTempFilters] = useState<Filters>(INITIAL_FILTERS);

  // Read URL params on mount to preset filters
  useEffect(() => {
    const preset: Partial<Filters> = {};
    const service = searchParams.get('service');
    const animal = searchParams.get('animal');
    if (service) preset.serviceType = [service];
    if (animal) preset.animalType = [animal];
    if (searchParams.get('emergency') === 'true') preset.is24x7 = true;
    if (searchParams.get('openNow') === 'true') preset.openNow = true;
    if (searchParams.get('homeVisit') === 'true') preset.homeVisit = true;
    if (Object.keys(preset).length > 0) {
      setFilters((f) => ({ ...f, ...preset }));
      setTempFilters((f) => ({ ...f, ...preset }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fake loading
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [filters, sort, query]);

  // Filter + sort
  const results = useMemo(() => {
    let filtered = [...providers];

    // Text search
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.area.toLowerCase().includes(q),
      );
    }

    // Filters
    if (filters.serviceType.length > 0) {
      const types = filters.serviceType.map((s) => SERVICE_TO_TYPE[s]).filter(Boolean);
      filtered = filtered.filter((p) => types.includes(p.type));
    }
    if (filters.animalType.length > 0) {
      filtered = filtered.filter((p) => filters.animalType.some((a) => p.animals.includes(a)));
    }
    if (filters.maxDistance < 50) {
      filtered = filtered.filter((p) => p.distanceKm <= filters.maxDistance);
    }
    if (filters.openNow) filtered = filtered.filter((p) => p.openNow);
    if (filters.is24x7) filtered = filtered.filter((p) => p.is24x7);
    if (filters.minRating !== null) {
      const min = filters.minRating;
      filtered = filtered.filter((p) => p.rating >= min);
    }
    if (filters.priceRange.length > 0) {
      filtered = filtered.filter((p) => filters.priceRange.includes(p.priceRange));
    }
    if (filters.homeVisit) filtered = filtered.filter((p) => p.homeVisit);
    if (filters.verifiedOnly) filtered = filtered.filter((p) => p.verified);

    // Sort
    switch (sort) {
      case 'nearest':
        filtered.sort((a, b) => a.distanceKm - b.distanceKm);
        break;
      case 'top-rated':
        filtered.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
        break;
      case 'price-low':
        filtered.sort((a, b) => (PRICE_RANK[a.priceRange] ?? 0) - (PRICE_RANK[b.priceRange] ?? 0));
        break;
    }

    return filtered;
  }, [providers, filters, sort, query]);

  const activeChips = getActiveChips(filters);

  const clearFilters = useCallback(() => setFilters(INITIAL_FILTERS), []);

  const openDetail = (p: Provider) => {
    setSelectedProvider(p);
    setDetailOpen(true);
  };

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openFilterSheet = () => {
    setTempFilters(filters);
    setFilterSheetOpen(true);
  };

  const applyTempFilters = () => {
    setFilters(tempFilters);
    setFilterSheetOpen(false);
  };

  return (
    <>
      {/* ── Mobile Sticky Search Bar ────────────────── */}
      <div className="sticky top-14 z-30 bg-surface/90 backdrop-blur-lg border-b border-border lg:hidden theme-transition">
        <div className="px-4 py-2.5 flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search vets, clinics, cities..."
              className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            />
          </div>
          <button
            onClick={openFilterSheet}
            className={[
              'relative p-2.5 rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              hasActiveFilters(filters)
                ? 'bg-primary text-white border-primary'
                : 'bg-surface border-border text-foreground hover:bg-background',
            ].join(' ')}
            aria-label="Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {hasActiveFilters(filters) && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center">
                {activeChips.length}
              </span>
            )}
          </button>
        </div>

        {/* Mobile view toggle + sort */}
        <div className="px-4 pb-2.5 flex items-center justify-between">
          <div className="flex items-center bg-background rounded-lg p-0.5 border border-border">
            <button
              onClick={() => setMobileView('list')}
              className={[
                'flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors',
                mobileView === 'list' ? 'bg-surface text-foreground shadow-sm' : 'text-muted',
              ].join(' ')}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
            <button
              onClick={() => setMobileView('map')}
              className={[
                'flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors',
                mobileView === 'map' ? 'bg-surface text-foreground shadow-sm' : 'text-muted',
              ].join(' ')}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Map
            </button>
          </div>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="appearance-none bg-transparent text-xs text-muted pr-5 cursor-pointer focus-visible:outline-none"
              aria-label="Sort by"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Desktop 3-Column Layout ─────────────────── */}
      <Container className="py-4 lg:py-6">
        <div className="flex gap-6">
          {/* LEFT: Filter Sidebar (desktop) */}
          <aside className="hidden lg:block w-[272px] shrink-0">
            <div className="sticky top-[calc(3.5rem+1.5rem)] max-h-[calc(100vh-5rem)] overflow-y-auto pr-2 scrollbar-hide">
              {/* Search */}
              <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search vets, clinics, cities..."
                  className="w-full pl-9 pr-3 py-2.5 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 theme-transition"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading font-semibold text-sm text-foreground">Filters</h3>
                {hasActiveFilters(filters) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-primary hover:underline focus-visible:outline-none"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <FilterControls filters={filters} onChange={setFilters} />

              {/* Sort dropdown */}
              <div className="mt-6 pt-5 border-t border-border">
                <h4 className="text-xs font-medium text-muted uppercase tracking-wider mb-2.5">
                  Sort By
                </h4>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="w-full appearance-none px-3 py-2 bg-surface border border-border rounded-xl text-sm text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 theme-transition"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                </div>
              </div>
            </div>
          </aside>

          {/* CENTER: Results */}
          <div className="flex-1 min-w-0">
            {/* Active filter chips (desktop) */}
            {activeChips.length > 0 && (
              <div className="hidden lg:flex flex-wrap items-center gap-1.5 mb-4">
                {activeChips.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setFilters(removeChip(filters, c.key))}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/8 text-primary text-xs font-medium rounded-full hover:bg-primary/14 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    {c.label}
                    <X className="w-3 h-3" />
                  </button>
                ))}
                <button
                  onClick={clearFilters}
                  className="text-xs text-muted hover:text-foreground transition-colors ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Result count + sort (desktop) */}
            <div className="hidden lg:flex items-center justify-between mb-4">
              <p className="text-sm text-muted">
                {loading ? (
                  <Skeleton className="h-4 w-40 inline-block" />
                ) : (
                  <>
                    Showing <span className="font-medium text-foreground">{results.length}</span> of{' '}
                    {providers.length} providers
                  </>
                )}
              </p>
            </div>

            {/* Mobile result count */}
            <div className="lg:hidden mb-3 px-0.5">
              <p className="text-xs text-muted">
                {loading ? '...' : `${results.length} providers found`}
              </p>
            </div>

            {/* Active filter chips (mobile) */}
            {activeChips.length > 0 && (
              <div className="lg:hidden flex overflow-x-auto gap-1.5 mb-3 pb-1 scrollbar-hide">
                {activeChips.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setFilters(removeChip(filters, c.key))}
                    className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 bg-primary/8 text-primary text-xs font-medium rounded-full hover:bg-primary/14 transition-colors"
                  >
                    {c.label}
                    <X className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}

            {/* Mobile map view */}
            {mobileView === 'map' && (
              <div className="lg:hidden mb-4 h-[60vh]">
                <MapPlaceholder
                  results={results}
                  selectedId={selectedProvider?.id ?? null}
                  onSelect={openDetail}
                />
              </div>
            )}

            {/* Results list (or mobile map) */}
            {(mobileView === 'list' || typeof window !== 'undefined') && (
              <div className={mobileView === 'map' ? 'hidden lg:block' : ''}>
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="skeleton"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4"
                    >
                      {Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonCard key={i} />
                      ))}
                    </motion.div>
                  ) : results.length === 0 ? (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <EmptyState onClear={clearFilters} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="results"
                      initial="hidden"
                      animate="show"
                      variants={{ show: { transition: { staggerChildren: 0.04 } } }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4"
                    >
                      {results.map((p) => (
                        <motion.div key={p.id} variants={fadeItem}>
                          <ProviderCard
                            provider={p}
                            onSelect={() => openDetail(p)}
                            saved={savedIds.has(p.id)}
                            onToggleSave={() => toggleSave(p.id)}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* RIGHT: Map (desktop) */}
          <aside className="hidden lg:block w-[380px] shrink-0">
            <div className="sticky top-[calc(3.5rem+1.5rem)] h-[calc(100vh-5rem)]">
              <MapPlaceholder
                results={results}
                selectedId={selectedProvider?.id ?? null}
                onSelect={openDetail}
              />
            </div>
          </aside>
        </div>
      </Container>

      {/* ── Mobile Filter Bottom Sheet ──────────────── */}
      <BottomSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        title="Filters"
      >
        <div className="max-h-[60vh] overflow-y-auto -mx-1 px-1 pb-4">
          <FilterControls filters={tempFilters} onChange={setTempFilters} />
        </div>
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => {
              setTempFilters(INITIAL_FILTERS);
              setFilters(INITIAL_FILTERS);
              setFilterSheetOpen(false);
            }}
          >
            Clear All
          </Button>
          <Button className="flex-1" onClick={applyTempFilters}>
            Apply Filters
          </Button>
        </div>
      </BottomSheet>

      {/* ── Provider Detail Drawer ──────────────────── */}
      <ProviderDetail
        provider={selectedProvider}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onCorrection={(name) => openCorrectionModal(name)}
      />
    </>
  );
}
