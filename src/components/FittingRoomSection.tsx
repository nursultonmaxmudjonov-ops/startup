'use client';

import React, { useEffect, useRef, useState } from 'react';
import maleBaseImg from '@/src/assets/images/base_person_male_1794660127364.jpg';
import femaleBaseImg from '@/src/assets/images/base_person_female_1794660128319.jpg';
import { LOOKS, getThumbCropStyle, TOP_FIT_DEFAULT, BOT_FIT_DEFAULT, lookFit, type GarmentFit } from '@/src/data/looks';

interface FittingRoomSectionProps {
  bag: Set<string>;
  onToggleBagItem: (lookIdx: number, pieceIdx: number, thumbEl: HTMLElement | null) => void;
  onAddOutfitToBag: (
    picks: Array<[number, number]>,
    thumbEls: Array<HTMLElement | null>
  ) => void;
  onShowToast: (msg: string) => void;
}

const SLOT_TABS = [
  { id: 'top', label: 'OUTERWEAR' },
  { id: 'bot', label: 'TROUSERS' },
] as const;

type SlotId = (typeof SLOT_TABS)[number]['id'];

export default function FittingRoomSection({
  bag,
  onToggleBagItem,
  onAddOutfitToBag,
  onShowToast,
}: FittingRoomSectionProps) {
  const [personMode, setPersonMode] = useState<'male' | 'female'>('male');
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [photoScale, setPhotoScale] = useState(1);
  const [photoY, setPhotoY] = useState(0);

  const [wornTop, setWornTop] = useState<number | null>(null);
  const [wornBot, setWornBot] = useState<number | null>(null);
  const [topFit, setTopFit] = useState<GarmentFit>(TOP_FIT_DEFAULT);
  const [botFit, setBotFit] = useState<GarmentFit>(BOT_FIT_DEFAULT);
  const [topPopKey, setTopPopKey] = useState(0);
  const [botPopKey, setBotPopKey] = useState(0);
  const [fitSweepKey, setFitSweepKey] = useState(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [pickerSlot, setPickerSlot] = useState<SlotId>('top');
  const garmentThumbRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Shared thumb refs — used by the bag flyer even when catalog lives on another page
  const catThumbRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    window.__catThumbRefs = catThumbRefs;
    return () => {
      delete window.__catThumbRefs;
    };
  }, []);

  useEffect(() => {
    // keep both ref maps in sync so bag flyer works from either grid
    Object.assign(catThumbRefs.current, garmentThumbRefs.current);
  });

  const tryOnPiece = (lookIdx: number, pieceIdx: number) => {
    const piece = LOOKS[lookIdx].pieces[pieceIdx];
    const fit = lookFit(lookIdx, pieceIdx === 0 ? 'top' : 'bot');
    if (pieceIdx === 0) {
      if (wornTop === lookIdx) {
        setWornTop(null);
        onShowToast(`Removed ${piece.name}`);
      } else {
        setWornTop(lookIdx);
        setTopFit(fit);
        setTopPopKey((k) => k + 1);
        onShowToast(`Put on ${piece.name}`);
      }
    } else {
      if (wornBot === lookIdx) {
        setWornBot(null);
        onShowToast(`Removed ${piece.name}`);
      } else {
        setWornBot(lookIdx);
        setBotFit(fit);
        setBotPopKey((k) => k + 1);
        onShowToast(`Put on ${piece.name}`);
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setCustomPhoto(ev.target.result);
        onShowToast('Photo loaded — tap garments to try them on');
      }
    };
    reader.readAsDataURL(file);
  };

  const activeInfo =
    wornTop !== null
      ? { piece: LOOKS[wornTop].pieces[0], layer: 'top' as const }
      : wornBot !== null
        ? { piece: LOOKS[wornBot].pieces[1], layer: 'bot' as const }
        : null;

  const fitGlowTone =
    wornTop !== null
      ? LOOKS[wornTop].tone
      : wornBot !== null
        ? LOOKS[wornBot].tone
        : 'rgba(70,78,96,.28)';

  let equippedTotal = 0;
  if (wornTop !== null) equippedTotal += LOOKS[wornTop].pieces[0].price;
  if (wornBot !== null) equippedTotal += LOOKS[wornBot].pieces[1].price;
  const bothWorn = wornTop !== null && wornBot !== null;
  const fitCtaLabel =
    wornTop === null && wornBot === null
      ? 'SELECT GARMENTS TO WEAR'
      : bothWorn
        ? `ADD OUTFIT TO BAG · $${(equippedTotal * 0.9).toFixed(2)} (-10%)`
        : `ADD PIECE TO BAG · $${equippedTotal.toFixed(2)}`;

  const topCrop = wornTop !== null ? LOOKS[wornTop].pieces[0].crop : [260, 1080];
  const botCrop = wornBot !== null ? LOOKS[wornBot].pieces[1].crop : [1020, 2010];
  const botYStart = Math.min(botCrop[0], 1030);

  return (
    <div id="studio-section">
      <div id="fitting" style={{ '--fit-glow': fitGlowTone } as React.CSSProperties}>
        <div className="fit-top">
          <div>
            <h2>
              Fitting <span>Room</span>
            </h2>
            <p>Click any garment to dress the model.</p>
          </div>
          <div className="person-switch" role="group" aria-label="Base person">
            <button
              className={`ps-btn${!customPhoto && personMode === 'male' ? ' on' : ''}`}
              type="button"
              onClick={() => {
                setCustomPhoto(null);
                setPersonMode('male');
              }}
            >
              Person 01
            </button>
            <button
              className={`ps-btn${!customPhoto && personMode === 'female' ? ' on' : ''}`}
              type="button"
              onClick={() => {
                setCustomPhoto(null);
                setPersonMode('female');
              }}
            >
              Person 02
            </button>
            <label
              className={`ps-btn${customPhoto ? ' on' : ''}`}
              htmlFor="photoUpload"
              style={{ cursor: 'pointer' }}
            >
              Your Photo
            </label>
            <input
              ref={fileInputRef}
              id="photoUpload"
              type="file"
              accept="image/*"
              hidden
              onChange={handlePhotoUpload}
            />
          </div>
        </div>

        {customPhoto && (
          <div className="photo-controls">
            <span>Scale</span>
            <input
              type="range"
              min="0.6"
              max="1.6"
              step="0.02"
              value={photoScale}
              onChange={(e) => setPhotoScale(Number(e.target.value))}
            />
            <span>Y</span>
            <input
              type="range"
              min="-220"
              max="220"
              step="4"
              value={photoY}
              onChange={(e) => setPhotoY(Number(e.target.value))}
            />
            <button
              type="button"
              style={{ color: '#fff', marginLeft: 'auto' }}
              onClick={() => {
                setCustomPhoto(null);
                setPhotoScale(1);
                setPhotoY(0);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              Reset Photo
            </button>
          </div>
        )}

        <div className="fit-stage">
          <div id="avatarBox">
            <svg id="fitSvg" viewBox="0 0 1360 2048" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="headSoftBlur" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="11" />
                </filter>

                <filter id="garmentSoftEdge" x="-8%" y="-8%" width="116%" height="116%">
                  <feGaussianBlur stdDeviation="2.2" />
                </filter>

                <linearGradient id="botFade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#000" />
                  <stop offset="100%" stopColor="#fff" />
                </linearGradient>

                <radialGradient id="studioEdgeGrad" cx="0.5" cy="0.52" r="0.52">
                  <stop offset="68%" stopColor="#fff" />
                  <stop offset="96%" stopColor="#000" />
                </radialGradient>

                <linearGradient id="studioVertFade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#000" />
                  <stop offset="5%" stopColor="#fff" />
                  <stop offset="94%" stopColor="#fff" />
                  <stop offset="100%" stopColor="#000" />
                </linearGradient>

                <mask id="studioBlendMask">
                  <rect x="0" y="0" width="1360" height="2048" fill="url(#studioEdgeGrad)" />
                  <rect
                    x="0"
                    y="0"
                    width="1360"
                    height="2048"
                    fill="url(#studioVertFade)"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                </mask>

                <mask id="topGarmentMask">
                  <rect
                    x="0"
                    y={topCrop[0]}
                    width="1360"
                    height={topCrop[1] - topCrop[0] + 45}
                    fill={wornBot !== null ? 'url(#topBottomFade)' : '#fff'}
                  />
                  <g filter="url(#headSoftBlur)">
                    <ellipse cx="680" cy="195" rx="90" ry="135" fill="#000" />
                    <rect x="594" y="0" width="172" height="215" fill="#000" />
                  </g>
                </mask>

                <linearGradient
                  id="topBottomFade"
                  gradientUnits="userSpaceOnUse"
                  x1="0"
                  y1={topCrop[0]}
                  x2="0"
                  y2={topCrop[1] + 45}
                >
                  <stop offset="0" stopColor="#fff" />
                  <stop offset="0.78" stopColor="#fff" />
                  <stop offset="1" stopColor="#000" />
                </linearGradient>

                <mask id="botGarmentMask">
                  <rect
                    x="0"
                    y={botYStart}
                    width="1360"
                    height={2048 - botYStart}
                    fill="#fff"
                  />
                  <rect x="0" y={botYStart} width="1360" height="36" fill="url(#botFade)" />
                </mask>

                <clipPath id="userPhotoClip">
                  <rect x="140" y="40" width="1080" height="1968" rx="28" />
                </clipPath>
              </defs>

              {/* Base Photorealistic Person or Uploaded Photo */}
              {customPhoto ? (
                <g clipPath="url(#userPhotoClip)">
                  <image
                    href={customPhoto}
                    x="0"
                    y="0"
                    width="1360"
                    height="2048"
                    preserveAspectRatio="xMidYMid slice"
                    transform={`translate(680 1024) scale(${photoScale}) translate(-680 ${-1024 + photoY})`}
                  />
                </g>
              ) : (
                <g mask="url(#studioBlendMask)">
                  <image
                    href={personMode === 'male' ? maleBaseImg.src : femaleBaseImg.src}
                    x="0"
                    y="0"
                    width="1360"
                    height="2048"
                    preserveAspectRatio="xMidYMid slice"
                    transform={
                      personMode === 'male'
                        ? 'translate(680 1030) scale(1.075) translate(-680 -1058)'
                        : 'translate(680 1030) scale(1.085) translate(-680 -1064)'
                    }
                  />
                </g>
              )}

              {/* Worn Trousers Layer */}
              {wornBot !== null && (
                <g
                  key={`bot-${wornBot}-${botPopKey}`}
                  className="garment-layer pop"
                  mask="url(#botGarmentMask)"
                  filter="url(#garmentSoftEdge)"
                  style={{ cursor: 'pointer' }}
                  onClick={() => tryOnPiece(wornBot, 1)}
                >
                  <image
                    href={LOOKS[wornBot].url}
                    x="0"
                    y="0"
                    width="1360"
                    height="2048"
                    preserveAspectRatio="xMidYMid meet"
                    transform={`translate(${680 + (botFit.x ?? 0)} ${1024 + (botFit.y ?? 0)}) scale(${botFit.scale ?? 1}) translate(-680 -1024)`}
                  />
                </g>
              )}

              {/* Worn Outerwear Layer */}
              {wornTop !== null && (
                <g
                  key={`top-${wornTop}-${topPopKey}`}
                  className="garment-layer pop"
                  mask="url(#topGarmentMask)"
                  filter="url(#garmentSoftEdge)"
                  style={{ cursor: 'pointer' }}
                  onClick={() => tryOnPiece(wornTop, 0)}
                >
                  <image
                    href={LOOKS[wornTop].url}
                    x="0"
                    y="0"
                    width="1360"
                    height="2048"
                    preserveAspectRatio="xMidYMid meet"
                    transform={`translate(${680 + (topFit.x ?? 0)} ${1024 + (topFit.y ?? 0)}) scale(${topFit.scale ?? 1}) translate(-680 -1024)`}
                  />
                </g>
              )}
            </svg>
          </div>
        </div>

        <div className="fit-bottom">
          <div className="slots-grid">
            {activeInfo && (
              <div className="slot-pill info filled" style={{ gridColumn: '1 / -1' }}>
                <div className="slot-meta">
                  <div className="slot-lbl">{activeInfo.piece.name.toUpperCase()}</div>
                  <div className="slot-val">{activeInfo.piece.colorway} · {activeInfo.piece.material}</div>
                  <div className="slot-desc">{activeInfo.piece.desc}</div>
                  <div className="cat-tags">
                    <span className="cat-tag">FW ’26</span>
                    <span className="cat-tag">IN FITTING</span>
                    <span className="cat-tag">{activeInfo.layer === 'top' ? 'OUTERWEAR' : 'TROUSERS'}</span>
                  </div>
                </div>
                <div className="slot-price">${activeInfo.piece.price}</div>
              </div>
            )}
            <div className={`slot-pill${wornTop !== null ? ' filled' : ''}`}>
              <div className="slot-meta">
                <div className="slot-lbl">OUTERWEAR</div>
                <div className="slot-val">
                  {wornTop !== null
                    ? `${LOOKS[wornTop].pieces[0].name} · $${LOOKS[wornTop].pieces[0].price}`
                    : 'Everyday Tee (None)'}
                </div>
              </div>
              {wornTop !== null && (
                <button
                  className="slot-rm"
                  type="button"
                  aria-label="Remove outerwear"
                  onClick={() => {
                    const n = LOOKS[wornTop].pieces[0].name;
                    setWornTop(null);
                    onShowToast(`Removed ${n}`);
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <line x1="2.5" y1="2.5" x2="9.5" y2="9.5" />
                    <line x1="9.5" y1="2.5" x2="2.5" y2="9.5" />
                  </svg>
                </button>
              )}
            </div>

            <div className={`slot-pill${wornBot !== null ? ' filled' : ''}`}>
              <div className="slot-meta">
                <div className="slot-lbl">TROUSERS</div>
                <div className="slot-val">
                  {wornBot !== null
                    ? `${LOOKS[wornBot].pieces[1].name} · $${LOOKS[wornBot].pieces[1].price}`
                    : 'Everyday Shorts (None)'}
                </div>
              </div>
              {wornBot !== null && (
                <button
                  className="slot-rm"
                  type="button"
                  aria-label="Remove trousers"
                  onClick={() => {
                    const n = LOOKS[wornBot].pieces[1].name;
                    setWornBot(null);
                    onShowToast(`Removed ${n}`);
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <line x1="2.5" y1="2.5" x2="9.5" y2="9.5" />
                    <line x1="9.5" y1="2.5" x2="2.5" y2="9.5" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="fit-actions">
            <button
              className="ghost-btn"
              type="button"
              onClick={() => {
                const t = Math.floor(Math.random() * LOOKS.length);
                const b = Math.floor(Math.random() * LOOKS.length);
                setWornTop(t);
                setWornBot(b);
                setTopFit(lookFit(t, 'top'));
                setBotFit(lookFit(b, 'bot'));
                setTopPopKey((k) => k + 1);
                setBotPopKey((k) => k + 1);
                onShowToast(
                  `Styled: ${LOOKS[t].pieces[0].name} + ${LOOKS[b].pieces[1].name}`
                );
              }}
            >
              Mix Look
            </button>
            <button
              className="ghost-btn"
              type="button"
              onClick={() => {
                if (wornTop === null && wornBot === null) return;
                setWornTop(null);
                setWornBot(null);
                onShowToast('Model reset to everyday base');
              }}
            >
              Undress
            </button>
            <button
              className="primary-cta"
              id="fitAddBtn"
              type="button"
              onClick={() => {
                setFitSweepKey((k) => k + 1);
                const picks: Array<[number, number]> = [];
                const thumbs: Array<HTMLElement | null> = [];
                if (wornTop !== null) {
                  picks.push([wornTop, 0]);
                  thumbs.push(catThumbRefs.current[`${wornTop}-0`] || null);
                }
                if (wornBot !== null) {
                  picks.push([wornBot, 1]);
                  thumbs.push(catThumbRefs.current[`${wornBot}-1`] || null);
                }
                if (picks.length === 0) {
                  onShowToast('Click any clothing card first');
                  return;
                }
                onAddOutfitToBag(picks, thumbs);
              }}
            >
              <span key={fitSweepKey} className={`sweep${fitSweepKey > 0 ? ' go' : ''}`} />
              <span className="btn-txt">{fitCtaLabel}</span>
            </button>
          </div>
        </div>
    </div>

      <aside className="fit-wardrobe" aria-label="Wardrobe">
        <div className="fw-head">
          <div>
            <h2>
              Wardrobe <span>Picker</span>
            </h2>
            <p className="cat-sub">
              {LOOKS.length * 2} garments across {LOOKS.length} looks — tap to try on the model.
            </p>
          </div>
          <span className="side-count">{LOOKS.length * 2} PCS</span>
        </div>
        <div className="fp-tabs" role="tablist" aria-label="Garment slot">
          {SLOT_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={pickerSlot === t.id}
              className={`fp-tab${pickerSlot === t.id ? ' on' : ''}`}
              onClick={() => setPickerSlot(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="fp-grid">
          {LOOKS.map((look, li) => {
            const pi: 0 | 1 = pickerSlot === 'top' ? 0 : 1;
            const piece = look.pieces[pi];
            const worn = (pickerSlot === 'top' ? wornTop : wornBot) === li;
            const key = `${li}-${pi}`;
            return (
              <button
                key={key}
                type="button"
                className={`fp-card${worn ? ' worn' : ''}`}
                onClick={() => tryOnPiece(li, pi)}
                aria-pressed={worn}
              >
                <div
                  ref={(el) => {
                    garmentThumbRefs.current[key] = el;
                  }}
                  className="fp-thumb"
                  style={getThumbCropStyle(look.url, piece.crop, 88, 110)}
                />
                <span className="fp-name">{piece.name}</span>
                <span className="fp-sub">{piece.colorway}</span>
                <span className="fp-price">${piece.price}</span>
                <span className="fp-worn">{worn ? 'WEARING ✓' : 'WEAR'}</span>
              </button>
            );
          })}
        </div>
        <div className="fw-hint">
          Added pieces land in your bag — combine outerwear + trousers for a 10% outfit discount.
        </div>
      </aside>
    </div>
  );
}

// Expose thumb refs for the Catalog page (separate route)
declare global {
  interface Window {
    __catThumbRefs?: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  }
}
