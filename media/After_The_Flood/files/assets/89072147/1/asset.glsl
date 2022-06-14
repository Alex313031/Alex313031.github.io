varying vec3 vPositionW;
varying vec3 vNormalW;
varying vec2 vUv0;//, vUV0_1;
uniform float globalTime;
uniform sampler2D mirrorTex, curlTex, texture_normalMap, waterNormalTex2, texture_specularMap;
uniform float distortionNearFade, mirrorTransition;
uniform vec3 view_position;
uniform vec4 uScreenSize;
uniform float mirrorDepthOffset, mirrorDensity;
uniform mat3 matrix_view3;
uniform samplerCube waterSkyTexture;
//uniform vec4 texture_normalMapTransform;

float saturate(float f) {
    return clamp(f,0.0,1.0);
}

#ifdef SKY
uniform sampler2D skyTex1;
uniform sampler2D skyTex2;
uniform float skyBlend;
uniform samplerCube skyboxHigh;
vec3 addReflection(vec3 viewDir) {
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
    return tex1;
}
#endif

mat3 dTBN;
vec3 dVertexNormalW;

// http://www.thetenthplanet.de/archives/1180
void getTBN() {
    vec2 uv = vUv0;

    // get edge vectors of the pixel triangle
    vec3 dp1 = dFdx( vPositionW );
    vec3 dp2 = dFdy( vPositionW );
    vec2 duv1 = dFdx( uv );
    vec2 duv2 = dFdy( uv );

    // solve the linear system
    vec3 dp2perp = cross( dp2, dVertexNormalW );
    vec3 dp1perp = cross( dVertexNormalW, dp1 );
    vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;
    vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;

    // construct a scale-invariant frame
    float invmax = 1.0 / sqrt( max( dot(T,T), dot(B,B) ) );
    dTBN = mat3( T * invmax, B * invmax, dVertexNormalW );
}

void main() {
    
    vec3 viewDir = normalize(vPositionW - view_position);
    dVertexNormalW = vNormalW;
    getTBN();
    vec2 uv = vUv0;//vUV0_1;// * 4.0;
    
    vec2 SSAA[1];//3];
    SSAA[0] = vec2(0.0);
    //SSAA[1] = vec2(-0.5, -0.866);
    //SSAA[2] = vec2(-0.5, 0.866);
    const int SAMPLES = 1;//3;
    vec2 dx = dFdx(uv);
    vec2 dy = dFdy(uv);
    
    vec4 refl = vec4(0.0);
    
    /*float fresnel1 = 1.0 - max(dot(normalize(vNormalW), -viewDir), 0.0);
    float fresnel2 = fresnel1 * fresnel1;
    fresnel1 *= fresnel2 * fresnel2;
    float specVal = 0.3;
    float spec1 = specVal + (1.0 - specVal) * fresnel1;
    refl.a = spec1;*/
    
    
    /*vec2 curl = texture2D(curlTex, vUv0/8.0).xy*2.0-vec2(1.0);
    curl *= 0.01;
    
    //vec2 curl2 = textureGrad(curlTex, floor(vUV0_1)/texture_normalMapTransform.xy, dx, dy).xy*2.0-vec2(1.0);
    //curl += curl2 * 0.05;//* 0.01;
    
    vec2 curl2 = textureGrad(curlTex, floor(vUv0)/8.0, dx, dy).xy*2.0-vec2(1.0);
    curl += curl2 * 0.05;//* 0.01;*/
    
    vec2 curl = vec2(0.0);
    
    //curl += texture2D(waterNormalTex2, vUv0).xy*2.0-1.0;

    float dist = distance(view_position, vPositionW);
    float nearDist = 3.0;
    float maxDist = 8.0;
    
    vec2 screenCoord = gl_FragCoord.xy * uScreenSize.zw;
    float moffset = mirrorDepthOffset * 0.1;
    vec3 viewDirS = matrix_view3 * vNormalW;
    screenCoord = screenCoord * 2.0 - vec2(1.0);
    screenCoord = screenCoord * (moffset+1.0);
    screenCoord = screenCoord * 0.5 + vec2(0.5);
    screenCoord.xy += viewDirS.xy * moffset;
    
    float density;
    bool specEffect = true;
    if (mirrorDensity < 0.0) {
        density = -mirrorDensity;
        specEffect = false;
    } else {
        density = mirrorDensity;
    }
    
    vec3 viewDirT = viewDir * dTBN;
    if (dist < maxDist && specEffect) {
        float intensity = 0.04;//0.09;
        vec3 viewDirDistortion = normalize(vPositionW - view_position + vec3(0,1,0));
        vec2 p = viewDirT.xy * 2.0;//vUv0.xy*2.0-1.0;
        float cLength = length(p);
        curl += (p/cLength) * cos(cLength*15.0-globalTime*4.0) * intensity * (1.0 - dist/maxDist) * (sin(globalTime)*0.5+0.5) * distortionNearFade;//saturate(dist - nearDist);
    }
    float specVal = specEffect? mix(0.5, 0.3, saturate((dist-nearDist)/3.0)) : 0.3;
    specVal = mix(specVal, 1.0, mirrorTransition);
    
    for(int i=0; i<SAMPLES; i++) {
        vec2 tc = uv;// + SSAA[i].x * dx + SSAA[i].y * dy;
        vec3 normal = vNormalW;//vec3(0,0,1);//texture2D(texture_normalMap, tc).xyz*2.0-vec3(1.0);
        
#ifdef SIMPLE
        vec3 reflDir = reflect(normal, -viewDir);
        #ifdef SKY
        refl.rgb += addReflection(normalize(reflDir * vec3(1,1,-1)));
        #else
        refl.rgb += decodeRGBM(textureCube(waterSkyTexture, reflDir * vec3(-1,1,1))) * 3.0;
        #endif
#else
        refl.rgb += texture2D(mirrorTex, screenCoord + normal.xy * mix(0.1, 0.0, mirrorTransition) + curl).rgb;
#endif
        
        //normal = dTBN * normal;
        float fresnel1 = 1.0 - max(dot(normal, -viewDir), 0.0);
        float fresnel2 = fresnel1 * fresnel1;
        fresnel1 *= fresnel2 * fresnel2;
        //    fresnel1 = fresnel2;
        float spec1 = specVal + (1.0 - specVal) * fresnel1;
        refl.a += spec1;
    }

    refl.rgba /= float(SAMPLES);
    refl.rgb = mix(refl.rgb*0.9, refl.rgb, mirrorTransition);
    
    
    float mask = 1.0;//texture2D(texture_specularMap, vUv0).g;
    mask = mix(mask, 1.0, mirrorTransition);
    refl = mix(vec4(0,0,0,1), refl, mask);
    
    if (mirrorDepthOffset > 0.5) {
        refl.rgb *= 0.2;
        refl.a = refl.a + 0.5;
    }
    
    refl.a *= density;
    refl.a = saturate(refl.a);
    
    //refl = vec4(curl2, 0, 1);
    
#ifdef SIMPLE
    //refl = vec4(decodeRGBM(textureCube(waterSkyTexture, reflect(vNormalW, -viewDir) * vec3(-1,1,1))) * 3.0, 1.0);
#endif
    
    gl_FragColor = refl;//vec4(viewDirS*0.5+0.5, 1.0);//refl;//vec4(refl.aaa,1.0);
}

