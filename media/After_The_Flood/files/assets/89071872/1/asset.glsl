//#extension GL_EXT_shader_texture_lod : enable
#define textureCubeLodEXT textureLod

//uniform sampler2D texture_glass; texture_cell texture_net
uniform sampler2D texture_mounting, texture_lamp;

uniform samplerCube texture_prefilteredCubeMap128;
#define texture_cubeMap texture_prefilteredCubeMap128
    
uniform mat4 matrix_model;
uniform vec3 view_position;
varying vec3 vPositionW, vNormalW, vPositionL, vPosCam; // vTangentW, vBinormalW, 
varying vec2 vUv0;

float saturate(float x) {
    return clamp(x, 0.0, 1.0);
}

vec3 decodeRGBM(vec4 rgbm) {
    vec3 color = (8.0 * rgbm.a) * rgbm.rgb;
    return color * color;
}

float fresnel(vec3 viewDir, vec3 normal) {
    float a = 1.0 - saturate(dot(viewDir, -normal));
    float fresnel2 = a * a;
    a *= fresnel2 * fresnel2;
    float specularity = 0.04 * 8.0;
    return specularity + (1.0 - specularity) * a;
}

vec2 intersectAABB(vec3 rayOrigin, vec3 rayDir, vec3 boxmin, vec3 boxmax) {
	vec3 invR = 1.0 / rayDir;
	vec3 tbot = invR * (boxmin - rayOrigin);
	vec3 ttop = invR * (boxmax - rayOrigin);

	vec3 tmin = min(ttop, tbot);
	vec3 tmax = max(ttop, tbot);

	vec2 t0 = max(tmin.xx, tmin.yz);
	float tnear = max(t0.x, t0.y);
	t0 = min(tmax.xx, tmax.yz);
	float tfar = min(t0.x, t0.y);

	if (tnear>tfar) {
		return vec2(-1,-1);
	}

	return vec2(tnear, tfar);
}

vec3 sphNormal2BoxNormal(vec3 boxSphN) {
	vec3 N = abs(boxSphN);
	if ((N.x>N.y)&&(N.x>N.z))
	{
		return boxSphN.x>0.0? vec3(1,0,0) : vec3(-1,0,0);
	}
	else if ((N.y>N.x)&&(N.y>N.z))
	{
		return boxSphN.y>0.0? vec3(0,1,0) : vec3(0,-1,0);
	}
    return boxSphN.z>0.0? vec3(0,0,1) : vec3(0,0,-1);
}

mat3 matrixFromVector(vec3 n) { // frisvad
    float a = 1.0 / (1.0 + n.z);
    float b = -n.x * n.y * a;
    vec3 b1 = vec3(1.0 - n.x * n.x * a, b, -n.x);
    vec3 b2 = vec3(b, 1.0 - n.y * n.y * a, -n.y);
    return mat3(b1, b2, n);
}

float pointOnPlane(vec3 pnt, vec4 plane) {
  return plane.w + dot(plane.xyz,pnt);
}

float rayPlaneIntersection(vec3 origin, vec3 dir, vec4 plane) {
  float u = pointOnPlane(origin,plane) / dot(plane.xyz, dir);
  return -u;//origin + (-dir)*u;
}

#define HASHSCALE1 .1031
float hash(vec3 p3) {
	p3  = fract(p3 * HASHSCALE1);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

uniform sampler2D skyTex1;
uniform sampler2D skyTex2;
uniform samplerCube skyboxHigh;
uniform float skyBlend;
vec3 addReflection(vec3 viewDir) {
    vec3 tex1;

    if (viewDir.y >= 0.0) {
        float falloff = clamp(viewDir.y, 0.0, 1.0);
        vec3 wind = vec3(1,0,1);
        float morphMoveLength = 0.075 * 1.0; // 256x256
        float speed = 1.075;
        speed = mix(2.0, 0.9, falloff) * 0.25 * 0.25;
        morphMoveLength *= speed;    

        vec3 vec1 = viewDir + wind * -skyBlend * morphMoveLength * falloff;
        vec2 uv1 = vec1.xz / dot(vec3(1.0), abs(vec1));
        uv1 = vec2(uv1.x-uv1.y, uv1.x+uv1.y);
        uv1 = uv1 * 0.5 + vec2(0.5);

        vec3 v2 = viewDir + wind * (1.0-skyBlend) * morphMoveLength * falloff;
        vec2 uv2 = v2.xz / dot(vec3(1.0), abs(v2));
        uv2 = vec2(uv2.x-uv2.y, uv2.x+uv2.y);
        uv2 = uv2 * 0.5 + vec2(0.5);

        tex1 = decodeRGBM(texture2D(skyTex1, uv1));
        vec3 tex2 = decodeRGBM(texture2D(skyTex2, uv2));

        tex1 = mix(tex1, tex2, skyBlend);

        //tex1 = decodeRGBM(textureCube(texture_prefilteredCubeMap128, viewDir));
        tex1 /= 3.0;
    } else {
        tex1 = decodeRGBM(textureCube(skyboxHigh, viewDir * vec3(-1,1,1)));
    }

    return tex1;
}


uniform vec3 fog_color;
uniform float fog_density;

//uniform float camera_far;
//varying vec2 vFog;
//uniform mat4 matrix_projection;

vec3 addFog(vec3 color) {
    float depth = distance(vPositionW, view_position);// / camera_far;//gl_FragCoord.z / gl_FragCoord.w;
    
    //float scale = 1.0;
    //mat4 proj = (matrix_projection);
    //float uF = -scale /  proj[2].w;
    //float depth = gl_FragCoord.z / gl_FragCoord.w;
    //depth = 1.0 / (depth * uF + vFog.x / vFog.y);
    
    float fogFactor = exp(-depth * fog_density);
    fogFactor = clamp(fogFactor, 0.0, 1.0);
    //return mix(fog_color, color, fogFactor);
    
    float minHeight = 18.0;
    float maxHeight = 80.0;
    float invLen = 1.0 / (maxHeight - minHeight);
    float verticalFog = 1.0 - saturate(vPositionW.y * invLen - (minHeight * invLen));
    //fogFactor = fogFactor * verticalFog;
    
    //vec3 fogColor = getSky( -normalize(view_position - vPositionW) * vec3(-1,1,1) );
    
    vec3 result = mix(fog_color, color, fogFactor);
    return result;
    
    //vec3 fog_color2 = vec3(0.0537, 0.1074, 0.2217) * 3.0;
    //return mix(fog_color2, result, verticalFog);
}

void main() {
    
    vec3 boxSize = vec3(1,1,1);//0.5);
    vec3 boxSizeHalf = boxSize * 0.5;
    float insideWindowsDepth = 0.05;
    vec3 tiling = vec3(4, 8.5, 4);
    vec3 tilingRoom = tiling;//vec3(3,6,3);
    vec3 flip = vec3(-1,1,1);
    //mat3 dTBN = mat3((vTangentW), (vBinormalW), (vNormalW));
    
    vec3 pos = vPositionL;//vPositionW;
    vec3 viewDir = normalize(pos - vPosCam);//view_position);
    vec4 color = vec4(0.0);
    
    // Outer windows
    //vec4 tex = texture2D(texture_glass, vUv0 * tiling.xy);
    //vec3 normalMap = normalize(tex.xyz * 2.0 - 1.0);
    vec3 normal = vNormalW;
    //vec3 normal = dTBN * normalMap;
    vec3 reflDir = mat3(matrix_model) * reflect(viewDir, -normal);
    color.rgb = addReflection(reflDir * flip);//decodeRGBM(textureCube(texture_cubeMap, reflDir * flip));
    color.a = saturate(fresnel(viewDir, normal) );//+ tex.w);
    
    vec3 absNormal = abs(vNormalW);
    float mounting = texture2D(texture_mounting, absNormal.x > absNormal.z? vUv0.xy*vec2(0.5, 0.5) : vUv0.xy*vec2(1.0, 0.5)+vec2(0.0, 0.5)).g;
    mounting = saturate(mounting * 4.0);
    color = mix(
                vec4(0,0,0,mounting),
                color, saturate(color.a + (1.0-mounting)));
    
    float dist;
    /*float alphaCeilHeight = (ceil((pos.y+boxSizeHalf.y) * tiling.y) / tiling.y) - boxSizeHalf.y;
    vec3 alphaCeilPos = rayPlaneIntersection(pos, viewDir, vec4(0,1,0, -alphaCeilHeight)) * viewDir + pos;
    mounting = texture2D(texture_net, alphaCeilPos.xz).g;
    mounting = saturate(mounting * 4.0);
    color = mix(
                vec4(0,0,0,mounting),
                color, saturate(color.a + (1.0-mounting)));*/
    
    //color.a = saturate(color.a + 0.2);
    
    /*color = mix(
                vec4(0,0,0,0.2),
                color, color.a);*/
    //color.a = saturate(color.a + 0.2);
    
    
    /*vec3 localPos = floor((pos+0.5) * tiling) / tiling - 0.5;
    pos += intersectAABB(pos - localPos, viewDir, -0.5/tiling, 0.5/tiling).y * viewDir - vNormalW*0.1;
    normal = sphNormal2BoxNormal(pos);
    color.rgb = normal * 0.5 + 0.5;
    color.a = 1.0;*/
    
    
    
    /*vec3 prevPos = pos;
    pos -= vNormalW * 0.165;
    int id = 0;
    float d = 99999.0;
    float dist;
    //if (vNormalW.y<0.5) {
        if (viewDir.y < 0.0) {
            float floorHeight = (floor((pos.y+0.5) * tiling.y) / tiling.y) - 0.5;
            dist = rayPlaneIntersection(pos, viewDir, vec4(0,1,0, -floorHeight));
            if (dist < d) {
                d = dist;
                id = 0;
                normal = vec3(0,1,0);
            }
        } else if (viewDir.y > 0.0) {
            float ceilHeight = (ceil((pos.y+0.5) * tiling.y) / tiling.y) - 0.5;
            dist = rayPlaneIntersection(pos, viewDir, vec4(0,1,0, -ceilHeight));
            if (dist < d) {
                d = dist;
                id = 0;
                normal = vec3(0,-1,0);
            }
        }
    //}
    //if (abs(vNormalW.z) < 0.5) {
        if (viewDir.z < 0.0) {
            float frontDepth = (floor((pos.z+0.5) * tiling.z) / tiling.z) - 0.5;
            dist = rayPlaneIntersection(pos, viewDir, vec4(0,0,1, -frontDepth));
            if (dist < d) {
                d = dist;
                id = 1;
                normal = vec3(0,0,1);
            }
        } else if (viewDir.z > 0.0) {
            float backDepth = (ceil((pos.z+0.5) * tiling.z) / tiling.z) - 0.5;
            dist = rayPlaneIntersection(pos, viewDir, vec4(0,0,1, -backDepth));
            if (dist < d) {
                d = dist;
                id = 1;
                normal = vec3(0,0,-1);
            }
        }
    //}
    //if (abs(vNormalW.x) < 0.5) {
        if (viewDir.x < 0.0) {
            float leftDepth = (floor((pos.x+0.5) * tiling.x) / tiling.x) - 0.5;
            dist = rayPlaneIntersection(pos, viewDir, vec4(1,0,0, -leftDepth));
            if (dist < d) {
                d = dist;
                id = 2;
                normal = vec3(1,0,0);
            }
        } else if (viewDir.x > 0.0) {
            float rightDepth = (ceil((pos.x+0.5) * tiling.z) / tiling.z) - 0.5;
            dist = rayPlaneIntersection(pos, viewDir, vec4(1,0,0, -rightDepth));
            if (dist < d) {
                d = dist;
                id = 2;
                normal = vec3(-1,0,0);
            }
        }
    //}
    //pos += d * viewDir;
    
    reflDir = reflect(viewDir, -normal);
    color.rgb = mix(
                    decodeRGBM(textureCubeLodEXT(texture_cubeMap, reflDir * flip, 0.0)) * vec3(0.0144, 0.1447, 0.2195) * 0.8,
                    color.rgb, color.a);
    //color.a = saturate(color.a + fresnel(viewDir, normal));
    color.a = 1.0 - saturate(dot(vNormalW, normal));
    pos = prevPos;*/
    
    vec3 prevPos = pos;
    float d;
    vec3 insideBoxMin = boxSize*-0.5+insideWindowsDepth;
    vec3 insideBoxMax = boxSize*0.5-insideWindowsDepth;
    //boxSizeHalf = (insideBoxMax - insideBoxMin) * 0.5;
    d = intersectAABB(pos, viewDir, insideBoxMin, insideBoxMax).x;
    bool isInside = d >= 0.0;
    //if (d >= 0.0) {
        pos += d * viewDir;

        // Inner windows
        normal = sphNormal2BoxNormal(pos / (insideBoxMax - insideBoxMin));
        reflDir = mat3(matrix_model) * reflect(viewDir, -normal);
        color.rgb = mix(
                         addReflection(reflDir * flip),//decodeRGBM(textureCubeLodEXT(texture_cubeMap, reflDir * flip, 0.0)),
                        color.rgb, color.a);
        color.a = saturate(color.a + fresnel(viewDir, normal));
        
        // Unlit cells
        pos = prevPos;
        pos -= vNormalW * 0.001;
        int id = 0;
        d = 99999.0;
        /*if (viewDir.y < 0.0) {
            float floorHeight = (floor((pos.y+boxSizeHalf.y) * tiling.y) / tiling.y) - boxSizeHalf.y;
            dist = rayPlaneIntersection(pos, viewDir, vec4(0,1,0, -floorHeight));
            if (dist < d) {
                d = dist;
                id = 1;
            }
        } else if (viewDir.y > 0.0) {*/
            float ceilHeight = (ceil((pos.y+boxSizeHalf.y) * tiling.y) / tiling.y) - boxSizeHalf.y;
            dist = rayPlaneIntersection(pos, viewDir, vec4(0,1,0, -ceilHeight));
            if (dist < d) {
                d = dist;
                id = 2;
            }
        //}
        if (viewDir.z < 0.0) {
            float frontDepth = (floor((pos.z+boxSizeHalf.z) * tilingRoom.z) / tilingRoom.z) - boxSizeHalf.z;
            dist = rayPlaneIntersection(pos, viewDir, vec4(0,0,1, -frontDepth));
            if (dist < d) {
                d = dist;
                id = 3;
            }
        } else if (viewDir.z > 0.0) {
            float backDepth = (ceil((pos.z+boxSizeHalf.z) * tilingRoom.z) / tilingRoom.z) - boxSizeHalf.z;
            dist = rayPlaneIntersection(pos, viewDir, vec4(0,0,1, -backDepth));
            if (dist < d) {
                d = dist;
                id = 3;
            }
        }
        if (viewDir.x < 0.0) {
            float leftDepth = (floor((pos.x+boxSizeHalf.x) * tilingRoom.x) / tilingRoom.x) - boxSizeHalf.x;
            dist = rayPlaneIntersection(pos, viewDir, vec4(1,0,0, -leftDepth));
            if (dist < d) {
                d = dist;
                id = 4;
            }
        } else if (viewDir.x > 0.0) {
            float rightDepth = (ceil((pos.x+boxSizeHalf.x) * tilingRoom.x) / tilingRoom.x) - boxSizeHalf.x;
            dist = rayPlaneIntersection(pos, viewDir, vec4(1,0,0, -rightDepth));
            if (dist < d) {
                d = dist;
                id = 4;
            }
        }
        pos += d * viewDir;
        vec2 uv = id<3? (pos.xz+boxSizeHalf.xz)*tilingRoom.xz : (id<4? (pos.xy+boxSizeHalf.xy)*tilingRoom.xy : (pos.zy+boxSizeHalf.zy)*tilingRoom.zy);
        uv = fract(uv);
        vec2 ao2 = 1.0 - abs(uv*2.0-1.0);
        float ao = pow(ao2.x * ao2.y, 0.25);
        bool isAlphaCeil = !isInside && id==2 && pos.y < boxSizeHalf.y;
        if (isInside) {
            
            pos += boxSizeHalf;
            //pos.y = 1.0 - pos.y - 0.5/tilingRoom.y;
            vec3 modelPos = vec3(matrix_model[3][0], matrix_model[3][1], matrix_model[3][2]);
            float rnd = hash(floor(pos*tilingRoom+0.05 + modelPos) * 1234.0);
            rnd = pow(rnd, 8.0);
            
            //float rnd2 = hash(floor(pos*tilingRoom+0.05 + modelPos) * 4321.0);
            //rnd2 = pow(rnd2, 8.0);
            vec3 lamps = texture2D(texture_lamp, pos.xz * tilingRoom.xz).rgb;
            
            color.rgb = mix(
                        vec3(0.0634, 0.1113, 0.2264) * ao + rnd * vec3(2.0921, 1.0082, 0.0402) * ao*ao*ao*ao + lamps * ((rnd)<0.2? 0.0 : 1.0) * 8.0,
                        //vec3(uv,0) * (isAlphaCeil? vec3(1,0,0) : vec3(0,1,0)),
                        color.rgb, color.a);
            color.a = 1.0;
        }
        if (isAlphaCeil) {
            mounting = 1.0;//texture2D(texture_net, pos.xz).g;
            mounting = saturate(mounting * 4.0);
            color = mix(
                        vec4(0,0,0,mounting),
                        color, saturate(color.a + (1.0-mounting)));
        }
    //}
    
    //color = mix(
       //         vec4(fract(pos.xzz * tiling.xyy), 1.0),
         //       color, color.a);
    //color = mix(
      //          texture2D(texture_net, pos.xz * tiling.xz * 4.0),
        //        color, color.a);
    //floorHeight -= 1.0 / tiling.y;
    //pos = rayPlaneIntersection(pos, viewDir, vec4(0,1,0, -floorHeight));
    //color = mix(
                //texture2D(texture_net, pos.xz * tiling.xz * 4.0),
                //color, color.a);
    
    /*color = mix(
                texture2D(texture_cell, (abs(vNormalW.x)>abs(vNormalW.z)? pos.zy : pos.xy) * tiling.xy),
                color, color.a);
    
    vec2 cellIntersection = intersectAABB(pos, viewDir, vec3(-0.49), vec3(0.49));
    vec3 cellBackPos = pos + cellIntersection.y * viewDir;
    pos += cellIntersection.x * viewDir;
    color = mix(
                texture2D(texture_cell, (abs(vNormalW.x)>abs(vNormalW.z)? pos.zy : pos.xy) * tiling.xy),
                color, color.a);
    
    pos = cellBackPos;
    normal = sphNormal2BoxNormal(pos);
    color = mix(
                texture2D(texture_cell, (abs(normal.x)>abs(normal.z)? pos.zy : pos.xy) * tiling.xy),
                color, color.a);
    */
    
    // Outer windows - back
    pos += intersectAABB(pos, viewDir, vec3(-0.501), vec3(0.501)).y * viewDir;
    normal = sphNormal2BoxNormal(pos);
    //normal = matrixFromVector(normal) * normalMap;
    reflDir = mat3(matrix_model) * reflect(viewDir, -normal);
    color = mix(
            //vec4(decodeRGBM(textureCubeLodEXT(texture_cubeMap, reflDir * flip, 0.0)), fresnel(viewDir, -normal)),
            vec4(addReflection(reflDir * flip), fresnel(viewDir, -normal)),
            color, color.a);
    
    color.rgb = addFog(color.rgb);

    //color.rgb = pow(color.rgb, vec3(1.0 / 2.2));// * vec3(1,0,0);
    
    //color.rgb = color.aaa;
    //color.a = 1.0;
    gl_FragColor = color;
}

