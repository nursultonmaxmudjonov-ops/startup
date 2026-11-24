'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DWELL, LOOKS, getThumbCropStyle, mod9, sampleTable, wrap } from '@/src/data/looks';
import RunwayGlow3D from '@/src/components/RunwayGlow3D';

interface RunwaySectionProps {
  bag: Set<string>;
  onToggleBagItem: (lookIdx: number, pieceIdx: number, thumbEl: HTMLElement | null) => void;
  onAddFullLook: (lookIdx: number, thumbEls: Array<HTMLElement | null>) => void;
  onShowToast: (msg: string) => void;
}

export default function RunwaySection({
  bag,
  onToggleBagItem,
  onAddFullLook,
  onShowToast,
}: RunwaySectionProps) {
  const runwayRef = useRef<HTMLElement | null>(null);
  const floorGlowRef = useRef<HTMLDivElement | null>(null);
  const modelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const pinsRef = useRef<HTMLDivElement | null>(null);
  const segFillRefs = useRef<Array<HTMLElement | null>>([]);
  const viewRef = useRef<HTMLDivElement | null>(null);
  const thumbRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [active, setActive] = useState(2);
  const [displayedLook, setDisplayedLook] = useState(2);
  const [cardsOut, setCardsOut] = useState<[boolean, boolean]>([false, false]);
  const [playing, setPlaying] = useState(true);
  const [pinsVisible, setPinsVisible] = useState<[boolean, boolean]>([false, false]);
  const [hoveredPin, setHoveredPin] = useState<number | null>(null);
  const [openPin, setOpenPin] = useState<number | null>(null);
  const [shownSum, setShownSum] = useState(
    LOOKS[2].pieces[0].price + LOOKS[2].pieces[1].price
  );
  const [shownBundle, setShownBundle] = useState(
    (LOOKS[2].pieces[0].price + LOOKS[2].pieces[1].price) * 0.9
  );
  const [thumbDims, setThumbDims] = useState<[number, number]>([72, 90]);
  const [fullSweepKey, setFullSweepKey] = useState(0);

  // Mutable animation state for 60fps imperative carousel updates
  const stateRef = useRef({
    active: 2,
    pos: 2,
    narrow: false,
    MH: 500,
    MW: 332,
    U: 1,
    CX: 400,
    FEET: 600,
    tween: null as { from: number; to: number; t0: number; dur: number } | null,
    pointerDown: false,
    dragging: false,
    suppressClick: false,
    dragStartX: 0,
    dragStartY: 0,
    dragStartPos: 2,
    playing: true,
    dwellElapsed: 0,
    lastTick: 0,
    lastPointer: { x: -999, y: -999, active: false },
    shownSum: LOOKS[2].pieces[0].price + LOOKS[2].pieces[1].price,
    shownBundle: (LOOKS[2].pieces[0].price + LOOKS[2].pieces[1].price) * 0.9,
  });

  const pinTimersRef = useRef<number[]>([]);
  const glowToneRef = useRef('rgba(70,78,96,.32)');
  const swapTimersRef = useRef<number[]>([]);
  const priceRafRef = useRef<number | null>(null);

  // Preload all 6 images on mount
  useEffect(() => {
    LOOKS.forEach((look) => {
      const img = new window.Image();
      img.src = look.url;
      if (img.decode) img.decode().catch(() => {});
    });
  }, []);

  const renderModels = useCallback(() => {
    // Carousel layout: every look visible side-by-side, moving continuously
    const s = stateRef.current;
    LOOKS.forEach((_, i) => {
      const el = modelRefs.current[i];
      if (!el) return;
      // shortest signed distance from pos to slot i (mod 9)
      let d = wrap(i - s.pos);
      if (d > 4.5) d -= 9;
      if (d < -4.5) d += 9;
      const ad = Math.abs(d);
      if (ad > 3) {
        el.style.display = 'none';
        return;
      }
      el.style.display = '';
      const x = s.CX + d * (s.MW * 0.62);
      const scale = 1 - Math.min(0.42, ad * 0.2);
      el.style.opacity = String(1 - Math.min(0.82, ad * 0.34));
      el.style.filter = ad < 0.02 ? 'none' : `blur(${(ad * 3).toFixed(2)}px) saturate(${(1 - ad * 0.14).toFixed(2)})`;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${(s.FEET - s.MH).toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
      el.style.zIndex = String(100 - Math.round(ad * 10));
      el.classList.toggle('c', ad < 0.5);
    });
  }, []);

  const measure = useCallback(() => {
    const runway = runwayRef.current;
    if (!runway) return;
    const rect = runway.getBoundingClientRect();
    const s = stateRef.current;
    s.narrow = window.innerWidth <= 820;
    s.MH = Math.min(rect.height * (s.narrow ? 0.66 : 0.705), rect.width * (s.narrow ? 1.05 : 0.92));
    s.MW = (s.MH * 421) / 634;
    s.U = s.MH / 634;
    s.CX = rect.width * (s.narrow ? 0.5 : 0.523);
    s.FEET = rect.height * (s.narrow ? 0.86 : 0.85);

    document.documentElement.style.setProperty('--mh', `${s.MH.toFixed(2)}px`);
    document.documentElement.style.setProperty('--mw', `${s.MW.toFixed(2)}px`);

    if (pinsRef.current) {
      pinsRef.current.style.transform = `translate3d(${s.CX.toFixed(2)}px, ${(s.FEET - s.MH).toFixed(2)}px, 0)`;
    }

    const t0 = thumbRefs.current[0];
    if (t0 && t0.clientWidth && t0.clientHeight) {
      setThumbDims([t0.clientWidth, t0.clientHeight]);
    }
    renderModels();
  }, [renderModels]);

  const hidePins = useCallback(() => {
    pinTimersRef.current.forEach(clearTimeout);
    pinTimersRef.current = [];
    setPinsVisible([false, false]);
    setHoveredPin(null);
    setOpenPin(null);
  }, []);

  const showPins = useCallback(() => {
    pinTimersRef.current.forEach(clearTimeout);
    pinTimersRef.current = [];
    pinTimersRef.current.push(
      window.setTimeout(() => setPinsVisible((p) => [true, p[1]]), 120),
      window.setTimeout(() => setPinsVisible((p) => [p[0], true]), 240)
    );
  }, []);

  const swapCards = useCallback((idx: number) => {
    swapTimersRef.current.forEach(clearTimeout);
    swapTimersRef.current = [];
    // Figure crossfades immediately — no dead pause between looks
    setDisplayedLook(idx);
    setCardsOut([true, true]);

    swapTimersRef.current.push(
      window.setTimeout(() => {
        setCardsOut(([, c1]) => [false, c1]);
      }, 260),
      window.setTimeout(() => {
        setCardsOut([false, false]);
      }, 400)
    );
  }, []);

  const animatePrices = useCallback((targetSum: number) => {
    if (priceRafRef.current) cancelAnimationFrame(priceRafRef.current);
    const s = stateRef.current;
    const startSum = s.shownSum;
    const startBundle = s.shownBundle;
    const targetBundle = targetSum * 0.9;
    const t0 = performance.now();
    const dur = 600;

    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      s.shownSum = startSum + (targetSum - startSum) * e;
      s.shownBundle = startBundle + (targetBundle - startBundle) * e;
      setShownSum(s.shownSum);
      setShownBundle(s.shownBundle);
      if (p < 1) {
        priceRafRef.current = requestAnimationFrame(step);
      } else {
        s.shownSum = targetSum;
        s.shownBundle = targetBundle;
        priceRafRef.current = null;
      }
    };
    priceRafRef.current = requestAnimationFrame(step);
  }, []);

  const go = useCallback(
    (i: number, dir?: number) => {
      const s = stateRef.current;
      const idx = mod9(i);
      const prevActive = s.active;
      let d = wrap(idx - s.pos);
      if (dir && Math.abs(Math.abs(d) - 3) < 1e-4) {
        d = dir * 3;
      }

      const fromPos = s.pos;
      const toPos = s.pos + d;
      const dur = Math.max(320, 760 + (Math.abs(d) - 1) * 140);

      s.active = idx;
      s.dwellElapsed = 0;
      setActive(idx);
      hidePins();
      viewRef.current?.classList.remove('on');

      if (idx !== prevActive) {
        swapCards(idx);
        const targetSum = LOOKS[idx].pieces[0].price + LOOKS[idx].pieces[1].price;
        animatePrices(targetSum);
      }

      if (floorGlowRef.current) {
        floorGlowRef.current.style.setProperty('--glow-tone', LOOKS[idx].tone);
      }
      glowToneRef.current = LOOKS[idx].tone;

      segFillRefs.current.forEach((fill, segIdx) => {
        if (!fill) return;
        if (segIdx < idx) fill.style.width = '100%';
        else fill.style.width = '0%';
      });

      s.tween = {
        from: fromPos,
        to: toPos,
        t0: performance.now(),
        dur,
      };
    },
    [animatePrices, hidePins, swapCards]
  );

  const togglePlay = useCallback(() => {
    setPlaying((prev) => {
      const next = !prev;
      stateRef.current.playing = next;
      return next;
    });
  }, []);

  // Main animation loop + ResizeObserver + pointer/keyboard listeners
  useEffect(() => {
    const s = stateRef.current;
    s.lastTick = performance.now();
    if (floorGlowRef.current) {
      floorGlowRef.current.style.setProperty('--glow-tone', LOOKS[s.active].tone);
    }

    segFillRefs.current.forEach((fill, segIdx) => {
      if (!fill) return;
      fill.style.width = segIdx < s.active ? '100%' : '0%';
    });

    measure();
    showPins();

    const ro = new ResizeObserver(measure);
    if (runwayRef.current) ro.observe(runwayRef.current);
    window.addEventListener('resize', measure);

    let rafId = 0;
    const frame = (now: number) => {
      const dt = Math.min(64, now - s.lastTick);
      s.lastTick = now;

      if (s.tween) {
        const p = Math.min(1, (now - s.tween.t0) / s.tween.dur);
        const e = 1 - Math.pow(1 - p, 4.2);
        s.pos = s.tween.from + (s.tween.to - s.tween.from) * e;
        renderModels();
        if (p >= 1) {
          s.pos = mod9(s.tween.to);
          s.tween = null;
          renderModels();
          showPins();
        }
      }

      if (s.playing && !s.dragging && !s.tween) {
        s.dwellElapsed += dt;
        if (s.dwellElapsed >= DWELL) {
          s.dwellElapsed = 0;
          go(s.active + 1, 1);
        } else {
          const fill = segFillRefs.current[s.active];
          if (fill) {
            fill.style.width = `${((s.dwellElapsed / DWELL) * 100).toFixed(2)}%`;
          }
        }
      }

      const viewEl = viewRef.current;
      if (viewEl) {
        if (s.lastPointer.active) {
          viewEl.style.transform = `translate3d(${s.lastPointer.x}px, ${s.lastPointer.y}px, 0)`;
        }
        if (!s.narrow && s.lastPointer.active && !s.tween && !s.dragging) {
          const under = document.elementFromPoint(s.lastPointer.x, s.lastPointer.y);
          const hit = under && under.classList?.contains('hit') ? under : null;
          const model = hit ? hit.parentElement : null;
          const showView = !!(model && !model.classList.contains('c'));
          viewEl.classList.toggle('on', showView);
        } else {
          viewEl.classList.remove('on');
        }
      }

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(s.active - 1, -1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(s.active + 1, 1);
      } else if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') {
        s.lastPointer.x = e.clientX;
        s.lastPointer.y = e.clientY;
        s.lastPointer.active = true;
      }

      if (!s.pointerDown) return;
      if (e.buttons === 0 && e.pointerType === 'mouse' && !s.dragging) {
        s.pointerDown = false;
        return;
      }

      const dx = e.clientX - s.dragStartX;
      const dy = e.clientY - s.dragStartY;

      if (!s.dragging) {
        if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
          if (e.pointerType === 'touch' && Math.abs(dy) > Math.abs(dx)) {
            s.pointerDown = false;
            return;
          }
          s.dragging = true;
          s.tween = null;
          hidePins();
        }
      }

      if (s.dragging) {
        s.pos = s.dragStartPos - dx / (170 * s.U);
        renderModels();
      }
    };

    const endDrag = () => {
      s.pointerDown = false;
      if (s.dragging) {
        s.dragging = false;
        s.suppressClick = true;
        window.setTimeout(() => {
          s.suppressClick = false;
        }, 60);
        go(Math.round(s.pos));
      }
    };

    const onMouseLeave = () => {
      s.lastPointer.active = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
      document.removeEventListener('mouseleave', onMouseLeave);
      pinTimersRef.current.forEach(clearTimeout);
      swapTimersRef.current.forEach(clearTimeout);
      if (priceRafRef.current) cancelAnimationFrame(priceRafRef.current);
    };
  }, [go, hidePins, measure, renderModels, showPins, togglePlay]);

  const handleRunwayPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const target = e.target as HTMLElement;
    if (target.closest('#ctrl, .pin')) return;
    const s = stateRef.current;
    s.pointerDown = true;
    s.dragStartX = e.clientX;
    s.dragStartY = e.clientY;
    s.dragStartPos = s.pos;
  };

  const lookForCards = LOOKS[displayedLook];
  const lookForPins = LOOKS[active];
  const bothActiveInBag = bag.has(`${active}-0`) && bag.has(`${active}-1`);

  return (
    <>
      <div id="stage">
        <section
          id="runway"
          ref={runwayRef}
          aria-label="VANTEGE WEAR Shell runway"
          onPointerDown={handleRunwayPointerDown}
          onClick={() => setOpenPin(null)}
        >
          <div id="floorGlow" ref={floorGlowRef} />
          <RunwayGlow3D toneRef={glowToneRef} />

          <header id="title">
            <h1>VANTEGE WEAR Shell</h1>
            <p>Nine looks, styled head to toe. Tap a pin to see the piece.</p>
          </header>

          <div id="models">
            {LOOKS.map((look, i) => (
              <div
                key={look.name}
                ref={(el) => {
                  modelRefs.current[i] = el;
                }}
                className="model"
                data-i={i}
              >
                <div
                  className="fig fig-on"
                  style={{ backgroundImage: `url("${look.url}")` }}
                />
                <div
                  className="hit"
                  data-i={i}
                  onClick={(e) => {
                    if (stateRef.current.suppressClick) {
                      e.stopPropagation();
                      return;
                    }
                    if (i !== stateRef.current.active) {
                      go(i);
                    }
                  }}
                />
              </div>
            ))}
          </div>

          <div id="pins" ref={pinsRef}>
            {lookForPins.pieces.map((piece, k) => (
              <button
                key={`${active}-${k}`}
                type="button"
                className={`pin${pinsVisible[k] ? ' on' : ''}${hoveredPin === k ? ' hover' : ''}${openPin === k ? ' open' : ''}`}
                style={{ left: `${piece.pin[0] * 100}%`, top: `${piece.pin[1] * 100}%` }}
                aria-label={`${piece.name}, $${piece.price.toFixed(2)}`}
                onPointerEnter={(e) => {
                  if (e.pointerType === 'touch') return;
                  setHoveredPin(k);
                }}
                onPointerLeave={() => setHoveredPin(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenPin((prev) => (prev === k ? null : k));
                }}
              >
                <span className="pin-core" />
                <div className="tip">
                  <strong>{piece.name}</strong>
                  <span>${piece.price.toFixed(2)}</span>
                </div>
              </button>
            ))}
          </div>

          <div id="ctrl">
            <button
              className="arr-btn"
              id="prev"
              type="button"
              onClick={() => go(stateRef.current.active - 1, -1)}
              aria-label="Previous look"
            >
              <svg
                width="22"
                height="14"
                viewBox="0 0 22 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="20" y1="7" x2="2" y2="7" />
                <polyline points="7.5,1.5 2,7 7.5,12.5" />
              </svg>
            </button>

            <div id="timeline" role="tablist" aria-label="Looks timeline">
              {LOOKS.map((look, i) => (
                <button
                  key={look.name}
                  type="button"
                  className={`seg${active === i ? ' on' : ''}`}
                  role="tab"
                  aria-selected={active === i}
                  aria-label={`Look ${i + 1}: ${look.name}`}
                  onClick={() => go(i)}
                >
                  <div className="seg-bar">
                    <i
                      ref={(el) => {
                        segFillRefs.current[i] = el;
                      }}
                    />
                  </div>
                  <div className="seg-lbl">
                    <span className="seg-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="seg-name">{look.name}</span>
                  </div>
                </button>
              ))}
            </div>

            <button
              id="play"
              type="button"
              onClick={togglePlay}
              aria-label={playing ? 'Pause autoplay' : 'Play autoplay'}
            >
              {playing ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <rect x="3" y="2.5" width="2.4" height="9" rx=".6" />
                  <rect x="8.6" y="2.5" width="2.4" height="9" rx=".6" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <polygon points="4,2.2 11.8,7 4,11.8" />
                </svg>
              )}
            </button>

            <button
              className="arr-btn"
              id="next"
              type="button"
              onClick={() => go(stateRef.current.active + 1, 1)}
              aria-label="Next look"
            >
              <svg
                width="22"
                height="14"
                viewBox="0 0 22 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="2" y1="7" x2="20" y2="7" />
                <polyline points="14.5,1.5 20,7 14.5,12.5" />
              </svg>
            </button>
          </div>
        </section>

        <aside id="side" aria-label="In this look">
          <div className="side-head">
            <h2>
              In this <span>look</span>
            </h2>
            <span className="side-count">2 PIECES</span>
          </div>

          <div id="cards">
            {lookForCards.pieces.map((piece, k) => {
              const inBag = bag.has(`${displayedLook}-${k}`);
              return (
                <article
                  key={k}
                  className={`card${cardsOut[k] ? ' out' : ''}${hoveredPin === k ? ' hl' : ''}`}
                  data-k={k}
                  onPointerEnter={() => setHoveredPin(k)}
                  onPointerLeave={() => setHoveredPin(null)}
                >
                  <div
                    ref={(el) => {
                      thumbRefs.current[k] = el;
                    }}
                    className="thumb"
                    style={getThumbCropStyle(
                      lookForCards.url,
                      piece.crop,
                      thumbDims[0],
                      thumbDims[1]
                    )}
                  />
                  <div className="pinfo">
                    <div className="pname">{piece.name}</div>
                    <div className="pprice">${piece.price.toFixed(2)}</div>
                  </div>
                  <span className="pidx">{k + 1}</span>
                  <button
                    className={`add-btn${inBag ? ' in' : ''}`}
                    type="button"
                    aria-label={
                      inBag
                        ? `Remove ${piece.name} from bag`
                        : `Add ${piece.name} to bag`
                    }
                    onClick={() =>
                      onToggleBagItem(displayedLook, k, thumbRefs.current[k])
                    }
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    >
                      <line x1="7" y1="2.5" x2="7" y2="11.5" />
                      <line x1="2.5" y1="7" x2="11.5" y2="7" />
                    </svg>
                  </button>
                  <div className="skel" aria-hidden="true">
                    <div className="skel-thumb" />
                    <div className="skel-lines">
                      <div className="skel-l1" />
                      <div className="skel-l2" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="bundle">
            <div className="bundle-row">
              <div>
                <div className="bundle-title">Complete the look</div>
                <div className="bundle-sub">Bundle all 2 and save 10%</div>
              </div>
              <div className="bundle-prices">
                <div id="sumPrice">${shownSum.toFixed(2)}</div>
                <div id="bundlePrice">${shownBundle.toFixed(2)}</div>
              </div>
            </div>
            <button
              id="fullBtn"
              className="primary-cta"
              type="button"
              onClick={() => {
                setFullSweepKey((k) => k + 1);
                const missing = [0, 1].filter((k) => !bag.has(`${active}-${k}`));
                if (missing.length === 0) {
                  onShowToast('Full look already in your bag');
                  return;
                }
                onAddFullLook(active, thumbRefs.current);
              }}
            >
              <span key={fullSweepKey} className={`sweep${fullSweepKey > 0 ? ' go' : ''}`} />
              <span className="btn-txt">
                {bothActiveInBag ? 'FULL LOOK IN BAG' : 'ADD FULL LOOK TO BAG'}
              </span>
              <svg
                width="20"
                height="12"
                viewBox="0 0 20 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="1" y1="6" x2="18" y2="6" />
                <polyline points="13.5,1.5 18,6 13.5,10.5" />
              </svg>
            </button>
          </div>
        </aside>
      </div>

      <div id="view" ref={viewRef} aria-hidden="true">
        <div className="view-in">VIEW</div>
      </div>
    </>
  );
}
