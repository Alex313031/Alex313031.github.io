import * as THREE from "three";
import { OrbitControls } from './OrbitControls.js';
import Cloud from './Cloud.js';

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild(renderer.domElement)

const camera = new THREE.PerspectiveCamera(168)
camera.position.set(8.0, -5.5, 8.0)

const controls = new OrbitControls(camera, renderer.domElement)
controls.update();
controls.enableDamping = true;
controls.enablePan = true;

const cloud = new Cloud({
  cloudSize: new THREE.Vector3(0.4, 0.9, 0.4),
  sunPosition: new THREE.Vector3(1.0, 2.0, 1.0),
  cloudColor: new THREE.Color(0xffffff),
  skyColor: new THREE.Color(0x000000),
  cloudSteps: 48,
  shadowSteps: 16,
  cloudLength: 32,
  shadowLength: 2,
  noise: true
})

const handleResize = () => {
  const dpr = Math.min(window.devicePixelRatio, 2)
  renderer.setPixelRatio(dpr)
  renderer.setSize(window.innerWidth, window.innerHeight)
  cloud.setSize(window.innerWidth * dpr, window.innerHeight * dpr)
  cloud.render(renderer, camera)
}
handleResize()
window.addEventListener('resize', handleResize)

let lastPolarAngle = 0
let lastAzimuthalAngle = 0

controls.addEventListener('change', () => {
  const polarAngle = controls.getPolarAngle()
  const azimuthalAngle = controls.getAzimuthalAngle()

  const rotationDelta = Math.abs(polarAngle - lastPolarAngle) + Math.abs(azimuthalAngle - lastAzimuthalAngle)
  cloud.regress = rotationDelta > 0.0002

  lastPolarAngle = polarAngle
  lastAzimuthalAngle = azimuthalAngle

  cloud.render(renderer, camera)
})

renderer.setAnimationLoop((time) => {
  controls.update()
  cloud.time = time / 1000
})
