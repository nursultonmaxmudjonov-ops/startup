'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useReveal } from '@/src/components/useReveal';
import { useLanguage } from '@/src/context/LanguageContext';

interface Metric {
  label: string;
  value: number;
  suffix: string;
}

interface NodeTopology {
  id: string;
  name: string;
  location: string;
  type: string;
  latencyMs: number;
  bandwidth: string;
  connectedShells: number;
  status: 'optimal' | 'nominal' | 'high_load';
}

const NODES_TOPOLOGY: NodeTopology[] = [
  { id: 'node-tas-01', name: 'Cluster Alpha (Central)', location: 'Tashkent, UZ', type: 'Primary HQ Gateway', latencyMs: 4, bandwidth: '40 Gbps', connectedShells: 18420, status: 'optimal' },
  { id: 'node-ala-02', name: 'Alpine Relay Node', location: 'Almaty, KZ', type: 'Mountain Weather Station', latencyMs: 16, bandwidth: '20 Gbps', connectedShells: 9240, status: 'optimal' },
  { id: 'node-sam-03', name: 'Registan Heritage Pod', location: 'Samarkand, UZ', type: 'Edge Micro-Cluster', latencyMs: 8, bandwidth: '10 Gbps', connectedShells: 4180, status: 'optimal' },
  { id: 'node-dxb-04', name: 'Gulf Mesh Gateway', location: 'Dubai, UAE', type: 'Regional Hub', latencyMs: 38, bandwidth: '100 Gbps', connectedShells: 14200, status: 'nominal' },
  { id: 'node-fra-05', name: 'Frankfurt Cloud Proxy', location: 'Frankfurt, DE', type: 'Database Replication Vault', latencyMs: 62, bandwidth: '80 Gbps', connectedShells: 2190, status: 'optimal' },
  { id: 'node-tyo-06', name: 'Tokyo Nanotech Ingestion', location: 'Tokyo, JP', type: 'Textile Sensor Edge', latencyMs: 89, bandwidth: '40 Gbps', connectedShells: 840, status: 'nominal' },
];

const FEED_LOGS = [
  { t: '23:44:12', level: 'TELEMETRY', city: 'Tashkent', msg: 'Flagship 3D LiDAR Scanner calibrated: 180 measurement points active' },
  { t: '23:42:05', level: 'ORDERS', city: 'Almaty', msg: 'Glacier Puffer dispatched via Yandex Express (Tracking #KZ-EXP-991)' },
  { t: '23:38:51', level: 'SECURITY', city: 'Dubai', msg: 'NFC cryptographic signature validated: Mirror Down Parka #DXB-0422' },
  { t: '23:34:10', level: 'TELEMETRY', city: 'Tashkent', msg: 'Amir Temur microclimate sensor: Rain detected, ambient +8.4°C, humidity 89%' },
  { t: '23:29:44', level: 'LOGISTICS', city: 'Samarkand', msg: 'Registan Concept Space: 14 new Cobalt Shell units received in archive vault' },
  { t: '23:25:19', level: 'TELEMETRY', city: 'Astana', msg: 'North Wind station ping: -7.2°C, wind speed 34 km/h gusts recorded' },
  { t: '23:18:02', level: 'ORDERS', city: 'Tashkent', msg: 'Order #ORD-9844 auto-assigned to Chilonzor rapid packaging locker' },
  { t: '23:12:40', level: 'SECURITY', city: 'Frankfurt', msg: 'Supabase DB multi-region backup snapshot encrypted and verified' },
  { t: '23:08:15', level: 'TELEMETRY', city: 'Bishkek', msg: 'Ala-Too sub-zero chamber test completed: 32,000 g/m² breathability confirmed' },
];

interface WeatherStation {
  city: string;
  temp: string;
  weather: string;
  wind: string;
  humidity: string;
  advisory: string;
  recommendedGarment: string;
}

const DEFAULT_WEATHER: WeatherStation[] = [
  {
    city: 'Tashkent',
    temp: '+9°C',
    weather: 'Yomg‘ir & Tuman',
    wind: '18 km/h',
    humidity: '88%',
    advisory: 'Namlik 88% · Kuchli yomg‘ir yog‘moqda',
    recommendedGarment: 'Cobalt Rain Shell (25,000mm)',
  },
  {
    city: 'Samarkand',
    temp: '+5°C',
    weather: 'Sovuq shamol',
    wind: '24 km/h',
    humidity: '62%',
    advisory: 'Kechasi -2°C gacha tushadi',
    recommendedGarment: 'Hooded Long Parka',
  },
  {
    city: 'Bukhara',
    temp: '+7°C',
    weather: 'Ochiq & Shamolli',
    wind: '21 km/h',
    humidity: '48%',
    advisory: 'Quruq cho‘l shabadasi',
    recommendedGarment: 'Storm Hooded Shell',
  },
  {
    city: 'Almaty',
    temp: '-3°C',
    weather: 'Qor & Muz',
    wind: '12 km/h',
    humidity: '92%',
    advisory: 'Tog‘dan esuvchi qor shamoli',
    recommendedGarment: 'Glacier Puffer Jacket',
  },
  {
    city: 'Astana',
    temp: '-9°C',
    weather: 'Qishki bo‘ron',
    wind: '42 km/h',
    humidity: '86%',
    advisory: 'Kuchli izg‘irin · Shamol tezligi yuqori',
    recommendedGarment: 'Mirror Down Parka (-25°C)',
  },
  {
    city: 'Bishkek',
    temp: '-6°C',
    weather: 'Kuchli qor',
    wind: '15 km/h',
    humidity: '90%',
    advisory: 'Sub-zero sharoit',
    recommendedGarment: 'Mirror Down Parka',
  },
  {
    city: 'Dubai',
    temp: '+22°C',
    weather: 'Ochiq osmon',
    wind: '8 km/h',
    humidity: '54%',
    advisory: 'Mo‘tadil tungi shabada',
    recommendedGarment: 'Violet Tech Anorak',
  },
  {
    city: 'Doha',
    temp: '+24°C',
    weather: 'Dengiz shabadasi',
    wind: '14 km/h',
    humidity: '68%',
    advisory: 'Sohilbo‘yi nam iqlim',
    recommendedGarment: 'Lightweight Graphene Windbreaker',
  },
];

function useCountUp(target: number, run: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return val;
}

function MetricCell({ m, run }: { m: Metric; run: boolean }) {
  const v = useCountUp(m.value, run);
  return (
    <div className="nw-metric reveal">
      <span className="nw-metric-val">
        {v.toLocaleString('en-US')}
        {m.suffix}
      </span>
      <span className="nw-metric-label">{m.label}</span>
    </div>
  );
}

export default function NetworkPanel() {
  const rootRef = useReveal<HTMLElement>();
  const { language } = useLanguage();
  const uz = language === 'uz';

  const [runCounters, setRunCounters] = useState(false);
  const [logFilter, setLogFilter] = useState<'ALL' | 'TELEMETRY' | 'ORDERS' | 'SECURITY' | 'LOGISTICS'>('ALL');
  const [isConsolePaused, setIsConsolePaused] = useState(false);
  const [cmdInput, setCmdInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [feedLogs, setFeedLogs] = useState(FEED_LOGS);

  // Diagnostics garment selection
  const [selectedJacket, setSelectedJacket] = useState<'cobalt' | 'mirror' | 'storm'>('cobalt');

  // Weather simulation
  const [weatherList, setWeatherList] = useState(DEFAULT_WEATHER);
  const [isSimulatedStorm, setIsSimulatedStorm] = useState(false);

  const statsRef = useRef<HTMLDivElement | null>(null);

  const METRICS: Metric[] = [
    { label: uz ? 'Global Studiya Tugunlari' : 'Global Edge Nodes', value: 9, suffix: '' },
    { label: uz ? 'Faol Ulangan Kurtkalar (NFC)' : 'Connected NFC Shells', value: 48920, suffix: '+' },
    { label: uz ? 'Oylik 3D Lidar Skanerlari' : 'Monthly 3D Scans', value: 3840, suffix: '' },
    { label: uz ? 'Tarmoq Barqarorligi (Uptime)' : 'Telemetry Uptime', value: 99.98, suffix: '%' },
  ];

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRunCounters(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Periodic log streamer simulation
  useEffect(() => {
    if (isConsolePaused) return;
    const interval = setInterval(() => {
      const cities = ['Tashkent', 'Almaty', 'Dubai', 'Samarkand', 'Astana'];
      const levels: Array<'TELEMETRY' | 'ORDERS' | 'SECURITY' | 'LOGISTICS'> = ['TELEMETRY', 'ORDERS', 'SECURITY', 'LOGISTICS'];
      const msgs = [
        'Edge WebSocket heart-beat ping acknowledged (14ms)',
        'Ultrasonic seam temperature calibrated: 184°C nominal',
        'Customer NFC tapped at Flagship try-on mirror',
        'Yandex Express live courier location updated (2.4 km away)',
        'HexaWeave membrane breathability sensor reading: 31,840 g/m²',
      ];
      const now = new Date().toTimeString().slice(0, 8);
      const newEntry = {
        t: now,
        level: levels[Math.floor(Math.random() * levels.length)],
        city: cities[Math.floor(Math.random() * cities.length)],
        msg: msgs[Math.floor(Math.random() * msgs.length)],
      };
      setFeedLogs((prev) => [newEntry, ...prev.slice(0, 15)]);
    }, 3200);
    return () => clearInterval(interval);
  }, [isConsolePaused]);

  const filteredLogs = useMemo(() => {
    if (logFilter === 'ALL') return feedLogs;
    return feedLogs.filter((l) => l.level === logFilter);
  }, [feedLogs, logFilter]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = cmdInput.trim().toLowerCase();
    if (!cmd) return;

    let res = '';
    if (cmd === 'help') {
      res = 'Available commands: status, ping, weather, scan, nodes, clear, version';
    } else if (cmd === 'status') {
      res = 'STATUS: All 9 global hubs ONLINE. Latency 14ms. Core Supabase DB healthy.';
    } else if (cmd === 'ping') {
      res = 'PING tashkent-hub.vantege.io: 64 bytes, time=4.2ms, TTL=58. Packet loss: 0%';
    } else if (cmd === 'weather') {
      res = 'WEATHER: Tashkent +9°C (Rain), Samarkand +5°C, Almaty -3°C (Snow), Astana -9°C (Gale)';
    } else if (cmd === 'scan') {
      res = 'NFC SCANNER: Jacket ID #VANTEGE-9982 authenticated. HexaWeave integrity: 98.4%';
    } else if (cmd === 'nodes') {
      res = 'NODES: [tas-01, ala-02, sam-03, dxb-04, fra-05, tyo-06] all active.';
    } else if (cmd === 'clear') {
      setTerminalOutput([]);
      setCmdInput('');
      return;
    } else if (cmd === 'version') {
      res = 'VANTEGE-OS v2.6.4-production (Next.js 16 + Turbopack + Supabase Core)';
    } else {
      res = `Unknown command "${cmd}". Type "help" for available commands.`;
    }

    setTerminalOutput((prev) => [...prev, `> ${cmdInput}`, res]);
    setCmdInput('');
  };

  const handleStormSimulation = () => {
    const next = !isSimulatedStorm;
    setIsSimulatedStorm(next);
    if (next) {
      setWeatherList((prev) =>
        prev.map((w) => {
          if (w.city === 'Tashkent') {
            return {
              ...w,
              temp: '+2°C',
              weather: 'Kuchli Bo‘ron & Jalasi',
              wind: '54 km/h',
              humidity: '98%',
              advisory: '⚠️ SHOSHILINCH ADVISORY: 50mm yomg‘ir yog‘moqda',
              recommendedGarment: 'Cobalt Rain Shell + Storm Hood (25,000mm)',
            };
          }
          return w;
        })
      );
    } else {
      setWeatherList(DEFAULT_WEATHER);
    }
  };

  return (
    <section id="network-data" ref={rootRef} aria-label="Data network panel" className="network-section-expanded">
      {/* Header */}
      <div className="nw-head">
        <div>
          <span className="cat-kicker-tag">GLOBAL IOT & TELEMETRY MISSION CONTROL</span>
          <h2>
            Data<span>Network</span>
          </h2>
          <p className="lb-sub">
            {uz
              ? 'Barcha do‘konlar, sensorlar va omborlar yagona telemetriya tarmog‘ida: kiyim holati, ob-havo tavsiyasi va logistika oqimi real vaqtda.'
              : 'Real-time telemetry linking our 9 flagship hubs, atmospheric microclimate stations, and autonomous garment fulfillment.'}
          </p>
        </div>
        <span className="side-count nw-live">
          <i className="nw-pulse" /> LIVE TELEMETRY STREAM · ACTIVE
        </span>
      </div>

      {/* Meta ticker */}
      <div className="section-meta-ticker">
        <div className="ticker-node">
          <span className="dot" />
          <span>{uz ? 'Tugun holati: BARCHA 9 TUGUN ONLINE' : 'System: 9 GLOBAL NODES NOMINAL'}</span>
        </div>
        <span className="ticker-sep">|</span>
        <div className="ticker-node">
          <span>📡 Ping: <strong>14 ms</strong></span>
        </div>
        <span className="ticker-sep">|</span>
        <div className="ticker-node">
          <span>⚡ WebSocket oqimi: <strong>4.8k msg/sec</strong></span>
        </div>
        <span className="ticker-sep">|</span>
        <div className="ticker-node">
          <span>🔒 Supabase Auth: <strong>Encrypted</strong></span>
        </div>
      </div>

      {/* Primary Metrics Counter */}
      <div className="nw-stats" ref={statsRef}>
        {METRICS.map((m) => (
          <MetricCell key={m.label} m={m} run={runCounters} />
        ))}
      </div>

      {/* Global Node Topology Grid */}
      <div className="network-topology-container reveal">
        <div className="topology-head">
          <div>
            <h3 style={{ fontSize: '18px', color: '#fff', margin: '0 0 4px', fontWeight: 700 }}>
              🌐 {uz ? 'Global Server va Sensor Tugunlari (Topology)' : 'Edge Node Topology & Latency Map'}
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
              {uz
                ? 'Har bir hududiy tugun mahalliy ob-havo datchiklari va NFC o‘lchovlarini qayta ishlaydi:'
                : 'Decentralized micro-clusters handling local microclimate streams and jacket diagnostics:'}
            </p>
          </div>
          <span className="node-ping-badge">SYNC: 100% NOMINAL</span>
        </div>

        <div className="topology-grid">
          {NODES_TOPOLOGY.map((node) => (
            <div key={node.id} className="topo-node-box">
              <div className="topo-node-header">
                <span className="topo-node-title">{node.location}</span>
                <span className="topo-status-dot" />
              </div>
              <div className="topo-node-meta">
                <span>🖥️ {node.name}</span>
                <span>🏷️ {node.type}</span>
                <span>⚡ Latency: <strong style={{ color: node.latencyMs < 20 ? '#4ade80' : '#facc15' }}>{node.latencyMs} ms</strong></span>
                <span>📶 O‘tkazuvchanlik: {node.bandwidth}</span>
                <span>🧥 Ulangan kiyimlar: <strong>{node.connectedShells.toLocaleString()} ta</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Garment Health & Diagnostics Simulation */}
      <div className="garment-diagnostics-section reveal">
        <div className="diag-header">
          <div>
            <span className="cat-kicker-tag">NFC CLOUD TELEMETRY</span>
            <h3 style={{ fontSize: '20px', color: '#fff', margin: '4px 0', fontWeight: 700 }}>
              🧥 {uz ? 'Aqlli Kiyim Diagnostikasi va Sensorlari' : 'Smart Garment Telemetry & NFC Health Scanner'}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>
              {uz
                ? 'Kurtkangiz ichidagi shifrlangan NFC chipi orqali matoning suv qaytarishi va grafen holatini tekshirish:'
                : 'Simulate smartphone NFC tap to inspect real-time membrane integrity, DWR saturation, and service history:'}
            </p>
          </div>

          <div className="diag-selector-row">
            <button
              type="button"
              className={`diag-jacket-btn ${selectedJacket === 'cobalt' ? 'active' : ''}`}
              onClick={() => setSelectedJacket('cobalt')}
            >
              Cobalt Rain Shell
            </button>
            <button
              type="button"
              className={`diag-jacket-btn ${selectedJacket === 'mirror' ? 'active' : ''}`}
              onClick={() => setSelectedJacket('mirror')}
            >
              Mirror Down Parka
            </button>
            <button
              type="button"
              className={`diag-jacket-btn ${selectedJacket === 'storm' ? 'active' : ''}`}
              onClick={() => setSelectedJacket('storm')}
            >
              Storm Hooded Shell
            </button>
          </div>
        </div>

        <div className="diag-meters-grid">
          <div className="diag-meter-card">
            <div className="diag-meter-title">DWR Suv Qaytarish Qatlami</div>
            <div className="diag-meter-value">
              {selectedJacket === 'cobalt' ? '96%' : selectedJacket === 'mirror' ? '92%' : '88%'}
            </div>
            <div className="diag-meter-bar">
              <div
                className="diag-meter-fill"
                style={{ width: selectedJacket === 'cobalt' ? '96%' : selectedJacket === 'mirror' ? '92%' : '88%' }}
              />
            </div>
            <span style={{ fontSize: '11px', color: '#4ade80', marginTop: '6px', display: 'block' }}>
              ✓ Mukammal gidrofob holat
            </span>
          </div>

          <div className="diag-meter-card">
            <div className="diag-meter-title">Grafen Panjara Butunligi</div>
            <div className="diag-meter-value">
              {selectedJacket === 'cobalt' ? '99.4%' : selectedJacket === 'mirror' ? '98.8%' : '97.6%'}
            </div>
            <div className="diag-meter-bar">
              <div
                className="diag-meter-fill"
                style={{ width: selectedJacket === 'cobalt' ? '99.4%' : selectedJacket === 'mirror' ? '98.8%' : '97.6%' }}
              />
            </div>
            <span style={{ fontSize: '11px', color: '#60a5fa', marginTop: '6px', display: 'block' }}>
              Solid-state diffuziya faol
            </span>
          </div>

          <div className="diag-meter-card">
            <div className="diag-meter-title">Bosib O‘tilgan Masofa</div>
            <div className="diag-meter-value">
              {selectedJacket === 'cobalt' ? '412 km' : selectedJacket === 'mirror' ? '280 km' : '650 km'}
            </div>
            <div className="diag-meter-bar">
              <div className="diag-meter-fill" style={{ width: '60%' }} />
            </div>
            <span style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '6px', display: 'block' }}>
              Toshkent & Olmaota yo‘nalishlari
            </span>
          </div>

          <div className="diag-meter-card">
            <div className="diag-meter-title">Kriptografik NFC Xesh</div>
            <div className="diag-meter-value" style={{ fontSize: '14px', fontFamily: 'monospace', color: '#facc15' }}>
              0x8F9B...26E1
            </div>
            <div className="diag-meter-bar">
              <div className="diag-meter-fill" style={{ width: '100%' }} />
            </div>
            <span style={{ fontSize: '11px', color: '#4ade80', marginTop: '6px', display: 'block' }}>
              ✓ Asllik sertifikati tasdiqlangan
            </span>
          </div>
        </div>
      </div>

      {/* Atmospheric Weather Telemetry Advisory Grid */}
      <div className="nw-weather-grid">
        <div className="nw-weather-head">
          <div>
            <h3>
              {uz ? 'Jonli Iqlim Sensorlari va Kiyim Tavsiyasi' : 'Atmospheric Sensors & Garment Advisory'}
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>
              {uz ? 'Shaharlar bo‘yicha atmosfera bosimi, yog‘ingarchilik va mos kiyim tavsiyasi:' : 'Live microclimate telemetry across 8 metropolises with automated wardrobe advisory:'}
            </p>
          </div>
          <button
            type="button"
            className={`look-chip ${isSimulatedStorm ? 'on' : ''}`}
            onClick={handleStormSimulation}
            style={{ fontSize: '11px' }}
          >
            {isSimulatedStorm ? '⚡ Bo‘ron Simulyatsiyasi Yoqilgan' : '🌩️ Kuchli Bo‘ronni Simulyatsiya Qilish'}
          </button>
        </div>

        <div className="weather-cards-strip">
          {weatherList.map((w) => (
            <div key={w.city} className="weather-station-card">
              <div className="ws-top">
                <span className="ws-city">{w.city}</span>
                <span className="ws-temp">{w.temp}</span>
              </div>
              <div className="ws-condition">{w.weather} · {w.wind} (Namlik: {w.humidity})</div>
              <div className="ws-advisory">{w.advisory}</div>
              <div className="ws-recom">
                <span className="ws-recom-lbl">{uz ? 'Tavsiya qilingan kiyim:' : 'Advisory garment:'}</span>
                <strong>{w.recommendedGarment}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supply Chain & Automated Fabrication Live Metrics */}
      <div style={{ marginTop: '48px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', color: '#fff', fontWeight: 700, marginBottom: '6px' }}>
          🏭 {uz ? 'Ishlab Chiqarish va Ta’minot Zanjiri Telemetriyasi' : 'Supply Chain & Atelier Telemetry'}
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
          {uz
            ? 'Bugungi kunda Toshkent ishlab chiqarish laboratoriyasidagi avtomatlashtirilgan ko‘rsatkichlar:'
            : 'Autonomous daily fabrication output from our Tashkent high-frequency welding atelier:'}
        </p>

        <div className="supply-metrics-grid">
          <div className="supply-metric-card">
            <div className="supply-val">1,480 m</div>
            <div className="supply-lbl">{uz ? 'Bugun to‘qilgan HexaWeave™ mato uzunligi' : 'Graphene membrane rolled today'}</div>
          </div>
          <div className="supply-metric-card">
            <div className="supply-val">98,400</div>
            <div className="supply-lbl">{uz ? 'Ultratovushli germetik tikuvlar (Sonic Welds)' : 'Ultrasonic seam welds executed'}</div>
          </div>
          <div className="supply-metric-card">
            <div className="supply-val">99.4%</div>
            <div className="supply-lbl">{uz ? 'Lazerli sifat nazorati (QC) muvaffaqiyati' : 'Laser optical QC pass rate'}</div>
          </div>
          <div className="supply-metric-card">
            <div className="supply-val">42 min</div>
            <div className="supply-lbl">{uz ? 'Toshkent bo‘ylab o‘rtacha yetkazib berish vaqti' : 'Average Tashkent express courier transit'}</div>
          </div>
        </div>
      </div>

      {/* Real-time Interactive Terminal Console */}
      <div className="nw-console reveal">
        <div className="nw-console-bar">
          <span className="nw-dot" />
          <span className="nw-dot nw-dot-amber" />
          <span className="nw-dot nw-dot-green" />
          <span className="nw-console-title">vantege-wear://telemetry/node-tashkent-hub — live websocket feed</span>
        </div>

        <div className="nw-terminal-controls">
          <div className="terminal-filters">
            {(['ALL', 'TELEMETRY', 'ORDERS', 'SECURITY', 'LOGISTICS'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                className={`terminal-btn ${logFilter === lvl ? 'active' : ''}`}
                onClick={() => setLogFilter(lvl)}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="terminal-btn"
              onClick={() => setIsConsolePaused(!isConsolePaused)}
            >
              {isConsolePaused ? '▶ Davom etish' : '⏸ Pauza'}
            </button>
            <button
              type="button"
              className="terminal-btn"
              onClick={() => setTerminalOutput([])}
            >
              Tozalash
            </button>
          </div>
        </div>

        <ul className="nw-feed" style={{ maxHeight: '240px', overflowY: 'auto' }}>
          {filteredLogs.map((f, k) => (
            <li key={`${f.t}-${k}`} className="nw-feed-item">
              <span className="nw-feed-time">{f.t}</span>
              <span
                className="nw-feed-city"
                style={{
                  background:
                    f.level === 'SECURITY'
                      ? 'rgba(239, 68, 68, 0.2)'
                      : f.level === 'ORDERS'
                      ? 'rgba(34, 197, 94, 0.2)'
                      : 'rgba(59, 130, 246, 0.15)',
                  color: f.level === 'SECURITY' ? '#f87171' : f.level === 'ORDERS' ? '#4ade80' : '#60a5fa',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '4px',
                  padding: '1px 6px',
                  fontSize: '10px',
                }}
              >
                {f.level}
              </span>
              <span className="nw-feed-city">{f.city}</span>
              <span className="nw-feed-msg">{f.msg}</span>
            </li>
          ))}

          {terminalOutput.map((out, idx) => (
            <li key={`cmd-${idx}`} className="nw-feed-item" style={{ color: out.startsWith('>') ? '#60a5fa' : '#4ade80' }}>
              <span className="nw-feed-msg" style={{ fontFamily: 'monospace' }}>{out}</span>
            </li>
          ))}
        </ul>

        {/* Interactive CLI input prompt */}
        <form onSubmit={handleCommandSubmit} className="terminal-input-row">
          <span className="terminal-prompt">vantege-cli&gt;</span>
          <input
            type="text"
            className="terminal-cmd-input"
            placeholder={uz ? 'Buyruq kiriting (masalan: help, status, ping, weather, scan, nodes)...' : 'Type command (e.g. help, status, ping, weather, scan, nodes)...'}
            value={cmdInput}
            onChange={(e) => setCmdInput(e.target.value)}
          />
          <button type="submit" className="terminal-btn" style={{ padding: '4px 10px', color: '#fff' }}>
            Yuborish ↵
          </button>
        </form>
      </div>
    </section>
  );
}
