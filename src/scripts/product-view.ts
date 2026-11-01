import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// One animation clock for all visible products. Each model retains a sharp image fallback.
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const views: {
  element: HTMLElement;
  visible: boolean;
  render: (time: number) => void;
  dispose: () => void;
}[] = [];
let paused = document.documentElement.classList.contains('motion-paused') || preference.matches;
let tick = 0;
let previous = 0;
let elapsed = 0;

function animate(now: number) {
  tick = 0;
  if (document.hidden || paused) {
    previous = 0;
    return;
  }
  elapsed += previous ? Math.min((now - previous) / 1000, 0.05) : 0;
  previous = now;
  views.forEach((view) => {
    if (view.visible) view.render(elapsed);
  });
  if (views.some((view) => view.visible)) tick = requestAnimationFrame(animate);
}
function wake() {
  if (!tick) tick = requestAnimationFrame(animate);
}
document.addEventListener('visibilitychange', wake);
document.addEventListener('parfumaire:motion', (event) => {
  paused = (event as CustomEvent<boolean>).detail;
  wake();
});
preference.addEventListener('change', () => {
  paused = preference.matches;
  views.forEach((view) => view.render(0));
  wake();
});

async function createView(element: HTMLElement) {
  const canvas = element.querySelector<HTMLCanvasElement>('canvas')!;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
  } catch {
    element.dataset.model = 'fallback';
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 20);
  camera.position.set(0, 0.35, 6);
  camera.lookAt(0, 0.35, 0);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = new RoomEnvironment();
  const env = pmrem.fromScene(environment, 0.04);
  scene.environment = env.texture;
  environment.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb1a69c, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 3);
  key.position.set(-3, 4, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xcde8ff, 2);
  rim.position.set(4, 2, -1);
  scene.add(rim);
  const model = new THREE.Group();
  scene.add(model);
  const handle = element.dataset.productView!;
  const tower = handle.startsWith('la-tour');
  const black = tower || handle.includes('max');
  const shell = new THREE.MeshStandardMaterial({
    color: black ? 0x202020 : 0xefefed,
    metalness: black ? 0.65 : 0.25,
    roughness: 0.32,
    envMapIntensity: 0.7,
  });
  const silver = new THREE.MeshStandardMaterial({
    color: 0xbfc1c0,
    metalness: 0.9,
    roughness: 0.23,
  });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.7 });
  const textures: THREE.Texture[] = [];
  const loader = new THREE.TextureLoader();
  async function texture(path: string) {
    const map = await loader.loadAsync(path);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    textures.push(map);
    return map;
  }
  function cylinder(
    radius: number,
    height: number,
    material: THREE.Material,
    x: number,
    y: number,
    z = 0,
  ) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 64), material);
    mesh.position.set(x, y, z);
    model.add(mesh);
    return mesh;
  }
  let nozzle: THREE.Vector3;
  try {
    if (tower) {
      cylinder(0.135, 2.55, shell, 0, 0);
      cylinder(0.29, 0.045, shell, 0, -1.31);
      cylinder(0.17, 0.065, shell, 0, -1.255);
      cylinder(0.137, 0.025, silver, 0, 1.275);
      cylinder(0.12, 0.012, rubber, 0, 1.292);
      cylinder(0.027, 0.018, rubber, 0, 1.308);
      const map = await texture('/images/models/la-tour-mark.webp');
      const badge = new THREE.Mesh(
        new THREE.PlaneGeometry(0.155, 0.09),
        new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false }),
      );
      badge.position.set(0, 1.14, 0.136);
      model.add(badge);
      nozzle = new THREE.Vector3(0, 1.32, 0);
    } else {
      const w = 1.48,
        h = 2,
        d = black ? 0.35 : 0.3;
      const body = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 6, 0.07), shell);
      model.add(body);
      const map = await texture(`/images/models/${handle}-front.webp`);
      // A shallow rounded face carries the actual product's branding and controls.
      const front = new THREE.Mesh(new RoundedBoxGeometry(w - 0.018, h - 0.018, 0.018, 6, 0.025), [
        shell,
        shell,
        shell,
        shell,
        new THREE.MeshBasicMaterial({ map }),
        shell,
      ]);
      front.position.z = d / 2 + 0.002;
      model.add(front);
      for (const x of [-0.52, 0.52])
        for (const z of [-0.08, 0.08]) cylinder(0.055, 0.048, rubber, x, -1.016, z);
      cylinder(0.09, 0.025, silver, 0.4, 1.009);
      cylinder(0.057, 0.11, silver, 0.4, 1.07);
      cylinder(0.064, 0.018, silver, 0.4, 1.134);
      cylinder(0.034, 0.005, rubber, 0.4, 1.145);
      nozzle = new THREE.Vector3(0.4, 1.15, 0);
    }
  } catch {
    renderer.dispose();
    env.dispose();
    element.dataset.model = 'fallback';
    return;
  }
  // Fine, translucent wisps rise from the real nozzle and follow the product rotation.
  const mistCanvas = document.createElement('canvas');
  mistCanvas.width = mistCanvas.height = 64;
  const ctx = mistCanvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,.65)');
  gradient.addColorStop(0.35, 'rgba(245,252,255,.22)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  const mistTexture = new THREE.CanvasTexture(mistCanvas);
  textures.push(mistTexture);
  const wisps = Array.from({ length: 28 }, (_, i) => {
    const material = new THREE.SpriteMaterial({
      map: mistTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.renderOrder = 3;
    model.add(sprite);
    return { sprite, phase: i / 28 };
  });
  let pointerX = 0,
    pointerY = 0,
    yaw = -0.2;
  const interaction = element.closest<HTMLElement>('a') || element;
  const move = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    const box = interaction.getBoundingClientRect();
    pointerX = ((event.clientX - box.left) / box.width - 0.5) * 0.3;
    pointerY = ((event.clientY - box.top) / box.height - 0.5) * 0.12;
  };
  const leave = () => {
    pointerX = pointerY = 0;
  };
  interaction.addEventListener('pointermove', move);
  interaction.addEventListener('pointerleave', leave);
  const hero = element.hasAttribute('data-hero-product');
  function render(time: number) {
    const still = paused;
    const landed = element.hasAttribute('data-grounded')
      ? 1
      : hero
        ? Number(element.dataset.landed || 0)
        : 0;
    const sway = still
      ? 0
      : tower && hero
        ? time * 0.28
        : Math.sin(time * 0.7 + Math.PI) * (tower ? 0.75 : 0.32);
    yaw += ((-0.35 + sway + pointerX) * (1 - landed * 0.65) - yaw) * 0.075;
    model.rotation.set(
      still ? 0 : Math.sin(time * 0.39) * 0.025 + pointerY,
      yaw,
      still ? 0 : (-0.035 + Math.sin(time * 0.43) * 0.04) * (1 - landed),
    );
    // The shared hero follows the exact scroll pose, independently of the idle clock.
    if (element.classList.contains('atmosphere-product') && !still) {
      const flight = Number(element.dataset.flight || 0);
      model.rotation.set(-0.06 * (1 - flight), -0.42 + flight * 0.32, -0.1 * (1 - flight));
    }
    model.position.y = still ? 0 : Math.sin(time * 0.85) * 0.035 * (1 - landed);
    wisps.forEach(({ sprite, phase }) => {
      const life = (time * 0.32 + phase) % 1;
      sprite.position.set(
        nozzle.x + Math.sin(life * 6 + time * 0.55) * life * 0.13,
        nozzle.y + life * 0.68,
        nozzle.z + 0.05 + Math.cos(life * 8 + time) * life * 0.05,
      );
      const size = 0.045 + life * 0.19;
      sprite.scale.set(size, size * 1.4, 1);
      sprite.material.color.setRGB(1 - landed * 0.58, 1 - landed * 0.54, 1 - landed * 0.55);
      sprite.material.opacity = still ? 0 : Math.sin(Math.PI * life) ** 1.5 * (0.27 + landed * 0.1);
    });
    renderer.render(scene, camera);
  }
  function resize() {
    const width = element.clientWidth,
      height = element.clientHeight;
    if (!width || !height) return;
    const aspect = width / height;
    const half = Math.max(tower ? 1.75 : 1.55, (tower ? 0.5 : 0.93) / aspect);
    camera.left = -half * aspect;
    camera.right = half * aspect;
    camera.top = half;
    camera.bottom = -half;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    render(elapsed);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(element);
  resize();
  element.dataset.model = 'ready';
  const view = {
    element,
    visible: true,
    render,
    dispose: () => {
      resizeObserver.disconnect();
      renderer.dispose();
      env.dispose();
      textures.forEach((map) => map.dispose());
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Sprite) {
          if (object instanceof THREE.Mesh) object.geometry.dispose();
          (Array.isArray(object.material) ? object.material : [object.material]).forEach((mat) =>
            mat.dispose(),
          );
        }
      });
      interaction.removeEventListener('pointermove', move);
      interaction.removeEventListener('pointerleave', leave);
    },
  };
  views.push(view);
  wake();
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const element = entry.target as HTMLElement;
      const existing = views.find((view) => view.element === element);
      if (existing) {
        existing.visible = entry.isIntersecting;
        if (entry.isIntersecting) wake();
      } else if (entry.isIntersecting && !element.dataset.model) {
        element.dataset.model = 'loading';
        void createView(element);
      }
    });
  },
  { rootMargin: '150px' },
);
document
  .querySelectorAll<HTMLElement>('[data-product-view]')
  .forEach((element) => observer.observe(element));
window.addEventListener('pagehide', (event) => {
  if (event.persisted) return;
  cancelAnimationFrame(tick);
  observer.disconnect();
  views.forEach((view) => view.dispose());
});
