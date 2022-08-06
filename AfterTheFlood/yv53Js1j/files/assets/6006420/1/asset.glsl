#define simRadius 16.0

varying vec4 vUv;
varying vec3 vPositionW, vPositionL, vNormalW;
varying vec4 vRotation;
varying float vHeight;
varying vec2 vAnimUv;

uniform sampler2D diffuseMap, opacityMap, normalMap, topMap, heightMap;//, topMapBlur;
uniform samplerCube skyboxLowCurrent;
uniform vec4 uScreenSize;
uniform vec3 vortexPos;
uniform vec3 view_position;
uniform float globalTime;

vec3 colorShadow = pow(vec3(64, 78, 100) / 255.0, vec3(2.2));
vec3 colorSun = pow(vec3(246, 234.0 * 0.97, 206.0 * 0.97) / 255.0, vec3(2.2))  * 0.2;// * 8.0;

float saturate(float f) {
    return clamp(f, 0.0, 1.0);
}

float topLookup(vec2 uv) {
    vec4 t = texture2D(topMap, uv);
    return t.r - t.g;
}

vec3 decodeRGBM(vec4 rgbm) {
    vec3 color = (8.0 * rgbm.a) * rgbm.rgb;
    return color * color;
}

#ifdef LIGHT
uniform vec4 light_posRadius;
uniform vec4 light_directionInner, light_colorOuter;
vec3 dLightDirW, dLightDirNormW, dLightPosW;
float square(float x) {
    return x*x;
}
void getLightDirPoint(vec3 lightPosW) {
    dLightDirW = vPositionW - lightPosW;
    dLightDirNormW = normalize(dLightDirW);
    dLightPosW = lightPosW;
}
float getFalloffInvSquared(float lightRadius) {
    float sqrDist = dot(dLightDirW, dLightDirW);
    float falloff = 1.0 / (sqrDist + 1.0);
    float invRadius = 1.0 / lightRadius;

    falloff *= 16.0;
    falloff *= square( saturate( 1.0 - square( sqrDist * square(invRadius) ) ) );

    return falloff;
}
float getSpotEffect(vec3 lightSpotDirW, float lightInnerConeAngle, float lightOuterConeAngle) {
    float cosAngle = dot(dLightDirNormW, lightSpotDirW);
    return smoothstep(lightOuterConeAngle, lightInnerConeAngle, cosAngle);
}
#endif


#ifdef SHADOWEDLIGHT
uniform vec4 light_posRadius;
uniform vec4 light_directionInner, light_colorOuter;
uniform mat4 light_shadowMatrix;
#ifdef VSM
uniform sampler2D light_shadowMap;
#else
uniform highp sampler2DShadow light_shadowMap;
#endif

vec3 dLightDirW, dLightDirNormW, dLightPosW;
vec3 dShadowCoord;

float square(float x) {
    return x*x;
}
void getLightDirPoint(vec3 lightPosW) {
    dLightDirW = vPositionW - lightPosW;
    dLightDirNormW = normalize(dLightDirW);
    dLightPosW = lightPosW;
}
float getFalloffInvSquared(float lightRadius) {
    float sqrDist = dot(dLightDirW, dLightDirW);
    float falloff = 1.0 / (sqrDist + 1.0);
    float invRadius = 1.0 / lightRadius;

    falloff *= 16.0;
    falloff *= square( saturate( 1.0 - square( sqrDist * square(invRadius) ) ) );

    return falloff;
}
float getSpotEffect(vec3 lightSpotDirW, float lightInnerConeAngle, float lightOuterConeAngle) {
    float cosAngle = dot(dLightDirNormW, lightSpotDirW);
    return smoothstep(lightOuterConeAngle, lightInnerConeAngle, cosAngle);
}
void _getShadowCoordPersp(mat4 shadowMatrix, vec3 wPos) {
    vec4 projPos = shadowMatrix * vec4(wPos, 1.0);
    projPos.xy /= projPos.w;
    dShadowCoord.xy = projPos.xy;
    dShadowCoord.z = projPos.z / projPos.w;
    
    //float f = farPlane;
    //float n = f / 1000.0;

    //dShadowCoord.z = -((2.0*f*n)/(f-n)) / (dShadowCoord.z - (f+n)/(f-n)); // linearize
    //dShadowCoord.z *= invFarPlane;
    //dShadowCoord.z += getShadowBias(shadowParams.x, shadowParams.z) * 10.0;
    //dShadowCoord.z *= farPlane;
    //dShadowCoord.z = (f+n)/(f-n) - (2.0*f*n)/(f-n) / dShadowCoord.z; // unlinearize
}
#ifndef VSM
float texture2Dshadow(sampler2DShadow shadowMap, vec3 uv) {
    return texture(shadowMap, uv);
}
float getShadowSpotHard(sampler2DShadow shadowMap) {//, vec4 shadowParams) {
    float z = dShadowCoord.z;
    return texture2Dshadow(shadowMap, vec3(dShadowCoord.xy, z));
}
#endif
#endif


#ifdef VSM
float chebyshevUpperBound(vec2 moments, float mean, float minVariance, float lightBleedingReduction) {
    // Compute variance
    float variance = moments.y - (moments.x * moments.x);
    variance = max(variance, minVariance);
    // Compute probabilistic upper bound
    float d = mean - moments.x;
    float pMax = variance / (variance + (d * d));
    //pMax = reduceLightBleeding(pMax, lightBleedingReduction);
    // One-tailed Chebyshev
    return (mean <= moments.x ? 1.0 : pMax);
}
float calculateVSM8(vec3 moments, float Z, float vsmBias) {
    float VSMBias = vsmBias;//0.01 * 0.25;
    float depthScale = VSMBias * Z;
    float minVariance1 = depthScale * depthScale;
    return chebyshevUpperBound(moments.xy, Z, minVariance1, 0.1);
}
float decodeFloatRG(vec2 rg) {
    return rg.y*(1.0/255.0) + rg.x;
}
float VSM8(sampler2D tex, vec2 texCoords, float resolution, float Z, float vsmBias, float exponent) {
    vec4 c = texture2D(tex, texCoords);
    vec3 moments = vec3(decodeFloatRG(c.xy), decodeFloatRG(c.zw), 0.0);
    return calculateVSM8(moments, Z, vsmBias);
}
#endif


void main(void) {
    
    //float simRadius = 16.0;//8.0;
    vec2 topUv = (vPositionL.xz/vec2(simRadius,-simRadius))*0.5+0.5;
    vec4 top = texture2D(topMap, topUv);
    vec2 offset = vec2(1.0/256.0, 0.0);
    vec2 slope = vec2(topLookup(topUv+offset.xy) - topLookup(topUv-offset.xy),
                      topLookup(topUv+offset.yx) - topLookup(topUv-offset.yx));
    //slope = normalize(slope);
    //vec3 gnormal = normalize( vec3(slope, sqrt(max(1.0-dot(slope,slope),0.0))) ).xzy;
    //gl_FragColor = vec4(top.ggg*8.0,1);
    //gl_FragColor = vec4(slope*0.5+0.5, 0.0, 1.0);
    //return;
    
    /*vec2 uv = vUv.xy;
    float opacity = texture2D(opacityMap, uv).g;
    
    //if (opacity < 0.5) discard;
    
    vec3 color = texture2D(diffuseMap, uv).rgb;
    vec3 normal = texture2D(normalMap, uv).xyz * 2.0 - 1.0;
    normal = normal.xzy;
    mat2 m = mat2(vRotation);
    normal.xz = m * normal.xz;
    
    float light = saturate(dot(normal, normalize(vec3(0.5,0.7,0.5))));
    //float skyLight = mix(pow(1.0-top.g,8.0), 1.0, vHeight/2.0);
    float skyLight = saturate(distance(vortexPos.xz, vPositionW.xz)/4.0);
    skyLight = mix(skyLight, 1.0, saturate(vHeight/0.3+0.75));
    vec3 skyLight3 = decodeRGBM(textureCube(cubeMap, normal)) * skyLight;*/
    //color = vec3(1.0);
    //gl_FragColor = vec4(1,vPositionW.y,0,1);
    //gl_FragColor = vec4(color * (light*colorSun*4.0 + colorShadow) * 2.0 * skyLight, opacity);
    
    vec3 dViewDirW = normalize(view_position - vPositionW);
    mat2 m = mat2(vRotation);
    vec2 vT = m * vec2(1,0);
    vec2 vB = m * vec2(0,1);
    mat3 dTBN = mat3(vec3(vT.x,0,vT.y), vec3(vB.x,0,vB.y), vec3(0,1,0));
    
    float hmap = texture2D(heightMap, vUv.xy).g;
    float parallaxScale = 4.0 * 0.025;// * fract(globalTime);
    hmap = hmap * parallaxScale - parallaxScale*0.5;
    vec3 viewDirT = dViewDirW * dTBN;
    viewDirT.z += 0.42;
    vec2 dUvOffset = hmap * (viewDirT.xy / viewDirT.z);
    vec2 uvMain = vUv.xy;// + dUvOffset;
    
    //vec4 animTex = texture2D(animMap, vAnimUv);
    //vec3 color = animTex.rgb;
    //float opacity = animTex.a;
    
    vec3 color = texture2D(diffuseMap, uvMain.xy).rgb;
    float opacity = texture2D(opacityMap, uvMain.xy).g;
    //color = color2;//mix(color2, color, saturate(vHeight)*opacity);
    //opacity = opacity2;//mix(opacity2, opacity, saturate(vHeight));
    
    if (opacity < 0.01) discard;
    
    vec3 albedo = color;
    
    float height = vHeight/4.0 + 0.01;
    //float shadowHeight = top.a - 0.01;
    //float shadow = height < shadowHeight? 0.0 : 1.0;
    float shadow = 0.0;
    vec2 offsets[8];
    const float offsetSize = 1.0/64.0;
    offsets[0] = vec2(-0.409128, -0.238135) * offsetSize;
    offsets[1] = vec2(-0.2767566, -0.7708896) * offsetSize;
    offsets[2] = vec2(-0.510359, 0.3074695) * offsetSize;
    offsets[3] = vec2(0.4547283, 0.2265625) * offsetSize;
    offsets[4] = vec2(-0.01454435, 0.6510762) * offsetSize;
    offsets[5] = vec2(0.2898484, -0.4668662) * offsetSize;
    offsets[6] = vec2(0.8402197, -0.2982866) * offsetSize;
    offsets[7] = vec2(0.7034608, 0.6736597) * offsetSize;
    for(int i=0; i<8; i++) {
        float shadowHeight = texture2D(topMap, topUv + offsets[i]).a;
        shadow += height < shadowHeight? (1.0/8.0) : 0.0;
    }
    color *= 1.0-shadow*0.4;
    color *= height/3.0+0.84;
    color *= decodeRGBM(textureCube(skyboxLowCurrent, vec3(0,1,0))) * 3.0 ;//* 0.5;
    
    vec3 normal = texture2D(normalMap, uvMain.xy).xyz * 2.0 - 1.0;
    normal = normal.xzy;
    normal.xz = m * normal.xz;
    //color *= mix(0.5, 1.0, saturate(normal.y));
    
    color *= gl_FrontFacing? 1.0 : 0.75;
    //color *= 0.25;
    
#ifdef LIGHT
    getLightDirPoint(light_posRadius.xyz);
    float dAtten = getFalloffInvSquared(light_posRadius.w);
    dAtten *= getSpotEffect(light_directionInner.xyz, light_directionInner.w, light_colorOuter.w);
    color += albedo * (dAtten * light_colorOuter.rgb);
#endif
    
#ifdef SHADOWEDLIGHT
    getLightDirPoint(light_posRadius.xyz);
    float dAtten = getFalloffInvSquared(light_posRadius.w);
    dAtten *= getSpotEffect(light_directionInner.xyz, light_directionInner.w, light_colorOuter.w);
    if (dAtten > 0.00001) {
        //dAtten *= saturate(dot(vNormalW, dLightDirNormW));
        float scatter = 0.25;
        dAtten *= clamp(dot(vNormalW, dLightDirNormW)*(1.0-scatter)+scatter, 0.0, 1.0);//dot(vNormalW, dLightDirNormW) * 0.5 + 0.5;
        _getShadowCoordPersp(light_shadowMatrix, vPositionW);
        #ifdef VSM
        dAtten *= VSM8(light_shadowMap, dShadowCoord.xy, 0.0, length(dLightDirW) / light_posRadius.w + -0.00001*20.0, 0.1, 0.0);
        #else
        dAtten *= getShadowSpotHard(light_shadowMap);
        #endif
    }
    color += albedo * (dAtten * light_colorOuter.rgb);
#endif
    
    gl_FragColor = vec4(color, opacity);
}

