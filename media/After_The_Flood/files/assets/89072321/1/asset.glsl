uniform sampler2D texture_emissiveMap;
uniform float material_emissiveIntensity;
vec3 getEmission() {
    dViewDirW = normalize(view_position - vPositionW);
    float translucency = saturate(dot(dLightDirNormW, -vNormalW));
    translucency *= saturate(dot(dViewDirW, dLightDirNormW));
    float sqrDist = dot(dLightDirW, dLightDirW);
    float falloff = 1.0 / (sqrDist + 1.0);
    translucency *= falloff * 4.0;
    translucency = saturate(translucency + 0.0025);
    return $texture2DSAMPLE(texture_emissiveMap, $UV).$CH * material_emissiveIntensity * vVertexColor.a * 2.0 * translucency*100.0;
}

