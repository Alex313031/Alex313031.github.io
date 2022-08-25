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
    gl.getExtension('OES_standard_derivatives');
    document.getElementById('shader').style.maxWidth = width + 'px';
    document.getElementById('shader').appendChild(gl.canvas);
    gl.canvas.className = "shards";
    
    if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
    }

    var quad = GL.Mesh.plane();
    var mesh = GL.Mesh.sphere({ detail: 100 });
    for (var i = 0; i < mesh.vertices.length; i++) {
      var v = mesh.vertices[i];
      for (var j = 0; j < 12; j++) {
        v[j % 3] += 0.1 * Math.sin(5 * v[(j + 1) % 3]);
      }
    }
    mesh.computeNormals();

    var backgroundShader = new GL.Shader([
      'varying vec2 coord;',
      '',
      'void main() {',
      '  coord = gl_Vertex.xy * 0.5 + 0.5;',
      '  gl_Position = vec4(gl_Vertex.xy, 0.0, 1.0);',
      '}',
    ].join('\n'), [
      'varying vec2 coord;',
      '',
      'void main() {',
      '  gl_FragColor = vec4(0.4 * (1.0 - length(coord - 0.3)));',
      '}',
    ].join('\n'));

    var shaders = {};
    var current = 'Metal';
    var vertex = [
      'varying vec3 vertex;',
      'varying vec3 normal;',
      '',
      'void main() {',
      '  vertex = (gl_ModelViewMatrix * vec4(gl_Vertex.xyz, 1.0)).xyz;',
      '  normal = gl_NormalMatrix * gl_Normal.xyz;',
      '  gl_Position = gl_ModelViewProjectionMatrix * vec4(gl_Vertex.xyz, 1.0);',
      '}',
    ].join('\n');
    var fragments = {
      'Visualize curvature': [
      '  vec3 light = vec3(0.0);',
      '  vec3 ambient = vec3(curvature + 0.5);',
      '  vec3 diffuse = vec3(0.0);',
      '  vec3 specular = vec3(0.0);',
      '  float shininess = 0.0;',
      ],
      'Metal': [
      '  float corrosion = clamp(-curvature * 3.0, 0.0, 1.0);',
      '  float shine = clamp(curvature * 5.0, 0.0, 1.0);',
      '  vec3 light = normalize(vec3(0.0, 1.0, 10.0));',
      '  vec3 ambient = vec3(0.15, 0.1, 0.1);',
      '  vec3 diffuse = mix(mix(vec3(0.3, 0.25, 0.2), vec3(0.45, 0.5, 0.5), corrosion),',
      '    vec3(0.5, 0.4, 0.3), shine) - ambient;',
      '  vec3 specular = mix(vec3(0.0), vec3(1.0) - ambient - diffuse, shine);',
      '  float shininess = 128.0;',
      ],
      'Red wax': [
      '  float dirt = clamp(0.25 - curvature * 4.0, 0.0, 1.0);',
      '  vec3 light = normalize(vec3(0.0, 1.0, 10.0));',
      '  vec3 ambient = vec3(0.1, 0.05, 0.0);',
      '  vec3 diffuse = mix(vec3(0.4, 0.15, 0.1), vec3(0.4, 0.3, 0.3), dirt) - ambient;',
      '  vec3 specular = mix(vec3(0.15) - ambient, vec3(0.0), dirt);',
      '  float shininess = 64.0;',
      ],
    };
    var materials = document.getElementById('materials');
    var html = '';
    Object.keys(fragments).forEach(function(name) {
      var fragment = [].concat([
        '// License: CC0 (http://creativecommons.org/publicdomain/zero/1.0/)',
        '#extension GL_OES_standard_derivatives : enable',
        '',
        'varying vec3 normal;',
        'varying vec3 vertex;',
        '',
        'void main() {',
        '  vec3 n = normalize(normal);',
        '',
        '  // Compute curvature',
        '  vec3 dx = dFdx(n);',
        '  vec3 dy = dFdy(n);',
        '  vec3 xneg = n - dx;',
        '  vec3 xpos = n + dx;',
        '  vec3 yneg = n - dy;',
        '  vec3 ypos = n + dy;',
        '  float depth = length(vertex);',
        '  float curvature = (cross(xneg, xpos).y - cross(yneg, ypos).x) * 4.0 / depth;',
        ''],
        '  // Compute surface properties',
        fragments[name],
        ['',
        '  // Compute final color',
        '  float cosAngle = dot(n, light);',
        '  gl_FragColor.rgb = ambient +',
        '    diffuse * max(0.0, cosAngle) +',
        '    specular * pow(max(0.0, cosAngle), shininess);',
        '}',
      ]).join('\n');
      shaders[name] = {
        vertex: vertex,
        fragment: fragment,
        shader: new GL.Shader(vertex, fragment)
      };
      html += '<label><input type="radio" name="materials" value="' + name + '"' + (name === current ? ' checked' : '') + '>' + name + '</label>';
    });
    materials.innerHTML = html;

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
      gl.translate(0, 0, -5);
      gl.rotate(angleX, 1, 0, 0);
      gl.rotate(angleY, 0, 1, 0);
      backgroundShader.draw(quad);
      gl.enable(gl.DEPTH_TEST);
      shaders[current].shader.draw(mesh);
      gl.disable(gl.DEPTH_TEST);
    };

    function updateSyntaxHighlighting() {
      var pre = document.getElementById('fragment');
      pre.textContent = shaders[current].fragment;
      if (this.syntaxHighlighting) syntaxHighlighting(pre);
    }

    [].forEach.call(document.getElementsByTagName('input'), function(element) {
      if (element.name === 'materials') {
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
