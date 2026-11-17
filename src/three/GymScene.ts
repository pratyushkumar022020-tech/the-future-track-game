import * as THREE from 'three';
import { ExerciseType, PlayerStats } from '../types/game';

export type CameraMode = 'orbit' | 'first_person' | 'cinematic' | 'overview';

export class GymScene {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;
  private clock: THREE.Clock;

  // Camera state
  private cameraMode: CameraMode = 'orbit';
  private targetCameraPos = new THREE.Vector3(0, 2.5, 6);
  private targetLookAt = new THREE.Vector3(0, 1.2, 0);
  private currentLookAt = new THREE.Vector3(0, 1.2, 0);

  // Interaction / Orbit
  private isPointerDown = false;
  private prevPointerX = 0;
  private prevPointerY = 0;
  private orbitTheta = 0;
  private orbitPhi = 0.35;
  private orbitRadius = 4.5;

  // 3D Objects & Stations
  private athleteGroup: THREE.Group;
  private athleteMeshes: {
    chest: THREE.Mesh;
    bicepsL: THREE.Mesh;
    bicepsR: THREE.Mesh;
    deltsL: THREE.Mesh;
    deltsR: THREE.Mesh;
    quadsL: THREE.Mesh;
    quadsR: THREE.Mesh;
    abs: THREE.Mesh;
    torso: THREE.Mesh;
    head: THREE.Mesh;
    armLeftGroup: THREE.Group;
    armRightGroup: THREE.Group;
    forearmL: THREE.Mesh;
    forearmR: THREE.Mesh;
    legLeftGroup: THREE.Group;
    legRightGroup: THREE.Group;
  } | null = null;

  private barbellGroup: THREE.Group;
  private barbellBar: THREE.Mesh;
  private leftPlatesGroup: THREE.Group;
  private rightPlatesGroup: THREE.Group;

  private weightStackGroup: THREE.Group | null = null;
  private cableLine: THREE.Line | null = null;
  private treadmillBelt: THREE.Mesh | null = null;

  // Station positions in gym
  private stationPositions: Record<ExerciseType, { pos: THREE.Vector3; lookAt: THREE.Vector3 }> = {
    bench_press: { pos: new THREE.Vector3(-4, 0, -2), lookAt: new THREE.Vector3(-4, 1.0, -2) },
    barbell_squat: { pos: new THREE.Vector3(-4, 0, 3), lookAt: new THREE.Vector3(-4, 1.4, 3) },
    deadlift: { pos: new THREE.Vector3(0, 0, 4), lookAt: new THREE.Vector3(0, 0.8, 4) },
    dumbbell_curls: { pos: new THREE.Vector3(4, 0, 3), lookAt: new THREE.Vector3(4, 1.3, 3) },
    lat_pulldown: { pos: new THREE.Vector3(4, 0, -2), lookAt: new THREE.Vector3(4, 1.4, -2) },
    treadmill_sprint: { pos: new THREE.Vector3(0, 0, -5), lookAt: new THREE.Vector3(0, 1.2, -5) },
  };

  private currentExercise: ExerciseType = 'bench_press';
  private repProgress = 0; // 0 to 1
  private currentWeightLbs = 135;
  private dustParticles: THREE.Points | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.clock = new THREE.Clock();

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c0f14);
    this.scene.fog = new THREE.FogExp2(0x0c0f14, 0.035);

    // Camera
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    this.camera.position.set(0, 2.8, 6.5);

    // Renderer with PBR tone mapping & antialias
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // Groups
    this.athleteGroup = new THREE.Group();
    this.barbellGroup = new THREE.Group();

    // Build Gym
    this.setupLighting();
    this.buildGymEnvironment();
    this.buildBenchPressStation();
    this.buildSquatRackStation();
    this.buildDeadliftPlatform();
    this.buildDumbbellStation();
    this.buildLatPulldownStation();
    this.buildTreadmillStation();
    this.buildAtmosphericParticles();

    // Build athlete avatar & barbell
    this.buildAthleteAvatar();
    this.buildBarbell();

    this.scene.add(this.athleteGroup);
    this.scene.add(this.barbellGroup);

    // Listeners
    this.bindEvents();
    this.setExercise('bench_press');
    this.animate();
  }

  private setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x2a3547, 0.9);
    this.scene.add(ambientLight);

    // Overhead gym ceiling spotlights
    const spotStrength = new THREE.SpotLight(0xffffff, 4.5, 25, Math.PI / 4, 0.4, 1.2);
    spotStrength.position.set(-4, 7, 0);
    spotStrength.castShadow = true;
    spotStrength.shadow.mapSize.width = 1024;
    spotStrength.shadow.mapSize.height = 1024;
    spotStrength.shadow.bias = -0.001;
    this.scene.add(spotStrength);

    const spotBodybuilding = new THREE.SpotLight(0x38bdf8, 4.0, 25, Math.PI / 4, 0.4, 1.2);
    spotBodybuilding.position.set(4, 7, 0);
    spotBodybuilding.castShadow = true;
    this.scene.add(spotBodybuilding);

    const spotCenter = new THREE.SpotLight(0xf59e0b, 3.8, 25, Math.PI / 4, 0.3, 1.2);
    spotCenter.position.set(0, 7, 3);
    spotCenter.castShadow = true;
    this.scene.add(spotCenter);

    // Neon overhead tubes (Cyber aesthetic gym styling)
    const neonMatCyan = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const neonMatAmber = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const neonGeo = new THREE.CylinderGeometry(0.04, 0.04, 14, 8);
    neonGeo.rotateZ(Math.PI / 2);

    const tube1 = new THREE.Mesh(neonGeo, neonMatCyan);
    tube1.position.set(0, 5.8, -2);
    this.scene.add(tube1);

    const tube2 = new THREE.Mesh(neonGeo, neonMatAmber);
    tube2.position.set(0, 5.8, 2);
    this.scene.add(tube2);
  }

  private buildGymEnvironment() {
    // Floor - Heavy duty interlocking rubber mats
    const floorGeo = new THREE.PlaneGeometry(28, 28);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x14181f,
      roughness: 0.65,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Gym boundary walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x181e28,
      roughness: 0.85,
      metalness: 0.1,
    });

    // Back wall
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(28, 7), wallMat);
    backWall.position.set(0, 3.5, -9);
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    // Mirror wall on left
    const mirrorMat = new THREE.MeshStandardMaterial({
      color: 0x222a38,
      roughness: 0.08,
      metalness: 0.92,
    });
    const mirrorWall = new THREE.Mesh(new THREE.PlaneGeometry(16, 5), mirrorMat);
    mirrorWall.position.set(-13.9, 2.8, 0);
    mirrorWall.rotation.y = Math.PI / 2;
    this.scene.add(mirrorWall);

    // Mirror frame
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0a0d12, roughness: 0.5 });
    const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 5.2, 16.2), frameMat);
    frameMesh.position.set(-13.95, 2.8, 0);
    this.scene.add(frameMesh);

    // Ceiling trusses
    const trussMat = new THREE.MeshStandardMaterial({ color: 0x111620, roughness: 0.5, metalness: 0.7 });
    for (let z = -7; z <= 7; z += 3.5) {
      const truss = new THREE.Mesh(new THREE.BoxGeometry(26, 0.3, 0.3), trussMat);
      truss.position.set(0, 6.2, z);
      this.scene.add(truss);
    }

    // Huge Gym Logo signage on back wall: "IRONVERSE ATHLETIC CLUB"
    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(8, 1.2, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x0d121b, metalness: 0.8, roughness: 0.2 })
    );
    signBoard.position.set(0, 5.2, -8.9);
    this.scene.add(signBoard);

    const signStripe = new THREE.Mesh(
      new THREE.BoxGeometry(7.6, 0.08, 0.12),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    signStripe.position.set(0, 4.75, -8.88);
    this.scene.add(signStripe);
  }

  // --- STATIONS BUILDERS ---

  private buildBenchPressStation() {
    const stationGroup = new THREE.Group();
    stationGroup.position.set(-4, 0, -2);

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.3, metalness: 0.85 });
    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8, metalness: 0.1 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.1, metalness: 0.95 });

    // Padded bench pad
    const benchPad = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 2.2), leatherMat);
    benchPad.position.set(0, 0.48, 0.1);
    benchPad.castShadow = true;
    stationGroup.add(benchPad);

    // Bench steel frame legs
    const legFront = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.42, 0.1), steelMat);
    legFront.position.set(0, 0.21, 1.0);
    legFront.castShadow = true;
    stationGroup.add(legFront);

    const legBack = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.42, 0.1), steelMat);
    legBack.position.set(0, 0.21, -0.8);
    legBack.castShadow = true;
    stationGroup.add(legBack);

    // Upright uprights with J-cups
    const uprightL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 0.1), steelMat);
    uprightL.position.set(-0.6, 0.7, -0.7);
    uprightL.castShadow = true;
    stationGroup.add(uprightL);

    const uprightR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 0.1), steelMat);
    uprightR.position.set(0.6, 0.7, -0.7);
    uprightR.castShadow = true;
    stationGroup.add(uprightR);

    // J-Hooks
    const hookL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.15), chromeMat);
    hookL.position.set(-0.6, 1.15, -0.62);
    stationGroup.add(hookL);

    const hookR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.15), chromeMat);
    hookR.position.set(0.6, 1.15, -0.62);
    stationGroup.add(hookR);

    this.scene.add(stationGroup);
  }

  private buildSquatRackStation() {
    const stationGroup = new THREE.Group();
    stationGroup.position.set(-4, 0, 3);

    const cageMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4, metalness: 0.7 }); // Red Rogue power cage
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.15, metalness: 0.9 });

    // 4 vertical posts of power rack
    const posts = [
      [-0.7, -0.6], [0.7, -0.6],
      [-0.7, 0.6], [0.7, 0.6]
    ];
    posts.forEach(([x, z]) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.4, 0.12), cageMat);
      post.position.set(x, 1.2, z);
      post.castShadow = true;
      stationGroup.add(post);
    });

    // Top crossbeams
    const topBeamL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.3), cageMat);
    topBeamL.position.set(-0.7, 2.35, 0);
    stationGroup.add(topBeamL);

    const topBeamR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.3), cageMat);
    topBeamR.position.set(0.7, 2.35, 0);
    stationGroup.add(topBeamR);

    // Pull-up bar on cage
    const pullupBar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.4), pinMat);
    pullupBar.rotation.z = Math.PI / 2;
    pullupBar.position.set(0, 2.3, 0.6);
    stationGroup.add(pullupBar);

    // Safety spotter arms
    const safetyL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.2), pinMat);
    safetyL.position.set(-0.7, 0.75, 0);
    stationGroup.add(safetyL);

    const safetyR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.2), pinMat);
    safetyR.position.set(0.7, 0.75, 0);
    stationGroup.add(safetyR);

    this.scene.add(stationGroup);
  }

  private buildDeadliftPlatform() {
    const stationGroup = new THREE.Group();
    stationGroup.position.set(0, 0, 4);

    // Wood center insert
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.5, metalness: 0.05 });
    const woodCenter = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 2.6), woodMat);
    woodCenter.position.set(0, 0.03, 0);
    woodCenter.receiveShadow = true;
    stationGroup.add(woodCenter);

    // Rubber drop wings
    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9, metalness: 0.1 });
    const rubberL = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 2.6), rubberMat);
    rubberL.position.set(-1.3, 0.03, 0);
    rubberL.receiveShadow = true;
    stationGroup.add(rubberL);

    const rubberR = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 2.6), rubberMat);
    rubberR.position.set(1.3, 0.03, 0);
    rubberR.receiveShadow = true;
    stationGroup.add(rubberR);

    // Chalk stand bowl nearby
    const chalkStand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9), new THREE.MeshStandardMaterial({ color: 0x374151 }));
    chalkStand.position.set(-2.0, 0.45, -0.8);
    stationGroup.add(chalkStand);

    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.1, 0.12, 16), new THREE.MeshStandardMaterial({ color: 0x9ca3af }));
    bowl.position.set(-2.0, 0.92, -0.8);
    stationGroup.add(bowl);

    const chalkPowder = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.08, 0.05, 16), new THREE.MeshBasicMaterial({ color: 0xf3f4f6 }));
    chalkPowder.position.set(-2.0, 0.95, -0.8);
    stationGroup.add(chalkPowder);

    this.scene.add(stationGroup);
  }

  private buildDumbbellStation() {
    const stationGroup = new THREE.Group();
    stationGroup.position.set(4, 0, 3);

    const rackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.7 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.15, metalness: 0.95 });
    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8, metalness: 0.2 });

    // 2-tier rack
    const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.85, 0.6), rackMat);
    sideL.position.set(-1.8, 0.42, 0);
    stationGroup.add(sideL);

    const sideR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.85, 0.6), rackMat);
    sideR.position.set(1.8, 0.42, 0);
    stationGroup.add(sideR);

    const railTop = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.06, 0.25), rackMat);
    railTop.position.set(0, 0.75, -0.1);
    stationGroup.add(railTop);

    const railBottom = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.06, 0.25), rackMat);
    railBottom.position.set(0, 0.4, 0.1);
    stationGroup.add(railBottom);

    // Populate with 8 pairs of dumbbells
    for (let i = 0; i < 8; i++) {
      const x = -1.4 + i * 0.4;
      const sizeScale = 0.06 + i * 0.01;
      // Top row dumbbells
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.22), chromeMat);
      handle.rotation.z = Math.PI / 2;
      handle.position.set(x, 0.82, -0.1);

      const bellL = new THREE.Mesh(new THREE.CylinderGeometry(sizeScale, sizeScale, 0.07, 12), rubberMat);
      bellL.rotation.z = Math.PI / 2;
      bellL.position.set(x - 0.1, 0.82, -0.1);

      const bellR = new THREE.Mesh(new THREE.CylinderGeometry(sizeScale, sizeScale, 0.07, 12), rubberMat);
      bellR.rotation.z = Math.PI / 2;
      bellR.position.set(x + 0.1, 0.82, -0.1);

      stationGroup.add(handle);
      stationGroup.add(bellL);
      stationGroup.add(bellR);
    }

    this.scene.add(stationGroup);
  }

  private buildLatPulldownStation() {
    const stationGroup = new THREE.Group();
    stationGroup.position.set(4, 0, -2);

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.3, metalness: 0.8 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85, metalness: 0.1 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.1, metalness: 0.95 });

    // Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.6), seatMat);
    seat.position.set(0, 0.45, 0.4);
    stationGroup.add(seat);

    // Thigh hold-down roller pads
    const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 12), seatMat);
    roller.rotation.z = Math.PI / 2;
    roller.position.set(0, 0.72, 0.1);
    stationGroup.add(roller);

    // Tower vertical frame
    const tower = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.5, 0.4), frameMat);
    tower.position.set(0, 1.25, -0.3);
    tower.castShadow = true;
    stationGroup.add(tower);

    // Overhead extended arm
    const armBeam = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.0), frameMat);
    armBeam.position.set(0, 2.45, 0.2);
    stationGroup.add(armBeam);

    // Weight stack (movable stack plates)
    this.weightStackGroup = new THREE.Group();
    for (let p = 0; p < 12; p++) {
      const plate = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.05, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 })
      );
      plate.position.set(0, 0.2 + p * 0.06, -0.3);
      this.weightStackGroup.add(plate);
    }
    stationGroup.add(this.weightStackGroup);

    this.scene.add(stationGroup);
  }

  private buildTreadmillStation() {
    const stationGroup = new THREE.Group();
    stationGroup.position.set(0, 0, -5);

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x181e28, roughness: 0.4, metalness: 0.6 });
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    // 3 Treadmills lined up
    [-1.8, 0, 1.8].forEach((xOffset, idx) => {
      const tmGroup = new THREE.Group();
      tmGroup.position.x = xOffset;

      // Treadmill base
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.25, 2.2), bodyMat);
      base.position.set(0, 0.13, 0);
      base.castShadow = true;
      tmGroup.add(base);

      // Running deck / belt
      const belt = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.04, 1.8),
        new THREE.MeshStandardMaterial({ color: 0x0a0d14, roughness: 0.95 })
      );
      belt.position.set(0, 0.26, 0.1);
      tmGroup.add(belt);
      if (idx === 1) {
        this.treadmillBelt = belt;
      }

      // Console arms
      const armL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.2, 0.08), bodyMat);
      armL.position.set(-0.4, 0.75, -0.8);
      tmGroup.add(armL);

      const armR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.2, 0.08), bodyMat);
      armR.position.set(0.4, 0.75, -0.8);
      tmGroup.add(armR);

      // Console & telemetry screen
      const consoleHead = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.35, 0.1), bodyMat);
      consoleHead.position.set(0, 1.35, -0.8);
      consoleHead.rotation.x = -Math.PI / 6;
      tmGroup.add(consoleHead);

      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.22), screenMat);
      screen.position.set(0, 1.36, -0.74);
      screen.rotation.x = -Math.PI / 6;
      tmGroup.add(screen);

      stationGroup.add(tmGroup);
    });

    this.scene.add(stationGroup);
  }

  private buildAtmosphericParticles() {
    const particleCount = 200;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = Math.random() * 5 + 0.5;
      positions[i + 2] = (Math.random() - 0.5) * 16;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.035,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });

    this.dustParticles = new THREE.Points(geom, mat);
    this.scene.add(this.dustParticles);
  }

  // --- ATHLETE AVATAR & BARBELL ---

  private buildAthleteAvatar() {
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xd49b73,
      roughness: 0.55,
      metalness: 0.15,
    });
    const apparelMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // dark stealth compression gear
      roughness: 0.8,
      metalness: 0.1,
    });

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), skinMat);
    head.position.set(0, 1.65, 0);
    this.athleteGroup.add(head);

    // Torso (ribcage core)
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.19, 0.55, 16), apparelMat);
    torso.position.set(0, 1.25, 0);
    this.athleteGroup.add(torso);

    // Chest Pectorals (bulks with muscle mass)
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.16), skinMat);
    chest.position.set(0, 1.4, 0.12);
    this.athleteGroup.add(chest);

    // Six-pack Abs
    const abs = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.12), apparelMat);
    abs.position.set(0, 1.15, 0.11);
    this.athleteGroup.add(abs);

    // Deltoids (Shoulders)
    const deltsL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), skinMat);
    deltsL.position.set(-0.32, 1.44, 0);
    this.athleteGroup.add(deltsL);

    const deltsR = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), skinMat);
    deltsR.position.set(0.32, 1.44, 0);
    this.athleteGroup.add(deltsR);

    // Arms - Left
    const armLeftGroup = new THREE.Group();
    armLeftGroup.position.set(-0.32, 1.44, 0);
    const bicepsL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.28, 12), skinMat);
    bicepsL.position.set(0, -0.14, 0);
    armLeftGroup.add(bicepsL);

    const forearmL = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.28, 12), skinMat);
    forearmL.position.set(0, -0.4, 0);
    armLeftGroup.add(forearmL);
    this.athleteGroup.add(armLeftGroup);

    // Arms - Right
    const armRightGroup = new THREE.Group();
    armRightGroup.position.set(0.32, 1.44, 0);
    const bicepsR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.28, 12), skinMat);
    bicepsR.position.set(0, -0.14, 0);
    armRightGroup.add(bicepsR);

    const forearmR = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.28, 12), skinMat);
    forearmR.position.set(0, -0.4, 0);
    armRightGroup.add(forearmR);
    this.athleteGroup.add(armRightGroup);

    // Legs - Left
    const legLeftGroup = new THREE.Group();
    legLeftGroup.position.set(-0.16, 0.95, 0);
    const quadsL = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.45, 12), apparelMat);
    quadsL.position.set(0, -0.22, 0);
    legLeftGroup.add(quadsL);

    const calfL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.45, 12), skinMat);
    calfL.position.set(0, -0.65, 0);
    legLeftGroup.add(calfL);
    this.athleteGroup.add(legLeftGroup);

    // Legs - Right
    const legRightGroup = new THREE.Group();
    legRightGroup.position.set(0.16, 0.95, 0);
    const quadsR = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.45, 12), apparelMat);
    quadsR.position.set(0, -0.22, 0);
    legRightGroup.add(quadsR);

    const calfR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.45, 12), skinMat);
    calfR.position.set(0, -0.65, 0);
    legRightGroup.add(calfR);
    this.athleteGroup.add(legRightGroup);

    this.athleteMeshes = {
      chest,
      bicepsL,
      bicepsR,
      deltsL,
      deltsR,
      quadsL,
      quadsR,
      abs,
      torso,
      head,
      armLeftGroup,
      armRightGroup,
      forearmL,
      forearmR,
      legLeftGroup,
      legRightGroup,
    };
  }

  private buildBarbell() {
    // Knurled Olympic steel bar (2.2m length, 28mm diameter)
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.15,
    });
    const barGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.2, 16);
    barGeo.rotateZ(Math.PI / 2);
    this.barbellBar = new THREE.Mesh(barGeo, chromeMat);
    this.barbellBar.castShadow = true;
    this.barbellGroup.add(this.barbellBar);

    this.leftPlatesGroup = new THREE.Group();
    this.leftPlatesGroup.position.set(-0.85, 0, 0);
    this.barbellGroup.add(this.leftPlatesGroup);

    this.rightPlatesGroup = new THREE.Group();
    this.rightPlatesGroup.position.set(0.85, 0, 0);
    this.barbellGroup.add(this.rightPlatesGroup);

    this.updatePlatesVisual(135);
  }

  public updatePlatesVisual(weightLbs: number) {
    this.currentWeightLbs = weightLbs;
    // Clear existing plates
    while (this.leftPlatesGroup.children.length > 0) {
      this.leftPlatesGroup.remove(this.leftPlatesGroup.children[0]);
    }
    while (this.rightPlatesGroup.children.length > 0) {
      this.rightPlatesGroup.remove(this.rightPlatesGroup.children[0]);
    }

    // Standard 45lb barbell bar
    let perSide = Math.max(0, (weightLbs - 45) / 2);

    const plateTypes = [
      { weight: 45, radius: 0.23, thickness: 0.045, color: 0x1e3a8a }, // Blue 45s / 20kg
      { weight: 25, radius: 0.18, thickness: 0.035, color: 0x15803d }, // Green 25s
      { weight: 10, radius: 0.13, thickness: 0.025, color: 0xd97706 }, // Amber 10s
    ];

    let xOffset = 0;
    plateTypes.forEach((pt) => {
      const count = Math.floor(perSide / pt.weight);
      perSide %= pt.weight;

      for (let i = 0; i < count; i++) {
        const mat = new THREE.MeshStandardMaterial({
          color: pt.color,
          roughness: 0.4,
          metalness: 0.5,
        });

        const plateGeo = new THREE.CylinderGeometry(pt.radius, pt.radius, pt.thickness, 24);
        plateGeo.rotateZ(Math.PI / 2);

        const plateL = new THREE.Mesh(plateGeo, mat);
        plateL.position.set(-xOffset, 0, 0);
        plateL.castShadow = true;
        this.leftPlatesGroup.add(plateL);

        const plateR = new THREE.Mesh(plateGeo, mat);
        plateR.position.set(xOffset, 0, 0);
        plateR.castShadow = true;
        this.rightPlatesGroup.add(plateR);

        xOffset += pt.thickness + 0.008;
      }
    });

    // Outer collar clip
    const collarMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const collarGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16);
    collarGeo.rotateZ(Math.PI / 2);

    const collarL = new THREE.Mesh(collarGeo, collarMat);
    collarL.position.set(-xOffset - 0.02, 0, 0);
    this.leftPlatesGroup.add(collarL);

    const collarR = new THREE.Mesh(collarGeo, collarMat);
    collarR.position.set(xOffset + 0.02, 0, 0);
    this.rightPlatesGroup.add(collarR);
  }

  // --- MORPHING ATHLETE MUSCULATURE ACCORDING TO STATS ---

  public updateAthleteMuscles(stats: PlayerStats) {
    if (!this.athleteMeshes) return;
    // Scale muscles based on muscle mass progression (34kg baseline up to 65kg)
    const massFactor = Math.min(1.75, Math.max(0.9, (stats.muscleMassKg - 30) / 25));

    // Chest expansion
    this.athleteMeshes.chest.scale.set(massFactor, massFactor * 1.1, massFactor * 1.2);
    // Biceps
    this.athleteMeshes.bicepsL.scale.set(massFactor, 1, massFactor);
    this.athleteMeshes.bicepsR.scale.set(massFactor, 1, massFactor);
    // Deltoids
    this.athleteMeshes.deltsL.scale.set(massFactor * 1.1, massFactor * 1.1, massFactor * 1.1);
    this.athleteMeshes.deltsR.scale.set(massFactor * 1.1, massFactor * 1.1, massFactor * 1.1);
    // Quads
    this.athleteMeshes.quadsL.scale.set(massFactor * 1.05, 1, massFactor * 1.05);
    this.athleteMeshes.quadsR.scale.set(massFactor * 1.05, 1, massFactor * 1.05);
  }

  // --- EXERCISE & BIOMECHANIC POSE SYSTEM ---

  public setExercise(exercise: ExerciseType) {
    this.currentExercise = exercise;
    const info = this.stationPositions[exercise];
    if (!info) return;

    // Reset base transforms
    this.repProgress = 0;
    this.athleteGroup.position.copy(info.pos);
    this.athleteGroup.rotation.set(0, 0, 0);

    this.barbellGroup.visible = true;
    this.barbellGroup.position.copy(info.pos);
    this.barbellGroup.rotation.set(0, 0, 0);

    if (exercise === 'bench_press') {
      // Lying horizontally on the bench
      this.athleteGroup.rotation.x = -Math.PI / 2;
      this.athleteGroup.position.set(-4, 0.6, -1.9);
      this.barbellGroup.position.set(-4, 1.25, -2.1);
    } else if (exercise === 'barbell_squat') {
      // Bar rested across upper traps
      this.athleteGroup.position.set(-4, 0, 3);
      this.barbellGroup.position.set(-4, 1.55, 3.0);
    } else if (exercise === 'deadlift') {
      // Barbell on the floor
      this.athleteGroup.position.set(0, 0, 4);
      this.barbellGroup.position.set(0, 0.24, 4.25);
    } else if (exercise === 'dumbbell_curls') {
      this.athleteGroup.position.set(4, 0, 3);
      this.barbellGroup.visible = false; // dumbbell handles used instead
    } else if (exercise === 'lat_pulldown') {
      this.athleteGroup.position.set(4, 0, -2);
      this.barbellGroup.position.set(4, 2.3, -1.8);
    } else if (exercise === 'treadmill_sprint') {
      this.athleteGroup.position.set(0, 0.28, -5);
      this.barbellGroup.visible = false;
    }

    this.updateCameraTarget();
  }

  public setRepProgress(progress: number, isStrain = false) {
    this.repProgress = THREE.MathUtils.clamp(progress, 0, 1);
    const wobble = isStrain ? (Math.random() - 0.5) * 0.03 : 0;

    // Bar bending physics for heavy loads (>300 lbs)
    if (this.currentWeightLbs > 300 && this.barbellBar) {
      const bendFactor = Math.min(0.04, (this.currentWeightLbs - 300) / 10000);
      this.barbellBar.rotation.x = Math.sin(this.repProgress * Math.PI) * bendFactor;
    }

    if (this.currentExercise === 'bench_press') {
      // Descent to chest (repProgress 0 is locked out top, 1 is touched chest)
      const topY = 1.25;
      const bottomY = 0.78;
      const curY = THREE.MathUtils.lerp(topY, bottomY, this.repProgress) + wobble;
      this.barbellGroup.position.y = curY;

      if (this.athleteMeshes) {
        const armAngle = THREE.MathUtils.lerp(0.1, 1.4, this.repProgress);
        this.athleteMeshes.armLeftGroup.rotation.x = armAngle;
        this.athleteMeshes.armRightGroup.rotation.x = armAngle;
      }
    } else if (this.currentExercise === 'barbell_squat') {
      // Deep squat trajectory
      const topY = 1.55;
      const bottomY = 0.85;
      const curY = THREE.MathUtils.lerp(topY, bottomY, this.repProgress) + wobble;
      this.barbellGroup.position.y = curY;
      this.athleteGroup.position.y = THREE.MathUtils.lerp(0, -0.7, this.repProgress);

      if (this.athleteMeshes) {
        const kneeFlex = THREE.MathUtils.lerp(0, 1.6, this.repProgress);
        this.athleteMeshes.legLeftGroup.rotation.x = -kneeFlex;
        this.athleteMeshes.legRightGroup.rotation.x = -kneeFlex;
      }
    } else if (this.currentExercise === 'deadlift') {
      // From floor (repProgress 0 is on floor, 1 is locked out standing)
      const bottomY = 0.24;
      const topY = 0.88;
      const curY = THREE.MathUtils.lerp(bottomY, topY, this.repProgress) + wobble;
      this.barbellGroup.position.y = curY;

      if (this.athleteMeshes) {
        const hipHinge = THREE.MathUtils.lerp(1.1, 0, this.repProgress);
        this.athleteMeshes.torso.rotation.x = hipHinge;
        this.athleteMeshes.armLeftGroup.rotation.x = hipHinge * 0.4;
        this.athleteMeshes.armRightGroup.rotation.x = hipHinge * 0.4;
      }
    } else if (this.currentExercise === 'dumbbell_curls') {
      if (this.athleteMeshes) {
        const curlAngle = THREE.MathUtils.lerp(0.1, 2.2, this.repProgress);
        this.athleteMeshes.armLeftGroup.rotation.x = curlAngle;
        this.athleteMeshes.armRightGroup.rotation.x = curlAngle;
      }
    } else if (this.currentExercise === 'lat_pulldown') {
      // Pulldown bar from 2.3 down to 1.5
      const topY = 2.3;
      const bottomY = 1.5;
      const curY = THREE.MathUtils.lerp(topY, bottomY, this.repProgress) + wobble;
      this.barbellGroup.position.y = curY;

      // Weight stack plates lift up
      if (this.weightStackGroup) {
        this.weightStackGroup.position.y = this.repProgress * 0.4;
      }
    } else if (this.currentExercise === 'treadmill_sprint') {
      // Running gait oscillation
      const time = Date.now() * 0.01;
      if (this.athleteMeshes) {
        this.athleteMeshes.legLeftGroup.rotation.x = Math.sin(time) * 0.8;
        this.athleteMeshes.legRightGroup.rotation.x = -Math.sin(time) * 0.8;
        this.athleteMeshes.armLeftGroup.rotation.x = -Math.sin(time) * 0.7;
        this.athleteMeshes.armRightGroup.rotation.x = Math.sin(time) * 0.7;
      }
    }
  }

  // --- CAMERA MODES & CONTROLS ---

  public setCameraMode(mode: CameraMode) {
    this.cameraMode = mode;
    this.updateCameraTarget();
  }

  private updateCameraTarget() {
    const station = this.stationPositions[this.currentExercise];
    if (!station) return;

    if (this.cameraMode === 'orbit') {
      this.targetLookAt.copy(station.lookAt);
      const x = station.lookAt.x + this.orbitRadius * Math.sin(this.orbitTheta) * Math.cos(this.orbitPhi);
      const y = station.lookAt.y + this.orbitRadius * Math.sin(this.orbitPhi);
      const z = station.lookAt.z + this.orbitRadius * Math.cos(this.orbitTheta) * Math.cos(this.orbitPhi);
      this.targetCameraPos.set(x, Math.max(0.6, y), z);
    } else if (this.cameraMode === 'first_person') {
      // First person looking at bar
      if (this.currentExercise === 'bench_press') {
        this.targetCameraPos.set(-4, 0.7, -1.9);
        this.targetLookAt.set(-4, 1.3, -2.1);
      } else {
        this.targetCameraPos.set(station.pos.x, 1.68, station.pos.z + 0.1);
        this.targetLookAt.set(station.lookAt.x, 1.5, station.lookAt.z + 2.0);
      }
    } else if (this.cameraMode === 'cinematic') {
      // Low-angle dramatic PR shot
      this.targetCameraPos.set(station.pos.x + 1.8, 0.45, station.pos.z + 2.0);
      this.targetLookAt.copy(station.lookAt);
    } else if (this.cameraMode === 'overview') {
      // High-angle gym facility overview
      this.targetCameraPos.set(0, 7.5, 9.5);
      this.targetLookAt.set(0, 1.0, 0);
    }
  }

  private bindEvents() {
    const el = this.renderer.domElement;

    el.addEventListener('pointerdown', (e) => {
      this.isPointerDown = true;
      this.prevPointerX = e.clientX;
      this.prevPointerY = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isPointerDown) return;
      const deltaX = e.clientX - this.prevPointerX;
      const deltaY = e.clientY - this.prevPointerY;
      this.prevPointerX = e.clientX;
      this.prevPointerY = e.clientY;

      this.orbitTheta -= deltaX * 0.008;
      this.orbitPhi = THREE.MathUtils.clamp(this.orbitPhi + deltaY * 0.008, 0.05, Math.PI / 2.3);

      if (this.cameraMode === 'orbit') {
        this.updateCameraTarget();
      }
    });

    window.addEventListener('pointerup', () => {
      this.isPointerDown = false;
    });

    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.orbitRadius = THREE.MathUtils.clamp(this.orbitRadius + e.deltaY * 0.005, 2.0, 9.0);
      if (this.cameraMode === 'orbit') {
        this.updateCameraTarget();
      }
    }, { passive: false });

    window.addEventListener('resize', this.onResize);
  }

  private onResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();

    // Smooth camera lerp
    this.camera.position.lerp(this.targetCameraPos, delta * 3.5);
    this.currentLookAt.lerp(this.targetLookAt, delta * 3.5);
    this.camera.lookAt(this.currentLookAt);

    // Floating dust particles
    if (this.dustParticles) {
      const positions = this.dustParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= delta * 0.05;
        if (positions[i] < 0.2) {
          positions[i] = 5.0;
        }
      }
      this.dustParticles.geometry.attributes.position.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  };

  public destroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onResize);
    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
