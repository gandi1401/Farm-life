
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

// FARM LIFE INDONESIA 2.0
const game = document.getElementById("game");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x91d5f2);
scene.fog = new THREE.Fog(0x91d5f2, 35, 90);

const camera = new THREE.PerspectiveCamera(
  60, window.innerWidth / window.innerHeight, 0.1, 150
);

const renderer = new THREE.WebGLRenderer({
  antialias: false,
  powerPreference: "low-power"
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.3));
renderer.shadowMap.enabled = false;
renderer.domElement.style.position = "absolute";
renderer.domElement.style.inset = "0";
renderer.domElement.style.zIndex = "0";
game.prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x607744, 2));

const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(15, 25, 10);
scene.add(sun);

function mat(color) {
  return new THREE.MeshLambertMaterial({ color });
}

const grass = mat(0x58a843);
const darkGrass = mat(0x347a35);
const soil = mat(0x79502e);
const wood = mat(0x80502d);

function box(x, y, z, sx, sy, sz, material) {
  const obj = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz), material
  );
  obj.position.set(x, y, z);
  scene.add(obj);
  return obj;
}

function sphere(x, y, z, size, material) {
  const obj = new THREE.Mesh(
    new THREE.SphereGeometry(size, 8, 7), material
  );
  obj.position.set(x, y, z);
  scene.add(obj);
  return obj;
}

// TANAH DAN JALAN
box(0, -0.4, 0, 100, 0.5, 100, grass);
box(0, -0.1, 4, 5, 0.08, 65, mat(0xb99565));

// RUMAH PETANI
box(-8, 1, -9, 7, 2, 6, mat(0xe7c99a));
box(-8, 2.5, -9, 8, 1.2, 7, mat(0x9c4230));
box(-8, 0.8, -5.9, 1.2, 1.6, 0.15, wood);
box(-5.7, 1.2, -5.85, 1.2, 0.8, 0.15, mat(0x77c7e8));

// POHON
function tree(x, z, s = 1) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2*s, 0.35*s, 2*s, 7),
    wood
  );
  trunk.position.set(x, s, z);
  scene.add(trunk);

  sphere(x, 2.5*s, z, 1.4*s, darkGrass);
  sphere(x-0.6*s, 2.2*s, z+0.2*s, 0.9*s, mat(0x438d39));
  sphere(x+0.6*s, 2.3*s, z-0.2*s, 0.9*s, mat(0x4b983d));
}

for (let i = 0; i < 35; i++) {
  const x = (Math.random() - 0.5) * 65;
  const z = (Math.random() - 0.5) * 65;
  if (Math.abs(x) < 13 && Math.abs(z) < 15) continue;
  tree(x, z, 0.8 + Math.random() * 0.6);
}

// KANDANG
box(9, 0.8, -9, 7, 1.5, 6, wood);
box(9, 1.7, -9, 7.5, 0.35, 6.5, mat(0x57351f));

// KAMBING SEDERHANA
function goat(x, z) {
  const body = sphere(x, 0.9, z, 0.65, mat(0xf1eee2));
  body.scale.set(1.3, 0.8, 0.8);
  sphere(x+0.55, 1.1, z, 0.32, mat(0xf1eee2));
  for (const dx of [-0.35, 0.35]) {
    for (const dz of [-0.3, 0.3]) {
      box(x+dx, 0.35, z+dz, 0.12, 0.65, 0.12, wood);
    }
  }
}
goat(8, -7);
goat(10, -10);
goat(7, -11);

// AYAM
function chicken(x, z) {
  sphere(x, 0.45, z, 0.35, white);
  sphere(x+0.25, 0.65, z, 0.18, white);
  sphere(x+0.4, 0.7, z, 0.07, mat(0xffaa00));
  sphere(x+0.25, 0.85, z, 0.08, mat(0xd92e22));
}
const white = mat(0xffffff);
chicken(12, -6);
chicken(14, -9);
chicken(11, -12);

// KEBUN
const plots = [];
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    const x = 5 + j * 2.5;
    const z = 3 + i * 2.5;
    box(x, -0.02, z, 2.1, 0.12, 2.1, soil);
    plots.push({ x, z, planted: false, crop: null });
  }
}

// PEMAIN
const player = new THREE.Group();

const body = new THREE.Mesh(
  new THREE.BoxGeometry(0.8, 1, 0.5),
  mat(0x2584ce)
);
body.position.y = 1.1;
player.add(body);

const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.38, 10, 8),
  mat(0xf0c39b)
);
head.position.y = 1.9;
player.add(head);

const hat = new THREE.Mesh(
  new THREE.CylinderGeometry(0.5, 0.5, 0.13, 10),
  mat(0xd5a54c)
);
hat.position.y = 2.3;
player.add(hat);

const legs = [];
for (const side of [-0.22, 0.22]) {
  const leg = new THREE.Mesh(
    new THREE.BoxGeometry(0.23, 0.6, 0.25),
    mat(0x303b53)
  );
  leg.position.set(side, 0.35, 0);
  player.add(leg);
  legs.push(leg);
}

player.position.set(0, 0, 7);
scene.add(player);

// KAMERA
camera.position.set(0, 8, 16);
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
document.getElementById("plantBtn").onclick = () => {
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
    message("Dekati kebun terlebih dahulu!");
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

  const crop = new THREE.Mesh(
    new THREE.ConeGeometry(0.4, 1, 6),
    mat(0x238b35)
  );
  crop.position.set(nearest.x, 0.5, nearest.z);
  scene.add(crop);
  nearest.crop = crop;

  message("Berhasil menanam! 🌱");
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

  scene.remove(nearest.crop);
  nearest.crop = null;
  nearest.planted = false;

  money += 100;
  xp += 20;

  if (xp >= level * 100) {
    xp = 0;
    level++;
    message("Selamat! Naik level 🎉");
  } else {
    message("Panen berhasil! +100 koin 🌾");
  }
  updateUI();
};

// ANIMASI DAN GERAK
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

    legs[0].rotation.x = Math.sin(clock.elapsedTime * 10) * 0.5;
    legs[1].rotation.x = -Math.sin(clock.elapsedTime * 10) * 0.5;
  } else {
    legs.forEach(leg => leg.rotation.x = 0);
  }

  player.position.x = THREE.MathUtils.clamp(player.position.x, -35, 35);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -35, 35);

  camera.position.lerp(
    new THREE.Vector3(
      player.position.x,
      player.position.y + 8,
      player.position.z + 12
    ), 0.08
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
document.getElementById("loading").style.display = "none";
animate();
