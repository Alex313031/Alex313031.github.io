  (function() {
    var angleX = 30;
    var angleY = 30;

    var gl = GL.create({ stencil: false, alpha: true, antialias: false });
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
    

    var depthMap = new GL.Texture(1024, 1024, { format: gl.RED });
    var depthShader = new GL.Shader([
      'varying vec4 pos;',
      'void main() {',
      '  gl_Position = pos = gl_ModelViewProjectionMatrix * gl_Vertex;',
      '}',
    ].join('\n'), [
      'varying vec4 pos;',
      'void main() {',
      '  float depth = pos.z / pos.w;',
      '  gl_FragColor = vec4(depth * 0.5 + 0.5);',
      '}',
    ].join('\n'));

    var shadowTestShader = new GL.Shader([
      'uniform mat4 shadowMapMatrix;',
      'uniform vec3 light;',
      'attribute vec2 offsetCoord;',
      'attribute vec4 offsetPosition;',
      'varying vec4 coord;',
      'varying vec3 normal;',
      '',
      'void main() {',
      '  normal = gl_Normal;',
      '  vec4 pos = offsetPosition;',
      '',
      '  // This is a hack that avoids leaking light immediately behind polygons by',
      '  // darkening creases in front of polygons instead. It biases the position',
      '  // forward toward the light to compensate for the bias away from the light',
      '  // applied by the fragment shader. This is only necessary because we have',
      '  // infinitely thin geometry and is not needed with the solid geometry',
      '  // present in most scenes.',
      '  pos.xyz += normalize(cross(normal, cross(normal, light))) * 0.02;',
      '',
      '  coord = shadowMapMatrix * pos;',
      '  gl_Position = vec4(offsetCoord * 2.0 - 1.0, 0.0, 1.0);',
      '}',
    ].join('\n'), [
      'uniform float sampleCount;',
      'uniform sampler2D depthMap;',
      'uniform vec3 light;',
      'varying vec4 coord;',
      'varying vec3 normal;',
      '',
      'void main() {',
      '  // Run shadow test',
      '  const float bias = -0.0025;',
      '  float depth = texture2D(depthMap, coord.xy / coord.w * 0.5 + 0.5).r;',
      '  float shadow = (bias + coord.z / coord.w * 0.5 + 0.5 - depth > 0.0) ? 1.0 : 0.0;',
      '',
      '  // Points on polygons facing away from the light are always in shadow',
      '  float color = dot(normal, light) > 0.0 ? 1.0 - shadow : 0.0;',
      '  gl_FragColor = vec4(vec3(color), 1.0 / (1.0 + sampleCount));',
      '}',
    ].join('\n'));

    function QuadMesh(numQuads, texelsPerSide) {
      this.size = Math.ceil(Math.sqrt(numQuads));
      this.texelsPerSide = texelsPerSide;
      this.mesh = new GL.Mesh({ normals: true, coords: true });
      this.index = 0;
      this.lightmapTexture = null;
      this.bounds = null;
      this.sampleCount = 0;

      // Also need values offset by 0.5 texels to avoid seams between lightmap cells
      this.mesh.addVertexBuffer('offsetCoords', 'offsetCoord');
      this.mesh.addVertexBuffer('offsetPositions', 'offsetPosition');
    }

    // Add a quad given its four vertices and allocate space for it in the lightmap
    QuadMesh.prototype.addQuad = function(a, b, c, d) {
      var half = 0.5 / this.texelsPerSide;

      // Add vertices
      this.mesh.vertices.push(a.toArray());
      this.mesh.vertices.push(b.toArray());
      this.mesh.vertices.push(c.toArray());
      this.mesh.vertices.push(d.toArray());

      // Add normal
      var normal = b.subtract(a).cross(c.subtract(a)).unit().toArray();
      this.mesh.normals.push(normal);
      this.mesh.normals.push(normal);
      this.mesh.normals.push(normal);
      this.mesh.normals.push(normal);

      // Add fake positions
      function lerp(x, y) {
        return a.multiply((1-x)*(1-y)).add(b.multiply(x*(1-y)))
          .add(c.multiply((1-x)*y)).add(d.multiply(x*y)).toArray();
      }
      this.mesh.offsetPositions.push(lerp(-half, -half));
      this.mesh.offsetPositions.push(lerp(1 + half, -half));
      this.mesh.offsetPositions.push(lerp(-half, 1 + half));
      this.mesh.offsetPositions.push(lerp(1 + half, 1 + half));

      // Compute location of texture cell
      var i = this.index++;
      var s = i % this.size;
      var t = (i - s) / this.size;

      // Coordinates that are in the center of border texels (to avoid leaking)
      var s0 = (s + half) / this.size;
      var t0 = (t + half) / this.size;
      var s1 = (s + 1 - half) / this.size;
      var t1 = (t + 1 - half) / this.size;
      this.mesh.coords.push([s0, t0]);
      this.mesh.coords.push([s1, t0]);
      this.mesh.coords.push([s0, t1]);
      this.mesh.coords.push([s1, t1]);

      // Coordinates that are on the edge of border texels (to avoid cracks when rendering)
      var rs0 = s / this.size;
      var rt0 = t / this.size;
      var rs1 = (s + 1) / this.size;
      var rt1 = (t + 1) / this.size;
      this.mesh.offsetCoords.push([rs0, rt0]);
      this.mesh.offsetCoords.push([rs1, rt0]);
      this.mesh.offsetCoords.push([rs0, rt1]);
      this.mesh.offsetCoords.push([rs1, rt1]);

      // A quad is two triangles
      this.mesh.triangles.push([4 * i, 4 * i + 1, 4 * i + 3]);
      this.mesh.triangles.push([4 * i, 4 * i + 3, 4 * i + 2]);
    };

    QuadMesh.prototype.addDoubleQuad = function(a, b, c, d) {
      // Need a separate lightmap for each side of the quad
      this.addQuad(a, b, c, d);
      this.addQuad(a, c, b, d);
    };

    QuadMesh.prototype.compile = function() {
      // Finalize mesh
      this.mesh.compile();
      this.bounds = this.mesh.getBoundingSphere();

      // Create textures
      var size = this.size * this.texelsPerSide;
      this.lightmapTexture = null;

      // Try to get a floating point texture that can be rendered to
      if (GL.Texture.canUseFloatingPointTextures() && GL.Texture.canUseFloatingPointLinearFiltering()) {
        this.lightmapTexture = new GL.Texture(size, size, { format: gl.RED, type: gl.FLOAT });
        if (!this.lightmapTexture.canDrawTo()) {
          this.lightmapTexture = null;
        }
      }
      if (!this.lightmapTexture && GL.Texture.canUseHalfFloatingPointTextures() && GL.Texture.canUseHalfFloatingPointLinearFiltering()) {
        this.lightmapTexture = new GL.Texture(size, size, { format: gl.RED, type: gl.HALF_FLOAT_OES });
        if (!this.lightmapTexture.canDrawTo()) {
          this.lightmapTexture = null;
        }
      }
      if (!this.lightmapTexture) {
        this.lightmapTexture = new GL.Texture(size, size, { format: gl.RED });
      }
    };

    QuadMesh.prototype.drawShadow = function(dir) {
      // Construct a camera looking from the light toward the object
      var r = this.bounds.radius, c = this.bounds.center;
      gl.matrixMode(gl.PROJECTION);
      gl.pushMatrix();
      gl.loadIdentity();
      gl.ortho(-r, r, -r, r, -r, r);
      gl.matrixMode(gl.MODELVIEW);
      gl.pushMatrix();
      gl.loadIdentity();
      var at = c.subtract(dir);
      var useY = (dir.max() != dir.y);
      var up = new GL.Vector(!useY, useY, 0).cross(dir);
      gl.lookAt(c.x, c.y, c.z, at.x, at.y, at.z, up.x, up.y, up.z);

      // Render the object viewed from the light using a shader that returns the fragment depth
      var mesh = this.mesh;
      var shadowMapMatrix = gl.projectionMatrix.multiply(gl.modelviewMatrix);
      depthMap.drawTo(function() {
        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        depthShader.draw(mesh);
      });

      // Reset the transform
      gl.matrixMode(gl.PROJECTION);
      gl.popMatrix();
      gl.matrixMode(gl.MODELVIEW);
      gl.popMatrix();

      // Run the shadow test for each texel in the lightmap and
      // accumulate that onto the existing lightmap contents
      var accumulate = document.getElementById('accumulate');
      var sampleCount = accumulate.checked ? this.sampleCount++ : this.sampleCount = 0;
      depthMap.bind();
      this.lightmapTexture.drawTo(function() {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        shadowTestShader.uniforms({
          shadowMapMatrix: shadowMapMatrix,
          sampleCount: sampleCount,
          light: dir
        }).draw(mesh);
        gl.disable(gl.BLEND);
      });
      depthMap.unbind();
    };

    // Make a mesh of quads
    var numArcQuads = 32;
    var groundTilesPerSide = 5;
    var quadMesh = new QuadMesh((numArcQuads + groundTilesPerSide * groundTilesPerSide) * 2, 64);

    // Arc of randomly oriented quads
    for (var i = 0; i < numArcQuads; i++) {
      var r = 0.3;
      var center = GL.Vector.fromAngles(0, ((i + Math.random()) / numArcQuads) * Math.PI);
      var a = GL.Vector.randomDirection().multiply(r);
      var b = GL.Vector.randomDirection().cross(a).unit().multiply(r);
      quadMesh.addDoubleQuad(
        center.subtract(a).subtract(b),
        center.subtract(a).add(b),
        center.add(a).subtract(b),
        center.add(a).add(b)
      );
    }

    // Plane of quads
    for (var x = 0; x < groundTilesPerSide; x++) {
      for (var z = 0; z < groundTilesPerSide; z++) {
        var dx = x - groundTilesPerSide / 2;
        var dz = z - groundTilesPerSide / 2;
        quadMesh.addDoubleQuad(
          new GL.Vector(dx, 0, dz),
          new GL.Vector(dx, 0, dz + 1),
          new GL.Vector(dx + 1, 0, dz),
          new GL.Vector(dx + 1, 0, dz + 1)
        );
      }
    }
    quadMesh.compile();

    // The mesh will be drawn with texture mapping
    var mesh = quadMesh.mesh;
    var textureMappedShader = new GL.Shader([
      'varying vec2 coord;',
      'void main() {',
      '  coord = gl_TexCoord.st;',
      '  gl_Position = ftransform();',
      '}',
    ].join('\n'), [
      'uniform sampler2D texture;',
      'varying vec2 coord;',
      'void main() {',
      '  gl_FragColor = vec4(texture2D(texture, coord).rgb, 1.0);',
      '}',
    ].join('\n'));

    gl.onupdate = function(seconds) {
      angleY += seconds * 5;
    };

    gl.onmousemove = function(e) {
      if (e.dragging) {
        angleY += e.deltaX;
        angleX += e.deltaY;
        angleX = Math.max(-90, Math.min(90, angleX));
      }
    };

    var flip = false;

    gl.ondraw = function() {
      // Alternate between a shadow from a random point on the sky hemisphere
      // and a random point near the light (creates a soft shadow)
      var dir = GL.Vector.randomDirection();
      flip = !flip;
      if (flip) dir = new GL.Vector(1, 1, 1).add(dir.multiply(0.3 * Math.sqrt(Math.random()))).unit();
      quadMesh.drawShadow(dir.y < 0 ? dir.negative() : dir);

      // Draw the mesh with the ambient occlusion so far
      gl.clearColor(0.9, 0.9, 0.9, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.loadIdentity();
      gl.translate(0, 0, -3);
      gl.rotate(angleX, 1, 0, 0);
      gl.rotate(angleY, 0, 1, 0);
      gl.translate(0, -0.25, 0);
      quadMesh.lightmapTexture.bind();
      textureMappedShader.draw(mesh);
    };

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.animate();
  })();
