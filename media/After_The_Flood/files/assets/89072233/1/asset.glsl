varying vec2 vUv0;

#define MOD3 vec3(.1031,.11369,.13787)
vec3 hash33(vec3 p3)
{
	p3 = fract(p3 * MOD3);
    p3 += dot(p3, p3.yxz+19.19);
    return -1.0 + 2.0 * fract(vec3((p3.x + p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
}
vec3 hash33U(vec3 p3)
{
	p3 = fract(p3 * MOD3);
    p3 += dot(p3, p3.yxz+19.19);
    return fract(vec3((p3.x + p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
}
float perlin_noise(vec3 p, float freq, float zoff)
{
    p.z += zoff;
    p.z = fract(p.z);
    
    p *= freq;
    
    vec3 pi = floor(p);
    vec3 pf = p - pi;
    
    vec3 w = pf * pf * (3.0 - 2.0 * pf);
    
    float nx = pi.x<0.01? freq : pi.x;
    float ny = pi.y<0.01? freq : pi.y;
    float nz = pi.z<0.01? freq : pi.z;
    
    return  mix(
                mix(
                    mix(dot(pf - vec3(0, 0, 0), hash33(vec3(nx, ny,nz))),
                        dot(pf - vec3(1, 0, 0), hash33(vec3(pi.x+1.0, ny, nz))),
                        w.x),
                    mix(dot(pf - vec3(0, 0, 1), hash33(vec3(nx, ny, pi.z+1.0))),
                        dot(pf - vec3(1, 0, 1), hash33(vec3(pi.x+1.0, ny, pi.z+1.0))),
                        w.x),
                    w.z),
                mix(
                    mix(dot(pf - vec3(0, 1, 0), hash33(vec3(nx, pi.y+1.0, nz))),
                        dot(pf - vec3(1, 1, 0), hash33(vec3(pi.x+1.0, pi.y+1.0, nz))),
                        w.x),
                    mix(dot(pf - vec3(0, 1, 1), hash33(vec3(nx, pi.y+1.0, pi.z+1.0))),
                        dot(pf - vec3(1, 1, 1), hash33(pi + vec3(1, 1, 1))),
                        w.x),
                    w.z),
                w.y);
}

float worley(vec3 n,float s)
{
    n *= s;
    
    float dis = 1.0;
    for(int x = -1;x<=1;x++)
    {
        for(int y = -1;y<=1;y++)
        {
            for(int z = -1;z<=1;z++)
            {
                vec3 p = floor(n) + vec3(x,y,z);

                vec3 pp = p;
                if (pp.x < 0.0) pp.x = s + pp.x;
                if (pp.y < 0.0) pp.y = s + pp.y;
                if (pp.z < 0.0) pp.z = s + pp.z;

                if (pp.x > 1.0) pp.x = pp.x - s;
                if (pp.y > 1.0) pp.y = pp.y - s;
                if (pp.z > 1.0) pp.z = pp.z - s;

                p = hash33U(pp) + vec3(x,y,z) - fract(n);
                dis = min(dis, dot(p, p));
            }
        }
    }
    return 1.0 - sqrt(dis);
	
}

void main() {
    vec3 uv = vec3(vUv0, 0.0);

    // output volume
    // 128x128 slices in 2048x1024 texture
    //uv.x *= 16.0;
    //uv.y *= 8.0;
    //uv.z = floor(uv.y)/8.0 + floor(uv.x)/128.0;
    //uv = fract(uv);
    
    // v2 for direct copying
    // each 128x128 quad is 2048x8
    uv.x = fract(vUv0.x * 16.0);
    uv.y = fract(vUv0.y * 128.0) + floor(vUv0.x * 16.0) * (1.0/128.0);
    uv.z = floor(vUv0.y * 128.0) / 128.0;
    
    float dis = (1.0+perlin_noise(uv, 8.0, 0.0)) 
        * (1.0+(worley(uv, 16.0)+
        0.5*worley(uv, 32.0) +
        0.25*worley(uv,64.0) ));
	
    float dis2 = 
        (1.0+(worley(uv, 16.0 * 2.0)+
        0.5*worley(uv, 32.0 * 2.0) +
        0.25*worley(uv,64.0 * 2.0) ));
    
    float dis3 = 
        (1.0+(worley(uv, 16.0 * 4.0)+
        0.5*worley(uv, 32.0 * 4.0) +
        0.25*worley(uv,64.0 * 4.0) ));
    
    float dis4 = 
        (1.0+(worley(uv, 16.0 * 8.0)+
        0.5*worley(uv, 32.0 * 8.0) +
        0.25*worley(uv,64.0 * 8.0) ));
    
    gl_FragColor = vec4(dis,dis2,dis3,dis4)/4.0;
    
    //gl_FragColor = vec4(uv,1.0);
    
    //fragColor = vec4(uv.z);
    //fragColor = vec4(worley(uv, 8.0));
    //fragColor = vec4(perlin_noise(vec3(uv,0.0), 8.0, iGlobalTime*0.05));
    //fragColor = vec4(perlin_noise(vec3(uv, 0.0), 8.0)*0.5+0.5);
    
    //fragColor = vec4(uv.xy,0,0);
}

