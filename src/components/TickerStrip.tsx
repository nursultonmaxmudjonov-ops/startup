'use client';

import React from 'react';

const ITEMS = [
  'FW ’26 DROP — LIVE NOW',
  '9 LOOKS · 18 PIECES',
  '6 DO’KONLAR · 3 SHAHARLAR',
  'TRY-ON STUDIO — NO CAMERA, NO SIGN-UP',
  'FREE SHIPPING OVER $250',
  'VANTEGE LIST MEMBERS — EARLY ACCESS',
  'MADE FOR AFTER DARK',
];

export default function TickerStrip() {
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {[0, 1].map((dup) => (
          <div className="ticker-seq" key={dup}>
            {ITEMS.map((it) => (
              <span key={`${dup}-${it}`} className="ticker-item">
                {it}
                <i className="ticker-dot" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
