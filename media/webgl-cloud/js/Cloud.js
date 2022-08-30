import * as THREE from "three";
import { FullScreenQuad } from './Pass.js';
import { fragmentShader } from './shaders.js';

class Cloud extends FullScreenQuad {
  constructor({
    cloudSize = new THREE.Vector3(0.4, 0.9, 0.4),
    sunPosition = new THREE.Vector3(1.0, 2.0, 1.0),
    cloudColor = new THREE.Color(0xffffff),
    skyColor = new THREE.Color(0x000000),
    cloudSteps = 48,
    shadowSteps = 16,
    cloudLength = 32,
    shadowLength = 2,
    regress = true
  } = {}) {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uCloudSize: {
          value: cloudSize
        },
        uSunPosition: {
          value: sunPosition
        },
        uCameraPosition: {
          value: new THREE.Vector3()
        },
        uCloudColor: {
          value: cloudColor
        },
        uSkyColor: {
          value: skyColor
        },
        uCloudSteps: {
          value: cloudSteps
        },
        uShadowSteps: {
          value: shadowSteps
        },
        uCloudLength: {
          value: cloudLength
        },
        uShadowLength: {
          value: shadowLength
        },
        uResolution: {
          value: new THREE.Vector2()
        },
        uTime: {
          value: 0
        },
        uFocalLength: {
          value: 2.0
        },
        uRegress: {
          value: regress
        }
      },
      fragmentShader
    })

    super(material)
  }

  get cloudSize() {
    return this.material.uniforms.uCloudSize.value
  }

  get sunPosition() {
    return this.material.uniforms.uSunPosition.value
  }

  get skyColor() {
    return this.material.uniforms.uSkyColor.value
  }

  get regress() {
    return this.material.uniforms.uRegress.value
  }

  set regress(value) {
    this.material.uniforms.uRegress.value = value
  }

  get time() {
    return this.material.uniforms.uTime.value
  }

  set time(value) {
    return (this.material.uniforms.uTime.value = value)
  }

  setSize(width, height) {
    this.material.uniforms.uResolution.value.set(width, height)
  }

  render(renderer, camera) {
    this.material.uniforms.uCameraPosition.value.copy(camera.position)
    this.material.uniforms.uFocalLength.value = camera.getFocalLength()
    super.render(renderer)
  }
}

export default Cloud
