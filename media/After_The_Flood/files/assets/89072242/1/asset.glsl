varying vec2 vUv0;
uniform float globalTime;

const float hardness = 0.1;
const int iterations = 2;
const float speed = 1.5;
const float intensity = 0.2;
// Slow, but more octaves
//#define COMPLEX
#define TILED
// Hash function from https://www.shadertoy.com/view/4djSRW
#define HASHSCALE4 vec4(1031, .1030, .0973, .1099)
vec4 hash43(vec3 p)
{
    vec4 p4 = fract(vec4(p.xyzx)  * HASHSCALE4);
    p4 += dot(p4, p4.wzxy+19.19);
    return fract((p4.xxyz+p4.yzzw)*p4.zywx);
}
float drip(vec2 uv, vec2 pos, float age, float scale, float cells) {
    vec2 vD = vec2 (uv - pos);
    float fD = sqrt(dot (vD, vD)) * 2.0 * (cells/16.0);
    float fDa = 10.0 * fD;
    float freq = 300.0 * scale;
    return    max (0.0, 1.0 - fDa*fDa)
            * sin ((fD*freq - age*40.0*(scale*2.0-1.0))*hardness);
}
// Based on texture bombing: http://http.developer.nvidia.com/GPUGems/gpugems_ch20.html
float drops(vec2 uv, float cells) {
    float height = 0.0;
    vec2 cell = floor(uv * cells);
    for(int iter=0; iter<iterations; iter++) {
        for(int i = -1; i <= 1; i++) {
          for(int j = -1; j <= 1; j++) {
            vec2 cell_t = cell + vec2(i, j);
            vec2 uv_t = uv;
 #ifdef TILED
              // could be simplified...
              if (cell_t.x<0.0) {
                  cell_t.x += cells;
                  uv_t.x += 1.0;
              } else if (cell_t.x>cells-1.0) {
                  cell_t.x -= cells;
                  uv_t.x -= 1.0;
              }
              
              if (cell_t.y<0.0) {
                  cell_t.y += cells;
                  uv_t.y += 1.0;
              } else if (cell_t.y>cells-1.0) {
                  cell_t.y -= cells;
                  uv_t.y -= 1.0;
              }
 #endif
            vec4 rnd_t = hash43(vec3(cell_t, float(iter)));
            vec2 pos_t = (cell_t+rnd_t.xy)/cells;
            float age_t = (globalTime*speed + rnd_t.z);
            float scale_t = rnd_t.w;
            height += drip(uv_t, pos_t, age_t, scale_t, cells);
          }
        }
    }
    return height;
}

float drip2(vec2 uv, vec2 pos, float age, float scale, float cells) {
    vec2 vD = vec2 (uv - pos);
    float fD = sqrt (dot (vD, vD)) * 5.0 * (cells/16.0) * (scale+1.0);
    float fDa = 10.0 * (fD - age + 0.6);
    float freq = 150.0;
    return (1.0 - age)
            * max (0.0, 1.0 - (fDa*fDa))
            * sin ((fD*freq - age*80.0));//*hardness);
}

float drops2(vec2 uv, float cells) {
    float height = 0.0;
    vec2 cell = floor(uv * cells);
    for(int iter=0; iter<4; iter++) {
        for(int i = -1; i <= 1; i++) {
          for(int j = -1; j <= 1; j++) {
            vec2 cell_t = cell + vec2(i, j);
            vec4 rnd_t = hash43(vec3(cell_t, float(iter)));
            vec2 pos_t = (cell_t+rnd_t.xy)/cells;
            float age_t = fract(globalTime*0.1 + rnd_t.z);
            //  float age_t = (iGlobalTime*speed + rnd_t.z);
            float scale_t = rnd_t.w;
            height += drip2(uv, pos_t, age_t, scale_t, cells);
          }
        }
    }
    return height;
}
float heightmap2(vec2 uv) {
    float height = 0.0;
    height += drops2(uv, 1.0);
    return height / 2.0;
}
vec2 dudvmap2(vec2 uv) {
    const float eps = 0.01;
    vec2 offset = vec2(eps, 0.0);
    return vec2(
        heightmap2(uv+offset.xy) - heightmap2(uv-offset.xy),
        heightmap2(uv+offset.yx) - heightmap2(uv-offset.yx)
    );
}


float heightmap(vec2 uv) {
    float height = 0.0;
 #ifdef COMPLEX
    height += drops(uv, 32.0);
    height += drops(uv, 16.0);
    height += drops(uv, 8.0);
    height += drops(uv, 4.0);
    height += drops(uv, 2.0);
    height /= 8.0;
 #else
    height += drops(uv, 8.0);
    height += drops(uv, 4.0);
    height /= 5.0;
 #endif
    return height * intensity ;//+ dripHeight(uv)*0.5;
}
vec2 dudvmap(vec2 uv) {
    const float eps = 0.01;
    vec2 offset = vec2(eps, 0.0);
    return vec2(
        heightmap(uv+offset.xy) - heightmap(uv-offset.xy),
        heightmap(uv+offset.yx) - heightmap(uv-offset.yx)
    );
}

void main() {
    vec2 tc = vUv0;
    vec2 ddv = dudvmap(tc + vec2(0,-globalTime*0.05));
    vec3 normal = normalize( vec3(ddv, sqrt(max(1.0-dot(ddv,ddv),0.0))) ).xyz;//xzy;
    gl_FragColor = vec4(normal*0.5+vec3(0.5), 1.0);
}

