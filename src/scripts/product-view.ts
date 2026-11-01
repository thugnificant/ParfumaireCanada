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
const active = (element: HTMLElement) =>
  element.dataset.renderMode === 'continuous' || element.dataset.active === 'true';
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
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
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
  for (const v of views) if (v.visible && active(v.element)) v.render(elapsed);
  if (views.some((v) => v.visible && active(v.element))) tick = requestAnimationFrame(animate);
  else previous = 0;
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
  const hero = element.hasAttribute('data-hero-product');
  const business =
    element.classList.contains('business-flight') || element.classList.contains('business-rest');
  const flight =
    element.classList.contains('atmosphere-product') ||
    element.classList.contains('business-flight');
  const office = flight || element.classList.contains('landing-fallback') || business;
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
  // The office is lit by a window on the LEFT. Its floor receives the cabinet's
  // actual silhouette and foot shadows, rather than an unrelated CSS oval.
  const floorMaterial = new THREE.ShadowMaterial({ color: 0x403e34, opacity: 0 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), floorMaterial);
  let contactMaterial: THREE.MeshBasicMaterial | undefined;
  let contactTexture: THREE.CanvasTexture | undefined;
  if (office) {
    model.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        // The thin branded panel sits over the shell; self-shadowing those
        // nearly coincident surfaces introduces stippling in the white finish.
        object.receiveShadow = false;
        for (const material of Array.isArray(object.material)
          ? object.material
          : [object.material]) {
          if (material instanceof THREE.MeshPhysicalMaterial && !tower) {
            // Powder-coated white metal, exposed for this photograph rather than
            // a glossy studio product isolated on white.
            material.roughness = 0.5;
            material.clearcoat = 0.05;
            material.metalness = 0.08;
            if (material.map) material.color.set(0xe4e4df);
          }
        }
      }
    });
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = tower ? -1.334 : -1.041;
    floor.receiveShadow = true;
    floorMaterial.depthWrite = false;
    model.add(floor);
    // Broad, soft ambient occlusion under the cabinet complements the directional
    // shadow. This is a floor-aligned footprint, with the same perspective as its feet.
    const contactMap = document.createElement('canvas');
    contactMap.width = contactMap.height = 256;
    const paint = contactMap.getContext('2d')!;
    paint.filter = 'blur(18px)';
    paint.fillStyle = '#25251e';
    paint.fillRect(36, 36, 184, 184);
    contactTexture = new THREE.CanvasTexture(contactMap);
    contactMaterial = new THREE.MeshBasicMaterial({
      map: contactTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      toneMapped: false,
    });
    const contact = new THREE.Mesh(
      new THREE.PlaneGeometry(tower ? 0.72 : 2.08, tower ? 0.72 : 1.3),
      contactMaterial,
    );
    contact.rotation.x = -Math.PI / 2;
    contact.position.y = tower ? -1.333 : -1.04;
    model.add(contact);
    key.castShadow = true;
    key.shadow.mapSize.set(512, 512);
    key.shadow.camera.left = key.shadow.camera.bottom = -2.5;
    key.shadow.camera.right = key.shadow.camera.top = 2.5;
    key.shadow.camera.near = 0.1;
    key.shadow.camera.far = 20;
    key.shadow.normalBias = 0.015;
    key.shadow.radius = 6;
  }
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
  let width = 0,
    height = 0;
  function render(time: number) {
    if (!width || !height || contextLost) return;
    const landed = element.hasAttribute('data-grounded')
      ? 1
      : hero || business
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
      model.rotation.set(pose.pitch - (business ? 0.09 * pose.depth : 0), pose.yaw, pose.roll);
    }
    if (tower && hero && !flight && !paused) model.rotation.z = 0.2 + Math.sin(time * 0.4) * 0.08;
    if (landed === 1) {
      model.rotation.set(business ? 0.1 : restingPose.pitch, restingPose.yaw, restingPose.roll);
    }
    if (office) {
      const depth = landed === 1 ? 1 : flightAt(Number(element.dataset.flight || 0)).depth;
      key.position.set(-3 - depth, 4 + 3 * depth, 6 + 4 * depth);
      key.color.set(0xfff3db);
      key.intensity = 2.8 - 0.35 * depth;
      fill.intensity = 1.7 - 0.65 * depth;
      rim.intensity = 1.8 - 1.6 * depth;
      scene.environmentIntensity = 1 - 0.65 * depth;
      floorMaterial.opacity = 0.18 * landed;
      if (contactMaterial) contactMaterial.opacity = 0.4 * landed;
      floor.visible = landed > 0;
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
    const dpr = Math.min(
      devicePixelRatio,
      matchMedia('(pointer: coarse)').matches ? 1.5 : 2,
      bufferSize / w,
      bufferSize / h,
    );
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
      if (!office) {
        floor.geometry.dispose();
        floorMaterial.dispose();
      }
      key.shadow.map?.dispose();
      contactTexture?.dispose();
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
      } else if (entry.isIntersecting && active(element) && !element.dataset.model) {
        element.dataset.model = 'loading';
        void createView(element);
      }
    }
  },
  { rootMargin: '100px' },
);
document
  .querySelectorAll<HTMLElement>('[data-product-view]:not([data-render-mode="static"])')
  .forEach((e) => observer.observe(e));
document.addEventListener('parfumaire:activate', (event) => {
  const element = (event as CustomEvent<HTMLElement>).detail;
  if (active(element) && !element.dataset.model) {
    element.dataset.model = 'loading';
    void createView(element);
  }
  wake();
});
addEventListener('pagehide', (event) => {
  if (event.persisted) return;
  cancelAnimationFrame(tick);
  observer.disconnect();
  views.forEach((v) => v.dispose());
  environment?.dispose();
  renderer?.dispose();
});
