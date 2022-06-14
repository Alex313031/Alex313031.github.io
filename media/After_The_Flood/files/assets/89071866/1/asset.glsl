varying vec2 vUv0;

uniform sampler2D uColorBuffer; // TODO: having here multiple samplers breaks combining
uniform sampler2D uBloomImage;
uniform vec4 uPixelOffset;
uniform float uAmount;

void main(void) {
    vec2 halfPixel = uPixelOffset.xy;
    vec2 fullPixel = uPixelOffset.zw;
    
    vec4 color = texture2D(uBloomImage, vUv0 + vec2(-fullPixel.x, 0.0));
    color += texture2D(uBloomImage,     vUv0 + vec2(-halfPixel.x, halfPixel.y)) * 2.0;
    color += texture2D(uBloomImage,     vUv0 + vec2(0.0, fullPixel.y));
    color += texture2D(uBloomImage,     vUv0 + halfPixel.xy) * 2.0;
    color += texture2D(uBloomImage,     vUv0 + vec2(fullPixel.x, 0.0));
    color += texture2D(uBloomImage,     vUv0 + vec2(halfPixel.x, -halfPixel.y)) * 2.0;
    color += texture2D(uBloomImage,     vUv0 + vec2(0.0, -fullPixel.y));
    color += texture2D(uBloomImage,     vUv0 - halfPixel.xy) * 2.0;    
    color /= 12.0;
    vec4 bloom = color;
    bloom.a = 0.0;
    
    vec4 orig = texture2D(uColorBuffer, vUv0);
    gl_FragColor = orig + bloom * uAmount;
}
