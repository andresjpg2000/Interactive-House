import * as THREE from "three"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

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

  // Animation loop
  function animate() {
    requestAnimationFrame(animate)

    controls.update()

    renderer.render(scene, camera)
  }

  animate()
}
