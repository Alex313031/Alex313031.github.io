#define simRadius 16.0

attribute vec3 vertex_position;
attribute vec3 vertex_normal;
attribute vec2 vertex_texCoord0;
attribute vec2 vertex_texCoord1;

varying vec4 vUv;
varying vec3 vPositionW, vPositionL, vNormalW;
varying vec4 vRotation;
varying float vHeight;
varying vec2 vAnimUv;

uniform float globalTime;
uniform mat4 matrix_viewProjection;
uniform mat4 matrix_model;

uniform sampler2D sceneHeightmap;

vec2 rotate(vec2 quadXY, float pRotation) {
    float c = cos(pRotation);
    float s = sin(pRotation);

    mat2 m = mat2(c, -s, s, c);

    vRotation = vec4(c, -s, s, c);
    
    return m * quadXY;
}

float unpackFloat(vec4 rgbaDepth) {
    const vec4 bitShift = vec4(1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0);
    return dot(rgbaDepth, bitShift);
}
float sampleHeightMap(vec3 pos) {
    vec2 topUv = (pos.xz/vec2(simRadius,-simRadius))*0.5+0.5;
    float depth = unpackFloat(texture2D(sceneHeightmap, topUv))*-1000.0+100.0;
    return depth>0.01? depth : -1.0;
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

void main(void)
{
    float rnd;
    vec2 quadPos;
    rnd = vertex_texCoord1.y;
    quadPos = vertex_position.xy;
    
    vec2 tiles = vec2(5,1);//vec2(6,7);
    vec2 rnd2 = vec2(rnd, fract(rnd*10.0));
    vUv.xy = quadPos.xy + 0.5; // basic UV
        vUv.xy = vUv.yx;
    vUv.zw = vUv.xy;
    vUv.xy /= tiles; // atlas UV
    vUv.xy += floor(rnd2 * tiles) / tiles; // random offset atlas UV
    
    vec3 worldPos = vertex_normal;
    float quadSize = 0.1 * 3.0;
    float angle = vertex_texCoord1.x;
    
    float levelHeight = sampleHeightMap(worldPos);
    float heightFromGround = worldPos.y - levelHeight;
    vHeight = heightFromGround;

    vec2 animAtlasTiles = vec2(16.0, 5.0);
    vec2 rndA = rnd2;
    rndA.x += fract(globalTime);
    rndA.x = mix(0.25, rndA.x, clamp(heightFromGround,0.0,1.0));
    vAnimUv = vUv.zw;
    vAnimUv /= animAtlasTiles;
    vAnimUv += floor(rndA * animAtlasTiles)/animAtlasTiles;
    
    //quadPos.y += 0.25 * heightFromGround;
    //quadPos = rotate(quadPos, angle);
    
    vec2 quadPosF = quadPos;
    
    float displacement = quadPos.y*quadPos.y * rnd * 2.0;
    vec3 quadNormal = normalize(vec3(0.0, mix(-0.5,0.5,quadPos.y+0.5), 1.0));
    quadPos = rotate(quadPos, (rnd2.x+rnd2.y)*3.14);
    quadNormal.xy = rotate(quadNormal.xy, (rnd2.x+rnd2.y)*3.14);
    vec3 localPos = vec3(quadPos.y, displacement, quadPos.x) * (rnd*0.5+1.0);
    vec3 localNormal = normalize(vec3(quadNormal.y, -quadNormal.z, quadNormal.x));
    
    
    vec3 velocity = vec3(vertex_position.z, vertex_texCoord0);
    //float trembleAmount = min(length(velocity.xz)*100.0*rnd, 32.0);
    //vec2 tremble = vec2(sin(globalTime*trembleAmount), cos(globalTime*trembleAmount)) * 0.25;
    //localPos.zy = rotate(localPos.zy, tremble.x);
    //localPos.xy = rotate(localPos.xy, tremble.y);
    localPos.y += 0.1;//*trembleAmount;
    
    
    float vPhase = globalTime*0.2 + dot(worldPos, vec3(1.0));
    float fSpeed = 0.1;
    vec4 vWaves = (fract(vPhase * vec4(1.975, 0.793, 0.375, 0.193)) * 2.0 - vec4(1.0)) * fSpeed;
    vWaves = SmoothTriangleWave( vWaves );
    vec2 vWavesSum = vWaves.xz + vWaves.yw;
    localPos.xz += vWavesSum * displacement * 4.0;
    
    
    /*quadPosF = rotate(quadPosF, rnd2.y*3.14);
    //vec3 localPosFront = camRight * -quadPosF.x + camUp * quadPosF.y; // flip
    vec3 localPosFront = camRight * quadPosF.x + camUp * quadPosF.y;
        localPosFront *= 2.0;
    localPos = mix(localPos, localPosFront, clamp(heightFromGround,0.0,1.0) );//* rnd2.y);*/
    
#ifdef GL2
    vec3 localPosFront = localPos;
    float anim = (globalTime + rnd2.x*1.6) * 4.0;
    float anim2 = (globalTime + rnd2.y*1.6) * 4.0;
    localPosFront.xz = rotate(localPosFront.xz, anim);
    localPosFront.yx = rotate(localPosFront.yx, anim2);
    //localPos = localPosFront;
    localPos = mix(localPos, localPosFront, clamp(heightFromGround,0.0,1.0) );
    
    vec3 localNormalFront = localNormal;
    localNormalFront.xz = rotate(localNormalFront.xz, anim);
    localNormalFront.yx = rotate(localNormalFront.yx, anim);
    localNormal = mix(localNormal, localNormalFront, clamp(heightFromGround,0.0,1.0) );
    vNormalW = normalize(localNormal);
    
    //localPos.x += 0.25 * heightFromGround;
    //localPos.xz = rotate(localPos.xz, angle);
#endif
    
    vec3 pos = localPos * quadSize + worldPos;
    
#ifndef GL2
    pos.y += levelHeight;
#endif
    
    vPositionL = pos;
    
    vPositionW = (matrix_model * vec4(pos,1)).xyz;
    gl_Position = matrix_viewProjection * vec4(vPositionW, 1.0);
}

