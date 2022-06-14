varying vec2 vUv0;
uniform sampler2D uColorBuffer;

#ifndef GL2
#undef CC
#endif

#ifdef CC
precision highp sampler3D;
uniform sampler3D lutTex;

vec3 colorCorrect(vec3 color, sampler3D lut) {
    const float lutSize = 16.0;//64.0;
    const float a = (lutSize - 1.0) / lutSize;
    const float b = 1.0 / (2.0 * lutSize);
    const vec3 scale = vec3(a, a, a);
    const vec3 offset = vec3(b, b, b);
    return texture(lut, clamp(color,vec3(0.0),vec3(1.0)) * scale + offset).rgb;
}
#endif

void main(void) {
    gl_FragColor = texture2D(uColorBuffer, vUv0);
    gl_FragColor.rgb = toneMap(gl_FragColor.rgb);
    gl_FragColor.rgb = gammaCorrectOutput(gl_FragColor.rgb);
#ifdef CC
    gl_FragColor.rgb = colorCorrect(gl_FragColor.rgb, lutTex);
#endif
}

