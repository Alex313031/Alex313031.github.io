varying vec2 vUv0;
uniform sampler2D clothWorldPos, clothLength, clothPrevWorldPos;
uniform float deltaTime;
uniform mat4 legL0, legL1, legR0, legR1, kneeL, kneeR, legC;
uniform mat4 legL0t, legL1t, legR0t, legR1t, kneeLt, kneeRt, legCt;
uniform vec3 clothSkinOffset;

vec3 constraint(vec3 c, vec2 nUv, float restLength) {
    vec3 n = texture2D(clothWorldPos, nUv).xyz;
    vec3 delta = n - c;
    float deltaLength = length(delta);
    float diff = (deltaLength - restLength) / deltaLength;
    c += delta * 0.5 * diff;
    //n += delta * 0.5 * diff;
    return c;
}

float saturate(float f) {
    return clamp(f, 0.0, 1.0);
}

float sphereIntersect(in vec3 ro, in vec3 rd, in float r) {
	float b = dot(ro,rd);
	float c = dot(ro,ro) - r * r;
	float h = b*b - c;
	if (h < 0.0) return -1.0;
	float t = (-b - sqrt(h));
	return t;
}

vec3 pushFromSphere(vec3 c, mat4 sphereMatrix, mat4 sphereMatrixT) {
    
    c.xyz += clothSkinOffset;
    
    float r = 0.5;
    vec3 posInSphere = (sphereMatrix * vec4(c.xyz,1)).xyz;
    float dist = length(posInSphere) - r;
    if (dist < 0.0) {
        posInSphere = normalize(posInSphere) * r;
        bool isRight = vUv0.x > 0.5;
        //if ((posInSphere.x>0.0 && !isRight) || (posInSphere.x<0.0 && isRight)) {
        //if (posInSphere.x>0.0 && !isRight) {
          //  posInSphere.x = -posInSphere.x;
        //}
        c.xyz = (sphereMatrixT * vec4(posInSphere,1)).xyz;
    }
    
    c.xyz -= clothSkinOffset;
    
    return c;
}

void main() {
    vec4 c = texture2D(clothWorldPos, vUv0);
    
    if (vUv0.y < 0.9) {
        vec2 offset = vec2(1.0) / vec2(22,9);
        
        c.xyz = pushFromSphere(c.xyz, legL0, legL0t);
        //c.xyz = pushFromSphere(c.xyz, kneeL, kneeL, kneeLt);
        c.xyz = pushFromSphere(c.xyz, legL1, legL1t);
        
        c.xyz = pushFromSphere(c.xyz, legR0, legR0t);
        //c.xyz = pushFromSphere(c.xyz, kneeR, kneeR, kneeRt);
        c.xyz = pushFromSphere(c.xyz, legR1, legR1t);
        
        c.xyz = pushFromSphere(c.xyz, legC, legCt);
        
        c.y = max(c.y, 0.0);

        vec2 nUv = vUv0 - vec2(offset.x,0);
        float len;
        if (nUv.x > 0.0 && sign(vUv0.x-0.5)==sign(nUv.x-0.5)) {
            len = texture2D(clothLength, nUv).x;
            c.xyz = constraint(c.xyz, nUv, len);
        }
        
        nUv = vUv0 + vec2(offset.x,0);
        if (nUv.x < 1.0 && sign(vUv0.x-0.5)==sign(nUv.x-0.5)) {
            len = texture2D(clothLength, vUv0).x;
            c.xyz = constraint(c.xyz, nUv, len);
        }
        
        nUv = vUv0 - vec2(0,offset.y);
        if (nUv.y > 0.0) {
            len = texture2D(clothLength, nUv).y;
            c.xyz = constraint(c.xyz, nUv, len);
        }
        
        nUv = vUv0 + vec2(0,offset.y);
        if (nUv.y < 1.0) {
            len = texture2D(clothLength, vUv0).y;
            c.xyz = constraint(c.xyz, nUv, len);
        }
        
        
        
        /*nUv = vUv0 - vec2(offset.x*2.0,0);
        if (nUv.x > 0.0 && sign(vUv0.x-0.5)==sign(nUv.x-0.5)) {
            len = texture2D(clothLength, nUv).z;
            c.xyz = constraint(c.xyz, nUv, len);
        }
        
        nUv = vUv0 + vec2(offset.x*2.0,0);
        if (nUv.x < 1.0 && sign(vUv0.x-0.5)==sign(nUv.x-0.5)) {
            len = texture2D(clothLength, vUv0).z;
            c.xyz = constraint(c.xyz, nUv, len);
        }
        
        nUv = vUv0 - vec2(0,offset.y*2.0);
        if (nUv.y > 0.0) {
            len = texture2D(clothLength, nUv).w;
            c.xyz = constraint(c.xyz, nUv, len);
        }
        
        nUv = vUv0 + vec2(0,offset.y*2.0);
        if (nUv.y < 1.0) {
            len = texture2D(clothLength, vUv0).w;
            c.xyz = constraint(c.xyz, nUv, len);
        }*/
        
        
        /*nUv = vUv0 + offset;
        if (nUv.x < 1.0 && sign(vUv0.x-0.5)==sign(nUv.x-0.5) && nUv.y < 1.0) {
            len = texture2D(clothLength, vUv0).z;
            c.xyz = constraint(c.xyz, nUv, len);
        }
        
        nUv = vUv0 - offset;
        if (nUv.x > 0.0 && sign(vUv0.x-0.5)==sign(nUv.x-0.5) && nUv.y > 0.0) {
            len = texture2D(clothLength, nUv).z;
            c.xyz = constraint(c.xyz, nUv, len);
        }
        
        nUv = vUv0 + vec2(-offset.x, offset.y);
        if (nUv.x > 0.0 && sign(vUv0.x-0.5)==sign(nUv.x-0.5) && nUv.y < 1.0) {
            len = texture2D(clothLength, vUv0).w;
            c.xyz = constraint(c.xyz, nUv, len);
        }
        
        nUv = vUv0 - vec2(-offset.x, offset.y);
        if (nUv.x < 1.0 && sign(vUv0.x-0.5)==sign(nUv.x-0.5) && nUv.y > 0.0) {
            len = texture2D(clothLength, nUv).w;
            c.xyz = constraint(c.xyz, nUv, len);
        }*/

    }
    
    gl_FragColor = c;
}

