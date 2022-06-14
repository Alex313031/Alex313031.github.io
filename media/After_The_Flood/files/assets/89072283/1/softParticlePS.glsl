uniform sampler2D texture_opacityMap;
uniform mat4 matrix_viewProjection;
uniform float softening;
uniform float material_opacity;

void getOpacity() {
    dAlpha = texture2D(texture_opacityMap, $UV).$CH;
    
    float myDepth = getLinearDepth(vPositionW);
    float depth = getLinearScreenDepth();
    
    //float softening = 200.0;
    //float depthDiff = saturate(pow(abs(myDepth - depth) * softening, 0.5));
    //float depthDiff = saturate(softening * (myDepth - depth));
    
    float softening2 = 200.0;
    softening2 *= 0.002;
    float depthDiff = saturate(pow(abs(myDepth - depth) * softening2, 0.5));
    
    float waterDiff = saturate(vPositionW.y / 3.0);
    
    vec3 viewDir = normalize(view_position - vPositionW);
    float angleDiff = saturate(dot(-vNormalW, viewDir) * 4.0);
    //angleDiff = pow(angleDiff, 0.5);
    angleDiff *= angleDiff;
    
    dAlpha *= depthDiff * waterDiff * angleDiff * material_opacity;
}

