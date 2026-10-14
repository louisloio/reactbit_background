import{r as I,R as M,T,P as A,M as F,j as P}from"../text-animations-BzfSDftD.js";function d(r){let n=r.replace("#",""),i=0,o=0,u=0,s=1;return n.length===6?(i=parseInt(n.slice(0,2),16)/255,o=parseInt(n.slice(2,4),16)/255,u=parseInt(n.slice(4,6),16)/255):n.length===8&&(i=parseInt(n.slice(0,2),16)/255,o=parseInt(n.slice(2,4),16)/255,u=parseInt(n.slice(4,6),16)/255,s=parseInt(n.slice(6,8),16)/255),[i,o,u,s]}const B=`
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`,U=`
precision highp float;

#define PI 3.14159265359

uniform float iTime;
uniform vec3 iResolution;
uniform float uSpinRotation;
uniform float uSpinSpeed;
uniform vec2 uOffset;
uniform vec4 uColor1;
uniform vec4 uColor2;
uniform vec4 uColor3;
uniform float uContrast;
uniform float uLighting;
uniform float uSpinAmount;
uniform float uPixelFilter;
uniform float uSpinEase;
uniform bool uIsRotate;
uniform vec2 uMouse;

varying vec2 vUv;

vec4 effect(vec2 screenSize, vec2 screen_coords) {
    float pixel_size = length(screenSize.xy) / uPixelFilter;
    vec2 uv = (floor(screen_coords.xy * (1.0 / pixel_size)) * pixel_size - 0.5 * screenSize.xy) / length(screenSize.xy) - uOffset;
    float uv_len = length(uv);
    
    float speed = (uSpinRotation * uSpinEase * 0.2);
    if(uIsRotate){
       speed = iTime * speed;
    }
    speed += 302.2;
    
    float mouseInfluence = (uMouse.x * 2.0 - 1.0);
    speed += mouseInfluence * 0.1;
    
    float new_pixel_angle = atan(uv.y, uv.x) + speed - uSpinEase * 20.0 * (uSpinAmount * uv_len + (1.0 - uSpinAmount));
    vec2 mid = (screenSize.xy / length(screenSize.xy)) / 2.0;
    uv = (vec2(uv_len * cos(new_pixel_angle) + mid.x, uv_len * sin(new_pixel_angle) + mid.y) - mid);
    
    uv *= 30.0;
    float baseSpeed = iTime * uSpinSpeed;
    speed = baseSpeed + mouseInfluence * 2.0;
    
    vec2 uv2 = vec2(uv.x + uv.y);
    
    for(int i = 0; i < 5; i++) {
        uv2 += sin(max(uv.x, uv.y)) + uv;
        uv += 0.5 * vec2(
            cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121),
            sin(uv2.x - 0.113 * speed)
        );
        uv -= cos(uv.x + uv.y) - sin(uv.x * 0.711 - uv.y);
    }
    
    float contrast_mod = (0.25 * uContrast + 0.5 * uSpinAmount + 1.2);
    float paint_res = min(2.0, max(0.0, length(uv) * 0.035 * contrast_mod));
    float c1p = max(0.0, 1.0 - contrast_mod * abs(1.0 - paint_res));
    float c2p = max(0.0, 1.0 - contrast_mod * abs(paint_res));
    float c3p = 1.0 - min(1.0, c1p + c2p);
    float light = (uLighting - 0.2) * max(c1p * 5.0 - 4.0, 0.0) + uLighting * max(c2p * 5.0 - 4.0, 0.0);
    
    return (0.3 / uContrast) * uColor1 + (1.0 - 0.3 / uContrast) * (uColor1 * c1p + uColor2 * c2p + vec4(c3p * uColor3.rgb, c3p * uColor1.a)) + light;
}

void main() {
    vec2 uv = vUv * iResolution.xy;
    gl_FragColor = effect(iResolution.xy, uv);
}
`;function O({spinRotation:r=-2,spinSpeed:n=7,offset:i=[0,0],color1:o="#DE443B",color2:u="#006BB4",color3:s="#162325",contrast:g=3.5,lighting:x=.4,spinAmount:h=.25,pixelFilter:S=745,spinEase:_=1,isRotate:C=!1,mouseInteraction:y=!0}){const l=I.useRef(null);return I.useEffect(()=>{if(!l.current)return;const t=l.current,f=new M,e=f.gl;e.clearColor(0,0,0,1);let a;function m(){f.setSize(t.offsetWidth,t.offsetHeight),a&&(a.uniforms.iResolution.value=[e.canvas.width,e.canvas.height,e.canvas.width/e.canvas.height])}window.addEventListener("resize",m),m();const z=new T(e);a=new A(e,{vertex:B,fragment:U,uniforms:{iTime:{value:0},iResolution:{value:[e.canvas.width,e.canvas.height,e.canvas.width/e.canvas.height]},uSpinRotation:{value:r},uSpinSpeed:{value:n},uOffset:{value:i},uColor1:{value:d(o)},uColor2:{value:d(u)},uColor3:{value:d(s)},uContrast:{value:g},uLighting:{value:x},uSpinAmount:{value:h},uPixelFilter:{value:S},uSpinEase:{value:_},uIsRotate:{value:C},uMouse:{value:[.5,.5]}}});const E=new F(e,{geometry:z,program:a});let p;function w(v){p=requestAnimationFrame(w),a.uniforms.iTime.value=v*.001,f.render({scene:E})}p=requestAnimationFrame(w),t.appendChild(e.canvas);function R(v){if(!y)return;const c=t.getBoundingClientRect(),b=(v.clientX-c.left)/c.width,L=1-(v.clientY-c.top)/c.height;a.uniforms.uMouse.value=[b,L]}return t.addEventListener("mousemove",R),()=>{cancelAnimationFrame(p),window.removeEventListener("resize",m),t.removeEventListener("mousemove",R),t.removeChild(e.canvas),e.getExtension("WEBGL_lose_context")?.loseContext()}},[r,n,i,o,u,s,g,x,h,S,_,C,y,l]),P.jsx("div",{ref:l,className:"balatro-container"})}export{O as default};
