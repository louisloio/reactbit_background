import{r as I,j as ae}from"../text-animations-CYFpTz0Y.js";const Se=1.4,C=64,ye=[.299,.587,.114,.299,.587,.114,.299,.587,.114],_e=[.701,-.587,-.114,-.299,.413,-.114,-.3,-.588,.886],Pe=[.168,-.331,.5,.328,.035,-.5,-.497,.296,.201],be=`#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,Ae=`#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform mat3 uRay;
uniform float uGlow;
uniform vec2 uOffset;
uniform float uColorFreq;
uniform float uCenterShift;
uniform float uInvBaseHalf;
uniform float uInvHeight;
uniform float uMinAxis;
uniform float uPxScale;
uniform sampler2D uPalette;
uniform int uUsePalette;
uniform float uTime;
uniform float uNoise;
uniform float uSaturation;
uniform mat3 uHue;
uniform int uUseHue;
uniform float uLight;
uniform float uNeutral;
out vec4 outColor;

const vec4 PHASE_COS = vec4(1.0, 0.5403023058681398, -0.4161468365471424, -0.9899924966004454);
const vec4 PHASE_SIN = vec4(0.0, 0.8414709848078965, 0.9092974268256817, 0.1411200080598672);

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
}

float pyramid(vec3 p) {
  vec3 q = vec3(abs(p.x) * uInvBaseHalf, abs(p.y) * uInvHeight, abs(p.z) * uInvBaseHalf);
  return max((q.x + q.y + q.z - 1.0) * uMinAxis * 0.5773502691896258, -p.y);
}

vec3 grade(vec3 col, vec2 seed) {
  col += (rand(seed) - 0.5) * uNoise;
  col = clamp(col, 0.0, 1.0);
  float L = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = clamp(mix(vec3(L), col, uSaturation), 0.0, 1.0);
  if (uUseHue == 1) col = clamp(uHue * col, 0.0, 1.0);
  return col;
}

void main() {
  vec2 f = (gl_FragCoord.xy - 0.5 * uResolution - uOffset) * uPxScale;
  vec3 origin = uRay * vec3(f, 0.0);
  vec3 axis = uRay[2];
  float z = 5.0;
  vec4 o = vec4(0.0);
  for (int i = 0; i < 100; i++) {
    vec3 p = origin + axis * z;
    float d = 0.1 + 0.2 * abs(pyramid(p + vec3(0.0, uCenterShift, 0.0)));
    z -= d;
    float phase = (p.y + z) * uColorFreq;
    vec4 band = sin(phase) * PHASE_COS + cos(phase) * PHASE_SIN + 1.0;
    if (uUsePalette == 1) band.rgb = texture(uPalette, vec2(phase * 0.15915494309189535, 0.5)).rgb * 2.0;
    o += band / d;
  }
  vec4 raw = o * o * uGlow / 1e5;
  vec4 e = exp(2.0 * raw);
  vec4 mapped = (e - 1.0) / (e + 1.0);
  vec2 seed = gl_FragCoord.xy + vec2(uTime);
  if (uLight > 0.5) {
    float peak = max(raw.r, max(raw.g, raw.b));
    vec3 hue = grade(raw.rgb / max(peak, 1e-6), seed);
    vec3 ink = pow(hue, vec3(1.5)) * mix(0.86, 0.32, uNeutral);
    float strength = max(mapped.r, max(mapped.g, mapped.b)) * mapped.a;
    float cover = clamp(strength * 0.95 + (rand(seed.yx) - 0.5) * uNoise * 0.5, 0.0, 1.0);
    outColor = vec4(ink * cover, cover);
  } else {
    outColor = vec4(grade(mapped.rgb, seed) * mapped.a, mapped.a);
  }
}`,D=(n,l,f)=>Math.min(f,Math.max(l,n)),ie=(n,l,f)=>{const o=n.createShader(l);return o?(n.shaderSource(o,f),n.compileShader(o),n.getShaderParameter(o,n.COMPILE_STATUS)?o:(n.deleteShader(o),null)):null},Ue=n=>{const l=ie(n,n.VERTEX_SHADER,be),f=ie(n,n.FRAGMENT_SHADER,Ae),o=n.createProgram();if(!l||!f||!o)return null;if(n.attachShader(o,l),n.attachShader(o,f),n.linkProgram(o),n.deleteShader(l),n.deleteShader(f),!n.getProgramParameter(o,n.LINK_STATUS))return n.deleteProgram(o),null;const s={},g=n.getProgramParameter(o,n.ACTIVE_UNIFORMS);for(let v=0;v<g;v++){const p=n.getActiveUniform(o,v);p&&(s[p.name]=n.getUniformLocation(o,p.name))}return{program:o,uniforms:s}},se=(n,l,f)=>{const o=Math.cos(n),s=Math.sin(n),g=Math.cos(l),v=Math.sin(l),p=Math.cos(f),R=Math.sin(f);return[o*p+s*v*R,g*R,-s*p+o*v*R,-o*R+s*v*p,g*p,s*R+o*v*p,s*g,-v,o*g]},ce=(n,l)=>{const f=new Array(9);for(let o=0;o<3;o++)for(let s=0;s<3;s++)f[o*3+s]=n[s]*l[o*3]+n[3+s]*l[o*3+1]+n[6+s]*l[o*3+2];return f},Ne=({height:n=3.5,baseWidth:l=5.5,animationType:f="rotate",glow:o=1,offset:s,noise:g=0,scale:v=3.6,hueShift:p=0,colorFrequency:R=1,colors:V,saturation:ue=1.5,timeScale:le=.5,interactive:fe=!0,hoverStrength:me=2,inertia:he=.05,intro:de=!0,resolution:ve=.5,lightMode:pe=!1,dpr:xe,className:W="",style:Ee,...ge})=>{const j=I.useRef(null),Y=I.useRef(null),B=I.useRef(null),Me=Array.isArray(V)?V.filter(Boolean).slice(0,8):[],K={height:Math.max(.1,n),baseWidth:Math.max(.1,l),animationType:f==="rotate3d"?"3drotate":f,glow:Math.max(0,o),offsetX:s?.x??0,offsetY:s?.y??0,noise:Math.max(0,g),scale:Math.max(.1,v),hueShift:(p||0)*Math.PI/180,colorFrequency:Math.max(0,R),colors:Me,saturation:Math.max(0,ue),timeScale:Math.max(0,le),interactive:fe,hoverStrength:Math.max(0,me),inertia:D(he,.001,1),intro:de,resolution:D(ve,.25,1),lightMode:pe,dpr:xe},_=I.useRef(K);return _.current=K,I.useEffect(()=>{const P=j.current,x=Y.current,e=x?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!P||!x||!e)return;const X=Ue(e);if(!X)return;const i=X.uniforms,$=e.createVertexArray(),F=e.createTexture();e.bindTexture(e.TEXTURE_2D,F),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,C,1,0,e.RGBA,e.UNSIGNED_BYTE,null);const b=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),Te=t=>{if(!b)return[255,255,255];b.clearRect(0,0,1,1),b.fillStyle="#000000",b.fillStyle=String(t),b.fillRect(0,0,1,1);const[r,a,c]=b.getImageData(0,0,1,1).data;return[r,a,c]};let Z="",k=0;const Re=t=>{const r=t.join(",");if(r===Z||(Z=r,k=0,!t.length))return;const a=t.map(Te);k=1-a.reduce((u,[h,d,M])=>{const T=Math.max(h,d,M);return u+(T>0?(T-Math.min(h,d,M))/T:0)},0)/a.length;const c=new Uint8Array(C*4);for(let u=0;u<C;u++){const h=u/C*a.length,d=Math.floor(h),M=a[d%a.length],T=a[(d+1)%a.length],L=h-d,re=L*L*(3-2*L);for(let y=0;y<3;y++)c[u*4+y]=Math.round(M[y]+(T[y]-M[y])*re);c[u*4+3]=255}e.bindTexture(e.TEXTURE_2D,F),e.texSubImage2D(e.TEXTURE_2D,0,0,0,C,1,e.RGBA,e.UNSIGNED_BYTE,c)},N=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,E={width:1,height:1,scale:1},m={yaw:0,pitch:0,roll:0},w={x:0,y:0,inside:!1};let G=0,S=_.current.intro&&!N?0:1,H=0,A=0,O=!0;const we=t=>{const r=se(m.yaw,m.pitch,m.roll);if(t.animationType==="rotate"){const a=G*t.timeScale,c=Math.cos(a),u=Math.cos(a+33),h=Math.cos(a+11);return ce(r,[c,0,h,0,1,0,u,0,c])}if(t.animationType==="3drotate"){const a=G*t.timeScale;return ce(r,se(a*.55,Math.sin(a*.6+.6)*.6,Math.sin(a*.35+1.9)*.5))}return r},J=()=>{const t=_.current;Re(t.colors);const r=t.baseWidth*.5,a=S*S*(3-2*S),c=Math.cos(t.hueShift),u=Math.sin(t.hueShift);e.bindVertexArray($),e.viewport(0,0,x.width,x.height),e.useProgram(X.program),e.uniform2f(i.uResolution,x.width,x.height),e.uniformMatrix3fv(i.uRay,!1,we(t)),e.uniform1f(i.uGlow,t.glow*a*a),e.uniform2f(i.uOffset,t.offsetX*E.scale,-t.offsetY*E.scale),e.uniform1f(i.uColorFreq,t.colorFrequency),e.uniform1f(i.uCenterShift,t.height*.25),e.uniform1f(i.uInvBaseHalf,1/r),e.uniform1f(i.uInvHeight,1/t.height),e.uniform1f(i.uMinAxis,Math.min(r,t.height)),e.uniform1f(i.uPxScale,1/(x.height*.1*t.scale)),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,F),e.uniform1i(i.uPalette,0),e.uniform1i(i.uUsePalette,t.colors.length?1:0),e.uniform1f(i.uTime,G),e.uniform1f(i.uNoise,t.noise),e.uniform1f(i.uSaturation,t.saturation),e.uniformMatrix3fv(i.uHue,!1,ye.map((h,d)=>h+_e[d]*c+Pe[d]*u)),e.uniform1i(i.uUseHue,Math.abs(t.hueShift)>1e-4?1:0),e.uniform1f(i.uLight,t.lightMode?1:0),e.uniform1f(i.uNeutral,k),e.drawArrays(e.TRIANGLES,0,3)},z=()=>{const t=_.current;E.width=Math.max(1,P.clientWidth),E.height=Math.max(1,P.clientHeight),E.scale=Math.min(t.dpr||window.devicePixelRatio||1,2)*t.resolution,x.width=Math.max(1,Math.round(E.width*E.scale)),x.height=Math.max(1,Math.round(E.height*E.scale)),J(),U()},Q=t=>{if(H=0,!O||document.hidden)return;const r=_.current;if(Math.round(E.width*Math.min(r.dpr||window.devicePixelRatio||1,2)*r.resolution)!==x.width){z();return}const a=A?D((t-A)/1e3,.001,.05):1/60;A=t,N||(G+=a),S<1&&(S=Math.min(1,S+a/Se));const c=r.animationType==="hover",u=w.inside&&!N&&(c||r.interactive),h=(c?.6:.09)*r.hoverStrength,d=u?-w.x*h:0,M=u?w.y*h:0,T=1-Math.pow(1-r.inertia,a*60);m.yaw+=(d-m.yaw)*T,m.pitch+=(M-m.pitch)*T,m.roll+=(0-m.roll)*(1-Math.pow(.9,a*60)),J();const L=Math.abs(d-m.yaw)+Math.abs(M-m.pitch)+Math.abs(m.roll)>1e-4;!N&&!c&&r.animationType!=="static"&&r.timeScale>0||L||S<1||!N&&r.noise>0?H=requestAnimationFrame(Q):A=0};function U(){!H&&O&&!document.hidden&&(H=requestAnimationFrame(Q))}const ee=t=>{const r=P.getBoundingClientRect(),a=(t.clientX-r.left)/Math.max(1,r.width)*2-1,c=(t.clientY-r.top)/Math.max(1,r.height)*2-1;w.inside=Math.abs(a)<=1&&Math.abs(c)<=1,w.x=D(a,-1,1),w.y=D(c,-1,1);const u=_.current;(u.interactive||u.animationType==="hover")&&U()},q=()=>{w.inside=!1,U()},te=()=>{A=0,U()},ne=new ResizeObserver(z);ne.observe(P);const oe=new IntersectionObserver(t=>{O=t.some(r=>r.isIntersecting),O&&(A=0,U())});return oe.observe(P),window.addEventListener("pointermove",ee,{passive:!0}),window.addEventListener("blur",q),document.documentElement.addEventListener("pointerleave",q),document.addEventListener("visibilitychange",te),z(),B.current=U,()=>{cancelAnimationFrame(H),B.current=null,ne.disconnect(),oe.disconnect(),window.removeEventListener("pointermove",ee),window.removeEventListener("blur",q),document.documentElement.removeEventListener("pointerleave",q),document.removeEventListener("visibilitychange",te),e.deleteTexture(F),e.deleteVertexArray($),e.deleteProgram(X.program),e.getExtension("WEBGL_lose_context")?.loseContext()}},[]),I.useEffect(()=>{B.current?.()}),ae.jsx("div",{ref:j,className:`prism${W?` ${W}`:""}`,style:Ee,...ge,children:ae.jsx("canvas",{ref:Y,className:"prism-canvas","aria-hidden":"true"})})};export{Ne as default};
