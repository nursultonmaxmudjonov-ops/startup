'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * HandCameraControl
 * -----------------
 * Camera-based hand tracking (MediaPipe Hands via CDN, no install).
 * Gestures:
 *   • Open palm + hand UP / DOWN  → scroll the page
 *   • Pinch (thumb+index touch)   → "click" the element under the cursor dot
 *   • Fist (all fingers folded)   → gesture control paused (dead-man switch)
 * Shows a small floating preview with the tracked hand + cursor overlay.
 */

type Props = { onShowToast?: (msg: string) => void };

const MP_BASE =
  'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915';
const CAM_BASE =
  'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1640029074';

declare global {
  interface Window {
    Hands?: new (cfg: { locateFile: (f: string) => string }) => {
      setOptions: (o: Record<string, unknown>) => void;
      onResults: (cb: (r: unknown) => void) => void;
      initialize?: () => Promise<void>;
      send: (i: { image: HTMLVideoElement }) => Promise<void>;
      close?: () => void;
    };
    Camera?: new (el: HTMLVideoElement, cfg: {
      onFrame: () => Promise<void>;
      width: number;
      height: number;
    }) => { start: () => Promise<void>; stop?: () => void };
  }
}

function loadScript(src: string) {
  return new Promise<void>((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    const s = document.createElement('script');
    s.src = src;
    s.crossOrigin = 'anonymous';
    s.onload = () => res();
    s.onerror = () => rej(new Error(`load ${src}`));
    document.head.appendChild(s);
  });
}

interface Landmark { x: number; y: number; z: number }

export default function HandCameraControl({ onShowToast }: Props) {
  const [on, setOn] = useState(false);
  const [starting, setStarting] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const stopRef = useRef(false);
  const stateRef = useRef({
    lastY: 0,
    lastT: 0,
    smoothX: -1,
    smoothY: -1,
    pinchWas: false,
    downAt: 0,
    scrollVel: 0,
    hadHand: false,
    wasFist: false,
  });
  const toastRef = useRef(onShowToast);
  toastRef.current = onShowToast;

  const stop = useCallback(() => {
    stopRef.current = true;
    setOn(false);
  }, []);

  useEffect(() => {
    if (!on) return;
    stopRef.current = false;
    let stream: MediaStream | null = null;
    let cam: { stop?: () => void } | null = null;
    let raf = 0;

    const cursor = cursorRef.current!;
    const stage = canvasRef.current!;

    // Smooth inertia scroll — runs every frame, decays to 0 when hand stops.
    // Scrolls whatever container is under the mid-screen point (works on
    // pages whose scroll lives in an inner overflow container, not <main>).
    let rafScroll = 0;
    const scrollTarget = (): HTMLElement | Window => {
      const main = document.querySelector('main');
      if (main) {
        let el: HTMLElement | null = main;
        while (el) {
          const oy = getComputedStyle(el).overflowY;
          if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 4) {
            return el;
          }
          el = el.parentElement;
        }
      }
      return window;
    };
    const scrollLoop = () => {
      const s = stateRef.current;
      if (Math.abs(s.scrollVel) > 0.5) {
        const t = scrollTarget();
        if (t === window) {
          window.scrollBy({ top: s.scrollVel, behavior: 'auto' });
        } else {
          t.scrollBy({ top: s.scrollVel, behavior: 'auto' });
        }
        s.scrollVel *= 0.85; // friction
      } else {
        s.scrollVel = 0;
      }
      if (!stopRef.current) rafScroll = requestAnimationFrame(scrollLoop);
    };
    rafScroll = requestAnimationFrame(scrollLoop);

    const draw = (lm: Landmark[] | null) => {
      const ctx = stage.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, stage.width, stage.height);
      if (!lm) return;
      const conn: Array<[number, number]> = [
        [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12],
        [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
      ];
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      conn.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(lm[a].x * stage.width, lm[a].y * stage.height);
        ctx.lineTo(lm[b].x * stage.width, lm[b].y * stage.height);
        ctx.stroke();
      });
      ctx.fillStyle = '#4f7dff';
      lm.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x * stage.width, p.y * stage.height, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    (async () => {
      try {
        setStarting(true);
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
        });
        if (stopRef.current) return;
        const v = videoRef.current!;
        v.srcObject = stream;
        await v.play();

        await loadScript(`${MP_BASE}/hands.js`);
        await loadScript(`${CAM_BASE}/camera_utils.js`);
        if (stopRef.current || !window.Hands || !window.Camera) {
          toastRef.current?.('Hand tracking failed to load');
          setOn(false);
          return;
        }

        const hands = new window.Hands({
          locateFile: (f: string) => `${MP_BASE}/${f}`,
        });
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((raw: unknown) => {
          const r = raw as { multiHandLandmarks?: Landmark[][] };
          const lm = r.multiHandLandmarks?.[0];
          draw(lm);
          const s = stateRef.current;
          const now = performance.now();

          if (!lm) {
            cursor.style.opacity = '0.15';
            s.pinchWas = false;
            s.hadHand = false;
            s.scrollVel = 0;
            return;
          }

          // Palm slipped out of the neutral band? keep flowing — position-based
          // logic below handles it; no need to reset lastY here.

          // Cursor = index-finger tip (8), smoothed
          const tx = (1 - lm[8].x) * window.innerWidth; // mirrored
          const ty = lm[8].y * window.innerHeight;
          s.smoothX = s.smoothX < 0 ? tx : s.smoothX + (tx - s.smoothX) * 0.35;
          s.smoothY = s.smoothY < 0 ? ty : s.smoothY + (ty - s.smoothY) * 0.35;
          cursor.style.opacity = '1';
          cursor.style.transform = `translate3d(${s.smoothX.toFixed(1)}px, ${s.smoothY.toFixed(1)}px, 0)`;

          // Pinch = thumb tip (4) close to index tip (8)
          const dx = lm[4].x - lm[8].x;
          const dy = lm[4].y - lm[8].y;
          const pinch = Math.hypot(dx, dy) < 0.055;

          // Count extended fingers for the fist check
          const extended = ([8, 12, 16, 20] as const).filter(
            (tip, i) => lm[tip].y < lm[([4, 8, 12, 16] as const)[i]].y - 0.04
          ).length;
          const fist = extended === 0 && !pinch;

          if (fist) {
            cursor.style.opacity = '0.15';
            s.pinchWas = false;
            s.scrollVel = 0;
            s.wasFist = true;
            return;
          }
          // Just opened from a fist — re-anchor palm position so the
          // hand doesn't cause a jump-scroll on reopen
          if (s.wasFist || !s.hadHand) {
            s.lastY = (lm[0].y + lm[9].y) / 2;
            s.lastT = 0;
            s.wasFist = false;
            s.hadHand = true;
          }

          if (pinch && !s.pinchWas) {
            s.pinchWas = true;
            const el = document.elementFromPoint(s.smoothX, s.smoothY);
            const clickable = el?.closest(
              'button, a, [role="tab"], [role="button"], input[type="range"], label[for]'
            ) as HTMLElement | null;
            if (clickable) {
              clickable.dispatchEvent(
                new MouseEvent('click', { bubbles: true, clientX: s.smoothX, clientY: s.smoothY })
              );
              cursor.classList.add('pinch');
              window.setTimeout(() => cursor.classList.remove('pinch'), 260);
            }
          } else if (!pinch) {
            s.pinchWas = false;
          }

          // Open palm vertical POSITION → continuous scroll.
          // Hand below screen center → page flows down, above → flows up.
          // Speed grows with distance from the center (no dead stop needed).
          const palmY = (lm[0].y + lm[9].y) / 2;
          if (!pinch && extended >= 2) {
            const dY = palmY - s.lastY; // + = hand moved down
            const DEAD = 0.008;         // dead zone — ignore micro-jitter
            if (Math.abs(dY) > DEAD) {
              s.scrollVel += Math.sign(dY) * Math.min(Math.abs(dY) * 680, 110);
              s.scrollVel = Math.max(-70, Math.min(70, s.scrollVel));
            }
            // Position-based drive: palm below center → scroll down, above → up.
            // The further from center, the faster the flow.
            const CENTER = 0.5;
            const off = palmY - CENTER; // + = palm below center
            const ZONE = 0.1;           // neutral band around center
            if (Math.abs(off) > ZONE) {
              const speed = Math.min(Math.abs(off) - ZONE, 0.35) * 260;
              s.scrollVel = s.scrollVel * 0.6 + Math.sign(off) * speed * 0.4;
            }
          }
          s.lastY = palmY;
          s.lastT = now;
        });

        const camera = new window.Camera(v, {
          onFrame: async () => {
            if (!stopRef.current) await hands.send({ image: v });
          },
          width: 320,
          height: 240,
        });
        cam = camera;
        await camera.start();
        toastRef.current?.('Hand control ON — palm low: scroll down · palm high: scroll up · pinch: click · fist: pause');
      } catch (e) {
        toastRef.current?.(
          e instanceof DOMException && e.name === 'NotAllowedError'
            ? 'Camera permission denied'
            : 'Camera unavailable'
        );
        setOn(false);
      } finally {
        setStarting(false);
      }
    })();

    const loop = () => {
      if (!stopRef.current) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      stopRef.current = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(rafScroll);
      cam?.stop?.();
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [on]);

  return (
    <>
      <button
        type="button"
        id="handCtl"
        className={`hand-ctl${on ? ' on' : ''}`}
        aria-pressed={on}
        aria-label="Hand camera control"
        onClick={() => (on ? stop() : setOn(true))}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 8V3.2a1.2 1.2 0 0 1 2.4 0V7" />
          <path d="M7.4 7V2.4a1.2 1.2 0 0 1 2.4 0V7" />
          <path d="M9.8 7V3.2a1.2 1.2 0 0 1 2.4 0V8.6" />
          <path d="M12.2 8.6c0 3.2-1.9 5.6-4.6 5.6-2.4 0-3.6-1.4-4.9-3.9L1.8 8.7c-.5-.9.6-1.9 1.5-1.2L5 8.6" />
        </svg>
        <span>{starting ? '…' : on ? 'HAND ON' : 'HAND'}</span>
      </button>

      {on && (
        <div className="hand-panel" role="region" aria-label="Hand tracking preview">
          <video ref={videoRef} width={160} height={120} muted playsInline className="hand-video" />
          <canvas ref={canvasRef} width={160} height={120} className="hand-canvas" />
          <div className="hand-help">
            palm low ↓ — scroll down
            <br />
            palm high ↑ — scroll up
            <br />
            pinch — click · fist — pause
          </div>
        </div>
      )}

      <div ref={cursorRef} className="hand-cursor" aria-hidden="true">
        <span />
      </div>
    </>
  );
}
