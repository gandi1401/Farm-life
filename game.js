
import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

// =====================================
// FARM LIFE INDONESIA 2.0
// LIGHTWEIGHT 3D FARM SIMULATOR
// =====================================

const game = document.getElementById("game");
const loading = document.getElementById("loading");

try {

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9cc9e3);
scene.fog = new THREE.Fog(0x9cc9e3, 35, 100);

// CAMERA
const camera = new THREE.PerspectiveCamera(
  60, innerWidth / innerHeight, 0.1, 150
);

// RENDERER
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "low-power"
});

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

game.prepend(renderer.domElement);

// LIGHTING
scene.add(new THREE.HemisphereLight(
  0xddeeff, 0x65764a, 1.8
));

const sun = new THREE.DirectionalLight(0xffedca, 2.2);
sun.position.set(-15, 25, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -35;
sun.shadow.camera.right = 35;
sun.shadow.camera.top = 35;
sun.shadow.camera.bottom = -35;
scene.add(sun);

// MATERIALS
function mat(color, roughness = 1) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0
  });
}

const grassMat = mat(0x668d45);
const soilMat = mat(0x795033);
const woodMat = mat(0x79502e);
const leafMat = mat(0x356b36);
const lightLeaf = mat(0x638f42);
const whiteMat = mat(0xe9e2ce);
const roofMat = mat(0x814533);

// PROCEDURAL TEXTURE
function makeTexture(base, spots, size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 1800; i++) {
    ctx.fillStyle = spots[
      Math.floor(Math.random() * spots.length)
    ];

    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 3 + 0.5;

    ctx.globalAlpha = Math.random() * 0.45;
    ctx.fillRect(x, y, r, r);
  }

  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const grassTexture = makeTexture("#638b46", [
  "#769d53", "#4f773b", "#91a85c", "#567f3e"
]);

grassTexture.repeat.set(20, 20);

const soilTexture = makeTexture("#795032", [
  "#986a43", "#60402c", "#ad8050"
]);

soilTexture.repeat.set(2, 2);

const grassGround = new THREE.MeshStandardMaterial({
  map: grassTexture,
  roughness: 1
});

const soilGround = new THREE.MeshStandardMaterial({
  map: soilTexture,
  roughness: 1
});

// GROUND
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  grassGround
);

ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.12;
ground.receiveShadow = true;
scene.add(ground);

// OBJECT BUILDER
function box(x, y, z, sx, sy, sz, material, parent = scene) {
  const obj = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz),
    material
  );

  obj.position.set(x, y, z);
  obj.castShadow = true;
  obj.receiveShadow = true;
  parent.add(obj);

  return obj;
}

// FARM ROAD
const road = new THREE.Mesh(
  new THREE.PlaneGeometry(5, 70),
  soilGround
);

road.rotation.x = -Math.PI / 2;
road.position.set(0, -0.07, 0);
road.receiveShadow = true;
scene.add(road);

// FARMHOUSE
const house = new THREE.Group();

box(-7, 1.35, -8, 6, 2.7, 5, mat(0xc9ad82), house);

// ROOF
const roof = new THREE.Mesh(
  new THREE.ConeGeometry(4.5, 2.1, 4),
  roofMat
);

roof.rotation.y = Math.PI / 4;
roof.position.set(-7, 3.65, -8);
roof.scale.set(1, 0.8, 0.8);
roof.castShadow = true;
house.add(roof);

// DOOR
box(-7, 0.85, -5.45, 1.1, 1.7, 0.12, woodMat, house);

// WINDOWS
box(-9.1, 1.8, -5.43, 0.85, 0.8, 0.1,
  mat(0x77b6d0), house);

box(-4.9, 1.8, -5.43, 0.85, 0.8, 0.1,
  mat(0x77b6d0), house);

scene.add(house);

// TREE BUILDER
const trees = [];

function tree(x, z, scale = 1) {
  const group = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.18 * scale,
      0.28 * scale,
      2.5 * scale,
      7
    ),
    woodMat
  );

  trunk.position.y = 1.25 * scale;
  trunk.castShadow = true;
  group.add(trunk);

  for (let i = 0; i < 4; i++) {
    const crown = new THREE.Mesh(
      new THREE.SphereGeometry(
        (0.9 + Math.random() * 0.3) * scale,
        9, 7
      ),
      i % 2 ? leafMat : lightLeaf
    );

    crown.position.set(
      (Math.random() - 0.5) * scale,
      (2.3 + Math.random() * 0.8) * scale,
      (Math.random() - 0.5) * scale
    );

    crown.scale.y = 0.85;
    crown.castShadow = true;
    group.add(crown);
  }

  group.position.set(x, 0, z);
  scene.add(group);
  trees.push(group);
}

// BACKGROUND TREES
for (let i = 0; i < 55; i++) {
  const x = (Math.random() - 0.5) * 85;
  const z = (Math.random() - 0.5) * 85;

  if (Math.abs(x) < 12 && Math.abs(z) < 15) continue;

  tree(x, z, 0.8 + Math.random() * 0.7);
}

// COCONUT PALM
function palm(x, z) {
  const group = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.3, 5, 8),
    woodMat
  );

  trunk.position.y = 2.5;
  trunk.castShadow = true;
  group.add(trunk);

  for (let i = 0; i < 7; i++) {
    const angle = i * Math.PI * 2 / 7;

    const leaf = new THREE.Mesh(
      new THREE.ConeGeometry(0.35, 3.8, 5),
      leafMat
    );

    leaf.rotation.z = -Math.PI / 2.7;
    leaf.rotation.y = angle;
    leaf.position.set(
      Math.cos(angle) * 1.3,
      4.8,
      Math.sin(angle) * 1.3
    );

    leaf.castShadow = true;
    group.add(leaf);
  }

  group.position.set(x, 0, z);
  scene.add(group);
}

palm(-16, -8);
palm(17, -13);
palm(-17, 15);

// FENCE
for (let i = 0; i < 9; i++) {
  const z = -12 + i * 1.5;

  box(11, 0.6, z, 0.12, 1.1, 0.12, woodMat);
  box(15, 0.6, z, 0.12, 1.1, 0.12, woodMat);
}

box(13, 0.8, -9, 4, 0.12, 0.12, woodMat);
box(13, 0.4, -9, 4, 0.12, 0.12, woodMat);

// FARM PLOTS
const plots = [];

for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    const x = 5 + j * 2.3;
    const z = 3 + i * 2.3;

    const soil = new THREE.Mesh(
      new THREE.PlaneGeometry(1.9, 1.9),
      soilGround
    );

    soil.rotation.x = -Math.PI / 2;
    soil.position.set(x, 0.005, z);
    soil.receiveShadow = true;
    scene.add(soil);

    plots.push({
      x, z,
      planted: false,
      crop: null
    });
  }
}

// CROPS
function createCrop(x, z) {
  const group = new THREE.Group();

  for (let i = 0; i < 3; i++) {
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.035, 0.65, 5),
      mat(0x39843b)
    );

    stem.position.set(
      (i - 1) * 0.17, 0.32, 0
    );

    group.add(stem);

    const leaf = new THREE.Mesh(
      new THREE.ConeGeometry(0.13, 0.5, 5),
      lightLeaf
    );

    leaf.position.set(
      (i - 1) * 0.17, 0.5, 0.1
    );

    leaf.rotation.z = -0.5;
    group.add(leaf);
  }

  group.position.set(x, 0, z);
  scene.add(group);

  return group;
}

// ANIMAL BUILDER
function makeGoat(x, z) {
  const goat = new THREE.Group();
  const coat = mat(0xd9d0b9);

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.7, 0.5),
    coat
  );

  body.position.y = 0.9;
  goat.add(body);

  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.55, 0.4),
    coat
  );

  head.position.set(0, 1.25, -0.52);
  goat.add(head);

  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 8, 6),
    mat(0xb88c7a)
  );

  nose.position.set(0, 1.1, -0.77);
  goat.add(nose);

  for (const side of [-1, 1]) {
    const horn = new THREE.Mesh(
      new THREE.ConeGeometry(0.07, 0.4, 6),
      mat(0x76583c)
    );

    horn.position.set(side * 0.15, 1.65, -0.48);
    horn.rotation.z = side * 0.3;
    goat.add(horn);
  }

  for (const side of [-0.35, 0.35]) {
    for (const front of [-0.32, 0.32]) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.06, 0.65, 6),
        mat(0x5b493b)
      );

      leg.position.set(side, 0.35, front);
      goat.add(leg);
    }
  }

  goat.position.set(x, 0, z);
  scene.add(goat);

  return goat;
}

function makeChicken(x, z) {
  const chicken = new THREE.Group();
  const feather = mat(0xf2eee2);

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 10, 8),
    feather
  );

  body.scale.set(1.2, 0.9, 1);
  body.position.y = 0.55;
  chicken.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 8, 7),
    feather
  );

  head.position.set(0, 0.95, -0.27);
  chicken.add(head);

  const comb = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 6, 5),
    mat(0xc83e34)
  );

  comb.position.set(0, 1.15, -0.27);
  chicken.add(comb);

  const beak = new THREE.Mesh(
    new THREE.ConeGeometry(0.09, 0.22, 5),
    mat(0xd99b35)
  );

  beak.rotation.x = -Math.PI / 2;
  beak.position.set(0, 0.92, -0.48);
  chicken.add(beak);

  for (const side of [-0.18, 0.18]) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.28, 5),
      mat(0xd99b35)
    );

    leg.position.set(side, 0.14, 0);
    chicken.add(leg);
  }

  chicken.position.set(x, 0, z);
  scene.add(chicken);

  return chicken;
}

const goat = makeGoat(13, -5);
const chicken1 = makeChicken(12, -6);
const chicken2 = makeChicken(14, -7);

// PLAYER
const player = new THREE.Group();

const shirt = mat(0x356d9b);
const pants = mat(0x303d49);
const skin = mat(0xd8a27d);

const torso = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.32, 0.65, 4, 7),
  shirt
);

torso.position.y = 1.25;
torso.castShadow = true;
player.add(torso);

const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.27, 10, 8),
  skin
);

head.position.y = 2.05;
player.add(head);

const hat = new THREE.Mesh(
  new THREE.CylinderGeometry(0.37, 0.4, 0.12, 10),
  mat(0xb48b48)
);

hat.position.y = 2.32;
player.add(hat);

const legs = [];
const arms = [];

for (const side of [-1, 1]) {
  const leg = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.11, 0.48, 3, 6),
    pants
  );

  leg.position.set(side * 0.16, 0.48, 0);
  player.add(leg);
  legs.push(leg);

  const arm = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.085, 0.45, 3, 6),
    shirt
  );

  arm.position.set(side * 0.4, 1.35, 0);
  arm.rotation.z = side * -0.25;
  player.add(arm);
  arms.push(arm);
}

player.position.set(0, 0, 7);
scene.add(player);

// CAMERA
camera.position.set(0, 7, 18);
camera.lookAt(player.position);

// GAME DATA
let money = 500;
let xp = 0;
let level = 1;

function updateUI() {
  document.getElementById("money").textContent = money;
  document.getElementById("xp").textContent = xp;
  document.getElementById("level").textContent = level;
}

function message(text) {
  document.getElementById("message").textContent = text;
}

// MOVEMENT
const keys = {};

document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

document.querySelectorAll("[data-dir]").forEach(button => {
  const dir = button.dataset.dir;

  button.addEventListener("pointerdown", e => {
    e.preventDefault();
    keys[dir] = true;
    button.setPointerCapture(e.pointerId);
  });

  const release = () => keys[dir] = false;

  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
});

// FIND NEAREST PLOT
function nearestPlot() {
  let nearest = null;
  let distance = Infinity;

  for (const plot of plots) {
    const d = Math.hypot(
      player.position.x - plot.x,
      player.position.z - plot.z
    );

    if (d < distance) {
      distance = d;
      nearest = plot;
    }
  }

  return { nearest, distance };
}

// PLANT
document.getElementById("plantBtn").onclick = () => {
  const { nearest, distance } = nearestPlot();

  if (distance > 2.8) {
    message("Dekati lahan kebun!");
    return;
  }

  if (nearest.planted) {
    message("Lahan sudah ditanami!");
    return;
  }

  if (money < 20) {
    message("Uang tidak cukup!");
    return;
  }

  money -= 20;
  nearest.planted = true;
  nearest.crop = createCrop(nearest.x, nearest.z);

  updateUI();
  message("Benih berhasil ditanam! 🌱");
};

// HARVEST
document.getElementById("harvestBtn").onclick = () => {
  const { nearest, distance } = nearestPlot();

  if (!nearest || distance > 2.8 || !nearest.planted) {
    message("Dekati tanaman yang sudah ditanam!");
    return;
  }

  scene.remove(nearest.crop);
  nearest.crop = null;
  nearest.planted = false;

  money += 100;
  xp += 20;

  if (xp >= level * 100) {
    level++;
    xp = 0;
    message("Selamat! Naik level! ⭐");
  } else {
    message("Panen berhasil! +100 koin");
  }

  updateUI();
};

// FEED ANIMALS
document.getElementById("feedBtn").onclick = () => {
  const distance = Math.hypot(
    player.position.x - goat.position.x,
    player.position.z - goat.position.z
  );

  if (distance > 3) {
    message("Dekati kambing atau ayam!");
    return;
  }

  if (money < 10) {
    message("Uang tidak cukup membeli pakan!");
    return;
  }

  money -= 10;
  xp += 5;
  updateUI();
  message("Hewan sudah diberi makan! 🥕");
};

// ANIMATION
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  let dx = 0;
  let dz = 0;

  if (keys.up || keys.w || keys.arrowup) dz -= 1;
  if (keys.down || keys.s || keys.arrowdown) dz += 1;
  if (keys.left || keys.a || keys.arrowleft) dx -= 1;
  if (keys.right || keys.d || keys.arrowright) dx += 1;

  const moving = dx !== 0 || dz !== 0;

  if (moving) {
    const len = Math.hypot(dx, dz);
    dx /= len;
    dz /= len;

    player.position.x += dx * 4 * delta;
    player.position.z += dz * 4 * delta;

    player.rotation.y = Math.atan2(dx, dz);

    legs[0].rotation.x = Math.sin(t * 9) * 0.7;
    legs[1].rotation.x = -Math.sin(t * 9) * 0.7;
    arms[0].rotation.x = -Math.sin(t * 9) * 0.5;
    arms[1].rotation.x = Math.sin(t * 9) * 0.5;
  } else {
    legs.forEach(l => l.rotation.x = 0);
    arms.forEach(a => a.rotation.x = 0);
  }

  player.position.x = THREE.MathUtils.clamp(
    player.position.x, -35, 35
  );

  player.position.z = THREE.MathUtils.clamp(
    player.position.z, -35, 35
  );

  // ANIMAL IDLE ANIMATION
  goat.rotation.y = Math.sin(t * 0.8) * 0.12;
  chicken1.position.x = 12 + Math.sin(t * 1.2) * 0.2;
  chicken2.position.z = -7 + Math.cos(t * 1.1) * 0.2;

  // CAMERA FOLLOW
  const target = new THREE.Vector3(
    player.position.x,
    player.position.y + 7,
    player.position.z + 11
  );

  camera.position.lerp(target, 0.07);

  camera.lookAt(
    player.position.x,
    player.position.y + 1,
    player.position.z
  );

  renderer.render(scene, camera);
}

// RESIZE
window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

updateUI();
loading.style.display = "none";
animate();

} catch (error) {
  console.error(error);
  loading.textContent = "Gagal memuat: " + error.message;
}
