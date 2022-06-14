uniform float wirePixelScale, WIRERADIUS;
varying float wireFade;

//#define WIRERADIUS (1.0 * 0.02539999969303608)

mat4 getModelMatrix() {
    return matrix_model;
}

vec4 getPosition() {
    dModelMatrix = getModelMatrix();
    vec4 posW = dModelMatrix * vec4(vertex_position, 1.0);
    
    
    // Compute view-space w
    //mat4 tvp = transpose(matrix_viewProjection);
    //float w = dot(tvp[3], posW);
    vec4 vp3 = vec4(matrix_viewProjection[0].w, matrix_viewProjection[1].w, matrix_viewProjection[2].w, matrix_viewProjection[3].w);
    float w = dot(vp3, posW);

    // Compute what radius a pixel wide wire would have
    float pixel_radius = w * wirePixelScale;

    // Clamp radius to pixel size. Fade out with the reduction in radius versus original.
    float Radius = WIRERADIUS; // customizable
    float initialRadius = WIRERADIUS; // original from the model
    float radius = max(Radius, pixel_radius);
    float fade = Radius / radius;

    // Compute final position
    mat3 nmatrix = mat3(dModelMatrix);
    vec3 normal = normalize(nmatrix * vertex_normal);
    posW.xyz = posW.xyz + (radius - initialRadius) * normal;
    wireFade = fade;
        
    
    dPositionW = posW.xyz;
    return matrix_viewProjection * posW;
}

vec3 getWorldPosition() {
    return dPositionW;
}

