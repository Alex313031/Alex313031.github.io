uniform vec3 view_position;
uniform float material_opacity;
varying float vFade;

mat4 getModelMatrix() {
    return matrix_model;
}

vec4 getPosition() {
    dModelMatrix = getModelMatrix();
    vec4 posW = dModelMatrix * vec4(vertex_position, 1.0);
    

    mat4 worldMatrix = matrix_model;//transpose(matrix_model);
    
    vec3 center = vec3(worldMatrix[3][0], worldMatrix[3][1], worldMatrix[3][2]);
    vec3 up = normalize(vec3(worldMatrix[2][0], worldMatrix[2][1], worldMatrix[2][2]));
    vec3 lookDir = normalize(view_position - center);
    vec3 lookY = lookDir;
    vec3 lookX = normalize(cross(up, lookY));

    float xscale = length(vec3(worldMatrix[0][0], worldMatrix[0][1], worldMatrix[0][2]));
    lookX *= xscale;
    
    mat3 rotMat = mat3(worldMatrix);
    rotMat[0][0] = lookX.x;
    rotMat[0][1] = lookX.y;
    rotMat[0][2] = lookX.z;

    rotMat[1][0] = lookY.x;
    rotMat[1][1] = lookY.y;
    rotMat[1][2] = lookY.z;

    vec3 localPos = rotMat * vertex_position;
    posW.xyz = localPos + center;

    vec3 cam2Vertex = view_position - posW.xyz;
    vec3 viewDir = normalize(cam2Vertex);
    vFade = abs(dot(up, -viewDir));
    vFade = 1.0 - vFade;
    vFade *= vFade * material_opacity;
    
    dPositionW = posW.xyz;
    return matrix_viewProjection * posW;
}

vec3 getWorldPosition() {
    return dPositionW;
}

