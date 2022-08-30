uniform mat4 u_tf; // Clip transformation
uniform mat4 u_view; // View transformation
uniform mat4 u_mv; // Camera space transformation

attribute vec3 a_pos; // Position vector in model space
attribute vec3 a_normal; // Normal vector in model space

varying vec3 v_normal_cs; // Normal vector in camera space
varying vec3 v_pos_cs; // Position vector in camera space


void main () {
  vec4 pos_ms = vec4(a_pos, 1.0);

  // Transform position and normal to camera space.
  v_pos_cs = (u_mv * pos_ms).xyz;
  v_normal_cs = (u_mv * vec4(a_normal, 1.0)).xyz;
  
  gl_Position = u_tf * pos_ms;
}
