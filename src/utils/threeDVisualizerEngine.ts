import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { VisualizerConfig, ThreeDVisualizerSettings } from '../types';

interface PlanetObject {
  name: string;
  orbitRadius: number;
  speed: number;
  size: number;
  color: string;
  angle: number;
  mesh: THREE.Mesh;
  orbitLine: THREE.LineLoop | null;
  ringMesh?: THREE.Mesh | null;
  moonMesh?: THREE.Mesh | null;
}

/**
 * ThreeDVisualizerEngine
 * High-performance Three.js WebGL visualizer rendering engine with alpha transparency.
 * Renders into an offscreen/memory canvas to seamlessly composite with 2D stage layers,
 * video backgrounds, lyrics, watermarks, and MP4 video export.
 */
class ThreeDVisualizerEngine {
  private canvas: HTMLCanvasElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  // Lighting
  private ambientLight: THREE.AmbientLight;
  private dirLight1: THREE.DirectionalLight;
  private pointLight1: THREE.PointLight;
  private pointLight2: THREE.PointLight;

  // Active scene objects holder
  private visualizerGroup: THREE.Group;
  private currentVisualizerType: string = '';

  // Object caches for each 3D visualizer
  // 1. Cube Matrix
  private cubeMatrixMeshes: THREE.Mesh[] = [];
  private cubeBuildSig: string = '';

  // 2. Sphere Waveform (Quả Cầu Tần Số 3D)
  private sphereMesh: THREE.Mesh | null = null;
  private sphereCoreMesh: THREE.Mesh | null = null;
  private sphereWireframeMesh: THREE.Mesh | null = null;
  private sphereOuterShellMesh: THREE.Mesh | null = null;
  private sphereOrigPositions: Float32Array | null = null;
  private sphereVertexColors: Float32Array | null = null;
  private sphereBuildSig: string = '';

  // 3. Wave Terrain (Địa Hình Cyberpunk 3D)
  private terrainMesh: THREE.Mesh | null = null;
  private terrainWireOverlayMesh: THREE.Mesh | null = null;
  private terrainOrigPositions: Float32Array | null = null;
  private terrainBuildSig: string = '';
  private bgImageElement: HTMLImageElement | HTMLVideoElement | null = null;
  private bgEnvTexture: THREE.Texture | null = null;
  private defaultStudioEnvTexture: THREE.Texture | null = null;

  // 4. Solar System & Planetary Galaxy
  private solarSunMesh: THREE.Mesh | null = null;
  private solarCoronaMesh: THREE.Mesh | null = null;
  private solarFlares: THREE.Points | null = null;
  private solarFlarePositions: Float32Array | null = null;
  private solarPlanets: PlanetObject[] = [];
  private asteroidBeltPoints: THREE.Points | null = null;
  private solarBuildSig: string = '';

  // 5. Transparent Fluid 3D Shape
  private fluidMesh: THREE.Mesh | null = null;
  private fluidOrigPositions: Float32Array | null = null;
  private fluidOrigNormals: Float32Array | null = null;
  private fluidDropletsPoints: THREE.Points | null = null;
  private fluidDropletsData: { angle: number; radius: number; speed: number; y: number; baseR: number }[] = [];
  private fluidTime: number = 0;
  private fluidBuildSig: string = '';

  // 6. 3D Bezier Polygon Line Network (Plexus/Constellation Web)
  private bezierNodes: { x: number; y: number; z: number; vx: number; vy: number; vz: number; baseR: number; theta: number; phi: number }[] = [];
  private bezierLinesMesh: THREE.LineSegments | null = null;
  private bezierPointsMesh: THREE.Points | null = null;
  private bezierCubeBoxMesh: THREE.LineSegments | null = null;
  private bezierBuildSig: string = '';

  // 7. 3D Ray Caster Field with Line and Head Dots (Stanford Bunny / Mesh Normal Rays)
  private rayBaseMesh: THREE.Mesh | null = null;
  private rayLinesMesh: THREE.LineSegments | null = null;
  private rayDotsPoints: THREE.Points | null = null;
  private rayOrigins: Float32Array | null = null;
  private rayDirections: Float32Array | null = null;
  private rayBaseLengths: Float32Array | null = null;
  private rayLinePositions: Float32Array | null = null;
  private rayDotPositions: Float32Array | null = null;
  private rayDotTextures: Map<string, THREE.Texture> = new Map();
  private rayBuildSig: string = '';

  // 8. 3D Spiral Galaxy (Dải Ngân Hà Xoắn Ốc Vũ Trụ)
  private galaxyPoints: THREE.Points | null = null;
  private galaxyBasePositions: Float32Array | null = null;
  private galaxyBaseColors: Float32Array | null = null;
  private galaxyStarRadii: Float32Array | null = null;
  private galaxyStarAngles: Float32Array | null = null;
  private galaxyStarSpeeds: Float32Array | null = null;
  private galaxyStarArms: Int8Array | null = null;
  private galaxyStarTexture: THREE.Texture | null = null;
  private roundStarTexture: THREE.Texture | null = null;
  private galaxyBuildSig: string = '';

  private rotationAngle: number = 0;
  private flowingLightPhase: number = 0;
  private lastTime: number = 0;

  // Global Post-Processing Bloom Pipeline
  private composer: EffectComposer | null = null;
  private renderPass: RenderPass | null = null;
  private bloomPass: UnrealBloomPass | null = null;
  private outputPass: OutputPass | null = null;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 1000);
    this.camera.position.set(0, 0, 38);

    // Setup Lights
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(this.ambientLight);

    this.dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    this.dirLight1.position.set(20, 40, 30);
    this.scene.add(this.dirLight1);

    this.pointLight1 = new THREE.PointLight(0xec4899, 2.5, 140);
    this.pointLight1.position.set(-20, 15, 20);
    this.scene.add(this.pointLight1);

    this.pointLight2 = new THREE.PointLight(0x06b6d4, 2.5, 140);
    this.pointLight2.position.set(20, -15, 20);
    this.scene.add(this.pointLight2);

    this.visualizerGroup = new THREE.Group();
    this.scene.add(this.visualizerGroup);
  }

  /**
   * Initializes or updates the WebGLRenderer and EffectComposer size
   */
  private ensureRenderer(width: number, height: number): boolean {
    if (typeof window === 'undefined') return false;

    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = Math.max(320, width);
      this.canvas.height = Math.max(180, height);
      try {
        this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          alpha: true,
          antialias: true,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
        });
        this.renderer.setClearColor(0x000000, 0); // Transparent background
        this.renderer.setPixelRatio(1);

        // Configure EffectComposer with RenderPass and UnrealBloomPass
        const renderTarget = new THREE.WebGLRenderTarget(width, height, {
          format: THREE.RGBAFormat,
          type: THREE.HalfFloatType,
          samples: 4,
        });

        this.composer = new EffectComposer(this.renderer, renderTarget);
        this.renderPass = new RenderPass(this.scene, this.camera);
        this.renderPass.clearColor = new THREE.Color(0x000000);
        this.renderPass.clearAlpha = 0;
        this.composer.addPass(this.renderPass);

        // UnrealBloomPass: resolution, strength, radius, threshold
        this.bloomPass = new UnrealBloomPass(
          new THREE.Vector2(width, height),
          1.6,   // default strength
          0.75,  // default radius
          0.15   // default threshold
        );
        this.composer.addPass(this.bloomPass);

        this.outputPass = new OutputPass();
        this.composer.addPass(this.outputPass);
      } catch (e) {
        console.warn('ThreeDVisualizerEngine: WebGL not available or context lost', e);
        return false;
      }
    }

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      if (this.renderer) {
        this.renderer.setSize(width, height, false);
      }
      if (this.composer) {
        this.composer.setSize(width, height);
      }
      if (this.bloomPass) {
        this.bloomPass.resolution.set(width, height);
      }
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }

    return true;
  }

  /**
   * Cleans up visualizer scene objects when switching types
   */
  private clearVisualizerObjects(): void {
    while (this.visualizerGroup.children.length > 0) {
      const child = this.visualizerGroup.children[0];
      this.visualizerGroup.remove(child);
      if ((child as any).geometry) {
        (child as any).geometry.dispose();
      }
      if ((child as any).material) {
        if (Array.isArray((child as any).material)) {
          (child as any).material.forEach((m: any) => m.dispose());
        } else {
          (child as any).material.dispose();
        }
      }
    }
    this.cubeMatrixMeshes = [];
    this.sphereMesh = null;
    this.sphereCoreMesh = null;
    this.sphereWireframeMesh = null;
    this.sphereOuterShellMesh = null;
    this.sphereOrigPositions = null;
    this.sphereVertexColors = null;
    this.terrainMesh = null;
    this.terrainWireOverlayMesh = null;
    this.terrainOrigPositions = null;
    this.solarSunMesh = null;
    this.solarCoronaMesh = null;
    this.solarFlares = null;
    this.solarFlarePositions = null;
    this.solarPlanets = [];
    this.asteroidBeltPoints = null;
    this.fluidMesh = null;
    this.fluidOrigPositions = null;
    this.fluidOrigNormals = null;
    this.fluidDropletsPoints = null;
    this.fluidDropletsData = [];
    this.bezierNodes = [];
    this.bezierLinesMesh = null;
    this.bezierPointsMesh = null;
    this.bezierCubeBoxMesh = null;
    this.rayBaseMesh = null;
    this.rayLinesMesh = null;
    this.rayDotsPoints = null;
    this.rayOrigins = null;
    this.rayDirections = null;
    this.rayBaseLengths = null;
    this.rayLinePositions = null;
    this.rayDotPositions = null;
    this.galaxyPoints = null;
    this.galaxyBasePositions = null;
    this.galaxyBaseColors = null;
    this.galaxyStarRadii = null;
    this.galaxyStarAngles = null;
    this.galaxyStarSpeeds = null;
    this.galaxyStarArms = null;
  }

  /**
   * Set background image / video element to generate realistic environment reflections on 3D surfaces
   */
  public setBackgroundImage(img: HTMLImageElement | HTMLVideoElement | null): void {
    if (this.bgImageElement === img) return;
    this.bgImageElement = img;
    if (this.bgEnvTexture) {
      this.bgEnvTexture.dispose();
      this.bgEnvTexture = null;
    }
    if (img) {
      try {
        const isVideo = img instanceof HTMLVideoElement;
        const tex = isVideo
          ? new THREE.VideoTexture(img)
          : new THREE.Texture(img);
        tex.mapping = THREE.EquirectangularReflectionMapping;
        if (isVideo) {
          tex.generateMipmaps = false;
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
        }
        tex.needsUpdate = true;
        this.bgEnvTexture = tex;
      } catch (e) {
        console.warn('Could not create envTexture from bgImage', e);
      }
    }
  }

  private getEnvTexture(): THREE.Texture {
    if (this.bgEnvTexture) {
      return this.bgEnvTexture;
    }
    if (!this.defaultStudioEnvTexture) {
      this.defaultStudioEnvTexture = this.createDefaultCyberEnvTexture();
    }
    return this.defaultStudioEnvTexture;
  }

  private createDefaultCyberEnvTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0.0, '#0a0f1d'); // deep night sky
      grad.addColorStop(0.4, '#2e1065'); // violet dusk
      grad.addColorStop(0.65, '#e11d48'); // sunset crimson
      grad.addColorStop(0.85, '#f59e0b'); // amber glow
      grad.addColorStop(1.0, '#020617'); // horizon
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 256);

      // Add atmospheric glow spots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(256, 180, 60, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    return tex;
  }

  // =========================================================================
  // 1. 3D Cube Equalizer Matrix Grid
  // =========================================================================
  private buildCubeMatrix(config: VisualizerConfig, s: ThreeDVisualizerSettings): void {
    this.clearVisualizerObjects();
    const size = s.cubeGridSize || 8;
    const spacing = s.cubeSpacing !== undefined ? s.cubeSpacing : 0.35;
    const isWire = s.wireframe || s.cubeShading === 'wireframe';
    const cubeW = 2.0;

    const baseGeo = new THREE.BoxGeometry(cubeW, 1, cubeW);
    const primCol = new THREE.Color(config.primaryColor);
    const secCol = new THREE.Color(config.secondaryColor);

    const half = (size - 1) / 2;
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        const distFromCenter = Math.sqrt((x - half) * (x - half) + (z - half) * (z - half)) / (half * 1.414);
        const col = primCol.clone().lerp(secCol, Math.min(1, distFromCenter));

        const mat = new THREE.MeshStandardMaterial({
          color: col,
          emissive: col,
          emissiveIntensity: s.cubeShading === 'glow-edges' ? 0.6 : 0.25,
          metalness: s.cubeShading === 'metallic' ? 0.85 : 0.3,
          roughness: s.cubeShading === 'metallic' ? 0.2 : 0.4,
          wireframe: isWire,
        });

        const mesh = new THREE.Mesh(baseGeo, mat);
        mesh.position.set(
          (x - half) * (cubeW + spacing),
          0,
          (z - half) * (cubeW + spacing)
        );
        mesh.userData = { gridX: x, gridZ: z, distFromCenter, baseEmissive: mat.emissiveIntensity, baseColor: col };
        this.visualizerGroup.add(mesh);
        this.cubeMatrixMeshes.push(mesh);
      }
    }
  }

  // =========================================================================
  // 2. 3D Sphere Waveform / Icosahedron (Quả Cầu Tần Số 3D)
  // =========================================================================
  private buildSphereWaveform(config: VisualizerConfig, s: ThreeDVisualizerSettings): void {
    this.clearVisualizerObjects();
    const radius = s.sphereRadius || 13;
    const detail = Math.min(4, Math.max(1, s.sphereDetail || 2));
    const isWire = s.wireframe || s.sphereStyle === 'wireframe';
    const isParticles = s.sphereStyle === 'particles';
    const isDualShell = s.sphereStyle === 'dual-shell';

    // Build geometry and convert to non-indexed so each triangular facet has its own 3 distinct vertices and crisp flat face normals
    let geo: THREE.BufferGeometry = new THREE.IcosahedronGeometry(radius, detail);
    geo = geo.toNonIndexed();
    geo.computeVertexNormals();

    const pos = geo.attributes.position;
    this.sphereOrigPositions = new Float32Array(pos.array.length);
    this.sphereOrigPositions.set(pos.array);

    const primCol = new THREE.Color(config.primaryColor || '#ec4899');
    const secCol = new THREE.Color(config.secondaryColor || '#8b5cf6');
    const tertCol = new THREE.Color(config.tertiaryColor || '#06b6d4');

    // Multi-color gradient for polygon facets
    const colorMode = s.sphereColorMode || 'gradient-duo';
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const i3 = i * 3;
      const yNorm = Math.min(1, Math.max(0, (pos.array[i3 + 1] / radius + 1) * 0.5)); // 0 (bottom) to 1 (top)
      const xNorm = (pos.array[i3] / radius + 1) * 0.5;

      let c = primCol.clone();
      if (colorMode === 'gradient-duo') {
        c.lerp(secCol, yNorm);
      } else if (colorMode === 'rainbow-flow') {
        const hue = (yNorm * 0.7 + xNorm * 0.3) % 1.0;
        c.setHSL(hue, 0.95, 0.55);
      } else if (colorMode === 'audio-reactive') {
        c.lerp(tertCol, yNorm * 0.6);
      }
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.sphereVertexColors = new Float32Array(colors);

    // Opacity / Transparency of the polygons
    const opacity = s.sphereOpacity !== undefined ? Math.max(0.05, Math.min(1.0, s.sphereOpacity)) : 0.85;
    const isTransparent = opacity < 0.999;

    // Material finish settings
    const matStyle = s.sphereMaterial || 'crystal-glass';
    let roughness = s.sphereRoughness !== undefined ? s.sphereRoughness : 0.25;
    let metalness = s.sphereMetalness !== undefined ? s.sphereMetalness : 0.45;
    let emissiveCol = new THREE.Color(0x111111);
    let emissiveInt = 0.2;

    if (matStyle === 'matte-clay') {
      roughness = s.sphereRoughness !== undefined ? s.sphereRoughness : 0.85;
      metalness = s.sphereMetalness !== undefined ? s.sphereMetalness : 0.05;
      emissiveInt = 0.08;
    } else if (matStyle === 'metallic-poly') {
      roughness = s.sphereRoughness !== undefined ? s.sphereRoughness : 0.15;
      metalness = s.sphereMetalness !== undefined ? s.sphereMetalness : 0.85;
      emissiveInt = 0.15;
    } else if (matStyle === 'neon-glow') {
      roughness = s.sphereRoughness !== undefined ? s.sphereRoughness : 0.2;
      metalness = s.sphereMetalness !== undefined ? s.sphereMetalness : 0.3;
      emissiveCol = primCol.clone();
      emissiveInt = 0.55;
    } else if (matStyle === 'crystal-glass') {
      roughness = s.sphereRoughness !== undefined ? s.sphereRoughness : 0.1;
      metalness = s.sphereMetalness !== undefined ? s.sphereMetalness : 0.15;
      emissiveInt = 0.2;
    } else if (matStyle === 'hologram') {
      roughness = s.sphereRoughness !== undefined ? s.sphereRoughness : 0.08;
      metalness = s.sphereMetalness !== undefined ? s.sphereMetalness : 0.6;
      emissiveCol = secCol.clone();
      emissiveInt = 0.4;
    }

    if (isParticles) {
      const pointsMat = new THREE.PointsMaterial({
        size: 1.8,
        map: this.getRoundStarTexture(),
        vertexColors: true,
        transparent: isTransparent,
        opacity: opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      this.sphereMesh = new THREE.Points(geo, pointsMat) as any;
      this.visualizerGroup.add(this.sphereMesh);
    } else {
      const mat = new THREE.MeshStandardMaterial({
        vertexColors: colorMode !== 'primary-single',
        color: colorMode === 'primary-single' ? primCol : new THREE.Color(0xffffff),
        emissive: emissiveCol,
        emissiveIntensity: emissiveInt,
        wireframe: isWire,
        roughness: roughness,
        metalness: metalness,
        flatShading: true,
        side: THREE.DoubleSide, // Allows viewing back and front faces through transparent polygons
        transparent: isTransparent,
        opacity: opacity,
        depthWrite: opacity > 0.85,
      });

      this.sphereMesh = new THREE.Mesh(geo, mat);
      this.visualizerGroup.add(this.sphereMesh);

      // Sharp wireframe edges outline around each polygon facet
      if (s.sphereWireframeEdges !== false && !isWire) {
        const wireMat = new THREE.MeshBasicMaterial({
          color: secCol,
          wireframe: true,
          transparent: true,
          opacity: Math.min(1.0, opacity * 0.75 + 0.15),
        });
        this.sphereWireframeMesh = new THREE.Mesh(geo, wireMat);
        this.visualizerGroup.add(this.sphereWireframeMesh);
      }

      // Outer wireframe cage for dual-shell mode
      if (isDualShell) {
        const outerGeo = new THREE.IcosahedronGeometry(radius * 1.15, Math.max(1, detail - 1));
        const outerMat = new THREE.MeshBasicMaterial({
          color: secCol,
          wireframe: true,
          transparent: true,
          opacity: 0.55,
        });
        this.sphereOuterShellMesh = new THREE.Mesh(outerGeo, outerMat);
        this.visualizerGroup.add(this.sphereOuterShellMesh);
      }
    }
    // Note: Inner glowing energy core sphere has been completely removed as requested
  }

  // =========================================================================
  // 3. 3D Synthwave Wave Terrain (Địa Hình Cyberpunk 3D)
  // =========================================================================
  private buildWaveTerrain(config: VisualizerConfig, s: ThreeDVisualizerSettings): void {
    this.clearVisualizerObjects();
    const res = s.terrainResolution || 36;
    const geo = new THREE.PlaneGeometry(68, 68, res, res);
    geo.rotateX(-Math.PI / 2.3);
    geo.translate(0, -6, 0);

    const pos = geo.attributes.position;
    this.terrainOrigPositions = new Float32Array(pos.array.length);
    this.terrainOrigPositions.set(pos.array);

    const primCol = new THREE.Color(config.primaryColor);
    const secCol = new THREE.Color(config.secondaryColor);

    const mode = s.terrainRenderMode || 'wireframe';
    const isWireframe = mode === 'wireframe';
    const hasSolid = mode === 'solid' || mode === 'solid-wireframe';
    const hasWireOverlay = mode === 'solid-wireframe';

    const enableReflection = s.terrainEnvReflection !== false && hasSolid;
    const roughness = s.terrainRoughness !== undefined ? s.terrainRoughness : (hasSolid ? 0.18 : 0.4);
    const metalness = s.terrainMetalness !== undefined ? s.terrainMetalness : (hasSolid ? 0.75 : 0.2);
    const opacity = s.terrainOpacity !== undefined ? Math.max(0.1, Math.min(1.0, s.terrainOpacity)) : 0.95;

    const mat = new THREE.MeshStandardMaterial({
      color: primCol,
      emissive: primCol,
      emissiveIntensity: hasSolid ? 0.18 : 0.4,
      roughness: roughness,
      metalness: metalness,
      wireframe: isWireframe,
      transparent: opacity < 0.999,
      opacity: opacity,
      side: THREE.DoubleSide,
    });

    if (enableReflection) {
      mat.envMap = this.getEnvTexture();
      mat.envMapIntensity = s.terrainReflectionIntensity !== undefined ? s.terrainReflectionIntensity : 0.85;
      mat.needsUpdate = true;
    }

    this.terrainMesh = new THREE.Mesh(geo, mat);
    this.visualizerGroup.add(this.terrainMesh);

    // Optional Wireframe overlay for solid-wireframe combo mode
    if (hasWireOverlay) {
      const wireMat = new THREE.MeshBasicMaterial({
        color: secCol,
        wireframe: true,
        transparent: true,
        opacity: 0.65,
      });
      this.terrainWireOverlayMesh = new THREE.Mesh(geo, wireMat);
      this.terrainWireOverlayMesh.position.y += 0.05;
      this.visualizerGroup.add(this.terrainWireOverlayMesh);
    }

    // XÓA VÒNG TRÒN MÀU ĐỎ: The red horizon circle (terrainSunMesh) is completely removed!
  }

  // =========================================================================
  // 4. 3D Solar System & Planetary Galaxy (Hệ Thiên Hà 3D)
  // =========================================================================
  private buildSolarSystem(config: VisualizerConfig, s: ThreeDVisualizerSettings): void {
    this.clearVisualizerObjects();

    const sunRadius = s.solarSunSize || 5.5;
    const primCol = new THREE.Color(config.primaryColor);
    const secCol = new THREE.Color(config.secondaryColor);
    const tertCol = new THREE.Color(config.tertiaryColor || '#f59e0b');

    // 1. Central Glowing Sun Core
    const sunGeo = new THREE.SphereGeometry(sunRadius, 32, 32);
    const sunMat = new THREE.MeshStandardMaterial({
      color: tertCol,
      emissive: tertCol,
      emissiveIntensity: 1.2,
      roughness: 0.1,
      metalness: 0.2,
      wireframe: s.wireframe ?? false,
    });
    this.solarSunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.visualizerGroup.add(this.solarSunMesh);

    // Outer Solar Corona Atmosphere
    const coronaGeo = new THREE.IcosahedronGeometry(sunRadius * 1.35, 2);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: primCol,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    this.solarCoronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    this.visualizerGroup.add(this.solarCoronaMesh);

    // Solar Flares (Sparks radiating from Sun)
    const flareCount = 180;
    const flarePositions = new Float32Array(flareCount * 3);
    const flareColors = new Float32Array(flareCount * 3);
    this.solarFlarePositions = new Float32Array(flareCount * 3);

    for (let i = 0; i < flareCount; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = sunRadius * (1.1 + Math.random() * 0.5);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      flarePositions[i3] = x;
      flarePositions[i3 + 1] = y;
      flarePositions[i3 + 2] = z;

      this.solarFlarePositions[i3] = x;
      this.solarFlarePositions[i3 + 1] = y;
      this.solarFlarePositions[i3 + 2] = z;

      const c = tertCol.clone().lerp(primCol, Math.random() * 0.6);
      flareColors[i3] = c.r;
      flareColors[i3 + 1] = c.g;
      flareColors[i3 + 2] = c.b;
    }

    const flareGeo = new THREE.BufferGeometry();
    flareGeo.setAttribute('position', new THREE.BufferAttribute(flarePositions, 3));
    flareGeo.setAttribute('color', new THREE.BufferAttribute(flareColors, 3));
    const flareMat = new THREE.PointsMaterial({
      size: 1.6,
      map: s.solarStarShape === 'celestial-ray' ? this.getGalaxyStarTexture() : this.getRoundStarTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.solarFlares = new THREE.Points(flareGeo, flareMat);
    this.visualizerGroup.add(this.solarFlares);

    // 2. Planets configuration
    const PLANET_TEMPLATES = [
      { name: 'Mercury', orbitRadius: sunRadius + 3.8, size: 0.75, speed: 2.2, color: '#94a3b8' },
      { name: 'Venus', orbitRadius: sunRadius + 7.0, size: 1.05, speed: 1.7, color: '#facc15' },
      { name: 'Earth', orbitRadius: sunRadius + 10.8, size: 1.2, speed: 1.25, color: '#38bdf8' },
      { name: 'Mars', orbitRadius: sunRadius + 14.5, size: 0.9, speed: 0.95, color: '#f87171' },
      { name: 'Jupiter', orbitRadius: sunRadius + 19.8, size: 2.3, speed: 0.65, color: '#fb923c' },
      { name: 'Saturn', orbitRadius: sunRadius + 25.5, size: 1.8, speed: 0.45, color: '#fef08a' },
      { name: 'Uranus', orbitRadius: sunRadius + 30.5, size: 1.35, speed: 0.32, color: '#2dd4bf' },
      { name: 'Neptune', orbitRadius: sunRadius + 35.0, size: 1.3, speed: 0.22, color: '#818cf8' },
    ];

    const planetCount = Math.min(PLANET_TEMPLATES.length, s.solarPlanetCount || 6);
    this.solarPlanets = [];

    const showOrbits = s.solarShowOrbits !== false;
    const planetScale = s.solarPlanetSizeScale !== undefined ? s.solarPlanetSizeScale : 1.0;

    for (let i = 0; i < planetCount; i++) {
      const t = PLANET_TEMPLATES[i];
      const pColor = new THREE.Color(t.color);

      // Planet Mesh
      const pGeo = new THREE.SphereGeometry(t.size * planetScale, 20, 20);
      const pMat = new THREE.MeshStandardMaterial({
        color: pColor,
        emissive: pColor,
        emissiveIntensity: 0.35,
        roughness: 0.3,
        metalness: 0.5,
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);

      // Orbit Line Ring
      let orbitLine: THREE.LineLoop | null = null;
      if (showOrbits) {
        const segs = 64;
        const pts: THREE.Vector3[] = [];
        for (let j = 0; j <= segs; j++) {
          const a = (j / segs) * Math.PI * 2;
          pts.push(new THREE.Vector3(Math.cos(a) * t.orbitRadius, 0, Math.sin(a) * t.orbitRadius));
        }
        const oGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const oMat = new THREE.LineBasicMaterial({
          color: pColor,
          transparent: true,
          opacity: 0.32,
        });
        orbitLine = new THREE.LineLoop(oGeo, oMat);
        this.visualizerGroup.add(orbitLine);
      }

      // Saturn Ring Mesh
      let ringMesh: THREE.Mesh | null = null;
      if (t.name === 'Saturn' && s.solarSaturnRings !== false) {
        const ringGeo = new THREE.RingGeometry(t.size * planetScale * 1.35, t.size * planetScale * 2.3, 32);
        ringGeo.rotateX(-Math.PI / 2.8);
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75,
          roughness: 0.4,
        });
        ringMesh = new THREE.Mesh(ringGeo, ringMat);
        pMesh.add(ringMesh);
      }

      // Earth Moon Mesh
      let moonMesh: THREE.Mesh | null = null;
      if (t.name === 'Earth') {
        const mGeo = new THREE.SphereGeometry(0.35 * planetScale, 12, 12);
        const mMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
        moonMesh = new THREE.Mesh(mGeo, mMat);
        moonMesh.position.set(2.2 * planetScale, 0, 0);
        pMesh.add(moonMesh);
      }

      const initialAngle = (i / planetCount) * Math.PI * 2;
      pMesh.position.set(
        Math.cos(initialAngle) * t.orbitRadius,
        0,
        Math.sin(initialAngle) * t.orbitRadius
      );
      this.visualizerGroup.add(pMesh);

      this.solarPlanets.push({
        name: t.name,
        orbitRadius: t.orbitRadius,
        speed: t.speed,
        size: t.size,
        color: t.color,
        angle: initialAngle,
        mesh: pMesh,
        orbitLine,
        ringMesh,
        moonMesh,
      });
    }

    // 3. Asteroid Belt Particles (Vành đai tiểu hành tinh vì sao tròn phát sáng)
    if (s.solarAsteroidBelt !== false) {
      const beltCount = s.solarAsteroidCount || 550;
      const beltPos = new Float32Array(beltCount * 3);
      const beltCols = new Float32Array(beltCount * 3);
      const innerR = sunRadius + 15.8;
      const outerR = sunRadius + 18.6;

      for (let i = 0; i < beltCount; i++) {
        const i3 = i * 3;
        const angle = Math.random() * Math.PI * 2;
        const r = innerR + Math.random() * (outerR - innerR);
        const y = (Math.random() - 0.5) * 1.8;

        beltPos[i3] = Math.cos(angle) * r;
        beltPos[i3 + 1] = y;
        beltPos[i3 + 2] = Math.sin(angle) * r;

        // Rich cosmic colors: warm golden, cyan/turquoise, and amber stardust
        const randChoice = Math.random();
        let c: THREE.Color;
        if (randChoice < 0.35) {
          c = tertCol.clone().lerp(new THREE.Color('#ffffff'), 0.25 + Math.random() * 0.5);
        } else if (randChoice < 0.7) {
          c = secCol.clone().lerp(primCol, Math.random());
        } else {
          c = new THREE.Color('#fef08a').lerp(tertCol, Math.random() * 0.4);
        }

        beltCols[i3] = c.r;
        beltCols[i3 + 1] = c.g;
        beltCols[i3 + 2] = c.b;
      }

      const beltGeo = new THREE.BufferGeometry();
      beltGeo.setAttribute('position', new THREE.BufferAttribute(beltPos, 3));
      beltGeo.setAttribute('color', new THREE.BufferAttribute(beltCols, 3));

      const starSize = s.solarAsteroidSize !== undefined ? s.solarAsteroidSize : 1.8;
      const beltMat = new THREE.PointsMaterial({
        size: starSize,
        map: s.solarStarShape === 'celestial-ray' ? this.getGalaxyStarTexture() : this.getRoundStarTexture(),
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      this.asteroidBeltPoints = new THREE.Points(beltGeo, beltMat);
      this.visualizerGroup.add(this.asteroidBeltPoints);
    }
  }

  // =========================================================================
  // 5. 3D Transparent Fluid Shape (Pulsing to music rhythm)
  // =========================================================================
  private buildFluidShape(config: VisualizerConfig, s: ThreeDVisualizerSettings): void {
    this.clearVisualizerObjects();
    const radius = s.fluidRadius || 12;
    const detail = Math.min(5, Math.max(2, s.fluidDetail || 4));
    const isWire = !!s.fluidWireframe || !!s.wireframe;
    const style = s.fluidStyle || 'translucent-glass';

    const geo = new THREE.IcosahedronGeometry(radius, detail);
    const pos = geo.attributes.position;
    this.fluidOrigPositions = new Float32Array(pos.array.length);
    this.fluidOrigPositions.set(pos.array);

    // Compute initial normals
    geo.computeVertexNormals();
    const norm = geo.attributes.normal;
    this.fluidOrigNormals = new Float32Array(norm.array.length);
    this.fluidOrigNormals.set(norm.array);

    const primCol = new THREE.Color(config.primaryColor);
    const secCol = new THREE.Color(config.secondaryColor);

    // Vertex colors for smooth liquid gradient / iridescence
    const vertexColors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const i3 = i * 3;
      const vy = pos.array[i3 + 1] / radius; // -1 to 1
      let col: THREE.Color;
      if (style === 'iridescent') {
        const hue = ((vy + 1) * 0.5 + 0.5) % 1.0;
        col = new THREE.Color().setHSL(hue, 0.85, 0.6);
      } else {
        col = primCol.clone().lerp(secCol, (vy + 1) * 0.5);
      }
      vertexColors[i3] = col.r;
      vertexColors[i3 + 1] = col.g;
      vertexColors[i3 + 2] = col.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(vertexColors, 3));

    // Transparent fluid material configuration
    const opacity = s.fluidOpacity !== undefined ? Math.max(0.0, Math.min(1.0, s.fluidOpacity)) : 0.72;
    const transmission = s.fluidTransmission !== undefined 
      ? s.fluidTransmission 
      : (style === 'liquid-chrome' ? 0.2 : 0.65);
    const isTransparent = opacity < 0.999 || transmission > 0.05;

    const roughness = s.fluidRoughness !== undefined 
      ? s.fluidRoughness 
      : (style === 'liquid-chrome' ? 0.03 : 0.08);
    const metalness = s.fluidMetalness !== undefined 
      ? s.fluidMetalness 
      : (style === 'liquid-chrome' ? 0.85 : 0.25);

    const enableReflection = s.fluidEnvReflection !== false;
    const reflectionIntensity = s.fluidReflectionIntensity !== undefined ? s.fluidReflectionIntensity : 0.85;

    const mat = new THREE.MeshPhysicalMaterial({
      color: primCol,
      emissive: primCol,
      emissiveIntensity: 0.25,
      roughness,
      metalness,
      transmission,
      ior: 1.333, // Optical refractive index for liquid water
      transparent: isTransparent,
      opacity: Math.max(0.02, opacity),
      wireframe: isWire,
      vertexColors: true,
      side: THREE.DoubleSide,
      depthWrite: opacity > 0.85,
    });

    if (enableReflection) {
      mat.envMap = this.getEnvTexture();
      mat.envMapIntensity = reflectionIntensity;
      mat.needsUpdate = true;
    }

    this.fluidMesh = new THREE.Mesh(geo, mat);
    this.visualizerGroup.add(this.fluidMesh);

    // Floating micro fluid droplets / bubbles orbiting the fluid body
    if (s.fluidDroplets !== false) {
      const dropletCount = 64;
      const dropletPositions = new Float32Array(dropletCount * 3);
      const dropletColors = new Float32Array(dropletCount * 3);
      this.fluidDropletsData = [];

      for (let i = 0; i < dropletCount; i++) {
        const i3 = i * 3;
        const angle = Math.random() * Math.PI * 2;
        const baseR = radius * (1.25 + Math.random() * 0.85);
        const y = (Math.random() - 0.5) * radius * 1.8;
        const speed = (0.4 + Math.random() * 0.8) * (Math.random() > 0.5 ? 1 : -1);

        dropletPositions[i3] = Math.cos(angle) * baseR;
        dropletPositions[i3 + 1] = y;
        dropletPositions[i3 + 2] = Math.sin(angle) * baseR;

        const c = primCol.clone().lerp(secCol, Math.random());
        dropletColors[i3] = c.r;
        dropletColors[i3 + 1] = c.g;
        dropletColors[i3 + 2] = c.b;

        this.fluidDropletsData.push({
          angle,
          radius: baseR,
          speed,
          y,
          baseR,
        });
      }

      const dGeo = new THREE.BufferGeometry();
      dGeo.setAttribute('position', new THREE.BufferAttribute(dropletPositions, 3));
      dGeo.setAttribute('color', new THREE.BufferAttribute(dropletColors, 3));

      const dMat = new THREE.PointsMaterial({
        size: 1.4,
        map: this.getRoundStarTexture(),
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      this.fluidDropletsPoints = new THREE.Points(dGeo, dMat);
      this.visualizerGroup.add(this.fluidDropletsPoints);
    }
  }

  // =========================================================================
  // 6. 3D Bezier Polygon Line Network (Plexus / Constellation Web)
  // =========================================================================
  private buildBezierMesh(config: VisualizerConfig, s: ThreeDVisualizerSettings): void {
    this.clearVisualizerObjects();
    const nodeCount = s.bezierNodeCount || 150;
    const boxSize = s.bezierBoxSize || 36;
    const halfBox = boxSize / 2;

    this.bezierNodes = [];
    for (let i = 0; i < nodeCount; i++) {
      // Distribute nodes in a spherical-ellipsoid cloud
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = (0.2 + Math.random() * 0.8) * halfBox;

      this.bezierNodes.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        vx: (Math.random() - 0.5) * 1.8,
        vy: (Math.random() - 0.5) * 1.8,
        vz: (Math.random() - 0.5) * 1.8,
        baseR: r,
        theta,
        phi,
      });
    }

    // Line segments geometry - dynamic buffer allocated for maximum connections
    // Max connections per frame roughly 1000 lines = 2000 vertices = 6000 floats
    const maxLines = Math.min(1800, Math.floor((nodeCount * (nodeCount - 1)) / 4));
    const linePositions = new Float32Array(maxLines * 2 * 3);
    const lineColors = new Float32Array(maxLines * 2 * 3);

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const primCol = new THREE.Color(config.primaryColor);
    const secCol = new THREE.Color(config.secondaryColor);

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      linewidth: s.bezierLineWidth || 1.5,
    });

    this.bezierLinesMesh = new THREE.LineSegments(lineGeo, lineMat);
    this.visualizerGroup.add(this.bezierLinesMesh);

    // Glowing Node Points
    if (s.bezierShowPoints !== false) {
      const pointPositions = new Float32Array(nodeCount * 3);
      const pointColors = new Float32Array(nodeCount * 3);

      for (let i = 0; i < nodeCount; i++) {
        const i3 = i * 3;
        const n = this.bezierNodes[i];
        pointPositions[i3] = n.x;
        pointPositions[i3 + 1] = n.y;
        pointPositions[i3 + 2] = n.z;

        const lerpC = primCol.clone().lerp(secCol, i / nodeCount);
        pointColors[i3] = lerpC.r;
        pointColors[i3 + 1] = lerpC.g;
        pointColors[i3 + 2] = lerpC.b;
      }

      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));
      pGeo.setAttribute('color', new THREE.BufferAttribute(pointColors, 3));

      const pMat = new THREE.PointsMaterial({
        size: s.bezierPointSize || 2.5,
        map: this.getRoundStarTexture(),
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      this.bezierPointsMesh = new THREE.Points(pGeo, pMat);
      this.visualizerGroup.add(this.bezierPointsMesh);
    }

    // Outer subtle cyber boundary frame wireframe box
    const boxGeo = new THREE.BoxGeometry(boxSize * 1.05, boxSize * 1.05, boxSize * 1.05);
    const wireGeo = new THREE.WireframeGeometry(boxGeo);
    const boxMat = new THREE.LineBasicMaterial({
      color: primCol,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
    });
    this.bezierCubeBoxMesh = new THREE.LineSegments(wireGeo, boxMat);
    this.visualizerGroup.add(this.bezierCubeBoxMesh);
  }

  private getRayDotTexture(shape: 'square' | 'circle' | 'star' = 'circle'): THREE.Texture {
    if (this.rayDotTextures.has(shape)) {
      return this.rayDotTextures.get(shape)!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      const tex = new THREE.Texture();
      return tex;
    }

    ctx.clearRect(0, 0, 128, 128);

    if (shape === 'square') {
      ctx.fillStyle = '#ffffff';
      // Sharp clean square with subtle micro-corner smoothing
      const r = 6;
      const x = 16, y = 16, w = 96, h = 96;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
      ctx.fill();
    } else if (shape === 'star') {
      const cx = 64, cy = 64, spikes = 5, outerRadius = 56, innerRadius = 24;
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fill();
    } else {
      // 'circle'
      const radGrad = ctx.createRadialGradient(64, 64, 0, 64, 64, 60);
      radGrad.addColorStop(0, '#ffffff');
      radGrad.addColorStop(0.78, '#ffffff');
      radGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(64, 64, 58, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    this.rayDotTextures.set(shape, texture);
    return texture;
  }

  // =========================================================================
  // 7. 3D Ray Caster Field with Line and Head Dots (Symmetrical Emitter / Mesh Normal Rays)
  // =========================================================================
  private buildRayCaster(config: VisualizerConfig, s: ThreeDVisualizerSettings): void {
    this.clearVisualizerObjects();
    const rayCount = s.rayCount || 160;
    const baseLength = s.rayLength || 16;

    const primCol = new THREE.Color(config.primaryColor);
    const secCol = new THREE.Color(config.secondaryColor);

    // Create Base Core Mesh (Clean spherical 3D emitter)
    const baseGeo = new THREE.IcosahedronGeometry(7.5, 3);
    baseGeo.computeVertexNormals();

    if (s.rayShowCore !== false) {
      const coreMat = new THREE.MeshStandardMaterial({
        color: primCol,
        roughness: 0.35,
        metalness: 0.6,
        wireframe: true,
        transparent: true,
        opacity: s.rayCoreOpacity !== undefined ? s.rayCoreOpacity : 0.85,
        emissive: primCol,
        emissiveIntensity: 0.25,
      });
      this.rayBaseMesh = new THREE.Mesh(baseGeo, coreMat);
      this.visualizerGroup.add(this.rayBaseMesh);
    }

    // Sample ray emission origins & directions (normals) from geometry vertices
    const norm = baseGeo.attributes.normal;
    const pos = baseGeo.attributes.position;
    const vCount = pos.count;

    const actualCount = Math.min(rayCount, vCount);
    this.rayOrigins = new Float32Array(actualCount * 3);
    this.rayDirections = new Float32Array(actualCount * 3);
    this.rayBaseLengths = new Float32Array(actualCount);

    this.rayLinePositions = new Float32Array(actualCount * 2 * 3);
    this.rayDotPositions = new Float32Array(actualCount * 3);

    const lineColors = new Float32Array(actualCount * 2 * 3);
    const dotColors = new Float32Array(actualCount * 3);

    const step = Math.max(1, Math.floor(vCount / actualCount));
    for (let i = 0; i < actualCount; i++) {
      const vIdx = (i * step) % vCount;
      const ox = pos.getX(vIdx);
      const oy = pos.getY(vIdx);
      const oz = pos.getZ(vIdx);

      const nx = norm.getX(vIdx);
      const ny = norm.getY(vIdx);
      const nz = norm.getZ(vIdx);

      const i3 = i * 3;
      this.rayOrigins[i3] = ox;
      this.rayOrigins[i3 + 1] = oy;
      this.rayOrigins[i3 + 2] = oz;

      this.rayDirections[i3] = nx;
      this.rayDirections[i3 + 1] = ny;
      this.rayDirections[i3 + 2] = nz;

      this.rayBaseLengths[i] = baseLength * (0.6 + Math.random() * 0.8);

      const headX = ox + nx * this.rayBaseLengths[i];
      const headY = oy + ny * this.rayBaseLengths[i];
      const headZ = oz + nz * this.rayBaseLengths[i];

      // Line origin
      const l6 = i * 6;
      this.rayLinePositions[l6] = ox;
      this.rayLinePositions[l6 + 1] = oy;
      this.rayLinePositions[l6 + 2] = oz;

      // Line end (ray head)
      this.rayLinePositions[l6 + 3] = headX;
      this.rayLinePositions[l6 + 4] = headY;
      this.rayLinePositions[l6 + 5] = headZ;

      // Head dot
      this.rayDotPositions[i3] = headX;
      this.rayDotPositions[i3 + 1] = headY;
      this.rayDotPositions[i3 + 2] = headZ;

      // Colors: Base is primary, head is secondary/glowing
      lineColors[l6] = primCol.r;
      lineColors[l6 + 1] = primCol.g;
      lineColors[l6 + 2] = primCol.b;

      lineColors[l6 + 3] = secCol.r;
      lineColors[l6 + 4] = secCol.g;
      lineColors[l6 + 5] = secCol.b;

      dotColors[i3] = secCol.r;
      dotColors[i3 + 1] = secCol.g;
      dotColors[i3 + 2] = secCol.b;
    }

    // Line segments mesh
    const rayLineGeo = new THREE.BufferGeometry();
    rayLineGeo.setAttribute('position', new THREE.BufferAttribute(this.rayLinePositions, 3));
    rayLineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const rayLineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    this.rayLinesMesh = new THREE.LineSegments(rayLineGeo, rayLineMat);
    this.visualizerGroup.add(this.rayLinesMesh);

    // Glowing Dots at Head of each Ray (Circle, Square, 5-Point Star)
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.BufferAttribute(this.rayDotPositions, 3));
    dotGeo.setAttribute('color', new THREE.BufferAttribute(dotColors, 3));

    const dotMat = new THREE.PointsMaterial({
      size: s.rayHeadDotSize || 3.0,
      map: this.getRayDotTexture(s.rayDotShape || 'circle'),
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.rayDotsPoints = new THREE.Points(dotGeo, dotMat);
    this.visualizerGroup.add(this.rayDotsPoints);
  }

  private getGalaxyStarTexture(): THREE.Texture {
    if (this.galaxyStarTexture) return this.galaxyStarTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.galaxyStarTexture = new THREE.Texture();
      return this.galaxyStarTexture;
    }

    const cx = 64;
    const cy = 64;

    ctx.clearRect(0, 0, 128, 128);

    // 1. Celestial Light Rays (diffraction spikes with soft glowing falloff)
    const drawRay = (angle: number, length: number, width: number, alpha: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, length);
      grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      grad.addColorStop(0.35, `rgba(255, 255, 255, ${alpha * 0.45})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-width * 0.5, 0);
      ctx.lineTo(0, -length);
      ctx.lineTo(width * 0.5, 0);
      ctx.lineTo(0, length);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    // Primary 4 cardinal light rays (vertical & horizontal)
    drawRay(0, 58, 3.2, 0.9);
    drawRay(Math.PI / 2, 58, 3.2, 0.9);

    // Secondary 4 subtle diagonal light rays
    drawRay(Math.PI / 4, 36, 1.8, 0.45);
    drawRay(-Math.PI / 4, 36, 1.8, 0.45);

    // 2. Outer soft glow & subtle shadow falloff halo
    const outerHalo = ctx.createRadialGradient(cx, cy, 12, cx, cy, 54);
    outerHalo.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
    outerHalo.addColorStop(0.4, 'rgba(255, 255, 255, 0.2)');
    outerHalo.addColorStop(0.85, 'rgba(255, 255, 255, 0.04)');
    outerHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = outerHalo;
    ctx.beginPath();
    ctx.arc(cx, cy, 54, 0, Math.PI * 2);
    ctx.fill();

    // 3. Volumetric 3D Sphere Core (Khối tròn với shadow falloff & chiều sâu)
    const sphereGrad = ctx.createRadialGradient(cx - 3, cy - 3, 0, cx, cy, 22);
    sphereGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    sphereGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.95)');
    sphereGrad.addColorStop(0.7, 'rgba(240, 245, 255, 0.65)');
    sphereGrad.addColorStop(0.95, 'rgba(180, 195, 220, 0.25)'); // shadow falloff rim
    sphereGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sphereGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fill();

    // 4. White-hot center pinpoint
    const centerPoint = ctx.createRadialGradient(cx, cy, 0, cx, cy, 6);
    centerPoint.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    centerPoint.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
    ctx.fillStyle = centerPoint;
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    this.galaxyStarTexture = tex;
    return tex;
  }

  private getRoundStarTexture(): THREE.Texture {
    if (this.roundStarTexture) return this.roundStarTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.roundStarTexture = new THREE.Texture();
      return this.roundStarTexture;
    }

    const cx = 64;
    const cy = 64;
    ctx.clearRect(0, 0, 128, 128);

    // 1. Soft outer stardust glow halo (Vầng sáng hào quang mềm mại)
    const outerHalo = ctx.createRadialGradient(cx, cy, 8, cx, cy, 60);
    outerHalo.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
    outerHalo.addColorStop(0.35, 'rgba(255, 255, 255, 0.28)');
    outerHalo.addColorStop(0.72, 'rgba(255, 255, 255, 0.07)');
    outerHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = outerHalo;
    ctx.beginPath();
    ctx.arc(cx, cy, 60, 0, Math.PI * 2);
    ctx.fill();

    // 2. Volumetric 3D Spherical Core (Khối tròn có chiều sâu đổ bóng & viền mượt)
    const sphereGrad = ctx.createRadialGradient(cx - 3, cy - 3, 0, cx, cy, 32);
    sphereGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    sphereGrad.addColorStop(0.42, 'rgba(255, 255, 255, 0.95)');
    sphereGrad.addColorStop(0.76, 'rgba(245, 248, 255, 0.7)');
    sphereGrad.addColorStop(0.95, 'rgba(200, 215, 240, 0.22)'); // subtle shadow falloff rim
    sphereGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sphereGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.fill();

    // 3. Crisp white-hot center pinpoint
    const centerPoint = ctx.createRadialGradient(cx, cy, 0, cx, cy, 9);
    centerPoint.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    centerPoint.addColorStop(1, 'rgba(255, 255, 255, 0.75)');
    ctx.fillStyle = centerPoint;
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    this.roundStarTexture = tex;
    return tex;
  }

  // =========================================================================
  // 8. 3D Spiral Galaxy (Dải Ngân Hà Xoắn Ốc Vũ Trụ)
  // =========================================================================
  private buildSpiralGalaxy(config: VisualizerConfig, s: ThreeDVisualizerSettings): void {
    this.clearVisualizerObjects();

    const starCount = s.galaxyStarCount || s.galaxyParticleCount || 8500;
    const arms = s.galaxyArms || 4;
    const radius = s.galaxyRadius || 26;
    const spin = s.galaxySpin !== undefined ? s.galaxySpin : 1.25;
    const randomness = s.galaxyRandomness !== undefined ? s.galaxyRandomness : 0.45;
    const power = s.galaxyPower || 3.5;
    const pointSize = s.galaxyPointSize !== undefined ? s.galaxyPointSize : (s.galaxyParticleSize !== undefined ? s.galaxyParticleSize : 2.4);

    // Colors matching cosmic galaxy:
    const primCol = new THREE.Color(config.primaryColor || '#a855f7');
    const secCol = new THREE.Color(config.secondaryColor || '#6366f1');
    const coreHex = s.galaxyCoreColor || '#fffbeb';
    const coreCol = new THREE.Color(coreHex);
    const midCol = new THREE.Color('#f472b6'); // pinkish transition

    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    this.galaxyBasePositions = new Float32Array(starCount * 3);
    this.galaxyBaseColors = new Float32Array(starCount * 3);
    this.galaxyStarRadii = new Float32Array(starCount);
    this.galaxyStarAngles = new Float32Array(starCount);
    this.galaxyStarSpeeds = new Float32Array(starCount);
    this.galaxyStarArms = new Int8Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;

      // Distance from center with higher density toward the core (power curve)
      const rRatio = Math.pow(Math.random(), power);
      const r = rRatio * radius;
      this.galaxyStarRadii[i] = r;

      // Arm assignment & spiral angle
      const armIndex = i % arms;
      this.galaxyStarArms[i] = armIndex;
      const armAngle = (armIndex / arms) * Math.PI * 2;
      const spinAngle = r * spin;

      // Random dispersion / thickness increases with radius
      const randomX = Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? 1 : -1) * randomness * (r * 0.45 + 0.8);
      const randomY = Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? 1 : -1) * (randomness * 0.35) * (r * 0.3 + 0.6);
      const randomZ = Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? 1 : -1) * randomness * (r * 0.45 + 0.8);

      const totalAngle = armAngle + spinAngle;
      this.galaxyStarAngles[i] = totalAngle;
      // Keplerian-like differential orbital velocity (inner stars orbit faster)
      this.galaxyStarSpeeds[i] = (1.0 / (Math.sqrt(r + 1.5))) * (0.8 + Math.random() * 0.4);

      const x = Math.cos(totalAngle) * r + randomX;
      const y = randomY; // Thin disc plane with subtle vertical bulge at center
      const z = Math.sin(totalAngle) * r + randomZ;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      this.galaxyBasePositions[i3] = x;
      this.galaxyBasePositions[i3 + 1] = y;
      this.galaxyBasePositions[i3 + 2] = z;

      // Color gradient from bright white/golden core -> pinkish mid-arms -> violet/deep blue outer rim
      const normR = r / radius;
      let starColor: THREE.Color;
      if (normR < 0.22) {
        // Bright radiant galactic core
        const coreT = normR / 0.22;
        starColor = coreCol.clone().lerp(midCol, coreT * 0.8);
      } else if (normR < 0.6) {
        // Spiral arm nebula body (pink to vibrant purple)
        const midT = (normR - 0.22) / 0.38;
        starColor = midCol.clone().lerp(primCol, midT);
      } else {
        // Outer halo & spiral fringe (purple to cosmic deep blue/violet)
        const outerT = (normR - 0.6) / 0.4;
        starColor = primCol.clone().lerp(secCol, outerT);
      }

      colors[i3] = starColor.r;
      colors[i3 + 1] = starColor.g;
      colors[i3 + 2] = starColor.b;

      this.galaxyBaseColors[i3] = starColor.r;
      this.galaxyBaseColors[i3 + 1] = starColor.g;
      this.galaxyBaseColors[i3 + 2] = starColor.b;
    }

    const galaxyGeo = new THREE.BufferGeometry();
    galaxyGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    galaxyGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material with additive blending and round volumetric star with light rays & shadow
    const galaxyMat = new THREE.PointsMaterial({
      size: pointSize,
      map: this.getGalaxyStarTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.galaxyPoints = new THREE.Points(galaxyGeo, galaxyMat);
    this.visualizerGroup.add(this.galaxyPoints);
  }

  /**
   * Main Render Loop with Audio Spectrum Reactivity & Flowing Light
   */
  public render(
    width: number,
    height: number,
    v: VisualizerConfig,
    freqData: Uint8Array,
    timeData: Uint8Array,
    bassIntensity: number,
    trebleIntensity: number,
    beatIntensity: number,
    currentTime: number
  ): HTMLCanvasElement | null {
    if (!this.ensureRenderer(width, height)) return null;

    const s = v.threeDSettings || {};
    const type = v.type;

    const sphereSig = `${s.sphereRadius || 13}_${s.sphereDetail || 2}_${s.sphereStyle || 'solid-facets'}_${s.sphereMaterial || 'crystal-glass'}_${s.sphereWireframeEdges !== false}_${s.sphereColorMode || 'gradient-duo'}_${v.primaryColor}_${v.secondaryColor}`;
    const needsSphereRebuild = type === '3d-sphere-waveform' && this.sphereBuildSig !== sphereSig;

    const terrainSig = `${s.terrainResolution || 36}_${s.terrainRenderMode || 'wireframe'}_${s.terrainEnvReflection !== false}_${v.primaryColor}_${v.secondaryColor}`;
    const needsTerrainRebuild = type === '3d-wave-terrain' && this.terrainBuildSig !== terrainSig;

    const solarSig = `${s.solarSunSize || 5.5}_${s.solarPlanetCount || 6}_${s.solarPlanetSizeScale !== undefined ? s.solarPlanetSizeScale : 1.0}_${s.solarShowOrbits !== false}_${s.solarAsteroidBelt !== false}_${s.solarSaturnRings !== false}_${s.solarAsteroidCount || 550}_${s.solarStarShape || 'circle'}_${v.primaryColor}_${v.secondaryColor}_${v.tertiaryColor || ''}`;
    const needsSolarRebuild = type === '3d-solar-system' && this.solarBuildSig !== solarSig;

    const cubeSig = `${s.cubeGridSize || 8}_${s.cubeSpacing !== undefined ? s.cubeSpacing : 0.35}_${s.cubeShading || 'standard'}_${v.primaryColor}_${v.secondaryColor}`;
    const needsCubeRebuild = type === '3d-cube-matrix' && this.cubeBuildSig !== cubeSig;

    const fluidSig = `${s.fluidRadius || 12}_${s.fluidDetail || 4}_${s.fluidStyle || 'translucent-glass'}_${s.fluidDroplets !== false}_${v.primaryColor}_${v.secondaryColor}`;
    const needsFluidRebuild = type === '3d-fluid-shape' && this.fluidBuildSig !== fluidSig;

    const bezierSig = `${s.bezierNodeCount || 150}_${s.bezierBoxSize || 36}_${s.bezierMaxDistance || 10}_${v.primaryColor}_${v.secondaryColor}`;
    const needsBezierRebuild = type === '3d-bezier-mesh' && this.bezierBuildSig !== bezierSig;

    const raySig = `${s.rayCount || 160}_${s.rayLength || 16}_${s.rayDotShape || 'circle'}_${s.rayShowCore !== false}_${v.primaryColor}_${v.secondaryColor}`;
    const needsRayRebuild = type === '3d-raycaster' && this.rayBuildSig !== raySig;

    const starCount = s.galaxyStarCount || s.galaxyParticleCount || 8500;
    const galaxySig = `${starCount}_${s.galaxyArms || 4}_${s.galaxyRadius || 26}_${s.galaxySpin !== undefined ? s.galaxySpin : 1.25}_${s.galaxyRandomness !== undefined ? s.galaxyRandomness : 0.45}_${v.primaryColor}_${v.secondaryColor}`;
    const needsGalaxyRebuild = type === '3d-spiral-galaxy' && this.galaxyBuildSig !== galaxySig;

    // Check if visualizer type changed or not built yet
    if (
      this.currentVisualizerType !== type ||
      needsSphereRebuild ||
      needsTerrainRebuild ||
      needsSolarRebuild ||
      needsCubeRebuild ||
      needsFluidRebuild ||
      needsBezierRebuild ||
      needsRayRebuild ||
      needsGalaxyRebuild
    ) {
      this.currentVisualizerType = type;
      switch (type) {
        case '3d-cube-matrix':
          this.cubeBuildSig = cubeSig;
          this.buildCubeMatrix(v, s);
          break;
        case '3d-sphere-waveform':
          this.sphereBuildSig = sphereSig;
          this.buildSphereWaveform(v, s);
          break;
        case '3d-wave-terrain':
          this.terrainBuildSig = terrainSig;
          this.buildWaveTerrain(v, s);
          break;
        case '3d-solar-system':
          this.solarBuildSig = solarSig;
          this.buildSolarSystem(v, s);
          break;
        case '3d-fluid-shape':
          this.fluidBuildSig = fluidSig;
          this.buildFluidShape(v, s);
          break;
        case '3d-bezier-mesh':
          this.bezierBuildSig = bezierSig;
          this.buildBezierMesh(v, s);
          break;
        case '3d-raycaster':
          this.rayBuildSig = raySig;
          this.buildRayCaster(v, s);
          break;
        case '3d-spiral-galaxy':
          this.galaxyBuildSig = galaxySig;
          this.buildSpiralGalaxy(v, s);
          break;
        default:
          this.clearVisualizerObjects();
          break;
      }
    }

    // Delta time calculation
    const dt = Math.min(0.1, this.lastTime > 0 ? currentTime - this.lastTime : 0.016);
    this.lastTime = currentTime;

    // Auto-rotation
    const autoRotate = s.autoRotate ?? true;
    const rotateSpeed = (s.autoRotateSpeed !== undefined ? s.autoRotateSpeed : 1.0) * 0.4;
    if (autoRotate) {
      this.rotationAngle += dt * rotateSpeed;
    }

    // Flowing Light Phase calculation
    const isFlowingLight = s.flowingLight !== false;
    const flowSpeed = (s.flowingLightSpeed !== undefined ? s.flowingLightSpeed : 1.5) * (1 + beatIntensity * 0.5);
    this.flowingLightPhase += dt * flowSpeed * 3.5;

    // Camera angle & positioning
    const defaultDist = type === '3d-solar-system' ? 44 : (type === '3d-spiral-galaxy' ? 42 : 38);
    const camDist = s.cameraDistance || defaultDist;
    const defaultTilt = type === '3d-solar-system' ? 22 : (type === '3d-spiral-galaxy' ? 32 : 0);
    const angleX = (((s.cameraAngleX || 0) + defaultTilt) * Math.PI) / 180;
    const angleY = ((s.cameraAngleY || 0) * Math.PI) / 180 + this.rotationAngle;

    this.camera.position.x = Math.sin(angleY) * Math.cos(angleX) * camDist;
    this.camera.position.y = Math.sin(angleX) * camDist;
    this.camera.position.z = Math.cos(angleY) * Math.cos(angleX) * camDist;
    this.camera.lookAt(0, 0, 0);

    // Apply 3D Spatial Position Offset (Move X, Y, Z) and Rotation (Rotate X, Y, Z)
    const posX = s.moveX || 0;
    const posY = s.moveY || 0;
    const posZ = s.moveZ || 0;
    this.visualizerGroup.position.set(posX, posY, posZ);

    const rotX = (((s.rotateX || 0) * Math.PI) / 180);
    const rotY = (((s.rotateY || 0) * Math.PI) / 180);
    const rotZ = (((s.rotateZ || 0) * Math.PI) / 180);
    this.visualizerGroup.rotation.set(rotX, rotY, rotZ);

    // Update Lighting
    const lightInt = s.lightIntensity !== undefined ? s.lightIntensity : 1.5;
    this.dirLight1.intensity = lightInt * 1.0;
    this.ambientLight.intensity = lightInt * 0.55;

    const pColor = new THREE.Color(v.primaryColor);
    const sColor = new THREE.Color(v.secondaryColor);
    this.pointLight1.color.copy(pColor);
    this.pointLight2.color.copy(sColor);

    const dataLength = freqData.length || 128;
    const amp = v.amplitude * (v.bassBoost ? 1 + bassIntensity * 0.45 : 1) * v.scale;
    const zScale = s.depthScale || 1.0;

    // Flowing light settings
    const flowIntensity = s.flowingLightIntensity !== undefined ? s.flowingLightIntensity : 1.6;
    const flowMode = s.flowingLightMode || 'neon-wave';
    const flowWidth = s.flowingLightWidth !== undefined ? s.flowingLightWidth : 1.2;
    const customFlowColor = s.flowingLightColor ? new THREE.Color(s.flowingLightColor) : null;

    // Animate individual 3D visualizers with Audio Data & Flowing Light
    switch (type) {
      // -------------------------------------------------------------
      // 1. CUBE MATRIX
      // -------------------------------------------------------------
      case '3d-cube-matrix': {
        const heightScale = (s.cubeHeightScale || 1.6) * amp;
        for (let i = 0; i < this.cubeMatrixMeshes.length; i++) {
          const mesh = this.cubeMatrixMeshes[i];
          const { distFromCenter } = mesh.userData;

          // Audio spectrum mapping
          const freqIndex = Math.min(
            dataLength - 1,
            Math.floor(distFromCenter * (dataLength * 0.65))
          );
          const rawVal = freqData[freqIndex] || 0;
          const targetH = Math.max(0.4, (rawVal / 255) * 16 * heightScale * zScale);

          // Smooth height scale
          mesh.scale.y += (targetH - mesh.scale.y) * 0.35;
          mesh.position.y = mesh.scale.y / 2;

          // Flowing Light effect across cubes
          if (isFlowingLight && mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            // Radial or linear light wave traveling outward
            const wave = Math.sin((distFromCenter * 6.5) / flowWidth - this.flowingLightPhase);
            const peak = Math.max(0, (wave - 0.25) / 0.75);

            if (peak > 0) {
              const boost = peak * flowIntensity * (1 + beatIntensity * 0.6);
              mat.emissiveIntensity = mesh.userData.baseEmissive + boost;

              if (flowMode === 'rainbow-stream') {
                const hue = ((this.flowingLightPhase * 20 + distFromCenter * 120) % 360) / 360;
                mat.emissive.setHSL(hue, 1.0, 0.6);
              } else if (customFlowColor) {
                mat.emissive.copy(customFlowColor);
              } else if (flowMode === 'laser-pulse') {
                mat.emissive.copy(sColor);
              }
            } else {
              mat.emissiveIntensity = mesh.userData.baseEmissive;
              mat.emissive.copy(mesh.userData.baseColor);
            }
          }
        }
        break;
      }

      // -------------------------------------------------------------
      // 2. SPHERE WAVEFORM (Quả Cầu Tần Số 3D)
      // -------------------------------------------------------------
      case '3d-sphere-waveform': {
        if (this.sphereMesh && this.sphereOrigPositions) {
          const pos = this.sphereMesh.geometry.attributes.position;
          const orig = this.sphereOrigPositions;
          const spikeScale = (s.sphereSpikeIntensity || 1.4) * amp;

          for (let i = 0; i < pos.count; i++) {
            const i3 = i * 3;
            const ox = orig[i3];
            const oy = orig[i3 + 1];
            const oz = orig[i3 + 2];

            const freqIdx = Math.floor((i / pos.count) * (dataLength * 0.75)) % dataLength;
            const freqVal = (freqData[freqIdx] || 0) / 255;
            const timeVal = ((timeData[freqIdx] || 128) - 128) / 128;

            const disp = 1 + (freqVal * 0.55 + timeVal * 0.25) * spikeScale;
            pos.array[i3] = ox * disp;
            pos.array[i3 + 1] = oy * disp;
            pos.array[i3 + 2] = oz * disp;
          }
          pos.needsUpdate = true;
          this.sphereMesh.geometry.computeVertexNormals();

          // Dynamic polygon transparency & material update
          const opacity = s.sphereOpacity !== undefined ? Math.max(0.05, Math.min(1.0, s.sphereOpacity)) : 0.85;
          const isTransparent = opacity < 0.999;
          const mat = this.sphereMesh.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.transparent = isTransparent;
            mat.opacity = opacity;
            if (s.sphereRoughness !== undefined) mat.roughness = s.sphereRoughness;
            if (s.sphereMetalness !== undefined) mat.metalness = s.sphereMetalness;
            if (mat.wireframe !== undefined && s.sphereStyle !== 'particles') {
              mat.wireframe = s.wireframe || s.sphereStyle === 'wireframe';
            }
          }

          // Dynamic wireframe facet edges
          if (this.sphereWireframeMesh && this.sphereWireframeMesh.material) {
            const wireMat = this.sphereWireframeMesh.material as THREE.MeshBasicMaterial;
            wireMat.color.copy(sColor);
            wireMat.opacity = Math.min(1.0, opacity * 0.75 + 0.15);
          }

          // Dual-shell outer rotation
          if (this.sphereOuterShellMesh) {
            this.sphereOuterShellMesh.rotation.y += dt * 0.45;
            this.sphereOuterShellMesh.rotation.x += dt * 0.2;
          }

          // Audio-reactive facet color pulsing
          if (s.sphereColorMode === 'audio-reactive' && this.sphereVertexColors) {
            const colorsAttr = this.sphereMesh.geometry.attributes.color;
            if (colorsAttr) {
              const baseColors = this.sphereVertexColors;
              const targetArr = colorsAttr.array as Float32Array;
              for (let i = 0; i < pos.count; i++) {
                const i3 = i * 3;
                const freqIdx = Math.floor((i / pos.count) * (dataLength * 0.75)) % dataLength;
                const freqVal = (freqData[freqIdx] || 0) / 255;
                const factor = Math.min(1, freqVal * (1.2 + beatIntensity * 0.5));
                targetArr[i3] = baseColors[i3] * (1 - factor) + sColor.r * factor;
                targetArr[i3 + 1] = baseColors[i3 + 1] * (1 - factor) + sColor.g * factor;
                targetArr[i3 + 2] = baseColors[i3 + 2] * (1 - factor) + sColor.b * factor;
              }
              colorsAttr.needsUpdate = true;
            }
          }

          // Flowing Light on Sphere
          if (isFlowingLight && this.sphereMesh.material) {
            const meshMat = this.sphereMesh.material as THREE.MeshStandardMaterial;
            if (meshMat.emissive) {
              const wave = Math.sin(this.flowingLightPhase * 1.2);
              const peak = Math.max(0, wave);
              const baseEmissive = s.sphereMaterial === 'neon-glow' ? 0.55 : 0.2;
              meshMat.emissiveIntensity = baseEmissive + peak * flowIntensity * (1 + beatIntensity * 0.5);

              if (flowMode === 'rainbow-stream') {
                const hue = ((this.flowingLightPhase * 30) % 360) / 360;
                meshMat.emissive.setHSL(hue, 1.0, 0.6);
              } else if (customFlowColor) {
                meshMat.emissive.copy(customFlowColor);
              } else if (peak > 0.4) {
                meshMat.emissive.copy(sColor);
              } else {
                meshMat.emissive.copy(pColor);
              }
            }
          }
        }
        break;
      }

      // -------------------------------------------------------------
      // 3. WAVE TERRAIN (Địa Hình Cyberpunk 3D)
      // -------------------------------------------------------------
      case '3d-wave-terrain': {
        if (this.terrainMesh && this.terrainOrigPositions) {
          const pos = this.terrainMesh.geometry.attributes.position;
          const orig = this.terrainOrigPositions;
          const hScale = (s.terrainHeightScale || 1.4) * amp;
          const flySpeed = (s.terrainSpeed || 1.0) * 2.0;

          for (let i = 0; i < pos.count; i++) {
            const i3 = i * 3;
            const ox = orig[i3];
            const oy = orig[i3 + 1];
            const oz = orig[i3 + 2];

            const freqIdx = Math.min(dataLength - 1, Math.floor((Math.abs(ox) / 30) * (dataLength * 0.7)));
            const freqVal = (freqData[freqIdx] || 0) / 255;
            const wave = Math.sin(oz * 0.3 - currentTime * flySpeed) * (freqVal * 6 * hScale);

            pos.array[i3 + 1] = oy + wave;
          }
          pos.needsUpdate = true;

          const mode = s.terrainRenderMode || 'wireframe';
          const isWireframe = mode === 'wireframe';
          const hasSolid = mode === 'solid' || mode === 'solid-wireframe';

          if (hasSolid) {
            this.terrainMesh.geometry.computeVertexNormals();
          }

          // Dynamic material update
          const mat = this.terrainMesh.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.wireframe = isWireframe;
            if (s.terrainRoughness !== undefined) mat.roughness = s.terrainRoughness;
            if (s.terrainMetalness !== undefined) mat.metalness = s.terrainMetalness;
            const opacity = s.terrainOpacity !== undefined ? Math.max(0.1, Math.min(1.0, s.terrainOpacity)) : 0.95;
            mat.transparent = opacity < 0.999;
            mat.opacity = opacity;

            if (s.terrainEnvReflection !== false && hasSolid) {
              mat.envMap = this.getEnvTexture();
              mat.envMapIntensity = s.terrainReflectionIntensity !== undefined ? s.terrainReflectionIntensity : 0.85;
            } else if (!hasSolid) {
              mat.envMap = null;
            }
          }

          // Wireframe overlay sync
          if (this.terrainWireOverlayMesh) {
            this.terrainWireOverlayMesh.visible = mode === 'solid-wireframe';
          }

          // Flowing Light across terrain surface
          if (isFlowingLight && this.terrainMesh.material) {
            const mat = this.terrainMesh.material as THREE.MeshStandardMaterial;
            const wave = Math.sin(this.flowingLightPhase * 1.5);
            mat.emissiveIntensity = (hasSolid ? 0.18 : 0.35) + Math.max(0, wave) * flowIntensity * (1 + bassIntensity * 0.6);
            if (customFlowColor) {
              mat.emissive.copy(customFlowColor);
            } else if (flowMode === 'rainbow-stream') {
              const hue = ((this.flowingLightPhase * 25) % 360) / 360;
              mat.emissive.setHSL(hue, 1.0, 0.6);
            }
          }
        }
        break;
      }

      // -------------------------------------------------------------
      // 4. SOLAR SYSTEM & PLANETARY GALAXY (Hệ Thiên Hà 3D)
      // -------------------------------------------------------------
      case '3d-solar-system': {
        const pulseMult = (s.solarSunPulse !== undefined ? s.solarSunPulse : 1.5) * amp;
        const orbitSpeedScale = (s.solarOrbitSpeed !== undefined ? s.solarOrbitSpeed : 1.0);

        // 1. Animate Sun & Corona
        if (this.solarSunMesh) {
          const sunBounce = 1 + (bassIntensity * 0.35 + beatIntensity * 0.25) * pulseMult;
          this.solarSunMesh.scale.set(sunBounce, sunBounce, sunBounce);
          this.solarSunMesh.rotation.y += dt * 0.3;

          if (isFlowingLight && this.solarSunMesh.material) {
            const mat = this.solarSunMesh.material as THREE.MeshStandardMaterial;
            const wave = Math.sin(this.flowingLightPhase * 2.0);
            mat.emissiveIntensity = 1.0 + Math.max(0, wave) * flowIntensity * 0.8 + beatIntensity * 0.5;
          }
        }

        if (this.solarCoronaMesh) {
          const coronaBounce = 1 + beatIntensity * 0.45 * pulseMult;
          this.solarCoronaMesh.scale.set(coronaBounce, coronaBounce, coronaBounce);
          this.solarCoronaMesh.rotation.y -= dt * 0.5;
          this.solarCoronaMesh.rotation.x += dt * 0.2;
        }

        // 2. Animate Solar Flares
        if (this.solarFlares && this.solarFlarePositions) {
          const pos = this.solarFlares.geometry.attributes.position;
          const orig = this.solarFlarePositions;
          const burst = 1 + beatIntensity * 0.55 * pulseMult;

          for (let i = 0; i < pos.count; i++) {
            const i3 = i * 3;
            pos.array[i3] = orig[i3] * burst;
            pos.array[i3 + 1] = orig[i3 + 1] * burst;
            pos.array[i3 + 2] = orig[i3 + 2] * burst;
          }
          pos.needsUpdate = true;
          this.solarFlares.rotation.y += dt * 0.25;
        }

        // 3. Animate Planets
        for (let i = 0; i < this.solarPlanets.length; i++) {
          const p = this.solarPlanets[i];
          // Revolution around Sun
          p.angle += dt * p.speed * orbitSpeedScale * (0.8 + beatIntensity * 0.3);

          const px = Math.cos(p.angle) * p.orbitRadius;
          const pz = Math.sin(p.angle) * p.orbitRadius;
          p.mesh.position.set(px, 0, pz);
          p.mesh.rotation.y += dt * 2.5;

          // Moon revolution
          if (p.moonMesh) {
            p.moonMesh.position.x = Math.cos(p.angle * 4.5) * 2.2;
            p.moonMesh.position.z = Math.sin(p.angle * 4.5) * 2.2;
          }

          // Saturn ring tilt spin
          if (p.ringMesh) {
            p.ringMesh.visible = s.solarSaturnRings !== false;
            p.ringMesh.rotation.z += dt * 0.4;
          }

          if (p.orbitLine) {
            p.orbitLine.visible = s.solarShowOrbits !== false;
          }

          // Flowing Light along planetary orbit
          if (isFlowingLight) {
            const wave = Math.sin((p.orbitRadius * 0.4) - this.flowingLightPhase);
            const peak = Math.max(0, wave);

            if (p.mesh.material) {
              const mat = p.mesh.material as THREE.MeshStandardMaterial;
              mat.emissiveIntensity = 0.35 + peak * flowIntensity * (1 + beatIntensity * 0.5);
            }
            if (p.orbitLine && p.orbitLine.material) {
              const oMat = p.orbitLine.material as THREE.LineBasicMaterial;
              oMat.opacity = 0.25 + peak * 0.65;
            }
          }
        }

        // 4. Animate Asteroid Belt
        if (this.asteroidBeltPoints) {
          this.asteroidBeltPoints.visible = s.solarAsteroidBelt !== false;
          // Dynamic star point size update from settings
          if (this.asteroidBeltPoints.material) {
            const bMat = this.asteroidBeltPoints.material as THREE.PointsMaterial;
            const targetSize = s.solarAsteroidSize !== undefined ? s.solarAsteroidSize : 1.8;
            if (bMat.size !== targetSize) {
              bMat.size = targetSize;
            }
          }
          this.asteroidBeltPoints.rotation.y += dt * 0.2 * orbitSpeedScale;
          const pos = this.asteroidBeltPoints.geometry.attributes.position;
          // Subtly ripple asteroids to treble / mid frequencies
          const midVal = (freqData[Math.floor(dataLength * 0.3)] || 0) / 255;
          this.asteroidBeltPoints.scale.y = 1 + midVal * 0.6 * amp;
        }
        break;
      }

      // -------------------------------------------------------------
      // 5. 3D TRANSPARENT FLUID SHAPE (Pulsing to music rhythm)
      // -------------------------------------------------------------
      case '3d-fluid-shape': {
        this.fluidTime += dt * (s.fluidSpeed || 1.2) * (1.0 + beatIntensity * 0.4);
        const ft = this.fluidTime;
        const radius = s.fluidRadius || 12;

        if (this.fluidMesh && this.fluidOrigPositions && this.fluidOrigNormals) {
          const pos = this.fluidMesh.geometry.attributes.position;
          const orig = this.fluidOrigPositions;
          const origNorm = this.fluidOrigNormals;
          const turbulence = (s.fluidTurbulence !== undefined ? s.fluidTurbulence : 1.5) * amp;

          // Bass rhythm pulse: dynamic volumetric expansion on kicks/beats
          const bassPulse = 1.0 + (bassIntensity * 0.38 + beatIntensity * 0.32) * amp;

          for (let i = 0; i < pos.count; i++) {
            const i3 = i * 3;
            const ox = orig[i3];
            const oy = orig[i3 + 1];
            const oz = orig[i3 + 2];

            // Spherical mapping to audio spectrum bins
            const angle = Math.atan2(oz, ox);
            const normY = oy / radius;
            const freqIdx = Math.abs(Math.floor(((angle + Math.PI) / (Math.PI * 2) * 0.65 + (normY + 1) * 0.15) * dataLength)) % dataLength;
            const audioVal = (freqData[freqIdx] || 0) / 255;
            const timeVal = ((timeData[freqIdx] || 128) - 128) / 128;

            // Organic 3D fluid harmonic turbulence (multi-octave sine/cosine flow field)
            const n1 = Math.sin(ox * 0.35 + ft * 1.7) * Math.cos(oy * 0.38 + ft * 1.3) * Math.sin(oz * 0.42 + ft * 1.5);
            const n2 = Math.sin(ox * 0.72 - ft * 2.1) * Math.sin(oy * 0.68 + ft * 1.8) * Math.cos(oz * 0.74 - ft * 1.9) * 0.5;
            const n3 = Math.cos((ox + oy + oz) * 0.28 + ft * 2.7) * 0.3;
            const fluidWave = (n1 + n2 + n3) * turbulence;

            // Dynamic displacement: Bass volumetric pulse + fluid harmonic waves + frequency ripples
            const disp = bassPulse * (1.0 + fluidWave * 0.28 + audioVal * turbulence * 0.45 + timeVal * 0.16);

            pos.array[i3] = ox * disp;
            pos.array[i3 + 1] = oy * disp;
            pos.array[i3 + 2] = oz * disp;
          }
          pos.needsUpdate = true;

          // Recompute vertex normals for dynamic glossy fluid surface reflections & highlights
          this.fluidMesh.geometry.computeVertexNormals();

          // Pulsing fluid material response & Flowing Light wave
          if (this.fluidMesh.material) {
            const mat = this.fluidMesh.material as THREE.MeshPhysicalMaterial;

            // Wireframe dynamic toggle
            mat.wireframe = !!s.fluidWireframe || !!s.wireframe;

            // Opacity & Transmission (0-100% full dynamic responsiveness)
            const opacity = s.fluidOpacity !== undefined ? Math.max(0.0, Math.min(1.0, s.fluidOpacity)) : 0.72;
            const transmission = s.fluidTransmission !== undefined 
              ? s.fluidTransmission 
              : (s.fluidStyle === 'liquid-chrome' ? 0.2 : 0.65);
            const isOpaque = opacity >= 0.999 && transmission <= 0.02;
            mat.transparent = !isOpaque;
            mat.opacity = Math.max(0.02, opacity);
            mat.transmission = transmission;
            mat.depthWrite = opacity > 0.85;

            // Environment Reflection
            const enableReflection = s.fluidEnvReflection !== false;
            if (enableReflection) {
              mat.envMap = this.getEnvTexture();
              mat.envMapIntensity = s.fluidReflectionIntensity !== undefined ? s.fluidReflectionIntensity : 0.85;
            } else {
              mat.envMap = null;
              mat.envMapIntensity = 0;
            }

            const baseEmissive = 0.25;
            const beatGlow = beatIntensity * 0.55 * amp;

            if (isFlowingLight) {
              const wave = Math.sin(this.flowingLightPhase * 1.4);
              const peak = Math.max(0, wave);
              const bassGlow = (s.bloomBassBoost !== false) ? bassIntensity * 0.9 * amp : 0;
              mat.emissiveIntensity = baseEmissive + beatGlow + bassGlow + peak * flowIntensity * 0.7;

              if (flowMode === 'rainbow-stream') {
                const hue = ((this.flowingLightPhase * 25) % 360) / 360;
                mat.emissive.setHSL(hue, 1.0, 0.6);
              } else if (customFlowColor) {
                mat.emissive.copy(customFlowColor);
              } else if (peak > 0.4) {
                mat.emissive.copy(sColor);
              } else {
                mat.emissive.copy(pColor);
              }
            } else {
              const bassGlow = (s.bloomBassBoost !== false) ? bassIntensity * 0.9 * amp : 0;
              mat.emissiveIntensity = baseEmissive + beatGlow + bassGlow;
            }

            // Subtle rotation of fluid mesh for organic liquid flow
            this.fluidMesh.rotation.y += dt * 0.15;
            this.fluidMesh.rotation.x += dt * 0.08;
          }
        }

        // Floating micro fluid droplets / bubbles animation
        if (this.fluidDropletsPoints) {
          this.fluidDropletsPoints.visible = s.fluidDroplets !== false;
        }
        if (this.fluidDropletsPoints && this.fluidDropletsData.length > 0 && s.fluidDroplets !== false) {
          const dPos = this.fluidDropletsPoints.geometry.attributes.position;
          const trebleVal = trebleIntensity * 0.45 * amp;

          for (let i = 0; i < this.fluidDropletsData.length; i++) {
            const d = this.fluidDropletsData[i];
            d.angle += dt * d.speed * (1.0 + beatIntensity * 0.4);
            const currentR = d.baseR * (1.0 + trebleVal + Math.sin(d.angle * 3 + ft) * 0.08);

            const i3 = i * 3;
            dPos.array[i3] = Math.cos(d.angle) * currentR;
            dPos.array[i3 + 1] = d.y + Math.sin(ft * 2 + d.angle) * 1.5;
            dPos.array[i3 + 2] = Math.sin(d.angle) * currentR;
          }
          dPos.needsUpdate = true;
          this.fluidDropletsPoints.rotation.y += dt * 0.1;
        }
        break;
      }

      // =====================================================================
      // 6. 3D Bezier Polygon Line Network (Plexus / Constellation Web)
      // =====================================================================
      case '3d-bezier-mesh': {
        const nodeCount = this.bezierNodes.length;
        if (nodeCount === 0) break;

        const maxDist = s.bezierMaxDistance || 10;
        const maxDistSq = maxDist * maxDist;
        const boxSize = s.bezierBoxSize || 36;
        const halfBox = boxSize / 2;
        const speed = (s.bezierSpeed !== undefined ? s.bezierSpeed : 1.0) * (1 + beatIntensity * 0.4);
        const audioDisp = (s.bezierAudioDisplace !== undefined ? s.bezierAudioDisplace : 1.4) * amp;

        // Animate nodes with velocity and audio frequencies
        for (let i = 0; i < nodeCount; i++) {
          const node = this.bezierNodes[i];
          const freqSample = (freqData[i % dataLength] / 255) * audioDisp;

          node.x += node.vx * dt * speed;
          node.y += node.vy * dt * speed;
          node.z += node.vz * dt * speed;

          // Bounce back within bounding spherical box
          if (node.x > halfBox) { node.x = halfBox; node.vx = -Math.abs(node.vx); }
          else if (node.x < -halfBox) { node.x = -halfBox; node.vx = Math.abs(node.vx); }

          if (node.y > halfBox) { node.y = halfBox; node.vy = -Math.abs(node.vy); }
          else if (node.y < -halfBox) { node.y = -halfBox; node.vy = Math.abs(node.vy); }

          if (node.z > halfBox) { node.z = halfBox; node.vz = -Math.abs(node.vz); }
          else if (node.z < -halfBox) { node.z = -halfBox; node.vz = Math.abs(node.vz); }
        }

        // Update Points Geometry
        if (this.bezierPointsMesh) {
          const pPos = this.bezierPointsMesh.geometry.attributes.position;
          for (let i = 0; i < nodeCount; i++) {
            const i3 = i * 3;
            const n = this.bezierNodes[i];
            const fP = (freqData[(i * 3) % dataLength] / 255) * audioDisp * 1.5;
            pPos.array[i3] = n.x + (n.x / halfBox) * fP;
            pPos.array[i3 + 1] = n.y + (n.y / halfBox) * fP;
            pPos.array[i3 + 2] = n.z + (n.z / halfBox) * fP;
          }
          pPos.needsUpdate = true;
          this.bezierPointsMesh.rotation.y += dt * 0.05;
        }

        // Connect nearby nodes with dynamic Bezier polygon lines
        if (this.bezierLinesMesh) {
          const lPos = this.bezierLinesMesh.geometry.attributes.position;
          const lCol = this.bezierLinesMesh.geometry.attributes.color;
          const maxLines = lPos.count / 2;
          let lineIdx = 0;

          const pCol = new THREE.Color(v.primaryColor);
          const sCol = new THREE.Color(v.secondaryColor);

          // Flowing light color interpolation
          let activeLightCol = sCol;
          if (isFlowingLight) {
            if (flowMode === 'rainbow-stream') {
              const hue = ((this.flowingLightPhase * 25) % 360) / 360;
              activeLightCol = new THREE.Color().setHSL(hue, 1.0, 0.6);
            } else if (customFlowColor) {
              activeLightCol = customFlowColor;
            }
          }

          for (let i = 0; i < nodeCount && lineIdx < maxLines; i++) {
            const n1 = this.bezierNodes[i];
            for (let j = i + 1; j < nodeCount && lineIdx < maxLines; j++) {
              const n2 = this.bezierNodes[j];
              const dx = n1.x - n2.x;
              const dy = n1.y - n2.y;
              const dz = n1.z - n2.z;
              const distSq = dx * dx + dy * dy + dz * dz;

              if (distSq < maxDistSq) {
                const distRatio = 1.0 - Math.sqrt(distSq) / maxDist;
                const v6 = lineIdx * 6;

                // Vertex 1
                lPos.array[v6] = n1.x;
                lPos.array[v6 + 1] = n1.y;
                lPos.array[v6 + 2] = n1.z;

                // Vertex 2
                lPos.array[v6 + 3] = n2.x;
                lPos.array[v6 + 4] = n2.y;
                lPos.array[v6 + 5] = n2.z;

                // Colors weighted by proximity and flowing light
                const alphaMod = distRatio * (0.6 + beatIntensity * 0.5);
                const c1 = pCol.clone().lerp(activeLightCol, (i / nodeCount + Math.sin(this.flowingLightPhase + i)) * 0.5).multiplyScalar(alphaMod);
                const c2 = sCol.clone().lerp(activeLightCol, (j / nodeCount + Math.cos(this.flowingLightPhase + j)) * 0.5).multiplyScalar(alphaMod);

                lCol.array[v6] = c1.r;
                lCol.array[v6 + 1] = c1.g;
                lCol.array[v6 + 2] = c1.b;

                lCol.array[v6 + 3] = c2.r;
                lCol.array[v6 + 4] = c2.g;
                lCol.array[v6 + 5] = c2.b;

                lineIdx++;
              }
            }
          }

          // Zero out remaining lines in buffer
          for (let k = lineIdx; k < maxLines; k++) {
            const v6 = k * 6;
            lPos.array[v6] = 0;
            lPos.array[v6 + 1] = 0;
            lPos.array[v6 + 2] = 0;
            lPos.array[v6 + 3] = 0;
            lPos.array[v6 + 4] = 0;
            lPos.array[v6 + 5] = 0;

            lCol.array[v6] = 0;
            lCol.array[v6 + 1] = 0;
            lCol.array[v6 + 2] = 0;
            lCol.array[v6 + 3] = 0;
            lCol.array[v6 + 4] = 0;
            lCol.array[v6 + 5] = 0;
          }

          lPos.needsUpdate = true;
          lCol.needsUpdate = true;
        }

        if (this.bezierCubeBoxMesh) {
          this.bezierCubeBoxMesh.rotation.y += dt * 0.08;
          this.bezierCubeBoxMesh.rotation.x += dt * 0.04;
        }
        break;
      }

      // =====================================================================
      // 7. 3D Ray Caster Field with Line and Head Dots (Stanford Bunny / Mesh Normal Rays)
      // =====================================================================
      case '3d-raycaster': {
        if (!this.rayOrigins || !this.rayDirections || !this.rayBaseLengths || !this.rayLinesMesh || !this.rayDotsPoints) {
          break;
        }

        const count = this.rayBaseLengths.length;
        const linePos = this.rayLinesMesh.geometry.attributes.position;
        const dotPos = this.rayDotsPoints.geometry.attributes.position;
        const lineCol = this.rayLinesMesh.geometry.attributes.color;
        const dotCol = this.rayDotsPoints.geometry.attributes.color;

        const pulseScale = (s.rayAudioPulse !== undefined ? s.rayAudioPulse : 1.5) * amp;
        const beatKick = beatIntensity * 2.0;

        const pCol = new THREE.Color(v.primaryColor);
        const sCol = new THREE.Color(v.secondaryColor);

        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          const l6 = i * 6;

          const ox = this.rayOrigins[i3];
          const oy = this.rayOrigins[i3 + 1];
          const oz = this.rayOrigins[i3 + 2];

          const nx = this.rayDirections[i3];
          const ny = this.rayDirections[i3 + 1];
          const nz = this.rayDirections[i3 + 2];

          // Sample audio frequencies
          const freqVal = (freqData[(i * 4) % dataLength] / 255);
          const currentLen = this.rayBaseLengths[i] * (1.0 + freqVal * pulseScale + beatKick * 0.35);

          const hx = ox + nx * currentLen;
          const hy = oy + ny * currentLen;
          const hz = oz + nz * currentLen;

          // Update ray line vertices
          linePos.array[l6] = ox;
          linePos.array[l6 + 1] = oy;
          linePos.array[l6 + 2] = oz;

          linePos.array[l6 + 3] = hx;
          linePos.array[l6 + 4] = hy;
          linePos.array[l6 + 5] = hz;

          // Update ray head dot
          dotPos.array[i3] = hx;
          dotPos.array[i3 + 1] = hy;
          dotPos.array[i3 + 2] = hz;

          // Dynamic colors: Flowing light wave along rays
          if (isFlowingLight) {
            const rayPhase = (this.flowingLightPhase + i * 0.08) % (Math.PI * 2);
            const rayGlow = Math.max(0, Math.sin(rayPhase));

            let headColor = sCol.clone();
            if (flowMode === 'rainbow-stream') {
              const hue = ((this.flowingLightPhase * 20 + i * 2) % 360) / 360;
              headColor.setHSL(hue, 1.0, 0.6);
            } else if (customFlowColor) {
              headColor.copy(customFlowColor);
            }

            const litHead = headColor.lerp(new THREE.Color(0xffffff), rayGlow * 0.6);
            dotCol.array[i3] = litHead.r;
            dotCol.array[i3 + 1] = litHead.g;
            dotCol.array[i3 + 2] = litHead.b;

            lineCol.array[l6 + 3] = litHead.r;
            lineCol.array[l6 + 4] = litHead.g;
            lineCol.array[l6 + 5] = litHead.b;
          }
        }

        linePos.needsUpdate = true;
        dotPos.needsUpdate = true;
        lineCol.needsUpdate = true;
        dotCol.needsUpdate = true;

        // Dynamic head dot updates (size and shape texture: square, circle, star)
        if (this.rayDotsPoints && this.rayDotsPoints.material) {
          const dotMat = this.rayDotsPoints.material as THREE.PointsMaterial;
          if (s.rayHeadDotSize !== undefined && dotMat.size !== s.rayHeadDotSize) {
            dotMat.size = s.rayHeadDotSize;
          }
          const desiredTex = this.getRayDotTexture(s.rayDotShape || 'circle');
          if (dotMat.map !== desiredTex) {
            dotMat.map = desiredTex;
            dotMat.needsUpdate = true;
          }
        }

        // Subtle model core oscillation and visibility
        if (this.rayBaseMesh) {
          this.rayBaseMesh.visible = s.rayShowCore !== false;
          const coreBeat = 1.0 + beatIntensity * 0.18;
          this.rayBaseMesh.scale.set(coreBeat, coreBeat, coreBeat);
          this.rayBaseMesh.rotation.y += dt * 0.25;
        }

        this.rayLinesMesh.rotation.y += dt * 0.25;
        this.rayDotsPoints.rotation.y += dt * 0.25;
        break;
      }

      case '3d-spiral-galaxy': {
        if (!this.galaxyPoints || !this.galaxyBasePositions || !this.galaxyBaseColors || !this.galaxyStarRadii || !this.galaxyStarAngles) break;

        // Dynamic star point size update from settings
        if (this.galaxyPoints.material) {
          const pMat = this.galaxyPoints.material as THREE.PointsMaterial;
          const targetSize = s.galaxyPointSize !== undefined ? s.galaxyPointSize : (s.galaxyParticleSize !== undefined ? s.galaxyParticleSize : 2.4);
          if (pMat.size !== targetSize) {
            pMat.size = targetSize;
          }
        }

        const posAttr = this.galaxyPoints.geometry.attributes.position as THREE.BufferAttribute;
        const colAttr = this.galaxyPoints.geometry.attributes.color as THREE.BufferAttribute;
        const count = this.galaxyStarRadii.length;

        const swirlSpeed = (s.galaxySwirlSpeed !== undefined ? s.galaxySwirlSpeed : 1.0) * 0.6;
        const audioDisplace = (s.galaxyAudioDisplace !== undefined ? s.galaxyAudioDisplace : 1.4);

        const bassPulse = bassIntensity * amp * 1.5;
        const beatKick = beatIntensity * 0.45;
        const trebleShimmer = trebleIntensity * 0.35;

        // Animate individual stars in orbital motion
        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          const r = this.galaxyStarRadii[i];
          const speed = this.galaxyStarSpeeds ? this.galaxyStarSpeeds[i] : 1.0;

          // Frequency sampling tied to radial distance:
          // Center reacts to bass, outer arms react to mid & treble
          const normR = Math.min(1.0, r / (s.galaxyRadius || 26));
          const freqIndex = Math.min(dataLength - 1, Math.floor(normR * (dataLength - 1)));
          const freqVal = (freqData[freqIndex] / 255);

          // Update orbital angle with differential rotation (inner faster than outer)
          const angleDelta = dt * swirlSpeed * speed * (1.0 + beatKick * 0.3);
          this.galaxyStarAngles[i] += angleDelta;
          const currentAngle = this.galaxyStarAngles[i];

          // Audio-reactive radial & vertical breathing waves
          const audioRadialExpansion = 1.0 + (freqVal * 0.22 + bassPulse * (1.0 - normR * 0.6)) * audioDisplace;
          const currentR = r * audioRadialExpansion;

          // Base offsets
          const baseOx = this.galaxyBasePositions[i3];
          const baseY = this.galaxyBasePositions[i3 + 1];
          const baseOz = this.galaxyBasePositions[i3 + 2];
          const jitterX = baseOx - Math.cos(currentAngle - angleDelta) * r;
          const jitterZ = baseOz - Math.sin(currentAngle - angleDelta) * r;

          // Vertical undulation / harmonic ripple along the arms
          const armIndex = this.galaxyStarArms ? this.galaxyStarArms[i] : 0;
          const verticalWave = Math.sin(currentAngle * 2 + armIndex * Math.PI + currentTime * 2.0) * (normR * 1.2) * (1.0 + freqVal * 1.5);

          posAttr.array[i3] = Math.cos(currentAngle) * currentR + jitterX;
          posAttr.array[i3 + 1] = baseY * (1.0 + bassPulse * 0.4) + verticalWave * audioDisplace;
          posAttr.array[i3 + 2] = Math.sin(currentAngle) * currentR + jitterZ;

          // Star color & brightness pulsing
          const baseR = this.galaxyBaseColors[i3];
          const baseG = this.galaxyBaseColors[i3 + 1];
          const baseB = this.galaxyBaseColors[i3 + 2];

          // Pulsing brightness: inner region reacts to bass; outer arms sparkle with treble
          let brightnessBoost = 1.0;
          if (normR < 0.25) {
            brightnessBoost = 1.0 + bassPulse * 1.1;
          } else {
            brightnessBoost = 1.0 + freqVal * 0.7 + trebleShimmer;
          }

          // Flowing light ripple across spiral arms
          if (isFlowingLight) {
            const flowArmPhase = (this.flowingLightPhase + armIndex * (Math.PI / 2) + normR * 4.0) % (Math.PI * 2);
            const armGlow = Math.max(0, Math.sin(flowArmPhase));
            brightnessBoost += armGlow * (flowIntensity * 0.35);
          }

          colAttr.array[i3] = Math.min(1.0, baseR * brightnessBoost);
          colAttr.array[i3 + 1] = Math.min(1.0, baseG * brightnessBoost);
          colAttr.array[i3 + 2] = Math.min(1.0, baseB * brightnessBoost);
        }

        posAttr.needsUpdate = true;
        colAttr.needsUpdate = true;
        break;
      }
    }

    // Render WebGL frame: with Global Post-Processing Bloom or standard renderer
    const isBloomActive = s.bloomEnabled !== false;

    if (isBloomActive && this.composer && this.bloomPass) {
      // Configure base Bloom parameters from settings
      const baseStrength = s.bloomStrength !== undefined ? s.bloomStrength : 1.6;
      const baseRadius = s.bloomRadius !== undefined ? s.bloomRadius : 0.75;
      const baseThreshold = s.bloomThreshold !== undefined ? s.bloomThreshold : 0.15;
      const isBassBoost = s.bloomBassBoost !== false;

      // Audio-reactive bloom boost: intense burst during high-energy bass and beat kicks
      let dynamicBloomStrength = baseStrength;
      let dynamicThreshold = baseThreshold;

      if (isBassBoost) {
        // Bass intensity (0-1) and beatIntensity kick (0-1)
        const bassKick = Math.pow(bassIntensity, 1.4) * 2.2;
        const beatKick = Math.pow(beatIntensity, 1.3) * 1.5;
        const combinedEnergy = (bassKick * 0.65 + beatKick * 0.35) * Math.min(2.0, amp);

        // Scale strength dynamically on loud bass drops
        dynamicBloomStrength = baseStrength + combinedEnergy * 1.4;

        // Lower threshold slightly during peak bass moments to make more geometry glow intensely
        dynamicThreshold = Math.max(0.02, baseThreshold - (bassIntensity * 0.12));
      }

      this.bloomPass.strength = dynamicBloomStrength;
      this.bloomPass.radius = baseRadius;
      this.bloomPass.threshold = dynamicThreshold;

      this.composer.render(dt);
    } else if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }

    return this.canvas;
  }
}

// Singleton export
export const threeDVisualizerEngine = new ThreeDVisualizerEngine();
