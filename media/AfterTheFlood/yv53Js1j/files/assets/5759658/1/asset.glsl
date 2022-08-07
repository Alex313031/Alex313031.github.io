varying vec3 vPositionW;
//varying vec3 vNormalW;

#define UVSCALE 4.0

uniform float globalTime, waterHeight, camera_near, camera_far;
uniform vec3 view_position;
uniform samplerCube waterSkyTexture;
uniform sampler2D waterReflTex, waterReflTexBlur, waterNormalTex, waterNormalTex2, noiseTex;
uniform sampler2D uDepthMap, uScreenDepth;
uniform vec4 uScreenSize;
uniform mat4 matrix_view, matrix_viewProjection;
uniform float uvOffsetAmount;


float flatten;

vec3 combineNormals(vec3 base, vec3 detail) {
    base = base.xzy;
    detail = detail.xzy;
    
	mat3 nBasis = mat3(
		vec3 (base.z, base.y,-base.x),
		vec3 (base.x, base.z,-base.y),
		vec3 (base.x, base.y, base.z ));
		
		return normalize(detail.x*nBasis[0] + detail.y*nBasis[1] + detail.z*nBasis[2]).xzy;
}

float unpackFloat(vec4 rgbaDepth) {
    const vec4 bitShift = vec4(1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0);
    float depth = dot(rgbaDepth, bitShift);
    return depth;
}

#define MOD3 vec3(.16532,.17369,.15787)
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
}


float saturate(float f) {
    return clamp(f,0.0,1.0);
}

float linearizeDepth(float d) {
    float n = camera_near;
    float f = camera_far;
    return (2.0 * n) / (f + n - d * (f - n));
    //return -((2.0*f*n)/(f-n)) / (d - (f+n)/(f-n));
}

float linearizeDepth(vec2 d) {
    return linearizeDepth( (d.x/d.y)*0.5+0.5 );
}

void main() {
    
    vec3 viewDir = normalize(vPositionW - view_position);
    
    //vec3 normal = normalize(vNormalW);
    //vec3 normal = normalize(texture2D(waterTex, vPositionW.xz*0.1).xzy * 2.0 - vec3(1.0));
    vec2 uv = vPositionW.xz*0.1 * UVSCALE + globalTime * uvOffsetAmount;
    vec2 origUv = uv;
    //vec2 uvc = uv + vec2(0, globalTime*0.1);
    vec3 lightDir = normalize(vec3(0, 0.2, 1)); 
    
    vec3 refl = vec3(0.0);
    float spec = 0.0;
    float light = 0.0;
    
    //float variation = saturate(Noise(vPositionW*0.04*vec3(0.5,1,1)));
    
#ifdef NOAA
    vec2 SSAA[1];
    SSAA[0] = vec2(0.0);
    const int SAMPLES = 1;
#else
    vec2 SSAA[3];
    SSAA[0] = vec2(0.0);
    SSAA[1] = vec2(-0.5, -0.866);
    SSAA[2] = vec2(-0.5, 0.866);
    const int SAMPLES = 3;
#endif
    
    /*vec2 SSAA[10];
    SSAA[0] = vec2(1.0 / 5.5,  4.0 / 5.5);
    SSAA[1] = vec2(4.0 / 5.5,  5.0 / 5.5);
    SSAA[2] = vec2(3.0 / 5.5,  1.0 / 5.5);
    SSAA[3] = vec2(5.0 / 5.5, -3.0 / 5.5);
    SSAA[4] = vec2(2.0 / 5.5, -4.0 / 5.5);
    SSAA[5] = vec2(-1.0 / 5.5, -2.0 / 5.5);
    SSAA[6] = vec2(-3.0 / 5.5, -5.0 / 5.5);
    SSAA[7] = vec2(-4.0 / 5.5, -1.0 / 5.5);
    SSAA[8] = vec2(-5.0 / 5.5,  3.0 / 5.5);
    SSAA[9] = vec2(-2.0 / 5.5,  2.0 / 5.5);*/
    vec2 dx = dFdx(uv);
    vec2 dy = dFdy(uv);
    flatten = dot(abs(dy*1.0),vec2(1.0));
    
    /*float waterDepth = -(matrix_view * vec4(vPositionW,1.0)).z;
    float depth = unpackFloat(texture2D(uDepthMap, gl_FragCoord.xy * uScreenSize.zw)) * camera_far;
    float softening = 0.5;
    float depthDiff = saturate(pow(abs(waterDepth - depth) * softening, 0.5));
    float depthDiff2 = saturate(pow(abs(waterDepth - depth) * 0.01, 0.5));*/
    
    float waterDepth = linearizeDepth((matrix_viewProjection * vec4(vPositionW,1.0)).zw);
    float depth = linearizeDepth(texture2D(uScreenDepth, gl_FragCoord.xy * uScreenSize.zw).r);
    float softening = 200.0;
    float depthDiff = saturate(pow(abs(waterDepth - depth) * softening, 0.5));
    //float depthDiff = saturate(abs(waterDepth - depth));
    float depthDiff2 = saturate(pow(abs(waterDepth - depth) * 0.01, 0.5));
    
    vec2 vvec = vPositionW.xz-view_position.xz;
    vec2 nvec = normalize(vvec);
    
    //bool cheap = dot(abs(dy),vec2(1.0)) < 15.0/256.0;
    const bool cheap = false;
            
    for(int i=0; i<SAMPLES; i++) {
        //vec2 tc = uv + SSAA[i].x * dx + SSAA[i].y * dy;
        
        vec2 tc = origUv + SSAA[i].x * dx + SSAA[i].y * dy;
        
        //vec4 normalHeight = calcNormalAndHeight(origUv, tc, 0.01);
        //vec4 normalHeight = calcNormalAndHeight(tc, uv, 0.01);
        //vec4 normalHeight = calcNormalAndHeight(tc+ SSAA[i].x * dx + SSAA[i].y * dy, uv+ SSAA[i].x * dx + SSAA[i].y * dy, 0.01);
        
        //vec3 normal = normalize(normalHeight.xyz + vec3(0,25,0));
        
        //vec2 ddv = dudvmap(tc*1.0 + vec2(0,-globalTime*0.05));
        //vec2 ddv2 = dudvmap(tc.yx + vec2(0,-globalTime*0.05).yx);
        //ddv = mix(ddv, ddv2, abs(nvec.x));
        //vec3 normal = normalize( vec3(ddv, sqrt(max(1.0-dot(ddv,ddv),0.0))) ).xzy;
        
        vec3 normal3 = texture2D(waterNormalTex2, tc*0.025).xyz*2.0-1.0;
        normal3 += texture2D(waterNormalTex2, tc*0.025+0.5).xyz*2.0-1.0;
        //tc += normal3.xz * 10.0;
        
        vec3 normal = texture2D(waterNormalTex, tc).xzy*2.0-1.0;
            normal += texture2D(waterNormalTex, tc*0.5).xzy*2.0-1.0;
                normal += texture2D(waterNormalTex, tc*0.25).xzy*2.0-1.0;
        vec3 normal2 = texture2D(waterNormalTex, tc.yx).xzy*2.0-1.0;
            normal2 += texture2D(waterNormalTex, tc.yx*0.5).xzy*2.0-1.0;
                normal2 += texture2D(waterNormalTex, tc.yx*0.25).xzy*2.0-1.0;
        normal = mix(normal, normal2, abs(nvec.x));
        normal = normalize(normal);
        
        normal += normal3*0.25;
            //normal.y *= variation*variation;
        normal = normalize(normal);
        
        //normal += normal3;//*4.0;
        //normal = normalize(normal);
        //normal = combineNormals(normal3, normal);
        
        //ddv = dudvmap2(origUv*0.1 + vec2(0,-T*0.05));
        //vec3 normalG = normalize( vec3(ddv, sqrt(max(1.0-dot(ddv,ddv),0.0))) ).xzy;
        
        //normal = normalize(normalG*0.25 + normal);
        
        //normal = combineNormals(normalize(mix(dripNormal(origUv),vec3(0,1,0),0.8)), normal);
        //normal = SampleWaterNormal(origUv*0.3, vec2(T,T)*0.1, 1.0, 0.0).xzy*vec3(-0.1) + dripHeight(origUv)*0.05;
        //vec3 normal = -curl(fract(vec3(uv.x*0.75-T*FLOW.x*0.1, globalTime*0.05*3.0, uv.y-T*FLOW.y*0.1)), 1.0).xzy + dripHeight(origUv)*0.25;
            //normal.y += 25.0;
          //  normal.y += 4.0;
            //normal = normalize(normal);

        //float height = normalHeight.w*waterHeight;//0.01;

        //vec3 viewDirT = viewDir;
        //vec2 dUvOffset = min(height * viewDirT.xy, vec2(0.0));
        //normalHeight = calcNormalAndHeight(vec3(uv.x+dUvOffset.x,1,uv.y+dUvOffset.y),.01);
        //normal = normalize(normalHeight.xyz + vec3(0,75,0));

        vec3 reflDir = reflect(viewDir, normal);
        
        float fresnel1 = 1.0 - max(dot(normal, -viewDir), 0.0);
        float viewDot = fresnel1;
        float fresnel2 = fresnel1 * fresnel1;
        fresnel1 *= fresnel2 * fresnel2;
        float specVal = 0.04;
        float spec1 = specVal + (1.0 - specVal) * fresnel1;
        spec += spec1;

         vec2 dudv = normal.xz;
            dudv.x *= 0.25;
            //dudv.y = min(dudv.y, 0.0) * 2.0;
                dudv.y *= 2.0;
         dudv /= flatten*3.0+1.0;

#ifdef SIMPLE
        refl += decodeRGBM(textureCube(waterSkyTexture, reflDir * vec3(-1,1,1))) * 3.0;
#else
        vec3 reflSharp = texture2D(waterReflTex, gl_FragCoord.xy * uScreenSize.zw + dudv).rgb;
        vec3 reflBlur = texture2D(waterReflTexBlur, gl_FragCoord.xy * uScreenSize.zw + dudv).rgb;
        refl += mix(reflSharp, reflBlur, saturate(flatten));
#endif
         
        
        
        light += clamp(dot(lightDir, normal)*4.0, 0.0, 1.0);
        
        if (cheap) break;
    }

    if (!cheap) {
        refl /= float(SAMPLES);
        spec /= float(SAMPLES);
        light /= float(SAMPLES);
    }
    
    //vec3 color = gammaCorrectOutput(toneMap(refl * spec * light * 0.8));
    //vec3 color = refl * spec * light;// * 0.8;
    vec3 colorUnderwater = pow(vec3(47,57,73)/255.0, vec3(2.2));
    vec3 color = mix(colorUnderwater * light, refl, spec);// * 0.8;
    
    //color = vec3(depth);
    //depthDiff = 1.0;
    //color = vec3(variation);
    //color = texture2D(waterNormalTex2, vPositionW.xz*0.05*0.1).rgb;
    //color = vec3(abs(nvec.x));
    //color = vec3(heightmap2(vPositionW.xz*0.05))*0.5+0.5;
    //color = dudvmap(vPositionW.xz).xyy*0.1;
    //color = SampleWaterNormal(vPositionW.xz*0.1, vec2(T,T)*0.1, 0.5, 0.5).xyz;
    //color = vec3(dispersion2d(vPositionW.xz+10.0, globalTime));
    //color = vec3(spec);
    //color = vec3(dot(abs(dy),vec2(1.0)));
    //color = texture2D(uDepthMap, gl_FragCoord.xy * uScreenSize.zw).rgb;// * vec3(1,0,0);
    //color = texture2D(waterReflTex, gl_FragCoord.xy * uScreenSize.zw).rgb;// * vec3(1,0,0);
    gl_FragColor = vec4(color, depthDiff);
}

