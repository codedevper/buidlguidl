import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ChallengeId, CameraMode } from '../types/game';
import { CHALLENGES } from '../solidity/contractsData';

// Reusable scratch objects to eliminate GC in render loop
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _vec3C = new THREE.Vector3();

export interface StationHitInfo {
  challengeId: ChallengeId;
  distance: number;
}

export class SceneManager {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;
  private frameId: number = 0;
  private isDestroyed: boolean = false;
  private isSoftwareGl: boolean = false;

  // Camera & Navigation
  private cameraMode: CameraMode = 'flyover';
  private cameraTarget: THREE.Vector3 = new THREE.Vector3(0, 2, 0);
  private cameraPos: THREE.Vector3 = new THREE.Vector3(0, 18, 28);
  private flyoverAngle: number = 0;

  // Player / Avatar
  private playerGroup: THREE.Group = new THREE.Group();
  private playerPos: THREE.Vector3 = new THREE.Vector3(0, 0, 5);
  private playerVel: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private playerRot: number = 0;
  private isMoving: boolean = false;
  private moveKeys: { [key: string]: boolean } = {};
  private avatarLimbs: {
    leftLeg?: THREE.Mesh;
    rightLeg?: THREE.Mesh;
    leftArm?: THREE.Mesh;
    rightArm?: THREE.Mesh;
    hardHat?: THREE.Group;
  } = {};

  // Animated Scene Components
  private ethDiamondGroup: THREE.Group = new THREE.Group();
  private stakingEnergyPillar?: THREE.Mesh;
  private diceGroup: THREE.Group = new THREE.Group();
  private diceHashRings: THREE.Group[] = [];
  private dexCoreGroup: THREE.Group = new THREE.Group();
  private multisigDials: THREE.Mesh[] = [];
  private loogieTankGroup: THREE.Group = new THREE.Group();
  private swimmingLoogies: { group: THREE.Group; speed: number; phase: number; radius: number }[] = [];
  private stationMeshes: Map<ChallengeId, THREE.Group> = new Map();
  private ambientParticles?: THREE.Points;

  // Interactivity Callbacks
  public onNearStationChange?: (info: StationHitInfo | null) => void;
  public onStationClicked?: (id: ChallengeId) => void;
  private currentNearStation: StationHitInfo | null = null;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();

  constructor(container: HTMLElement) {
    this.container = container;
    this.clock = new THREE.Clock();

    // 1. Detect software WebGL from GPU renderer string
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // 2. Setup WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);

    this.container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera setup
    this.scene = new THREE.Scene();
    const skyColor = 0x090d16;
    this.scene.background = new THREE.Color(skyColor);
    this.scene.fog = new THREE.FogExp2(skyColor, 0.015);

    this.camera = new THREE.PerspectiveCamera(
      48,
      container.clientWidth / container.clientHeight,
      0.1,
      250
    );
    this.camera.position.set(0, 18, 28);
    this.camera.lookAt(0, 2, 0);

    // 4. RoomEnvironment for realistic PBR metalness/roughness reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Studio Lighting Rig
    this.setupLighting();

    // 6. World Terrain, Castle & Challenge Stations
    this.buildTerrain();
    this.buildBuidlGuidlCastle();
    this.buildPlayerAvatar();
    this.buildChallengeStations();
    this.buildAmbientParticles();

    // 7. Event listeners
    this.bindEvents();

    // 8. Pre-warm shaders
    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    // 9. Start loop
    this.startLoop();
  }

  private setupLighting() {
    // Hemisphere light: cool sky blue down, warm earth ground up
    const hemiLight = new THREE.HemisphereLight(0x60a5fa, 0x1e293b, 1.2);
    hemiLight.position.set(0, 40, 0);
    this.scene.add(hemiLight);

    // Warm directional key light with tight shadow frustum
    const dirLight = new THREE.DirectionalLight(0xfff7ed, 2.4);
    dirLight.position.set(25, 45, 20);
    dirLight.castShadow = !this.isSoftwareGl;
    if (dirLight.castShadow) {
      dirLight.shadow.mapSize.width = 2048;
      dirLight.shadow.mapSize.height = 2048;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 120;
      const d = 36;
      dirLight.shadow.camera.left = -d;
      dirLight.shadow.camera.right = d;
      dirLight.shadow.camera.top = d;
      dirLight.shadow.camera.bottom = -d;
      dirLight.shadow.bias = -0.0005;
      dirLight.shadow.normalBias = 0.02;
    }
    this.scene.add(dirLight);

    // Cyan / violet accent rim lights for cyber aesthetic
    const rimCyan = new THREE.PointLight(0x06b6d4, 2.5, 35, 1.2);
    rimCyan.position.set(-20, 8, -15);
    this.scene.add(rimCyan);

    const rimGold = new THREE.PointLight(0xf59e0b, 2.5, 35, 1.2);
    rimGold.position.set(20, 8, 15);
    this.scene.add(rimGold);
  }

  private buildTerrain() {
    // Stylized Cyber-Granite ground with radial grid markings
    const groundGeo = new THREE.CylinderGeometry(55, 58, 2, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.85,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -1;
    ground.receiveShadow = !this.isSoftwareGl;
    this.scene.add(ground);

    // Inner glowing stone courtyard rings
    const ringGeo = new THREE.RingGeometry(22, 22.4, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.03;
    this.scene.add(ring);

    const outerRingGeo = new THREE.RingGeometry(38, 38.3, 64);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = 0.03;
    this.scene.add(outerRing);

    // Radiating pathway ribbons pointing to challenge stations
    const pathwayMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.3,
    });

    Object.values(CHALLENGES).forEach(ch => {
      const [x, , z] = ch.meta.stationPosition;
      const angle = Math.atan2(z, x);
      const dist = Math.hypot(x, z);

      const pathGeo = new THREE.BoxGeometry(dist - 3, 0.05, 1.8);
      const pathMesh = new THREE.Mesh(pathGeo, pathwayMat);
      pathMesh.position.set(x / 2, 0.02, z / 2);
      pathMesh.rotation.y = -angle;
      pathMesh.receiveShadow = !this.isSoftwareGl;
      this.scene.add(pathMesh);
    });

    // Outer natural boundary rock monoliths & cliffs
    const rockGeo = new THREE.DodecahedronGeometry(1.8, 1);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
      metalness: 0.1,
    });

    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
      const r = 50 + Math.random() * 4;
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(Math.cos(angle) * r, 0.8 + Math.random() * 1.5, Math.sin(angle) * r);
      const s = 1.2 + Math.random() * 2.2;
      rock.scale.set(s, s * (1.2 + Math.random()), s);
      rock.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
      rock.castShadow = !this.isSoftwareGl;
      rock.receiveShadow = !this.isSoftwareGl;
      this.scene.add(rock);
    }
  }

  private buildBuidlGuidlCastle() {
    // 3-12 part composite Central Hub structure
    const castleGroup = new THREE.Group();

    // 1. Base Altar Steps
    const step1 = new THREE.Mesh(
      new THREE.CylinderGeometry(6, 6.4, 0.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.3 })
    );
    step1.position.y = 0.3;
    step1.receiveShadow = true;
    castleGroup.add(step1);

    const step2 = new THREE.Mesh(
      new THREE.CylinderGeometry(4.5, 4.8, 0.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.4 })
    );
    step2.position.y = 0.9;
    step2.receiveShadow = true;
    castleGroup.add(step2);

    // 2. Four Corner Obelisks / Towers
    const towerGeo = new THREE.BoxGeometry(0.8, 4.5, 0.8);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.8 });
    const capGeo = new THREE.ConeGeometry(0.65, 1.2, 4);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.9 });

    const towerOffsets = [
      [-3.2, -3.2],
      [3.2, -3.2],
      [-3.2, 3.2],
      [3.2, 3.2],
    ];

    towerOffsets.forEach(([ox, oz]) => {
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.position.set(ox, 2.5, oz);
      tower.castShadow = true;
      castleGroup.add(tower);

      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(ox, 5.3, oz);
      cap.rotation.y = Math.PI / 4;
      castleGroup.add(cap);
    });

    // 3. Floating, Rotating Ethereum Diamond (Upper & Lower Octahedron Pyramids)
    this.ethDiamondGroup = new THREE.Group();
    this.ethDiamondGroup.position.set(0, 4.2, 0);

    const diamondMat = new THREE.MeshPhysicalMaterial({
      color: 0x60a5fa,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.35,
      metalness: 0.85,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    const topCone = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.4, 4), diamondMat);
    topCone.position.y = 1.2;
    topCone.rotation.y = Math.PI / 4;
    topCone.castShadow = true;
    this.ethDiamondGroup.add(topCone);

    const bottomCone = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.0, 4), diamondMat);
    bottomCone.position.y = -1.0;
    bottomCone.rotation.y = Math.PI / 4;
    bottomCone.rotation.z = Math.PI;
    bottomCone.castShadow = true;
    this.ethDiamondGroup.add(bottomCone);

    // Glowing core crystal inside
    const coreCrystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.7, 0),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    this.ethDiamondGroup.add(coreCrystal);

    castleGroup.add(this.ethDiamondGroup);

    // 4. Contact shadow below
    const contactShadow = new THREE.Mesh(
      new THREE.CircleGeometry(4.2, 32),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5 })
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.02;
    castleGroup.add(contactShadow);

    this.scene.add(castleGroup);
  }

  private buildPlayerAvatar() {
    this.playerGroup = new THREE.Group();
    this.playerGroup.position.copy(this.playerPos);

    // 1. Torso (BuidlGuidl Developer Hoodie)
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.0, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.6, metalness: 0.2 })
    );
    torso.position.y = 1.3;
    torso.castShadow = true;
    this.playerGroup.add(torso);

    // 2. Head
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xfcd34d, roughness: 0.5, metalness: 0.1 })
    );
    head.position.y = 2.05;
    head.castShadow = true;
    this.playerGroup.add(head);

    // 3. Iconic Yellow Hard Hat with Brim
    const hardHatGroup = new THREE.Group();
    const hatDome = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.36, 0.25, 12),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.5 })
    );
    hatDome.position.y = 2.35;
    hardHatGroup.add(hatDome);

    const hatBrim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.05, 12),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.5 })
    );
    hatBrim.position.y = 2.24;
    hardHatGroup.add(hatBrim);

    this.playerGroup.add(hardHatGroup);
    this.avatarLimbs.hardHat = hardHatGroup;

    // 4. Limbs
    const limbMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.2 });

    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.8, 0.3), limbMat);
    leftLeg.position.set(-0.25, 0.4, 0);
    leftLeg.castShadow = true;
    this.playerGroup.add(leftLeg);
    this.avatarLimbs.leftLeg = leftLeg;

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.8, 0.3), limbMat);
    rightLeg.position.set(0.25, 0.4, 0);
    rightLeg.castShadow = true;
    this.playerGroup.add(rightLeg);
    this.avatarLimbs.rightLeg = rightLeg;

    const armMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.6, metalness: 0.2 });
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.75, 0.24), armMat);
    leftArm.position.set(-0.55, 1.25, 0);
    leftArm.castShadow = true;
    this.playerGroup.add(leftArm);
    this.avatarLimbs.leftArm = leftArm;

    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.75, 0.24), armMat);
    rightArm.position.set(0.55, 1.25, 0);
    rightArm.castShadow = true;
    this.playerGroup.add(rightArm);
    this.avatarLimbs.rightArm = rightArm;

    // 5. Backpack with glowing status node
    const pack = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.65, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.7 })
    );
    pack.position.set(0, 1.3, -0.3);
    this.playerGroup.add(pack);

    const packLed = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.1, 0.05),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    packLed.position.set(0, 1.45, -0.42);
    this.playerGroup.add(packLed);

    // 6. Contact shadow under player
    const contactShadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.7, 16),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45 })
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.02;
    this.playerGroup.add(contactShadow);

    this.scene.add(this.playerGroup);
  }

  private buildChallengeStations() {
    // Challenge 0: Simple NFT Lab
    this.buildNFTStation();

    // Challenge 1: Staking Arena
    this.buildStakingStation();

    // Challenge 2: Token Vendor
    this.buildVendorStation();

    // Challenge 3: Dice Game
    this.buildDiceStation();

    // Challenge 4: Build a DEX AMM
    this.buildDEXStation();

    // Challenge 5: Multisig Vault
    this.buildMultisigStation();

    // Challenge 6: Dynamic SVG Loogie Tank
    this.buildLoogieTankStation();
  }

  private createStationBase(pos: [number, number, number], color: string, id: ChallengeId): THREE.Group {
    const group = new THREE.Group();
    group.position.set(pos[0], pos[1], pos[2]);
    group.userData = { challengeId: id };

    // Stone plinth
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(2.8, 3.2, 0.5, 24),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.3 })
    );
    plinth.position.y = 0.25;
    plinth.receiveShadow = true;
    group.add(plinth);

    // Glowing boundary halo
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(2.9, 3.1, 32),
      new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.03;
    group.add(halo);

    this.scene.add(group);
    this.stationMeshes.set(id, group);
    return group;
  }

  // Station 0: NFT Loogie Hologram Projector
  private buildNFTStation() {
    const meta = CHALLENGES.c0_nft.meta;
    const base = this.createStationBase(meta.stationPosition, meta.color, 'c0_nft');

    // Hologram emitter pod
    const pod = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.4, 0.8, 16),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.8 })
    );
    pod.position.y = 0.9;
    pod.castShadow = true;
    base.add(pod);

    // Floating 3D Loogie avatar
    const loogieGroup = new THREE.Group();
    loogieGroup.position.y = 2.4;

    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.4 })
    );
    body.scale.set(1.2, 1.0, 1.0);
    loogieGroup.add(body);

    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    eyeL.position.set(-0.25, 0.15, 0.6);
    loogieGroup.add(eyeL);

    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    eyeR.position.set(0.25, 0.15, 0.6);
    loogieGroup.add(eyeR);

    const pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    pupilL.position.set(-0.25, 0.15, 0.72);
    loogieGroup.add(pupilL);

    const pupilR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    pupilR.position.set(0.25, 0.15, 0.72);
    loogieGroup.add(pupilR);

    base.add(loogieGroup);
  }

  // Station 1: Decentralized Staking Arena
  private buildStakingStation() {
    const meta = CHALLENGES.c1_staking.meta;
    const base = this.createStationBase(meta.stationPosition, meta.color, 'c1_staking');

    // 4 ritual boundary pillars
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const pil = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.25, 2.5, 12),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.7 })
      );
      pil.position.set(Math.cos(a) * 2.0, 1.5, Math.sin(a) * 2.0);
      pil.castShadow = true;
      base.add(pil);

      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xf59e0b })
      );
      orb.position.set(Math.cos(a) * 2.0, 2.9, Math.sin(a) * 2.0);
      base.add(orb);
    }

    // Central Energy Pillar that fills up with staked ETH
    const glassTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.8, 3.2, 24, 1, true),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35,
        roughness: 0.1,
        metalness: 0.1,
      })
    );
    glassTube.position.y = 2.1;
    base.add(glassTube);

    this.stakingEnergyPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.72, 0.72, 2.0, 24),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.8,
        roughness: 0.3,
        metalness: 0.5,
      })
    );
    this.stakingEnergyPillar.position.y = 1.5;
    base.add(this.stakingEnergyPillar);
  }

  // Station 2: Token Vendor Vending Machine
  private buildVendorStation() {
    const meta = CHALLENGES.c2_vendor.meta;
    const base = this.createStationBase(meta.stationPosition, meta.color, 'c2_vendor');

    // Retro-futuristic Vending Machine Cabinet
    const cabinet = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 3.2, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.35, metalness: 0.6 })
    );
    cabinet.position.set(0, 2.1, 0);
    cabinet.castShadow = true;
    base.add(cabinet);

    // Glowing marquee sign
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.5, 0.1),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    sign.position.set(0, 3.3, 0.72);
    base.add(sign);

    // Dispensing glass window
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.6, 0.1),
      new THREE.MeshPhysicalMaterial({
        color: 0xa7f3d0,
        transparent: true,
        opacity: 0.4,
        roughness: 0.1,
      })
    );
    win.position.set(0, 2.1, 0.72);
    base.add(win);

    // Dispenser tray
    const tray = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.4, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8, metalness: 0.5 })
    );
    tray.position.set(0, 0.8, 0.75);
    base.add(tray);
  }

  // Station 3: Dice Game Rig
  private buildDiceStation() {
    const meta = CHALLENGES.c3_dice.meta;
    const base = this.createStationBase(meta.stationPosition, meta.color, 'c3_dice');

    // Floating giant D6 Die with glowing pips
    this.diceGroup = new THREE.Group();
    this.diceGroup.position.set(0, 2.6, 0);

    const dieMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.4, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.25, metalness: 0.75 })
    );
    dieMesh.castShadow = true;
    this.diceGroup.add(dieMesh);

    // Pip markers on faces
    const pipGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 12);
    const pipMat = new THREE.MeshBasicMaterial({ color: 0xfef2f2 });

    const p1 = new THREE.Mesh(pipGeo, pipMat);
    p1.position.set(0, 0, 0.71);
    p1.rotation.x = Math.PI / 2;
    this.diceGroup.add(p1);

    base.add(this.diceGroup);

    // Cryptographic Blockhash Orbital Rings
    for (let r = 0; r < 2; r++) {
      const ringGroup = new THREE.Group();
      const ringMesh = new THREE.Mesh(
        new THREE.TorusGeometry(1.8 + r * 0.4, 0.04, 8, 32),
        new THREE.MeshBasicMaterial({ color: r === 0 ? 0xef4444 : 0xf87171 })
      );
      ringGroup.add(ringMesh);
      ringGroup.position.set(0, 2.6, 0);
      base.add(ringGroup);
      this.diceHashRings.push(ringGroup);
    }
  }

  // Station 4: Build a DEX AMM Fountain
  private buildDEXStation() {
    const meta = CHALLENGES.c4_dex.meta;
    const base = this.createStationBase(meta.stationPosition, meta.color, 'c4_dex');

    // Twin Basins: ETH Pool (Blue) and Token Pool (Purple)
    const basinEth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 1.0, 1.2, 24),
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.4, metalness: 0.6 })
    );
    basinEth.position.set(-1.1, 1.1, 0);
    basinEth.castShadow = true;
    base.add(basinEth);

    const fluidEth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 0.1, 24),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    fluidEth.position.set(-1.1, 1.7, 0);
    base.add(fluidEth);

    const basinToken = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 1.0, 1.2, 24),
      new THREE.MeshStandardMaterial({ color: 0x4c1d95, roughness: 0.4, metalness: 0.6 })
    );
    basinToken.position.set(1.1, 1.1, 0);
    basinToken.castShadow = true;
    base.add(basinToken);

    const fluidToken = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 0.1, 24),
      new THREE.MeshBasicMaterial({ color: 0xa855f7 })
    );
    fluidToken.position.set(1.1, 1.7, 0);
    base.add(fluidToken);

    // Constant product core (x * y = k)
    this.dexCoreGroup = new THREE.Group();
    this.dexCoreGroup.position.set(0, 2.8, 0);

    const coreMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.65, 1),
      new THREE.MeshStandardMaterial({ color: 0xc084fc, roughness: 0.2, metalness: 0.9 })
    );
    this.dexCoreGroup.add(coreMesh);
    base.add(this.dexCoreGroup);
  }

  // Station 5: Multisig Vault
  private buildMultisigStation() {
    const meta = CHALLENGES.c5_multisig.meta;
    const base = this.createStationBase(meta.stationPosition, meta.color, 'c5_multisig');

    // Massive Steel Vault Door
    const vaultFrame = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.6, 0.6, 32),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.9 })
    );
    vaultFrame.position.set(0, 1.9, 0);
    vaultFrame.rotation.x = Math.PI / 2;
    vaultFrame.castShadow = true;
    base.add(vaultFrame);

    // 3 Combination Lock Dials (Austin, Vitalik, Player)
    const dialAngles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
    dialAngles.forEach((angle) => {
      const dial = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.95 })
      );
      dial.position.set(Math.cos(angle) * 0.85, 1.9 + Math.sin(angle) * 0.85, 0.35);
      dial.rotation.x = Math.PI / 2;
      base.add(dial);
      this.multisigDials.push(dial);
    });
  }

  // Station 6: Dynamic SVG Loogie Tank
  private buildLoogieTankStation() {
    const meta = CHALLENGES.c6_svg.meta;
    const base = this.createStationBase(meta.stationPosition, meta.color, 'c6_svg');

    // Glass Aquarium Cylinder
    this.loogieTankGroup = new THREE.Group();
    this.loogieTankGroup.position.set(0, 2.0, 0);

    const tankGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.6, 2.4, 24, 1, true),
      new THREE.MeshPhysicalMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.35,
        roughness: 0.05,
        metalness: 0.1,
      })
    );
    this.loogieTankGroup.add(tankGlass);

    // Water volume
    const water = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.5, 2.2, 24),
      new THREE.MeshBasicMaterial({ color: 0x0891b2, transparent: true, opacity: 0.3 })
    );
    this.loogieTankGroup.add(water);

    // 3 Swimming Procedural Loogies inside the tank!
    const loogieColors = [0x06b6d4, 0xf43f5e, 0x10b981];
    for (let i = 0; i < 3; i++) {
      const fishGroup = new THREE.Group();
      const fishBody = new THREE.Mesh(
        new THREE.SphereGeometry(0.26, 16, 16),
        new THREE.MeshStandardMaterial({ color: loogieColors[i], roughness: 0.3, metalness: 0.3 })
      );
      fishBody.scale.set(1.2, 0.9, 0.9);
      fishGroup.add(fishBody);

      this.loogieTankGroup.add(fishGroup);
      this.swimmingLoogies.push({
        group: fishGroup,
        speed: 1.0 + i * 0.4,
        phase: (i / 3) * Math.PI * 2,
        radius: 0.7 + i * 0.25,
      });
    }

    base.add(this.loogieTankGroup);
  }

  private buildAmbientParticles() {
    // Ambient floating blockchain gas & spark particles
    const count = this.isSoftwareGl ? 80 : 350;
    const posArray = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      posArray[i * 3 + 0] = (Math.random() - 0.5) * 60;
      posArray[i * 3 + 1] = 0.5 + Math.random() * 12;
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }

    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const partMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.18,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    this.ambientParticles = new THREE.Points(partGeo, partMat);
    this.scene.add(this.ambientParticles);
  }

  // Input Handling
  private bindEvents() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
    this.container.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('resize', this.handleResize);
  }

  private unbindEvents() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    this.container.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('resize', this.handleResize);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.moveKeys[e.code] = true;
    if (this.cameraMode === 'flyover' && (e.code === 'KeyW' || e.code === 'KeyA' || e.code === 'KeyS' || e.code === 'KeyD')) {
      this.cameraMode = 'follow';
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.moveKeys[e.code] = false;
  };

  private handleBlur = () => {
    this.moveKeys = {};
    this.isMoving = false;
  };

  private handlePointerDown = (e: MouseEvent) => {
    const rect = this.container.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const stationObjects: THREE.Object3D[] = [];
    this.stationMeshes.forEach(group => stationObjects.push(group));

    const intersects = this.raycaster.intersectObjects(stationObjects, true);
    if (intersects.length > 0) {
      let current: THREE.Object3D | null = intersects[0].object;
      while (current && current.parent) {
        if (current.userData && current.userData.challengeId) {
          const id = current.userData.challengeId as ChallengeId;
          this.onStationClicked?.(id);
          break;
        }
        current = current.parent;
      }
    }
  };

  private handleResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  // Public methods to control camera and avatar
  public setCameraMode(mode: CameraMode) {
    this.cameraMode = mode;
  }

  public teleportToStation(id: ChallengeId) {
    const meta = CHALLENGES[id]?.meta;
    if (!meta) return;
    const [tx, , tz] = meta.stationPosition;
    // Position player slightly in front of station facing it
    this.playerPos.set(tx * 0.78, 0, tz * 0.78);
    this.playerGroup.position.copy(this.playerPos);
    this.cameraMode = 'follow';
  }

  public teleportToCastle() {
    this.playerPos.set(0, 0, 7.5);
    this.playerGroup.position.copy(this.playerPos);
    this.cameraMode = 'follow';
  }

  // Update loop
  private updatePlayer(dt: number) {
    let moveX = 0;
    let moveZ = 0;

    if (this.moveKeys['KeyW'] || this.moveKeys['ArrowUp']) moveZ -= 1;
    if (this.moveKeys['KeyS'] || this.moveKeys['ArrowDown']) moveZ += 1;
    if (this.moveKeys['KeyA'] || this.moveKeys['ArrowLeft']) moveX -= 1;
    if (this.moveKeys['KeyD'] || this.moveKeys['ArrowRight']) moveX += 1;

    const len = Math.hypot(moveX, moveZ);
    this.isMoving = len > 0.01;

    const speed = 7.5; // units per second
    if (this.isMoving) {
      moveX /= len;
      moveZ /= len;

      this.playerPos.x += moveX * speed * dt;
      this.playerPos.z += moveZ * speed * dt;

      // Keep within arena radius
      const distFromCenter = Math.hypot(this.playerPos.x, this.playerPos.z);
      if (distFromCenter > 46) {
        this.playerPos.x = (this.playerPos.x / distFromCenter) * 46;
        this.playerPos.z = (this.playerPos.z / distFromCenter) * 46;
      }

      this.playerRot = Math.atan2(moveX, moveZ);
      this.playerGroup.rotation.y = this.playerRot;

      // Limb swing animation
      const walkCycle = this.clock.getElapsedTime() * 12;
      if (this.avatarLimbs.leftLeg && this.avatarLimbs.rightLeg) {
        this.avatarLimbs.leftLeg.rotation.x = Math.sin(walkCycle) * 0.55;
        this.avatarLimbs.rightLeg.rotation.x = -Math.sin(walkCycle) * 0.55;
      }
      if (this.avatarLimbs.leftArm && this.avatarLimbs.rightArm) {
        this.avatarLimbs.leftArm.rotation.x = -Math.sin(walkCycle) * 0.55;
        this.avatarLimbs.rightArm.rotation.x = Math.sin(walkCycle) * 0.55;
      }
    } else {
      // Idle reset
      if (this.avatarLimbs.leftLeg && this.avatarLimbs.rightLeg) {
        this.avatarLimbs.leftLeg.rotation.x *= 0.8;
        this.avatarLimbs.rightLeg.rotation.x *= 0.8;
      }
      if (this.avatarLimbs.leftArm && this.avatarLimbs.rightArm) {
        this.avatarLimbs.leftArm.rotation.x *= 0.8;
        this.avatarLimbs.rightArm.rotation.x *= 0.8;
      }
    }

    this.playerGroup.position.copy(this.playerPos);

    // Check proximity to challenge stations
    let closestStation: StationHitInfo | null = null;
    let minDistance = 4.2; // Trigger distance in world units

    for (const ch of Object.values(CHALLENGES)) {
      const [sx, , sz] = ch.meta.stationPosition;
      const d = Math.hypot(this.playerPos.x - sx, this.playerPos.z - sz);
      if (d < minDistance) {
        minDistance = d;
        closestStation = { challengeId: ch.meta.id, distance: d };
      }
    }

    const currentId = this.currentNearStation ? this.currentNearStation.challengeId : null;
    const closestId = closestStation ? (closestStation as StationHitInfo).challengeId : null;

    if (closestId !== currentId) {
      this.currentNearStation = closestStation;
      this.onNearStationChange?.(this.currentNearStation);
    }
  }

  private updateCamera(dt: number) {
    const elapsed = this.clock.getElapsedTime();

    if (this.cameraMode === 'flyover') {
      this.flyoverAngle += dt * 0.18;
      const r = 32;
      const camY = 16 + Math.sin(this.flyoverAngle * 0.5) * 4;
      this.cameraPos.set(Math.cos(this.flyoverAngle) * r, camY, Math.sin(this.flyoverAngle) * r);
      this.cameraTarget.set(0, 3.0, 0);
    } else if (this.cameraMode === 'follow') {
      // Third-person chase cam behind player
      const idealOffset = _vec3A.set(0, 6.5, 9.5);
      idealOffset.applyAxisAngle(_vec3B.set(0, 1, 0), this.playerRot * 0.4);
      const targetCamPos = _vec3C.copy(this.playerPos).add(idealOffset);

      // Smooth damping: 1 - Math.exp(-k * dt)
      const dampFactor = 1 - Math.exp(-4.5 * dt);
      this.cameraPos.lerp(targetCamPos, dampFactor);
      this.cameraTarget.lerp(_vec3B.copy(this.playerPos).add(new THREE.Vector3(0, 1.8, 0)), dampFactor);
    } else {
      // Orbit around current player or castle
      const r = 22;
      this.cameraPos.set(
        this.playerPos.x + Math.cos(elapsed * 0.25) * r,
        14,
        this.playerPos.z + Math.sin(elapsed * 0.25) * r
      );
      this.cameraTarget.copy(this.playerPos).add(new THREE.Vector3(0, 1.5, 0));
    }

    this.camera.position.copy(this.cameraPos);
    this.camera.lookAt(this.cameraTarget);
  }

  private updateStationAnimations(dt: number) {
    const elapsed = this.clock.getElapsedTime();

    // 1. Ethereum central diamond rotation
    if (this.ethDiamondGroup) {
      this.ethDiamondGroup.rotation.y += dt * 0.65;
      this.ethDiamondGroup.position.y = 4.2 + Math.sin(elapsed * 1.5) * 0.2;
    }

    // 2. Dice game spinning hash rings
    if (this.diceGroup) {
      this.diceGroup.rotation.x += dt * 0.4;
      this.diceGroup.rotation.y += dt * 0.6;
    }
    this.diceHashRings.forEach((ring, idx) => {
      ring.rotation.z += dt * (idx === 0 ? 1.0 : -0.8);
      ring.rotation.x = Math.sin(elapsed + idx) * 0.3;
    });

    // 3. DEX AMM Gyro Core
    if (this.dexCoreGroup) {
      this.dexCoreGroup.rotation.y += dt * 1.2;
      this.dexCoreGroup.rotation.z += dt * 0.8;
      this.dexCoreGroup.position.y = 2.8 + Math.sin(elapsed * 2.0) * 0.15;
    }

    // 4. Multisig Combination dials
    this.multisigDials.forEach((dial, idx) => {
      dial.rotation.z += dt * (0.3 + idx * 0.2);
    });

    // 5. Swimming Loogies in aquarium tank
    this.swimmingLoogies.forEach(loogie => {
      const angle = elapsed * loogie.speed + loogie.phase;
      const lx = Math.cos(angle) * loogie.radius;
      const lz = Math.sin(angle) * loogie.radius;
      const ly = Math.sin(elapsed * 2.5 + loogie.phase) * 0.45;
      loogie.group.position.set(lx, ly, lz);
      loogie.group.rotation.y = -angle + Math.PI / 2;
    });

    // 6. Ambient particles drift
    if (this.ambientParticles) {
      const positions = this.ambientParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += dt * 0.4;
        if (positions[i] > 14) positions[i] = 0.5;
      }
      this.ambientParticles.geometry.attributes.position.needsUpdate = true;
    }
  }

  private startLoop() {
    const tick = () => {
      if (this.isDestroyed) return;
      const rawDt = this.clock.getDelta();
      const dt = Math.min(rawDt, 0.05);

      this.updatePlayer(dt);
      this.updateCamera(dt);
      this.updateStationAnimations(dt);

      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      this.afterDraw(tick);
    } else {
      this.frameId = requestAnimationFrame(tick);
    }
  }

  private afterDraw(cb: () => void) {
    try {
      const gl = this.renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (this.isDestroyed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          this.frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          this.frameId = window.setTimeout(cb, 60);
        }
      };
      this.frameId = window.setTimeout(poll, 5);
    } catch {
      this.frameId = window.setTimeout(cb, 60);
    }
  }

  public dispose() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    this.unbindEvents();

    // Dispose geometries & materials
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material?.dispose();
        }
      }
    });

    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
