"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  buildParticleData,
  easeOutCubic,
  clamp,
  lerp,
} from "@/lib/particleGeometry";
import styles from "./ParticleSphere.module.css";

interface ParticleSphereProps {
  scrollProgress: number;
}

const PARTICLE_COLORS = ["#D4AF37", "#C5A55A", "#B8972E", "#E8D5A3"];
const RADIUS = 92;

export default function ParticleSphere({ scrollProgress }: ParticleSphereProps) {
  const containerRef    = useRef<HTMLDivElement>(null);
  const rafRef          = useRef<number>(0);
  const scrollRef       = useRef(0);
  const particleDataRef = useRef<ReturnType<typeof buildParticleData> | null>(null);
  const meshGroupsRef   = useRef<THREE.InstancedMesh[]>([]);
  const dummy           = useRef(new THREE.Object3D()).current;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const screenW = window.innerWidth;
    const isMobile = screenW < 768;
    const count    = isMobile ? 2800 : 5600;

    // ── Scene / camera / renderer ──────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 2000);
    // Push camera back on narrow screens so the sphere fits
    const cameraZ = screenW <= 375 ? 520
                  : screenW <= 425 ? 490
                  : screenW <= 480 ? 460
                  : isMobile       ? 430
                  : screenW <= 1024 ? 380
                  : 350;
    camera.position.z = cameraZ;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ── Particle data ──────────────────────────────────────────────────────
    const data = buildParticleData(count, RADIUS);
    particleDataRef.current = data;

    // ── One InstancedMesh per gold tone ────────────────────────────────────
    // depthWrite: false so back-hemisphere pieces show through front ones,
    // giving the "invisible sphere blob" translucent feel.
    const perGroup = Math.ceil(count / PARTICLE_COLORS.length);
    const geometry = new THREE.PlaneGeometry(3.0, 1.9);
    const meshes: THREE.InstancedMesh[] = [];

    PARTICLE_COLORS.forEach((hex, gi) => {
      const mat = new THREE.MeshBasicMaterial({
        color:      new THREE.Color(hex),
        side:       THREE.DoubleSide,
        transparent: true,
        opacity:    0.72,
        depthWrite: false,   // layers stack without z-fighting → see-through sphere
      });
      const start      = gi * perGroup;
      const groupCount = Math.min(perGroup, count - start);
      const mesh       = new THREE.InstancedMesh(geometry, mat, groupCount);
      mesh.userData.startIndex = start;
      scene.add(mesh);
      meshes.push(mesh);
    });
    meshGroupsRef.current = meshes;

    // ── Resize observer ────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);

    // ── Animate loop ───────────────────────────────────────────────────────
    function animate() {
      rafRef.current = requestAnimationFrame(animate);

      const now  = performance.now();
      const t    = now * 0.001;               // seconds
      const p    = scrollRef.current;
      const phase1 = clamp(p / 0.4);          // 0→1 during first 40% scroll

      const {
        originPositions,
        explosionTargets,
        speedFactors,
        explosionRotations,
        orbitAxes,
        orbitSpeeds,
        wobbleFrequencies,
        wobblePhases,
        wobbleAmplitudes,
        wobbleAxes,
        scales,
        initialRotations,
        count: N,
      } = data;

      for (let gi = 0; gi < meshes.length; gi++) {
        const mesh       = meshes[gi];
        const startIndex = mesh.userData.startIndex as number;
        const groupCount = mesh.count;

        for (let li = 0; li < groupCount; li++) {
          const i = startIndex + li;
          if (i >= N) break;

          const ox = originPositions[i * 3];
          const oy = originPositions[i * 3 + 1];
          const oz = originPositions[i * 3 + 2];

          // ── Rodrigues' rotation — orbit each piece around its own axis ──
          // Keeps the piece exactly on the sphere surface while it spins.
          // P' = P·cosθ + (A×P)·sinθ + A·(A·P)·(1−cosθ)
          const angle = orbitSpeeds[i] * t;
          const cosA  = Math.cos(angle);
          const sinA  = Math.sin(angle);
          const ax    = orbitAxes[i * 3];
          const ay    = orbitAxes[i * 3 + 1];
          const az    = orbitAxes[i * 3 + 2];
          const dot   = ax * ox + ay * oy + az * oz;

          const rx = ox * cosA + (ay * oz - az * oy) * sinA + ax * dot * (1 - cosA);
          const ry = oy * cosA + (az * ox - ax * oz) * sinA + ay * dot * (1 - cosA);
          const rz = oz * cosA + (ax * oy - ay * ox) * sinA + az * dot * (1 - cosA);

          // ── Subtle wobble on top of orbit ──────────────────────────────
          const wave = Math.sin(wobbleFrequencies[i] * t * Math.PI * 2 + wobblePhases[i]);
          const amp  = wobbleAmplitudes[i] * wave;
          const cx   = rx + wobbleAxes[i * 3]     * amp;
          const cy   = ry + wobbleAxes[i * 3 + 1] * amp;
          const cz   = rz + wobbleAxes[i * 3 + 2] * amp;

          // ── Explosion blend ────────────────────────────────────────────
          const explodeT = easeOutCubic(clamp(phase1 * speedFactors[i]));
          dummy.position.set(
            lerp(cx, explosionTargets[i * 3],     explodeT),
            lerp(cy, explosionTargets[i * 3 + 1], explodeT),
            lerp(cz, explosionTargets[i * 3 + 2], explodeT),
          );

          // ── Piece self-rotation: live spin → locked tumble on explode ──
          const liveRx = initialRotations[i * 3]     + orbitAxes[i * 3]     * angle;
          const liveRy = initialRotations[i * 3 + 1] + orbitAxes[i * 3 + 1] * angle;
          const liveRz = initialRotations[i * 3 + 2] + orbitAxes[i * 3 + 2] * angle;

          dummy.rotation.set(
            lerp(liveRx, explosionRotations[i * 3]     * explodeT, explodeT),
            lerp(liveRy, explosionRotations[i * 3 + 1] * explodeT, explodeT),
            lerp(liveRz, explosionRotations[i * 3 + 2] * explodeT, explodeT),
          );

          dummy.scale.setScalar(scales[i]);
          dummy.updateMatrix();
          mesh.setMatrixAt(li, dummy.matrix);
        }

        mesh.instanceMatrix.needsUpdate = true;
      }

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      renderer.dispose();
      geometry.dispose();
      meshes.forEach((m) => (m.material as THREE.Material).dispose());
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Sync scroll + fade out particles in phase 2 (same window as before)
  useEffect(() => {
    scrollRef.current = scrollProgress;
    const fadeT = clamp((scrollProgress - 0.4) / 0.3);
    meshGroupsRef.current.forEach((mesh) => {
      (mesh.material as THREE.MeshBasicMaterial).opacity = 0.72 * (1 - fadeT);
    });
  }, [scrollProgress]);

  return <div ref={containerRef} className={styles.canvas} />;
}
