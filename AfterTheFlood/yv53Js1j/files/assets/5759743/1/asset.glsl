attribute vec3 vertex_position;

uniform mat4 matrix_view;
uniform mat4 matrix_projection;

varying vec3 vViewDir;

vec2 rotate(vec2 quadXY, float pRotation) {
    float c = cos(pRotation);
    float s = sin(pRotation);
    mat2 m = mat2(c, -s, s, c);
    return m * quadXY;
}

void main(void)
{
    mat4 view = matrix_view;
    view[3][0] = view[3][1] = view[3][2] = 0.0;
    gl_Position = matrix_projection * view * vec4(vertex_position, 1.0);

    // Force skybox to far Z, regardless of the clip planes on the camera
    // Subtract a tiny fudge factor to ensure floating point errors don't
    // still push pixels beyond far Z. See:
    // http://www.opengl.org/discussion_boards/showthread.php/171867-skybox-problem

    gl_Position.z = gl_Position.w - 0.000005;
    vViewDir = vertex_position;
    //vViewDir.x *= -1.0;
    
    vViewDir.xz = rotate(vViewDir.xz, 0.4);
}


