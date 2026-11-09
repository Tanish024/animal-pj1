import { useState } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import { CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ISSUE_OPTIONS = [
  { value: '', label: 'Select an issue' },
  { value: 'phone', label: 'Phone number is wrong' },
  { value: 'address', label: 'Address or location is wrong' },
  { value: 'timings', label: 'Timings or hours are wrong' },
  { value: 'services', label: 'Services listed are incorrect' },
  { value: 'closed', label: 'Permanently closed' },
  { value: 'other', label: 'Something else' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  prefillProvider?: string;
}

interface FormData {
  providerName: string;
  issueType: string;
  correctInfo: string;
  email: string;
}

interface Errors {
  providerName?: string;
  issueType?: string;
  correctInfo?: string;
}

export function SubmitCorrectionModal({ open, onClose, prefillProvider = '' }: Props) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [form, setForm] = useState<FormData>({
    providerName: prefillProvider,
    issueType: '',
    correctInfo: '',
    email: '',
  });
  const [errors, setErrors] = useState<Errors>({});

  // Reset when modal opens with new prefill
  const handleClose = () => {
    onClose();
    // Delay reset so the closing animation plays first
    setTimeout(() => {
      setStep('form');
      setForm({ providerName: '', issueType: '', correctInfo: '', email: '' });
      setErrors({});
    }, 250);
  };

  // Sync prefill when it changes while open
  if (open && prefillProvider && form.providerName !== prefillProvider && step === 'form') {
    setForm((f) => ({ ...f, providerName: prefillProvider }));
  }

  const validate = (): boolean => {
    const e: Errors = {};
    if (!form.providerName.trim()) e.providerName = 'Provider name is required';
    if (!form.issueType) e.issueType = 'Please select what needs fixing';
    if (!form.correctInfo.trim()) e.correctInfo = 'Please describe the correct information';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    // Save to localStorage
    const submissions = JSON.parse(localStorage.getItem('corrections') || '[]');
    submissions.push({
      ...form,
      submittedAt: new Date().toISOString(),
    });
    localStorage.setItem('corrections', JSON.stringify(submissions));

    setStep('success');
  };

  const set = (key: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key as keyof Errors]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key as keyof Errors];
        return next;
      });
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title={step === 'form' ? 'Suggest an Edit' : undefined}>
      <AnimatePresence mode="wait">
        {step === 'form' ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <p className="text-sm text-muted -mt-1">
              Spotted something wrong? Help us keep listings accurate.
            </p>

            <Input
              label="Provider Name"
              value={form.providerName}
              onChange={(e) => set('providerName', e.target.value)}
              placeholder="e.g. Happy Tails Vet Clinic"
              error={errors.providerName}
            />

            {/* Issue type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">What needs fixing?</label>
              <select
                value={form.issueType}
                onChange={(e) => set('issueType', e.target.value)}
                className={[
                  'w-full px-3.5 py-2.5 bg-surface border rounded-2xl text-sm text-foreground appearance-none cursor-pointer',
                  'transition-all duration-200 theme-transition',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  errors.issueType ? 'border-danger' : 'border-border',
                ].join(' ')}
              >
                {ISSUE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {errors.issueType && <p className="text-xs text-danger">{errors.issueType}</p>}
            </div>

            {/* Correct info */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Correct Information</label>
              <textarea
                value={form.correctInfo}
                onChange={(e) => set('correctInfo', e.target.value)}
                placeholder="Tell us what the correct details should be"
                rows={3}
                className={[
                  'w-full px-3.5 py-2.5 bg-surface border rounded-2xl text-sm text-foreground placeholder:text-muted resize-none',
                  'transition-all duration-200 theme-transition',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  errors.correctInfo ? 'border-danger' : 'border-border',
                ].join(' ')}
              />
              {errors.correctInfo && <p className="text-xs text-danger">{errors.correctInfo}</p>}
            </div>

            <Input
              label="Your Email (optional)"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="so we can update you"
            />

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSubmit}>
                Submit
              </Button>
            </div>
          </motion.div>
        ) : (
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
              Thank you!
            </h3>
            <p className="text-sm text-muted max-w-xs mb-6">
              We'll verify your suggestion and update the listing within 48 hours.
            </p>
            <Button variant="secondary" onClick={handleClose}>
              Done
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
