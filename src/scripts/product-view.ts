import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildProduct } from './product-model';
import { flightAt, restingPose } from '../lib/flight';

// All catalog views share ONE WebGL context. Each visible canvas receives its
// rendered viewport, so scrolling through 21 products cannot exhaust GPU contexts.
const preference = matchMedia('(prefers-reduced-motion: reduce)');
let paused = preference.matches || document.documentElement.classList.contains('motion-paused');
let renderer: THREE.WebGLRenderer | undefined;
let contextLost = false;
const visibility = new WeakMap<HTMLElement, boolean>();
let environment: THREE.WebGLRenderTarget;
const bufferSize = 2048;
const views: {
  element: HTMLElement;
  visible: boolean;
  render: (time: number) => void;
  dispose: () => void;
}[] = [];
let tick = 0,
  previous = 0,
  elapsed = 0;
function gpu() {
  if (renderer) return renderer;
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  });
  renderer.setSize(bufferSize, bufferSize, false);
  renderer.setClearColor(0, 0);
  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    contextLost = true;
    for (const view of views) view.element.dataset.model = 'fallback';
  });
  renderer.domElement.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    for (const view of views) if (view.visible) view.render(elapsed);
    wake();
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  const generator = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  environment = generator.fromScene(room, 0.04);
  room.dispose();
  generator.dispose();
  renderer.setScissorTest(true);
  return renderer;
}
function animate(now: number) {
  tick = 0;
  if (document.hidden || paused || contextLost) {
    previous = 0;
    return;
  }
  elapsed += previous ? Math.min((now - previous) / 1000, 0.05) : 0;
  previous = now;
  for (const v of views) if (v.visible) v.render(elapsed);
  if (views.some((v) => v.visible)) tick = requestAnimationFrame(animate);
}
function wake() {
  if (!tick) tick = requestAnimationFrame(animate);
}
function motion(value: boolean) {
  paused = value;
  for (const v of views) if (v.visible) v.render(elapsed);
  wake();
}
document.addEventListener('visibilitychange', wake);
document.addEventListener('parfumaire:motion', (e) => motion((e as CustomEvent<boolean>).detail));
preference.addEventListener('change', () => motion(preference.matches));
async function createView(element: HTMLElement) {
  const canvas = element.querySelector<HTMLCanvasElement>('canvas')!;
  const ctx = canvas.getContext('2d', { alpha: true })!;
  let gl: THREE.WebGLRenderer, product: Awaited<ReturnType<typeof buildProduct>>;
  try {
    gl = gpu();
    product = await buildProduct(element.dataset.productView!, element.dataset.finish);
  } catch {
    element.dataset.model = 'fallback';
    return;
  }
  const { model, tower, box, half, center } = product;
  const scene = new THREE.Scene();
  scene.environment = environment.texture;
  scene.add(model);
  const fill = new THREE.HemisphereLight(0xffffff, 0xb1a69c, 1.7);
  scene.add(fill);
  const key = new THREE.DirectionalLight(0xffffff, 2.8);
  key.position.set(-3, 4, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xd5eaff, 1.8);
  rim.position.set(4, 2, -1);
  scene.add(rim);
  const camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 20);
  camera.position.set(0, center, 6);
  camera.lookAt(0, center, 0);
  let pointerX = 0,
    pointerY = 0,
    yaw = -0.32;
  const interaction = element.closest<HTMLElement>('a') || element;
  const move = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    const r = interaction.getBoundingClientRect();
    pointerX = ((e.clientX - r.left) / r.width - 0.5) * 0.4;
    pointerY = ((e.clientY - r.top) / r.height - 0.5) * 0.12;
  };
  const leave = () => {
    pointerX = pointerY = 0;
  };
  interaction.addEventListener('pointermove', move);
  interaction.addEventListener('pointerleave', leave);
  const hero = element.hasAttribute('data-hero-product');
  const flight = element.classList.contains('atmosphere-product');
  let width = 0,
    height = 0;
  function render(time: number) {
    if (!width || !height || contextLost) return;
    const landed = element.hasAttribute('data-grounded')
      ? 1
      : hero
        ? Number(element.dataset.landed || 0)
        : 0;
    const sway = paused ? 0 : Math.sin(time * 0.55) * (tower ? 0.65 : 0.25);
    const target = landed ? -0.24 : -0.32 + sway + pointerX;
    // Reduced motion is deterministic, including repeated resize/visibility callbacks.
    yaw = paused ? -0.32 : yaw + (target - yaw) * 0.09;
    model.rotation.set(
      paused ? 0 : Math.sin(time * 0.39) * 0.035 + pointerY,
      yaw,
      paused ? 0 : (-0.035 + Math.sin(time * 0.43) * 0.035) * (1 - landed),
    );
    if (flight && !paused) {
      const p = Number(element.dataset.flight || 0);
      const pose = flightAt(p);
      model.rotation.set(pose.pitch, pose.yaw, pose.roll);
      key.position.x = -3 + 7 * pose.depth;
      key.intensity = 2.8 - 0.7 * pose.depth;
      fill.intensity = 1.7 - 0.4 * pose.depth;
      scene.environmentIntensity = 1 - 0.25 * pose.depth;
    }
    if (tower && hero && !paused) model.rotation.z = 0.2 + Math.sin(time * 0.4) * 0.08;
    if (landed === 1) {
      model.rotation.set(restingPose.pitch, restingPose.yaw, restingPose.roll);
      key.position.x = 4;
      key.intensity = 2.1;
      fill.intensity = 1.3;
      scene.environmentIntensity = 0.75;
    }
    // Once released, every part of the hero pose comes from scroll position.
    // Idle time cannot move the feet away from their photographed floor anchor.
    model.position.y = paused || flight ? 0 : Math.sin(time * 0.85) * 0.025 * (1 - landed);
    product.airflow(time, landed, paused);
    gl.setViewport(0, 0, width, height);
    gl.setScissor(0, 0, width, height);
    gl.clear();
    gl.render(scene, camera);
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(gl.domElement, 0, bufferSize - height, width, height, 0, 0, width, height);
    if (element.dataset.model !== 'ready') element.dataset.model = 'ready';
  }
  function resize() {
    const w = element.clientWidth,
      h = element.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(devicePixelRatio, 2, bufferSize / w, bufferSize / h);
    width = Math.round(w * dpr);
    height = Math.round(h * dpr);
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    const aspect = w / h;
    const extent = Math.max(half, (box ? 0.98 : 0.5) / aspect);
    camera.left = -extent * aspect;
    camera.right = extent * aspect;
    camera.top = extent;
    camera.bottom = -extent;
    camera.updateProjectionMatrix();
    render(elapsed);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(element);
  resize();
  element.dataset.model = 'ready';
  views.push({
    element,
    visible: visibility.get(element) ?? false,
    render,
    dispose: () => {
      resizeObserver.disconnect();
      product.dispose();
      interaction.removeEventListener('pointermove', move);
      interaction.removeEventListener('pointerleave', leave);
    },
  });
  wake();
}
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      const element = entry.target as HTMLElement;
      visibility.set(element, entry.isIntersecting);
      const view = views.find((v) => v.element === element);
      if (view) {
        view.visible = entry.isIntersecting;
        if (view.visible) {
          view.render(elapsed);
          wake();
        }
      } else if (entry.isIntersecting && !element.dataset.model) {
        element.dataset.model = 'loading';
        void createView(element);
      }
    }
  },
  { rootMargin: '100px' },
);
document.querySelectorAll<HTMLElement>('[data-product-view]').forEach((e) => observer.observe(e));
addEventListener('pagehide', (event) => {
  if (event.persisted) return;
  cancelAnimationFrame(tick);
  observer.disconnect();
  views.forEach((v) => v.dispose());
  environment?.dispose();
  renderer?.dispose();
});
