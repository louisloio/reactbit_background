import{r as T,j as fe}from"../text-animations-BFa__3NK.js";const me=8,V=4,De=2.2,Ge=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,ze=`#version 300 es
precision highp float;
precision highp int;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uGloss;
uniform float uDepth;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uStarGlow;
uniform float uFlareGain;
uniform float uSquash;
uniform float uSaturation;
uniform float uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationAngle;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform int uLayers;
uniform vec3 uColors[${V}];
uniform int uColorCount;
uniform float uWarp;
uniform float uReveal;
uniform float uMode;
uniform vec3 uBackground;
uniform float uOpacity;
out vec4 outColor;

#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare, vec2 radial, float invReach) {
#ifdef WARP
  float along = dot(uv, radial);
  float d = sqrt(max(dot(uv, uv) - uSquash * along * along, 0.0));
#else
  float d = length(uv);
#endif
  float m = uStarGlow / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uFlareGain;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uFlareGain;
  m *= smoothstep(1.0, 0.2, d * invReach);
#ifdef WARP
  m *= mix(1.0, smoothstep(1.0, 0.55, length(uv) * invReach), min(uWarp * 4.0, 1.0));
#endif
  return m;
}

vec3 StarLayer(vec2 uv, vec2 radial, vec2 repelAt, float pushCells, float spread) {
  vec3 col = vec3(0.0);
  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + offset;
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uGloss / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

#ifdef PALETTE
      float pick = Hash21(si + 7.0) * float(uColorCount);
      vec3 base = uColors[int(min(floor(pick), float(uColorCount - 1)))];
#else
      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);
      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));
#endif

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;
      vec2 shift = vec2(0.0);
      float invReach = 1.0;
#ifdef REPEL
      vec2 away = si + 0.5 + pad - repelAt;
      float dist = length(away);
      float q = dist * spread;
      float cells = pushCells * exp(-q * q);
      float moved = cells * inversesqrt(1.0 + cells * cells * 2.78);
      shift = away * (moved / max(dist, 0.0001));
      invReach = 1.0 / (1.0 - moved);
#endif
      float star = Star(gv - offset - pad - shift, flareSize, radial, invReach);
      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      col += star * twinkle * size * base;
    }
  }
  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution;
  vec2 uv = (gl_FragCoord.xy - focalPx) / uResolution.y;
  vec2 mouseNorm = uMouse - vec2(0.5);

  vec2 repelAt = vec2(0.0);
  float strength = 0.0;
  float push = 0.0;
  if (uAutoCenterRepulsion > 0.0) {
    strength = uAutoCenterRepulsion;
    push = strength * 0.05;
  } else if (uMouseRepulsion > 0.5) {
    repelAt = (uMouse * uResolution - focalPx) / uResolution.y;
    strength = max(uRepulsionStrength, 0.0);
    push = strength * 0.05 * uMouseActiveFactor;
  } else {
    uv += mouseNorm * 0.1 * uMouseActiveFactor;
  }
  float radius = 0.16 + 0.04 * strength;

  vec2 radial = length(uv) > 0.0001 ? normalize(uv) : vec2(1.0, 0.0);
  float angle = uRotationAngle;
  uv = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * uv;
  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;
  radial = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * radial;
  radial = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * radial;
  repelAt = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * repelAt;
  repelAt = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * repelAt;

  vec3 col = vec3(0.0);
  float layers = float(uLayers);
  for (int k = 0; k < ${me}; k++) {
    if (k >= uLayers) break;
    float i = float(k) / layers;
    float depth = fract(i + uDepth);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    vec2 offset = vec2(i * 453.32);
    col += StarLayer(uv * scale + offset, radial, repelAt * scale + offset, push * scale, 1.0 / (scale * radius)) * fade;
  }
  col *= uReveal;

  if (uMode > 1.5) {
    vec3 lit = col * smoothstep(0.0, 0.3, length(col));
    float energy = max(max(lit.r, lit.g), lit.b);
    vec3 tint = lit / max(energy, 0.0001);
    vec3 ink = tint * (0.16 / max(dot(tint, vec3(0.2126, 0.7152, 0.0722)), 0.16));
    float coverage = pow(min(energy * 1.3, 1.0), 1.3) * 0.92 * uOpacity;
    outColor = uMode > 2.5 ? vec4(ink * coverage, coverage) : vec4(mix(uBackground, ink, coverage), 1.0);
  } else if (uMode > 0.5) {
    float alpha = min(smoothstep(0.0, 0.3, length(col)), 1.0) * uOpacity;
    outColor = vec4(col * alpha, alpha);
  } else {
    outColor = vec4(mix(uBackground, col, uOpacity), 1.0);
  }
}`,_=(a,l,f)=>Math.min(f,Math.max(l,a)),He=(a,l,f)=>(a?4:0)+(l?2:0)+(f?1:0),Ue=(a,l,f,L)=>{const g=`${l?`#define PALETTE
`:""}${f?`#define REPEL
`:""}${L?`#define WARP
`:""}`,c=a.createProgram(),R=a.createShader(a.VERTEX_SHADER),y=a.createShader(a.FRAGMENT_SHADER);return!c||!R||!y?null:(a.shaderSource(R,Ge),a.shaderSource(y,ze.replace(`
`,`
${g}`)),a.compileShader(R),a.compileShader(y),a.attachShader(c,R),a.attachShader(c,y),a.bindAttribLocation(c,0,"aPosition"),a.linkProgram(c),a.deleteShader(R),a.deleteShader(y),c)},Be=(a,l)=>{if(!a.getProgramParameter(l,a.LINK_STATUS))return null;const f={},L=a.getProgramParameter(l,a.ACTIVE_UNIFORMS);for(let g=0;g<L;g++){const c=a.getActiveUniform(l,g);c&&(f[c.name.replace("[0]","")]=a.getUniformLocation(l,c.name))}return{program:l,uniforms:f}},qe=({focal:a=[.5,.5],rotation:l=[1,0],starSpeed:f=.5,density:L=1,hueShift:g=140,disableAnimation:c=!1,speed:R=1,mouseInteraction:y=!0,glowIntensity:de=.3,saturation:ve=0,mouseRepulsion:pe=!0,repulsionStrength:he=2,twinkleIntensity:ge=.3,rotationSpeed:Re=.1,autoCenterRepulsion:ye=0,transparent:xe=!0,lightMode:Ae=!1,starColors:K,starSize:be=1,flareIntensity:we=1,layers:Se=4,direction:Me="forward",clickWarp:Ee=!0,intro:Ce=!0,backgroundColor:Te,opacity:Le=1,dpr:ke,className:$="",style:Fe,...Oe})=>{const X=T.useRef(null),j=T.useRef(null),I=T.useRef(null),Pe=Array.isArray(K)?K.filter(Boolean).slice(0,V):[],Y={focal:Array.isArray(a)?a:[.5,.5],rotation:Array.isArray(l)?l:[1,0],starSpeed:f,density:Math.max(.01,L),hueShift:g,disableAnimation:c,speed:R,mouseInteraction:y,glowIntensity:Math.max(0,de),saturation:Math.max(0,ve),mouseRepulsion:pe,repulsionStrength:he,twinkleIntensity:_(ge,0,1),rotationSpeed:Re,autoCenterRepulsion:Math.max(0,ye),transparent:xe,lightMode:Ae,palette:Pe,starSize:Math.max(0,be),flareIntensity:Math.max(0,we),layers:_(Math.round(Se),2,me),reverse:Me==="backward",clickWarp:Ee,intro:Ce,backgroundColor:Te,opacity:_(Le,0,1),dpr:ke},m=T.useRef(Y);return m.current=Y,T.useEffect(()=>{const b=X.current,v=j.current,t=v?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!b||!v||!t)return;const J=t.getExtension("KHR_parallel_shader_compile"),k=new Map,F=(e,n,i)=>{const s=He(e,n,i);let u=k.get(s);return u||(u={program:Ue(t,e,n,i),linked:null,done:!1},k.set(s,u)),u},D=(e,n,i,s)=>{const u=F(e,n,i);if(!u.done&&u.program){if(!s&&J&&!t.getProgramParameter(u.program,J.COMPLETION_STATUS_KHR))return null;u.linked=Be(t,u.program),u.done=!0}return u.linked},p=m.current;if(!D(p.palette.length>0,!1,!1,!0)){k.forEach(e=>e.program&&t.deleteProgram(e.program));return}const Q=t.createBuffer(),G=t.createVertexArray();t.bindVertexArray(G),t.bindBuffer(t.ARRAY_BUFFER,Q),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW),t.enableVertexAttribArray(0),t.vertexAttribPointer(0,2,t.FLOAT,!1,0,0);const w=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),S=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,z=new Map,Z=(e,n)=>{if(!e)return n;const i=String(e);if(z.has(i))return z.get(i);let s=n;if(w){w.clearRect(0,0,1,1),w.fillStyle="#000000",w.fillStyle=i,w.fillRect(0,0,1,1);const[u,h,x]=w.getImageData(0,0,1,1).data;s=[u/255,h/255,x/255]}return z.set(i,s),s},ee=new Float32Array(V*3),d={x:.5,y:.5,inside:!1},o={time:0,gloss:0,depth:0,angle:0,mx:.5,my:.5,active:0,boost:0,reveal:m.current.intro&&!S?0:1};let M=0,E=0,O=!0;const H=()=>{const e=m.current;e.palette.forEach((_e,Ie)=>ee.set(Z(_e,[1,1,1]),Ie*3));const n=e.lightMode?e.transparent?3:2:e.transparent?1:0,i=Z(e.backgroundColor,e.lightMode?[1,1,1]:[0,0,0]),s=o.reveal,u=e.palette.length>0,h=e.autoCenterRepulsion>0||e.mouseRepulsion&&e.repulsionStrength>0&&o.active>0,x=o.boost>0,A=D(u,!1,!1,!0);if(!A)return;const W=(h||x?D(u,h,x,!1):null)??A,r=W.uniforms;t.viewport(0,0,v.width,v.height),t.useProgram(W.program),t.bindVertexArray(G),t.uniform1f(r.uTime,o.time),t.uniform2f(r.uResolution,v.width,v.height),t.uniform2f(r.uFocal,e.focal[0],e.focal[1]),t.uniform2f(r.uRotation,e.rotation[0],e.rotation[1]),t.uniform1f(r.uGloss,o.gloss),t.uniform1f(r.uDepth,o.depth),t.uniform1f(r.uDensity,e.density),t.uniform1f(r.uHueShift,e.hueShift),t.uniform1f(r.uSpeed,e.speed),t.uniform2f(r.uMouse,o.mx,o.my);const q=1+o.boost*5;t.uniform1f(r.uStarGlow,.05*e.glowIntensity*e.starSize/Math.pow(q,.6)),t.uniform1f(r.uFlareGain,e.glowIntensity*e.flareIntensity),t.uniform1f(r.uSquash,1-1/(q*q)),t.uniform1f(r.uSaturation,e.saturation),t.uniform1f(r.uMouseRepulsion,e.mouseRepulsion?1:0),t.uniform1f(r.uTwinkleIntensity,e.twinkleIntensity),t.uniform1f(r.uRotationAngle,o.angle),t.uniform1f(r.uRepulsionStrength,e.repulsionStrength),t.uniform1f(r.uMouseActiveFactor,o.active),t.uniform1f(r.uAutoCenterRepulsion,e.autoCenterRepulsion),t.uniform1i(r.uLayers,e.layers),t.uniform3fv(r.uColors,ee),t.uniform1i(r.uColorCount,e.palette.length),t.uniform1f(r.uWarp,o.boost);const N=Math.min(1,s/.35);t.uniform1f(r.uReveal,N*N*(3-2*N)),t.uniform1f(r.uMode,n),t.uniform3fv(r.uBackground,i),t.uniform1f(r.uOpacity,e.opacity),t.drawArrays(t.TRIANGLES,0,3)},te=e=>{if(M=0,!O||document.hidden)return;const n=m.current,i=E?_((e-E)/1e3,5e-4,.05):1/60;E=e;const s=n.disableAnimation||S?0:1;n.intro&&!S&&o.reveal<1?(o.reveal=Math.min(1,o.reveal+i/De),o.boost=Math.max(o.boost,Math.pow(1-o.reveal,2)*1.4)):(!n.intro||S)&&(o.reveal=1);const u=n.starSpeed/10*(n.reverse?-1:1);o.time+=i*s,o.gloss+=i*u*s,o.depth+=i*u*n.speed*s*(1+o.boost*14),o.angle+=i*n.rotationSpeed*s,o.boost*=Math.exp(-i*1.3),o.boost<.001&&(o.boost=0);const h=1-Math.exp(-i/.325),x=n.mouseInteraction&&d.inside&&!S;x&&(o.mx+=(d.x-o.mx)*h,o.my+=(d.y-o.my)*h);const A=x?1:0;o.active+=(A-o.active)*h,Math.abs(A-o.active)<.001&&(o.active=A),H(),s>0||o.boost>0||o.active!==A||o.reveal<1?M=requestAnimationFrame(te):E=0},C=()=>{!M&&O&&!document.hidden&&(M=requestAnimationFrame(te))},U=()=>{const e=m.current,n=Math.max(1,b.clientWidth),i=Math.max(1,b.clientHeight),s=Math.min(e.dpr||window.devicePixelRatio||1,2);v.width=Math.max(1,Math.round(n*s)),v.height=Math.max(1,Math.round(i*s)),H(),C()},oe=e=>{const n=b.getBoundingClientRect(),i=e.clientX-n.left,s=e.clientY-n.top;d.inside=i>=0&&s>=0&&i<=n.width&&s<=n.height,d.x=i/Math.max(1,n.width),d.y=1-s/Math.max(1,n.height)},ne=e=>{oe(e),C()},ae=e=>{const n=m.current;oe(e),!(!d.inside||!n.clickWarp||S)&&(o.boost=Math.min(1.6,o.boost+1),C())},P=e=>{e.pointerType!=="mouse"&&(d.inside=!1)},re=()=>{d.inside=!1},ie=()=>{E=0,C()},se=new ResizeObserver(U);se.observe(b);const ue=new IntersectionObserver(e=>{O=e.some(n=>n.isIntersecting),O&&(E=0,C())});ue.observe(b),window.addEventListener("pointermove",ne,{passive:!0}),window.addEventListener("pointerdown",ae,{passive:!0}),window.addEventListener("pointerup",P,{passive:!0}),window.addEventListener("pointercancel",P,{passive:!0}),document.documentElement.addEventListener("pointerleave",re),document.addEventListener("visibilitychange",ie),U();const le=p.autoCenterRepulsion>0||p.mouseInteraction&&p.mouseRepulsion,B=p.palette.length>0;(p.clickWarp||p.intro)&&F(B,!1,!0),le&&F(B,!0,!1),le&&p.clickWarp&&F(B,!0,!0);let ce=m.current.dpr;return I.current=()=>{const e=m.current;if(e.dpr!==ce){ce=e.dpr,U();return}M||H(),C()},()=>{cancelAnimationFrame(M),I.current=null,se.disconnect(),ue.disconnect(),window.removeEventListener("pointermove",ne),window.removeEventListener("pointerdown",ae),window.removeEventListener("pointerup",P),window.removeEventListener("pointercancel",P),document.documentElement.removeEventListener("pointerleave",re),document.removeEventListener("visibilitychange",ie),k.forEach(e=>e.program&&t.deleteProgram(e.program)),t.deleteBuffer(Q),t.deleteVertexArray(G),t.getExtension("WEBGL_lose_context")?.loseContext()}},[]),T.useEffect(()=>{I.current?.()}),fe.jsx("div",{ref:X,className:`galaxy-container${$?` ${$}`:""}`,style:Fe,...Oe,children:fe.jsx("canvas",{ref:j,className:"galaxy-canvas","aria-hidden":"true"})})};export{qe as default};
