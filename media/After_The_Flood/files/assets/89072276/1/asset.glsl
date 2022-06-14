varying vec2 vUv0;
uniform sampler2D clothWorldPos;

vec3 trinormal(vec3 v0, vec3 v1, vec3 v2) {
	vec3 p = v0 - v1;
	vec3 q = v1 - v2;
	return normalize(cross(p,q));
}

void main() {
    vec2 tiles = vec2(22,9);
    vec2 offset = vec2(1.0) / tiles;
    vec2 uv = vUv0;
    //uv = (floor(uv * tiles)+0.5) / tiles;
    vec3 normal = vec3(0.0);
    
    vec3 pos0 = texture2D(clothWorldPos, uv).xyz;
    vec4 weights = vec4(0.0);
    
    vec2 nUv = uv - vec2(offset.x,0);
    vec3 posNx = vec3(0.0);
    if (nUv.x > 0.0 && sign(uv.x-0.5)==sign(nUv.x-0.5)) {
        posNx = texture2D(clothWorldPos, nUv).xyz;
        weights.x = 1.0;
    }

    nUv = uv + vec2(offset.x,0);
    vec3 posPx = vec3(0.0);
    if (nUv.x < 1.0 && sign(uv.x-0.5)==sign(nUv.x-0.5)) {
        posPx = texture2D(clothWorldPos, nUv).xyz;
        weights.y = 1.0;
    }

    nUv = uv - vec2(0,offset.y);
    vec3 posNy = vec3(0.0);
    if (nUv.y > 0.0) {
        posNy = texture2D(clothWorldPos, nUv).xyz;
        weights.z = 1.0;
    }

    nUv = uv + vec2(0,offset.y);
    vec3 posPy = vec3(0.0);
    if (nUv.y < 1.0) {
        posPy = texture2D(clothWorldPos, nUv).xyz;
        weights.w = 1.0;
    }

    //normal += trinormal(pos0, posNx, posPy) * weights.x * weights.w;
    //normal += trinormal(pos0, posPy, posPx) * weights.w * weights.y;
    //normal += trinormal(pos0, posPx, posNy) * weights.y * weights.z;
    //normal += trinormal(pos0, posNy, posNx) * weights.z * weights.x;
    
    normal += trinormal(posNx, pos0, posPy) * weights.x * weights.w;
    normal += trinormal(posPy, pos0, posPx) * weights.w * weights.y;
    normal += trinormal(posPx, pos0, posNy) * weights.y * weights.z;
    normal += trinormal(posNy, pos0, posNx) * weights.z * weights.x;
    
    //normal.y = -normal.y;
    normal = normalize(normal);
    
    gl_FragColor = vec4(normal, 1);
}

