varying vec3 vViewDir;

#define SPEEDBOOST 3.0

uniform sampler2D skyTex1;
uniform sampler2D skyTex2;
//uniform sampler2D skyVelocity;
uniform sampler2D skyDensity;

precision highp sampler3D;
uniform sampler3D skyLutTex;
    uniform sampler2D cloudMaskTex;

uniform vec4 uScreenSize;
uniform float skyBlend;
uniform float globalTime;

vec3 decodeRGBM(vec4 rgbm) {
    vec3 color = (8.0 * rgbm.a) * rgbm.rgb;
    return color * color;
}

#define MOD3 vec3(.16532,.17369,.15787)
float Hash(vec3 p)
{
	p  = fract(p * MOD3);
    p += dot(p.xyz, p.yzx + 19.19);
    return fract(p.x * p.y * p.z);
}
float Noise(in vec3 p)
{
    vec3 i = floor(p);
	vec3 f = fract(p); 
	f *= f * (3.0-2.0*f);

    return mix(
		mix(mix(Hash(i + vec3(0.,0.,0.)), Hash(i + vec3(1.,0.,0.)),f.x),
			mix(Hash(i + vec3(0.,1.,0.)), Hash(i + vec3(1.,1.,0.)),f.x),
			f.y),
		mix(mix(Hash(i + vec3(0.,0.,1.)), Hash(i + vec3(1.,0.,1.)),f.x),
			mix(Hash(i + vec3(0.,1.,1.)), Hash(i + vec3(1.,1.,1.)),f.x),
			f.y),
		f.z);
}

float fnoise( vec3 p, float t )
{
	p *= .25;
    float f;

	f = 0.5000 * Noise(p); p = p * 3.02; p.z -= t*.2; p.y -= t*.2;
	f += 0.2500 * Noise(p); p = p * 3.03; p.z += t*.06; p.y += t*.06;
	f += 0.1250 * Noise(p); p = p * 3.01;
	f += 0.0625   * Noise(p); p =  p * 3.03;
	f += 0.03125  * Noise(p); p =  p * 3.02;
	f += 0.015625 * Noise(p);
    return f;
}

vec3 colorCorrect(vec3 color, sampler3D lut) {
    const float lutSize = 16.0;//64.0;
    const float a = (lutSize - 1.0) / lutSize;
    const float b = 1.0 / (2.0 * lutSize);
    const vec3 scale = vec3(a, a, a);
    const vec3 offset = vec3(b, b, b);
    return texture(lut, clamp(color,vec3(0.0),vec3(1.0)) * scale + offset).rgb;
    //return texture(lut, vec3(gl_FragCoord.xy*uScreenSize.zw, 0.9)).rgb;
    //return texture2D(cloudMaskTex, gl_FragCoord.xy*uScreenSize.zw).rgb;
}

#define MORPHSAMPLES 8

void main(void) {
    vec3 viewDir = normalize(vViewDir);
    
    float falloff = clamp(viewDir.y, 0.0, 1.0);
    
    vec3 wind = vec3(1,0,1);
    //float morphMoveLength = 0.3; // 128x128
    float morphMoveLength = 0.075 * 1.0; // 256x256
    
    float speed = 1.075;//75;
        speed = mix(2.0, 0.9, falloff) * 0.25 * 0.25;
    //float speed = 1.5;
    morphMoveLength *= speed * SPEEDBOOST;
    
    float noize = fnoise(viewDir, globalTime * 0.1);
    //wind *= noize * noize * 4.0;// * 4.0;
    //morphMoveLength = morphMoveLength + noize * 2.0; // 128x128
    //morphMoveLength = morphMoveLength + noize * 0.075; // 256x256
    
    //viewDir.z += noize * 2.0 - 0.5;
    //viewDir = normalize(viewDir);
    
    vec3 vec1 = viewDir + wind * -skyBlend * morphMoveLength * falloff;
    vec2 uv1 = vec1.xz / dot(vec3(1.0), abs(vec1));
    uv1 = vec2(uv1.x-uv1.y, uv1.x+uv1.y);
    uv1 = uv1 * 0.5 + vec2(0.5);
    
    vec3 v2 = viewDir + wind * (1.0-skyBlend) * morphMoveLength * falloff;
    vec2 uv2 = v2.xz / dot(vec3(1.0), abs(v2));
    uv2 = vec2(uv2.x-uv2.y, uv2.x+uv2.y);
    uv2 = uv2 * 0.5 + vec2(0.5);
    
    // gives rombs
    //vec2 uv = viewDir.xz / dot(vec3(1.0), abs(viewDir));
    //uv = uv * 0.5 + vec2(0.5);
        
    vec2 uv = gl_FragCoord.xy * uScreenSize.zw;
    
    // http://www.vis.uni-stuttgart.de/~engelhts/paper/vmvOctaMaps.pdf
    //vec2 uv = viewDir.xz / dot(vec3(1.0), abs(viewDir));
    //uv = vec2(uv.x-uv.y, uv.x+uv.y);
    //uv = uv * 0.5 + vec2(0.5);
    
    //vec2 vel = texture2D(skyVelocity, uv).xy * -skyBlend;
    //vec2 uv1 = uv + vel;
    //vec2 uv2 = uv - vel;
    
    vec3 tex1 = decodeRGBM(texture2D(skyTex1, uv1));// * vec3(1,0,0);
    vec3 tex2 = decodeRGBM(texture2D(skyTex2, uv2));// * vec3(0,1,0);
    
    // morph 1 to 2
    /*const float res = 256.0;
    float w1 = decodeRGBM(texture2D(skyTex1, uv1)).r;//(floor(uv1*res)+0.5)/res )).r;
    //float minDiff = 100.0;
    //float minDist = 100.0;
    float minFactor = 1000.0;
    vec2 bestOffset = vec2(0.0);
    float pixelOffset = 1.0 / res;
    for(int y=-MORPHSAMPLES; y<=MORPHSAMPLES; y++) {
        for(int x=-MORPHSAMPLES; x<=MORPHSAMPLES; x++) {
            //float wsample = texture2D(skyTex2, (floor(uv2*1024.0)+0.5)/1024.0 + vec2(x,y) * pixelOffset).w;
            //float wsample = decodeRGBM(texture2D(skyTex2, (floor(uv2*res)+0.5)/res + vec2(x,y) * pixelOffset)).r;
            float wsample = decodeRGBM(texture2D(skyTex2, uv2 + vec2(x,y) * pixelOffset)).r;
            float diff = abs(wsample - w1);
            float dist = length(vec2(x,y));
            float factor = diff + dist/16.0;
            //if (diff < minDiff) {
                //minDiff = diff;
            if (factor < minFactor) {
                minFactor = factor;
                bestOffset = vec2(x,y);
            }
        }
    }
    tex1 = decodeRGBM(texture2D(skyTex1, uv1 - bestOffset * pixelOffset * (skyBlend)));// * vec3(1,0,0);
    tex2 = decodeRGBM(texture2D(skyTex2, uv2 + bestOffset * pixelOffset * (1.0-skyBlend)));// * vec3(0,1,0);*/
    
    //vec4 tex1 = texture2D(skyTex1, uv1);
    //vec4 tex2 = texture2D(skyTex2, uv2);
    
    //float highPass = clamp( dot(vec3(1.0), abs(dFdy(tex1))) * 50.0, 0.0, 1.0 );
    tex1 = mix(tex1, tex2, skyBlend);
    //float lerpFactor = clamp((skyBlend - noize * noize * 4.0) * 2.0, 0.0, 1.0);
    //tex1 = mix(tex1, tex2, lerpFactor);
    //if (highPass > skyBlend) tex1 = tex2;
    
    /*vec3 Ds = vec3(0.6, 0.72, -0.34);
    float sun = pow(dot(viewDir, Ds),4.0);
    float glow = dot(viewDir, Ds) * 0.5 + 0.5;
    float a = tex1.w;
    tex1.rgb += pow(sun,4.0) * (1.0 - a) * pow(vec3(246, 234.0 * 0.97, 206.0 * 0.97) / 255.0, vec3(2.2)) * 8.0;
    tex1.rgb += pow(glow,4.0) * (1.0 - a) * pow(vec3(246, 234.0 * 0.97, 206.0 * 0.97) / 255.0, vec3(2.2)) * 1.0;*/
    
    vec3 color = tex1.rgb;
//    vec3 color = gammaCorrectOutput(toneMap(tex1.rgb));
//    color = colorCorrect(color, skyLutTex);    
    gl_FragColor = vec4( color, 1.0 );
}

