uniform mat4 u_tf; // Clip transformation
uniform mat4 u_view; // View transformation
uniform mat4 u_mv; // Camera space transformation

// Light direction in unit vector
// The oringinal bug in 'glxgears' where GL_LIGHT0 follows view rotation.
uniform vec3 u_lightDir_us;
uniform vec3 u_ambient; // Ambient color
uniform vec3 u_diffuse; // Diffuse color
uniform vec3 u_ambientIntensity; // GL_LIGHT_MODEL_AMBIENT equivalent

attribute vec3 a_pos; // Position vector in model space
attribute vec3 a_normal; // Normal vector in model space

varying vec3 v_fragColor; // Fragment Color to forward (Gouraud shading)


void main () {
  vec4 pos_ms = vec4(a_pos, 1.0);
  // Transform position and normal to camera space.
  vec3 pos_cs = (u_mv * pos_ms).xyz;
  vec3 normal_cs = (u_mv * vec4(a_normal, 1.0)).xyz;

  // Calculate theta in camera space.
  float theta = max(dot(-u_lightDir_us, normalize((pos_cs - normal_cs).xyz)), 0.0);

  v_fragColor = u_ambientIntensity * u_ambient + u_diffuse * theta;
  gl_Position = u_tf * pos_ms;
}
