import * as THREE from "three"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

const toggleables = {}

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
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1)
  scene.add(hemisphereLight)

  const dirLight = new THREE.DirectionalLight(0xffffff, 1)
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
    },
    undefined,
    (err) => console.error("OBJ load error", err)
  )

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
    "models/furniture/alternating_current_electricity_meter.glb",
    { x: 1.5, y: 0.75, z: 4 },
    0.005
  )
  // loadGLBModel(scene, "models/furniture/soler_panel.setup.glb", { x: -1.5, y: 2.5, z: -2 }, 0.01);
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
    { x: 0, y: 1.75, z: 0 },
    0.75,
    { x: 0, y: 0, z: 0 },
    "light1"
  )
  loadGLBModel(
    scene,
    "models/furniture/worn_ceiling_light.glb",
    { x: -6, y: 0.75, z: 2.25 },
    0.5,
    { x: 0, y: 0, z: 0 },
    "light2"
  )
  loadGLBModel(
    scene,
    "models/furniture/worn_ceiling_light.glb",
    { x: 6, y: 0.75, z: 2.25 },
    0.5,
    { x: 0, y: 0, z: 0 },
    "light3"
  )
  loadGLBModel(
    scene,
    "models/furniture/fridge.glb",
    { x: -2.25, y: -2.25, z: -1 },
    0.01,
    { x: 0, y: Math.PI / 2, z: 0 },
    "fridge"
  )

  function setupToggleButtons() {
    const container = document.getElementById("furniture-buttons")
    for (const id in toggleables) {
      const btn = document.createElement("button")
      btn.innerText = `Toggle ${id}`
      btn.addEventListener("click", () => {
        const t = toggleables[id]
        t.on = !t.on
        t.object.visible = t.on
        t.light.visible = t.on
      })
      container.appendChild(btn)
    }
  }

  // setupToggleButtons()

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
  console.log(`Loading model from ${path}...`)
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
        btn.addEventListener("click", () => {
          const t = toggleables[id]
          t.on = !t.on
          t.object.visible = t.on
          t.light.visible = t.on
        })
        container.appendChild(btn)
      }

      console.log("House OBJ model loaded", model)
    },
    undefined,
    (error) => {
      console.error(`Failed to load ${path}`, error)
    }
  )
}

function createGreenLight(target) {
  const light = new THREE.PointLight(0x00ff00, 1, 5)
  light.position.copy(target.position)
  light.visible = false
  return light
}
