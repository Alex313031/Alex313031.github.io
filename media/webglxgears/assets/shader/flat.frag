precision mediump float;

varying vec3 v_fragColor;


void main () {
  // Relay the fragment color calculated from vertex shader.
  gl_FragColor = vec4(v_fragColor, 1.0);
}
