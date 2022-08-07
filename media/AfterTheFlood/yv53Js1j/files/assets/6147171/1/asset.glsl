#define WINDSPEED 1.0

uniform vec3 treeSize;
uniform float globalTime;
uniform float isLeaves;
uniform float windAmplitude;
varying vec3 testVec;

mat4 getModelMatrix() {
    return matrix_model;
}

vec3 unpack3NFloats(float src) {
    float r = fract(src);
    float g = fract(src * 256.0);
    float b = fract(src * 65536.0);
    return vec3(r, g, b);
}

vec2 rotate(vec2 quadXY, float pRotation) {
    float c = cos(pRotation);
    float s = sin(pRotation);
    mat2 m = mat2(c, -s, s, c);
    return m * quadXY;
}

float SmoothCurve( float x ) {  
    return x * x *( 3.0 - 2.0 * x );     
}  
vec4 SmoothCurve( vec4 x ) {  
    return x * x *( 3.0 - 2.0 * x );  
}  
vec4 TriangleWave( vec4 x ) {  
    return abs( fract( x + 0.5 ) * 2.0 - 1.0 );  
}  
vec4 SmoothTriangleWave( vec4 x ) {  
    return SmoothCurve( TriangleWave( x ) );  
}  

vec3 rotateAround(vec3 pos) {
    float falloff = clamp(pos.z / 16.0, 0.0, 1.0);
    
    float vPhase = globalTime * WINDSPEED;
    float wave = ((cos(vPhase))) * 0.1;
    
    pos.yz = rotate(pos.yz, wave * 0.35 * falloff);
    return pos;
}

vec3 rotateAround(vec3 pos, vec3 parentPos, mat3 rotMatrix, vec3 dir) {
    
    pos -= parentPos;
    float falloff = clamp(length(pos) / 3.5, 0.0, 1.0);
    pos = pos * rotMatrix; // inverse transform
    
    //pos.xz = rotate(pos.xz, globalTime);
    
#ifdef BUSH
    float vPhase = globalTime * WINDSPEED + dot(dir*3.0 + matrix_model[3].xyz, vec3(1.0));
#else
    float vPhase = globalTime * WINDSPEED + dot(parentPos, vec3(1.0));
#endif
    
    //float fSpeed = 0.1;
    //vec4 vWaves = (fract(vPhase * vec4(1.975, 0.793, 0.375, 0.193)) * 2.0 - vec4(1.0)) * fSpeed;
    //vWaves = SmoothTriangleWave( vWaves );
    //vec2 vWavesSum = vWaves.xz + vWaves.yw;
    
    //vWavesSum.x = SmoothCurve(abs(cos(vPhase))) * 0.1;
    float wave = SmoothCurve(abs(cos(vPhase))) * 0.1;
    
    pos.yz = rotate(pos.yz, wave * 0.5 * falloff * windAmplitude);
    //if (dir.y > 0.0) {
        //pos.yz = rotate(pos.yz, vWavesSum.x * 4.0);
    //} else {
        //pos.xz = rotate(pos.xz, vWavesSum.x * 4.0);
    //}
    
    pos = rotMatrix * pos; // transform
    pos += parentPos;
    return pos;
}

mat3 matrixFromVector(vec3 n) { // frisvad
    //float a = 1.0 / (1.0 + n.z);
    //float b = -n.x * n.y * a;
    //vec3 b1 = vec3(1.0 - n.x * n.x * a, b, -n.x);
    //vec3 b2 = vec3(b, 1.0 - n.y * n.y * a, -n.y);
    //return mat3(b1, b2, n);
    vec3 up = vec3(0,0,1);
    vec3 r = normalize(cross(n, up));
    up = normalize(cross(n, r));
    return mat3(r, up, n);
}

vec4 getPosition() {
    dModelMatrix = getModelMatrix();
    
    vec3 pos = vertex_position;
    /*vec2 packedVectors = vertex_texCoord1;
    vec2 packedLengths = vertex_color.rg;
    const float maxDist = 3.5;
    
    if (packedVectors.x > 0.0001) {
        vec3 v1 = normalize(unpack3NFloats(packedVectors.x) * 2.0 - vec3(1.0));
        float len1 = packedLengths.x * maxDist;
        vec3 parentPos = vertex_position + v1 * len1;
        pos = rotateAround(pos, parentPos);;
    }
    
    if (packedVectors.y > 0.0001) {
        vec3 v2 = normalize(unpack3NFloats(packedVectors.y) * 2.0 - vec3(1.0));
        float len2 = packedLengths.y * maxDist;
        vec3 parentPos2 = vertex_position + v2 * len2;
        pos = rotateAround(pos, parentPos2);;
    }*/
    
    /*vec3 size = vec3(254.516, 240.405, 320.419) * 0.0254;
    vec2 p1xy = ((vertex_texCoord1.xy / 4096.0) - vec2(0.5)) * size.xy;
    vec2 p2xy = (fract(vertex_texCoord1.xy) - vec2(0.5)) * size.xy;
    vec3 pos1 = vec3(p1xy, vertex_color.r * size.z);
    vec3 pos2 = vec3(p2xy, vertex_color.g * size.z);
    if (length(pos1) > 0.01) {
        pos = rotateAround(pos, pos1);
    }*/
    
    if (isLeaves > 0.5) {
        float falloff = vertex_texCoord0.y;
        float vPhase = globalTime * WINDSPEED + dot(pos, vec3(1.0));
        float fSpeed = 0.1;
        vec4 vWaves = (fract(vPhase * vec4(1.975, 0.793, 0.375, 0.193)) * 2.0 - vec4(1.0)) * fSpeed;
        vWaves = SmoothTriangleWave( vWaves );
        vec2 vWavesSum = vWaves.xz + vWaves.yw;
        pos += vWavesSum.xxy * vertex_normal * falloff;
    }
    
#ifdef BUSH
    vec3 dir1 = normalize(vertex_color.rgb*2.0-1.0);
    mat3 rotMatrix1 = matrixFromVector(dir1);
    pos = rotateAround(pos, vec3(0.0), rotMatrix1, dir1);
    testVec = pos;
#else
    vec3 size = treeSize * 0.0254 / 0.30480000376701355;
    vec3 pos1 = (unpack3NFloats(vertex_texCoord1.x) - vec3(0.5, 0.5, 0.0));// * size;
    vec3 pos2 = (unpack3NFloats(vertex_texCoord1.y) - vec3(0.5, 0.5, 0.0));// * size;
    
    vec3 dir1 = normalize(vertex_color.rgb*2.0-1.0);
    vec3 dir2 = normalize(pos1 - pos2);
    
    mat3 rotMatrix1 = matrixFromVector(dir1);
    mat3 rotMatrix2 = matrixFromVector(dir2);
    
    if (length(pos1) > 0.03) {
        //float falloff = clamp(distance(pos, pos1*size) / 3.5, 0.0, 1.0);
        pos = rotateAround(pos, pos1*size, rotMatrix1, dir1);//, falloff);
    }
    if (length(pos2) > 0.03) {
        //float falloff = clamp(distance(pos, pos2*size) / 3.5, 0.0, 1.0);
        pos = rotateAround(pos, pos2*size, rotMatrix2, dir2);//, falloff);
    }
    pos = rotateAround(pos);
    
    testVec = (pos1);
#endif

    vec4 posW = dModelMatrix * vec4(pos, 1.0);
    dPositionW = posW.xyz;
    return matrix_viewProjection * posW;
}

vec3 getWorldPosition() {
    return dPositionW;
}

