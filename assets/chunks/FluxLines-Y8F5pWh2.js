import{r as R,j as oe}from"../text-animations-Cof0zUdW.js";const V=8,Re=1.8,re={up:[0,1],down:[0,-1],left:[-1,0],right:[1,0]},Ee=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Ae=`
float hash(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float smin(float a, float b, float k) {
  float r = exp2(-a / k) + exp2(-b / k);
  return -k * log2(r);
}

float sinlerp(float a, float b, float w) {
  return mix(a, b, (sin(w * 3.14159265 - 3.14159265 / 2.0) + 1.0) / 2.0);
}

float vn(vec2 p, float s, float seed) {
  vec2 cellp = floor(p / s);
  vec2 relp = mod(p, s);
  float g1 = hash(vec3(cellp, seed));
  float g2 = hash(vec3(cellp.x + 1.0, cellp.y, seed));
  float g3 = hash(vec3(cellp.x + 1.0, cellp.y + 1.0, seed));
  float g4 = hash(vec3(cellp.x, cellp.y + 1.0, seed));
  float bx = sinlerp(g1, g2, relp.x / s);
  float tx = sinlerp(g4, g3, relp.x / s);
  return sinlerp(bx, tx, relp.y / s);
}

float dbn(vec2 p, float s, float seed) {
  float o = s / 2.0;
  float n0 = vn(p, s, seed);
  float n1 = vn(p + vec2(o, o), s, seed + 0.1);
  float n2 = vn(p + vec2(-o, o), s, seed + 0.2);
  float n3 = vn(p + vec2(o, -o), s, seed + 0.3);
  float n4 = vn(p + vec2(-o, -o), s, seed + 0.4);
  return (2.0 * n0 + 1.5 * n1 + 1.25 * n2 + 1.125 * n3 + n4) / 7.0;
}
`,Le=`#version 300 es
precision highp float;
precision highp int;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uFlow;
uniform float uSpeed;
uniform float uScale;
uniform float uTurbulence;
uniform float uFluidity;
uniform float uRimWidth;
uniform float uSharpness;
uniform float uShimmer;
uniform float uGlow;
uniform float uLine;
uniform float uMaxHalf;
uniform vec3 uColors[${V}];
uniform int uColorCount;
uniform vec4 uMagnet;
uniform vec4 uSwirl;
uniform float uReveal;
uniform float uLight;
uniform float uOpaque;
uniform vec3 uBackground;
uniform float uOpacity;
out vec4 outColor;
${Ae}

vec3 palette(float h) {
  float x = clamp(h, 0.0, 1.0) * float(uColorCount - 1);
  int i = int(floor(x));
  int j = min(i + 1, uColorCount - 1);
  return mix(uColors[i], uColors[j], smoothstep(0.0, 1.0, x - float(i)));
}

void main() {
  float ref = 700.0 / max(uScale, 0.05);
  vec2 frag = gl_FragCoord.xy;
  vec2 toMagnet = (frag - uMagnet.xy) / uResolution.y;
  float pull = uMagnet.z * exp(-dot(toMagnet, toMagnet) / (uMagnet.w * uMagnet.w));
  if (pull > 0.001) {
    float angle = pull * 0.55;
    float c = cos(angle);
    float s = sin(angle);
    frag = uMagnet.xy + mat2(c, s, -s, c) * (frag - uMagnet.xy);
  }
  if (uSwirl.w > 0.0) {
    vec2 d = frag - uSwirl.xy;
    float reach = uSwirl.z;
    float angle = uSwirl.w * exp(-dot(d, d) / (reach * reach));
    float c = cos(angle);
    float s = sin(angle);
    frag = uSwirl.xy + mat2(c, s, -s, c) * d;
  }
  vec2 p = frag / uResolution.y * ref;

  float spd = 200.0 * uSpeed;
  float t = uTime;
  vec2 dir = uFlow;
  vec2 perp = vec2(-dir.y, dir.x);
  float distort1 = vn(p + perp * (t * spd), 60.0, 10.0) * 50.0 * uTurbulence;
  float distort2 = vn(p - perp * (t * spd), 120.0, 15.0) * 100.0 * uTurbulence;
  float peaks = dbn(p + distort1 + dir * (t * spd * 0.5), 40.0, 1.0);
  float peaks2 = dbn(p + distort2 - dir * (t * spd * 0.5), 40.0, 0.0);
  float field = smin(peaks, peaks2, max(uFluidity, 0.001));

  float slope = length(vec2(dFdx(field), dFdy(field)));
  float gap = abs(field - 0.4);
  float pixels = gap / max(slope, 1e-6);
  float halfBand = max(uRimWidth, 0.001) * 0.5;
  float across = max(gap / halfBand, pixels / uMaxHalf);
  float band = 5.0 * uRimWidth * (1.0 - across);
  float reveal = smoothstep(0.2, 0.85, pull);
  float shimmer = vn(p + dir * (t * spd * 0.5), 60.0, 12.0) * uShimmer * (1.0 - reveal * 0.75);
  float lit = clamp(band - shimmer, 0.0, 1.0);
  float glow = pow(lit, uSharpness) * uGlow * (1.0 + reveal * 0.25);
  float core = uLine > 0.0 ? smoothstep(uLine + 0.75, uLine - 0.75, pixels) * max(smoothstep(0.08, 0.6, glow), reveal) : 0.0;
  float shine = clamp(glow, 0.0, 1.0);
  float energy = max(shine * shine, core * 0.85) * uReveal;

  float h = clamp(0.5 + (peaks - peaks2) * 0.8, 0.0, 1.0);
  vec3 tint = palette(h);

  if (uLight > 0.5) {
    float chroma = max(tint.r, max(tint.g, tint.b)) - min(tint.r, min(tint.g, tint.b));
    vec3 ink = mix(vec3(0.07, 0.07, 0.08), tint * 0.55, clamp(chroma * 1.6, 0.0, 1.0));
    float cover = energy * uOpacity;
    outColor = uOpaque > 0.5 ? vec4(mix(uBackground, ink, cover), 1.0) : vec4(ink * cover, cover);
    return;
  }

  vec3 light = tint * energy * uOpacity;
  outColor = uOpaque > 0.5 ? vec4(uBackground + light, 1.0) : vec4(light, max(light.r, max(light.g, light.b)));
}`,ae=(n,c,m)=>Math.min(m,Math.max(c,n)),ie=(n,c,m)=>{const a=n.createShader(c);return a?(n.shaderSource(a,m),n.compileShader(a),n.getShaderParameter(a,n.COMPILE_STATUS)?a:(n.deleteShader(a),null)):null},Ce=n=>{const c=ie(n,n.VERTEX_SHADER,Ee),m=ie(n,n.FRAGMENT_SHADER,Le),a=n.createProgram();if(!c||!m||!a)return null;if(n.attachShader(a,c),n.attachShader(a,m),n.bindAttribLocation(a,0,"aPosition"),n.linkProgram(a),n.deleteShader(c),n.deleteShader(m),!n.getProgramParameter(a,n.LINK_STATUS))return n.deleteProgram(a),null;const C={},P=n.getProgramParameter(a,n.ACTIVE_UNIFORMS);for(let E=0;E<P;E++){const A=n.getActiveUniform(a,E);A&&(C[A.name.replace("[0]","")]=n.getUniformLocation(a,A.name))}return{program:a,uniforms:C}},Te=({colors:n=["#ffffff","#ffffff","#ffffff"],speed:c=.5,scale:m=1.6,turbulence:a=1,fluidity:C=.1,rimWidth:P=.2,sharpness:E=2.5,shimmer:A=1.5,glow:se=2,lineWidth:le=1,flowDirection:ue="down",opacity:fe=1,mouseInteraction:ce=!0,mouseStrength:me=1,mouseRadius:de=.35,mouseDampening:pe=.15,clickSwirl:he=!0,intro:ve=!0,lightMode:ge=!1,transparent:xe=!0,backgroundColor:we,paused:ye=!1,dpr:Me,mixBlendMode:N,className:U="",style:q,...be})=>{const z=R.useRef(null),G=R.useRef(null),O=R.useRef(null),j={colors:Array.isArray(n)&&n.length?n.slice(0,V):["#ffffff"],speed:c,scale:Math.max(.05,m),turbulence:a,fluidity:Math.max(.001,C),rimWidth:Math.max(.001,P),sharpness:Math.max(.1,E),shimmer:Math.max(0,A),glow:Math.max(0,se),lineWidth:Math.max(0,le),flow:re[ue]??re.down,opacity:ae(fe,0,1),mouseInteraction:ce,mouseStrength:Math.max(0,me),mouseRadius:Math.max(.01,de),mouseDampening:Math.max(0,pe),clickSwirl:he,intro:ve,lightMode:ge,transparent:xe,backgroundColor:we,paused:ye,dpr:Me},p=R.useRef(j);return p.current=j,R.useEffect(()=>{const g=z.current,f=G.current,e=f?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!g||!f||!e)return;const F=Ce(e);if(!F)return;const r=F.uniforms,H=e.createBuffer(),_=e.createVertexArray();e.bindVertexArray(_),e.bindBuffer(e.ARRAY_BUFFER,H),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const x=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),I=new Map,X=(t,o)=>{if(!t)return o;const i=String(t);if(I.has(i))return I.get(i);let s=o;if(x){x.clearRect(0,0,1,1),x.fillStyle="#000000",x.fillStyle=i,x.fillRect(0,0,1,1);const[d,S,v]=x.getImageData(0,0,1,1).data;s=[d/255,S/255,v/255]}return I.set(i,s),s},$=new Float32Array(V*3),L=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,l={x:0,y:0,inside:!1},u={x:0,y:0,active:0},h={x:0,y:0,age:10};let Y=0,w=p.current.intro&&!L?0:1,y=0,M=0,k=!0;const W=()=>{const t=p.current,o=f.width/Math.max(1,g.clientWidth);t.colors.forEach((S,v)=>$.set(X(S,[1,1,1]),v*3));const i=Math.min(1,w);e.viewport(0,0,f.width,f.height),e.useProgram(F.program),e.bindVertexArray(_),e.uniform2f(r.uResolution,f.width,f.height),e.uniform1f(r.uTime,Y),e.uniform2f(r.uFlow,t.flow[0],t.flow[1]),e.uniform1f(r.uSpeed,t.speed),e.uniform1f(r.uScale,t.scale),e.uniform1f(r.uTurbulence,t.turbulence),e.uniform1f(r.uFluidity,t.fluidity),e.uniform1f(r.uRimWidth,t.rimWidth),e.uniform1f(r.uSharpness,t.sharpness),e.uniform1f(r.uShimmer,t.shimmer),e.uniform1f(r.uGlow,t.glow),e.uniform1f(r.uLine,t.lineWidth*o*.5),e.uniform1f(r.uMaxHalf,28*o),e.uniform3fv(r.uColors,$),e.uniform1i(r.uColorCount,t.colors.length),e.uniform4f(r.uMagnet,u.x,u.y,u.active*t.mouseStrength,t.mouseRadius);const s=h.age,d=1.9*Math.min(1,s/.23)*Math.exp(-Math.max(0,s-.23)*1.1);e.uniform4f(r.uSwirl,h.x,h.y,f.height*.22*(1+s*.5),s<6?d:0),e.uniform1f(r.uReveal,i*i*(3-2*i)),e.uniform1f(r.uLight,t.lightMode?1:0),e.uniform1f(r.uOpaque,t.transparent?0:1),e.uniform3fv(r.uBackground,X(t.backgroundColor,t.lightMode?[1,1,1]:[.0706,.0588,.0902])),e.uniform1f(r.uOpacity,t.opacity),e.drawArrays(e.TRIANGLES,0,3)},K=t=>{if(y=0,!k||document.hidden)return;const o=p.current,i=M?ae((t-M)/1e3,5e-4,.05):1/60;M=t;const s=o.paused||L?0:1;Y+=i*s,h.age+=i,o.intro&&!L&&w<1?w=Math.min(1,w+i/Re):(!o.intro||L)&&(w=1);const d=o.mouseInteraction&&l.inside,S=o.mouseDampening>0?1-Math.exp(-i/o.mouseDampening):1;d&&(u.x+=(l.x-u.x)*S,u.y+=(l.y-u.y)*S);const v=d?1:0;u.active+=(v-u.active)*(1-Math.exp(-i/.3)),Math.abs(v-u.active)<.001&&(u.active=v),W(),s>0||u.active!==v||w<1||h.age<6?y=requestAnimationFrame(K):M=0},b=()=>{!y&&k&&!document.hidden&&(y=requestAnimationFrame(K))},B=()=>{const t=p.current,o=Math.max(1,g.clientWidth),i=Math.max(1,g.clientHeight),s=Math.min(t.dpr||window.devicePixelRatio||1,2);f.width=Math.max(1,Math.round(o*s)),f.height=Math.max(1,Math.round(i*s)),W(),b()},Se=t=>{const o=g.getBoundingClientRect(),i=t.clientX-o.left,s=t.clientY-o.top,d=f.width/Math.max(1,o.width);l.inside=i>=0&&s>=0&&i<=o.width&&s<=o.height,l.x=i*d,l.y=(o.height-s)*d},D=t=>{const o=l.inside;Se(t),l.inside&&!o&&u.active<.05&&(u.x=l.x,u.y=l.y),b()},J=t=>{D(t),!(!l.inside||!p.current.clickSwirl||L)&&(h.x=l.x,h.y=l.y,h.age=0,b())},T=t=>{t.pointerType!=="mouse"&&(l.inside=!1)},Q=()=>{l.inside=!1},Z=()=>{M=0,b()},ee=new ResizeObserver(B);ee.observe(g);const te=new IntersectionObserver(t=>{k=t.some(o=>o.isIntersecting),k&&(M=0,b())});te.observe(g),window.addEventListener("pointermove",D,{passive:!0}),window.addEventListener("pointerdown",J,{passive:!0}),window.addEventListener("pointerup",T,{passive:!0}),window.addEventListener("pointercancel",T,{passive:!0}),document.documentElement.addEventListener("pointerleave",Q),document.addEventListener("visibilitychange",Z),B();let ne=p.current.dpr;return O.current=()=>{const t=p.current;if(t.dpr!==ne){ne=t.dpr,B();return}y||W(),b()},()=>{cancelAnimationFrame(y),O.current=null,ee.disconnect(),te.disconnect(),window.removeEventListener("pointermove",D),window.removeEventListener("pointerdown",J),window.removeEventListener("pointerup",T),window.removeEventListener("pointercancel",T),document.documentElement.removeEventListener("pointerleave",Q),document.removeEventListener("visibilitychange",Z),e.deleteProgram(F.program),e.deleteBuffer(H),e.deleteVertexArray(_),e.getExtension("WEBGL_lose_context")?.loseContext()}},[]),R.useEffect(()=>{O.current?.()}),oe.jsx("div",{ref:z,className:`flux-lines-container${U?` ${U}`:""}`,style:N?{...q,mixBlendMode:N}:q,...be,children:oe.jsx("canvas",{ref:G,className:"flux-lines-canvas","aria-hidden":"true"})})};export{Te as default};
