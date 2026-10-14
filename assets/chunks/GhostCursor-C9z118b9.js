import{r as F,j as Pe}from"../text-animations-Cpfg-DyU.js";const Ze=`#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,et=`
vec2 hash2(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;
}

vec3 gradientNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
  vec2 ga = hash2(i);
  vec2 gb = hash2(i + vec2(1.0, 0.0));
  vec2 gc = hash2(i + vec2(0.0, 1.0));
  vec2 gd = hash2(i + vec2(1.0, 1.0));
  float va = dot(ga, f);
  float vb = dot(gb, f - vec2(1.0, 0.0));
  float vc = dot(gc, f - vec2(0.0, 1.0));
  float vd = dot(gd, f - vec2(1.0, 1.0));
  float k = va - vb - vc + vd;
  float value = va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * k;
  vec2 slope = ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd) + du * (u.yx * k + vec2(vb, vc) - va);
  return vec3(value, slope);
}
`,tt=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uState;
uniform vec2 uSize;
uniform float uDt;
uniform float uTime;
uniform float uDecay;
uniform float uDrag;
uniform vec2 uDrift;
uniform float uTurbulence;
uniform float uSwirl;
uniform vec2 uFrom;
uniform vec2 uTo;
uniform float uRadius;
uniform float uTrail;
uniform float uIdle;
uniform vec2 uVelocity;
uniform vec4 uPuff;
${et}
float erf(float x) {
  float x2 = x * x;
  return sign(x) * sqrt(1.0 - exp(-x2 * (1.2732395 + 0.147 * x2) / (1.0 + 0.147 * x2)));
}
vec2 curl(vec2 p) {
  vec3 a = gradientNoise(p * uSwirl + vec2(uTime * 0.11, -uTime * 0.07));
  vec3 b = gradientNoise(p * uSwirl * 2.03 + vec2(-uTime * 0.13, uTime * 0.09) + 17.3);
  vec2 g = a.yz + b.yz * 0.5;
  return vec2(g.y, -g.x);
}
vec4 fetch(vec2 p) {
  if (p.x < 0.0 || p.y < 0.0 || p.x > uSize.x || p.y > uSize.y) return vec4(0.0);
  return texture(uState, p / uSize);
}
void main() {
  vec2 p = gl_FragCoord.xy;
  vec4 here = texture(uState, vUv);
  vec2 flow = here.gb + curl(p) * uTurbulence + uDrift;
  vec4 state = fetch(p - flow * uDt);
  float density = state.r * uDecay;
  vec2 velocity = state.gb * uDrag;

  float sigma = max(uRadius, 0.5);
  vec2 ab = uTo - uFrom;
  float len = length(ab);
  float trail = 0.0;
  if (len > 0.25) {
    vec2 dir = ab / len;
    vec2 ap = p - uFrom;
    float along = dot(ap, dir);
    float across = dot(ap, vec2(-dir.y, dir.x));
    float k = 1.4142136 * sigma;
    trail = exp(-across * across / (2.0 * sigma * sigma)) * 0.5 * (erf(along / k) - erf((along - len) / k));
  }
  vec2 dh = p - uTo;
  float head = exp(-dot(dh, dh) / (2.0 * sigma * sigma));
  density += uTrail * trail + uIdle * uDt * head;
  velocity += (uVelocity - velocity) * clamp(trail * 0.65, 0.0, 1.0);

  if (uPuff.w > 0.0) {
    vec2 d = p - uPuff.xy;
    float r2 = dot(d, d);
    float g = exp(-r2 / (2.0 * uPuff.z * uPuff.z));
    density += uPuff.w * g;
    velocity += (r2 > 0.0001 ? d / sqrt(r2) : vec2(0.0)) * g * uPuff.w * uPuff.z * 2.2;
  }

  fragColor = vec4(clamp(density, 0.0, 6.0), velocity, 1.0);
}`,ot=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uState;
uniform vec2 uSimSize;
uniform vec2 uView;
uniform vec2 uHead;
uniform float uHeadSize;
uniform float uHeadAmount;
uniform float uTime;
uniform vec3 uColor;
uniform float uDetail;
uniform float uNoiseScale;
uniform vec2 uFlow;
uniform float uBrightness;
uniform float uTheme;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(0.8776, 0.4794, -0.4794, 0.8776);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = m * p * 2.0;
    a *= 0.5;
  }
  return v;
}
float fbm5(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(0.8776, 0.4794, -0.4794, 0.8776);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p * 2.0;
    a *= 0.52;
  }
  return v;
}
vec4 cubic(sampler2D tex, vec2 uv, vec2 size) {
  vec2 st = uv * size - 0.5;
  vec2 i = floor(st);
  vec2 f = st - i;
  vec2 f2 = f * f;
  vec2 f3 = f2 * f;
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0;
  vec2 w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0;
  vec2 w3 = f3 / 6.0;
  vec2 g0 = w0 + w1;
  vec2 g1 = w2 + w3;
  vec2 c0 = (i + 0.5 + w1 / g0 - 1.0) / size;
  vec2 c1 = (i + 0.5 + w3 / g1 + 1.0) / size;
  vec4 a = texture(tex, c0) * g0.x + texture(tex, vec2(c1.x, c0.y)) * g1.x;
  vec4 b = texture(tex, vec2(c0.x, c1.y)) * g0.x + texture(tex, c1) * g1.x;
  return a * g0.y + b * g1.y;
}
float field(vec2 uv, vec2 p) {
  vec2 d = p - uHead;
  return cubic(uState, uv, uSimSize).r + uHeadAmount * exp(-dot(d, d) / (2.0 * uHeadSize * uHeadSize));
}
void main() {
  vec2 p = vUv * uView;
  float density = field(vUv, p);
  if (density < 0.002) {
    fragColor = vec4(0.0);
    return;
  }
  vec2 step = vec2(1.5) / uSimSize;
  float dx = field(vUv + vec2(step.x, 0.0), p + vec2(step.x * uView.x, 0.0)) - field(vUv - vec2(step.x, 0.0), p - vec2(step.x * uView.x, 0.0));
  float dy = field(vUv + vec2(0.0, step.y), p + vec2(0.0, step.y * uView.y)) - field(vUv - vec2(0.0, step.y), p - vec2(0.0, step.y * uView.y));

  vec2 n = (p + uFlow) * uNoiseScale;
  float t = uTime;
  vec2 q = vec2(fbm(n + t * 0.1), fbm(n + vec2(5.2, 1.3) + t * 0.1));
  vec2 r = vec2(fbm(n + q * 1.8 + vec2(1.7, 9.2) + t * 0.15), fbm(n + q * 1.8 + vec2(8.3, 2.8) + t * 0.15));
  float smoke = fbm5(n + r * 1.1);
  float wisp = pow(smoothstep(0.18, 0.82, smoke), 2.0) * 2.8;
  float body = density * mix(1.0, wisp, uDetail);
  float cloud = body * smoothstep(0.0, 0.32, body) * 1.15;
  if (cloud <= 0.0) {
    fragColor = vec4(0.0);
    return;
  }

  vec3 normal = normalize(vec3(-dx * 2.2, -dy * 2.2, 1.0) + vec3((q - 0.5) * 0.35 * uDetail, 0.0));
  float light = 0.7 + 0.5 * max(dot(normal, normalize(vec3(-0.35, 0.55, 0.75))), 0.0);
  float core = smoothstep(0.7, 2.2, cloud);

  vec3 tint = mix(uColor * light, mix(uColor, vec3(1.0), 0.55) * light, core);
  vec3 ink = mix(uColor, uColor * 0.78, core * 0.6) * (1.12 - 0.12 * light);
  vec3 color = mix(tint * uBrightness, ink, uTheme) * cloud;
  fragColor = vec4(color, cloud);
}`,rt=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSource;
uniform vec2 uTexel;
uniform float uThreshold;
void main() {
  vec4 a = texture(uSource, vUv + uTexel * vec2(-0.5, -0.5));
  vec4 b = texture(uSource, vUv + uTexel * vec2(0.5, -0.5));
  vec4 c = texture(uSource, vUv + uTexel * vec2(-0.5, 0.5));
  vec4 d = texture(uSource, vUv + uTexel * vec2(0.5, 0.5));
  vec4 color = (a + b + c + d) * 0.25;
  float peak = max(color.r, max(color.g, color.b));
  float keep = peak > 0.0 ? max(peak - uThreshold, 0.0) / peak : 0.0;
  fragColor = color * keep;
}`,it=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSource;
uniform vec2 uDirection;
void main() {
  vec4 color = texture(uSource, vUv) * 0.181862;
  color += (texture(uSource, vUv + uDirection * 1.423135) + texture(uSource, vUv - uDirection * 1.423135)) * 0.284316;
  color += (texture(uSource, vUv + uDirection * 3.326702) + texture(uSource, vUv - uDirection * 3.326702)) * 0.106598;
  color += (texture(uSource, vUv + uDirection * 5.242989) + texture(uSource, vUv - uDirection * 5.242989)) * 0.018156;
  fragColor = color;
}`,at=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uShade;
uniform sampler2D uBloom0;
uniform sampler2D uBloom1;
uniform sampler2D uBloom2;
uniform vec2 uShadeSize;
uniform vec3 uWeights;
uniform float uBloom;
uniform float uPresence;
uniform float uGrain;
uniform float uEdge;
uniform float uTime;
uniform float uTheme;
uniform vec3 uColor;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec4 cubic(sampler2D tex, vec2 uv, vec2 size) {
  vec2 st = uv * size - 0.5;
  vec2 i = floor(st);
  vec2 f = st - i;
  vec2 f2 = f * f;
  vec2 f3 = f2 * f;
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0;
  vec2 w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0;
  vec2 w3 = f3 / 6.0;
  vec2 g0 = w0 + w1;
  vec2 g1 = w2 + w3;
  vec2 c0 = (i + 0.5 + w1 / g0 - 1.0) / size;
  vec2 c1 = (i + 0.5 + w3 / g1 + 1.0) / size;
  vec4 a = texture(tex, c0) * g0.x + texture(tex, vec2(c1.x, c0.y)) * g1.x;
  vec4 b = texture(tex, vec2(c0.x, c1.y)) * g0.x + texture(tex, c1) * g1.x;
  return a * g0.y + b * g1.y;
}
void main() {
  vec4 shade = cubic(uShade, vUv, uShadeSize);
  vec4 bloom = texture(uBloom0, vUv) * uWeights.x + texture(uBloom1, vUv) * uWeights.y + texture(uBloom2, vUv) * uWeights.z;
  vec2 edge = min(vUv, 1.0 - vUv);
  float vignette = mix(1.0 - uEdge, 1.0, clamp(min(edge.x, edge.y) * 2.0, 0.0, 1.0));
  float fade = uPresence * vignette;
  float grain = hash(gl_FragCoord.xy + fract(uTime * 7.13) * 91.7) - 0.5;
  if (uTheme > 0.5) {
    float coverage = 1.0 - exp(-(shade.a + bloom.a * uBloom * 0.6) * 0.95);
    coverage = clamp(coverage * fade * (1.0 + grain * uGrain * 2.0), 0.0, 1.0);
    vec3 pigment = shade.a > 0.0001 ? clamp(shade.rgb / shade.a, 0.0, 1.0) : uColor;
    fragColor = vec4(pow(pigment, vec3(1.0 / 2.2)) * coverage, coverage);
    return;
  }
  vec3 color = (shade.rgb + bloom.rgb * uBloom) * fade;
  color = pow(1.0 - exp(-color * 0.95), vec3(1.0 / 2.2));
  color += color * grain * uGrain * 2.0;
  color = clamp(color + (hash(gl_FragCoord.xy * 1.37) - 0.5) / 255.0, 0.0, 1.0);
  fragColor = vec4(color, max(color.r, max(color.g, color.b)));
}`,nt=1900,E=(i,b,d)=>Math.min(d,Math.max(b,i)),ut=i=>{const b=String(i||"").trim(),d=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(b);if(d){const v=d[1].length===3?d[1].replace(/./g,w=>w+w):d[1];return[0,2,4].map(w=>parseInt(v.slice(w,w+2),16)/255)}const c=/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(b);return c?[c[1],c[2],c[3]].map(v=>E(parseFloat(v)/255,0,1)):[.706,.592,.812]},_e=(i,b,d)=>{const c=i.createShader(b);return c?(i.shaderSource(c,d),i.compileShader(c),i.getShaderParameter(c,i.COMPILE_STATUS)?c:(console.error(i.getShaderInfoLog(c)),i.deleteShader(c),null)):null},X=(i,b)=>{const d=_e(i,i.VERTEX_SHADER,Ze),c=_e(i,i.FRAGMENT_SHADER,b),v=d&&c?i.createProgram():null;if(!d||!c||!v)return d&&i.deleteShader(d),c&&i.deleteShader(c),null;if(i.attachShader(v,d),i.attachShader(v,c),i.bindAttribLocation(v,0,"aPosition"),i.linkProgram(v),i.deleteShader(d),i.deleteShader(c),!i.getProgramParameter(v,i.LINK_STATUS))return console.error(i.getProgramInfoLog(v)),i.deleteProgram(v),null;const w={},$=i.getProgramParameter(v,i.ACTIVE_UNIFORMS);for(let N=0;N<$;N++){const k=i.getActiveUniform(v,N);k&&(w[k.name]=i.getUniformLocation(v,k.name))}return{program:v,uniforms:w}},ft=({color:i="#B497CF",brightness:b=1,size:d=80,trailLength:c=50,inertia:v=.5,turbulence:w=.5,drift:$=.3,detail:N=1,grainIntensity:k=.05,bloomStrength:ze=.6,bloomRadius:Ce=1,bloomThreshold:Le=.025,edgeIntensity:Be=0,clickPuff:Ie=!0,intro:Ne=!0,theme:ke="dark",mixBlendMode:Oe,fadeDelayMs:Ve,fadeDurationMs:Ge,maxDevicePixelRatio:Xe=2,targetPixels:He,zIndex:qe=10,className:We="",style:je})=>{const ne=F.useRef(null),ue=F.useRef(null),K=F.useRef(null),[ce,Ye]=F.useState(0),[J]=F.useState(()=>typeof window<"u"&&("ontouchstart"in window||navigator.maxTouchPoints>0)),fe=ke==="light",se={color:ut(i).map(A=>Math.pow(A,2.2)),brightness:Math.max(0,b),size:Math.max(8,d),trail:E(c,1,200),inertia:E(v,0,.99),turbulence:E(w,0,2),drift:$,detail:E(N,0,1),grain:E(k,0,1),bloom:Math.max(0,ze),bloomRadius:E(Ce,0,3),threshold:Math.max(0,Le),edge:E(Be,0,1),clickPuff:Ie,intro:Ne,theme:fe?1:0,fadeDelay:Math.max(0,Ve??(J?500:1e3)),fadeDuration:Math.max(1,Ge??(J?1e3:1500)),maxRatio:E(Xe,.25,3),budget:Math.max(5e4,He??(J?3e5:6e5))},D=F.useRef(se);D.current=se,F.useEffect(()=>{K.current?.()}),F.useEffect(()=>{const A=ne.current,p=ue.current,P=A?.parentElement;if(!A||!p||!P)return;const Q=P.style.position,H=getComputedStyle(P).position==="static";H&&(P.style.position="relative");const Ke=window.matchMedia("(prefers-reduced-motion: reduce)").matches,e=p.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"default"});if(!e||!e.getExtension("EXT_color_buffer_float")){H&&(P.style.position=Q);return}const le=[X(e,tt),X(e,ot),X(e,rt),X(e,it),X(e,at)],[ve,me,de,he,xe]=le;if(!ve||!me||!de||!he||!xe){for(const o of le)o&&e.deleteProgram(o.program);H&&(P.style.position=Q);return}const _={sim:ve,shade:me,down:de,blur:he,composite:xe},pe=e.createVertexArray();e.bindVertexArray(pe);const ge=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,ge),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.disable(e.BLEND),e.disable(e.DEPTH_TEST);const S=()=>{const o=e.createTexture();e.bindTexture(e.TEXTURE_2D,o),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const t=e.createFramebuffer();return{texture:o,framebuffer:t,width:0,height:0}},O=(o,t,a)=>o.width===t&&o.height===a?!1:(o.width=t,o.height=a,e.bindTexture(e.TEXTURE_2D,o.texture),e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,t,a,0,e.RGBA,e.HALF_FLOAT,null),e.bindFramebuffer(e.FRAMEBUFFER,o.framebuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,o.texture,0),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),!0),R=[S(),S()],z=S(),T=[S(),S(),S()],V=[S(),S(),S()],I=(o,t)=>(e.bindFramebuffer(e.FRAMEBUFFER,o?o.framebuffer:null),e.viewport(0,0,o?o.width:p.width,o?o.height:p.height),e.useProgram(t.program),t.uniforms),M=(o,t)=>{e.activeTexture(e.TEXTURE0+o),e.bindTexture(e.TEXTURE_2D,t)},m={width:1,height:1,ratio:1,sim:.25,shade:1},r={x:0,y:0,vx:0,vy:0,px:0,py:0,ready:!1},s={x:0,y:0,inside:!1,moved:-1e9},ye={y:0},Z=[];let g=0,C=0,L=0,q=0,W=0,ee=!0,te=document.visibilityState!=="hidden",oe=!1,j=!0,G=D.current.intro&&!Ke&&ce===0,re=-1;const be=()=>{const o=D.current,t=A.getBoundingClientRect(),a=Math.max(1,Math.round(t.width)),l=Math.max(1,Math.round(t.height)),u=Math.min(window.devicePixelRatio||1,o.maxRatio);m.width=a,m.height=l,m.ratio=u;const h=Math.max(1,Math.round(a*u)),f=Math.max(1,Math.round(l*u));(p.width!==h||p.height!==f)&&(p.width=h,p.height=f),m.shade=Math.min(1,Math.sqrt(o.budget/(a*l)));const y=Math.max(8,Math.round(a*m.shade)),n=Math.max(8,Math.round(l*m.shade));O(z,y,n);let x=Math.max(4,Math.round(y/2)),B=Math.max(4,Math.round(n/2));for(let Y=0;Y<3;Y++)O(T[Y],x,B),O(V[Y],x,B),x=Math.max(2,Math.round(x/2)),B=Math.max(2,Math.round(B/2));m.sim=Math.min(.35,220/Math.max(a,l));const Ue=Math.max(16,Math.round(a*m.sim)),Fe=Math.max(16,Math.round(l*m.sim));O(R[0],Ue,Fe),O(R[1],Ue,Fe),j=!0},Je=(o,t)=>{const a=D.current,l=R[C],u=R[1-C],h=m.sim,f=a.size*h*.3,y=Math.exp(-o/(.12+a.trail*.022)),n=I(u,_.sim);M(0,l.texture),e.uniform1i(n.uState,0),e.uniform2f(n.uSize,u.width,u.height),e.uniform1f(n.uDt,o),e.uniform1f(n.uTime,W),e.uniform1f(n.uDecay,y),e.uniform1f(n.uDrag,Math.exp(-o*2.4)),e.uniform2f(n.uDrift,0,a.drift*110*h),e.uniform1f(n.uTurbulence,a.turbulence*70*h),e.uniform1f(n.uSwirl,1/Math.max(1,a.size*h*2.2)),e.uniform2f(n.uFrom,r.px*h,(m.height-r.py)*h),e.uniform2f(n.uTo,r.x*h,(m.height-r.y)*h),e.uniform1f(n.uRadius,f),e.uniform1f(n.uTrail,t?.42*g:0),e.uniform1f(n.uIdle,t?.22*g:0),e.uniform2f(n.uVelocity,r.vx*h*.5,-r.vy*h*.5);const x=Z.shift();x?e.uniform4f(n.uPuff,x.x*h,(m.height-x.y)*h,f*1.4,.9):e.uniform4f(n.uPuff,0,0,1,0),e.drawArrays(e.TRIANGLES,0,3),C=1-C},Qe=()=>{const o=D.current;let t=I(z,_.shade);M(0,R[C].texture),e.uniform1i(t.uState,0),e.uniform2f(t.uSimSize,R[C].width,R[C].height),e.uniform2f(t.uView,m.width,m.height),e.uniform2f(t.uHead,r.x,m.height-r.y),e.uniform1f(t.uHeadSize,o.size*.38),e.uniform1f(t.uHeadAmount,r.ready?.8*g:0),e.uniform1f(t.uTime,W),e.uniform3fv(t.uColor,o.color),e.uniform1f(t.uDetail,o.detail),e.uniform1f(t.uNoiseScale,2.4/Math.max(20,o.size*2.6)),e.uniform2f(t.uFlow,0,ye.y),e.uniform1f(t.uBrightness,o.brightness),e.uniform1f(t.uTheme,o.theme),e.drawArrays(e.TRIANGLES,0,3);let a=z;for(let u=0;u<3;u++)t=I(T[u],_.down),M(0,a.texture),e.uniform1i(t.uSource,0),e.uniform2f(t.uTexel,1/a.width,1/a.height),e.uniform1f(t.uThreshold,u===0?o.threshold:0),e.drawArrays(e.TRIANGLES,0,3),t=I(V[u],_.blur),M(0,T[u].texture),e.uniform1i(t.uSource,0),e.uniform2f(t.uDirection,1/T[u].width,0),e.drawArrays(e.TRIANGLES,0,3),t=I(T[u],_.blur),M(0,V[u].texture),e.uniform1i(t.uSource,0),e.uniform2f(t.uDirection,0,1/V[u].height),e.drawArrays(e.TRIANGLES,0,3),a=T[u];t=I(null,_.composite),M(0,z.texture),M(1,T[0].texture),M(2,T[1].texture),M(3,T[2].texture),e.uniform1i(t.uShade,0),e.uniform1i(t.uBloom0,1),e.uniform1i(t.uBloom1,2),e.uniform1i(t.uBloom2,3),e.uniform2f(t.uShadeSize,z.width,z.height);const l=o.bloomRadius;e.uniform3f(t.uWeights,1,.6+.4*l,.25+.75*Math.min(1,l*l*.5)),e.uniform1f(t.uBloom,o.bloom),e.uniform1f(t.uPresence,g),e.uniform1f(t.uGrain,o.grain),e.uniform1f(t.uEdge,o.edge),e.uniform1f(t.uTime,W),e.uniform1f(t.uTheme,o.theme),e.uniform3fv(t.uColor,o.color),e.drawArrays(e.TRIANGLES,0,3)},we=o=>{if(L=0,oe)return;const t=E((o-q)/1e3||0,0,.05);q=Math.max(q,o),W+=t;const a=D.current;if(j&&be(),j=!1,G){re<0&&(re=o+280);const f=(o-re)/nt;if(f>=0){const y=f<1?f*f*(3-2*f):1,n=m.width*(.16+.44*y+.05*Math.sin(y*Math.PI)),x=m.height*(.7-.24*y-.1*Math.sin(y*Math.PI*2));r.ready||(r.x=r.px=n,r.y=r.py=x,r.vx=r.vy=0,r.ready=!0),s.x=n,s.y=x,s.inside=!0,s.moved=o,f>=1&&(G=!1)}}const l=o-s.moved,u=r.ready?l<a.fadeDelay?1:Math.max(0,1-(l-a.fadeDelay)/a.fadeDuration):0;if(g+=(u-g)*(1-Math.exp(-t/(u>g?.12:.08))),Math.abs(u-g)<.002&&(g=u),r.px=r.x,r.py=r.y,r.ready)if(s.inside){const f=520*Math.pow(1-a.inertia,2)+26,y=2*Math.sqrt(f)*.92,n=Math.max(1,Math.ceil(t/(1/240))),x=t/n;for(let B=0;B<n;B++)r.vx+=(f*(s.x-r.x)-y*r.vx)*x,r.vy+=(f*(s.y-r.y)-y*r.vy)*x,r.x+=r.vx*x,r.y+=r.vy*x}else{const f=Math.pow(a.inertia,t*60);r.vx*=f,r.vy*=f,r.x+=r.vx*t,r.y+=r.vy*t}if(ye.y-=a.drift*110*t,Je(t,g>.01),Qe(),!(G||u>0||g>.001||Z.length>0)){for(const f of R)e.bindFramebuffer(e.FRAMEBUFFER,f.framebuffer),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT);e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,p.width,p.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT);return}ee&&te&&(L=requestAnimationFrame(we))},U=()=>{L||oe||!ee||!te||(q=performance.now(),L=requestAnimationFrame(we))};K.current=U;const Te=o=>{const t=A.getBoundingClientRect(),a=o.clientX-t.left,l=o.clientY-t.top;return{x:a,y:l,inside:a>=0&&l>=0&&a<=t.width&&l<=t.height}},ie=o=>{const t=Te(o);if(t.inside&&(G=!1),!t.inside){s.inside&&ae();return}!s.inside&&!r.ready?(r.x=r.px=t.x,r.y=r.py=t.y,r.vx=r.vy=0,r.ready=!0):!s.inside&&g<.05&&(r.x=r.px=t.x,r.y=r.py=t.y,r.vx=r.vy=0),s.x=t.x,s.y=t.y,s.inside=!0,s.moved=performance.now(),U()},Ee=o=>{const t=Te(o);t.inside&&(ie(o),D.current.clickPuff&&(Z.push({x:t.x,y:t.y}),U()))},ae=()=>{const o=performance.now();s.inside&&o-s.moved<D.current.fadeDelay&&(s.moved=o),s.inside=!1,U()};window.addEventListener("pointermove",ie,{passive:!0}),window.addEventListener("pointerdown",Ee,{passive:!0}),document.documentElement.addEventListener("pointerleave",ae);const Se=o=>{o.preventDefault(),oe=!0,cancelAnimationFrame(L),L=0},Re=()=>Ye(o=>o+1);p.addEventListener("webglcontextlost",Se),p.addEventListener("webglcontextrestored",Re);const Me=new ResizeObserver(()=>{j=!0,U()});Me.observe(A);const De=new IntersectionObserver(o=>{ee=o.some(t=>t.isIntersecting),U()});De.observe(A);const Ae=()=>{te=document.visibilityState!=="hidden",U()};return document.addEventListener("visibilitychange",Ae),be(),G&&U(),()=>{if(cancelAnimationFrame(L),K.current=null,Me.disconnect(),De.disconnect(),window.removeEventListener("pointermove",ie),window.removeEventListener("pointerdown",Ee),document.documentElement.removeEventListener("pointerleave",ae),document.removeEventListener("visibilitychange",Ae),p.removeEventListener("webglcontextlost",Se),p.removeEventListener("webglcontextrestored",Re),!e.isContextLost()){for(const o of[...R,z,...T,...V])e.deleteFramebuffer(o.framebuffer),e.deleteTexture(o.texture);e.deleteBuffer(ge),e.deleteVertexArray(pe);for(const o of Object.values(_))e.deleteProgram(o.program)}H&&(P.style.position=Q)}},[ce]);const $e=Oe??(fe?"normal":"screen");return Pe.jsx("div",{ref:ne,className:`ghost-cursor ${We}`.trim(),style:{zIndex:qe,...je},children:Pe.jsx("canvas",{ref:ue,className:"ghost-cursor__canvas",style:{mixBlendMode:$e},"aria-hidden":"true"})})};export{ft as default};
