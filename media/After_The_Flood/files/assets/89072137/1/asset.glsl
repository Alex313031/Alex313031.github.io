varying vec2 vUv0;
uniform sampler2D clothWorldPos, clothPrevWorldPos, noiseTex, clothBoneIndex, clothBoneWeight, clothSkinMatrices, clothLocalPos, clothNormal, curlTex;
uniform vec2 clothSkinPoseMapSize;
uniform vec3 clothSkinOffset, clothSkinOffsetPrev;
uniform float globalTime, deltaTime;
uniform vec3 charRight;

/*#define MOD3 vec3(.16532,.17369,.15787)
float Hash(vec3 p)
{
    p  = fract(p * MOD3);
    p += dot(p.xyz, p.yzx + 19.19);
    return fract(p.x * p.y * p.z);
}
float Noise( in vec3 x )
{
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f*f*(3.0-2.0*f);

    vec2 uv = (p.xy+vec2(37.0,17.0)*p.z) + f.xy;
    vec2 rg = texture2D( noiseTex, (uv+ 0.5)/256.0, -100.0 ).yx;
    return mix( rg.x, rg.y, f.z );
}*/

mat4 getBoneMatrix(const in float i)
{
    float j = i * 4.0;
    float x = mod(j, float(clothSkinPoseMapSize.x));
    float y = floor(j / float(clothSkinPoseMapSize.x));

    float dx = 1.0 / float(clothSkinPoseMapSize.x);
    float dy = 1.0 / float(clothSkinPoseMapSize.y);

    y = dy * (y + 0.5);

    vec4 v1 = texture2D(clothSkinMatrices, vec2(dx * (x + 0.5), y));
    vec4 v2 = texture2D(clothSkinMatrices, vec2(dx * (x + 1.5), y));
    vec4 v3 = texture2D(clothSkinMatrices, vec2(dx * (x + 2.5), y));
    vec4 v4 = texture2D(clothSkinMatrices, vec2(dx * (x + 3.5), y));

    mat4 bone = mat4(v1, v2, v3, v4);

    return bone;
}

void main() {
    vec4 c = texture2D(clothWorldPos, vUv0);
    
    if (vUv0.y < 0.9) {
        vec3 prevC = texture2D(clothPrevWorldPos, vUv0).xyz;
        
        vec3 force = vec3(0.0);
        
        vec3 windDir = vec3(-1, 0, 0);
        //vec3 windDir = vec3(0, 0, 1);
        float windMaskBottom = clamp(1.0 - vUv0.y, 0.0, 1.0);
        float windMaskBottomSmooth = clamp(windMaskBottom*windMaskBottom*4.0, 0.0, 1.0);
        windMaskBottom = pow(windMaskBottom, 8.0) * 4.0;
        float windMaskLeftEdge = (1.0 - clamp(vUv0.x / 0.06, 0.0, 1.0)) * 8.0 * windMaskBottomSmooth;
        float windMaskRightEdge = clamp((vUv0.x - 0.8)/0.2, 0.0, 1.0) * 2.0 * windMaskBottomSmooth;
        float windOcclusionMask = abs(vUv0.x - 0.25);
        windOcclusionMask += abs(vUv0.x - 0.75);
        windOcclusionMask = clamp(windOcclusionMask * 2.0, 0.0, 1.0);
        windOcclusionMask *= windMaskBottomSmooth;
        vec3 normal = texture2D(clothNormal, vUv0).xyz;
        
        // based on right wind
        //bool isRight = vUv0.x >= 0.5;
        //float windMask = isRight? (clamp(-normal.x,0.0,1.0) ) : clamp(-normal.x,0.0,1.0);
        float windMask = mix(clamp(dot(windDir,normal),0.0,1.0), dot(abs(windDir), abs(normal)), 0.5) * windOcclusionMask;
        if (sign(dot(windDir, charRight))==sign(vUv0.x-0.5)) windMask *= 0.5;
        
        //force.x -= deltaTime * 800.0 * (sin(globalTime*8.0)*0.5+0.5)*2.0 * windMask;//* Noise(vec3(c.x + globalTime*8.0, 0, 0));
        //force.x -= deltaTime * windMask * 6000.0 * (sin(globalTime*8.0)*0.5+0.5);
        
        //vec2 tiles = vec2(22,9);
        //float index = gl_FragCoord.y * tiles.y + gl_FragCoord.x;
        vec3 turbulence = texture2D(curlTex, vec2(globalTime,globalTime*0.5)*0.1).xyz*2.0 - vec3(1.0);
        force += (windDir*0.5 + turbulence*2.0) * deltaTime * windMask * 6000.0;
        force.y -= deltaTime * 400.0*10.0;

        //apply some skin also?
        vec4 c2 = texture2D(clothLocalPos, vUv0);
        vec4 indices = texture2D(clothBoneIndex, vUv0) * 255.0;
        vec4 weights = texture2D(clothBoneWeight, vUv0);
        mat4 transform = 
               getBoneMatrix(indices.x) * weights.x +
               getBoneMatrix(indices.y) * weights.y +
               getBoneMatrix(indices.z) * weights.z +
               getBoneMatrix(indices.w) * weights.w;
        c2.xyz = (transform * vec4(c2.xyz, 1.0)).xyz;
        //c2.xyz += clothSkinOffset;
        c.xyz = mix(c.xyz, c2.xyz, 0.01);
        
            force += (clothSkinOffsetPrev - clothSkinOffset) * 500.0;
        
        c.xyz += c.xyz - prevC + force * deltaTime * deltaTime;
    } else {
        c = texture2D(clothLocalPos, vUv0);
        vec4 indices = texture2D(clothBoneIndex, vUv0) * 255.0;
        vec4 weights = texture2D(clothBoneWeight, vUv0);
        mat4 transform = 
               getBoneMatrix(indices.x) * weights.x +
               getBoneMatrix(indices.y) * weights.y +
               getBoneMatrix(indices.z) * weights.z +
               getBoneMatrix(indices.w) * weights.w;
        c.xyz = (transform * vec4(c.xyz, 1.0)).xyz;
        //c.xyz += clothSkinOffset;
    }
    
    gl_FragColor = c;
}

