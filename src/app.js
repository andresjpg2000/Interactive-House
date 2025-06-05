import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader"

export function initScene() {
  const canvas = document.createElement("canvas")
  document.body.appendChild(canvas)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  const renderer = new THREE.WebGLRenderer({ canvas })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x222222)
  camera.position.set(0, 1, 5)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1)
  scene.add(hemiLight)

  const dirLight = new THREE.DirectionalLight(0xffffff, 1)
  dirLight.position.set(5, 10, 7.5)
  scene.add(dirLight)

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  const loader = new OBJLoader()
  loader.load(
    "/models/house.obj",
    (object) => {
      console.log("OBJ loaded", object)
      object.scale.set(1, 1, 1)
      scene.add(object)
    },
    undefined,
    (error) => {
      console.error("Failed to load OBJ:", error)
    }
  )

  function animate() {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }

  animate()
}
