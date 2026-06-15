'use client';

import { useEffect } from 'react';

export default function AosInit() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as any;
      const initAOS = () => {
        if (win.AOS) {
          win.AOS.init({
            duration: 800,
            once: true,
            easing: 'ease-in-out',
            offset: 100
          });
        }
      };

      if (win.AOS) {
        initAOS();
      } else {
        // Poll for AOS library loading
        const interval = setInterval(() => {
          if (win.AOS) {
            initAOS();
            clearInterval(interval);
          }
        }, 100);
        return () => clearInterval(interval);
      }
    }
  }, []);

  return null;
}
