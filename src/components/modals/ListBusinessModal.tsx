import { useState } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import { CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_OPTIONS = [
  { value: '', label: 'Select business type' },
  { value: 'vet-clinic', label: 'Vet Clinic' },
  { value: 'hospital', label: 'Animal Hospital' },
  { value: 'boarding', label: 'Boarding Facility' },
  { value: 'diagnostics', label: 'Diagnostics Lab' },
  { value: 'ambulance', label: 'Ambulance Service' },
  { value: 'ngo', label: 'NGO / Shelter' },
];

const SERVICE_CHIPS = [
  'Consultation', 'Vaccination', 'Surgery', 'Emergency Care', 'ICU',
  'Diagnostics', 'Grooming', 'Boarding', 'Training', 'Rescue',
  'Adoption', 'Home Visit', 'Dental', 'Rehab',
];

const ANIMAL_CHIPS = ['Dog', 'Cat', 'Bird', 'Livestock', 'Exotic'];

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Step1 {
  businessName: string;
  type: string;
  city: string;
  phone: string;
}

interface Step2 {
  services: string[];
  animals: string[];
  timings: string;
  is24x7: boolean;
  website: string;
}

type Step = 1 | 2 | 'success';

function toggleArr(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

export function ListBusinessModal({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [step1, setStep1] = useState<Step1>({ businessName: '', type: '', city: '', phone: '' });
  const [step2, setStep2] = useState<Step2>({ services: [], animals: [], timings: '', is24x7: false, website: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setStep1({ businessName: '', type: '', city: '', phone: '' });
      setStep2({ services: [], animals: [], timings: '', is24x7: false, website: '' });
      setErrors({});
    }, 250);
  };

  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {};
    if (!step1.businessName.trim()) e.businessName = 'Business name is required';
    if (!step1.type) e.type = 'Please select a business type';
    if (!step1.city.trim()) e.city = 'City is required';
    if (!step1.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^[\d\s+\-()]{8,}$/.test(step1.phone.trim())) e.phone = 'Enter a valid phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: Record<string, string> = {};
    if (step2.services.length === 0) e.services = 'Select at least one service';
    if (step2.animals.length === 0) e.animals = 'Select at least one animal type';
    if (!step2.is24x7 && !step2.timings.trim()) e.timings = 'Enter your timings or toggle 24×7';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setErrors({});
      setStep(2);
    }
  };

  const submit = () => {
    if (!validateStep2()) return;

    const listings = JSON.parse(localStorage.getItem('listings') || '[]');
    listings.push({
      ...step1,
      ...step2,
      submittedAt: new Date().toISOString(),
    });
    localStorage.setItem('listings', JSON.stringify(listings));

    setStep('success');
  };

  const set1 = (key: keyof Step1, value: string) => {
    setStep1((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  const title = step === 'success' ? undefined : step === 1 ? 'List Your Business' : 'Almost there';

  return (
    <Modal open={open} onClose={handleClose} title={title}>
      {/* Progress */}
      {step !== 'success' && (
        <div className="flex items-center gap-2 mb-5">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={[
                  'h-1.5 rounded-full flex-1 transition-colors duration-300',
                  (typeof step === 'number' && s <= step) ? 'bg-primary' : 'bg-border',
                ].join(' ')}
              />
            </div>
          ))}
          <span className="text-xs text-muted ml-1">Step {step as number}/2</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="s1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <Input
              label="Business Name"
              value={step1.businessName}
              onChange={(e) => set1('businessName', e.target.value)}
              placeholder="e.g. Happy Paws Vet Clinic"
              error={errors.businessName}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Business Type</label>
              <select
                value={step1.type}
                onChange={(e) => set1('type', e.target.value)}
                className={[
                  'w-full px-3.5 py-2.5 bg-surface border rounded-2xl text-sm text-foreground appearance-none cursor-pointer',
                  'transition-all duration-200 theme-transition',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  errors.type ? 'border-danger' : 'border-border',
                ].join(' ')}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {errors.type && <p className="text-xs text-danger">{errors.type}</p>}
            </div>

            <Input
              label="City"
              value={step1.city}
              onChange={(e) => set1('city', e.target.value)}
              placeholder="e.g. Mumbai"
              error={errors.city}
            />

            <Input
              label="Phone Number"
              type="tel"
              value={step1.phone}
              onChange={(e) => set1('phone', e.target.value)}
              placeholder="+91 98765 43210"
              error={errors.phone}
            />

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
              <Button className="flex-1 gap-1.5" onClick={nextStep}>
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="s2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Services */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Services Offered</label>
              <div className="flex flex-wrap gap-1.5">
                {SERVICE_CHIPS.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setStep2((f) => ({ ...f, services: toggleArr(f.services, s) }));
                      if (errors.services) setErrors((e) => { const n = { ...e }; delete n.services; return n; });
                    }}
                    className={[
                      'px-2.5 py-1 rounded-full text-xs font-medium transition-colors duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                      step2.services.includes(s)
                        ? 'bg-primary text-white'
                        : 'bg-background border border-border text-foreground hover:bg-surface',
                    ].join(' ')}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {errors.services && <p className="text-xs text-danger mt-1">{errors.services}</p>}
            </div>

            {/* Animals */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Animals Treated</label>
              <div className="flex flex-wrap gap-1.5">
                {ANIMAL_CHIPS.map((a) => (
                  <button
                    key={a}
                    onClick={() => {
                      setStep2((f) => ({ ...f, animals: toggleArr(f.animals, a) }));
                      if (errors.animals) setErrors((e) => { const n = { ...e }; delete n.animals; return n; });
                    }}
                    className={[
                      'px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                      step2.animals.includes(a)
                        ? 'bg-primary text-white'
                        : 'bg-background border border-border text-foreground hover:bg-surface',
                    ].join(' ')}
                  >
                    {a}
                  </button>
                ))}
              </div>
              {errors.animals && <p className="text-xs text-danger mt-1">{errors.animals}</p>}
            </div>

            {/* 24x7 toggle */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-foreground">Open 24×7</span>
              <button
                role="switch"
                aria-checked={step2.is24x7}
                onClick={() => setStep2((f) => ({ ...f, is24x7: !f.is24x7 }))}
                className={[
                  'relative w-10 h-[22px] rounded-full transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  step2.is24x7 ? 'bg-primary' : 'bg-border',
                ].join(' ')}
              >
                <span
                  className={[
                    'absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200',
                    step2.is24x7 ? 'translate-x-[18px]' : 'translate-x-0',
                  ].join(' ')}
                />
              </button>
            </label>

            {/* Timings */}
            {!step2.is24x7 && (
              <Input
                label="Timings"
                value={step2.timings}
                onChange={(e) => {
                  setStep2((f) => ({ ...f, timings: e.target.value }));
                  if (errors.timings) setErrors((e2) => { const n = { ...e2 }; delete n.timings; return n; });
                }}
                placeholder="e.g. Mon-Sat 9 AM – 8 PM"
                error={errors.timings}
              />
            )}

            {/* Website */}
            <Input
              label="Website (optional)"
              type="url"
              value={step2.website}
              onChange={(e) => setStep2((f) => ({ ...f, website: e.target.value }))}
              placeholder="https://yourwebsite.com"
            />

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" className="flex-1 gap-1.5" onClick={() => { setErrors({}); setStep(1); }}>
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button className="flex-1" onClick={submit}>
                Submit Listing
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col items-center text-center py-6"
          >
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
              <CheckCircle2 className="w-7 h-7 text-primary" />
            </span>
            <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
              Listing submitted!
            </h3>
            <p className="text-sm text-muted max-w-xs mb-2">
              Our team will review your details and publish your listing within 3–5 business days.
            </p>
            <div className="bg-background rounded-xl p-3 text-left text-xs text-muted space-y-1 mb-6 w-full max-w-xs">
              <p className="font-medium text-foreground text-sm mb-1.5">What happens next?</p>
              <p>1. We verify your registration &amp; credentials</p>
              <p>2. Your listing goes live with a verified badge</p>
              <p>3. Pet parents in your area discover you</p>
            </div>
            <Button variant="secondary" onClick={handleClose}>
              Done
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
