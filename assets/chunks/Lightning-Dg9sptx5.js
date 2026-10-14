import{r as O,j as Re}from"../text-animations-Cof0zUdW.js";const ve=4,M=4,me=.11,U=1.3,Pe=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`,Ae=`#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uPhase;
uniform vec3 uColor;
uniform float uIntensity;
uniform float uSize;
uniform float uThickness;
uniform float uGlow;
uniform float uFlicker;
uniform float uBranches;
uniform float uXOffset;
uniform float uAngle;
uniform float uSpread;
uniform int uBolts;
uniform vec4 uPointer;
uniform vec4 uStrikes[${M}];
uniform vec4 uStrikeInfo[${M}];
uniform float uFlash;
uniform float uIntro;
uniform float uLight;
uniform float uFade;
uniform float uOpacity;

out vec4 outColor;

const float TAU = 6.28318530718;
const float PERIOD = 8.0;
const float WARP = 2.1;

vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;
}

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float gnoise(vec2 p, float period) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(hash22(mod(i, period)), f);
  float b = dot(hash22(mod(i + vec2(1.0, 0.0), period)), f - vec2(1.0, 0.0));
  float c = dot(hash22(mod(i + vec2(0.0, 1.0), period)), f - vec2(0.0, 1.0));
  float d = dot(hash22(mod(i + vec2(1.0, 1.0), period)), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float period = PERIOD;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    value += amplitude * gnoise(p, period);
    p = p * 2.0 + vec2(17.0, 31.0);
    period *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

float warpField(vec2 q, float base, float reach, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float period = PERIOD;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    float weight = 1.0;
    if (i >= 3) {
      float estimate = abs(base + value * WARP);
      weight = 1.0 - smoothstep(reach * 0.6, reach, estimate);
      if (weight <= 0.0) break;
      reach *= 0.62;
    }
    value += amplitude * gnoise(q, period) * weight;
    q = q * 2.0 + vec2(17.0, 31.0);
    period *= 2.0;
    amplitude *= 0.5;
  }
  return value * WARP;
}

float flicker(float seed) {
  float steady = 0.82 + 0.18 * sin(TAU * (uPhase * 13.0 + seed)) * sin(TAU * (uPhase * 7.0 + seed * 1.7));
  float burst = 0.0;
  for (int j = 0; j < 3; j++) {
    float at = hash11(seed * 17.0 + float(j) * 5.3);
    float since = fract(uPhase - at) * 10.0;
    burst += exp(-since * 7.0) * (0.75 + 0.45 * sin(since * 70.0));
  }
  return mix(1.0, steady + burst * 0.9, uFlicker);
}

float glow(float d, float width) {
  float reach = d / (width * 3.5);
  return width / (d + width * 0.08) / (1.0 + reach * reach);
}

vec2 gDrift;
float gWidth;
float gCore;
float gPixel;

vec3 bolt(
  vec2 p,
  vec2 offset,
  float seed,
  float pinned,
  float front,
  float strength,
  float branches,
  float blink,
  float branchGain,
  vec2 range,
  float heat,
  int octaves
) {
  vec2 q = p * uSize + gDrift + offset;
  float pin = pinned > 0.5 ? fbm(gDrift + offset, octaves) * WARP : 0.0;
  float warp = warpField(q, p.x - pin, 1.3 * max(1.0, uGlow), octaves) - pin;
  float crackle = heat > 0.001 ? heat * 0.012 * gnoise(q * 9.0 + vec2(41.0, 7.0), PERIOD * 9.0) : 0.0;
  float x = p.x + warp + crackle;
  float d = length(vec2(x, max(front - p.y, 0.0)));
  float energy = glow(d, gWidth * (1.0 + heat * 0.6)) * strength;
  float core = (1.0 - smoothstep(gCore - gPixel, gCore + gPixel, d)) * min(strength, 1.6);
  float line = glow(d, gWidth * 0.55) * strength;

  for (int k = 0; k < 6; k++) {
    float order = float(k) + 0.5;
    if (order > branches + heat * 2.0) break;
    float h = seed * 31.0 + float(k) * 13.7;
    float start = mix(range.x, range.y, hash11(h));
    float span = mix(0.22, 0.7, hash11(h + 3.0));
    if (pinned > 0.5) span = min(span, max(start - 0.04, 0.06));
    float along = (start - p.y) / span;
    if (along <= 0.0 || along >= 1.0) continue;
    float side = hash11(h + 1.0) > 0.5 ? 1.0 : -1.0;
    float slope = mix(0.35, 1.15, hash11(h + 2.0));
    float offset = x - side * slope * (start - p.y);
    if (abs(offset) - 0.12 * along > gWidth * 13.0) continue;
    float gain = branchGain;
    if (blink > 0.5) {
      float window = fract(uPhase * 3.0 + hash11(h + 4.0));
      float shown = smoothstep(0.0, 0.03, window) * (1.0 - smoothstep(0.3, 0.42, window));
      gain *= max(shown, heat * 0.8);
      if (gain <= 0.001) continue;
      gain *= flicker(seed + order);
    }
    if (gain <= 0.001) continue;
    vec2 jq = q * 3.0 + vec2(order * 11.0, order * 5.0);
    float jag = (gnoise(jq, PERIOD * 3.0) * 0.12 + gnoise(jq * 3.0 + vec2(5.0, 9.0), PERIOD * 9.0) * 0.035) * along;
    float bd = abs(offset - jag);
    float taper = pow(1.0 - along, 1.6) * smoothstep(0.0, 0.2, along) * smoothstep(front, front + 0.08, p.y);
    energy += glow(bd, gWidth * 0.4) * taper * gain;
    line += glow(bd, gWidth * 0.2) * taper * gain;
    core += (1.0 - smoothstep(gCore * 0.6 - gPixel, gCore * 0.6 + gPixel, bd)) * taper * min(gain, 1.0) * 0.8;
  }
  return vec3(energy, core, line);
}

void main() {
  vec2 uv = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;
  gPixel = 2.0 / uResolution.y;
  gDrift = vec2(PERIOD) * uPhase;
  gWidth = 0.07 * uGlow;
  gCore = 0.0032 * uThickness;
  float ca = cos(uAngle);
  float sa = sin(uAngle);
  mat2 turn = mat2(ca, -sa, sa, ca);
  vec2 local = turn * uv;
  vec2 pointer = turn * uPointer.xy;
  vec2 toPointer = uv - uPointer.xy;
  float heat = uPointer.z * exp(-dot(toPointer, toPointer) / 0.09);
  int octaves = uResolution.y > 1400.0 ? 8 : 7;

  float energy = 0.0;
  float core = 0.0;
  float line = 0.0;

  for (int b = 0; b < ${ve}; b++) {
    if (b >= uBolts) break;
    float seed = float(b) * 7.13 + 0.37;
    float lane = uXOffset + (float(b) - 0.5 * float(uBolts - 1)) * uSpread;
    vec2 p = local - vec2(lane, 0.0);
    float near = exp(-pow(pointer.x - lane, 2.0) / 0.5);
    float lean = uPointer.z * uPointer.w * near * exp(-pow(p.y - pointer.y, 2.0) / 0.14);
    p.x -= lean * clamp(pointer.x - lane, -0.45, 0.45) * 0.55;
    float reveal = uIntro >= 1.0 ? 1.0 : smoothstep(0.0, 0.08, uv.y - (1.1 - 2.4 * uIntro));
    float strength = flicker(seed) * reveal * (1.0 + heat * 1.4) * (1.0 + uFlash);
    vec3 hit = bolt(
      p,
      vec2(float(b) * 3.0, float(b) * 5.0),
      seed,
      0.0,
      -1000.0,
      strength,
      uBranches * 6.0,
      1.0,
      reveal,
      vec2(-0.75, 0.9),
      heat,
      octaves
    );
    energy += hit.x;
    core += hit.y;
    line += hit.z;
  }

  for (int j = 0; j < ${M}; j++) {
    vec4 strike = uStrikes[j];
    if (strike.w <= 0.001) continue;
    vec4 info = uStrikeInfo[j];
    vec2 p = local - turn * strike.xy;
    if (p.y < strike.z - 1.6) continue;
    vec3 hit = bolt(
      p,
      vec2(info.x * 0.731, info.x * 1.377),
      info.x,
      1.0,
      strike.z,
      strike.w,
      uBranches * 6.0,
      0.0,
      strike.w,
      vec2(0.12, info.y),
      heat,
      octaves
    );
    energy += hit.x + info.z * strike.w * glow(length(p), gWidth * 0.5) * 0.12;
    core += hit.y;
    line += hit.z;
  }

  float e = energy * uIntensity * 0.6;
  float hot = clamp(core + smoothstep(6.0, 20.0, e) * 0.55, 0.0, 1.0);
  vec2 edge = min(gl_FragCoord.xy, uResolution - gl_FragCoord.xy) / (uResolution.y * max(uFade, 0.0001) * 0.5);
  float fade = uFade > 0.0 ? smoothstep(0.0, 1.0, edge.x) * smoothstep(0.0, 1.0, edge.y) : 1.0;

  vec3 rgb;
  float alpha;
  if (uLight > 0.5) {
    float stroke = smoothstep(1.0, 3.6, line * uIntensity);
    float halo = 1.0 - exp(-e * 0.35);
    vec3 ink = uColor * 0.82;
    alpha = clamp(stroke + halo * 0.15, 0.0, 1.0);
    rgb = mix(ink, vec3(1.0), hot * 0.85) * alpha;
  } else {
    vec3 lit = 1.0 - exp(-uColor * e * 0.9);
    rgb = mix(lit, vec3(1.0), hot);
    alpha = clamp(max(rgb.r, max(rgb.g, rgb.b)), 0.0, 1.0);
  }
  float keep = fade * uOpacity;
  outColor = vec4(rgb * keep, alpha * keep);
}
`,Ee=p=>{const f=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(p).trim());if(!f)return[.5,.6,1];const R=f[1].length===3?f[1].replace(/./g,c=>c+c):f[1];return[0,2,4].map(c=>parseInt(R.slice(c,c+2),16)/255)},Fe=p=>{const f=Math.min(1,Math.max(0,p));return f*f*f*(f*(f*6-15)+10)},ge=(p,f,R)=>{const c=p.createShader(f);return p.shaderSource(c,R),p.compileShader(c),c},Ie=["uResolution","uPhase","uColor","uIntensity","uSize","uThickness","uGlow","uFlicker","uBranches","uXOffset","uAngle","uSpread","uBolts","uPointer","uStrikes","uStrikeInfo","uFlash","uIntro","uLight","uFade","uOpacity"],Oe=({color:p="#4d6bff",bolts:f=1,spread:R=.6,branches:c=.5,xOffset:G=0,angle:X=0,size:N=1,thickness:$=1,glow:V=1,intensity:Y=1,speed:H=1,flicker:K=.6,mouseInteraction:xe=!0,mouseStrength:be=1,clickStrike:we=!0,intro:ye=!0,fade:J=0,opacity:Q=1,lightMode:Z=!1,paused:ee=!1,dpr:te,className:ke="",style:Me})=>{const oe=O.useRef(null),C=O.useRef(null),ne={color:p,bolts:f,spread:R,branches:c,xOffset:G,angle:X,size:N,thickness:$,glow:V,intensity:Y,speed:H,flicker:K,mouseInteraction:xe,mouseStrength:be,clickStrike:we,intro:ye,fade:J,opacity:Q,lightMode:Z,paused:ee,dpr:te},x=O.useRef(ne);return x.current=ne,O.useEffect(()=>{const l=oe.current;if(!l)return;const e=l.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1});if(!e)return;const b=e.createProgram();if(e.attachShader(b,ge(e,e.VERTEX_SHADER,Pe)),e.attachShader(b,ge(e,e.FRAGMENT_SHADER,Ae)),e.linkProgram(b),!e.getProgramParameter(b,e.LINK_STATUS))return;const i=Object.fromEntries(Ie.map(n=>[n,e.getUniformLocation(b,n)])),T=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,T),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW);const ae=e.getAttribLocation(b,"aPosition"),P=window.matchMedia("(prefers-reduced-motion: reduce)").matches,u={width:1,height:1,left:0,top:0},o={x:0,y:0,vx:0,vy:0,tx:0,ty:0,presence:0,inside:!1},j=Array.from({length:M},()=>({x:0,y:0,born:-1,seed:0,reach:2})),A=new Float32Array(M*4),E=new Float32Array(M*4);let D=0,z=.21,w=x.current.intro&&!P?-1:null,L=!0,I=0,_=0,q=!1;const W=()=>{const n=l.getBoundingClientRect(),t=Math.min(x.current.dpr??window.devicePixelRatio??1,2);u.width=Math.max(1,n.width),u.height=Math.max(1,n.height),u.left=n.left,u.top=n.top;const r=Math.max(1,Math.round(u.width*t)),s=Math.max(1,Math.round(u.height*t));(l.width!==r||l.height!==s)&&(l.width=r,l.height=s)},ie=(n,t)=>[(2*n-u.width)/u.height,(u.height-2*t)/u.height],B=n=>{const t=x.current,r=Ee(t.color);let s=0;for(let g=0;g<M;g++){const h=j[g],v=h.born<0?-1:(n-h.born)/1e3,a=g*4;if(v<0||v>U){A.fill(0,a,a+4),E.fill(0,a,a+4);continue}const pe=Math.min(1,v/me),d=v-me;let S=.45+.35*pe;d>=0&&(S=1.8*Math.exp(-d*5.5)*(.85+.2*Math.sin(d*70)),d>.17&&(S+=Math.exp(-(d-.17)*9)),d>.33&&(S+=.7*Math.exp(-(d-.33)*10)),s+=.5*Math.exp(-d*9),d>.17&&(s+=.25*Math.exp(-(d-.17)*12))),S*=1-Fe((v-(U-.4))/.4),A[a]=h.x,A[a+1]=h.y,A[a+2]=h.reach*(1-pe**1.6),A[a+3]=S,E[a]=h.seed,E[a+1]=h.reach,E[a+2]=d>=0?1:0,E[a+3]=0}const m=w===null?1:w<0?0:Math.min(1,(n-w)/420),[k,F]=ie(o.x,o.y);e.viewport(0,0,l.width,l.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(b),e.bindBuffer(e.ARRAY_BUFFER,T),e.enableVertexAttribArray(ae),e.vertexAttribPointer(ae,2,e.FLOAT,!1,0,0),e.uniform2f(i.uResolution,l.width,l.height),e.uniform1f(i.uPhase,z),e.uniform3f(i.uColor,r[0],r[1],r[2]),e.uniform1f(i.uIntensity,Math.max(0,t.intensity)),e.uniform1f(i.uSize,Math.max(.05,t.size)),e.uniform1f(i.uThickness,Math.max(0,t.thickness)),e.uniform1f(i.uGlow,Math.max(.01,t.glow)),e.uniform1f(i.uFlicker,P?0:Math.min(1,Math.max(0,t.flicker))),e.uniform1f(i.uBranches,Math.min(1,Math.max(0,t.branches))),e.uniform1f(i.uXOffset,t.xOffset),e.uniform1f(i.uAngle,t.angle*Math.PI/180),e.uniform1f(i.uSpread,t.spread),e.uniform1i(i.uBolts,Math.min(ve,Math.max(1,Math.round(t.bolts)))),e.uniform4f(i.uPointer,k,F,o.presence,Math.max(0,t.mouseStrength)),e.uniform4fv(i.uStrikes,A),e.uniform4fv(i.uStrikeInfo,E),e.uniform1f(i.uFlash,Math.min(1,s)),e.uniform1f(i.uIntro,m),e.uniform1f(i.uLight,t.lightMode?1:0),e.uniform1f(i.uFade,Math.min(1,Math.max(0,t.fade))),e.uniform1f(i.uOpacity,Math.min(1,Math.max(0,t.opacity))),e.drawArrays(e.TRIANGLE_STRIP,0,4)},re=n=>{if(I=0,q||!L||document.hidden)return;const t=x.current,r=Math.min(.05,(n-_)/1e3||0);_=n,w!==null&&w<0&&(w=n),!t.paused&&!P&&(z=(z+r*Math.max(0,t.speed)/10)%1);const s=Math.max(1,Math.ceil(r/(1/120))),m=r/s;for(let a=0;a<s;a++)o.vx+=(120*(o.tx-o.x)-19*o.vx)*m,o.vy+=(120*(o.ty-o.y)-19*o.vy)*m,o.x+=o.vx*m,o.y+=o.vy*m;const k=t.mouseInteraction&&o.inside&&!P?1:0;o.presence+=(k-o.presence)*(1-Math.exp(-r/(k>o.presence?.3:.55))),B(n);const F=j.some(a=>a.born>=0&&n-a.born<U*1e3+50),g=w!==null&&n-w<450,h=!t.paused&&!P&&t.speed>0,v=Math.abs(k-o.presence)>.002||Math.abs(o.vx)+Math.abs(o.vy)>.5;(h||F||g||v)&&(I=requestAnimationFrame(re))},y=()=>{I||q||!L||document.hidden||(_=performance.now(),I=requestAnimationFrame(re))},se=n=>{const t=l.getBoundingClientRect(),r=n.clientX-t.left,s=n.clientY-t.top;return[r,s,r>=0&&s>=0&&r<=t.width&&s<=t.height]},fe=n=>{const[t,r,s]=se(n);s&&!o.inside&&o.presence<.02&&(o.x=t,o.y=r,o.vx=o.vy=0),o.tx=t,o.ty=r,o.inside=s,x.current.mouseInteraction&&y()},le=n=>{n.relatedTarget||(o.inside=!1,y())},ce=n=>{if(!x.current.clickStrike||P)return;const[t,r,s]=se(n);if(!s)return;const[m,k]=ie(t,r),F=x.current.angle*Math.PI/180,g=Math.sin(F),h=Math.cos(F),v=u.width/u.height*Math.abs(g)+Math.abs(h),a=j[D];D=(D+1)%M,a.x=m,a.y=k,a.reach=v-(-g*m+h*k)+.2,a.born=performance.now(),a.seed=Math.random()*100,y()};window.addEventListener("pointermove",fe,{passive:!0}),window.addEventListener("pointerdown",ce,{passive:!0}),window.addEventListener("pointerout",le);const ue=new ResizeObserver(()=>{W(),B(performance.now()),y()});ue.observe(l);const he=new IntersectionObserver(([n])=>{L=n.isIntersecting,L&&y()});he.observe(l);const de=()=>{document.hidden||y()};return document.addEventListener("visibilitychange",de),W(),B(performance.now()),y(),C.current={refresh:()=>{W(),B(performance.now()),y()}},()=>{q=!0,cancelAnimationFrame(I),ue.disconnect(),he.disconnect(),window.removeEventListener("pointermove",fe),window.removeEventListener("pointerdown",ce),window.removeEventListener("pointerout",le),document.removeEventListener("visibilitychange",de),e.deleteBuffer(T),e.deleteProgram(b),C.current=null}},[]),O.useEffect(()=>{C.current?.refresh()},[p,f,R,c,G,X,N,$,V,Y,H,K,J,Q,Z,ee,te]),Re.jsx("canvas",{ref:oe,className:`lightning-container ${ke}`.trim(),style:Me})};export{Oe as default};
