varying vec2 vUv0;

uniform sampler2D uColorBuffer;
uniform vec4 uPixelOffset;

void main(void) {
    
    vec2 halfPixel = uPixelOffset.xy;
    vec2 fullPixel = uPixelOffset.zw;
    
    vec4 color = texture2D(uColorBuffer, vUv0 + vec2(-fullPixel.x, 0.0));
    color += texture2D(uColorBuffer,     vUv0 + vec2(-halfPixel.x, halfPixel.y)) * 2.0;
    color += texture2D(uColorBuffer,     vUv0 + vec2(0.0, fullPixel.y));
    color += texture2D(uColorBuffer,     vUv0 + halfPixel.xy) * 2.0;
    color += texture2D(uColorBuffer,     vUv0 + vec2(fullPixel.x, 0.0));
    color += texture2D(uColorBuffer,     vUv0 + vec2(halfPixel.x, -halfPixel.y)) * 2.0;
    color += texture2D(uColorBuffer,     vUv0 + vec2(0.0, -fullPixel.y));
    color += texture2D(uColorBuffer,     vUv0 - halfPixel.xy) * 2.0;    
    color /= 12.0;
    
    gl_FragColor = color;
}
