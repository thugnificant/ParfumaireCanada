import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Dimensions come from the original catalog; the fragrance bottle profile follows
// the supplied 120 ml product photographs. Branding is sampled from approved renders.
export async function buildProduct(handle: string, finish?: string, batchAirflow = false) {
  const model = new THREE.Group();
  const tower = handle.startsWith('la-tour');
  const box = handle.startsWith('cozyair');
  const max = handle.includes('max');
  const black = tower || (max && finish !== 'white');
  const textures: THREE.Texture[] = [];
  const loader = new THREE.TextureLoader();
  async function texture(url: string) {
    const map = await loader.loadAsync(url);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    textures.push(map);
    return map;
  }
  const shell = new THREE.MeshPhysicalMaterial({
    color: black ? 0x17191a : 0xe9e9e7,
    metalness: black ? 0.65 : 0.22,
    roughness: 0.28,
    clearcoat: 0.3,
    envMapIntensity: 0.8,
  });
  const silver = new THREE.MeshStandardMaterial({
    color: 0xc5c8ca,
    metalness: 0.95,
    roughness: 0.2,
  });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.6 });
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
  let nozzle: THREE.Vector3 | undefined;
  if (tower) {
    cylinder(0.118, 2.55, shell, 0, 0);
    cylinder(0.27, 0.045, shell, 0, -1.31);
    cylinder(0.15, 0.065, shell, 0, -1.255);
    cylinder(0.12, 0.025, silver, 0, 1.275);
    cylinder(0.106, 0.012, rubber, 0, 1.292);
    cylinder(0.027, 0.018, rubber, 0, 1.308);
    const badge = new THREE.Mesh(
      new THREE.PlaneGeometry(0.155, 0.09),
      new THREE.MeshStandardMaterial({
        map: await texture('/images/models/la-tour-mark.webp'),
        transparent: true,
        depthWrite: false,
        metalness: 0.4,
        roughness: 0.4,
      }),
    );
    badge.position.set(0, 1.14, 0.119);
    model.add(badge);
    nozzle = new THREE.Vector3(0, 1.32, 0);
  } else if (box) {
    const w = max ? (2 * 15.125) / 18.375 : (2 * 6.375) / 9.75;
    const d = max ? (2 * 9) / 18.375 : (2 * 3.75) / 9.75;
    model.add(new THREE.Mesh(new RoundedBoxGeometry(w, 2, d, 6, 0.065), shell));
    const faceHandle = black ? 'cozyair-max-scent-diffuser' : 'cozyair-scent-diffuser';
    const face = new THREE.MeshPhysicalMaterial({
      map: await texture(`/images/models/${faceHandle}-front.webp`),
      color: 0xc4c4c4,
      roughness: 0.33,
      metalness: 0.12,
      clearcoat: 0.3,
      envMapIntensity: 0.55,
    });
    const front = new THREE.Mesh(new RoundedBoxGeometry(w - 0.018, 1.982, 0.018, 6, 0.025), [
      shell,
      shell,
      shell,
      shell,
      face,
      shell,
    ]);
    front.position.z = d / 2 + 0.002;
    model.add(front);
    for (const x of [-w * 0.36, w * 0.36])
      for (const z of [-d * 0.34, d * 0.34]) cylinder(0.055, 0.048, rubber, x, -1.016, z);
    cylinder(0.09, 0.025, silver, w * 0.27, 1.009);
    cylinder(0.057, 0.11, silver, w * 0.27, 1.07);
    cylinder(0.064, 0.018, silver, w * 0.27, 1.134);
    cylinder(0.034, 0.005, rubber, w * 0.27, 1.145);
    nozzle = new THREE.Vector3(w * 0.27, 1.15, 0);
  } else {
    const profile = [
      [0, -1.26],
      [0.25, -1.26],
      [0.32, -1.245],
      [0.351, -1.2],
      [0.36, -1.1],
      [0.36, 0.43],
      [0.354, 0.57],
      [0.33, 0.7],
      [0.28, 0.82],
      [0.19, 0.96],
      [0.153, 1.02],
      [0.15, 1.13],
      [0, 1.13],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const glass = new THREE.MeshPhysicalMaterial({
      color: 0x10071e,
      metalness: 0.14,
      roughness: 0.13,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      envMapIntensity: 1.4,
    });
    model.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 96), glass));
    cylinder(0.17, 0.035, rubber, 0, 1.06);
    cylinder(0.174, 0.22, rubber, 0, 1.195);
    cylinder(0.165, 0.035, rubber, 0, 1.315);
    for (let i = 0; i < 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.204, 0.01), rubber);
      rib.position.set(Math.sin(angle) * 0.175, 1.195, Math.cos(angle) * 0.175);
      rib.rotation.y = angle;
      model.add(rib);
    }
    const label = new THREE.Mesh(
      new THREE.CylinderGeometry(0.363, 0.363, 0.25, 48, 1, true, -1.1, 2.2),
      new THREE.MeshStandardMaterial({
        map: await texture('/images/models/fragrance-mark.webp'),
        transparent: true,
        depthWrite: false,
        metalness: 0.65,
        roughness: 0.3,
        color: 0xffe3a0,
      }),
    );
    label.position.y = 0.26;
    model.add(label);
  }
  const wisps: { sprite: THREE.Sprite; phase: number }[] = [];
  let airflowMaterial: THREE.ShaderMaterial | undefined;
  if (nozzle) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,.8)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,.3)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    const map = new THREE.CanvasTexture(canvas);
    textures.push(map);
    if (batchAirflow) {
      // All wisps share one draw call on phones. Billboard expansion happens
      // in the vertex shader instead of updating 36 separate scene objects.
      const plane = new THREE.PlaneGeometry(1, 1);
      const geometry = new THREE.InstancedBufferGeometry();
      geometry.setIndex(plane.getIndex());
      geometry.setAttribute('position', plane.getAttribute('position'));
      geometry.setAttribute('uv', plane.getAttribute('uv'));
      geometry.setAttribute(
        'phase',
        new THREE.InstancedBufferAttribute(
          Float32Array.from({ length: 36 }, (_, i) => i / 36),
          1,
        ),
      );
      geometry.instanceCount = 36;
      airflowMaterial = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          mistMap: { value: map },
          time: { value: 0 },
          strength: { value: 0 },
          nozzle: { value: nozzle },
        },
        vertexShader: `
          attribute float phase;
          uniform float time;
          uniform float strength;
          uniform vec3 nozzle;
          varying vec2 vUv;
          varying float vOpacity;
          void main() {
            float life = fract(time * 0.29 + phase);
            vec3 center = nozzle + vec3(sin(life * 6.0 + time * 0.55) * life * 0.13, life * 0.76, 0.05 + cos(life * 8.0 + time) * life * 0.05);
            vec4 viewPosition = modelViewMatrix * vec4(center, 1.0);
            float size = 0.042 + life * 0.18;
            viewPosition.xy += position.xy * vec2(size, size * 1.8);
            gl_Position = projectionMatrix * viewPosition;
            vUv = uv;
            vOpacity = pow(sin(3.14159265 * life), 1.5) * strength;
          }`,
        fragmentShader: `
          uniform sampler2D mistMap;
          varying vec2 vUv;
          varying float vOpacity;
          void main() {
            gl_FragColor = vec4(vec3(1.0), texture2D(mistMap, vUv).a * vOpacity);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
      });
      const mist = new THREE.Mesh(geometry, airflowMaterial);
      mist.userData.airflow = true;
      mist.renderOrder = 3;
      mist.frustumCulled = false;
      model.add(mist);
    } else
      for (let i = 0; i < 36; i++) {
        const sprite = new THREE.Sprite(
          new THREE.SpriteMaterial({ map, transparent: true, opacity: 0, depthWrite: false }),
        );
        sprite.renderOrder = 3;
        model.add(sprite);
        wisps.push({ sprite, phase: i / 36 });
      }
  }
  function airflow(time: number, landed: number, still: boolean) {
    if (!nozzle) return;
    if (airflowMaterial) {
      airflowMaterial.uniforms.time.value = time;
      airflowMaterial.uniforms.strength.value = still ? 0 : 0.4 + landed * 0.13;
      return;
    }
    for (const { sprite, phase } of wisps) {
      const life = (time * 0.29 + phase) % 1;
      sprite.position.set(
        nozzle.x + Math.sin(life * 6 + time * 0.55) * life * 0.13,
        nozzle.y + life * 0.76,
        nozzle.z + 0.05 + Math.cos(life * 8 + time) * life * 0.05,
      );
      const size = 0.042 + life * 0.18;
      sprite.scale.set(size, size * 1.8, 1);
      (sprite.material as THREE.SpriteMaterial).color.setRGB(1, 1, 1);
      (sprite.material as THREE.SpriteMaterial).opacity = still
        ? 0
        : Math.sin(Math.PI * life) ** 1.5 * (0.4 + landed * 0.13);
    }
  }
  function dispose() {
    textures.forEach((t) => t.dispose());
    const materials = new Set<THREE.Material>();
    model.traverse((o) => {
      if (o instanceof THREE.Mesh || o instanceof THREE.Sprite) {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => materials.add(m));
      }
    });
    materials.forEach((m) => m.dispose());
  }
  return {
    model,
    tower,
    box,
    half: tower ? 1.75 : 1.55,
    center: box || tower ? 0.35 : 0.08,
    airflow,
    dispose,
  };
}
