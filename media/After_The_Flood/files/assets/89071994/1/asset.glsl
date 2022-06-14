varying vec2 vUv0;

uniform sampler2D uColorBuffer;
uniform vec4 uPixelOffset;

#ifdef THRESHOLD
uniform vec2 uThreshold;
vec4 sampleThreshold(sampler2D tex, vec2 uv) {
    vec4 c = texture2D(tex, uv);
    float luma = dot(c.rgb, vec3(0.2125, 0.7154, 0.0721));
    //return luma < uThreshold ? vec4(0.0) : c;
    return c * clamp(luma * uThreshold.x + uThreshold.y, 0.0, 1.0);
}
#define SAMPLE sampleThreshold
#else
#define SAMPLE texture2D
#endif

void main(void) {
    vec4 color = SAMPLE(uColorBuffer, vUv0) * 2.0;
    
    color += SAMPLE(uColorBuffer, vUv0 + uPixelOffset.xy);
    color += SAMPLE(uColorBuffer, vUv0 - uPixelOffset.xy);
    color += SAMPLE(uColorBuffer, vUv0 + uPixelOffset.zw);
    color += SAMPLE(uColorBuffer, vUv0 - uPixelOffset.zw);
    
    color /= 6.0;
    gl_FragColor = color;
}
