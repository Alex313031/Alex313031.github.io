varying vec2 vFog;
uniform mat4 matrix_projection;

mat4 getModelMatrix() {
    return matrix_model;
}

vec4 getPosition() {
    dModelMatrix = getModelMatrix();
    vec4 posW = dModelMatrix * vec4(vertex_position, 1.0);
    dPositionW = posW.xyz;
    vec4 result = matrix_viewProjection * posW;
    
    mat4 proj = (matrix_projection);
    float bias = 0.0;
    vec4 uV = vec4(
        -proj[2].x / (proj[0].x * proj[2].w),
        -proj[2].y / (proj[1].y * proj[2].w),
        0.0,
        (proj[2].z + bias) / proj[2].w
    );
    vFog = vec2(
        dot(result, uV),
        result.w        
    );
    
    return result;
}

vec3 getWorldPosition() {
    return dPositionW;
}

