varying vec3 vPositionW;

#define UVSCALE 4.0

uniform float globalTime, waterHeight;
uniform vec3 view_position;
uniform samplerCube waterSkyTexture;
uniform sampler2D waterReflTex, waterReflTexBlur, waterNormalTex, waterNormalTex2, noiseTex;
uniform mat4 matrix_viewProjection;
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

void main() {
    
    vec3 viewDir = normalize(vPositionW - view_position);
    vec2 uv = vPositionW.xz*0.1 * UVSCALE + globalTime * uvOffsetAmount;
    vec2 origUv = uv;
    vec3 lightDir = normalize(vec3(0, 0.2, 1)); 
    
    vec3 refl = vec3(0.0);
    float spec = 0.0;
    float light = 0.0;
    
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

    vec2 dx = dFdx(uv);
    vec2 dy = dFdy(uv);
    flatten = dot(abs(dy*1.0),vec2(1.0));
    
    //float depth = linearizeDepth(texture2D(uScreenDepth, gl_FragCoord.xy * uScreenSize.zw).r);
    
    float waterDepth = getLinearDepth(vPositionW);
    float depth = getLinearScreenDepth();
    
    float softening = 200.0;
    softening *= 0.002;
    float depthDiff = saturate(pow(abs(waterDepth - depth) * softening, 0.5));
    //float depthDiff2 = saturate(pow(abs(waterDepth - depth) * 0.01, 0.5));
    
    vec2 vvec = vPositionW.xz-view_position.xz;
    vec2 nvec = normalize(vvec);
    const bool cheap = false;
            
    for(int i=0; i<SAMPLES; i++) {
    
        vec2 tc = origUv + SSAA[i].x * dx + SSAA[i].y * dy;
        
        vec3 normal3 = texture2D(waterNormalTex2, tc*0.025).xyz*2.0-1.0;
        normal3 += texture2D(waterNormalTex2, tc*0.025+0.5).xyz*2.0-1.0;
        
        vec3 normal = texture2D(waterNormalTex, tc).xzy*2.0-1.0;
            normal += texture2D(waterNormalTex, tc*0.5).xzy*2.0-1.0;
                normal += texture2D(waterNormalTex, tc*0.25).xzy*2.0-1.0;
        vec3 normal2 = texture2D(waterNormalTex, tc.yx).xzy*2.0-1.0;
            normal2 += texture2D(waterNormalTex, tc.yx*0.5).xzy*2.0-1.0;
                normal2 += texture2D(waterNormalTex, tc.yx*0.25).xzy*2.0-1.0;
        normal = mix(normal, normal2, abs(nvec.x));
        normal = normalize(normal);
        
        normal += normal3*0.25;
        normal = normalize(normal);

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

