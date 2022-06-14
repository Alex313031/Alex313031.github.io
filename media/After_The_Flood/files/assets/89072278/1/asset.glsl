
uniform vec3 fog_color;
uniform float fog_density;

vec3 addFog(vec3 color) {
    float depth = distance(vPositionW, view_position);

    float fogFactor = exp(-depth * fog_density);
    fogFactor = clamp(fogFactor, 0.0, 1.0);

    vec3 result = mix(fog_color, color, fogFactor);
    return result;
}

