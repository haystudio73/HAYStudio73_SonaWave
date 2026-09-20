import * as THREE from 'three';
import { StereoEffect } from 'three/examples/jsm/effects/StereoEffect.js';
import { AnaglyphEffect } from 'three/examples/jsm/effects/AnaglyphEffect.js';
import { ParticleConfig } from '../types';

interface RainParticle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  speed: number;
  length: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  hue: number;
}

interface SplashRipple3D {
  x: number;
  y: number;
  z: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  life: number;
}

interface GlassDroplet3D {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  trickleSpeed: number;
  mesh: THREE.Mesh;
  type: 'droplet' | 'streak' | 'condensation';
  trailPoints: { x: number; y: number; r: number; alpha: number }[];
  trailLine?: THREE.Line;
  nextGlideTime: number;
  gliding: boolean;
}

export class ThreeStereoRainEngine {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private stereoEffect: StereoEffect | null = null;
  private anaglyphEffect: AnaglyphEffect | null = null;

  private rainParticles: RainParticle3D[] = [];
  private rainLineSegments: THREE.LineSegments | null = null;
  private rainGeometry: THREE.BufferGeometry | null = null;
  private rainMaterial: THREE.LineBasicMaterial | null = null;

  // Ground ripples
  private ripples: SplashRipple3D[] = [];
  private rippleGroup: THREE.Group | null = null;
  private rippleMeshes: THREE.Mesh[] = [];

  // Water on Glass effect
  private glassGroup: THREE.Group | null = null;
  private glassDroplets: GlassDroplet3D[] = [];
  private glassMistMesh: THREE.Mesh | null = null;
  private condensationPoints: THREE.Points | null = null;
  private dropletMat: THREE.MeshPhysicalMaterial | null = null;
  private trailGroup: THREE.Group | null = null;

  // Lighting
  private ambientLight: THREE.AmbientLight;
  private dirLight: THREE.DirectionalLight;
  private pointLight: THREE.PointLight;
  private warmRimLight: THREE.PointLight;
  private bottomGlowLight: THREE.PointLight;

  private lastWidth = 0;
  private lastHeight = 0;
  private isInitialized = false;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 500);
    this.camera.position.set(0, 0, 32);

    // Multi-angle realistic lighting for glass refraction & wet specular glints
    this.ambientLight = new THREE.AmbientLight(0xdbeafe, 1.4);
    this.scene.add(this.ambientLight);

    // Key directional light (top-right angled) for strong Fresnel edge highlights
    this.dirLight = new THREE.DirectionalLight(0xe0f2fe, 3.2);
    this.dirLight.position.set(15, 25, 28);
    this.scene.add(this.dirLight);

    // Front specular point light for crisp droplet bead highlights
    this.pointLight = new THREE.PointLight(0x38bdf8, 4.0, 100);
    this.pointLight.position.set(0, 8, 26);
    this.scene.add(this.pointLight);

    // Warm rim light for cinematic bokeh tone reflections
    this.warmRimLight = new THREE.PointLight(0xfef08a, 2.5, 90);
    this.warmRimLight.position.set(-18, -12, 24);
    this.scene.add(this.warmRimLight);

    // Bottom soft fill light
    this.bottomGlowLight = new THREE.PointLight(0x0ea5e9, 1.8, 80);
    this.bottomGlowLight.position.set(0, -20, 22);
    this.scene.add(this.bottomGlowLight);

    this.rippleGroup = new THREE.Group();
    this.scene.add(this.rippleGroup);

    this.glassGroup = new THREE.Group();
    this.scene.add(this.glassGroup);

    this.trailGroup = new THREE.Group();
    this.glassGroup.add(this.trailGroup);

    this.initRipplesPool(30);
  }

  private initGlassDroplets(
    count: number,
    width: number,
    height: number,
    refraction: number,
    lightingMode: string = 'cinematic-blue'
  ) {
    if (!this.glassGroup) return;

    // Clear previous glass droplet meshes and trails
    for (const d of this.glassDroplets) {
      if (d.mesh) {
        this.glassGroup.remove(d.mesh);
        if (d.mesh.geometry) d.mesh.geometry.dispose();
      }
      if (d.trailLine) {
        this.trailGroup?.remove(d.trailLine);
        if (d.trailLine.geometry) d.trailLine.geometry.dispose();
      }
    }
    this.glassDroplets = [];

    // Clear condensation points if any
    if (this.condensationPoints) {
      this.glassGroup.remove(this.condensationPoints);
      this.condensationPoints.geometry.dispose();
      (this.condensationPoints.material as THREE.Material).dispose();
      this.condensationPoints = null;
    }

    if (this.glassMistMesh) {
      this.glassGroup.remove(this.glassMistMesh);
      this.glassMistMesh.geometry.dispose();
      (this.glassMistMesh.material as THREE.Material).dispose();
      this.glassMistMesh = null;
    }

    // Configure lighting colors based on mode
    let emissiveColor = 0x0f2744;
    let emissiveInt = 0.2;
    if (lightingMode === 'golden-bokeh') {
      emissiveColor = 0x54320c;
      this.pointLight.color.set(0xfde047);
      this.warmRimLight.color.set(0xfb923c);
      this.dirLight.color.set(0xffedd5);
    } else if (lightingMode === 'neon-glow') {
      emissiveColor = 0x3b0764;
      this.pointLight.color.set(0xec4899);
      this.warmRimLight.color.set(0x06b6d4);
      this.dirLight.color.set(0xa855f7);
    } else if (lightingMode === 'pure-clear') {
      emissiveColor = 0x1e293b;
      this.pointLight.color.set(0xffffff);
      this.warmRimLight.color.set(0x94a3b8);
      this.dirLight.color.set(0xffffff);
    } else {
      // Default: cinematic-blue
      emissiveColor = 0x0f2744;
      this.pointLight.color.set(0x38bdf8);
      this.warmRimLight.color.set(0xfef08a);
      this.dirLight.color.set(0xe0f2fe);
    }

    // High-specular, physical glass refraction material
    this.dropletMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissive: emissiveColor,
      emissiveIntensity: emissiveInt,
      roughness: 0.02,
      metalness: 0.05,
      transmission: 0.94,
      ior: Math.max(1.1, Math.min(2.4, 1.333 * refraction)),
      transparent: true,
      opacity: 0.94,
      depthWrite: false,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 0.9,
    });

    const aspect = width > 0 && height > 0 ? width / height : 16 / 9;
    const paneW = 34 * aspect;
    const paneH = 34;
    const glassZ = 20; // Plane sitting right in front of camera

    // 1. Subtle Window Condensation / Mist Layer
    const mistGeo = new THREE.PlaneGeometry(paneW * 1.5, paneH * 1.5);
    const mistMat = new THREE.MeshBasicMaterial({
      color: lightingMode === 'golden-bokeh' ? 0x785535 : 0x476282,
      transparent: true,
      opacity: 0.09,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.glassMistMesh = new THREE.Mesh(mistGeo, mistMat);
    this.glassMistMesh.position.set(0, 0, glassZ - 0.5);
    this.glassGroup.add(this.glassMistMesh);

    // 2. Fine Micro-Condensation Beading (hundreds of tiny water specks)
    const microCount = Math.floor(count * 6.5);
    const microPositions = new Float32Array(microCount * 3);
    for (let i = 0; i < microCount; i++) {
      microPositions[i * 3] = (Math.random() - 0.5) * paneW;
      microPositions[i * 3 + 1] = (Math.random() - 0.5) * paneH;
      microPositions[i * 3 + 2] = glassZ + (Math.random() * 0.1 - 0.05);
    }
    const microGeo = new THREE.BufferGeometry();
    microGeo.setAttribute('position', new THREE.BufferAttribute(microPositions, 3));
    const microMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.12,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.condensationPoints = new THREE.Points(microGeo, microMat);
    this.glassGroup.add(this.condensationPoints);

    // Shared sphere geometry base for droplets
    const baseSphereGeo = new THREE.SphereGeometry(1, 16, 12);

    // 3. Main Glass Droplets (Large sliders, medium beads, static teardrops)
    for (let i = 0; i < count; i++) {
      const typeRoll = Math.random();
      let type: 'droplet' | 'streak' | 'condensation' = 'droplet';
      let r = 0.25;
      let scaleX = 1;
      let scaleY = 1;
      let scaleZ = 0.45;
      let vy = -0.05;

      if (typeRoll < 0.22) {
        // Large sliding droplets that leave a water runnel trail
        type = 'streak';
        r = Math.random() * 0.35 + 0.38; // 0.38 - 0.73
        scaleX = 0.9;
        scaleY = 1.35; // Elongated gravity teardrop
        scaleZ = 0.5;
        vy = -(Math.random() * 0.65 + 0.45);
      } else if (typeRoll < 0.75) {
        // Medium organic droplets
        type = 'droplet';
        r = Math.random() * 0.25 + 0.18; // 0.18 - 0.43
        scaleX = Math.random() * 0.2 + 0.9;
        scaleY = Math.random() * 0.3 + 1.0;
        scaleZ = 0.42;
        vy = -(Math.random() * 0.2 + 0.05);
      } else {
        // Tiny stationary / slow-drifting beads
        type = 'condensation';
        r = Math.random() * 0.12 + 0.08;
        scaleX = 1.0;
        scaleY = 1.0;
        scaleZ = 0.4;
        vy = -(Math.random() * 0.04 + 0.01);
      }

      const geo = baseSphereGeo.clone();
      geo.scale(r * scaleX, r * scaleY, r * scaleZ);

      const mesh = new THREE.Mesh(geo, this.dropletMat);
      const x = (Math.random() - 0.5) * paneW;
      const y = (Math.random() - 0.5) * paneH;

      mesh.position.set(x, y, glassZ);
      this.glassGroup.add(mesh);

      this.glassDroplets.push({
        x,
        y,
        radius: r,
        vx: (Math.random() - 0.5) * 0.03,
        vy,
        trickleSpeed: Math.random() * 0.6 + 0.7,
        mesh,
        type,
        trailPoints: [],
        nextGlideTime: Math.random() * 5.0,
        gliding: false,
      });
    }
  }

  private initRenderer() {
    if (this.renderer) return;
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
      });
      this.renderer.setClearColor(0x000000, 0); // Transparent background for seamless compositing
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      this.stereoEffect = new StereoEffect(this.renderer);
      this.anaglyphEffect = new AnaglyphEffect(this.renderer);
      this.isInitialized = true;
    } catch (err) {
      console.warn('Could not initialize WebGL Stereo renderer:', err);
    }
  }

  private initRipplesPool(count: number) {
    if (!this.rippleGroup) return;
    const ringGeo = new THREE.RingGeometry(0.2, 0.35, 24);
    ringGeo.rotateX(-Math.PI / 2);

    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xa5f3fc,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(ringGeo, mat);
      mesh.visible = false;
      this.rippleGroup.add(mesh);
      this.rippleMeshes.push(mesh);
    }
  }

  private initRain(count: number) {
    this.rainParticles = [];
    for (let i = 0; i < count; i++) {
      this.rainParticles.push({
        x: (Math.random() - 0.5) * 85,
        y: (Math.random() - 0.5) * 60 + 5,
        z: -70 + Math.random() * 85, // 3D depth for stereoscopic field
        vx: 0,
        vy: -(Math.random() * 18 + 24),
        vz: (Math.random() - 0.5) * 2,
        speed: Math.random() * 0.8 + 0.8,
        length: Math.random() * 2.8 + 2.0,
        size: Math.random() * 1.5 + 0.8,
        alpha: Math.random() * 0.5 + 0.45,
        baseAlpha: Math.random() * 0.5 + 0.45,
        hue: Math.random() * 360,
      });
    }

    if (this.rainLineSegments) {
      this.scene.remove(this.rainLineSegments);
      this.rainGeometry?.dispose();
      this.rainMaterial?.dispose();
    }

    const positions = new Float32Array(count * 6);
    const colors = new Float32Array(count * 6);

    this.rainGeometry = new THREE.BufferGeometry();
    this.rainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.rainGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.rainMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.rainLineSegments = new THREE.LineSegments(this.rainGeometry, this.rainMaterial);
    this.scene.add(this.rainLineSegments);
  }

  public render(
    width: number,
    height: number,
    config: ParticleConfig,
    bassIntensity: number,
    trebleIntensity: number,
    beatIntensity: number,
    currentTime: number,
    isPlaying: boolean
  ): HTMLCanvasElement | null {
    if (!config.stereoRainEnabled && !config.waterOnGlass) return null;
    this.initRenderer();
    if (!this.renderer || !this.stereoEffect || !this.anaglyphEffect) return null;

    if (this.lastWidth !== width || this.lastHeight !== height) {
      this.lastWidth = width;
      this.lastHeight = height;
      this.canvas.width = width;
      this.canvas.height = height;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height, false);
      this.stereoEffect.setSize(width, height);
      this.anaglyphEffect.setSize(width, height);
    }

    const beatKick = isPlaying && config.reactiveToBeat ? beatIntensity * 2.5 : 0;
    const isBassFlash = config.bassReactiveColor && bassIntensity > 0.45;
    const primaryHex = (config as any).primaryColor || config.color || '#38bdf8';
    const secondaryHex = config.secondaryColor || '#a855f7';
    const baseCol = new THREE.Color(primaryHex);

    // ==========================================
    // 1. STEREO 3D BACKGROUND RAIN (if enabled)
    // ==========================================
    if (config.stereoRainEnabled) {
      if (this.rainLineSegments) this.rainLineSegments.visible = true;
      if (this.rippleGroup) this.rippleGroup.visible = true;

      const rainCount = Math.min(Math.max(config.count * 3, 200), 2000);
      if (this.rainParticles.length !== rainCount || !this.rainLineSegments) {
        this.initRain(rainCount);
      }

      const eyeSep = config.stereoEyeSeparation !== undefined ? config.stereoEyeSeparation : 0.064;
      this.stereoEffect.setEyeSeparation(eyeSep);

      const speedMult = (isPlaying ? config.speed : 0.4 * config.speed) * 0.016;

      // Wind dynamics
      const windAngle = ((config.rainWindAngle !== undefined ? config.rainWindAngle : 10) * Math.PI) / 180;
      const windSpeedMult = config.rainWindSpeed !== undefined ? config.rainWindSpeed : 1.2;
      const windX = Math.sin(windAngle) * 14 * windSpeedMult;
      const windY = -Math.cos(windAngle) * 32 * windSpeedMult;
      const lenScale = config.rainLengthScale !== undefined ? config.rainLengthScale : 1.2;

      const positions = this.rainGeometry?.attributes.position.array as Float32Array;
      const colors = this.rainGeometry?.attributes.color.array as Float32Array;

      // Update point light color based on beat
      if (isBassFlash) {
        this.pointLight.intensity = 4.5 + beatKick * 3;
        this.pointLight.color.set(secondaryHex);
      } else {
        this.pointLight.intensity = 2.0 + beatKick * 1.5;
        this.pointLight.color.set(primaryHex);
      }

      const floorY = -18;

      for (let i = 0; i < this.rainParticles.length; i++) {
        const p = this.rainParticles[i];

        // Gravity and wind drift
        const fallSpeed = (p.vy + (isBassFlash ? -20 * beatKick : 0)) * p.speed;
        p.x += (windX + p.vx) * speedMult;
        p.y += fallSpeed * speedMult;
        p.z += p.vz * speedMult;

        // Splash trigger when hitting floor
        if (p.y <= floorY) {
          if (config.rainSplash !== false && Math.random() < 0.25) {
            this.spawnRipple(p.x, floorY, p.z, baseCol);
          }
          // Reset rain drop to sky
          p.y = 28 + Math.random() * 8;
          p.x = (Math.random() - 0.5) * 85 - (windX > 0 ? 15 : -15);
          p.z = -70 + Math.random() * 85;
        }

        const idx = i * 6;
        positions[idx] = p.x;
        positions[idx + 1] = p.y;
        positions[idx + 2] = p.z;

        const streakLen = p.length * lenScale * (1 + beatKick * 0.4);
        positions[idx + 3] = p.x - (windX / 32) * streakLen;
        positions[idx + 4] = p.y + streakLen;
        positions[idx + 5] = p.z;

        const rainAlpha = Math.min(1.0, p.alpha * (1 + beatKick * 0.3));
        colors[idx] = baseCol.r * rainAlpha;
        colors[idx + 1] = baseCol.g * rainAlpha;
        colors[idx + 2] = baseCol.b * rainAlpha;

        colors[idx + 3] = baseCol.r * 0.05;
        colors[idx + 4] = baseCol.g * 0.05;
        colors[idx + 5] = baseCol.b * 0.05;
      }

      if (this.rainGeometry) {
        this.rainGeometry.attributes.position.needsUpdate = true;
        this.rainGeometry.attributes.color.needsUpdate = true;
      }

      this.updateRipples();
    } else {
      // Hide stereo rain meshes if only waterOnGlass is active
      if (this.rainLineSegments) this.rainLineSegments.visible = false;
      if (this.rippleGroup) this.rippleGroup.visible = false;
    }

    // ================================================================
    // 2. WATER ON GLASS EFFECT (Realistic beads, runnels & mist)
    // ================================================================
    const isWaterOnGlass = config.waterOnGlass !== false;
    if (this.glassGroup) {
      this.glassGroup.visible = isWaterOnGlass;
      if (isWaterOnGlass) {
        const dropletTargetCount = config.waterGlassCount || 75;
        const refrac = config.waterGlassRefraction || 1.0;
        const lightingMode = config.waterGlassLighting || 'cinematic-blue';

        if (
          this.glassDroplets.length !== dropletTargetCount ||
          !this.dropletMat ||
          Math.abs(this.dropletMat.ior - 1.333 * refrac) > 0.05
        ) {
          this.initGlassDroplets(dropletTargetCount, width, height, refrac, lightingMode);
        }

        const aspect = width / height;
        const paneW = 34 * aspect;
        const paneH = 34;
        const trickleRate = (config.waterGlassTrickleSpeed || 1.0) * (isPlaying ? 1.0 : 0.4);

        if (this.glassMistMesh) {
          this.glassMistMesh.visible = config.waterGlassWipeMist !== false;
        }
        if (this.condensationPoints) {
          this.condensationPoints.visible = config.waterGlassWipeMist !== false;
        }

        // Simulate droplets sliding down glass with organic surface tension:
        // Beads cling until gravity overcomes tension, then surge downward leaving subtle wet trace
        for (let i = 0; i < this.glassDroplets.length; i++) {
          const d = this.glassDroplets[i];

          // Check if droplet enters sudden rapid glide or hangs stationary
          if (currentTime > d.nextGlideTime) {
            d.gliding = !d.gliding;
            // Short burst of motion (0.4 - 1.2s) vs longer pause (1.5 - 4.5s)
            d.nextGlideTime = currentTime + (d.gliding ? (Math.random() * 0.8 + 0.4) : (Math.random() * 3.0 + 1.5));
          }

          let currentGlideMultiplier = d.gliding ? (d.type === 'streak' ? 3.2 : 2.2) : (d.type === 'streak' ? 0.25 : 0.08);

          // Audio bass surge causes clinging droplets to break loose and trickle
          if (beatKick > 0.35) {
            currentGlideMultiplier += beatKick * 1.8;
          }

          // Small natural meander (sideways wiggle as it slides around surface imperfections)
          const meander = Math.sin(d.y * 1.8 + i) * 0.015;
          d.x += (d.vx + meander) * trickleRate * currentGlideMultiplier;
          d.y += d.vy * 0.045 * trickleRate * currentGlideMultiplier;

          // Droplet reaches bottom of window pane -> reset to top
          if (d.y < -paneH * 0.58) {
            d.y = paneH * 0.58 + Math.random() * 2.5;
            d.x = (Math.random() - 0.5) * paneW;
          }

          d.mesh.position.set(d.x, d.y, 20);

          // Specular wobble & refraction pulse with music beats
          if (beatKick > 0.15) {
            const beatWobble = 1.0 + Math.sin(currentTime * 12 + i) * (beatKick * 0.12);
            d.mesh.scale.set(beatWobble, beatWobble, 1.0);
          } else {
            d.mesh.scale.set(1.0, 1.0, 1.0);
          }
        }
      }
    }

    // ==========================================
    // 3. STEREO CAMERA / MONO CAM RENDER
    // ==========================================
    // If only water on glass is active without stereo rain, render in flat parallax/mono camera
    // so user gets a pristine, crisp lens overlay on their visualizer/background.
    if (!config.stereoRainEnabled) {
      // Direct front-facing high-clarity camera
      this.camera.position.set(0, 0, 32);
      this.camera.lookAt(0, 0, 0);
      this.renderer.render(this.scene, this.camera);
      return this.canvas;
    }

    const mode = config.stereoMode || 'split-screen';
    if (mode === 'split-screen') {
      this.stereoEffect.render(this.scene, this.camera);
    } else if (mode === 'anaglyph') {
      this.anaglyphEffect.render(this.scene, this.camera);
    } else {
      const parallaxX = Math.sin(currentTime * 0.8) * 1.4;
      const parallaxY = Math.cos(currentTime * 0.6) * 0.8;
      this.camera.position.set(parallaxX, parallaxY, 32);
      this.camera.lookAt(0, 0, 0);
      this.renderer.render(this.scene, this.camera);
    }

    return this.canvas;
  }

  private spawnRipple(x: number, y: number, z: number, color: THREE.Color) {
    const freeMeshIdx = this.rippleMeshes.findIndex((m) => !m.visible);
    if (freeMeshIdx === -1) return;

    const mesh = this.rippleMeshes[freeMeshIdx];
    mesh.position.set(x, y + 0.05, z);
    mesh.scale.set(0.1, 0.1, 0.1);
    (mesh.material as THREE.MeshBasicMaterial).opacity = 0.85;
    (mesh.material as THREE.MeshBasicMaterial).color.copy(color);
    mesh.visible = true;

    this.ripples.push({
      x,
      y,
      z,
      radius: 0.1,
      maxRadius: Math.random() * 1.8 + 1.2,
      alpha: 0.85,
      life: 0,
    });
  }

  private updateRipples() {
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.life += 0.035;
      r.radius += 0.06;
      r.alpha = Math.max(0, 0.85 * (1 - r.life));

      const mesh = this.rippleMeshes[i];
      if (mesh) {
        mesh.scale.set(r.radius, r.radius, r.radius);
        (mesh.material as THREE.MeshBasicMaterial).opacity = r.alpha;
      }

      if (r.life >= 1.0) {
        if (mesh) mesh.visible = false;
        this.ripples.splice(i, 1);
      }
    }
  }

  public dispose() {
    this.rainGeometry?.dispose();
    this.rainMaterial?.dispose();
    this.renderer?.dispose();
    this.isInitialized = false;
  }
}

export const threeStereoRainEngine = new ThreeStereoRainEngine();
