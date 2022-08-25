  (function() {
    var angleX = 30;
    var angleY = 0;

    var gl = GL.create({ stencil: false, alpha: false, antialias: true });
    var width = 600;
    var height = 400;
    var ratio = window.devicePixelRatio || 1;
    gl.canvas.width = Math.round(width * ratio);
    gl.canvas.height = Math.round(height * ratio);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.matrixMode(gl.PROJECTION);
    gl.perspective(45, gl.canvas.width / gl.canvas.height, 0.1, 100);
    gl.matrixMode(gl.MODELVIEW);
    gl.enable(gl.DEPTH_TEST);
    gl.getExtension('OES_standard_derivatives');
    document.getElementById('shader').style.maxWidth = width + 'px';
    document.getElementById('shader').appendChild(gl.canvas);
    gl.canvas.className = "shards";
    
    if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
    }

    var mesh = GL.Mesh.plane({ detail: 10 });
    for (var i = 0; i < mesh.vertices.length; i++) {
      var v = mesh.vertices[i];
      mesh.vertices[i] = [10 * v[0], Math.random() * 2 - 1, 10 * v[1]];
    }
    mesh.compile();

    var shaders = {};
    var current = 'vertex.xz';
    var vertex = [
      'varying vec3 vertex;',
      '',
      'void main() {',
      '  vertex = vec3(gl_Vertex.x * 3.0, gl_Vertex.y * 6.0, gl_Vertex.z * 3.0);',
      '  gl_Position = gl_ModelViewProjectionMatrix * vec4(gl_Vertex.xyz, 1.0);',
      '}',
    ].join('\n');
    var fragments = {
      'vertex.y': [
        '// License: CC0 (http://creativecommons.org/publicdomain/zero/1.0/)',
        '#extension GL_OES_standard_derivatives : enable',
        '',
        'varying vec3 vertex;',
        '',
        'void main() {',
        '  // Pick a coordinate to visualize in a grid',
        '  float coord = vertex.y;',
        '',
        '  // Compute anti-aliased world-space grid lines',
        '  float line = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);',
        '',
        '  // Just visualize the grid lines directly',
        '  float color = 1.0 - min(line, 1.0);',
        '',
        '  // Apply gamma correction',
        '  color = pow(color, 1.0 / 2.2);',
        '  gl_FragColor = vec4(vec3(color), 1.0);',
        '}',
      ].join('\n'),
      'vertex.xz': [
        '// License: CC0 (http://creativecommons.org/publicdomain/zero/1.0/)',
        '#extension GL_OES_standard_derivatives : enable',
        '',
        'varying vec3 vertex;',
        '',
        'void main() {',
        '  // Pick a coordinate to visualize in a grid',
        '  vec2 coord = vertex.xz;',
        '',
        '  // Compute anti-aliased world-space grid lines',
        '  vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);',
        '  float line = min(grid.x, grid.y);',
        '',
        '  // Just visualize the grid lines directly',
        '  float color = 1.0 - min(line, 1.0);',
        '',
        '  // Apply gamma correction',
        '  color = pow(color, 1.0 / 2.2);',
        '  gl_FragColor = vec4(vec3(color), 1.0);',
        '}',
      ].join('\n'),
      'vertex.xyz': [
        '// License: CC0 (http://creativecommons.org/publicdomain/zero/1.0/)',
        '#extension GL_OES_standard_derivatives : enable',
        '',
        'varying vec3 vertex;',
        '',
        'void main() {',
        '  // Pick a coordinate to visualize in a grid',
        '  vec3 coord = vertex.xyz;',
        '',
        '  // Compute anti-aliased world-space grid lines',
        '  vec3 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);',
        '  float line = min(min(grid.x, grid.y), grid.z);',
        '',
        '  // Just visualize the grid lines directly',
        '  float color = 1.0 - min(line, 1.0);',
        '',
        '  // Apply gamma correction',
        '  color = pow(color, 1.0 / 2.2);',
        '  gl_FragColor = vec4(vec3(color), 1.0);',
        '}',
      ].join('\n'),
      'length(vertex.xz)': [
        '// License: CC0 (http://creativecommons.org/publicdomain/zero/1.0/)',
        '#extension GL_OES_standard_derivatives : enable',
        '',
        'varying vec3 vertex;',
        '',
        'void main() {',
        '  // Pick a coordinate to visualize in a grid',
        '  float coord = length(vertex.xz);',
        '',
        '  // Compute anti-aliased world-space grid lines',
        '  float line = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);',
        '',
        '  // Just visualize the grid lines directly',
        '  float color = 1.0 - min(line, 1.0);',
        '',
        '  // Apply gamma correction',
        '  color = pow(color, 1.0 / 2.2);',
        '  gl_FragColor = vec4(vec3(color), 1.0);',
        '}',
      ].join('\n'),
      'vec2(length(vertex.xz), atan(vertex.x, vertex.z))': [
        '// License: CC0 (http://creativecommons.org/publicdomain/zero/1.0/)',
        '#extension GL_OES_standard_derivatives : enable',
        '',
        'varying vec3 vertex;',
        '',
        'void main() {',
        '  // Pick a coordinate to visualize in a grid',
        '  const float pi = ' + Math.PI + ';',
        '  const float scale = 10.0;',
        '  vec2 coord = vec2(length(vertex.xz), atan(vertex.x, vertex.z) * scale / pi);',
        '',
        '  // Handling the wrap-around is tricky in this case. The function atan()',
        '  // is not continuous and jumps when it wraps from -pi to pi. The screen-',
        '  // space partial derivative will be huge along that boundary. To avoid',
        '  // this, compute another coordinate that places the jump at a different',
        '  // place, then use the coordinate where the jump is farther away.',
        '  //',
        '  // When doing this, make sure to always evaluate both fwidth() calls even',
        '  // though we only use one. All fragment shader threads in the thread group',
        '  // actually share a single instruction pointer, so threads that diverge',
        '  // down different conditional branches actually cause both branches to be',
        '  // serialized one after the other. Calling fwidth() from a thread next to',
        '  // an inactive thread ends up reading inactive registers with old values',
        '  // in them and you get an undefined value.',
        '  // ',
        '  // The conditional uses +/-scale/2 since coord.y has a range of +/-scale.',
        '  // The jump is at +/-scale for coord and at 0 for wrapped.',
        '  vec2 wrapped = vec2(coord.x, fract(coord.y / (2.0 * scale)) * (2.0 * scale));',
        '  vec2 coordWidth = fwidth(coord);',
        '  vec2 wrappedWidth = fwidth(wrapped);',
        '  vec2 width = coord.y < -scale * 0.5 || coord.y > scale * 0.5 ? wrappedWidth : coordWidth;',
        '',
        '  // Compute anti-aliased world-space grid lines',
        '  vec2 grid = abs(fract(coord - 0.5) - 0.5) / width;',
        '  float line = min(grid.x, grid.y);',
        '',
        '  // Just visualize the grid lines directly',
        '  float color = 1.0 - min(line, 1.0);',
        '',
        '  // Apply gamma correction',
        '  color = pow(color, 1.0 / 2.2);',
        '  gl_FragColor = vec4(vec3(color), 1.0);',
        '}',
      ].join('\n'),
    };
    var coordinates = document.getElementById('coordinates');
    var html = '';
    Object.keys(fragments).forEach(function(coord) {
      var fragment = fragments[coord];
      shaders[coord] = {
        vertex: vertex,
        fragment: fragment,
        shader: new GL.Shader(vertex, fragment)
      };
      html += '<label><input type="radio" name="coordinates" value="' + coord + '"' + (coord === current ? ' checked' : '') + '>' + coord + '</label>';
    });
    coordinates.innerHTML = html;

    gl.onupdate = function(seconds) {
      angleY += seconds * 5;
    };

    gl.onmousemove = function(e) {
      if (e.dragging) {
        angleX += e.deltaY;
        angleY += e.deltaX;
        angleX = Math.max(-90, Math.min(90, angleX));
      }
    };

    gl.ondraw = function() {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.loadIdentity();
      gl.translate(0, 0, -7);
      gl.rotate(angleX, 1, 0, 0);
      gl.rotate(angleY, 0, 1, 0);
      shaders[current].shader.draw(mesh);
    };

    function updateSyntaxHighlighting() {
      var pre = document.getElementById('fragment');
      pre.textContent = shaders[current].fragment;
      if (this.syntaxHighlighting) syntaxHighlighting(pre);
    }

    [].forEach.call(document.getElementsByTagName('input'), function(element) {
      if (element.name === 'coordinates') {
        element.onchange = function() {
          if (element.checked) {
            current = element.value;
            updateSyntaxHighlighting();
          }
        };
      }
    });

    updateSyntaxHighlighting();
    gl.animate();
  })();
