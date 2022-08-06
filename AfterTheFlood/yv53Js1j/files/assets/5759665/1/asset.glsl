#define SAMPLESMAIN 128
#define curlSpeedBoost 4.0 // former evolutionBoost
#define fractalScale 0.75

uniform float totalTime;
uniform vec3 sunDir;
uniform sampler2D noiseTex;
uniform sampler2D curlTex;
uniform sampler2D jitterNoise;
uniform samplerCube skyboxLow, skyboxHigh;

precision highp sampler3D;
uniform sampler3D cloudShapeFractal;

#ifndef ENCODE
#define ENCODE
vec4 encode(vec4 c) {
    return c;
}
varying vec3 vViewDir;
vec3 genDirection() {
    return normalize(vViewDir);
}
#endif

const float planetRadius = 6360e3; //planet radius

vec3 colorUp = pow(vec3(103, 121, 140) / 255.0, vec3(2.2));
vec3 colorUp2 = pow(vec3(121, 142, 163) / 255.0, vec3(2.2));
vec3 colorDown = pow(vec3(65, 71, 91) / 255.0, vec3(2.2));
vec3 colorDown2 = pow(vec3(95, 116, 139) / 255.0, vec3(2.2));

vec3 curlValue;
float skyDense;
float fakeDistMult;

const float cloudsLowerHeight = 2000.0-1500.0;
const float cloudsUpperHeight = 6000.0-1500.0;//4000.0

const float cloudSolidThreshold = 0.7;

//--------------------------------------------------------------------------
//Cloud noise

float Noise( in vec3 x )
{
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f*f*(3.0-2.0*f);

    vec2 uv = (p.xy+vec2(37.0,17.0)*p.z) + f.xy;
    vec3 nn = texture2D( noiseTex, (uv+ 0.5)/256.0, -100.0 ).xyz;
    vec2 rg = nn.yx;
    return mix( rg.x, rg.y, f.z );
}

float sphereIntersect(in vec3 ro, in vec3 rd, in float r) {
    float b = dot(ro,rd);
    float c = dot(ro,ro) - r * r;
    float h = b*b - c;
    //if (h < 0.0) return -1.0;
    float t = (-b - sqrt(h));
    return t;
}

float saturate(float f) {
    return clamp(f, 0.0, 1.0);
}

vec3 saturate(vec3 f) {
    return clamp(f, vec3(0.0), vec3(1.0));
}

vec3 fixSeams(vec3 vec, float mipmapIndex) {
    float scale = 1.0 - exp2(mipmapIndex) / 128.0;
    float M = max(max(abs(vec.x), abs(vec.y)), abs(vec.z));
    if (abs(vec.x) != M) vec.x *= scale;
    if (abs(vec.y) != M) vec.y *= scale;
    if (abs(vec.z) != M) vec.z *= scale;
    return vec;
}

vec3 decodeRGBM(vec4 rgbm) {
    vec3 color = (8.0 * rgbm.a) * rgbm.rgb;
    return color * color;
}

float coverageBottom(vec3 p1) {
    float windOffsetNoise = totalTime*0.2;//*0.05;
    return saturate((1.0-Noise(p1 * 0.0001 * 2.0 + vec3(0,0,-windOffsetNoise))) * 0.5);  //moving noise
}

// Applies masks to base fractal
float fractal2Cloud(vec3 p, float density, float soften, float soften2, float thin, float threshold) {

    // vertical mask
    float vmask = (p.y - cloudsLowerHeight) / (cloudsUpperHeight - cloudsLowerHeight);
    float vmaskTop = saturate(pow(vmask,16.0)*16.0);
    vmask = mix(thin, 1.0-thin, vmask);
    float verticalMask = vmask; // global fade, more intensity on top
    verticalMask += 1.0;
    verticalMask *= 8.0;
    verticalMask *= saturate(vmask / 0.3)*0.6; // slightly less intensity on bottom
    verticalMask *= pow(saturate((1.0 - vmask + 0.2)),1.0); // slightly less intensity on top

    float coverage = coverageBottom(p);

    density = (density-coverage*0.75) * verticalMask * soften2 - threshold;

    return density;//vec3(density, normal);
}

float sampleCloudsComplex(vec3 p) {
    float windOffset = totalTime*0.05;
    vec4 density4 = texture(cloudShapeFractal, p * 0.0001 * 0.35 * fractalScale - vec3(0,0, windOffset)); // tiled fractal noise of different freq
    float density = dot(vec4(1.0, 0.5, 0.25, 0.125), density4) / (1.75+0.125); // combine together ala fbm

    density = fractal2Cloud(p, density, 0.7, 1.0, 0.0, cloudSolidThreshold);//densityAndHNormal.x; // apply masks and threshold

    density4 = texture(cloudShapeFractal, p * 0.0001 * 0.35 * 8.0 * fractalScale - vec3(0,0, totalTime*0.1) + curlValue); // 8x smaller curled fractal noise of different freq
    float vmask = (p.y - cloudsLowerHeight) / (cloudsUpperHeight - cloudsLowerHeight);
    density -= dot(vec4(0.5, 0.25, 0.125, 0.125)*vmask*fakeDistMult, density4); // combine smaller noise and apply it to the base density, based on verticality

    return saturate(density);
}

vec3 GetSky2(vec3 o, vec3 d, vec3 Ds) {

    vec3 planetRelativeOrigin = vec3(0, planetRadius, 0) + o;
    float distToCloudsLower = -sphereIntersect(planetRelativeOrigin, -d, planetRadius+cloudsLowerHeight);
    float distToCloudsUpper = -sphereIntersect(planetRelativeOrigin, -d, planetRadius+cloudsUpperHeight);
    float visibleDistFromLowerToUpper = distToCloudsUpper - distToCloudsLower;
    float density, bottomDensity;
    float depthStep;
    float verticalGrad, verticalGradDensity;
    vec4 col = vec4(0.0);
    float extinction = 1.0;
    vec3 lightColor = vec3(0.0);
    float transmittance = 1.0;
    float transAccum = 0.0;

    //
    vec3 curlPos = o + d*distToCloudsLower;
    curlPos.xz += vec2(0.0, -totalTime*8500.0);
    //curlPos.z -= totalTime * 5000.0*0.5*curlSpeedBoost;
    curlPos.xz += vec2(100000.0);
    //curlPos.z += totalTime * 5000.0*0.5;
    //curlPos.z -= totalTime * 1000.0;
    curlValue = (texture2D(curlTex, curlPos.xz * 0.0002 - vec2(0, totalTime*0.1)).rgb * 2.0 - vec3(1.0)) * 0.0125;

    // Trace through the cloud
    vec3 samplePos = o + d*distToCloudsLower;
    float remainingDepth = visibleDistFromLowerToUpper;
    depthStep = remainingDepth / float(SAMPLESMAIN);
    vec3 step2 = d * depthStep;

    // sky
    vec3 sky = decodeRGBM(textureCube(skyboxLow, fixSeams(d,2.0))) * 3.0;
    vec3 dAbs = d;
    dAbs.z = -abs(dAbs.z);
    vec3 skyNoSun = decodeRGBM(textureCube(skyboxLow, fixSeams(dAbs,2.0))) * 3.0;// * vec3(0.6, 0.3, 0.7);
    float glow = saturate(dot(normalize(d*vec3(1,9,1)), sunDir));
    skyNoSun += pow(glow,4.0) * vec3(0.6172, 0.7422, 0.9922);


    // apply air fogging
    float extinctionFactor = 0.02;
    density = 0.005; // fogging amount
    float extinctionCoeff = extinctionFactor * density;
    extinction *= exp(-extinctionCoeff * distToCloudsLower);
    float extinctionInFog = extinction;
    transmittance = extinction;

    fakeDistMult = mix(6.0, 4.0, saturate(length(samplePos.xz)/2000.0));
    
    vec2 jitter = texture2D(jitterNoise, gl_FragCoord.xy/16.0).rg;
    float doff = 0.0;
    float voff = jitter.x * 500.0;
    samplePos += d * voff;

    for(int i=0; i<SAMPLESMAIN; i++) {
        samplePos += step2;
        bool layer = samplePos.y>(cloudsUpperHeight-2000.0); // this is not supposed to be here but makes the look

        density = sampleCloudsComplex(samplePos);
        bottomDensity = layer? 0.0 : density;

        float bottomVerticalGrad = saturate((samplePos.y - (cloudsLowerHeight+500.0)) / ((cloudsUpperHeight-2000.0) - (cloudsLowerHeight+500.0)));
        float topVerticalGrad = saturate((samplePos.y - (cloudsUpperHeight-1000.0)) / ((cloudsUpperHeight) - (cloudsUpperHeight-1000.0)));
        verticalGrad = layer? topVerticalGrad*0.15 : bottomVerticalGrad;
        verticalGrad = pow(verticalGrad, 0.4);
        verticalGradDensity = verticalGrad*density;

        // accumulate parameters, weighted by visibility
        col += vec4(bottomDensity, verticalGrad, verticalGradDensity, density) * (1.0 - col.a);

        // Nice cloudy mask!
        float curdensity = saturate(density * depthStep * 0.01);
        transAccum += transmittance;

        float skyEnergy = 0.0;
        float sunEnergy = 0.0;
        if (density > 0.0) {
            float dscale = 1.0;
            float AmbientDensity = 3.0;
            float shadowDist = 0.0;
            vec3 lpos = samplePos + vec3(0, 100.0*dscale+doff, 0);
            float d = sampleCloudsComplex(lpos);
            shadowDist += d;
            lpos = samplePos + vec3(0, 200.0*dscale+doff, 0);
            d = sampleCloudsComplex(lpos);
            shadowDist += d;
            lpos = samplePos + vec3(0, 400.0*dscale+doff, 0);
            d = sampleCloudsComplex(lpos);
            shadowDist += d;
            //skyEnergy += exp(-shadowDist * AmbientDensity) * curdensity * transmittance * 2.0;
            skyEnergy += exp(-shadowDist * AmbientDensity) * curdensity * transmittance * 2.0;// * (1.0-exp(-shadowDist*AmbientDensity*2.0));

            shadowDist = 0.0;
            vec3 ds = normalize(vec3(0,0.2,1));
            lpos = samplePos + ds * (100.0*dscale+doff);
            d = sampleCloudsComplex(lpos);
            shadowDist += d;
            lpos = samplePos + ds * (200.0*dscale+doff);
            d = sampleCloudsComplex(lpos);
            shadowDist += d;
            lpos = samplePos + ds * (400.0*dscale+doff);
            d = sampleCloudsComplex(lpos);
            shadowDist += d;
            //sunEnergy += exp(-shadowDist * AmbientDensity) * curdensity * transmittance * 5.0;
            sunEnergy += exp(-shadowDist * AmbientDensity) * curdensity * transmittance * 5.0;// * (1.0-exp(-shadowDist*AmbientDensity*2.0));
        }
        vec3 bot = vec3(0.0361, 0.0630, 0.1108);
        vec3 top = vec3(0.0801, 0.1406, 0.2520) - bot;// * darkening;
        vec3 lit = (vec3(0.1328, 0.1953, 0.3066) - bot) * 2.0;// * darkening;

        vec3 light = (bot + skyEnergy * top + sunEnergy * lit) * 3.0;
        vec3 absorbed = light * curdensity * 42.0;
        lightColor += absorbed * transmittance;
        transmittance *= 1.0 - curdensity;
    }

    bottomDensity = col.r; // bottom mask
    verticalGrad = col.g; // gradient, calculated even where there are no clouds
    verticalGradDensity = col.b; // gradient, weighted by density, dimmer on the top layer
    density = col.a; // density of both layers

    density /= float(SAMPLESMAIN);
    verticalGrad += verticalGradDensity*2.0;

    //density *= 40.0*0.5;
    vec3 maskedSky = sky * (1.0 - density); // not masked much...
    vec3 maskedSkyNoSun = skyNoSun * (1.0 - density); // not masked much...

    vec3 bottomClouds = mix(colorDown, colorUp*2.0, pow(verticalGrad,1.5) * verticalGradDensity) // lerp colors by gradient
                                                                                       * density // clear the sky
                                                                                       + maskedSkyNoSun * bottomDensity; // add not fully masked sky on bottom clouds

    vec3 topClouds = mix(colorDown2, colorUp2*2.0, pow(verticalGrad,1.5) * verticalGradDensity) // lerp colors by gradient
                                                                                        * density // clear the sky
                                                                                        + maskedSky * (1.0 - bottomDensity); // add not fully masked sky on top clouds
    vec3 color = bottomClouds + topClouds; // soft part

    // add fake horizon fog
    //float horizonMask0 = 1.0-pow(1.0-d.y,32.0);
    //float horizonMask = mix(0.25,1.0,horizonMask0);

    lightColor /= float(SAMPLESMAIN);
    lightColor *= 3.0;

    transAccum /= float(SAMPLESMAIN);

    // hard part
    vec3 color2 = lightColor * transAccum * 2.0 // cloud color
            + sky * transmittance // clear sky
            + skyNoSun * (1.0 - extinctionInFog); // fog color

    color += lightColor * (1.0 - verticalGradDensity);
    color = mix(color2, color, 0.2);

    float cloudsEdgeMask;
    float clearSkyMask;
    clearSkyMask = saturate(col.a);
    cloudsEdgeMask = 1.0 - clearSkyMask;
    cloudsEdgeMask *= clearSkyMask;
    cloudsEdgeMask = 1.0 - cloudsEdgeMask;
    skyDense = (1.0 - clearSkyMask) + (1.0 - cloudsEdgeMask)*4.0;

    return color;
}


void main(void) {
    vec3 viewDir = genDirection();

    vec3 color = GetSky2(vec3(0,0,0), viewDir, sunDir);

    float a = skyDense;//mix(1.0, skyDense*0.001, skyShadow.y);// * skyColor.b);
    float sun = pow(saturate(dot(normalize(viewDir*vec3(1,9,1)), sunDir)),2.0*4.0);
    float sun2 = pow(saturate(dot(normalize(viewDir*vec3(1,1,1)), sunDir)),256.0*4.0);
    float glow = pow(saturate(dot(normalize(viewDir*vec3(1,9,1)), sunDir)), 4.0);// * 0.5 + 0.5;

    vec3 glowColor = vec3(0.6172, 0.7422, 0.9922) * 1.0;// * pow(vec3(246, 234.0 * 0.97, 206.0 * 0.97) / 255.0, vec3(2.2)) * 1.0 * vec3(1,0.2,0.0);
    vec3 sunColor = vec3(1.5209, 1.0842, 0.6474) * 2.0;// * pow(vec3(246, 234.0 * 0.97, 206.0 * 0.97) / 255.0, vec3(2.2)) * 1.0 * vec3(1,0.2,0.0);

    vec3 addColor = mix(glowColor*glow, sunColor, sun) + sun2 * sunColor;
    color = color * (1.0-glow*a) + addColor*a;

    gl_FragColor = encode(vec4( color, 1.0 ));
}

