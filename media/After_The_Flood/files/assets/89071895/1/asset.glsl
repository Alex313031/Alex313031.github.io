//uniform sampler2D clothNormal;

vec3 getNormal() {
    dNormalMatrix = mat3(dModelMatrix[0].xyz, dModelMatrix[1].xyz, dModelMatrix[2].xyz);
    vec3 normal = normalize(dNormalMatrix * vertex_normal);
    
    vec2 uv = vertex_texCoord1;
    if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) {
        vec3 texNormal = texture2D(clothNormal, uv).xyz;
        bool inside = vertex_color.g < 0.5;//vertex_texCoord0.x > 1.0;
        texNormal = inside? -texNormal : texNormal;
        normal = mix(texNormal, normal, uv.y*uv.y);
    }
    
    return normal;
}

