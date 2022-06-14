varying vec2 vUv0;
uniform sampler2D source;

void main() {
    vec2 offset = vec2(1.0) / vec2(22,9);
    vec3 c = texture2D(source, vUv0).xyz;
    vec3 r = texture2D(source, vUv0 + vec2(offset.x,0)).xyz;
    vec3 b = texture2D(source, vUv0 + vec2(0,offset.y)).xyz;

    vec3 r2 = texture2D(source, vUv0 + vec2(offset.x,0)*2.0).xyz;
    vec3 b2 = texture2D(source, vUv0 + vec2(0,offset.y)*2.0).xyz;
    //vec3 r2 = texture2D(source, vUv0 + offset).xyz;
    //vec3 b2 = texture2D(source, vUv0 + vec2(-offset.x,offset.y)).xyz;
    
    // TODO: disjoint left and right?
    
    vec4 lengths = vec4(
        distance(c,r),
        distance(c,b),
            distance(c,r2),
            distance(c,b2)
    );
    
    gl_FragColor = vec4(lengths);//, 0, 1);
}

