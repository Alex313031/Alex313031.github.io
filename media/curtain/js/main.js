function App() {
  const conf = {
    el: 'canvas',
    gravity: -0.02,
    nx: 100,
    ny: 40,
    size: 0.5,
    stiffness: 5,
    mouseRadius: 10,
    mouseStrength: 0.6 };


  let renderer, scene, camera;
  let width, height;
  const { randFloat: rnd, randFloatSpread: rndFS } = THREE.Math;

  const mouse = new THREE.Vector2(),oldMouse = new THREE.Vector2();
  const verlet = new VerletJS(),polylines = [];
  const uCx = { value: 0 },uCy = { value: 0 };

  init();

  function init() {
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById(conf.el), antialias: true, alpha: true });
    camera = new THREE.PerspectiveCamera();

    verlet.width = 512;
    verlet.height = 256;

    updateSize();
    window.addEventListener('resize', updateSize, false);

    initScene();
    initListeners();
    animate();
  }

  function initScene() {
    scene = new THREE.Scene();
    verlet.gravity = new Vec2(0, conf.gravity);

    const loader = new THREE.TextureLoader();
    // loader.load('https://klevron.github.io/codepen/misc/curtain.jpg', texture => {
    //   initCurtain(texture);
    // })
    initCurtain();
  }

  function initCurtain() {
    const material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uCx, uCy,
        // tDiffuse: { value: texture },
        uSize: { value: conf.size / conf.nx } },

      vertexShader: `
        uniform float uCx;
        uniform float uCy;
        uniform float uSize;
        attribute vec3 color;
        attribute vec3 next;
        attribute vec3 prev;
        attribute float side;

        varying vec2 vUv;
        varying vec4 vColor;

        void main() {
          vUv = uv;
          vColor = vec4(color, 0.5 + smoothstep(0.0, 0.5, uv.y) * 0.5);

          vec3 pos = vec3(position.x * uCx, position.y * uCy, 0.0);
          vec2 sprev = vec2(prev.x * uCx, prev.y * uCy);
          vec2 snext = vec2(next.x * uCx, next.y * uCy);

          vec2 tangent = normalize(snext - sprev);
          vec2 normal = vec2(-tangent.y, tangent.x);

          float dist = length(snext - sprev);
          normal *= smoothstep(0.0, 0.02, dist);

          normal *= uSize;// * (1.0 - uv.y);
          pos.xy -= normal * side;

          gl_Position = vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        // uniform sampler2D tDiffuse;
        varying vec2 vUv;
        varying vec4 vColor;
        void main() {
          // vec4 tex = texture2D(tDiffuse, vUv);
          // tex.a = 0.95;
          // gl_FragColor = tex;
          gl_FragColor = vColor;
        }
      ` });


    const dx = verlet.width / conf.nx,dy = -verlet.height / (conf.ny - 1);
    const ox = -dx * (conf.nx / 2 - 0.5),oy = verlet.height / 2 - dy / 2;
    // const cscale = chroma.scale([chroma.random(), chroma.random()]);
    // const cscale = chroma.scale([0x09256f, 0x6efec8]);
    const cscale = chroma.scale([0x051924, 0xc00a1c]);
    for (let i = 0; i < conf.nx; i++) {
      const points = [];
      const vpoints = [];
      for (let j = 0; j < conf.ny; j++) {
        const x = ox + i * dx,y = oy + j * dy;
        points.push(new THREE.Vector3(x, y, 0));
        vpoints.push(new Vec2(x, y));
      }
      const polyline = new Polyline({ points, color1: cscale(rnd(0, 1)), color2: cscale(rnd(0, 1)), uvx: (i + 1) / conf.nx, uvdx: conf.size / conf.nx });
      polylines.push(polyline);

      polyline.segment = verlet.lineSegments(vpoints, conf.stiffness);
      polyline.segment.pin(0);
      // polyline.segment.particles.forEach(p => { p.pos.x += rndFS(5); });

      const mesh = new THREE.Mesh(polyline.geometry, material);
      scene.add(mesh);
    }

    for (let i = 0; i < verlet.width; i++) {
      const ox = -verlet.width / 2;
      setTimeout(() => {
        _move(new THREE.Vector2(ox + i, 0), new THREE.Vector2(ox + i + 1, 0));
      }, i * 15);
    }
  }

  function updatePoints() {
    polylines.forEach(line => {
      for (let i = 0; i < line.points.length; i++) {
        const p = line.segment.particles[i].pos;
        line.points[i].x = p.x;
        line.points[i].y = p.y;
      }
      line.updateGeometry();
    });
  }

  function updateColors() {
    const c1 = chroma.random(),c2 = chroma.random();
    const cscale = chroma.scale([c1, c2]);
    console.log(c1.hex(), c2.hex());
    // #21a25f #a0fa42
    // #09256f #6efec8
    polylines.forEach(line => {
      line.color1 = cscale(rnd(0, 1));
      line.color2 = cscale(rnd(0, 1));
      const cscale1 = chroma.scale([line.color1, line.color2]);
      const colors = line.geometry.attributes.color.array;
      const c = new THREE.Color();
      for (let i = 0; i < line.count; i++) {
        c.set(cscale1(i / line.count).hex());
        c.toArray(colors, i * 2 * 3);
        c.toArray(colors, (i * 2 + 1) * 3);
      }
      line.geometry.attributes.color.needsUpdate = true;
    });
  }

  function animate() {
    verlet.frame(16);
    updatePoints();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  function initListeners() {
    if ('ontouchstart' in window) {
      document.body.addEventListener('touchstart', updateMouse, false);
      document.body.addEventListener('touchmove', move, false);
    } else {
      document.body.addEventListener('mouseenter', updateMouse, false);
      document.body.addEventListener('mousemove', move, false);
    }
    document.body.addEventListener('click', updateColors, false);
  }

  function move(e) {
    updateMouse(e);
    _move(oldMouse, mouse);
  }

  function _move(oV, nV) {
    const v1 = new THREE.Vector2(),v2 = new THREE.Vector2();
    polylines.forEach(line => {
      for (let i = 0; i < line.points.length; i++) {
        const p = line.segment.particles[i].pos;
        const l = v1.copy(oV).sub(v2.set(p.x, p.y)).length();
        if (l < conf.mouseRadius) {
          v1.copy(nV).sub(oV).multiplyScalar(conf.mouseStrength);
          p.x += v1.x;p.y += v1.y;
        }
      }
    });
  }

  function updateMouse(e) {
    if (e.changedTouches && e.changedTouches.length) {
      e.x = e.changedTouches[0].pageX;
      e.y = e.changedTouches[0].pageY;
    }
    if (e.x === undefined) {
      e.x = e.pageX;
      e.y = e.pageY;
    }

    oldMouse.copy(mouse);
    mouse.set(
    (e.x - width / 2) * verlet.width / width,
    (height / 2 - e.y) * verlet.height / height);

  }

  function updateSize() {
    width = window.innerWidth;
    height = window.innerHeight;
    uCx.value = 2 / verlet.width;uCy.value = 2 / verlet.height;
    renderer.setSize(width, height);
    // camera.aspect = width / height;
    // camera.updateProjectionMatrix();
  }
}

// adapted from https://github.com/oframe/ogl/blob/master/src/extras/Polyline.js
const Polyline = function () {
  const tmp = new THREE.Vector3();

  class Polyline {
    constructor(params) {
      const { points, color1, color2, uvx, uvdx } = params;
      this.points = points;
      this.count = points.length;
      this.color1 = color1;this.color2 = color2;
      this.uvx = uvx;this.uvdx = uvdx;
      this.init();
      this.updateGeometry();
    }

    init() {
      // const cscale = chroma.scale([chroma.random(), chroma.random()]);
      const cscale = chroma.scale([this.color1, this.color2]);
      this.geometry = new THREE.BufferGeometry();
      this.position = new Float32Array(this.count * 3 * 2);
      this.prev = new Float32Array(this.count * 3 * 2);
      this.next = new Float32Array(this.count * 3 * 2);
      const side = new Float32Array(this.count * 1 * 2);
      const uv = new Float32Array(this.count * 2 * 2);
      const color = new Float32Array(this.count * 3 * 2);
      const index = new Uint16Array((this.count - 1) * 3 * 2);

      const c = new THREE.Color();
      for (let i = 0; i < this.count; i++) {
        const i2 = i * 2;
        side.set([-1, 1], i2);
        const v = 1 - i / (this.count - 1);
        // uv.set([0, v, 1, v], i * 4);
        uv.set([this.uvx, v, this.uvx - this.uvdx, v], i * 4);

        c.set(cscale(v).hex());
        c.toArray(color, i2 * 3);
        c.toArray(color, (i2 + 1) * 3);

        if (i === this.count - 1) continue;
        index.set([i2 + 0, i2 + 1, i2 + 2], (i2 + 0) * 3);
        index.set([i2 + 2, i2 + 1, i2 + 3], (i2 + 1) * 3);
      }

      this.geometry.setAttribute('position', new THREE.BufferAttribute(this.position, 3));
      this.geometry.setAttribute('color', new THREE.BufferAttribute(color, 3));
      this.geometry.setAttribute('prev', new THREE.BufferAttribute(this.prev, 3));
      this.geometry.setAttribute('next', new THREE.BufferAttribute(this.next, 3));
      this.geometry.setAttribute('side', new THREE.BufferAttribute(side, 1));
      this.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      this.geometry.setIndex(new THREE.BufferAttribute(index, 1));
    }

    updateGeometry() {
      this.points.forEach((p, i) => {
        p.toArray(this.position, i * 3 * 2);
        p.toArray(this.position, i * 3 * 2 + 3);

        if (!i) {
          tmp.copy(p).sub(this.points[i + 1]).add(p);
          tmp.toArray(this.prev, i * 3 * 2);
          tmp.toArray(this.prev, i * 3 * 2 + 3);
        } else {
          p.toArray(this.next, (i - 1) * 3 * 2);
          p.toArray(this.next, (i - 1) * 3 * 2 + 3);
        }

        if (i === this.points.length - 1) {
          tmp.copy(p).sub(this.points[i - 1]).add(p);
          tmp.toArray(this.next, i * 3 * 2);
          tmp.toArray(this.next, i * 3 * 2 + 3);
        } else {
          p.toArray(this.prev, (i + 1) * 3 * 2);
          p.toArray(this.prev, (i + 1) * 3 * 2 + 3);
        }
      });

      this.geometry.attributes.position.needsUpdate = true;
      this.geometry.attributes.prev.needsUpdate = true;
      this.geometry.attributes.next.needsUpdate = true;
    }}


  return Polyline;
}();

App();
