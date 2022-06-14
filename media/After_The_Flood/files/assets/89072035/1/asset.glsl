varying vec2 vUv0;
uniform sampler2D uScreen, uScreenDepth;
uniform sampler2D sceneHeightmap;

precision highp sampler3D;
uniform sampler3D skyLutTex;

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

float unpackFloat(vec4 rgbaDepth) {
    const vec4 bitShift = vec4(1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0);
    return dot(rgbaDepth, bitShift);
}

void main(void) {
    gl_FragColor = texture2D(uScreen, vUv0);
    gl_FragColor.rgb = toneMap(gl_FragColor.rgb);
    gl_FragColor.rgb = gammaCorrectOutput(gl_FragColor.rgb);
    gl_FragColor.rgb = colorCorrect(gl_FragColor.rgb, skyLutTex);
    
    //gl_FragColor.rgb = vec3(unpackFloat(texture2D(sceneHeightmap, vUv0))*-1000.0+100.0);
    
    //gl_FragColor = vUv0.x<0.5? gl_FragColor : texture2D(uScreenDepth, vUv0)/2.0;
}

