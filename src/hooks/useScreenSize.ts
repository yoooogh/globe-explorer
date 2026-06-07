import { useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { RESIZE_DEBOUNCE_MS } from '../utils/constants';
import type { Breakpoint } from '../types/ui';

function getBreakpoint(): Breakpoint {
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

export function useScreenSize() {
  const setBreakpoint = useUIStore((s) => s.setBreakpoint);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setBreakpoint(getBreakpoint());
      }, RESIZE_DEBOUNCE_MS);
    };

    window.addEventListener('resize', handleResize);
    // Set initial value
    setBreakpoint(getBreakpoint());

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [setBreakpoint]);
}
