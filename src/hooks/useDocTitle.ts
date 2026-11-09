import { useEffect } from 'react';

export function useDocTitle(title: string) {
  useEffect(() => {
    const base = 'Practo for Animals';
    document.title = title ? `${title} — ${base}` : base;
    return () => {
      document.title = base;
    };
  }, [title]);
}
