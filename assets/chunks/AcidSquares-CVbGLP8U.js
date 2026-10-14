import{r as R,j as Y}from"../text-animations-BzfSDftD.js";const ke=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Te=(a,f,h)=>`#version 300 es
#define SQUARE ${a}
#define LIGHT ${f}
#define TWIST ${h}
precision highp float;
out vec4 outColor;
uniform vec2 uResolution;
uniform float uTime;
uniform float uSteps;
uniform float uDepth;
uniform float uSpread;
uniform float uLine;
uniform float uZoom;
uniform float uTravel;
uniform float uTwist;
uniform float uRoll;
uniform vec4 uPulse;
uniform vec2 uSparkle;
uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uBrightness;
uniform vec4 uTorch;
uniform vec2 uLook;
uniform float uGrain;
uniform float uFade;
uniform float uOpacity;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

mat2 rotate(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

float smootherstep(float edge, float x) {
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  vec2 ndc = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;
  vec2 dir = rotate(uRoll) * ndc * (0.5 / max(uZoom, 0.05)) + uLook;
  vec3 offset = vec3(0.0, 0.0, uTravel);
  vec3 p = vec3(0.0);
  float s = 0.0;
  float glow = 0.0;
  float edgeLine = 0.0;
  float edgeSoft = 0.0;
  float pulse = 0.0;
  float crest = 0.0;
  float peak = 0.0;
  vec3 home = vec3(0.0);

  for (int i = 0; i < 64; i++) {
    if (float(i) >= uSteps) break;
    p += vec3(dir * s, s);
    vec3 q = p + offset;
#if TWIST
    q.xy = rotate(q.z * uTwist) * q.xy;
#endif
    vec2 cell = ceil(q.xy);
#if SQUARE
    float tube = max(abs(q.x), abs(q.z));
    float ring = max(abs(cell.x), abs(cell.y));
#else
    float tube = length(q.xz);
    float ring = length(cell);
#endif
    s += uDepth - tube + length(cell);
    s = 0.002 + abs(s) * uSpread;
    float g = 1.0 / s;
    glow += g;
    vec2 seam = abs(fract(q.xy) - 0.5);
    float gap = 0.5 - max(seam.x, seam.y);
    gap *= gap;
    float line = max(1.0 - gap * 156.25, 0.0);
    line *= line;
    edgeLine += g * line * line;
#if LIGHT
    float soft = max(1.0 - gap * 12.5, 0.0);
    soft *= soft;
    edgeSoft += g * soft * soft;
#endif
    float wave = fract(ring * uPulse.y - uPulse.w) - 0.5;
    float band = g * exp(wave > 0.0 ? -wave * wave / (uPulse.z * uPulse.z) : wave / (uPulse.z * 2.5)) * smoothstep(0.6, 1.8, ring);
    pulse += band;
    crest += wave > -uPulse.z ? band : 0.0;
    if (g > peak) {
      peak = g;
      home = vec3(cell, floor(q.z * 0.5));
    }
  }

  float h = hash(home.xy * 7.13 + home.z);
  float flicker = step(1.0 - uSparkle.x, h) * (0.5 + 0.5 * sin(uSparkle.y + h * 31.0));
  float base = tanh(glow / 2700.0 * uBrightness);
  float lines = tanh(edgeLine / 2700.0 * uBrightness * 2.0);
  float lit = tanh(pulse / 2700.0 * uBrightness * 1.6);
  float front = tanh(crest / 2700.0 * uBrightness * 1.6);
  float twinkle = tanh(glow * flicker / 2700.0 * uBrightness * 1.6);
  vec2 toTorch = ndc - uTorch.xy;
  float torch = exp(-dot(toTorch, toTorch) / max(uTorch.z * uTorch.z, 0.0001)) * uTorch.w;
  float spark = clamp(front * uPulse.x + twinkle + base * torch * 1.4, 0.0, 1.0);
  float haze = max(lit - front, 0.0) * uPulse.x;

  vec2 uv = gl_FragCoord.xy / uResolution;
  float edge = uFade * 0.5;
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);
  float grain = (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;
  mask *= uOpacity;

#if LIGHT
  float soft = tanh(edgeSoft / 2700.0 * uBrightness * 1.2);
  float near = mix(0.2, 1.0, smoothstep(0.15, 1.1, length(ndc)));
  float face = smoothstep(0.3, 1.0, base) * 0.12;
  float shade = (1.0 - (1.0 - face) * (1.0 - soft * 0.25) * (1.0 - lines * uLine)) * near;
  float glowInk = clamp((1.0 - exp(-spark * 2.4)) * 0.9 + (1.0 - exp(-haze * 2.4)) * 0.16, 0.0, 1.0);
  vec3 color = uColor * 0.5 * shade + uAccent * glowInk * (1.0 - shade);
  float alpha = shade + glowInk * (1.0 - shade);
  vec3 tint = color / max(alpha, 0.0001);
  alpha = clamp(alpha * (1.0 + grain), 0.0, 1.0) * mask;
  outColor = vec4(tint * alpha, alpha);
#else
  float lift = smoothstep(0.0, 0.6, base);
  vec3 structure = mix(uColor, vec3(1.0), 0.22 + 0.13 * lift) * mix(0.45, 1.0, lift);
  structure = mix(structure, mix(uColor, vec3(1.0), 0.55), smoothstep(0.65, 1.0, base));
  float accent = clamp(spark + haze * 0.6, 0.0, 1.0);
  vec3 color = structure * base + mix(uColor, vec3(1.0), 0.7) * lines * uLine + uAccent * accent * (0.6 + 0.4 * base);
  color = max(color + grain * max(color.r, max(color.g, color.b)), 0.0) * mask;
  outColor = vec4(color, max(color.r, max(color.g, color.b)));
#endif
}`,Ae=["uResolution","uTime","uSteps","uDepth","uSpread","uLine","uZoom","uTravel","uTwist","uRoll","uPulse","uSparkle","uColor","uAccent","uBrightness","uTorch","uLook","uGrain","uFade","uOpacity"],Z={low:20,medium:32,high:48},Q=2400,p=(a,f,h)=>Math.min(h,Math.max(f,a)),J=(a,f,h)=>{const i=a.createShader(f);return i?(a.shaderSource(i,h),a.compileShader(i),a.getShaderParameter(i,a.COMPILE_STATUS)?i:(a.deleteShader(i),null)):null},Pe=(a,f,h)=>{const i=J(a,a.VERTEX_SHADER,f),g=J(a,a.FRAGMENT_SHADER,h),m=a.createProgram();return!i||!g||!m?null:(a.attachShader(m,i),a.attachShader(m,g),a.bindAttribLocation(m,0,"aPosition"),a.linkProgram(m),a.deleteShader(i),a.deleteShader(g),a.getProgramParameter(m,a.LINK_STATUS)?m:(a.deleteProgram(m),null))},Me=(a,f,h)=>{const i={};for(const g of h)i[g]=a.getUniformLocation(f,g);return i},Le=({color:a="#120f17",accentColor:f="#c6ff3d",shape:h="square",pulse:i=1,pulseSpeed:g=.45,pulseSpacing:m=1,pulseWidth:ee=1,sparkle:te=.04,speed:oe=.7,breathe:re=1,zoom:ae=1.3,depth:ne=10,edges:se=.45,twist:ie=0,roll:ce=0,brightness:le=1,mouseInteraction:ue=!0,mouseStrength:fe=1,mouseRadius:he=.35,detail:me="medium",grain:de=.03,fade:pe=0,opacity:ge=1,lightMode:ve=!1,paused:xe=!1,dpr:ye,...be})=>{const I=R.useRef(null),z=R.useRef(null),P=R.useRef(null),q={color:String(a),accentColor:String(f),shape:h==="round"?0:1,pulse:Math.max(0,i),pulseSpeed:g,pulseSpacing:p(m,.2,5),pulseWidth:p(ee,.1,5),sparkle:p(te,0,1),speed:oe,breathe:Math.max(0,re),zoom:p(ae,.3,5),depth:p(ne,2,24),edges:p(se,0,1),twist:ie,roll:ce,brightness:Math.max(0,le),mouseInteraction:ue,mouseStrength:Math.max(0,fe),mouseRadius:p(he,.02,2),steps:Z[me]||Z.medium,grain:Math.max(0,de),fade:p(pe,0,1),opacity:p(ge,0,1),lightMode:ve,paused:xe,dpr:ye},k=R.useRef(q);k.current=q,R.useEffect(()=>{const x=I.current,d=z.current,o=d?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!x||!d||!o)return;const T=new Map,_=e=>{const n=`${e.shape}${e.lightMode?1:0}${e.twist!==0?1:0}`;if(!T.has(n)){const t=Pe(o,ke,Te(e.shape,e.lightMode?1:0,e.twist!==0?1:0));T.set(n,t?{program:t,uniforms:Me(o,t,Ae)}:null)}return T.get(n)};if(!_(k.current))return;const M=o.createVertexArray(),D=o.createBuffer();o.bindVertexArray(M),o.bindBuffer(o.ARRAY_BUFFER,D),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),o.STATIC_DRAW),o.enableVertexAttribArray(0),o.vertexAttribPointer(0,2,o.FLOAT,!1,0,0),o.bindVertexArray(null);const E=document.createElement("canvas");E.width=1,E.height=1;const y=E.getContext("2d",{willReadFrequently:!0}),O=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,r={time:0,pulsePhase:0,sparklePhase:0,roll:0,width:1,height:1,colorKey:"",color:[.07,.06,.09],accent:[.78,1,.24],pointer:{x:0,y:0,inside:!1},torch:{x:0,y:0,vx:0,vy:0,presence:0,placed:!1},look:{x:0,y:0,vx:0,vy:0}};let b=0,w=0,A=!0,L=!0;const $=(e,n)=>{if(!y||!e)return n;const t=/^[0-9a-f]{3,8}$/i.test(e)?`#${e}`:e;y.clearRect(0,0,1,1),y.fillStyle="#000000",y.fillStyle=t,y.fillRect(0,0,1,1);const[l,u,s]=y.getImageData(0,0,1,1).data;return[l/255,u/255,s/255]},Se=e=>{const n=`${e.color}|${e.accentColor}`;n!==r.colorKey&&(r.colorKey=n,r.color=$(e.color,[.07,.06,.09]),r.accent=$(e.accentColor,[.78,1,.24]))},V=()=>{const e=k.current,n=Math.max(1,x.clientWidth),t=Math.max(1,x.clientHeight),l=Math.min(e.dpr||window.devicePixelRatio||1,2),u=Math.max(n,t)*l,s=u>Q?l*Q/u:l,c=Math.max(1,Math.round(n*s)),v=Math.max(1,Math.round(t*s));(d.width!==c||d.height!==v)&&(d.width=c,d.height=v),r.width=n,r.height=t,C()},C=()=>{const e=k.current,n=_(e);if(o.viewport(0,0,d.width,d.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),!n)return;const{uniforms:t}=n;Se(e);const l=r.width/r.height;o.useProgram(n.program),o.uniform2f(t.uResolution,d.width,d.height),o.uniform1f(t.uTime,r.time%1e3),o.uniform1f(t.uSteps,e.steps),o.uniform1f(t.uDepth,e.depth),o.uniform1f(t.uSpread,.2+e.edges*.22),o.uniform1f(t.uLine,e.lightMode?.25+e.edges*.45:.15+e.edges*.35),o.uniform1f(t.uZoom,e.zoom),o.uniform1f(t.uTravel,Math.sin(r.time)*e.breathe),o.uniform1f(t.uTwist,e.twist),o.uniform1f(t.uRoll,r.roll),o.uniform4f(t.uPulse,e.pulse,.16/e.pulseSpacing,.05*e.pulseWidth,r.pulsePhase),o.uniform2f(t.uSparkle,e.sparkle,r.sparklePhase),o.uniform3f(t.uColor,r.color[0],r.color[1],r.color[2]),o.uniform3f(t.uAccent,r.accent[0],r.accent[1],r.accent[2]),o.uniform1f(t.uBrightness,e.brightness),o.uniform4f(t.uTorch,(r.torch.x/r.width-.5)*2*l,(.5-r.torch.y/r.height)*2,e.mouseRadius,e.mouseStrength*r.torch.presence),o.uniform2f(t.uLook,r.look.x,r.look.y),o.uniform1f(t.uGrain,e.grain),o.uniform1f(t.uFade,e.fade),o.uniform1f(t.uOpacity,e.opacity),o.bindVertexArray(M),o.drawArrays(o.TRIANGLES,0,3),o.bindVertexArray(null)},G=e=>{if(b=0,!L||!A||document.hidden)return;const n=k.current,t=w?Math.min(.05,(e-w)/1e3):1/60;w=e;const l=!n.paused&&!O;l&&(r.time+=t*n.speed,r.pulsePhase=(r.pulsePhase+t*n.pulseSpeed)%1,r.sparklePhase=(r.sparklePhase+t*2)%(Math.PI*2),r.roll+=t*n.roll);const{pointer:u,torch:s,look:c}=r,v=n.mouseInteraction&&u.inside&&!O;v&&!s.placed&&(s.x=u.x,s.y=u.y,s.vx=0,s.vy=0,s.placed=!0),s.vx+=(110*(u.x-s.x)-19*s.vx)*t,s.vy+=(110*(u.y-s.y)-19*s.vy)*t,s.x+=s.vx*t,s.y+=s.vy*t;const F=v?1:0;s.presence+=(F-s.presence)*(1-Math.exp(-t/(F>s.presence?.3:.6))),!v&&s.presence<.001&&(s.placed=!1);const j=v?(u.x/r.width-.5)*.06:0,K=v?(.5-u.y/r.height)*.06:0;c.vx+=(40*(j-c.x)-12*c.vx)*t,c.vy+=(40*(K-c.y)-12*c.vy)*t,c.x+=c.vx*t,c.y+=c.vy*t,C();const Re=Math.abs(F-s.presence)>.002||Math.hypot(s.vx,s.vy)>.5||Math.abs(j-c.x)>2e-4||Math.abs(K-c.y)>2e-4;l||Re?b=requestAnimationFrame(G):w=0},S=()=>{!b&&L&&A&&!document.hidden&&(b=requestAnimationFrame(G))},U=e=>{const n=x.getBoundingClientRect(),t=e.clientX-n.left,l=e.clientY-n.top;r.pointer.x=t,r.pointer.y=l,r.pointer.inside=t>=0&&l>=0&&t<=n.width&&l<=n.height,S()},N=()=>{r.pointer.inside=!1,S()},H=()=>{w=0,S()},W=new ResizeObserver(V);W.observe(x);const X=new IntersectionObserver(e=>{A=e.some(n=>n.isIntersecting),A&&(w=0,S())});return X.observe(x),window.addEventListener("pointermove",U,{passive:!0}),document.documentElement.addEventListener("pointerleave",N),document.addEventListener("visibilitychange",H),V(),S(),P.current=()=>{b||C(),S()},()=>{L=!1,cancelAnimationFrame(b),P.current=null,W.disconnect(),X.disconnect(),window.removeEventListener("pointermove",U),document.documentElement.removeEventListener("pointerleave",N),document.removeEventListener("visibilitychange",H),o.deleteBuffer(D),o.deleteVertexArray(M),T.forEach(e=>e&&o.deleteProgram(e.program))}},[]),R.useEffect(()=>{P.current?.()});const{className:B="",...we}=be;return Y.jsx("div",{ref:I,className:`acid-squares-container${B?` ${B}`:""}`,...we,children:Y.jsx("canvas",{ref:z,className:"acid-squares-canvas","aria-hidden":"true"})})};export{Le as default};
