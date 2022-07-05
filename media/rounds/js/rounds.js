  (function() {
    function compileProgram(vertexSource, fragmentSource) {
      function compileShader(type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          throw new Error(gl.getShaderInfoLog(shader));
        }
        gl.attachShader(program, shader);
      }
      var program = gl.createProgram();
      compileShader(gl.VERTEX_SHADER, vertexSource);
      compileShader(gl.FRAGMENT_SHADER, fragmentSource);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program));
      }
      return program;
    }

    var angleX = 30;
    var angleY = 30;

    var canvas = document.createElement('canvas');
    var gl = canvas.getContext('webgl', { alpha: false, depth: false, stencil: false });
    var width = 600;
    var height = 500;
    var ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.cursor = 'default';
    gl.viewport(0, 0, canvas.width, canvas.height);
    document.getElementById('shader').style.maxWidth = width + 'px';
    document.getElementById('shader').appendChild(canvas);
    gl.canvas.className = "shards";
    
    if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
    }

    var boxShadowProgram = compileProgram([
      'precision highp float;',
      '',
      'uniform vec4 box;',
      'uniform vec2 window;',
      'uniform float sigma;',
      '',
      'attribute vec2 coord;',
      'varying vec2 vertex;',
      '',
      'void main() {',
      '  float padding = 3.0 * sigma;',
      '  vertex = mix(box.xy - padding, box.zw + padding, coord);',
      '  gl_Position = vec4(vertex / window * 2.0 - 1.0, 0.0, 1.0);',
      '}',
    ].join('\n'), [
      'precision highp float;',
      '',
      'uniform vec4 box;',
      'uniform vec4 color;',
      'uniform float sigma;',
      '',
      'varying vec2 vertex;',
      '',
      '// This approximates the error function, needed for the gaussian integral',
      'vec4 erf(vec4 x) {',
      '  vec4 s = sign(x), a = abs(x);',
      '  x = 1.0 + (0.278393 + (0.230389 + 0.078108 * (a * a)) * a) * a;',
      '  x *= x;',
      '  return s - s / (x * x);',
      '}',
      '',
      '// Return the mask for the shadow of a box from lower to upper',
      'float boxShadow(vec2 lower, vec2 upper, vec2 point, float sigma) {',
      '  vec4 query = vec4(point - lower, point - upper);',
      '  vec4 integral = 0.5 + 0.5 * erf(query * (sqrt(0.5) / sigma));',
      '  return (integral.z - integral.x) * (integral.w - integral.y);',
      '}',
      '',
      'void main() {',
      '  gl_FragColor = color;',
      '  gl_FragColor.a *= boxShadow(box.xy, box.zw, vertex, sigma);',
      '}',
    ].join('\n'));
    var boxShadowBox = gl.getUniformLocation(boxShadowProgram, 'box');
    var boxShadowColor = gl.getUniformLocation(boxShadowProgram, 'color');
    var boxShadowSigma = gl.getUniformLocation(boxShadowProgram, 'sigma');
    var boxShadowWindow = gl.getUniformLocation(boxShadowProgram, 'window');

    var roundedBoxShadowProgram = compileProgram([
      'precision highp float;',
      '',
      'uniform vec4 box;',
      'uniform vec2 window;',
      'uniform float sigma;',
      '',
      'attribute vec2 coord;',
      'varying vec2 vertex;',
      '',
      'void main() {',
      '  float padding = 3.0 * sigma;',
      '  vertex = mix(box.xy - padding, box.zw + padding, coord);',
      '  gl_Position = vec4(vertex / window * 2.0 - 1.0, 0.0, 1.0);',
      '}',
    ].join('\n'), [
      'precision highp float;',
      '',
      'uniform vec4 box;',
      'uniform vec4 color;',
      'uniform float sigma;',
      'uniform float corner;',
      '',
      'varying vec2 vertex;',
      '',
      '// A standard gaussian function, used for weighting samples',
      'float gaussian(float x, float sigma) {',
      '  const float pi = 3.141592653589793;',
      '  return exp(-(x * x) / (2.0 * sigma * sigma)) / (sqrt(2.0 * pi) * sigma);',
      '}',
      '',
      '// This approximates the error function, needed for the gaussian integral',
      'vec2 erf(vec2 x) {',
      '  vec2 s = sign(x), a = abs(x);',
      '  x = 1.0 + (0.278393 + (0.230389 + 0.078108 * (a * a)) * a) * a;',
      '  x *= x;',
      '  return s - s / (x * x);',
      '}',
      '',
      '// Return the blurred mask along the x dimension',
      'float roundedBoxShadowX(float x, float y, float sigma, float corner, vec2 halfSize) {',
      '  float delta = min(halfSize.y - corner - abs(y), 0.0);',
      '  float curved = halfSize.x - corner + sqrt(max(0.0, corner * corner - delta * delta));',
      '  vec2 integral = 0.5 + 0.5 * erf((x + vec2(-curved, curved)) * (sqrt(0.5) / sigma));',
      '  return integral.y - integral.x;',
      '}',
      '',
      '// Return the mask for the shadow of a box from lower to upper',
      'float roundedBoxShadow(vec2 lower, vec2 upper, vec2 point, float sigma, float corner) {',
      '  // Center everything to make the math easier',
      '  vec2 center = (lower + upper) * 0.5;',
      '  vec2 halfSize = (upper - lower) * 0.5;',
      '  point -= center;',
      '',
      '  // The signal is only non-zero in a limited range, so don\'t waste samples',
      '  float low = point.y - halfSize.y;',
      '  float high = point.y + halfSize.y;',
      '  float start = clamp(-3.0 * sigma, low, high);',
      '  float end = clamp(3.0 * sigma, low, high);',
      '',
      '  // Accumulate samples (we can get away with surprisingly few samples)',
      '  float step = (end - start) / 4.0;',
      '  float y = start + step * 0.5;',
      '  float value = 0.0;',
      '  for (int i = 0; i < 4; i++) {',
      '    value += roundedBoxShadowX(point.x, point.y - y, sigma, corner, halfSize) * gaussian(y, sigma) * step;',
      '    y += step;',
      '  }',
      '',
      '  return value;',
      '}',
      '',
      'void main() {',
      '  gl_FragColor = color;',
      '  gl_FragColor.a *= roundedBoxShadow(box.xy, box.zw, vertex, sigma, corner);',
      '}',
    ].join('\n'));
    var roundedBoxShadowBox = gl.getUniformLocation(roundedBoxShadowProgram, 'box');
    var roundedBoxShadowColor = gl.getUniformLocation(roundedBoxShadowProgram, 'color');
    var roundedBoxShadowSigma = gl.getUniformLocation(roundedBoxShadowProgram, 'sigma');
    var roundedBoxShadowCorner = gl.getUniformLocation(roundedBoxShadowProgram, 'corner');
    var roundedBoxShadowWindow = gl.getUniformLocation(roundedBoxShadowProgram, 'window');

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.clearColor(0.5, 0.5, 0.5, 1);

    function renderBoxShadow(xmin, ymin, xmax, ymax, r, g, b, a, sigma) {
      gl.useProgram(boxShadowProgram);
      gl.uniform4f(boxShadowBox, xmin, ymin, xmax, ymax);
      gl.uniform4f(boxShadowColor, r, g, b, a);
      gl.uniform1f(boxShadowSigma, sigma);
      gl.uniform2f(boxShadowWindow, width, height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function renderRoundedBoxShadow(xmin, ymin, xmax, ymax, r, g, b, a, sigma, corner) {
      gl.useProgram(roundedBoxShadowProgram);
      gl.uniform4f(roundedBoxShadowBox, xmin, ymin, xmax, ymax);
      gl.uniform4f(roundedBoxShadowColor, r, g, b, a);
      gl.uniform1f(roundedBoxShadowSigma, sigma);
      gl.uniform1f(roundedBoxShadowCorner, corner);
      gl.uniform2f(roundedBoxShadowWindow, width, height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function now() {
      return window.performance && performance.now ? performance.now() : Date.now();
    }

    function render() {
      var boxes = [];
      var useRounded = document.getElementById('rounded').checked;

      gl.clear(gl.COLOR_BUFFER_BIT);

      // Generate something interesting to look at that uses lots of boxes
      for (var i = 0, n = 64; i < n; i++) {
        (function(i) {
          var angle = (frame / 100 + i / n) * Math.PI * 2;
          var x = width / 2 + Math.cos(3 * angle) * 200;
          var y = height / 2 + Math.sin(5 * angle) * 200;
          var z = 1 + Math.sin(angle * 4);
          var r = 20 + z;
          var ys = y - z * 10;
          var corner = r * (0.5 + 0.5 * Math.cos(2 * angle));
          var boxSigma = 0.25;
          var shadowSigma = z * 10;
          boxes.push({
            depth: z,
            callback: function() {
              if (useRounded) {
                renderRoundedBoxShadow(x - r, ys - r, x + r, ys + r, 0, 0, 0, 0.75, shadowSigma, corner);
                renderRoundedBoxShadow(x - r, y - r, x + r, y + r, 0.75, 0.75, 0.75, 1, boxSigma, corner);
              } else {
                renderBoxShadow(x - r, ys - r, x + r, ys + r, 0, 0, 0, 0.75, shadowSigma);
                renderBoxShadow(x - r, y - r, x + r, y + r, 0.75, 0.75, 0.75, 1, boxSigma);
              }
            }
          });
        })(i);
      }

      boxes.sort(function(a, b) {
        return a.depth - b.depth;
      });

      for (var i = 0; i < boxes.length; i++) {
        boxes[i].callback();
      }
    }

    function isPaused() {
      return document.getElementById('paused').checked;
    }

    function renderIfPaused() {
      if (isPaused()) {
        render();
      }
    }

    function tick() {
      var after = now();
      var seconds = (after - before) / 1000;
      before = after;

      if (!isPaused() && seconds < 1 && canvas.offsetTop + height >= scrollY && scrollY + document.body.scrollHeight >= canvas.offsetTop) {
        frame += seconds;
        render();
      }

      requestAnimationFrame(tick);
    }

    document.getElementById('rounded').onchange = renderIfPaused;
    document.getElementById('box').onchange = renderIfPaused;
    var before = now();
    var frame = 0;
    render();
    requestAnimationFrame(tick);
  })();
