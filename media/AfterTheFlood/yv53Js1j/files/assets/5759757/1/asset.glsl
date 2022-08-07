varying vec2 vUv0;
uniform float globalTime;

#define NUM_DRIPS 0
#define NUM_DRIPS2 0//64
#define NUM_DRIPS3 64
float Seed;
void srand (float t)
{
    Seed = 0.5 + (sin (t*59.0) + sin (t*73.0) + sin (t*97.0))/6.0;
}
float rand()
{
    Seed = 0.25 + 0.5*Seed + 0.25*sin (12345.0 * Seed);
    return Seed;
}
vec2 dripPos (float fTime, out float fAge)
{
    float t = floor (fTime*0.1);
    srand (t);
    fAge = fTime*0.1 - t;
    return vec2 (rand(), rand());
}
float dripHeight(vec2 vRel) {
    
    vRel /= 0.1;
    //vRel -= view_position.xz;
    vRel *= 0.0035;//5;
    vRel += 0.5;
    
    float t = globalTime * 0.5;
    float fStep = 123.456;
    float fHeight = 0.0;
    
    // medium
    /*for (int i = 0; i < NUM_DRIPS; i++)
    {
        float fAge;
        vec2 vRnd = dripPos (t, fAge);

        //fHeight += dispersion2d(vRel - vRnd, fAge);

        vec2 vD = vec2 (vRel - vRnd);
        float fD = sqrt (dot (vD, vD));

        float fDa = 10.0 * (fD - fAge + 0.6);

        fHeight += (1.0 - fAge) 
            * max (0.0, 1.0 - (fDa*fDa))
            * sin (fD*150.0 - fAge*80.0);
        
        t += fStep;
    }*/

    vRel -= 0.5;
    vRel /= 0.0035;//5;
    vRel *= 0.01;
    vRel += 0.5;
    
    // small
    /*for (int i = NUM_DRIPS; i < NUM_DRIPS2+NUM_DRIPS; i++)
    {
        float fAge;
        vec2 vRnd = dripPos (t, fAge);

        //fHeight += dispersion2d((vRel - vRnd)*100.0, fAge*10.0) * 10.0* (1.0-fAge);

        vec2 vD = vec2 (vRel - vRnd);
        float fD = sqrt (dot (vD, vD));

        float fDa = 10.0 * (fD - fAge + 0.6);

        fHeight += (1.0 - fAge) 
            * max (0.0, 1.0 - (fDa*fDa))
            * sin (fD*150.0 - fAge*80.0);
        
        t += fStep;
    }*/
    
    
    vRel -= 0.5;
    vRel /= 0.01;
    vRel *= 0.002;
    vRel += 0.5;
    t *= 0.35;
    //fHeight = 0.0;
    // big
    for (int i = NUM_DRIPS2+NUM_DRIPS; i < NUM_DRIPS3+NUM_DRIPS2+NUM_DRIPS; i++)
    {
        float fAge;
        vec2 vRnd = dripPos (t, fAge);

        // float fDx = vRel.x - vRnd.x;
        // float fDy = vRel.y - vRnd.y;
        // float fD2 = fDx*fDx + fDy*fDy;
        // float fD = sqrt (fD2);
        
        // the above, simpler:
        vec2 vD = vec2 (vRel - vRnd);
        float fD = sqrt (dot (vD, vD));

        float fDa = 10.0 * (fD - fAge + 0.6);

        fHeight += (1.0 - fAge) 
            * max (0.0, 1.0 - (fDa*fDa))
            * sin (fD*150.0 - fAge*80.0) * 2.0;
        
        t += fStep;
    }
    
    return sign (fHeight) * fHeight*fHeight;
}

float functionD(vec3 v) {
    return dripHeight(v.xz);//*5.0*flatten;
}
vec3 dripNormal( vec2 origUv )
{
    float eps = 0.01;
    vec3 x = vec3(origUv.x, 1, origUv.y);
    
    vec2 e = vec2( eps, 0.0 );
    return ( vec3( functionD(x+e.xyy) - functionD(x-e.xyy),
                            functionD(x+e.yxy) - functionD(x-e.yxy),
                            functionD(x+e.yyx) - functionD(x-e.yyx) ) );
}

void main() {
    vec2 tc = vUv0;
    vec3 normal = dripNormal((tc*2.0-1.0)*30.0);
    normal = (normal*0.5+0.5);// * vec3(0.5, 0.5, 1.0) * * 2.0;
    gl_FragColor = vec4(normal, 1.0);
}

