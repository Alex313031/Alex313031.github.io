#define simRadius 16.0    
    
    vec3 pos = vPositionW - leavesPos;
    //float simRadius = 16.0;
    vec2 topUv = (pos.xz/vec2(simRadius,-simRadius))*0.5+0.5;
    float height = 0.0;
    if (pos.x > -1.1 && pos.x < 1.1 && pos.z > -1.1 && pos.z < 1.1) {
        height = 1.0;
    }
    height = height/4.0 + 0.01;
    //vec2 avgBlocker = vec2(0.0);
    vec3 shadow = vec3(0.0);
    vec2 offsets[8];
    const float offsetSize = 1.0/128.0;
    offsets[0] = vec2(-0.409128, -0.238135) * offsetSize;
    offsets[1] = vec2(-0.2767566, -0.7708896) * offsetSize;
    offsets[2] = vec2(-0.510359, 0.3074695) * offsetSize;
    offsets[3] = vec2(0.4547283, 0.2265625) * offsetSize;
    offsets[4] = vec2(-0.01454435, 0.6510762) * offsetSize;
    offsets[5] = vec2(0.2898484, -0.4668662) * offsetSize;
    offsets[6] = vec2(0.8402197, -0.2982866) * offsetSize;
    offsets[7] = vec2(0.7034608, 0.6736597) * offsetSize;
    /*for(int i=0; i<8; i++) {
        float shadowHeight = texture2D(topMap, topUv + offsets[i]).a;
        //shadow += height < shadowHeight? (1.0/8.0) : 0.0;
        if (height < shadowHeight) avgBlocker += vec2(shadowHeight, 1.0);
    }
    avgBlocker.x /= avgBlocker.y;
    avgBlocker.x = mix(0.25, 1.0, avgBlocker.x);*/

    if (vNormalW.y > 0.0) {

        for(int i=0; i<8; i++) {
            float shadowHeight = texture2D(topMap, topUv + offsets[i]).a;
            shadow += height < shadowHeight? vec3(1.0/8.0, shadowHeight, 1.0) : vec3(0.0);
        }
        shadow.x = 1.0-shadow.x*0.3;
        shadow.y /= shadow.z;
        dDiffuseLight *= mix(shadow.x, 1.0, saturate(shadow.y));

        vec4 top = texture2D(topMap, topUv);
        float groundShadow = saturate((top.r - top.g) * 4.0);
        dDiffuseLight *= mix(1.0, 1.0 - groundShadow, saturate(vNormalW.y));
        
    }

   gl_FragColor.rgb = combineColor();
   gl_FragColor.rgb += getEmission();
   gl_FragColor.rgb = addFog(gl_FragColor.rgb);
   gl_FragColor.rgb = toneMap(gl_FragColor.rgb);
   gl_FragColor.rgb = gammaCorrectOutput(gl_FragColor.rgb);


