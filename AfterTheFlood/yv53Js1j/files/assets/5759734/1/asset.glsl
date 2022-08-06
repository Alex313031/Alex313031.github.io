vec3 toneMap(vec3 c) {
    return c;
}

vec3 gammaCorrectOutput(vec3 c) {
    return c;
}

#define ENCODE
vec4 encode(vec4 c) {
    c.rgb = pow(c.rgb, vec3(0.5));
    c.rgb /= 8.0;
    c.a = clamp( max( max( c.r, c.g ), max( c.b, 1.0 / 255.0 ) ), 0.0,1.0 );
    c.a = ceil(c.a * 255.0) / 255.0;
    c.rgb /= c.a;
    return c;
}

varying vec3 vViewDir;
vec3 genDirection() {
    vec2 slopes = vec2(1.0) - abs(vViewDir.xy);
    float y = min(slopes.x, slopes.y);
    return normalize(vec3(vViewDir.x, y, vViewDir.y));
}
