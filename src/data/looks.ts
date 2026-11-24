export const CDN = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/';

export const H = (file: string, w: number) =>
  'https://images.higgs.ai/?default=1&output=webp&url=' +
  encodeURIComponent(CDN + file) +
  '&w=' +
  w +
  '&q=85';

export const SRC_W = 1360;
export const SRC_H = 2048;
export const DWELL = 5200;

export interface Piece {
  name: string;
  price: number;
  crop: [number, number];
  pin: [number, number];
  colorway?: string;
  material?: string;
  desc?: string;
}

export interface GarmentFit {
  scale?: number;
  x?: number;
  y?: number;
}

export interface Look {
  name: string;
  file: string;
  url: string;
  tone: string;
  pieces: [Piece, Piece];
}

const RAW_LOOKS: Array<Omit<Look, 'url'>> = [
  {
    name: 'Cobalt Shell',
    file: 'hf_20261113_092602_2edcdd38-47f9-40ca-b2f0-3d1196e356ed.png',
    tone: 'rgba(40,80,255,.30)',
    pieces: [
      { name: 'Cobalt Rain Shell', price: 425, crop: [300, 1080], pin: [0.6, 0.3] },
      { name: 'Wide Cargo Pant', price: 165, crop: [1020, 2010], pin: [0.38, 0.7] },
    ],
  },
  {
    name: 'Silver Signal',
    file: 'hf_20261113_092602_489603db-d621-4dac-8dad-0aaf42f0d15c.png',
    tone: 'rgba(200,210,230,.24)',
    pieces: [
      { name: 'Mirror Down Parka', price: 650, crop: [230, 1100], pin: [0.62, 0.3] },
      { name: 'Straight Tech Trouser', price: 180, crop: [1040, 2010], pin: [0.38, 0.72] },
    ],
  },
  {
    name: 'Night Run',
    file: 'hf_20261113_092516_b5bd2ecc-b375-46e1-bb83-eca3e17f818b.png',
    tone: 'rgba(70,78,96,.32)',
    pieces: [
      { name: 'Storm Hooded Shell', price: 390, crop: [230, 1040], pin: [0.62, 0.3] },
      { name: 'Wide Cargo Pant', price: 165, crop: [1000, 2010], pin: [0.38, 0.7] },
    ],
  },
  {
    name: 'Long Hour',
    file: 'hf_20261113_092601_1b201cc2-e88d-4501-80a3-6907b149777a.png',
    tone: 'rgba(80,86,100,.30)',
    pieces: [
      { name: 'Hooded Long Parka', price: 720, crop: [260, 1440], pin: [0.62, 0.36] },
      { name: 'Straight Tech Trouser', price: 180, crop: [1360, 2010], pin: [0.4, 0.82] },
    ],
  },
  {
    name: 'Gallery Opening',
    file: 'hf_20261113_092603_fceeb6f1-9ee2-4883-8e0f-3327ae0bab7a.png',
    tone: 'rgba(90,96,110,.30)',
    pieces: [
      { name: 'Quilted Down Vest', price: 310, crop: [240, 1110], pin: [0.58, 0.3] },
      { name: 'Graphite Cargo Pant', price: 175, crop: [1060, 2010], pin: [0.38, 0.7] },
    ],
  },
  {
    name: 'Soft Static',
    file: 'hf_20261113_092602_91acecdf-be55-4f27-b413-012a4615763a.png',
    tone: 'rgba(110,112,120,.26)',
    pieces: [
      { name: 'Graphite Fleece Half-Zip', price: 210, crop: [320, 1000], pin: [0.6, 0.28] },
      { name: 'Pleated Wide Trouser', price: 195, crop: [940, 2010], pin: [0.4, 0.7] },
    ],
  },
  {
    name: 'Violet Drift',
    file: 'hf_20261113_092602_2edcdd38-47f9-40ca-b2f0-3d1196e356ed.png',
    tone: 'rgba(120,70,220,.28)',
    pieces: [
      { name: 'Violet Tech Anorak', price: 480, crop: [300, 1080], pin: [0.6, 0.3] },
      { name: 'Slim Cargo Jogger', price: 155, crop: [1020, 2010], pin: [0.38, 0.7] },
    ],
  },
  {
    name: 'Ember Line',
    file: 'hf_20261113_092516_b5bd2ecc-b375-46e1-bb83-eca3e17f818b.png',
    tone: 'rgba(220,110,60,.28)',
    pieces: [
      { name: 'Ember Windbreaker', price: 355, crop: [230, 1040], pin: [0.62, 0.3] },
      { name: 'Charcoal Relaxed Denim', price: 190, crop: [1000, 2010], pin: [0.38, 0.7] },
    ],
  },
  {
    name: 'Glacier Veil',
    file: 'hf_20261113_092601_1b201cc2-e88d-4501-80a3-6907b149777a.png',
    tone: 'rgba(130,180,220,.26)',
    pieces: [
      { name: 'Glacier Puffer Jacket', price: 590, crop: [260, 1440], pin: [0.62, 0.36] },
      { name: 'Ice Grey Tailored Pant', price: 205, crop: [1360, 2010], pin: [0.4, 0.82] },
    ],
  },
];

const PIECE_META: Array<{ colorway: string; material: string; desc: string }> = [
  { colorway: 'Cobalt Blue', material: '3L ripstop · sealed seams', desc: 'Fully taped storm shell with an articulated hood and StormFlap placket.' },
  { colorway: 'Graphite', material: 'Peached cotton twill', desc: 'Double-knee cargo with articulated knees and hidden zip pockets.' },
  { colorway: 'Liquid Silver', material: 'Metallic-coated nylon', desc: 'High-loft down parka with a mirror-finish shell and storm cuffs.' },
  { colorway: 'Slate Grey', material: '4-way stretch weave', desc: 'Clean-front tech trouser with a gusseted crotch and gripper waistband.' },
  { colorway: 'Night Navy', material: '2.5L waterproof shell', desc: 'Helmet-compatible hood, laser-cut vents and a kangaroo storm pocket.' },
  { colorway: 'Ash Black', material: 'Brushed backer twill', desc: 'Wide-leg cargo with a sculpted seat and tonal webbing belts.' },
  { colorway: 'Deep Moss', material: 'Waxed organic cotton', desc: 'Knee-length longline parka with a wire-bridge hood and fleece chin guard.' },
  { colorway: 'Ecru', material: 'Quilted 40g loft', desc: 'Box-quilted vest with a stand funnel and drop-tail hem.' },
  { colorway: 'Pewter', material: 'Bi-stretch wool blend', desc: 'Cargo pant with a tapered flare and articulated knee darts.' },
  { colorway: 'Charcoal Static', material: 'Heavyweight grid fleece', desc: 'Half-zip pullover with a scuba collar and thumb-loop cuffs.' },
  { colorway: 'Dune', material: 'Tumbled micro-pleat', desc: 'Pleated wide trouser with a contour waist and deep side pockets.' },
  { colorway: 'Ultra Violet', material: 'Matte 3L lamina', desc: 'Anorak with an over-the-head zip and bungee hem cinch.' },
  { colorway: 'Iris Slate', material: 'Ripstop jogger twill', desc: 'Slim jogger cargo with zipped ankle gussets and a soft shaper waist.' },
  { colorway: 'Burnt Ember', material: 'Cire-coated shell', desc: 'Windbreaker with taped raglan seams and a snap-storm placket.' },
  { colorway: 'Vintage Indigo', material: '13.5oz comfort denim', desc: 'Relaxed five-pocket jean with a carried knee and clean hem.' },
  { colorway: 'Glacier Ice', material: 'Ripstop puffer laminate', desc: 'Down puffer with welded baffles and a two-way centre zip.' },
  { colorway: 'Frost Grey', material: 'Cool-touch suiting', desc: 'Tailored pant with a razor crease and a hidden extension waistband.' },
];

export const LOOKS: Look[] = RAW_LOOKS.map((l, li) => ({
  ...l,
  url: H(l.file, 900),
  pieces: [
    { ...l.pieces[0], ...PIECE_META[li * 2] },
    { ...l.pieces[1], ...PIECE_META[li * 2 + 1] },
  ] as [Piece, Piece],
}));

// Per-layer body alignment, tuned from each look's crop window so the garment
// sits ON the model — anchored to the shoulder line (top) / hip line (bottom).
const FIT_BY_LOOK: Array<[GarmentFit, GarmentFit]> = [
  [{ scale: 1.02, y: -18 }, { scale: 1.03, y: 6 }],   // Cobalt Shell
  [{ scale: 1.0, y: -10 }, { scale: 1.02, y: 4 }],    // Silver Signal
  [{ scale: 1.04, y: -16 }, { scale: 1.05, y: 8 }],   // Night Run
  [{ scale: 0.98, y: -14 }, { scale: 1.0, y: 2 }],    // Long Hour
  [{ scale: 1.01, y: -12 }, { scale: 1.03, y: 5 }],   // Gallery Opening
  [{ scale: 1.0, y: -8 }, { scale: 1.01, y: 3 }],     // Soft Static
  [{ scale: 1.02, y: -18 }, { scale: 1.03, y: 6 }],   // Violet Drift
  [{ scale: 1.04, y: -16 }, { scale: 1.05, y: 8 }],   // Ember Line
  [{ scale: 0.98, y: -14 }, { scale: 1.0, y: 2 }],    // Glacier Veil
];

export const TOP_FIT_DEFAULT: GarmentFit = { scale: 1, y: -12 };
export const BOT_FIT_DEFAULT: GarmentFit = { scale: 1, y: 0 };

export const lookFit = (li: number, slot: 'top' | 'bot'): GarmentFit => {
  const f = FIT_BY_LOOK[((li % FIT_BY_LOOK.length) + FIT_BY_LOOK.length) % FIT_BY_LOOK.length];
  return f[slot === 'top' ? 0 : 1] ?? (slot === 'top' ? TOP_FIT_DEFAULT : BOT_FIT_DEFAULT);
};

export const TABLE: Array<[number, number, number, number, number, number, number]> = [
  [0, 0, 1.0, 0, 0, 1.0, 1.0],
  [1, 160, 0.94, 12, 1.2, 0.9, 1.0],
  [2, 284, 0.85, 59, 4.0, 0.72, 1.0],
  [3, 362, 0.78, 95, 8.0, 0.55, 0.55],
  [3.6, 392, 0.74, 110, 11, 0.48, 0.0],
];

export const mod9 = (i: number) => ((i % 9) + 9) % 9;

export const wrap = (d: number) => {
  const v = ((d % 9) + 9) % 9;
  return v >= 4.5 ? v - 9 : v;
};

export function sampleTable(a: number): [number, number, number, number, number, number] {
  if (a >= 4.5) {
    const last = TABLE[TABLE.length - 1];
    return [last[1], last[2], last[3], last[4], last[5], last[6]];
  }
  for (let i = 0; i < TABLE.length - 1; i++) {
    const r0 = TABLE[i];
    const r1 = TABLE[i + 1];
    if (a >= r0[0] && a <= r1[0]) {
      const t = (a - r0[0]) / (r1[0] - r0[0]);
      return [
        r0[1] + (r1[1] - r0[1]) * t,
        r0[2] + (r1[2] - r0[2]) * t,
        r0[3] + (r1[3] - r0[3]) * t,
        r0[4] + (r1[4] - r0[4]) * t,
        r0[5] + (r1[5] - r0[5]) * t,
        r0[6] + (r1[6] - r0[6]) * t,
      ];
    }
  }
  return [0, 1, 0, 0, 1, 1];
}

export function getThumbCropStyle(
  lookUrl: string,
  crop: [number, number],
  w: number,
  h: number
): React.CSSProperties {
  const [y0, y1] = crop;
  const k = Math.min(h / (y1 - y0), w / 560);
  const bgW = SRC_W * k;
  const bgH = SRC_H * k;
  const bgX = w / 2 - 680 * k;
  const bgY = h / 2 - ((y0 + y1) / 2) * k;
  return {
    backgroundImage: `url("${lookUrl}")`,
    backgroundSize: `${bgW.toFixed(2)}px ${bgH.toFixed(2)}px`,
    backgroundPosition: `${bgX.toFixed(2)}px ${bgY.toFixed(2)}px`,
  };
}
