
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/GLTFLoader.js";

// =====================================
// FARM LIFE INDONESIA 3.0
// =====================================

const $ = id => document.getElementById(id);
const game = $("game");
const loading = $("loading");
const loadingText = $("loadingText");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bd8f2);
scene.fog = new THREE.Fog(0x9bd8f2, 65, 150);

const camera = new THREE.PerspectiveCamera(
  60, window.innerWidth / window.innerHeight, 0.1, 250
);

const renderer = new THREE.WebGLRenderer({
  antialias: false,
  powerPreference: "low-power"
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = false;
game.appendChild(renderer.domElement);

// CAHAYA
scene.add(new THREE.HemisphereLight(0xffffff, 0x637d45, 2));

const sunlight = new THREE.DirectionalLight(0xffffff, 2);
sunlight.position.set(25, 40, 20);
scene.add(sunlight);

// LOADER GLB
const loader = new GLTFLoader();
const modelPromises = new Map();

function loadModel(file, x, y, z, size, rotation = 0) {
  let promise = modelPromises.get(file);

  if (!promise) {
    promise = new Promise((resolve, reject) => {
      loader.load(
        "./models/" + file,
        gltf => resolve(gltf.scene),
        undefined,
        error => reject(error)
      );
    });
    modelPromises.set(file, promise);
  }

  return promise.then(original => {
    const object = original.clone(true);

    const bounds = new THREE.Box3().setFromObject(object);
    const dimensions = new THREE.Vector3();
    bounds.getSize(dimensions);

    const largest = Math.max(
      dimensions.x, dimensions.y, dimensions.z
    );

    if (largest > 0) {
      object.scale.setScalar(size / largest);
    }

    object.updateMatrixWorld(true);

    const scaledBounds = new THREE.Box3().setFromObject(object);

    object.position.set(
      x - (scaledBounds.min.x + scaledBounds.max.x) / 2,
      y - scaledBounds.min.y,
      z - (scaledBounds.min.z + scaledBounds.max.z) / 2
    );

    object.rotation.y = rotation;
    scene.add(object);

    return object;
  }).catch(error => {
    console.error("Model gagal dimuat:", file, error);
    return null;
  });
}

// OBJEK DASAR
function makeBox(x, y, z, sx, sy, sz, color) {
  const object = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz),
    new THREE.MeshLambertMaterial({ color })
  );
  object.position.set(x, y, z);
  scene.add(object);
  return object;
}

// TANAH DAN JALAN
makeBox(0, -0.4, 0, 110, 0.5, 110, 0x65a84a);
makeBox(0, -0.12, 5, 6, 0.08, 80, 0xb99a70);

// LAHAN TANAM
const plots = [];
const soilMaterial = new THREE.MeshLambertMaterial({
  color: 0x79502e
});

for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 3; col++) {
    const x = 4 + col * 2.6;
    const z = 10 + row * 2.6;

    const plot = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.15, 2.2),
      soilMaterial
    );

    plot.position.set(x, -0.02, z);
    scene.add(plot);

    plots.push({
      x, z,
      planted: false,
      crop: null
    });
  }
}

// PEMAIN
const player = new THREE.Group();

const farmerBody = new THREE.Mesh(
  new THREE.CylinderGeometry(0.28, 0.4, 0.9, 10),
  new THREE.MeshLambertMaterial({ color: 0x2877bc })
);
farmerBody.position.y = 1.1;
player.add(farmerBody);

const farmerHead = new THREE.Mesh(
  new THREE.SphereGeometry(0.32, 12, 10),
  new THREE.MeshLambertMaterial({ color: 0xe8b58d })
);
farmerHead.position.y = 1.8;
player.add(farmerHead);

const farmerHat = new THREE.Mesh(
  new THREE.CylinderGeometry(0.42, 0.42, 0.12, 12),
  new THREE.MeshLambertMaterial({ color: 0xd9a747 })
);
farmerHat.position.y = 2.13;
player.add(farmerHat);

const legs = [];

for (const side of [-0.2, 0.2]) {
  const leg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.13, 0.6, 8),
    new THREE.MeshLambertMaterial({ color: 0x303b53 })
  );

  leg.position.set(side, 0.35, 0);
  player.add(leg);
  legs.push(leg);
}

player.position.set(0, 0, 7);
scene.add(player);

// KAMERA AWAL
camera.position.set(0, 8, 20);
camera.lookAt(player.position);

// STATUS PERMAINAN
let money = 500;
let xp = 0;
let level = 1;

function updateUI() {
  $("money").textContent = money;
  $("xp").textContent = xp;
  $("level").textContent = level;
}

function message(text) {
  $("message").textContent = text;
}

// MEMUAT MODEL DUNIA
async function buildFarm() {
  const models = [
    ["red-gambrel-barn.glb", -10, 0, -12, 12],
    ["low-poly-grain-silo.glb", 1, 0, -16, 7],
    ["garden-greenhouse.glb", 12, 0, -13, 9],
    ["farm-tractor-and-hay-trailer.glb", -12, 0, 5, 7, Math.PI],

    ["chunky-low-poly-cow.glb", 8, 0, -9, 3],
    ["chunky-low-poly-cow.glb", 12, 0, -10, 3],
    ["chunky-cloud-sheep.glb", 17, 0, -8, 3],
    ["chunky-pig-with-apples.glb", 20, 0, -12, 3],

    ["low-poly-chicken-coop.glb", 15, 0, 2, 6],
    ["low-poly-duck-pond.glb", 23, 0, 5, 7],
    ["low-poly-farm-birds.glb", 17, 0, 5, 3],

    ["farm-water-pump.glb", -3, 0, -5, 3],
    ["harvest-wheelbarrow.glb", -5, 0, 3, 3],
    ["low-poly-farm-tools.glb", -7, 0, 2, 3],
    ["farm-produce-crates.glb", 2, 0, 1, 3],
    ["low-poly-beehive-set.glb", 26, 0, -12, 4],

    ["wooden-fence-kit.glb", 8, 0, -15, 10],

    ["low-poly-fruit-trees.glb", -22, 0, -15, 5],
    ["low-poly-fruit-trees.glb", -25, 0, -5, 5],
    ["low-poly-fruit-trees.glb", -22, 0, 8, 5],
    ["low-poly-fruit-trees.glb", 28, 0, -17, 5],
    ["low-poly-fruit-trees.glb", 30, 0, -5, 5],
    ["low-poly-fruit-trees.glb", 28, 0, 12, 5],

    ["apple-tree-growth-stages.glb", -25, 0, 15, 4],
    ["sunflower-growth-stages.glb", -16, 0, 19, 4]
  ];

  let completed = 0;

  const tasks = models.map(async item => {
    await loadModel(...item);
    completed++;
    loadingText.textContent =
      "Memuat model pertanian " + completed + "/" + models.length;
  });

  await Promise.all(tasks);
}

// KONTROL KEYBOARD DAN HP
const keys = {};

document.addEventListener("keydown", event => {
  keys[event.key.toLowerCase()] = true;
});

document.addEventListener("keyup", event => {
  keys[event.key.toLowerCase()] = false;
});

document.querySelectorAll("[data-dir]").forEach(button => {
  const direction = button.dataset.dir;

  button.addEventListener("pointerdown", event => {
    event.preventDefault();
    keys[direction] = true;
    button.setPointerCapture(event.pointerId);
  });

  const release = () => {
    keys[direction] = false;
  };

  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
});

// TANAM WORTEL
$("plantBtn").addEventListener("click", async () => {
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

  if (distance > 3) {
    message("Dekati lahan terlebih dahulu!");
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
  updateUI();

  message("Sedang menanam wortel...");

  nearest.crop = await loadModel(
    "carrot-growth-stages.glb",
    nearest.x, 0.05, nearest.z, 1.8
  );

  message(
    nearest.crop
      ? "Wortel berhasil ditanam! 🥕"
      : "Model wortel gagal dimuat. Periksa file GLB."
  );
});

// PANEN
$("harvestBtn").addEventListener("click", () => {
  let nearest = null;
  let distance = Infinity;

  for (const plot of plots) {
    if (!plot.planted) continue;

    const d = Math.hypot(
      player.position.x - plot.x,
      player.position.z - plot.z
    );

    if (d < distance) {
      distance = d;
      nearest = plot;
    }
  }

  if (!nearest || distance > 3) {
    message("Dekati tanaman untuk panen!");
    return;
  }

  if (nearest.crop) {
    scene.remove(nearest.crop);
  }

  nearest.crop = null;
  nearest.planted = false;

  money += 100;
  xp += 20;

  if (xp >= level * 100) {
    xp = 0;
    level++;
    message("Selamat! Kamu naik level! 🎉");
  } else {
    message("Panen berhasil! +100 koin 🌾");
  }

  updateUI();
});

// GERAK DAN ANIMASI
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);

  let dx = 0;
  let dz = 0;

  if (keys.arrowup || keys.w || keys.up) dz -= 1;
  if (keys.arrowdown || keys.s || keys.down) dz += 1;
  if (keys.arrowleft || keys.a || keys.left) dx -= 1;
  if (keys.arrowright || keys.d || keys.right) dx += 1;

  if (dx !== 0 || dz !== 0) {
    const length = Math.hypot(dx, dz);
    dx /= length;
    dz /= length;

    player.position.x += dx * 5 * delta;
    player.position.z += dz * 5 * delta;

    player.rotation.y = Math.atan2(dx, dz);

    legs[0].rotation.x = Math.sin(clock.elapsedTime * 10) * 0.4;
    legs[1].rotation.x = -Math.sin(clock.elapsedTime * 10) * 0.4;
  } else {
    legs.forEach(leg => leg.rotation.x = 0);
  }

  player.position.x = THREE.MathUtils.clamp(
    player.position.x, -40, 40
  );
  player.position.z = THREE.MathUtils.clamp(
    player.position.z, -40, 40
  );

  const targetCamera = new THREE.Vector3(
    player.position.x,
    player.position.y + 8,
    player.position.z + 13
  );

  camera.position.lerp(targetCamera, 0.08);
  camera.lookAt(
    player.position.x,
    player.position.y + 0.8,
    player.position.z
  );

  renderer.render(scene, camera);
}

// UKURAN LAYAR
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// MULAI GAME
async function startGame() {
  updateUI();
  message("Sedang menyiapkan pertanian...");

  try {
    await buildFarm();
    loading.style.display = "none";
    message("Selamat datang di Farm Life Indonesia! 🌾");
    animate();
  } catch (error) {
    console.error("Kesalahan game:", error);
    loadingText.textContent =
      "Gagal memuat game. Periksa koneksi internet dan file model.";
  }
}

startGame();
