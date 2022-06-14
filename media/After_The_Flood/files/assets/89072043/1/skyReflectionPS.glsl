#ifndef SKY
#define SKY
uniform sampler2D skyTex1;
uniform sampler2D skyTex2;
uniform float skyBlend;
#endif

uniform samplerCube skyboxHigh;
uniform samplerCube texture_prefilteredCubeMap128;

#ifndef PMREM4
#define PMREM4
uniform samplerCube texture_prefilteredCubeMap4;
#endif

uniform float material_reflectivity;
void addReflection() {
    vec3 viewDir = dReflDirW;
    vec3 tex1;

    if (viewDir.y >= 0.0) {
        float falloff = clamp(viewDir.y, 0.0, 1.0);
        vec3 wind = vec3(1,0,1);
        float morphMoveLength = 0.075 * 1.0; // 256x256
        float speed = 1.075;
        speed = mix(2.0, 0.9, falloff) * 0.25 * 0.25;
        morphMoveLength *= speed;    

        vec3 vec1 = viewDir + wind * -skyBlend * morphMoveLength * falloff;
        vec2 uv1 = vec1.xz / dot(vec3(1.0), abs(vec1));
        uv1 = vec2(uv1.x-uv1.y, uv1.x+uv1.y);
        uv1 = uv1 * 0.5 + vec2(0.5);

        vec3 v2 = viewDir + wind * (1.0-skyBlend) * morphMoveLength * falloff;
        vec2 uv2 = v2.xz / dot(vec3(1.0), abs(v2));
        uv2 = vec2(uv2.x-uv2.y, uv2.x+uv2.y);
        uv2 = uv2 * 0.5 + vec2(0.5);

        tex1 = decodeRGBM(texture2D(skyTex1, uv1));
        vec3 tex2 = decodeRGBM(texture2D(skyTex2, uv2));

        tex1 = mix(tex1, tex2, skyBlend);

        //tex1 = decodeRGBM(textureCube(texture_prefilteredCubeMap128, viewDir));
        //tex1 /= 3.0;
    } else {
        tex1 = decodeRGBM(textureCube(skyboxHigh, viewDir * vec3(-1,1,1)));
    }

    dReflection += vec4(tex1, material_reflectivity);
}

