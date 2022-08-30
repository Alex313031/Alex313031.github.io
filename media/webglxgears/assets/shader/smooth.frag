precision mediump float;

// Light direction in unit vector
// The oringinal bug in 'glxgears' where GL_LIGHT0 follows view rotation.
uniform vec3 u_lightDir_us;
uniform vec3 u_ambient; // Ambient color
uniform vec3 u_diffuse; // Diffuse color
uniform vec3 u_ambientIntensity; // GL_LIGHT_MODEL_AMBIENT equivalent

varying vec3 v_normal_cs; // Normal vector in camera space
varying vec3 v_pos_cs; // Position vector in camera space


void main () {
  // Calculate theta in camera space.
  float theta = max(dot(-u_lightDir_us, normalize(v_pos_cs - v_normal_cs)), 0.0);
  gl_FragColor = vec4(u_ambientIntensity * u_ambient + u_diffuse * theta, 1.0);
}
