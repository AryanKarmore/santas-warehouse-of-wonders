/**
 * North Pole AGV Digital Twin - Three.js Santa Claus Edition
 * Author: Person 5 - ESHAN (with full team algorithm integration)
 * 
 * Features:
 *  - 3D Winter Wonderland with Procedural Santa Claus Delivery Character
 *  - 3D Falling Snow Particles + CSS Snowflakes Overlay + Twinkling Fairy Lights
 *  - Real-time Visual Search Frontier Expansion & Glowing Holiday Splines
 *  - Runaway Sleigh Obstacle Detection & Live A* Replanning Animation
 *  - Embedded Jingle Bells & Santa "HO HO HO!" Audio Synthesizer (Web Audio API)
 *  - Dual Engine: Precomputed Python JSON traces + Live In-Browser Search Engine
 *  - Interactive Sandbox Brush Tool for Custom Ice Grid Testing
 */

// ==========================================================================
// 1. Audio Synthesizer (Santa "HO HO HO!" & Holiday Jingles)
// ==========================================================================
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playHoHoHo() {
    this.init();
    if (!this.enabled || !this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      // 3 deep resonant jolly vocal pulses: "HO! HO! HO!"
      const hoPitches = [140, 125, 110];
      let t = this.ctx.currentTime + 0.05;
      hoPitches.forEach((baseFreq) => {
        // Fundamental oscillator (chest voice)
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(baseFreq * 1.25, t);
        osc1.frequency.exponentialRampToValueAtTime(baseFreq, t + 0.22);

        // Sub/harmonic overtone
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(baseFreq * 2.0, t);
        osc2.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, t + 0.22);

        // Vocal Formant Filter (simulates male vocal tract "O" vowel)
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(480, t);
        filter.Q.setValueAtTime(3.5, t);

        gain.gain.setValueAtTime(0.01, t);
        gain.gain.linearRampToValueAtTime(0.40, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 0.26);
        osc2.stop(t + 0.26);
        t += 0.32;
      });
    } catch(e) {
      console.warn('Audio play error:', e);
    }
  }

  playStep() {
    if (!this.enabled || !this.ctx) return;
    try {
      // Jingle Bell harmonics: metallic high sparkle
      const bellFreqs = [1760, 2637, 3520];
      bellFreqs.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
      });
    } catch(e) {}
  }

  playAlarm() {
    if (!this.enabled || !this.ctx) return;
    try {
      // Urgent sleigh warning horn
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime);
      osc.frequency.setValueAtTime(587.33, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch(e) {}
  }

  playVictory() {
    if (!this.enabled || !this.ctx) return;
    try {
      this.playHoHoHo();
      // Christmas "Jingle Bells" melody: E5, E5, E5 | E5, E5, E5 | E5, G5, C5, D5, E5
      const notes = [
        { f: 659.25, d: 0.15 }, { f: 659.25, d: 0.15 }, { f: 659.25, d: 0.3 },
        { f: 659.25, d: 0.15 }, { f: 659.25, d: 0.15 }, { f: 659.25, d: 0.3 },
        { f: 659.25, d: 0.15 }, { f: 783.99, d: 0.15 }, { f: 523.25, d: 0.2 },
        { f: 587.33, d: 0.15 }, { f: 659.25, d: 0.45 }
      ];
      let t = this.ctx.currentTime + 0.85; // Play after HO HO HO!
      notes.forEach(n => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, t);
        gain.gain.setValueAtTime(0.13, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + n.d);
        t += n.d + 0.05;
      });
    } catch(e) {}
  }
}

const sfx = new SoundFX();

// ==========================================================================
// 2. CSS Snowflakes & Fairy Lights Generator
// ==========================================================================
function initFestiveDecorations() {
  // 1. CSS Snowflakes
  const snowContainer = document.getElementById('snowflakes-container');
  if (snowContainer) {
    const flakeChars = ['❄', '❅', '•', '❆'];
    for (let i = 0; i < 50; i++) {
      const el = document.createElement('div');
      el.className = 'snowflake';
      el.textContent = flakeChars[Math.floor(Math.random() * flakeChars.length)];
      const size = Math.random() * 16 + 10;
      el.style.fontSize = `${size}px`;
      el.style.left = `${Math.random() * 100}%`;
      const duration = Math.random() * 7 + 5;
      const delay = Math.random() * 6;
      el.style.animationDuration = `${duration}s, ${duration * 0.45}s`;
      el.style.animationDelay = `-${delay}s, -${delay}s`;
      el.style.opacity = (Math.random() * 0.6 + 0.3).toFixed(2);
      snowContainer.appendChild(el);
    }
  }

  // 2. Christmas Fairy Lights
  const lightsContainer = document.getElementById('christmas-lights');
  if (lightsContainer) {
    const colors = ['red', 'green', 'gold', 'blue', 'pink'];
    const bulbCount = Math.floor(window.innerWidth / 35);
    for (let i = 0; i < bulbCount; i++) {
      const bulb = document.createElement('div');
      bulb.className = `light-bulb ${colors[i % colors.length]}`;
      lightsContainer.appendChild(bulb);
    }
  }
}

// ==========================================================================
// 3. Constants & Cell Definitions (Matching Python Backend)
// ==========================================================================
const CELL = {
  OPEN: 0,
  CROWDED: 1,
  SHELF: 2,
  RESTRICTED: 3,
  TROLLEY: 4
};

const COSTS = {
  [CELL.OPEN]: 1.0,
  [CELL.CROWDED]: 4.0,
  [CELL.SHELF]: Infinity,
  [CELL.RESTRICTED]: Infinity,
  [CELL.TROLLEY]: Infinity
};

// ==========================================================================
// 4. In-Browser Live Search Engine (BFS, DFS, Greedy, A*)
// ==========================================================================
function manhattan(p1, p2) {
  return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);
}

function runLiveSearch(algoName, gridMatrix, start, goal) {
  const H = gridMatrix.length;
  const W = gridMatrix[0].length;
  const t0 = performance.now();

  const isPassable = (r, c) => {
    if (r < 0 || r >= H || c < 0 || c >= W) return false;
    const v = gridMatrix[r][c];
    return v !== CELL.SHELF && v !== CELL.RESTRICTED && v !== CELL.TROLLEY;
  };

  const actions = [
    [-1, 0, 'UP'],
    [1, 0, 'DOWN'],
    [0, -1, 'LEFT'],
    [0, 1, 'RIGHT']
  ];

  const getSuccessors = (r, c) => {
    const list = [];
    for (const [dr, dc, act] of actions) {
      const nr = r + dr, nc = c + dc;
      if (isPassable(nr, nc)) {
        const cost = gridMatrix[nr][nc] === CELL.CROWDED ? 4.0 : 1.0;
        list.push({ pos: [nr, nc], action: act, cost });
      }
    }
    return list;
  };

  const visitedOrder = [];
  let nodesExpanded = 0;

  // BFS
  if (algoName === 'BFS') {
    const queue = [{ pos: start, parent: null, action: null, cost: 0 }];
    const visited = new Set([`${start[0]},${start[1]}`]);

    while (queue.length > 0) {
      const curr = queue.shift();
      nodesExpanded++;
      visitedOrder.push(curr.pos);

      if (curr.pos[0] === goal[0] && curr.pos[1] === goal[1]) {
        const path = [];
        let p = curr;
        while (p) { path.push(p.pos); p = p.parent; }
        path.reverse();
        return {
          algorithm_name: 'BFS',
          goal_reached: true,
          path,
          path_length: path.length - 1,
          total_cost: curr.cost,
          nodes_expanded: nodesExpanded,
          execution_time_ms: performance.now() - t0,
          visited_nodes: visitedOrder
        };
      }

      for (const succ of getSuccessors(curr.pos[0], curr.pos[1])) {
        const key = `${succ.pos[0]},${succ.pos[1]}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({
            pos: succ.pos,
            parent: curr,
            action: succ.action,
            cost: curr.cost + succ.cost
          });
        }
      }
    }
  }

  // DFS
  if (algoName === 'DFS') {
    const stack = [{ pos: start, parent: null, action: null, cost: 0 }];
    const visited = new Set();

    while (stack.length > 0) {
      const curr = stack.pop();
      const key = `${curr.pos[0]},${curr.pos[1]}`;
      if (visited.has(key)) continue;
      visited.add(key);
      nodesExpanded++;
      visitedOrder.push(curr.pos);

      if (curr.pos[0] === goal[0] && curr.pos[1] === goal[1]) {
        const path = [];
        let p = curr;
        while (p) { path.push(p.pos); p = p.parent; }
        path.reverse();
        return {
          algorithm_name: 'DFS',
          goal_reached: true,
          path,
          path_length: path.length - 1,
          total_cost: curr.cost,
          nodes_expanded: nodesExpanded,
          execution_time_ms: performance.now() - t0,
          visited_nodes: visitedOrder
        };
      }

      for (const succ of getSuccessors(curr.pos[0], curr.pos[1])) {
        const skey = `${succ.pos[0]},${succ.pos[1]}`;
        if (!visited.has(skey)) {
          stack.push({
            pos: succ.pos,
            parent: curr,
            action: succ.action,
            cost: curr.cost + succ.cost
          });
        }
      }
    }
  }

  // Greedy Best-First
  if (algoName === 'Greedy Best-First') {
    const frontier = [{
      pos: start,
      parent: null,
      action: null,
      cost: 0,
      h: manhattan(start, goal)
    }];
    const visited = new Set();

    while (frontier.length > 0) {
      frontier.sort((a, b) => a.h - b.h);
      const curr = frontier.shift();
      const key = `${curr.pos[0]},${curr.pos[1]}`;
      if (visited.has(key)) continue;
      visited.add(key);
      nodesExpanded++;
      visitedOrder.push(curr.pos);

      if (curr.pos[0] === goal[0] && curr.pos[1] === goal[1]) {
        const path = [];
        let p = curr;
        while (p) { path.push(p.pos); p = p.parent; }
        path.reverse();
        return {
          algorithm_name: 'Greedy Best-First',
          goal_reached: true,
          path,
          path_length: path.length - 1,
          total_cost: curr.cost,
          nodes_expanded: nodesExpanded,
          execution_time_ms: performance.now() - t0,
          visited_nodes: visitedOrder
        };
      }

      for (const succ of getSuccessors(curr.pos[0], curr.pos[1])) {
        const skey = `${succ.pos[0]},${succ.pos[1]}`;
        if (!visited.has(skey)) {
          frontier.push({
            pos: succ.pos,
            parent: curr,
            action: succ.action,
            cost: curr.cost + succ.cost,
            h: manhattan(succ.pos, goal)
          });
        }
      }
    }
  }

  // A* Search
  if (algoName === 'A*') {
    const frontier = [{
      pos: start,
      parent: null,
      action: null,
      cost: 0,
      f: manhattan(start, goal)
    }];
    const bestG = new Map();
    bestG.set(`${start[0]},${start[1]}`, 0);

    while (frontier.length > 0) {
      frontier.sort((a, b) => a.f - b.f);
      const curr = frontier.shift();
      const key = `${curr.pos[0]},${curr.pos[1]}`;

      if (curr.cost > (bestG.get(key) ?? Infinity)) continue;
      nodesExpanded++;
      visitedOrder.push(curr.pos);

      if (curr.pos[0] === goal[0] && curr.pos[1] === goal[1]) {
        const path = [];
        let p = curr;
        while (p) { path.push(p.pos); p = p.parent; }
        path.reverse();
        return {
          algorithm_name: 'A*',
          goal_reached: true,
          path,
          path_length: path.length - 1,
          total_cost: curr.cost,
          nodes_expanded: nodesExpanded,
          execution_time_ms: performance.now() - t0,
          visited_nodes: visitedOrder
        };
      }

      for (const succ of getSuccessors(curr.pos[0], curr.pos[1])) {
        const skey = `${succ.pos[0]},${succ.pos[1]}`;
        const newG = curr.cost + succ.cost;
        if (newG < (bestG.get(skey) ?? Infinity)) {
          bestG.set(skey, newG);
          const f = newG + manhattan(succ.pos, goal);
          frontier.push({
            pos: succ.pos,
            parent: curr,
            action: succ.action,
            cost: newG,
            f
          });
        }
      }
    }
  }

  return {
    algorithm_name: algoName,
    goal_reached: false,
    path: [],
    path_length: 0,
    total_cost: 0,
    nodes_expanded: nodesExpanded,
    execution_time_ms: performance.now() - t0,
    visited_nodes: visitedOrder
  };
}

// ==========================================================================
// 5. Default Winter Layout Presets
// ==========================================================================
function getStandardLayout() {
  const H = 12, W = 12;
  const grid = Array.from({ length: H }, () => Array(W).fill(CELL.OPEN));
  for (let r = 2; r <= 4; r++) {
    for (const c of [2, 3, 6, 7, 10]) grid[r][c] = CELL.SHELF;
  }
  for (let r = 7; r <= 9; r++) {
    for (const c of [1, 4, 5, 8, 9]) grid[r][c] = CELL.SHELF;
  }
  for (let r = 5; r <= 6; r++) {
    grid[r][6] = CELL.RESTRICTED;
    grid[r][7] = CELL.RESTRICTED;
  }
  for (let c = 1; c <= 4; c++) grid[5][c] = CELL.CROWDED;
  for (let r = 1; r <= 4; r++) grid[r][0] = CELL.CROWDED;
  grid[10][10] = CELL.CROWDED;
  grid[10][11] = CELL.CROWDED;
  grid[11][10] = CELL.CROWDED;
  return { height: H, width: W, start: [0, 0], goal: [11, 11], grid };
}

function getCostVsLengthLayout() {
  const H = 4, W = 8;
  const grid = Array.from({ length: H }, () => Array(W).fill(CELL.OPEN));
  for (let c = 2; c <= 5; c++) grid[1][c] = CELL.CROWDED;
  for (let c = 1; c <= 6; c++) grid[2][c] = CELL.SHELF;
  return { height: H, width: W, start: [1, 1], goal: [1, 6], grid };
}

function getTrolleyLayout() {
  const H = 8, W = 10;
  const grid = Array.from({ length: H }, () => Array(W).fill(CELL.OPEN));
  for (let r = 0; r < 8; r++) {
    if (r !== 2 && r !== 6) grid[r][4] = CELL.SHELF;
  }
  for (let c = 1; c <= 3; c++) grid[4][c] = CELL.SHELF;
  for (let c = 6; c <= 8; c++) grid[3][c] = CELL.SHELF;
  return { height: H, width: W, start: [0, 0], goal: [7, 9], grid, trolleyPos: [6, 2] };
}

function getTrappedLayout() {
  const H = 5, W = 5;
  const grid = Array.from({ length: H }, () => Array(W).fill(CELL.OPEN));
  for (let c = 0; c < 5; c++) {
    if (c !== 2) grid[2][c] = CELL.SHELF;
  }
  return { height: H, width: W, start: [0, 0], goal: [4, 4], grid, trolleyPos: [2, 2] };
}

// ==========================================================================
// 6. Three.js Christmas Scene & Procedural Santa Claus Generator
// ==========================================================================
class WarehouseScene {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x030a16); // Deep winter midnight
    this.scene.fog = new THREE.FogExp2(0x030a16, 0.022);

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(16, 22, 24);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05;

    this.setupLighting();
    this.setup3DSnowParticles();

    // Scene groups
    this.gridGroup = new THREE.Group();
    this.pathGroup = new THREE.Group();
    this.frontierGroup = new THREE.Group();
    this.scene.add(this.gridGroup);
    this.scene.add(this.pathGroup);
    this.scene.add(this.frontierGroup);

    this.santa = null;
    this.trolley = null;
    this.cameraMode = 'iso';

    window.addEventListener('resize', () => this.onWindowResize());
  }

  setupLighting() {
    // Soft cool moonlight
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.75);
    this.scene.add(ambientLight);

    // Warm golden holiday key light
    const dirLight = new THREE.DirectionalLight(0xfff5e6, 0.95);
    dirLight.position.set(22, 36, 16);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    const d = 25;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    this.scene.add(dirLight);

    // Cyan icy rim light
    const iceRimLight = new THREE.DirectionalLight(0x7dd3fc, 0.45);
    iceRimLight.position.set(-20, 12, -20);
    this.scene.add(iceRimLight);
  }

  setup3DSnowParticles() {
    const snowCount = 650;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(snowCount * 3);
    const velocities = new Float32Array(snowCount);

    for (let i = 0; i < snowCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 1] = Math.random() * 25 + 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 45;
      velocities[i] = Math.random() * 0.05 + 0.025;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.snowVelocities = velocities;

    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.22,
      transparent: true,
      opacity: 0.85
    });

    this.snowParticles = new THREE.Points(geo, mat);
    this.scene.add(this.snowParticles);
  }

  updateSnowParticles() {
    if (!this.snowParticles) return;
    const pos = this.snowParticles.geometry.attributes.position.array;
    for (let i = 0; i < pos.length / 3; i++) {
      pos[i * 3 + 1] -= this.snowVelocities[i];
      pos[i * 3] += Math.sin(Date.now() * 0.001 + i) * 0.01;
      if (pos[i * 3 + 1] < 0) {
        pos[i * 3 + 1] = 25;
      }
    }
    this.snowParticles.geometry.attributes.position.needsUpdate = true;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // --- 3D SANTA CLAUS MODEL GENERATOR ---
  createSanta() {
    const group = new THREE.Group();

    // Santa's Color Palette & Materials
    const suitMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.45 }); // Rich Christmas Red
    const furMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });    // Fluffy White Fur
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.6 });   // Warm Rosy Skin
    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 });// Black Boots & Belt
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.85, roughness: 0.2 }); // Gold Buckles
    const mittenMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 }); // Forest Green Mittens

    // 1. Black Boots & Legs
    const bootGeo = new THREE.BoxGeometry(0.18, 0.22, 0.28);
    const leftBoot = new THREE.Mesh(bootGeo, leatherMat);
    leftBoot.position.set(-0.16, 0.11, 0.02);
    leftBoot.castShadow = true;

    const rightBoot = new THREE.Mesh(bootGeo, leatherMat);
    rightBoot.position.set(0.16, 0.11, 0.02);
    rightBoot.castShadow = true;

    // Boot Gold Buckles
    const bootBuckleGeo = new THREE.BoxGeometry(0.10, 0.06, 0.02);
    const bBuckleL = new THREE.Mesh(bootBuckleGeo, goldMat);
    bBuckleL.position.set(-0.16, 0.14, 0.16);
    const bBuckleR = new THREE.Mesh(bootBuckleGeo, goldMat);
    bBuckleR.position.set(0.16, 0.14, 0.16);

    group.add(leftBoot, rightBoot, bBuckleL, bBuckleR);

    // 2. Jolly Round Belly & Coat Body
    const bellyGeo = new THREE.SphereGeometry(0.42, 20, 20);
    bellyGeo.scale(1.05, 1.0, 1.1);
    const belly = new THREE.Mesh(bellyGeo, suitMat);
    belly.position.y = 0.62;
    belly.castShadow = true;
    group.add(belly);

    // White fur coat hem (around hips)
    const hemGeo = new THREE.TorusGeometry(0.38, 0.07, 12, 24);
    hemGeo.rotateX(Math.PI / 2);
    const hem = new THREE.Mesh(hemGeo, furMat);
    hem.position.y = 0.32;
    group.add(hem);

    // 3. Thick Black Leather Belt with Shiny Golden Buckle
    const beltGeo = new THREE.TorusGeometry(0.43, 0.065, 12, 24);
    beltGeo.rotateX(Math.PI / 2);
    const belt = new THREE.Mesh(beltGeo, leatherMat);
    belt.position.y = 0.58;
    group.add(belt);

    // Golden Belt Buckle
    const buckleGeo = new THREE.BoxGeometry(0.18, 0.14, 0.06);
    const buckle = new THREE.Mesh(buckleGeo, goldMat);
    buckle.position.set(0, 0.58, 0.44);
    group.add(buckle);

    // Vertical White Fur Trim down the coat
    const trimGeo = new THREE.BoxGeometry(0.08, 0.45, 0.04);
    const trim = new THREE.Mesh(trimGeo, furMat);
    trim.position.set(0, 0.68, 0.42);
    group.add(trim);

    // 4. Arms & Green Mittens
    const armGeo = new THREE.CylinderGeometry(0.09, 0.10, 0.38, 12);
    armGeo.rotateZ(Math.PI / 3.5);

    const leftArm = new THREE.Mesh(armGeo, suitMat);
    leftArm.position.set(-0.40, 0.72, 0);
    const rightArm = new THREE.Mesh(armGeo, suitMat);
    rightArm.position.set(0.40, 0.72, 0);
    rightArm.rotation.z = Math.PI / 3.5;
    group.add(leftArm, rightArm);

    // White Fur Cuffs
    const cuffGeo = new THREE.TorusGeometry(0.10, 0.04, 10, 16);
    const cuffL = new THREE.Mesh(cuffGeo, furMat);
    cuffL.position.set(-0.52, 0.62, 0);
    const cuffR = new THREE.Mesh(cuffGeo, furMat);
    cuffR.position.set(0.52, 0.62, 0);
    group.add(cuffL, cuffR);

    // Mittens
    const mittenGeo = new THREE.SphereGeometry(0.10, 12, 12);
    const mittenL = new THREE.Mesh(mittenGeo, mittenMat);
    mittenL.position.set(-0.56, 0.58, 0.04);
    const mittenR = new THREE.Mesh(mittenGeo, mittenMat);
    mittenR.position.set(0.56, 0.58, 0.04);
    group.add(mittenL, mittenR);

    // 5. Santa's Head & Face
    const headGeo = new THREE.SphereGeometry(0.24, 20, 20);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.08;
    head.castShadow = true;
    group.add(head);

    // Rosy Button Nose
    const noseGeo = new THREE.SphereGeometry(0.05, 12, 12);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xf87171, roughness: 0.5 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, 1.08, 0.24);
    group.add(nose);

    // Twinkling Black Eyes
    const eyeGeo = new THREE.SphereGeometry(0.03, 10, 10);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.08, 1.14, 0.20);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.08, 1.14, 0.20);
    group.add(eyeL, eyeR);

    // Rosy Cheeks
    const cheekGeo = new THREE.SphereGeometry(0.04, 10, 10);
    const cheekMat = new THREE.MeshBasicMaterial({ color: 0xfb7185, transparent: true, opacity: 0.7 });
    const cheekL = new THREE.Mesh(cheekGeo, cheekMat);
    cheekL.position.set(-0.14, 1.07, 0.18);
    const cheekR = new THREE.Mesh(cheekGeo, cheekMat);
    cheekR.position.set(0.14, 1.07, 0.18);
    group.add(cheekL, cheekR);

    // 6. Fluffy White Beard & Moustache
    const beardGroup = new THREE.Group();
    // Main beard volume
    const beardMain = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 16, 16),
      furMat
    );
    beardMain.scale.set(1.1, 1.4, 0.9);
    beardMain.position.set(0, 0.92, 0.16);
    beardGroup.add(beardMain);

    // Curled Moustache wings
    const stacheGeo = new THREE.SphereGeometry(0.07, 10, 10);
    stacheGeo.scale(1.8, 0.8, 0.8);
    const stacheL = new THREE.Mesh(stacheGeo, furMat);
    stacheL.position.set(-0.09, 1.03, 0.24);
    stacheL.rotation.z = -0.2;
    const stacheR = new THREE.Mesh(stacheGeo, furMat);
    stacheR.position.set(0.09, 1.03, 0.24);
    stacheR.rotation.z = 0.2;
    beardGroup.add(stacheL, stacheR);
    group.add(beardGroup);

    // 7. Iconic Red Santa Hat
    const hatGroup = new THREE.Group();
    // White fur brim
    const brimGeo = new THREE.TorusGeometry(0.25, 0.065, 12, 24);
    brimGeo.rotateX(Math.PI / 2);
    const brim = new THREE.Mesh(brimGeo, furMat);
    brim.position.y = 1.25;
    hatGroup.add(brim);

    // Red cone cap folding back
    const coneGeo = new THREE.ConeGeometry(0.24, 0.55, 16);
    coneGeo.rotateX(-0.35); // Tilt gracefully backward
    const cone = new THREE.Mesh(coneGeo, suitMat);
    cone.position.set(0, 1.46, -0.08);
    cone.castShadow = true;
    hatGroup.add(cone);

    // Fluffy white pom-pom at hat tip
    const pomGeo = new THREE.SphereGeometry(0.09, 14, 14);
    const pom = new THREE.Mesh(pomGeo, furMat);
    pom.position.set(0, 1.68, -0.22);
    hatGroup.add(pom);

    // Glowing Holiday Status Star atop hat
    const starGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const starMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const statusStar = new THREE.Mesh(starGeo, starMat);
    statusStar.position.set(0, 1.78, -0.22);
    hatGroup.add(statusStar);
    this.statusStar = statusStar;

    group.add(hatGroup);

    // 8. Giant Burlap Sack of Christmas Toys on Back
    const sackGroup = new THREE.Group();
    const sackGeo = new THREE.SphereGeometry(0.36, 16, 16);
    sackGeo.scale(1.0, 1.25, 0.95);
    const sackMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.95 }); // Burlap brown
    const sack = new THREE.Mesh(sackGeo, sackMat);
    sack.position.set(-0.16, 0.72, -0.28);
    sack.rotation.y = 0.3;
    sack.castShadow = true;
    sackGroup.add(sack);

    // Wrapped Gift Box poking out of sack
    const giftGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
    const giftMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 });
    const gift = new THREE.Mesh(giftGeo, giftMat);
    gift.position.set(-0.16, 1.05, -0.28);
    gift.rotation.set(0.2, 0.4, 0.1);

    const giftRib = new THREE.Mesh(
      new THREE.BoxGeometry(0.23, 0.23, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8, roughness: 0.2 })
    );
    giftRib.position.copy(gift.position);
    giftRib.rotation.copy(gift.rotation);
    sackGroup.add(gift, giftRib);

    // Candy Cane sticking out of sack
    const caneGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.28, 8);
    const caneMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const cane = new THREE.Mesh(caneGeo, caneMat);
    cane.position.set(-0.06, 1.08, -0.24);
    cane.rotation.z = -0.3;
    sackGroup.add(cane);

    group.add(sackGroup);

    // 9. Dedicated Warm Holiday Spotlight on Santa
    const santaGlow = new THREE.PointLight(0xffedd5, 1.4, 6.0);
    santaGlow.position.set(0, 2.2, 0.2);
    group.add(santaGlow);

    // Make Santa 25% bigger so he is bold, unmistakable, and prominent!
    group.scale.set(1.25, 1.25, 1.25);

    return group;
  }

  // --- Festive Toy Shelves ---
  createFestiveShelf() {
    const group = new THREE.Group();

    // Pine Wood Frame
    const pillarGeo = new THREE.BoxGeometry(0.05, 1.25, 0.05);
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x3f2314, roughness: 0.85 });
    [[-0.42, -0.42], [0.42, -0.42], [-0.42, 0.42], [0.42, 0.42]].forEach(([x, z]) => {
      const p = new THREE.Mesh(pillarGeo, woodMat);
      p.position.set(x, 0.62, z);
      p.castShadow = true;
      group.add(p);
    });

    // 2 Shelving Decks
    const deckGeo = new THREE.BoxGeometry(0.92, 0.04, 0.92);
    const d1 = new THREE.Mesh(deckGeo, woodMat);
    d1.position.y = 0.42;
    const d2 = new THREE.Mesh(deckGeo, woodMat);
    d2.position.y = 0.88;
    group.add(d1, d2);

    // Fluffy Snow Cap on Top of Shelf
    const snowCapGeo = new THREE.BoxGeometry(0.94, 0.06, 0.94);
    const snowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const snowCap = new THREE.Mesh(snowCapGeo, snowMat);
    snowCap.position.y = 1.26;
    group.add(snowCap);

    // Assorted Wrapped Holiday Toys & Presents
    const giftColors = [0xdc2626, 0x2563eb, 0x16a34a, 0xf59e0b];
    const ribbons = [0xfde047, 0xffffff, 0xf87171, 0x93c5fd];

    const makePresent = (w, h, d, col, ribCol) => {
      const pGroup = new THREE.Group();
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.4 })
      );
      const rib = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.01, h + 0.01, d * 0.28),
        new THREE.MeshStandardMaterial({ color: ribCol, metalness: 0.6, roughness: 0.3 })
      );
      pGroup.add(box, rib);
      pGroup.castShadow = true;
      return pGroup;
    };

    const pres1 = makePresent(0.32, 0.30, 0.32, giftColors[0], ribbons[0]);
    pres1.position.set(-0.18, 0.59, -0.16);

    const pres2 = makePresent(0.26, 0.24, 0.26, giftColors[1], ribbons[1]);
    pres2.position.set(0.18, 0.56, 0.16);

    const pres3 = makePresent(0.36, 0.28, 0.36, giftColors[2], ribbons[2]);
    pres3.position.set(0, 1.04, 0);

    group.add(pres1, pres2, pres3);
    return group;
  }

  // --- Runaway Sleigh Obstacle (Trolley) ---
  createRunawaySleigh() {
    const group = new THREE.Group();

    // Wooden Sleigh Runners
    const runnerGeo = new THREE.BoxGeometry(0.8, 0.04, 0.04);
    const runnerMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const rLeft = new THREE.Mesh(runnerGeo, runnerMat);
    rLeft.position.set(0, 0.05, -0.22);
    const rRight = new THREE.Mesh(runnerGeo, runnerMat);
    rRight.position.set(0, 0.05, 0.22);
    group.add(rLeft, rRight);

    // Curved front tips of runners
    const tipGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.18, 8);
    tipGeo.rotateZ(Math.PI / 4);
    const tipL = new THREE.Mesh(tipGeo, runnerMat);
    tipL.position.set(0.44, 0.12, -0.22);
    const tipR = new THREE.Mesh(tipGeo, runnerMat);
    tipR.position.set(0.44, 0.12, 0.22);
    group.add(tipL, tipR);

    // Crimson Sleigh Body
    const bodyGeo = new THREE.BoxGeometry(0.68, 0.22, 0.48);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.35 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, 0.22, 0);
    body.castShadow = true;
    group.add(body);

    // Gold Trim on Sleigh
    const trimGeo = new THREE.BoxGeometry(0.72, 0.03, 0.52);
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8, roughness: 0.2 });
    const trim = new THREE.Mesh(trimGeo, goldMat);
    trim.position.set(0, 0.34, 0);
    group.add(trim);

    // Giant wrapped present inside sleigh
    const giftGeo = new THREE.BoxGeometry(0.4, 0.35, 0.36);
    const giftMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });
    const gift = new THREE.Mesh(giftGeo, giftMat);
    gift.position.set(0, 0.44, 0);
    gift.castShadow = true;
    group.add(gift);

    // Red Warning Beacon on Sleigh
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    beacon.position.set(0, 0.70, 0);
    group.add(beacon);

    return group;
  }

  // --- Build Environment Grid ---
  buildWarehouse(layoutData) {
    while (this.gridGroup.children.length > 0) {
      this.gridGroup.remove(this.gridGroup.children[0]);
    }
    this.clearPath();

    const H = layoutData.height;
    const W = layoutData.width;
    const grid = layoutData.grid;
    this.currentLayout = layoutData;

    this.controls.target.set(W / 2, 0, H / 2);
    this.camera.position.set(W * 1.5, Math.max(H, W) * 1.6, H * 1.8);
    this.controls.update();

    // Snowy Base Floor (Deep arctic ice)
    const floorGeo = new THREE.BoxGeometry(W + 1.2, 0.2, H + 1.2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0c213d,
      roughness: 0.35,
      metalness: 0.3
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(W / 2 - 0.5, -0.1, H / 2 - 0.5);
    floor.receiveShadow = true;
    this.gridGroup.add(floor);

    // Build Individual Winter Tiles
    const tileGeo = new THREE.BoxGeometry(0.94, 0.04, 0.94);

    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        const val = grid[r][c];
        const isStart = (r === layoutData.start[0] && c === layoutData.start[1]);
        const isGoal = (r === layoutData.goal[0] && c === layoutData.goal[1]);

        let tileColor = 0x163456; // Frosty Ice Blue
        let isEmissive = false;
        let emissiveColor = 0x000000;

        if (isStart) {
          tileColor = 0x047857; // Santa Pine Green
          isEmissive = true;
          emissiveColor = 0x10b981;
        } else if (isGoal) {
          tileColor = 0xd97706; // Christmas Star Gold
          isEmissive = true;
          emissiveColor = 0xfbbf24;
        } else if (val === CELL.CROWDED) {
          tileColor = 0xe0e7ff; // Deep Snowdrift (Cost 4)
          isEmissive = true;
          emissiveColor = 0x93c5fd;
        } else if (val === CELL.RESTRICTED) {
          tileColor = 0x991b1b; // Cracked Thin Ice (Hazard)
          isEmissive = true;
          emissiveColor = 0xef4444;
        }

        const tileMat = new THREE.MeshStandardMaterial({
          color: tileColor,
          roughness: 0.6,
          metalness: 0.2,
          emissive: emissiveColor,
          emissiveIntensity: isEmissive ? 0.4 : 0
        });

        const tile = new THREE.Mesh(tileGeo, tileMat);
        tile.position.set(c, 0.02, r);
        tile.receiveShadow = true;
        tile.userData = { r, c, val };
        this.gridGroup.add(tile);

        // Place Winter Props
        if (val === CELL.SHELF) {
          const shelf = this.createFestiveShelf();
          shelf.position.set(c, 0, r);
          this.gridGroup.add(shelf);
        } else if (val === CELL.RESTRICTED) {
          // Candy Cane Warning Posts
          const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 12);
          const caneMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
          [[-0.32, -0.32], [0.32, -0.32], [-0.32, 0.32], [0.32, 0.32]].forEach(([px, pz]) => {
            const post = new THREE.Mesh(postGeo, caneMat);
            post.position.set(c + px, 0.25, r + pz);
            this.gridGroup.add(post);
          });
        } else if (val === CELL.CROWDED) {
          // Sparkling Deep Snowdrift Mound
          const moundGeo = new THREE.SphereGeometry(0.42, 12, 10);
          moundGeo.scale(1, 0.35, 1);
          const moundMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.3,
            metalness: 0.1
          });
          const mound = new THREE.Mesh(moundGeo, moundMat);
          mound.position.set(c, 0.08, r);
          this.gridGroup.add(mound);
        } else if (isStart) {
          // Santa's Workshop Wreath Ring
          const ringGeo = new THREE.TorusGeometry(0.35, 0.05, 12, 24);
          ringGeo.rotateX(Math.PI / 2);
          const ringMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4 });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.position.set(c, 0.05, r);
          this.gridGroup.add(ring);
        } else if (isGoal) {
          // Christmas Delivery Tree & Star
          const treeGroup = new THREE.Group();
          const treeMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.6 });
          const c1 = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.35, 8), treeMat);
          c1.position.y = 0.2;
          const c2 = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.32, 8), treeMat);
          c2.position.y = 0.42;
          const star = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 10, 10),
            new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
          );
          star.position.y = 0.62;
          treeGroup.add(c1, c2, star);
          treeGroup.position.set(c, 0, r);
          this.gridGroup.add(treeGroup);
        }
      }
    }

    // Spawn Santa Claus
    if (!this.santa) {
      this.santa = this.createSanta();
      this.scene.add(this.santa);
    }
    const [sr, sc] = layoutData.start;
    this.santa.position.set(sc, 0, sr);
    this.santa.visible = true;

    // Handle Runaway Sleigh Obstacle
    if (layoutData.trolleyPos) {
      if (!this.trolley) {
        this.trolley = this.createRunawaySleigh();
        this.scene.add(this.trolley);
      }
      const [tr, tc] = layoutData.trolleyPos;
      this.trolley.position.set(tc, 0, tr);
      this.trolley.visible = true;
    } else if (this.trolley) {
      this.trolley.visible = false;
    }
  }

  clearPath() {
    while (this.pathGroup.children.length > 0) {
      this.pathGroup.remove(this.pathGroup.children[0]);
    }
    while (this.frontierGroup.children.length > 0) {
      this.frontierGroup.remove(this.frontierGroup.children[0]);
    }
  }

  drawRouteSpline(pathCoords, color = 0xfbbf24) {
    this.clearPath();
    if (!pathCoords || pathCoords.length < 2) return;

    const points = pathCoords.map(([r, c]) => new THREE.Vector3(c, 0.08, r));
    const curve = new THREE.CatmullRomCurve3(points);
    curve.curveType = 'catmullrom';
    curve.tension = 0.2;

    // Glowing Golden Christmas Ribbon Tube
    const tubeGeo = new THREE.TubeGeometry(curve, points.length * 8, 0.05, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({ color, wireframe: false });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    this.pathGroup.add(tube);

    // Glowing Baubles / Ornaments on waypoints
    const sphereGeo = new THREE.SphereGeometry(0.07, 12, 12);
    const dotMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.2,
      metalness: 0.8
    });
    pathCoords.forEach(([r, c]) => {
      const dot = new THREE.Mesh(sphereGeo, dotMat);
      dot.position.set(c, 0.10, r);
      this.pathGroup.add(dot);
    });
  }

  showFrontierWave(visitedNodes, progressRatio) {
    while (this.frontierGroup.children.length > 0) {
      this.frontierGroup.remove(this.frontierGroup.children[0]);
    }
    if (!visitedNodes || visitedNodes.length === 0) return;

    const countToShow = Math.floor(visitedNodes.length * progressRatio);
    const boxGeo = new THREE.BoxGeometry(0.42, 0.03, 0.42);
    const boxMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45
    });

    for (let i = 0; i < countToShow; i++) {
      const [r, c] = visitedNodes[i];
      const mesh = new THREE.Mesh(boxGeo, boxMat);
      mesh.position.set(c, 0.06, r);
      this.frontierGroup.add(mesh);
    }
  }

  setCameraView(mode) {
    this.cameraMode = mode;
    const layout = this.currentLayout;
    if (!layout) return;

    const W = layout.width;
    const H = layout.height;

    if (mode === 'top') {
      this.controls.target.set(W / 2 - 0.5, 0, H / 2 - 0.5);
      this.camera.position.set(W / 2 - 0.5, Math.max(W, H) * 1.6, H / 2 - 0.49);
      this.controls.update();
    } else if (mode === 'iso') {
      this.controls.target.set(W / 2 - 0.5, 0, H / 2 - 0.5);
      this.camera.position.set(W * 1.4, Math.max(H, W) * 1.5, H * 1.7);
      this.controls.update();
    }
  }

  focusSanta() {
    if (!this.santa) return;
    this.cameraMode = 'manual';
    const pos = this.santa.position;
    this.controls.target.set(pos.x, 0.9, pos.z);
    this.camera.position.set(pos.x + 2.0, 2.5, pos.z + 3.2);
    this.controls.update();
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Update 3D Falling Snow Particles
    this.updateSnowParticles();

    // Jolly Santa Stride / Waddling Animation
    if (this.santa) {
      const t = Date.now() * 0.0035;
      this.santa.rotation.y = Math.sin(t) * 0.12;
      this.santa.position.y = Math.abs(Math.sin(t * 2)) * 0.04; // Jolly bobbing step
    }

    // Follow camera mode
    if (this.cameraMode === 'follow' && this.santa) {
      this.controls.target.copy(this.santa.position);
      this.camera.position.set(
        this.santa.position.x - 3,
        this.santa.position.y + 4.5,
        this.santa.position.z + 5
      );
      this.controls.update();
    } else {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// ==========================================================================
// 7. Application Controller & UI State Machine
// ==========================================================================
class AppController {
  constructor() {
    initFestiveDecorations();
    this.scene = new WarehouseScene(document.getElementById('canvas-container'));
    this.scene.animate();

    this.simData = null;
    this.currentScenarioKey = 'standard';
    this.currentAlgo = 'A*';
    this.activeLayout = null;
    this.activeResult = null;

    // Playback state
    this.isPlaying = false;
    this.currentStep = 0;
    this.playbackSpeed = 1.0;
    this.timerId = null;
    this.traversalPath = [];

    // Sandbox state
    this.sandboxBrush = 'shelf';

    this.initElements();
    this.bindEvents();
    this.loadSimulationData();
  }

  initElements() {
    this.elScenario = document.getElementById('scenario-select');
    this.elAlgo = document.getElementById('algorithm-select');
    this.elBtnPlay = document.getElementById('btn-play-pause');
    this.elBtnReset = document.getElementById('btn-reset');
    this.elBtnStepPrev = document.getElementById('btn-step-prev');
    this.elBtnStepNext = document.getElementById('btn-step-next');
    this.elSlider = document.getElementById('sim-progress-slider');
    this.elProgressText = document.getElementById('progress-text');
    this.elSpeedPills = document.querySelectorAll('.speed-pill');
    this.elBtnCamera = document.getElementById('btn-camera-view');
    this.elBtnFocusSanta = document.getElementById('btn-focus-santa');
    this.elBtnHoHoHo = document.getElementById('btn-test-hohoho');
    this.elCameraLabel = document.getElementById('camera-label');
    this.elBtnAudio = document.getElementById('btn-audio');
    this.elAudioIcon = document.getElementById('audio-icon');

    // HUD Telemetry Elements
    this.elHudPos = document.getElementById('hud-pos');
    this.elHudCellCost = document.getElementById('hud-cell-cost');
    this.elHudTotalCost = document.getElementById('hud-total-cost');
    this.elHudMoves = document.getElementById('hud-moves');
    this.elHudNodes = document.getElementById('hud-nodes');
    this.elHudTime = document.getElementById('hud-time');
    this.elHudBadge = document.getElementById('bot-status-badge');
    this.elHudAlert = document.getElementById('hud-alert');
    this.elHudAlertText = document.getElementById('hud-alert-text');
    this.elTableBody = document.getElementById('comparison-tbody');

    // Modals & Panels
    this.elTeamModal = document.getElementById('team-modal');
    this.elBtnTeam = document.getElementById('btn-team-modal');
    this.elBtnCloseModal = document.getElementById('btn-close-modal');
    this.elSandboxTools = document.getElementById('sandbox-tools');

    // Live Search & Edit Interactive Controls
    this.elBtnWatchSearch = document.getElementById('btn-watch-search');
    this.elBtnEditMode = document.getElementById('btn-edit-mode');
    this.elHudLiveTag = document.getElementById('hud-live-tag');
    this.isEditMode = false;
  }

  bindEvents() {
    this.elScenario.addEventListener('change', () => this.switchScenario(this.elScenario.value));
    this.elAlgo.addEventListener('change', () => this.switchAlgorithm(this.elAlgo.value));

    this.elBtnPlay.addEventListener('click', () => {
      sfx.init();
      this.togglePlay();
    });
    this.elBtnReset.addEventListener('click', () => this.resetSimulation());
    this.elBtnStepNext.addEventListener('click', () => {
      sfx.init();
      this.stepForward();
    });
    this.elBtnStepPrev.addEventListener('click', () => this.stepBackward());

    this.elSlider.addEventListener('input', (e) => {
      const targetStep = Math.floor((e.target.value / 100) * (this.traversalPath.length - 1));
      this.jumpToStep(targetStep);
    });

    this.elSpeedPills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.elSpeedPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.playbackSpeed = parseFloat(pill.dataset.speed);
        if (this.isPlaying) {
          this.stopLoop();
          this.startLoop();
        }
      });
    });

    this.elBtnCamera.addEventListener('click', () => this.cycleCameraView());
    if (this.elBtnFocusSanta) {
      this.elBtnFocusSanta.addEventListener('click', () => this.scene.focusSanta());
    }
    if (this.elBtnHoHoHo) {
      this.elBtnHoHoHo.addEventListener('click', () => {
        sfx.init();
        sfx.playHoHoHo();
      });
    }
    this.elBtnAudio.addEventListener('click', () => {
      sfx.enabled = !sfx.enabled;
      this.elAudioIcon.textContent = sfx.enabled ? '🔔' : '🔕';
    });

    this.elBtnTeam.addEventListener('click', () => {
      this.elTeamModal.style.display = 'flex';
    });
    this.elBtnCloseModal.addEventListener('click', () => {
      this.elTeamModal.style.display = 'none';
    });
    this.elTeamModal.addEventListener('click', (e) => {
      if (e.target === this.elTeamModal) this.elTeamModal.style.display = 'none';
    });

    // Watch AI Search Frontier Wave Button
    if (this.elBtnWatchSearch) {
      this.elBtnWatchSearch.addEventListener('click', () => {
        sfx.init();
        this.watchAISearch();
      });
    }

    // Toggle Live Map Editing Mode
    if (this.elBtnEditMode) {
      this.elBtnEditMode.addEventListener('click', () => {
        this.isEditMode = !this.isEditMode;
        if (this.isEditMode) {
          this.elBtnEditMode.classList.add('highlight-gold');
          this.elBtnEditMode.innerHTML = '<span class="icon">✏️</span> EDITING ON';
          if (this.elSandboxTools) this.elSandboxTools.style.display = 'block';
          if (this.elHudLiveTag) {
            this.elHudLiveTag.textContent = '✏️ EDIT MODE ACTIVE: CLICK ANY TILE TO EDIT!';
            this.elHudLiveTag.style.color = '#fbbf24';
            this.elHudLiveTag.style.borderColor = '#fbbf24';
          }
        } else {
          this.elBtnEditMode.classList.remove('highlight-gold');
          this.elBtnEditMode.innerHTML = '<span class="icon">✏️</span> EDIT MAP';
          if (this.elSandboxTools && this.currentScenarioKey !== 'custom') {
            this.elSandboxTools.style.display = 'none';
          }
          if (this.elHudLiveTag) {
            this.elHudLiveTag.textContent = '⚡ LIVE SEARCH: ACTIVE';
            this.elHudLiveTag.style.color = '#38bdf8';
            this.elHudLiveTag.style.borderColor = 'rgba(56, 189, 248, 0.35)';
          }
        }
      });
    }

    // Sandbox Brush Buttons
    document.querySelectorAll('.brush-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.brush-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.sandboxBrush = btn.dataset.brush;
      });
    });

    // Raycaster for Interactive Sandbox Grid Clicking (Enabled on ANY map in edit mode)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    this.scene.renderer.domElement.addEventListener('pointerdown', (e) => {
      if (this.currentScenarioKey !== 'custom' && !this.isEditMode) return;
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, this.scene.camera);
      const intersects = raycaster.intersectObjects(this.scene.gridGroup.children);
      for (const hit of intersects) {
        if (hit.object.userData && hit.object.userData.r !== undefined) {
          this.onCellClicked(hit.object.userData.r, hit.object.userData.c);
          break;
        }
      }
    });
  }

  async loadSimulationData() {
    try {
      const response = await fetch('sim_data.json');
      if (response.ok) {
        this.simData = await response.json();
      }
    } catch(err) {
      console.warn("sim_data.json not loaded over fetch (CORS/offline); using live browser search engine.");
    }
    this.switchScenario(this.elScenario.value);
  }

  switchScenario(key) {
    this.currentScenarioKey = key;
    this.resetSimulation();

    this.elSandboxTools.style.display = (key === 'custom') ? 'block' : 'none';

    if (key === 'standard') {
      this.activeLayout = getStandardLayout();
    } else if (key === 'cost_vs_length') {
      this.activeLayout = getCostVsLengthLayout();
    } else if (key === 'trolley') {
      this.activeLayout = getTrolleyLayout();
    } else if (key === 'trapped') {
      this.activeLayout = getTrappedLayout();
    } else if (key === 'custom') {
      this.activeLayout = getStandardLayout();
    }

    this.scene.buildWarehouse(this.activeLayout);
    this.computeAlgorithmMetrics();
  }

  switchAlgorithm(algo) {
    this.currentAlgo = algo;
    this.resetSimulation();
    this.computeAlgorithmMetrics();
  }

  computeAlgorithmMetrics() {
    const layout = this.activeLayout;
    const algos = ['A*', 'BFS', 'Greedy Best-First', 'DFS'];
    const compResults = {};

    algos.forEach(algo => {
      compResults[algo] = runLiveSearch(algo, layout.grid, layout.start, layout.goal);
    });

    this.activeResult = compResults[this.currentAlgo];

    // Special handling for dynamic trolley scenario
    if (this.currentScenarioKey === 'trolley') {
      if (this.simData && this.simData.trolley_replanning) {
        const sim = this.simData.trolley_replanning.simulation;
        this.traversalPath = sim.actual_executed_path;
        this.trolleyEvent = sim.replan_events[0];
      } else {
        this.traversalPath = this.activeResult.path;
      }
    } else if (this.currentScenarioKey === 'trapped') {
      if (this.simData && this.simData.trapped_scenario) {
        this.traversalPath = this.simData.trapped_scenario.simulation.actual_executed_path;
      } else {
        this.traversalPath = this.activeResult.path;
      }
    } else {
      this.traversalPath = this.activeResult.path;
      this.trolleyEvent = null;
    }

    this.scene.drawRouteSpline(this.traversalPath);
    this.populateComparisonTable(compResults);
    this.updateHUD(0);
  }

  populateComparisonTable(results) {
    this.elTableBody.innerHTML = '';
    for (const [name, res] of Object.entries(results)) {
      const tr = document.createElement('tr');
      if (name === this.currentAlgo) tr.classList.add('active-algo');
      tr.innerHTML = `
        <td>${name}</td>
        <td>${res.goal_reached ? res.path_length : 'N/A'}</td>
        <td>${res.goal_reached ? res.total_cost.toFixed(1) : 'N/A'}</td>
        <td>${res.nodes_expanded}</td>
      `;
      this.elTableBody.appendChild(tr);
    }
  }

  updateHUD(stepIdx) {
    if (!this.traversalPath || this.traversalPath.length === 0) {
      this.elHudPos.textContent = 'NO ROUTE';
      this.elHudBadge.textContent = 'BLIZZARD';
      this.elHudBadge.className = 'badge festive-badge alert';
      this.elHudAlert.style.display = 'flex';
      this.elHudAlertText.textContent = 'BLIZZARD ALERT: Santa cannot find a path through the snow!';
      return;
    }

    const pos = this.traversalPath[stepIdx] || this.traversalPath[0];
    const [r, c] = pos;
    this.elHudPos.textContent = `(${r}, ${c})`;

    const cellCost = this.activeLayout.grid[r][c] === CELL.CROWDED ? 4.0 : 1.0;
    this.elHudCellCost.textContent = cellCost.toFixed(1);

    let totalCost = 0;
    for (let i = 1; i <= stepIdx; i++) {
      const [pr, pc] = this.traversalPath[i];
      totalCost += (this.activeLayout.grid[pr][pc] === CELL.CROWDED ? 4.0 : 1.0);
    }
    this.elHudTotalCost.textContent = totalCost.toFixed(1);
    this.elHudMoves.textContent = `${stepIdx} / ${this.traversalPath.length - 1}`;
    this.elHudNodes.textContent = this.activeResult ? this.activeResult.nodes_expanded : 0;
    this.elHudTime.textContent = this.activeResult ? `${this.activeResult.execution_time_ms.toFixed(2)} ms` : '0.00 ms';

    const percent = Math.floor((stepIdx / Math.max(1, this.traversalPath.length - 1)) * 100);
    this.elSlider.value = percent;
    this.elProgressText.textContent = `${percent}%`;

    // Position Santa
    this.scene.santa.position.set(c, 0, r);

    // Dynamic Sleigh Trigger Check
    if (this.currentScenarioKey === 'trolley' && this.trolleyEvent) {
      if (stepIdx === this.trolleyEvent.detected_at_step) {
        this.elHudAlert.style.display = 'flex';
        this.elHudAlertText.textContent = `RUNAWAY SLEIGH AT (${this.trolleyEvent.blocked_cell[0]},${this.trolleyEvent.blocked_cell[1]})! SANTA REPLANNING A* AROUND DEEP SNOW...`;
        this.elHudBadge.textContent = 'REPLANNING';
        this.elHudBadge.className = 'badge festive-badge alert';
        sfx.playAlarm();
        if (this.scene.statusStar) this.scene.statusStar.material.color.setHex(0xef4444);
      } else if (stepIdx > this.trolleyEvent.detected_at_step) {
        this.elHudAlert.style.display = 'flex';
        this.elHudAlertText.textContent = `REPLAN ACTIVE: Santa executing southern bypass detour.`;
        this.elHudBadge.textContent = 'DIVERTED';
        this.elHudBadge.className = 'badge festive-badge';
        if (this.scene.statusStar) this.scene.statusStar.material.color.setHex(0x38bdf8);
      } else {
        this.elHudAlert.style.display = 'none';
        this.elHudBadge.textContent = 'HO HO HO!';
        this.elHudBadge.className = 'badge festive-badge';
        if (this.scene.statusStar) this.scene.statusStar.material.color.setHex(0x10b981);
      }
    } else if (stepIdx === this.traversalPath.length - 1) {
      this.elHudBadge.textContent = 'DELIVERED!';
      this.elHudBadge.className = 'badge festive-badge';
      if (this.scene.statusStar) this.scene.statusStar.material.color.setHex(0xfbbf24);
      sfx.playVictory();
    } else {
      this.elHudAlert.style.display = 'none';
      this.elHudBadge.textContent = this.isPlaying ? 'DELIVERING' : 'READY';
      this.elHudBadge.className = 'badge festive-badge';
      if (this.scene.statusStar) this.scene.statusStar.material.color.setHex(0x10b981);
    }
  }

  // --- Playback State Machine ---
  togglePlay() {
    if (this.isPlaying) {
      this.pauseSimulation();
    } else {
      this.playSimulation();
    }
  }

  playSimulation() {
    if (!this.traversalPath || this.traversalPath.length === 0) return;
    if (this.currentStep >= this.traversalPath.length - 1) {
      this.currentStep = 0;
    }
    this.isPlaying = true;
    this.elBtnPlay.textContent = '⏸ PAUSE';
    sfx.playHoHoHo();
    this.startLoop();
  }

  pauseSimulation() {
    this.isPlaying = false;
    this.elBtnPlay.textContent = '▶ DELIVER';
    this.stopLoop();
    this.updateHUD(this.currentStep);
  }

  resetSimulation() {
    this.pauseSimulation();
    this.currentStep = 0;
    if (this.traversalPath && this.traversalPath.length > 0) {
      this.updateHUD(0);
    }
  }

  stepForward() {
    if (!this.traversalPath || this.currentStep >= this.traversalPath.length - 1) return;
    this.currentStep++;
    sfx.playStep();
    this.updateHUD(this.currentStep);
  }

  stepBackward() {
    if (!this.traversalPath || this.currentStep <= 0) return;
    this.currentStep--;
    this.updateHUD(this.currentStep);
  }

  jumpToStep(step) {
    if (!this.traversalPath) return;
    this.currentStep = Math.max(0, Math.min(step, this.traversalPath.length - 1));
    this.updateHUD(this.currentStep);
  }

  startLoop() {
    const intervalMs = Math.max(50, 420 / this.playbackSpeed);
    this.timerId = setInterval(() => {
      if (this.currentStep < this.traversalPath.length - 1) {
        this.currentStep++;
        sfx.playStep();
        this.updateHUD(this.currentStep);
      } else {
        this.pauseSimulation();
      }
    }, intervalMs);
  }

  stopLoop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  cycleCameraView() {
    if (this.scene.cameraMode === 'iso') {
      this.scene.setCameraView('top');
      this.elCameraLabel.textContent = 'TOP 2D';
    } else if (this.scene.cameraMode === 'top') {
      this.scene.setCameraView('follow');
      this.elCameraLabel.textContent = 'CHASE';
    } else {
      this.scene.setCameraView('iso');
      this.elCameraLabel.textContent = 'ISO 3D';
    }
  }

  // --- Live Search Frontier Visualization ---
  watchAISearch() {
    this.resetSimulation();
    const result = this.activeResult;
    if (!result || !result.visited_nodes || result.visited_nodes.length === 0) return;

    this.scene.clearPath();
    if (this.elBtnWatchSearch) {
      this.elBtnWatchSearch.disabled = true;
      this.elBtnWatchSearch.innerHTML = '<span class="icon">⏳</span> EXPLORING...';
    }

    const visited = result.visited_nodes;
    let idx = 0;
    const stepCount = visited.length;
    const interval = Math.max(15, Math.min(60, Math.floor(1200 / Math.max(1, stepCount))));

    const animTimer = setInterval(() => {
      idx++;
      const ratio = Math.min(1.0, idx / stepCount);
      this.scene.showFrontierWave(visited, ratio);

      if (this.elHudNodes) {
        this.elHudNodes.textContent = idx;
      }
      if (this.elHudLiveTag) {
        this.elHudLiveTag.textContent = `⚡ EXPLORING: NODE ${idx} / ${stepCount} (${this.currentAlgo})`;
      }

      if (idx >= stepCount) {
        clearInterval(animTimer);
        if (this.elBtnWatchSearch) {
          this.elBtnWatchSearch.disabled = false;
          this.elBtnWatchSearch.innerHTML = '<span class="icon">⚡</span> WATCH AI SEARCH';
        }
        if (this.elHudLiveTag) {
          this.elHudLiveTag.textContent = `🎯 GOAL FOUND! TRACED ${result.path_length} MOVES (COST: ${result.total_cost.toFixed(1)})`;
        }
        this.scene.drawRouteSpline(this.traversalPath);
        sfx.playVictory();
      }
    }, interval);
  }

  // --- Interactive Real-Time Grid Clicking ---
  onCellClicked(r, c) {
    if (this.currentScenarioKey !== 'custom' && !this.isEditMode) return;
    const layout = this.activeLayout;

    if (r === layout.start[0] && c === layout.start[1] && this.sandboxBrush !== 'start') return;
    if (r === layout.goal[0] && c === layout.goal[1] && this.sandboxBrush !== 'goal') return;

    if (this.sandboxBrush === 'shelf') {
      layout.grid[r][c] = (layout.grid[r][c] === CELL.SHELF) ? CELL.OPEN : CELL.SHELF;
    } else if (this.sandboxBrush === 'crowded') {
      layout.grid[r][c] = (layout.grid[r][c] === CELL.CROWDED) ? CELL.OPEN : CELL.CROWDED;
    } else if (this.sandboxBrush === 'open') {
      layout.grid[r][c] = CELL.OPEN;
    } else if (this.sandboxBrush === 'trolley') {
      layout.trolleyPos = [r, c];
    } else if (this.sandboxBrush === 'start') {
      layout.start = [r, c];
    } else if (this.sandboxBrush === 'goal') {
      layout.goal = [r, c];
    }

    this.scene.buildWarehouse(layout);
    this.computeAlgorithmMetrics();
    sfx.playStep();

    if (this.elHudLiveTag) {
      if (this.activeResult && this.activeResult.goal_reached) {
        this.elHudLiveTag.textContent = `⚡ DYNAMIC RECALC: ${this.activeResult.execution_time_ms.toFixed(2)}ms | ${this.activeResult.nodes_expanded} NODES | MOVES: ${this.activeResult.path_length}`;
        this.elHudLiveTag.style.borderColor = '#fbbf24';
        this.elHudLiveTag.style.color = '#fbbf24';
      } else {
        this.elHudLiveTag.textContent = `⚠️ NO PATH POSSIBLE (BLOCKED BY WALLS)`;
        this.elHudLiveTag.style.borderColor = '#ef4444';
        this.elHudLiveTag.style.color = '#ef4444';
      }
      setTimeout(() => {
        if (this.elHudLiveTag && !this.isEditMode) {
          this.elHudLiveTag.textContent = '⚡ LIVE SEARCH: ACTIVE';
          this.elHudLiveTag.style.borderColor = 'rgba(56, 189, 248, 0.35)';
          this.elHudLiveTag.style.color = '#38bdf8';
        }
      }, 3000);
    }
  }
}

// Instantiate on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('zoom')) {
    setTimeout(() => window.app.scene.focusSanta(), 400);
  }
  if (urlParams.get('scenario')) {
    setTimeout(() => {
      const scen = urlParams.get('scenario');
      const sel = document.getElementById('scenario-select');
      if (sel) sel.value = scen;
      window.app.switchScenario(scen);
    }, 300);
  }
  if (urlParams.get('modal') === 'roster') {
    setTimeout(() => {
      const modal = document.getElementById('team-modal');
      if (modal) modal.style.display = 'flex';
    }, 400);
  }
});
