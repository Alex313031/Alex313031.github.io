varying vec4 vUv;
varying vec3 vPositionW;
varying vec4 vRotation;
varying float vHeight;

uniform sampler2D opacityMap;

void main(void) {
    
    vec2 uv = vUv.xy;
    float opacity = texture2D(opacityMap, uv).g;    
    if (opacity < 0.1) discard;

    uv = vUv.zw;
    uv = uv*2.0-1.0;
    float gradient = 1.0-length(uv);//dot(uv, uv);
    gradient *= 0.125;
    
    gl_FragColor = vec4(gradient, gradient*vHeight, 0, vHeight/4.0);
}

