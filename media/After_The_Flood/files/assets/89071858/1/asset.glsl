#define simRadius 16.0

#define attribute0 in
#define attribute1 in
#define attribute2 in
#define attribute3 in
    
attribute0 vec3 vertex_position;
attribute1 vec3 vertex_normal;
attribute2 vec2 vertex_texCoord0;
attribute3 vec2 vertex_texCoord1;

varying vec3 out_vertex_position;
varying vec3 out_vertex_normal;
varying vec2 out_vertex_texCoord0;
varying vec2 out_vertex_texCoord1;

uniform vec3 vortexPos, oldVortexPos, playerPos, playerVel;
uniform sampler2D topMap;

uniform sampler2D sceneHeightmap;
uniform sampler2D curlTex;
uniform vec4 spawnSphere;
uniform float globalTime, deltaTime;


float unpackFloat(vec4 rgbaDepth) {
    const vec4 bitShift = vec4(1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0);
    return dot(rgbaDepth, bitShift);
}
float sampleHeightMap(vec3 pos) {
    //float height = 1.5;//0.0;
    //if (pos.x > -1.1 && pos.x < 1.1 && pos.z > -1.1 && pos.z < 1.1) {
      //  height = 1.0;
    //}
    //float simRadius = 16.0;//8.0;
    vec2 topUv = (pos.xz/vec2(simRadius,-simRadius))*0.5+0.5;
    float d = unpackFloat(texture2D(sceneHeightmap, topUv));
    float depth = d*-1000.0+100.0;
    return depth>0.01? depth : -1.0;
    //return linearizeDepth(texture2D(sceneHeightmap, topUv).r);
    //return height;
}

float topLookup(vec2 uv) {
    vec4 t = texture2D(topMap, uv);
    return t.r - t.g;
}

#define HASHSCALE3 vec3(.1031, .1030, .0973)
/*vec2 hash22(vec2 p) {
	vec3 p3 = fract(vec3(p.xyx) * HASHSCALE3);
    p3 += dot(p3, p3.yzx+19.19);
    return fract((p3.xx+p3.yz)*p3.zy);

}*/

vec3 hash32(vec2 p)
{
	vec3 p3 = fract(vec3(p.xyx) * HASHSCALE3);
    p3 += dot(p3, p3.yxz+19.19);
    return fract((p3.xxy+p3.yzz)*p3.zyx);
}

void main(void) {
    vec3 worldPos = vertex_normal;
    vec3 velocity = vec3(vertex_position.z, vertex_texCoord0);
    float rnd = vertex_texCoord1.y;//abs(vertex_position.x);
    float angle = vertex_texCoord1.x;
    
    if (spawnSphere.w > 0.0 && worldPos.y < -0.5) {//rnd*10.0) {
        worldPos = (hash32(vec2(rnd, globalTime)) * 2.0 - 1.0) * spawnSphere.w + spawnSphere.xyz;
        velocity *= 0.1;
        //worldPos.y = 5.0;
        //worldPos.xz = (hash22(vec2(rnd, globalTime)) * 2.0 - 1.0) * simRadius;//, worldPos.xz, 0.9);
    }
    
    //vec3 vortexPos = vec3(0,0,0);
    float dt = deltaTime;//1.0 / 60.0;
    
    float speed = 1.5 * dt;
    vec3 diff = worldPos - vortexPos;
    float falloff = 1.0 / (dot(diff.xz, diff.xz)/2.0 + 1.0);
    float airFalloff = falloff * 8.0;
    vec3 dir = normalize(vec3(diff.x, 0.0, diff.z));
    vec3 sdir = normalize(cross(dir, vec3(0,1,0)));
    
    vec3 diffOld = worldPos - oldVortexPos; 
    vec3 dirOld = normalize(vec3(diffOld.x, 0.0, diffOld.z));
    vec3 sdirOld = normalize(cross(dirOld, vec3(0,1,0)));
    float falloffOld = 1.0 / (dot(diffOld.xz, diffOld.xz) + 1.0);
    
    /*float angle = atan(dir.z, dir.x);
    angle += speed * falloff;
    vec3 newDir =  vec3(cos(angle), 0, sin(angle));
    vec3 spinDir = normalize(newDir - dir);*/
    
    //worldPos += sdir * speed * falloff;//spinDir;
    //worldPos.y += speed * pow(falloff,4.0)*4.0;
    
    velocity *= 0.25;//0.5;
    
    float levelHeight = sampleHeightMap(worldPos);
    float heightFromGround = worldPos.y - levelHeight;
    heightFromGround *= 2.0;
    
    // circular
    //velocity += sdir;// * speed * falloff;  
    // to the center
    //velocity += -dir;// * speed * falloff;
    //velocity = normalize(velocity) * speed * falloff;
    //velocity += normalize(sdir + mix(-dir, dir, worldPos.y*0.25)) * speed * falloff;
    velocity += normalize(sdir - dir) * speed*rnd * falloff;
    //velocity += sdir * speed * mix(falloff, airFalloff, worldPos.y*0.25);
    //velocity += -dir * speed * falloff;
    // falling outwards + circular
    velocity += dir * heightFromGround * speed * 0.25;
    velocity += sdir * heightFromGround * speed * 0.25;
    
    //velocity += sdirOld * speed * rnd * falloffOld * 0.5;
    
    // gravity
    velocity.y -= 1.0 * dt;

    // upwards
    velocity.y += speed * pow(falloff,4.0) * 2.0 * 1.0 * rnd;// * pow(worldPos.y + 1.0, 2.0);

    
    float prevLevelHeight = levelHeight;
    
    float frictionMask = clamp(heightFromGround/0.1, 0.0,1.0);
    velocity.xz *= fract(angle)>0.8? 1.0 : frictionMask;//mix(frictionMask, 1.0, fract(angle));
    
    
    float playerRadius = 0.5;
    //float playerDist = 1.0 - clamp(distance(playerPos.xz, worldPos.xz) / playerRadius, 0.0, 1.0);
    vec2 diffP = playerPos.xz - worldPos.xz;
    float playerDist = 1.0 - clamp(dot(diffP,diffP) / (playerRadius*playerRadius), 0.0, 1.0);
    velocity += playerVel * playerDist * rnd;
    
    float turbulence = texture2D(curlTex, worldPos.xz/32.0 + vec2(globalTime, globalTime) * 0.1).r;
    turbulence *= turbulence;
    turbulence *= turbulence;
    //velocity += turbulence * 0.01 * vec3(1, 1.25, 1) * (1.0-rnd);
    
    
    //float simRadius = 16.0;//8.0;
    vec2 topUv = (worldPos.xz/vec2(simRadius,-simRadius))*0.5+0.5;
    vec2 offset = vec2(1.0/256.0, 0.0);
    vec2 slope = vec2(topLookup(topUv+offset.xy) - topLookup(topUv-offset.xy),
                      topLookup(topUv+offset.yx) - topLookup(topUv-offset.yx));
    slope.x *= -1.0;
    slope.y *= 1.0;
    velocity.xz += slope * dt * 0.25;// * 4.0;
    
    /*float simRadius = 8.0;
    vec3 top = texture2D(topMap, ((worldPos.xz + velocity.xz)/vec2(simRadius,-simRadius))*0.5+0.5).rgb;
    if (top.r - top.g > 0.5) {
        velocity.xz = vec2(0.0);
    }*/
    
    
    worldPos.xz += velocity.xz;
    levelHeight = sampleHeightMap(worldPos);
    if (worldPos.y < levelHeight) {
        worldPos.xz -= velocity.xz;
        velocity.xz = vec2(0.0);
        levelHeight = prevLevelHeight;
    }
    worldPos.y += velocity.y;
    worldPos.y = max(worldPos.y, levelHeight+0.001);
    
    angle += length(velocity) * rnd * heightFromGround * 2.0;
    
    
    out_vertex_position = vec3(vertex_position.xy, velocity.x);
    out_vertex_normal = worldPos;
    out_vertex_texCoord0 = velocity.yz;
    out_vertex_texCoord1 = vec2(angle, vertex_texCoord1.y);
}
