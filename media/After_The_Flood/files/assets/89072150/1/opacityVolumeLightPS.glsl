uniform sampler2D texture_opacityMap;
varying float vFade;
void getOpacity() {
    dAlpha = texture2D(texture_opacityMap, $UV).$CH * vFade;
}

