// THE GATEWAY — Phase 1: "The Aisle"
// Structured instanced racks (bodies/bezels/aligned LED rows), virtual scroll
// walk down the aisle, RoomEnvironment IBL, bloom (LEDs + far beacon only).
// Scene file per PHASE1_SPEC.md; art direction per SCENE.md.
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

RectAreaLightUniformsLib.init();

// ---------- palette (SCENE.md) ----------
const COL = {
  bg: 0x101318,
  fog: 0x0c0f13,
  accent: 0xd97757,   // reserved: gateway beams + UI (the far beacon)
  ledGreen: 0x2ecc71,
  ledAmber: 0xe67e22,
  ledRed: 0xe74c3c,
  ledIdle: 0x0a3a2a,  // unlit LED sockets
  rack: 0x14171b,
  floor: 0x0b0d10
};

// LED palette entries carry a brightness multiplier so LIT leds cross the
// bloom threshold (0.85 linear luminance) while unlit sockets stay dark.
const LED_PAL = {
  green: { c: new THREE.Color(COL.ledGreen), k: 1.9 },
  amber: { c: new THREE.Color(COL.ledAmber), k: 2.6 },
  red:   { c: new THREE.Color(COL.ledRed),   k: 3.4 },
  off:   { c: new THREE.Color(COL.ledIdle),  k: 1.0 }
};

// healthy rack ≈ 70% green / 20% off / 10% amber
// hot rack     ≈ 40% green / 35% amber / 15% red / 10% off
function rollLed(hot) {
  const r = Math.random();
  if (!hot) return r < 0.70 ? LED_PAL.green : r < 0.90 ? LED_PAL.off : LED_PAL.amber;
  return r < 0.40 ? LED_PAL.green : r < 0.75 ? LED_PAL.amber : r < 0.90 ? LED_PAL.red : LED_PAL.off;
}

// ---------- renderer ----------
const app = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.info.autoReset = false; // HUD reports the whole frame (scene + bloom passes)
app.appendChild(renderer.domElement);

// ---------- scene / fog / camera ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(COL.bg);
scene.fog = new THREE.FogExp2(COL.fog, 0.045); // loosened: the walk reveals depth gradually

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 120);
camera.rotation.order = 'YXZ';

// ---------- lights ----------
// RoomEnvironment IBL fills the blacks; ambient contribution stays low.
const hemi = new THREE.HemisphereLight(0x36414d, 0x05070a, 0.22);
scene.add(hemi);
// Cold service light down the aisle (the "night shift" feel)
const aisle = new THREE.RectAreaLight(0x5a7a8c, 2.2, 2.2, 46);
aisle.position.set(0, 4.6, -12);
aisle.lookAt(0, 0, 8);
scene.add(aisle);

// ---------- materials ----------
const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0e1114, roughness: 0.62, metalness: 0.35 });
const bezelMat = new THREE.MeshStandardMaterial({ color: 0x1d2329, roughness: 0.5, metalness: 0.42 });
const stripMat = new THREE.MeshStandardMaterial({
  color: 0x0e1417, roughness: 0.5, metalness: 0.3,
  emissive: 0x0f4a4a, emissiveIntensity: 0.25   // dim teal service light per rack
});
const ledMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); // per-instance colors carry palette + brightness

// ---------- environment (IBL: RoomEnvironment + PMREM) ----------
{
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.3; // keep the night-shift dark (was washing racks gray)
  pmrem.dispose();
}

// ---------- floor ----------
const floorMat = new THREE.MeshStandardMaterial({ color: COL.floor, roughness: 0.28, metalness: 0.75, envMapIntensity: 0.6 });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(9, 64), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.z = -16;
scene.add(floor);
// subtle floor seams for scale (instanced: 1 draw call)
{
  const seamMat = new THREE.MeshBasicMaterial({ color: 0x11151a });
  const zs = [];
  for (let z = -46; z <= 14; z += 2.4) zs.push(z);
  const seams = new THREE.InstancedMesh(new THREE.PlaneGeometry(9, 0.035), seamMat, zs.length);
  const d = new THREE.Object3D();
  zs.forEach((z, i) => {
    d.position.set(0, 0.002, z);
    d.rotation.set(-Math.PI / 2, 0, 0);
    d.updateMatrix();
    seams.setMatrixAt(i, d.matrix);
  });
  seams.frustumCulled = false;
  scene.add(seams);
}

// ---------- aisle: structured instanced racks ----------
// ~14–18 racks per side over the walk length (z +11 → -35). One InstancedMesh
// each for bodies, bezels and LEDs → the whole aisle is a handful of calls.
const rng = (() => { let s = 20260909; return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; })();

const RACK = { perSide: 16, pitch: 2.9, z0: 10, x: 1.45, unitH: 0.064, W: 0.62, D: 0.9 };
// Aligned LED rows: every unit draws from the SAME x-offset table (structure!)
const LED_XS = [-0.21, -0.12, -0.03, 0.06, 0.15];

const rackDefs = [];
for (let i = 0; i < RACK.perSide; i++) {
  const hot = (i === 3); // the pre-rewrite monolith pair runs hot (Zoho story)
  for (const side of [-1, 1]) {
    rackDefs.push({
      pos: new THREE.Vector3(side * RACK.x, 0, RACK.z0 - i * RACK.pitch),
      rotY: -side * Math.PI / 2, // LED faces look into the aisle
      units: 26 + Math.floor(rng() * 9),
      hot
    });
  }
}

const ledCounts = rackDefs.map(r => Array.from({ length: r.units }, () => 3 + Math.floor(rng() * 3)));
const totalUnits = rackDefs.reduce((a, r) => a + r.units, 0);
const totalLeds = ledCounts.reduce((a, row) => a + row.reduce((x, y) => x + y, 0), 0);

const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const bezelGeo = new THREE.BoxGeometry(RACK.W - 0.06, 0.05, 0.02);
const ledGeo = new THREE.SphereGeometry(0.0055, 6, 5); // real LEDs are tiny; bloom does the glowing

const bodyMesh = new THREE.InstancedMesh(boxGeo, bodyMat, rackDefs.length);
const stripMesh = new THREE.InstancedMesh(boxGeo, stripMat, rackDefs.length);
const bezelMesh = new THREE.InstancedMesh(bezelGeo, bezelMat, totalUnits);
const ledMesh = new THREE.InstancedMesh(ledGeo, ledMat, totalLeds);
for (const m of [bodyMesh, stripMesh, bezelMesh, ledMesh]) m.frustumCulled = false;

const ledHealth = new Uint8Array(totalLeds); // 0 healthy · 1 hot (for twinkle re-rolls)
{
  const dummy = new THREE.Object3D();
  const tmpC = new THREE.Color();
  const q = new THREE.Quaternion();
  const offset = new THREE.Vector3();
  let bi = 0, si = 0, fi = 0, li = 0;

  for (let r = 0; r < rackDefs.length; r++) {
    const def = rackDefs[r];
    const H = def.units * RACK.unitH + 0.12;
    q.setFromEuler(new THREE.Euler(0, def.rotY, 0));

    // body
    dummy.quaternion.copy(q);
    offset.set(0, H / 2, 0).applyQuaternion(q);
    dummy.position.copy(def.pos).add(offset);
    dummy.scale.set(RACK.W, H, RACK.D);
    dummy.updateMatrix();
    bodyMesh.setMatrixAt(bi++, dummy.matrix);

    // per-rack emissive service strip (top front edge)
    dummy.quaternion.copy(q);
    offset.set(0, H - 0.016, RACK.D / 2 + 0.006).applyQuaternion(q);
    dummy.position.copy(def.pos).add(offset);
    dummy.scale.set(RACK.W, 0.024, 0.03);
    dummy.updateMatrix();
    stripMesh.setMatrixAt(si++, dummy.matrix);

    for (let u = 0; u < def.units; u++) {
      const y = 0.07 + u * RACK.unitH;

      // per-unit bezel face (thin lighter strip: units read as servers)
      dummy.quaternion.copy(q);
      offset.set(0, y, RACK.D / 2 + 0.011).applyQuaternion(q);
      dummy.position.copy(def.pos).add(offset);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      bezelMesh.setMatrixAt(fi++, dummy.matrix);

      // aligned LED row: fixed count 3–5, same x-offsets as every other unit
      for (let k = 0; k < ledCounts[r][u]; k++) {
        dummy.quaternion.copy(q);
        offset.set(LED_XS[k], y + 0.004, RACK.D / 2 + 0.024).applyQuaternion(q);
        dummy.position.copy(def.pos).add(offset);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        ledMesh.setMatrixAt(li, dummy.matrix);
        const roll = rollLed(def.hot);
        ledMesh.setColorAt(li, tmpC.copy(roll.c).multiplyScalar(roll.k));
        ledHealth[li] = def.hot ? 1 : 0;
        li++;
      }
    }
  }
  bodyMesh.instanceMatrix.needsUpdate = true;
  stripMesh.instanceMatrix.needsUpdate = true;
  bezelMesh.instanceMatrix.needsUpdate = true;
  ledMesh.instanceMatrix.needsUpdate = true;
}
scene.add(bodyMesh, stripMesh, bezelMesh, ledMesh);

// LED twinkle: update ~1% of instance colors per frame via instanceColor
const twinkleColor = new THREE.Color();
function twinkle() {
  const n = Math.max(1, Math.round(ledMesh.count * 0.01));
  for (let j = 0; j < n; j++) {
    const i = (Math.random() * ledMesh.count) | 0;
    const roll = rollLed(ledHealth[i] === 1);
    ledMesh.setColorAt(i, twinkleColor.copy(roll.c).multiplyScalar(roll.k));
  }
  if (ledMesh.instanceColor) ledMesh.instanceColor.needsUpdate = true;
}

// ---------- ceiling: dark plane + cable trays (instanced) ----------
// continuous cable trays: two long runs flush to the ceiling (industrial, not stickers)
{
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(9, 64), new THREE.MeshStandardMaterial({ color: 0x080a0d, roughness: 0.95 }));
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, 4.4, -16);
  scene.add(ceil);

  const trayMat = new THREE.MeshStandardMaterial({ color: 0x14181d, roughness: 0.55, metalness: 0.5 });
  for (const x of [-0.7, 0.7]) {
    const run = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 62), trayMat);
    run.position.set(x, 4.33, -16);
    scene.add(run);
  }
}

// ---------- the one accent moment: warm beacon far down the aisle ----------
// Moved z=-26 → z=-45: the walk ends before it — it stays the "someday" light.
const glow = new THREE.PointLight(COL.accent, 60, 34, 2);
glow.position.set(0, 1.6, -45);
scene.add(glow);
const bulb = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 24, 24),
  new THREE.MeshBasicMaterial({ color: new THREE.Color(COL.accent).multiplyScalar(4) })
);
bulb.position.copy(glow.position);
scene.add(bulb);

// ---------- camera path (shared by loop + QA shots) ----------
const clamp01 = v => Math.min(1, Math.max(0, v));
// current=0 → z=+11 (entry) · current=1 → z=-35 (near the core beacon)
function cameraAt(current, yaw = 0, pitch = 0) {
  const c = clamp01(current);
  // gentle side-sway while walking (hand-held feel, not railcar);
  // three half-swings across the aisle, zero at both ends of the walk
  const sway = 0.18 * Math.sin(c * Math.PI * 3);
  camera.position.set(sway, 1.6, 11 - 46 * c);
  camera.rotation.set(pitch - 0.035, yaw, 0); // base pitch: floor-weighted framing
}

// ---------- virtual scroll: wheel / touch / keys feed one target ----------
let target = 0, current = 0;
let parYaw = 0, parPitch = 0, parYawT = 0, parPitchT = 0;

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let reduced = motionQuery.matches;
motionQuery.addEventListener?.('change', e => { reduced = e.matches; });
const coarse = window.matchMedia('(pointer: coarse)').matches; // touch: no parallax

const hint = document.getElementById('hint');
let hintGone = false;
function dismissHint() {
  if (hintGone || !hint) return;
  hintGone = true;
  hint.style.transition = 'opacity .6s ease';
  hint.style.opacity = '0';
  setTimeout(() => hint.remove(), 700);
}
function nudgeScroll(d) {
  target = clamp01(target + d);
  dismissHint();
}

window.addEventListener('wheel', e => {
  e.preventDefault();
  const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
  nudgeScroll(dy * 0.00045);
}, { passive: false });

window.addEventListener('keydown', e => {
  const step = { ArrowDown: 0.08, PageDown: 0.25, ' ': 0.25, ArrowUp: -0.08, PageUp: -0.25 }[e.key];
  if (step !== undefined) { e.preventDefault(); nudgeScroll(step); }
});

let touchY = null;
window.addEventListener('touchstart', e => {
  if (e.touches.length === 1) { touchY = e.touches[0].clientY; dismissHint(); }
}, { passive: true });
window.addEventListener('touchmove', e => {
  if (e.touches.length !== 1 || touchY === null) return;
  e.preventDefault();
  const y = e.touches[0].clientY;
  nudgeScroll((touchY - y) * 0.0022);
  touchY = y;
}, { passive: false });

// mouse parallax look offset, ±0.25 rad max (desktop only)
if (!coarse) {
  window.addEventListener('mousemove', e => {
    parYawT = -((e.clientX / window.innerWidth) * 2 - 1) * 0.25;
    parPitchT = -((e.clientY / window.innerHeight) * 2 - 1) * 0.25;
  });
}

// ---------- QA hooks (behind ?shots=1; shot plan + helper imported lazily) ----------
const params = new URLSearchParams(location.search);
const shots = [];
if (params.has('shots')) {
  window.__QA = {
    cameraAt,
    async shoot() {
      const { captureShots } = await import('./qa-shots.js');
      const SHOT_PLAN = [
        { name: 'w00', scroll: 0 },
        { name: 'w25', scroll: 0.25 },
        { name: 'w50', scroll: 0.5 },
        { name: 'w75', scroll: 0.75 },
        { name: 'w100', scroll: 1 },
        { name: 'rack-close', pos: [0.12, 1.32, 1.3], look: [1.45, 1.12, 1.3] } // frontal: hot rack LED rows head-on (z≈1.3)
      ];
      await captureShots({ renderer, composer, camera, cameraAt }, SHOT_PLAN, shots);
      cameraAt(current, parYaw, parPitch); // restore live pose
      return shots;
    }
  };
}

// ---------- post: bloom only for LEDs + beacon, OutputPass last ----------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.38,  // strength (was blowing LEDs into orbs)
  0.35,  // radius
  0.88   // threshold — only LEDs + the core beacon cross it
));
composer.addPass(new OutputPass());

// ---------- loop ----------
let frames = 0, t0 = performance.now(), lastFps = 60;
let lastT = performance.now();
cameraAt(current);

renderer.setAnimationLoop(now => {
  const dt = Math.min(0.05, Math.max(0.0001, (now - lastT) / 1000));
  lastT = now;
  const t = now / 1000;

  // eased follow (reduced motion: jump straight to target)
  current = reduced ? target : current + (target - current) * Math.min(1, dt * 3);

  // eased parallax look (desktop only)
  if (!reduced && !coarse) {
    parYaw += (parYawT - parYaw) * Math.min(1, dt * 3);
    parPitch += (parPitchT - parPitch) * Math.min(1, dt * 3);
  }

  cameraAt(current, parYaw, parPitch);

  // slow beacon pulse: scale 1 ± 0.04 sin t
  bulb.scale.setScalar(1 + 0.04 * Math.sin(t * 0.9));

  if (!reduced) twinkle();

  frames++;
  renderer.info.reset();
  composer.render();

  if (frames % 30 === 0) {
    const nowMs = performance.now();
    lastFps = Math.round((frames * 1000) / (nowMs - t0));
    frames = 0; t0 = nowMs;
    const q = document.getElementById('q');
    if (q) q.textContent = `${lastFps} fps · ${renderer.info.render.calls} draw calls · ${renderer.info.render.triangles.toLocaleString()} tris`;
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
