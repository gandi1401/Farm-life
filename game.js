
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/GLTFLoader.js";

// FARM LIFE INDONESIA 3.0
const game = document.getElementById("game");
const loading = document.getElementById("loading");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bd8f2);
scene.fog = new THREE.Fog(0x9bd8f2, 55, 130);

const camera = new THREE.PerspectiveCamera(
  60, window.innerWidth / window.innerHeight, 0.1, 200
);

const renderer = new THREE.WebGLRenderer({
  antialias: false,
  powerPreference: "low-power"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.2));
renderer.shadowMap.enabled = false;
renderer.outputColorSpace = THREE.SRGBColorSpace;
game.prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x657b42, 2));

const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(20, 35, 15);
scene.add(sun);

const loader = new GLTFLoader();
const modelCache = {};

function material(color) {
  return new THREE.MeshLambertMaterial({ color });
}

function ground(x, y, z, sx, sy, sz, color) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz),
    material(color)
  );
  mesh.position.set(x, y, z);
  scene.add(mesh);
  return mesh;
}

// MEMUAT MODEL GLB
function loadModel(file, x, y, z, size, rotation = 0) {
  return new Promise((resolve) => {
    if (modelCache[file]) {
      const obj = modelCache[file].clone(true);
      placeModel(obj, x, y, z, size, rotation);
      resolve(obj);
      return;
    }

    loader.load(
      "models/" + file,
      (gltf) => {
        const original = gltf.scene;
        modelCache[file] = original;
        const obj = original.clone(true);
        placeModel(obj, x, y, z, size, rotation);
        resolve(obj);
      },
      undefined,
      (error) => {
        console.error("Gagal memuat model:", file, error);
        resolve(null);
      }
    );
  });
}

function placeModel(obj, x, y, z, size, rotation) {
  const box = new THREE.Box3().setFromObject(obj);
  const dimensions = new THREE.Vector3();
  box.getSize(dimensions);

  const maxDimension = Math.max(
    dimensions.x, dimensions.y, dimensions.z
  );

  if (maxDimension > 0) {
    obj.scale.setScalar(size / maxDimension);
  }

  obj.updateMatrixWorld(true);

  const newBox = new THREE.Box3().setFromObject(obj);
  obj.position.x = x - (newBox.min.x + newBox.max.x) / 2;
  obj.position.y = y - newBox.min.y;
  obj.position.z = z - (newBox.min.z + newBox.max.z) / 2;
  obj.rotation.y = rotation;

  scene.add(obj);
}

// LINGKUNGAN
ground(0, -0.4, 0, 110, 0.5, 110, 0x65a84a);
ground(0, -0.12, 5, 6, 0.08, 80, 0xb99a70);

// RUMAH, GUDANG DAN BANGUNAN
loadModel("red-gambrel-barn.glb", -10, 0, -12, 12);
loadModel("low-poly-grain-silo.glb", 1, 0, -16, 7);
loadModel("garden-greenhouse.glb", 12, 0, -13, 9);

// KENDARAAN
loadModel("farm-tractor-and-hay-trailer.glb", -12, 0, 5, 7, Math.PI);

// HEWAN
loadModel("chunky-low-poly-cow.glb", 8, 0, -9, 3);
loadModel("chunky-low-poly-cow.glb", 12, 0, -10, 3);
loadModel("chunky-cloud-sheep.glb", 17, 0, -8, 3);
loadModel("chunky-pig-with-apples.glb", 20, 0, -12, 3);

// KANDANG DAN KOLAM
loadModel("low-poly-chicken-coop.glb", 15, 0, 2, 6);
loadModel("low-poly-duck-pond.glb", 23, 0, 5, 7);
loadModel("low-poly-farm-birds.glb", 17, 0, 5, 3);

// PERLENGKAPAN
loadModel("farm-water-pump.glb", -3, 0, -5, 3);
loadModel("harvest-wheelbarrow.glb", -5, 0, 3, 3);
loadModel("low-poly-farm-tools.glb", -7, 0, 2, 3);
loadModel("farm-produce-crates.glb", 2, 0, 1, 3);
loadModel("low-poly-beehive-set.glb", 26, 0, -12, 4);

// PAGAR
loadModel("wooden-fence-kit.glb", 8, 0, -15, 10);

// POHON BUAH
const treePositions = [
  [-22, -15], [-25, -5], [-22, 8],
  [28, -17], [30, -5], [28, 12],
  [-20, 20], [24, 23]
];

for (const [x, z] of treePositions) {
  loadModel("low-poly-fruit-trees.glb", x, 0, z, 5);
}

// TAMAN DAN TANAMAN
loadModel("apple-tree-growth-stages.glb", -25, 0, 15, 4);
loadModel("sunflower-growth-stages.glb", -16, 0, 19, 4);

// LAHAN
const plots = [];
const soil = material(0x79502e);

for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    const x = 4 + j * 2.6;
    const z = 10 + i * 2.6;

    const plot = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.15, 2.2),
      soil
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

const body = new THREE.Mesh(
  new THREE.CylinderGeometry(0.28, 0.4, 0.9, 10),
  material(0x2877bc)
);
body.position.y = 1.1;
player.add(body);

const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.32, 12, 10),
  material(0xe8b58d)
);
head.position.y = 1.8;
player.add(head);

const hat = new THREE.Mesh(
  new THREE.CylinderGeometry(0.42, 0.42, 0.12, 12),
  material(0xd9a747)
);
hat.position.y = 2.13;
player.add(hat);

const legs = [];

for (const side of [-0.2, 0.2]) {
  const leg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.13, 0.6, 8),
    material(0x303b53)
  );
  leg.position.set(side, 0.35, 0);
  player.add(leg);
  legs.push(leg);
}

player.position.set(0, 0, 7);
scene.add(player);

// KAMERA
camera.position.set(0, 8, 17);
camera.lookAt(player.position);

// STATUS
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

// KONTROL
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

// TANAM
document.getElementById("plantBtn").onclick = async () => {
  let nearest = null;
  let distance = Infinity;

  plots.forEach(plot => {
    const d = Math.hypot(
      player.position.x - plot.x,
      player.position.z - plot.z
    );

    if (d < distance) {
      distance = d;
      nearest = plot;
    }
  });

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

  const crop = await loadModel(
    "carrot-growth-stages.glb",
    nearest.x, 0.05, nearest.z, 1.8
  );

  nearest.crop = crop;
  message("Berhasil menanam wortel! 🥕");
  updateUI();
};

// PANEN
document.getElementById("harvestBtn").onclick = () => {
  let nearest = null;
  let distance = Infinity;

  plots.forEach(plot => {
    if (!plot.planted) return;

    const d = Math.hypot(
      player.position.x - plot.x,
      player.position.z - plot.z
    );

    if (d < distance) {
      distance = d;
      nearest = plot;
    }
  });

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
    message("Selamat! Naik level! 🎉");
  } else {
    message("Panen berhasil! +100 koin 🌾");
  }

  updateUI();
};

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

  if (dx || dz) {
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

  player.position.x = THREE.MathUtils.clamp(player.position.x, -40, 40);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -40, 40);

  camera.position.lerp(
    new THREE.Vector3(
      player.position.x,
      player.position.y + 8,
      player.position.z + 13
    ),
    0.08
  );

  camera.lookAt(
    player.position.x,
    player.position.y + 0.8,
    player.position.z
  );

  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

updateUI();
loading.style.display = "none";
message("Selamat datang di Farm Life Indonesia 3.0!");
animate();
