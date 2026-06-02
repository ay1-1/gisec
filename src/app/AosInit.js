'use client';

import { useEffect } from 'react';

export default function AosInit() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initAOS = () => {
        if (window.AOS) {
          window.AOS.init({
            duration: 800,
            once: true,
            easing: 'ease-in-out',
            offset: 100
          });
        }
      };

      if (window.AOS) {
        initAOS();
      } else {
        // Poll for AOS library loading
        const interval = setInterval(() => {
          if (window.AOS) {
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
