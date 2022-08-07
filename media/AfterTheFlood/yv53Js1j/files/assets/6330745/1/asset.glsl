uniform mat4 matrix_invModel;
uniform vec3 view_position;
varying vec3 vPositionL, vPosCam;

mat4 getModelMatrix() {
    return matrix_model;
}

vec4 getPosition() {
    dModelMatrix = getModelMatrix();
    
    vPositionL = vertex_position;
    vPosCam = (matrix_invModel * vec4(view_position, 1.0)).xyz; // probably faster than in JS...
    
    vec4 posW = dModelMatrix * vec4(vertex_position, 1.0);
    dPositionW = posW.xyz;
    return matrix_viewProjection * posW;
}

vec3 getWorldPosition() {
    return dPositionW;
}

