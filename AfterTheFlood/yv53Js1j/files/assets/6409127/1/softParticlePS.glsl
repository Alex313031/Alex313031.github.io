uniform sampler2D texture_opacityMap, uScreenDepth;
uniform vec4 uScreenSize;
uniform float camera_near, camera_far;
uniform mat4 matrix_viewProjection;
uniform float softening;
uniform float material_opacity;

float linearizeDepth(float d) {
    float n = camera_near;
    float f = camera_far;
    return (2.0 * n) / (f + n - d * (f - n));
    //return -((2.0*f*n)/(f-n)) / (d - (f+n)/(f-n));
}

float linearizeDepth(vec2 d) {
    return linearizeDepth( (d.x/d.y)*0.5+0.5 );
}

void getOpacity() {
    dAlpha = texture2D(texture_opacityMap, $UV).$CH;
    
    float myDepth = linearizeDepth((matrix_viewProjection * vec4(vPositionW,1.0)).zw);
    float depth = linearizeDepth(texture2D(uScreenDepth, gl_FragCoord.xy * uScreenSize.zw).r);
    //float softening = 200.0;
    //float depthDiff = saturate(pow(abs(myDepth - depth) * softening, 0.5));
    float depthDiff = saturate(softening * (depth - myDepth));
    
    float waterDiff = saturate(vPositionW.y / 3.0);
    
    vec3 viewDir = normalize(view_position - vPositionW);
    float angleDiff = saturate(dot(-vNormalW, viewDir) * 4.0);
    //angleDiff = pow(angleDiff, 0.5);
    angleDiff *= angleDiff;
    
    dAlpha *= depthDiff * waterDiff * angleDiff * material_opacity;
}

