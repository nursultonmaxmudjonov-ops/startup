'use client';

import { useEffect, useRef } from 'react';

/**
 * Adds .reveal-in to every .reveal element when it scrolls into view.
 * Attach to a section root; elements can be anywhere inside.
 */
export function useReveal<T extends HTMLElement>() {
  const rootRef = useRef<T | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>('.reveal'));
    if (targets.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('reveal-in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    targets.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 8, 7) * 60}ms`;
      io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  return rootRef;
}
