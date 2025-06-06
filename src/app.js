import * as THREE from "three"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

const toggleables = {}

const VIRTUAL_HOUR_MS = 10000 // 10 seconds = 1 virtual hour (adjust as needed)
let lastUpdate = Date.now()

const consumptionValues = {
  tv: 5, // kWh per toggle
  light1: 1,
  light2: 1,
  light3: 1,
  light4: 1,
  fridge: 20,
}

export function initScene() {
  const canvas = document.createElement("canvas")
  document.body.appendChild(canvas)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x222222)

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )

  const renderer = new THREE.WebGLRenderer({ canvas })
  renderer.setSize(window.innerWidth, window.innerHeight)

  // Setup OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement)

  // Lights
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.25)
  scene.add(hemisphereLight)

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.25)
  dirLight.position.set(5, 10, 7.5)
  scene.add(dirLight)

  // Load and scale house
  const loader = new OBJLoader()
  loader.load(
    "/models/house.obj",
    (object) => {
      const scale = 0.01
      object.scale.set(scale, scale, scale)

      const box = new THREE.Box3().setFromObject(object)
      const size = new THREE.Vector3()
      const center = new THREE.Vector3()
      box.getSize(size)
      box.getCenter(center)

      object.position.sub(center)
      scene.add(object)

      camera.position.set(0, 0, 15)

      controls.target.set(0, 0, 0)
      controls.update()

      console.log("House material:", object.children[0]?.material);
    },
    undefined,
    (err) => console.error("OBJ load error", err)
  )

  // Add rectangle wall
  const wallMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    emissive: 0x000000,
    specular: 0x111111,
    shininess: 30,
    reflectivity: 1,
    refractionRatio: 0.98
  });
  wallMaterial.userData.envMapRotation = [0, 0, 0, "XYZ"];
  wallMaterial.userData.blendColor = 0;
  const wallGeometry = new THREE.BoxGeometry(4.1, 2.5, 0.1)
  const wall = new THREE.Mesh(wallGeometry, wallMaterial)
  wall.position.set(0, -1.2, -4.16)
  scene.add(wall)

  // Add ceiling
  const cellGeometry = new THREE.BoxGeometry(15, 9, 0.2)
  const cell = new THREE.Mesh(cellGeometry, wallMaterial)
  cell.position.set(0, 0.3, 0)
  cell.rotation.x = Math.PI / 2
  scene.add(cell)

  const groundGeo = new THREE.PlaneGeometry(500, 500);
  const groundMat = new THREE.MeshStandardMaterial( { color: 0x888888 });
  groundMat.map = new THREE.TextureLoader().load('models/ground_texture.jpg');
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2.5; // Adjust based on your house position
  scene.add(ground);

  // Add skybox
  const skyboxLoader = new THREE.CubeTextureLoader()
  const skyboxTexture = skyboxLoader.load([
    "models/skybox/px.png",
    "models/skybox/nx.png",
    "models/skybox/py.png",
    "models/skybox/ny.png",
    "models/skybox/pz.png",
    "models/skybox/nz.png",
  ])
  scene.background = skyboxTexture

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  document.getElementById("toggle-lights")?.addEventListener("click", () => {
    const visible = dirLight.visible
    dirLight.visible = !visible
    hemisphereLight.visible = !visible
  })

  // Load static furniture models
  loadGLBModel(
    scene,
    "models/furniture/electricity_meter.glb",
    { x: 2.1, y: -1, z: 4 },
    0.25,
  )
  loadGLBModel(
    scene,
    "models/furniture/tv_stand.glb",
    { x: -3.75, y: -2.25, z: 2.6 },
    1,
    { x: 0, y: Math.PI / 2, z: 0 }
  )
  loadGLBModel(
    scene,
    "models/furniture/sofa.glb",
    { x: -1.5, y: -2.25, z: 2.6 },
    0.025,
    { x: 0, y: 0, z: 0 }
  )
  loadGLBModel(
    scene,
    "models/furniture/bed_06.glb",
    { x: -5.5, y: -2, z: 3 },
    4.5,
    { x: 0, y: Math.PI / 2, z: 0 }
  )
  loadGLBModel(
    scene,
    "models/furniture/bed_06.glb",
    { x: 5.25, y: -2, z: 1.75 },
    4.5,
    { x: 0, y: -Math.PI / 2, z: 0 }
  )
  loadGLBModel(
    scene,
    "models/furniture/cat_puppet.glb",
    { x: -0.75, y: -2.25, z: 2.6 },
    8,
    { x: 0, y: 0, z: 0 }
  )

  // Load toggleable furniture models
  loadGLBModel(
    scene,
    "models/furniture/tv_screen.glb",
    { x: -3.75, y: -1.25, z: 2.6 },
    0.025,
    { x: 0, y: Math.PI / 2, z: 0 },
    "tv"
  )

  loadGLBModel(
    scene,
    "models/furniture/worn_ceiling_light.glb",
    { x: 0, y: 0.19, z: -.5 },
    0.5,
    { x: 0, y: 0, z: 0 },
    "light1"
  )
  loadGLBModel(
    scene,
    "models/furniture/worn_ceiling_light.glb",
    { x: 0, y: 0.19, z: 2.5 },
    0.5,
    { x: 0, y: 0, z: 0 },
    "light2"
  )
  loadGLBModel(
    scene,
    "models/furniture/worn_ceiling_light.glb",
    { x: -6, y: 0.19, z: 2.25 },
    0.5,
    { x: 0, y: 0, z: 0 },
    "light3"
  )
  loadGLBModel(
    scene,
    "models/furniture/worn_ceiling_light.glb",
    { x: 6, y: 0.19, z: 2.25 },
    0.5,
    { x: 0, y: 0, z: 0 },
    "light4"
  )
  loadGLBModel(
    scene,
    "models/furniture/fridge.glb",
    { x: 0.48, y: -2.25, z: -3.75 },
    0.011,
    { x: 0, y: 0, z: 0 },
    "fridge"
  )
  loadGLBModel(
    scene,
    "models/furniture/basic_kitchen_cabinets_and_counter.glb",
    { x: -0.2, y: -2.25, z: -1.45 },
    0.026,
    { x: 0, y: Math.PI / 2, z: 0 }
  )
  loadGLBModel(
    scene,
    "models/furniture/solar_panel.glb",
    { x: -2.25, y: 2.25, z: 0.25 },
    0.02,
    { x: 0, y: 0, z: 0 }
  )
  loadGLBModel(
    scene,
    "models/furniture/solar_panel.glb",
    { x: -3.25, y: 2.25, z: 0.25 },
    0.02,
    { x: 0, y: 0, z: 0 }
  )
  loadGLBModel(
    scene,
    "models/furniture/solar_panel.glb",
    { x: -4.25, y: 2.25, z: 0.25 },
    0.02,
    { x: 0, y: 0, z: 0 }
  )
  loadGLBModel(
    scene,
    "models/furniture/solar_panel.glb",
    { x: -5.25, y: 2.25, z: 0.25 },
    0.02,
    { x: 0, y: 0, z: 0 }
  )

  // Animation loop
  function animate() {
    requestAnimationFrame(animate)

    controls.update()

    renderer.render(scene, camera)
  }

  animate()
}

function loadGLBModel(
  scene,
  path,
  position = { x: 0, y: 0, z: 0 },
  scale = 0.01,
  rotation = { x: 0, y: 0, z: 0 },
  id = null
) {
  const gltfLoader = new GLTFLoader()

  gltfLoader.load(
    path,
    (gltf) => {
      const model = gltf.scene

      model.scale.set(scale, scale, scale)

      // Center model if needed
      const box = new THREE.Box3().setFromObject(model)
      const center = new THREE.Vector3()
      box.getCenter(center)
      model.position.sub(center)
      model.position.set(position.x, position.y, position.z)
      model.rotation.set(rotation.x, rotation.y, rotation.z)

      scene.add(model)

      if (id) {
        toggleables[id] = {
          object: model,
          light: createGreenLight(model),
          on: false,
        }
        scene.add(toggleables[id].light)

        const container = document.getElementById("furniture-buttons")
        const btn = document.createElement("button")
        btn.innerText = `Toggle ${id}`
        btn.addEventListener("click", async () => {
          const t = toggleables[id]
          t.on = !t.on
          // t.object.visible = t.on
          t.light.visible = t.on
        })
        container.appendChild(btn)
      }
    },
    undefined,
    (error) => {
      console.error(`Failed to load ${path}`, error)
    }
  )
}

function createGreenLight(target) {
  const light = new THREE.PointLight(0x00ff00, 20, 5)
  light.position.copy(target.position)
  light.visible = false
  return light
}

// timeSinceLastUpdate should be in hours because production values are in kWh per hour
function updateConsumption() {
  updateProduction()

  let delta = 0
  const currentTime = Date.now()
  for (const id in toggleables) {
    if (toggleables[id].on) {
      const timeSinceLastUpdate = (currentTime - lastUpdate) / 1000
      const consumptionRate = consumptionValues[id] || 0
      delta += consumptionRate * timeSinceLastUpdate
    }
  }
  lastUpdate = currentTime
  postConsumption(parseFloat(delta.toFixed(3)))
}

function updateProduction() {
  const now = new Date().toISOString()
  const productionValues = {
    27: Math.random() + 1, // kWh per hour
    32: Math.random() + 1,
    33: Math.random() + 1,
    34: Math.random() + 1,
  }

  let delta = 0
  const currentTime = Date.now()

  for (const id in productionValues) {
    const timeSinceLastUpdate = (currentTime - lastUpdate) / 1000
    delta += productionValues[id] * timeSinceLastUpdate
    postProduction({
      id_equipment: id,
      value: delta,
      date: now,
    })
  }
}

let token = null

async function login() {
  try {
    const response = await fetch(`http://localhost:3000/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "greengridesmad@gmail.com",
        password: "passteste",
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Error processing login")
    }
    token = data.accessToken
  } catch (error) {
    console.log(error)
  } finally {
  }
}

async function postProduction(value) {
  await fetch("http://localhost:3000/energy-productions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
      "Accept-Encoding": "gzip, deflate, br",
    },
    body: JSON.stringify(value),
  })
}

async function postConsumption(value) {
  const now = new Date().toISOString()

  try {
    const response = await fetch("http://localhost:3000/energy-consumptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        value,
        date: now,
        id_housing: 28,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("Erro ao registar consumo:", error.message)
    } else {
      const data = await response.json()
      console.log("Consumo registado com sucesso:", data)
    }
  } catch (err) {
    console.error("Erro na requisição de consumo:", err)
  }
}

// Initial login to get token
login().then(() => {
  console.log("Logged in successfully, token:", token)

  // Start consumption updates
  setInterval(updateConsumption, VIRTUAL_HOUR_MS)
})
