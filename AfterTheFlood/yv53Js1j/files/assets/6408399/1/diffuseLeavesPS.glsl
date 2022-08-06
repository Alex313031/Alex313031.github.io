uniform sampler2D texture_diffuseMap;
varying float bViewDot;
uniform float isLeaves;

void getAlbedo() {
    dAlbedo = texture2DSRGB(texture_diffuseMap, $UV).$CH;
    
    //dAlbedo = vNormalW;
    //dAlbedo *= gl_FrontFacing? 1.0 : 0.7;
    
    if (isLeaves > 0.5) {
        dAlbedo *= vec3(vVertexColor.a * 2.0);
    } else {
        dAlbedo *= vec3(saturate(vVertexColor.a*vVertexColor.a*vVertexColor.a * 5.0));
    }
}

