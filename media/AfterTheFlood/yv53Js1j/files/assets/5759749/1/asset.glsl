varying vec2 vUv0;

uniform sampler2D skyLutTex;

void main() {

    // map 16x16 quads to
    // 256x1 lines
    // for direct copying to 3D texture
    //vec2 uv;
    //uv = floor(gl_FragCoord.xy);
    //uv = vec2(mod(uv.x, 16.0) + uv.y*16.0,
    //          floor(uv.x/16.0)) / vec2(256, 16);
    //uv.y = 1.0 - uv.y;
    
    // map 64x64 quads to
    // 4096x1 lines
    // for direct copying to 3D texture
    /*vec2 uv;
    uv = floor(gl_FragCoord.xy);
    uv = vec2(mod(uv.x, 64.0) + uv.y*64.0,
              floor(uv.x/64.0));// / vec2(4096, 64);    
    uv = vec2(mod(uv.x, 512.0),
              uv.y + floor(uv.x/512.0)*64.0) / vec2(512, 512);
    uv.y = 1.0 - uv.y;*/
    
    vec2 uv = vUv0;
    
    gl_FragColor = texture2D(skyLutTex, uv);
}

