import{r as M,R as ae,T as re,P as ne,M as ie,j as le}from"../text-animations-CYBZrtvX.js";const x=h=>{const l=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);return l?[parseInt(l[1],16)/255,parseInt(l[2],16)/255,parseInt(l[3],16)/255]:[1,1,1]},se={center:0,left:1,right:2},ce=`#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`,me=`#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uThreadCount;
uniform float uFrequency;
uniform float uSpread;
uniform float uTaper;
uniform float uPosition;
uniform float uFanMode;
uniform float uGlow;
uniform float uFalloff;
uniform float uThickness;
uniform float uBrightness;
uniform float uOpacity;
uniform float uMirror;
uniform float uShimmer;
uniform float uGrain;
uniform float uGrainIntensity;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uBackgroundColor;
uniform bool uLightMode;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform float uEnableMouse;
uniform float uMouseActive;
out vec4 fragColor;

#define TAU 6.28318530718
#define MAX_THREADS 10

float glow(float x, float str, float dist) {
  return dist / pow(max(x, 1e-4), str);
}

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  float n = max(uThreadCount, 1.0);

  float pinchX = uFanMode < 0.5 ? 0.5 : (uFanMode < 1.5 ? 0.0 : 1.0);
  if (uEnableMouse > 0.5) {
    pinchX = mix(pinchX, uMouse.x, clamp(uMouseStrength, 0.0, 1.0) * uMouseActive);
  }

  float spreadDx = uSpread * abs(uv.x - pinchX);
  float baseT = iTime * uSpeed;
  float tauOverN = TAU / n;
  float mirror = uMirror > 0.5 ? sign(pinchX - uv.x) : 1.0;
  bool doShimmer = uShimmer > 0.5;
  float shimmerT = iTime * 1.7;
  float invThickness = 1.0 / max(uThickness, 0.01);
  float xFreq = uv.x * uFrequency;
  float yOff = uv.y - uPosition;
  float ciScale = n > 1.0 ? 1.0 / (n - 1.0) : 0.0;

  vec3 col = vec3(0.0);
  float gsum = 0.0;

  for (int idx = 0; idx < MAX_THREADS; idx++) {
    float i = float(idx);
    if (i >= n) break;

    float amplitude = spreadDx * (1.0 + i * uTaper);
    float shimmer = doShimmer ? sin(shimmerT + i * 1.3) * 0.35 : 0.0;
    float phase = (baseT + i * tauOverN) * mirror + shimmer;

    float sdf = abs(yOff + sin(xFreq + phase) * amplitude) * invThickness;

    float g = glow(sdf, uFalloff, uGlow);
    float ci = i * ciScale;
    vec3 threadCol = mix(uColor1, uColor2, ci);

    col += g * threadCol;
    gsum += g;
  }

  float coreAmt = smoothstep(0.5, 2.2, gsum);
  col = mix(col, uColor3 * gsum, coreAmt * 0.5);

  float bright = uBrightness;
  if (uEnableMouse > 0.5) {
    vec2 md = uv - uMouse;
    float d2 = dot(md, md);
    bright += clamp(uMouseStrength, 0.0, 1.0) * uMouseActive * exp(-d2 * 6.0) * 0.6;
  }
  col *= bright;

  float alpha = clamp(gsum, 0.0, 1.0) * uOpacity;

  vec3 outRgb = col * alpha;

  if (uGrain > 0.5) {
    float gv = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + iTime) * 43758.5453) - 0.5) * uGrainIntensity;
    outRgb = clamp(outRgb + gv, 0.0, 1.0);
    alpha = clamp(alpha + gv, 0.0, 1.0);
  }

  if (uLightMode) {
    vec3 mapped = vec3(1.0) - exp(-max(col, vec3(0.0)) * 1.3);
    float rawEnergy = clamp(max(mapped.r, max(mapped.g, mapped.b)) * uOpacity, 0.0, 1.0);
    float coverage = smoothstep(0.18, 0.72, rawEnergy);
    coverage *= coverage;
    vec3 hue = mapped / max(max(mapped.r, max(mapped.g, mapped.b)), 1e-4);
    vec3 chroma = pow(clamp(hue, 0.0, 1.0), vec3(0.78));
    vec3 pigment = mix(chroma, vec3(0.08), 0.12);
    vec3 ink = mix(vec3(0.9), pigment, 0.82 + coverage * 0.18);
    fragColor = vec4(mix(uBackgroundColor, ink, coverage), 1.0);
  } else {
    fragColor = vec4(outRgb, alpha);
  }
}
`,S=new WeakMap,fe=({color1:h="#5227FF",color2:l="#FF9FFC",color3:R="#FFFFFF",speed:k=.2,threadCount:B=6,frequency:L=5,spread:G=.18,taper:O=1,position:P=.5,fanMode:X="center",glow:_=.02,falloff:q=.6,thickness:I=1.1,brightness:D=.6,opacity:N=1,mirror:W=!0,shimmer:j=!1,grain:z=!0,grainIntensity:H=.05,mouseInteraction:F=!0,mouseStrength:b=.3,backgroundColor:V="#FFFFFF",lightMode:U=!1,className:oe=""})=>{const y=M.useRef(null),g=M.useRef({enabled:!0,strength:.3});return M.useEffect(()=>{const t=y.current;if(!t)return;const n=new ae({webgl:2,alpha:!0,premultipliedAlpha:!0,antialias:!1,dpr:Math.min(window.devicePixelRatio||1,2)}),u=n.gl;u.clearColor(0,0,0,0);const e=u.canvas;e.style.width="100%",e.style.height="100%",e.style.display="block",t.appendChild(e);const d=new re(u),o=new ne(u,{vertex:ce,fragment:me,uniforms:{iTime:{value:0},iResolution:{value:new Float32Array([1,1])},uSpeed:{value:.2},uThreadCount:{value:6},uFrequency:{value:5},uSpread:{value:.18},uTaper:{value:1},uPosition:{value:.5},uFanMode:{value:0},uGlow:{value:.02},uFalloff:{value:.6},uThickness:{value:1.1},uBrightness:{value:.6},uOpacity:{value:1},uMirror:{value:1},uShimmer:{value:0},uGrain:{value:1},uGrainIntensity:{value:.05},uColor1:{value:new Float32Array([1,1,1])},uColor2:{value:new Float32Array([1,1,1])},uColor3:{value:new Float32Array([1,1,1])},uBackgroundColor:{value:new Float32Array([1,1,1])},uLightMode:{value:!1},uMouse:{value:new Float32Array([.5,.5])},uMouseStrength:{value:.3},uEnableMouse:{value:1},uMouseActive:{value:0}}}),s=new ie(u,{geometry:d,program:o});S.set(t,{renderer:n,program:o,mesh:s});const c=()=>{const r=t.getBoundingClientRect(),f=Math.max(1,Math.floor(r.width)),ue=Math.max(1,Math.floor(r.height));n.setSize(f,ue);const ee=o.uniforms.iResolution.value;ee[0]=u.drawingBufferWidth,ee[1]=u.drawingBufferHeight,n.render({scene:s})},m=new ResizeObserver(c);m.observe(t),c();const a=[.5,.5],i=[.5,.5];let C=0,p=0;const $=r=>{const f=e.getBoundingClientRect();i[0]=(r.clientX-f.left)/f.width,i[1]=1-(r.clientY-f.top)/f.height,p=1},Y=()=>{p=1},J=()=>{p=0};e.addEventListener("mousemove",$),e.addEventListener("mouseenter",Y),e.addEventListener("mouseleave",J);let v=0,w=!0,T=!document.hidden;const te=performance.now(),K=r=>{o.uniforms.iTime.value=(r-te)*.001,a[0]+=.05*(i[0]-a[0]),a[1]+=.05*(i[1]-a[1]),C+=.05*(p-C),o.uniforms.uMouse.value[0]=a[0],o.uniforms.uMouse.value[1]=a[1],o.uniforms.uMouseActive.value=C,o.uniforms.uEnableMouse.value=g.current.enabled?1:0,o.uniforms.uMouseStrength.value=g.current.strength,n.render({scene:s}),v=requestAnimationFrame(K)},A=()=>{w&&T&&v===0&&(v=requestAnimationFrame(K))},E=()=>{v!==0&&(cancelAnimationFrame(v),v=0)},Q=new IntersectionObserver(([r])=>{w=r.isIntersecting,w?A():E()},{threshold:0});Q.observe(t);const Z=()=>{T=!document.hidden,T?A():E()};return document.addEventListener("visibilitychange",Z),A(),()=>{E(),m.disconnect(),Q.disconnect(),document.removeEventListener("visibilitychange",Z),e.removeEventListener("mousemove",$),e.removeEventListener("mouseenter",Y),e.removeEventListener("mouseleave",J),S.delete(t);try{t.removeChild(e)}catch{}u.getExtension("WEBGL_lose_context")?.loseContext()}},[]),M.useEffect(()=>{const t=y.current;if(!t)return;const n=S.get(t);if(!n)return;const{program:u}=n,e=u.uniforms;e.uSpeed.value=k,e.uThreadCount.value=Math.round(B),e.uFrequency.value=L,e.uSpread.value=G,e.uTaper.value=O,e.uPosition.value=P,e.uFanMode.value=se[X]??0,e.uGlow.value=_,e.uFalloff.value=q,e.uThickness.value=I,e.uBrightness.value=D,e.uOpacity.value=N,e.uMirror.value=W?1:0,e.uShimmer.value=j?1:0,e.uGrain.value=z?1:0,e.uGrainIntensity.value=H;const d=e.uColor1.value,o=x(h);d[0]=o[0],d[1]=o[1],d[2]=o[2];const s=e.uColor2.value,c=x(l);s[0]=c[0],s[1]=c[1],s[2]=c[2];const m=e.uColor3.value,a=x(R);m[0]=a[0],m[1]=a[1],m[2]=a[2];const i=x(V);e.uBackgroundColor.value[0]=i[0],e.uBackgroundColor.value[1]=i[1],e.uBackgroundColor.value[2]=i[2],e.uLightMode.value=U,e.uMouseStrength.value=b,e.uEnableMouse.value=F?1:0,g.current.enabled=F,g.current.strength=b},[h,l,R,k,B,L,G,O,P,X,_,q,I,D,N,W,j,z,H,F,b,V,U]),le.jsx("div",{ref:y,className:`web-threads-container ${oe}`.trim()})};export{fe as default};
