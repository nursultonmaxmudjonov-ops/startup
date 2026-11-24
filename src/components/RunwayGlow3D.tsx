'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * RunwayGlow3D
 * -------------
 * A lightweight three.js layer behind the runway models:
 *   • reflective floor plane with a moving sheen
 *   • drifting dust particles catching the light
 * Purely decorative — pointer-events none, pauses when tab hidden.
 */
export default function RunwayGlow3D({ toneRef }: { toneRef?: React.RefObject<string> }) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let raf = 0;
    let disposed = false;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      host.clientWidth / Math.max(1, host.clientHeight),
      0.1,
      100
    );
    camera.position.set(0, 1.6, 7.5);
    camera.lookAt(0, -0.6, 0); // push the horizon line lower in frame

    // ── Reflective-ish floor: dark plane + moving sheen texture ──
    const floorGeo = new THREE.PlaneGeometry(40, 40);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x101116,
      roughness: 0.28,
      metalness: 0.85,
      transparent: true,
      opacity: 0.55, // let the CSS reflections show through
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Sheen: additive gradient plane sliding slowly over the floor
    const sheenCanvas = document.createElement('canvas');
    sheenCanvas.width = 256;
    sheenCanvas.height = 64;
    const sc = sheenCanvas.getContext('2d')!;
    const grad = sc.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.22)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    sc.fillStyle = grad;
    sc.fillRect(0, 0, 256, 64);
    const sheenTex = new THREE.CanvasTexture(sheenCanvas);
    const sheen = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 3),
      new THREE.MeshBasicMaterial({
        map: sheenTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.5,
      })
    );
    sheen.rotation.x = -Math.PI / 2;
    sheen.position.y = 0.012;
    scene.add(sheen);

    // ── Dust particles ──
    const COUNT = 220;
    const pos = new Float32Array(COUNT * 3);
    const seed = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = Math.random() * 5.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
      seed[i] = Math.random() * Math.PI * 2;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xaab4d0,
      size: 0.045,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    // ── Spot lights over the stage ──
    const key = new THREE.SpotLight(0xffffff, 55, 30, 0.62, 0.55);
    key.position.set(0, 7.5, 2.5);
    key.target.position.set(0, 0, 0);
    scene.add(key, key.target);

    const rim = new THREE.PointLight(0x5f7dff, 18, 22);
    rim.position.set(-4, 3.2, -3);
    scene.add(rim);

    const startTime = performance.now();
    const tone = new THREE.Color(0x46505e);
    const targetTone = new THREE.Color(0x46505e);
    let toneCss = toneRef?.current ?? '';

    const onResize = () => {
      if (!host.clientWidth) return;
      camera.aspect = host.clientWidth / Math.max(1, host.clientHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    };
    window.addEventListener('resize', onResize);

    const tick = () => {
      if (disposed) return;
      const t = (performance.now() - startTime) * 0.001;

      // sheen slides left→right, loops
      sheen.position.x = ((t * 1.4) % 26) - 13;

      // dust drifts upward, wraps
      const pa = pGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < COUNT; i++) {
        let y = pa.getY(i) + 0.0038;
        if (y > 5.5) y = 0;
        pa.setY(i, y);
        pa.setX(i, pa.getX(i) + Math.sin(t * 0.7 + seed[i]) * 0.0012);
      }
      pa.needsUpdate = true;

      // follow the live glow tone from the runway look
      if (toneRef) {
        if (toneRef.current && toneRef.current !== toneCss) {
          toneCss = toneRef.current;
          const m = toneCss.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (m) targetTone.setRGB(+m[1] / 255, +m[2] / 255, +m[3] / 255);
        }
        tone.lerp(targetTone, 0.03);
        rim.color.copy(tone);
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      pGeo.dispose();
      pMat.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      sheen.geometry.dispose();
      (sheen.material as THREE.Material).dispose();
      sheenTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [toneRef]);

  return <div ref={hostRef} className="runway-glow3d" aria-hidden="true" />;
}
