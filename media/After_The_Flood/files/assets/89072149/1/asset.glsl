#define SAMPLES 8

varying vec2 vUv0;
uniform sampler2D source;
uniform vec2 pixelOffset;

#ifdef GAUSS
uniform float weight[SAMPLES];
#endif

void main(void) {
    vec4 color = vec4(0.0);
    vec2 uv = vUv0;// - pixelOffset * (float(SAMPLES) * 0.5);
    if (pixelOffset.x > 0.0000001) {
        uv -= pixelOffset * (float(SAMPLES) * 0.5);
    } else {
        //uv -= pixelOffset * (float(SAMPLES) * 0.5);
    }
    for(int i=0; i<SAMPLES; i++) {
        vec4 c;
        if (pixelOffset.x > 0.0000001) {
            c = texture2D(source, uv + pixelOffset * float(i));
        } else {
            c = texture2D(source, uv - pixelOffset * float(i));
        }

        #ifdef GAUSS
        color += c * weight[i];
        #else
        color += c;
        #endif
    }

    #ifndef GAUSS
    color /= float(SAMPLES);
    #endif

    gl_FragColor = color;
}

