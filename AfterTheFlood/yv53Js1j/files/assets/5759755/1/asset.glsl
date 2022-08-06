varying vec2 vUv0;
uniform sampler2D source;

void main(void) {
    
    float offset = 1.0 / 1024.0;
    vec2 c = vec2(0.0);
    for(int y=0; y<4; y++) {
        for(int x=0; x<4; x++) {
            c += texture2D(source, vUv0 + vec2(x,y) * offset).rg;
        }
    }
    c /= 16.0;    
    gl_FragColor = vec4(c, 0.0, 1.0);
}

