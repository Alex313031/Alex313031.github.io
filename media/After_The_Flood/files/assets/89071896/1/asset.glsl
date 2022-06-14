uniform sampler2D clothWorldPos, clothNormal;

mat4 getModelMatrix() {
    return getBoneMatrix(vertex_boneIndices.x) * vertex_boneWeights.x +
           getBoneMatrix(vertex_boneIndices.y) * vertex_boneWeights.y +
           getBoneMatrix(vertex_boneIndices.z) * vertex_boneWeights.z +
           getBoneMatrix(vertex_boneIndices.w) * vertex_boneWeights.w;
}

vec4 getPosition() {
    dModelMatrix = getModelMatrix();
    vec4 posW = dModelMatrix * vec4(vertex_position, 1.0);
    posW.xyz += skinPosOffset;
    
    vec2 uv = vertex_texCoord1;
    if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 0.9) {
        vec3 clothPos = texture2D(clothWorldPos, uv).xyz;
            clothPos += skinPosOffset;
        vec3 texNormal = texture2D(clothNormal, uv).xyz;
        bool inside = vertex_color.g < 0.5;//vertex_texCoord0.x > 1.0;
        posW.xyz = clothPos - texNormal * (inside?0.01:0.0);
    }
    vUv1 = uv;
    
    dPositionW = posW.xyz;
    return matrix_viewProjection * posW;
}

vec3 getWorldPosition() {
    return dPositionW;
}

