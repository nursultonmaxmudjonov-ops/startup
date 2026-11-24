'use client';

import React, { useEffect, useRef, useState } from 'react';
import { LOOKS, getThumbCropStyle, type Piece } from '@/src/data/looks';
import { useLanguage } from '@/src/context/LanguageContext';

interface CatalogSectionProps {
  bag: Set<string>;
  onToggleBagItem: (lookIdx: number, pieceIdx: number, thumbEl: HTMLElement | null) => void;
  onShowToast: (msg: string) => void;
}

export default function CatalogSection({
  bag,
  onToggleBagItem,
  onShowToast,
}: CatalogSectionProps) {
  const { t, language } = useLanguage();
  const [catFilter, setCatFilter] = useState<'all' | '0' | '1'>('all');
  const [lookFilter, setLookFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [catThumbDims, setCatThumbDims] = useState<[number, number]>([210, 262]);

  // Selected piece for Detail Modal
  const [detailItem, setDetailItem] = useState<{
    li: number;
    pi: 0 | 1;
    lookName: string;
    lookUrl: string;
    piece: Piece;
  } | null>(null);

  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL'>('L');

  const catGridRef = useRef<HTMLDivElement | null>(null);
  const catThumbRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const updateDims = () => {
      const firstThumb = Object.values(catThumbRefs.current).find((el) => el && el.clientWidth);
      if (firstThumb && firstThumb.clientWidth && firstThumb.clientHeight) {
        setCatThumbDims([firstThumb.clientWidth, firstThumb.clientHeight]);
      }
    };
    updateDims();
    const ro = new ResizeObserver(updateDims);
    if (catGridRef.current) ro.observe(catGridRef.current);
    window.addEventListener('resize', updateDims);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateDims);
    };
  }, [catFilter, lookFilter, searchQuery]);

  const q = searchQuery.trim().toLowerCase();
  const catalogItems: Array<{ li: number; pi: 0 | 1 }> = [];
  LOOKS.forEach((look, li) => {
    if (lookFilter !== 'all' && Number(lookFilter) !== li) return;
    ([0, 1] as const).forEach((pi) => {
      if (catFilter !== 'all' && Number(catFilter) !== pi) return;
      const piece = look.pieces[pi];
      if (q && !piece.name.toLowerCase().includes(q) && !look.name.toLowerCase().includes(q) && !(piece.material && piece.material.toLowerCase().includes(q))) {
        return;
      }
      catalogItems.push({ li, pi });
    });
  });

  return (
    <section id="catalog" aria-label="Garment Catalog">
      <div className="cat-header">
        <div>
          <span className="cat-kicker-tag">VANTEGE WEAR · HARDWARE SPEC</span>
          <h2>
            {language === 'uz' ? 'Kiyimlar ' : language === 'ru' ? 'Каталог ' : 'Garment '}
            <span>{language === 'uz' ? 'Katalogi' : language === 'ru' ? 'Изделий' : 'Catalog'}</span>
          </h2>
          <p className="cat-sub">
            {language === 'uz'
              ? '9 ta to‘liq look bo‘ylab 18 ta nano-muhandislik buyumlari. Qidiring, filtrlang va savatga qo‘shing.'
              : language === 'ru'
              ? '18 высокотехнологичных моделей из 9 луков. Фильтруйте по типу и добавляйте в корзину.'
              : '18 pieces across 9 looks — filter, search and inspect molecular fabrication specs.'}
          </p>
        </div>
        <span className="side-count">
          {catalogItems.length} {catalogItems.length === 1 ? 'PIECE' : 'PIECES'}
        </span>
      </div>

      <div className="cat-toolbar">
        <div className="cat-tabs" role="tablist" aria-label="Category filter">
          {(
            [
              ['all', `${t.all} (18)`],
              ['0', `${t.outerwear} (9)`],
              ['1', `${t.trousers} (9)`],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              className={`cat-tab${catFilter === val ? ' on' : ''}`}
              type="button"
              onClick={() => setCatFilter(val)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="cat-search">
          <svg
            width="14"
            height="14"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          >
            <circle cx="8" cy="8" r="4.8" />
            <line x1="11.6" y1="11.6" x2="15" y2="15" />
          </svg>
          <input
            type="search"
            placeholder={t.searchPlaceholder}
            aria-label="Search garments"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="look-chips">
        <button
          type="button"
          className={`look-chip${lookFilter === 'all' ? ' on' : ''}`}
          onClick={() => setLookFilter('all')}
        >
          {t.all} ({LOOKS.length})
        </button>
        {LOOKS.map((look, i) => (
          <button
            key={look.name}
            type="button"
            className={`look-chip${lookFilter === String(i) ? ' on' : ''}`}
            onClick={() => setLookFilter(String(i))}
          >
            {String(i + 1).padStart(2, '0')} · {look.name}
          </button>
        ))}
      </div>

      <div id="catGrid" ref={catGridRef}>
        {catalogItems.map(({ li, pi }) => {
          const look = LOOKS[li];
          const piece = look.pieces[pi];
          const key = `${li}-${pi}`;
          const inBag = bag.has(key);

          return (
            <article
              key={key}
              className="cat-card"
              onClick={() =>
                setDetailItem({
                  li,
                  pi,
                  lookName: look.name,
                  lookUrl: look.url,
                  piece,
                })
              }
            >
              <div
                ref={(el) => {
                  catThumbRefs.current[key] = el;
                }}
                className="cat-thumb-wrap"
                style={getThumbCropStyle(
                  look.url,
                  piece.crop,
                  catThumbDims[0],
                  catThumbDims[1]
                )}
              >
                <div className="cat-badge-row">
                  <span className="cat-kind">{pi === 0 ? 'OUTERWEAR' : 'TROUSERS'}</span>
                  <span className="cat-worn-tag">INSPECT SPEC</span>
                </div>
                <span className="cat-try-hint">
                  {language === 'uz' ? 'Tafsilotlar' : 'Inspect Details'}
                </span>
              </div>

              <div className="cat-info">
                <div className="cat-meta">
                  <div className="cat-look">
                    {String(li + 1).padStart(2, '0')} · {look.name}
                  </div>
                  <div className="cat-name">{piece.name}</div>
                  <div className="cat-sub-line">
                    {piece.colorway} · {piece.material}
                  </div>
                  <div className="cat-desc">{piece.desc}</div>
                  <div className="cat-tags">
                    <span className="cat-tag">{piece.colorway?.split(' ')[0]}</span>
                    <span className="cat-tag">FW ’26</span>
                    <span className="cat-tag">{pi === 0 ? 'HexaShell' : 'Bottom'}</span>
                  </div>
                  <div className="cat-price">${piece.price.toFixed(2)}</div>
                </div>
                <button
                  type="button"
                  className={`add-btn cat-add${inBag ? ' in' : ''}`}
                  aria-label={inBag ? `Remove ${piece.name} from bag` : `Add ${piece.name} to bag`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBagItem(li, pi, catThumbRefs.current[key]);
                  }}
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
              </div>
            </article>
          );
        })}
      </div>

      {/* Product Detail Modal */}
      {detailItem && (
        <div className="auth-modal-backdrop" onClick={() => setDetailItem(null)}>
          <div
            className="auth-modal-card catalog-detail-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              className="auth-modal-close"
              onClick={() => setDetailItem(null)}
              type="button"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="detail-modal-layout">
              <div
                className="detail-modal-img"
                style={getThumbCropStyle(detailItem.lookUrl, detailItem.piece.crop, 320, 420)}
              />

              <div className="detail-modal-content">
                <span className="detail-look-tag">
                  LOOK {String(detailItem.li + 1).padStart(2, '0')} · {detailItem.lookName}
                </span>
                <h3 className="detail-title">{detailItem.piece.name}</h3>
                <div className="detail-price-row">
                  <span className="detail-price">${detailItem.piece.price}</span>
                  <span className="detail-stock-badge">✓ {t.inStock} (Ready for Dispatch)</span>
                </div>

                <p className="detail-desc">{detailItem.piece.desc}</p>

                <div className="detail-spec-grid">
                  <div className="detail-spec-item">
                    <span className="label">Mato arxitekturasi:</span>
                    <strong>{detailItem.piece.material || 'HexaWeave™ 3-Layer Graphene'}</strong>
                  </div>
                  <div className="detail-spec-item">
                    <span className="label">Rangi / Colorway:</span>
                    <strong>{detailItem.piece.colorway}</strong>
                  </div>
                  <div className="detail-spec-item">
                    <span className="label">Suv o‘tkazmaslik:</span>
                    <strong>25,000mm hydrostatic head</strong>
                  </div>
                  <div className="detail-spec-item">
                    <span className="label">Tikuv turi:</span>
                    <strong>SonicWelding™ Ultratovushli</strong>
                  </div>
                </div>

                {/* Size picker */}
                <div className="detail-size-section">
                  <label>O‘lchamni tanlang (Size):</label>
                  <div className="size-chips-row">
                    {(['S', 'M', 'L', 'XL'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        className={`size-chip ${selectedSize === sz ? 'on' : ''}`}
                        onClick={() => setSelectedSize(sz)}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="detail-actions">
                  <button
                    type="button"
                    className="primary-cta detail-add-btn"
                    onClick={() => {
                      const key = `${detailItem.li}-${detailItem.pi}`;
                      onToggleBagItem(detailItem.li, detailItem.pi, catThumbRefs.current[key]);
                      onShowToast(`${detailItem.piece.name} (${selectedSize}) ${t.addedToBag}`);
                      setDetailItem(null);
                    }}
                  >
                    <span>{t.addToBag} — ${detailItem.piece.price}</span>
                  </button>

                  <a
                    href="/fitting"
                    className="detail-tryon-btn"
                    onClick={() => setDetailItem(null)}
                  >
                    🪞 {t.fittingTitle} da sinash
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
