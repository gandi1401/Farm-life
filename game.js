
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

// ===============================
// FARM LIFE INDONESIA
// Versi 1.1 - Perbaikan loading
// ===============================

const loading = document.getElementById("loading");

try {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x87ceeb, 35, 100);

  const camera = new THREE.PerspectiveCamera(
    65, window.innerWidth / window.innerHeight, 0.1, 150
  );

  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    powerPreference: "low-power"
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
  document.getElementById("game").prepend(renderer.domElement);

  // CAHAYA
  scene.add(new THREE.HemisphereLight(0xffffff, 0x557744, 2));

  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(10, 20, 10);
  scene.add(sun);

  // MATERIAL
  function mat(color) {
    return new THREE.MeshLambertMaterial({ color });
  }

  const green = mat(0x62a844);
  const darkGreen = mat(0x34743a);
  const brown = mat(0x79502e);
  const wood = mat(0x9c6639);

  // OBJEK KOTAK
  function cube(x, y, z, sx, sy, sz, material) {
    const object = new THREE.Mesh(
      new THREE.BoxGeometry(sx, sy, sz),
      material
    );
    object.position.set(x, y, z);
    scene.add(object);
    return object;
  }

  // TANAH DAN JALAN
  cube(0, -0.35, 0, 100, 0.5, 100, green);
  cube(0, -0.08, 3, 5, 0.08, 60, mat(0xc9a16b));

  // RUMAH
  cube(-7, 1.1, -8, 6, 2.2, 5, mat(0xe8d1a5));
  cube(-7, 2.7, -8, 6.5, 1.5, 5.5, mat(0x9c4332));
  cube(-7, 0.8, -5.45, 1.1, 1.6, 0.15, wood);
  cube(-5, 1.1, -5.35, 1, 0.8, 0.15, mat(0x82c6dc));

  // POHON
  function tree(x, z, scale = 1) {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.2 * scale, 0.3 * scale, 2 * scale, 6
      ),
      brown
    );
    trunk.position.set(x, scale, z);
    scene.add(trunk);

    const leaves = new THREE.Mesh(
      new THREE.SphereGeometry(1.3 * scale, 7, 6),
      darkGreen
    );
    leaves.position.set(x, 2.4 * scale, z);
    scene.add(leaves);
  }

  for (let i = 0; i < 24; i++) {
    const x = (Math.random() - 0.5) * 48;
    const z = (Math.random() - 0.5) * 48;

    if (Math.abs(x) < 12 && Math.abs(z) < 14) continue;
    tree(x, z, 0.8 + Math.random() * 0.6);
  }

  // KANDANG
  cube(8, 0.8, -8, 6, 1.6, 5, wood);
  cube(8, 1.8, -8, 6.5, 0.4, 5.5, mat(0x6b3925));

  // LAHAN KEBUN
  const plots = [];

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const x = 5 + j * 2.5;
      const z = 3 + i * 2.5;

      cube(x, -0.02, z, 2, 0.12, 2, brown);

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
    new THREE.BoxGeometry(0.8, 1, 0.5),
    mat(0x2584ce)
  );
  body.position.y = 1.2;
  player.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 10, 8),
    mat(0xf0c39b)
  );
  head.position.y = 2;
  player.add(head);

  const hat = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 0.12, 10),
    mat(0xd5a54c)
  );
  hat.position.y = 2.38;
  player.add(hat);

  const legs = [];

  for (const side of [-0.22, 0.22]) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.23, 0.6, 0.25),
      mat(0x303b53)
    );
    leg.position.set(side, 0.4, 0);
    player.add(leg);
    legs.push(leg);
  }

  player.position.set(0, 0, 7);
  scene.add(player);

  camera.position.set(0, 8, 19);
  camera.lookAt(player.position);

  // STATUS PERMAINAN
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

  // MENCARI LAHAN TERDEKAT
  function nearestPlot() {
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

    return { nearest, distance };
  }

  // TANAM
  document.getElementById("plantBtn").onclick = () => {
    const { nearest, distance } = nearestPlot();

    if (distance > 2.8) {
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
      new THREE.ConeGeometry(0.35, 1, 5),
      mat(0x238b35)
    );

    crop.position.set(nearest.x, 0.5, nearest.z);
    scene.add(crop);
    nearest.crop = crop;

    updateUI();
    message("Berhasil menanam! 🌱");
  };

  // PANEN
  document.getElementById("harvestBtn").onclick = () => {
    const { nearest, distance } = nearestPlot();

    if (!nearest || distance > 2.8 || !nearest.planted) {
      message("Tidak ada tanaman untuk dipanen!");
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

  // ANIMASI
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

    const moving = dx !== 0 || dz !== 0;

    if (moving) {
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

    player.position.x = THREE.MathUtils.clamp(
      player.position.x, -35, 35
    );

    player.position.z = THREE.MathUtils.clamp(
      player.position.z, -35, 35
    );

    const target = new THREE.Vector3(
      player.position.x,
      player.position.y + 8,
      player.position.z + 12
    );

    camera.position.lerp(target, 0.08);
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
  animate();

  // SEMBUNYIKAN LOADING
  loading.style.display = "none";

} catch (error) {
  console.error(error);
  loading.textContent = "Game gagal dimuat: " + error.message;
}
