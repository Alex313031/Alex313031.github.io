attribute vec2 vertex_position;

varying vec3 vViewDir;

void main(void)
{
    gl_Position = vec4(vertex_position, 0.5, 1.0);
    vViewDir = vec3(vertex_position.xy, 0);
}

