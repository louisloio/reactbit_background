import{r as z,j as ie}from"../text-animations-BFa__3NK.js";const _e=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Fe=`#version 300 es
precision highp float;
uniform vec2 uView;
uniform vec2 uScale;
uniform vec2 uTurn;
uniform float uTime;
uniform float uWidth;
uniform float uWave;
uniform float uDepth;
uniform float uRough;
uniform float uSeed;
uniform float uTwist;
uniform vec3 uLight;
uniform float uFill;
uniform float uCamera;
uniform vec4 uPointer;
out vec4 outColor;

const float PI = 3.141592653589793;

vec4 permute(vec4 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float cnoise(vec3 P) {
  vec3 Pi0 = floor(P);
  vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;
  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

float laneHash(float lane) {
  return fract(sin(lane * 91.3458 + uSeed * 17.17) * 47453.5453);
}

float lobe(float nh, float nl, float nv, float vh, float roughness) {
  float a = roughness * roughness;
  float a2 = a * a;
  float d = nh * nh * (a2 - 1.0) + 1.0;
  float distribution = a2 / (PI * d * d);
  float gv = nl * sqrt(nv * nv * (1.0 - a2) + a2);
  float gl = nv * sqrt(nl * nl * (1.0 - a2) + a2);
  float visibility = 0.5 / max(gv + gl, 0.0001);
  float fresnel = 0.028 + 0.972 * pow(1.0 - vh, 5.0);
  return distribution * visibility * fresnel * nl;
}

vec2 glint(float lane, vec2 local) {
  float along = local.y / uWave - laneHash(lane) * 60.0;
  float step = 0.01;
  float slope = (cnoise(vec3(0.0, along + step, uTime)) - cnoise(vec3(0.0, along - step, uTime))) / (2.0 * step);
  slope *= 0.2 * uDepth;
  float spin = laneHash(lane + 0.37);
  float tilt = ((spin - 0.5) * 0.5 + sin(uTime * 2.1 + spin * 6.2831) * 0.06) * uTwist;
  vec3 normal = normalize(vec3(tilt, -slope, 1.0));
  vec3 view = normalize(vec3(-local, uCamera));
  float nv = max(dot(normal, view), 0.0001);
  vec3 light = normalize(uLight);
  vec3 halfway = normalize(light + view);
  float core = lobe(max(dot(normal, halfway), 0.0), max(dot(normal, light), 0.0), nv, max(dot(view, halfway), 0.0), uRough);
  vec3 fill = normalize(vec3(0.0, -uLight.y * 1.25, uLight.z));
  vec3 fillHalf = normalize(fill + view);
  core += uFill * lobe(max(dot(normal, fillHalf), 0.0), max(dot(normal, fill), 0.0), nv, max(dot(view, fillHalf), 0.0), uRough);
  return vec2(core, core);
}

void main() {
  vec2 css = gl_FragCoord.xy * uScale;
  vec2 centered = css - uView * 0.5;
  vec2 local = mat2(uTurn.x, -uTurn.y, uTurn.y, uTurn.x) * centered;

  float across = local.x / uWidth + 0.5;
  float lane = floor(across);
  float u = across - lane;
  vec2 value = glint(lane, local);

  float pixel = max(uScale.x, uScale.y);
  float seam = min(u, 1.0 - u) * uWidth;
  if (seam < pixel * 1.5) {
    float other = u < 0.5 ? lane - 1.0 : lane + 1.0;
    float blend = 0.5 * (1.0 - smoothstep(0.0, pixel * 1.5, seam));
    value = mix(value, glint(other, local), blend);
  }

  vec2 toPointer = css - uPointer.xy;
  float near = exp(-dot(toPointer, toPointer) / (2.0 * uPointer.w * uPointer.w)) * uPointer.z;
  value *= 1.0 + near * 0.8;
  float hot = max(value.y - 0.18, 0.0);
  outColor = vec4(value.x, value.y, min(hot, 6.0), 1.0);
}`,Ae=`#version 300 es
precision highp float;
uniform sampler2D uField;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform vec3 uInk;
uniform float uGain;
uniform float uGlow;
uniform float uPresence;
uniform float uGrain;
uniform float uFade;
uniform float uOpacity;
uniform float uLightMode;
out vec4 outColor;

float random(vec2 st) {
  return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
}

float grainNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

vec3 acesFilmic(vec3 color) {
  const mat3 inputMatrix = mat3(
    vec3(0.59719, 0.07600, 0.02840),
    vec3(0.35458, 0.90834, 0.13383),
    vec3(0.04823, 0.01566, 0.83777)
  );
  const mat3 outputMatrix = mat3(
    vec3(1.60475, -0.10208, -0.00327),
    vec3(-0.53108, 1.10813, -0.07276),
    vec3(-0.07367, -0.00605, 1.07602)
  );
  color = inputMatrix * (color / 0.6);
  vec3 a = color * (color + 0.0245786) - 0.000090537;
  vec3 b = color * (0.983729 * color + 0.4329510) + 0.238081;
  color = outputMatrix * (a / b);
  return clamp(color, 0.0, 1.0);
}

vec3 toSrgb(vec3 color) {
  return mix(color * 12.92, 1.055 * pow(color, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), color));
}

float feather(float x, float edge) {
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float radiance = textureLod(uField, uv, 0.0).r;
  float bloom = 0.0;
  bloom += textureLod(uField, uv, 2.0).b * 0.3;
  bloom += textureLod(uField, uv, 3.0).b * 0.3;
  bloom += textureLod(uField, uv, 4.0).b * 0.22;
  bloom += textureLod(uField, uv, 5.0).b * 0.18;

  float hot = textureLod(uField, uv, 0.0).g;
  vec3 light = uColor * (radiance + bloom * uGlow) * uGain;
  light += mix(uColor, vec3(1.0), 0.7) * hot * hot * 0.12 * uGain;
  light *= uPresence;
  vec3 color = toSrgb(acesFilmic(light));
  color -= grainNoise(gl_FragCoord.xy) / 15.0 * uGrain;
  color = max(color, 0.0);

  float edge = uFade * 0.5;
  float mask = feather(uv.x, edge) * feather(1.0 - uv.x, edge) * feather(uv.y, edge) * feather(1.0 - uv.y, edge);
  mask *= uOpacity;
  float dither = (random(gl_FragCoord.yx + 31.7) - 0.5) / 255.0;

  float peak = max(color.r, max(color.g, color.b));
  if (uLightMode > 0.5) {
    float alpha = clamp(peak * 0.9 + dither, 0.0, 1.0) * mask;
    outColor = vec4(uInk * alpha, alpha);
  } else {
    color = clamp(color + dither, 0.0, 1.0) * mask;
    outColor = vec4(color, max(color.r, max(color.g, color.b)));
  }
}`,Le=1.6,ce=16e5,b=(r,p,v)=>Math.min(v,Math.max(p,r)),le=(r,p,v)=>{const m=r.createShader(p);return m?(r.shaderSource(m,v),r.compileShader(m),r.getShaderParameter(m,r.COMPILE_STATUS)?m:(r.deleteShader(m),null)):null},fe=(r,p)=>{const v=le(r,r.VERTEX_SHADER,_e),m=le(r,r.FRAGMENT_SHADER,p),s=r.createProgram();if(!v||!m||!s)return null;if(r.attachShader(s,v),r.attachShader(s,m),r.bindAttribLocation(s,0,"aPosition"),r.linkProgram(s),r.deleteShader(v),r.deleteShader(m),!r.getProgramParameter(s,r.LINK_STATUS))return r.deleteProgram(s),null;const A={},D=r.getProgramParameter(s,r.ACTIVE_UNIFORMS);for(let _=0;_<D;_++){const F=r.getActiveUniform(s,_);F&&(A[F.name]=r.getUniformLocation(s,F.name))}return{program:s,uniforms:A}},Ie=({color:r="#ffffff",beamWidth:p=140,rotation:v=30,speed:m=1,waveLength:s=233,depth:A=1,sharpness:D=.6,twist:_=0,fillLight:F=.3,glow:ue=.6,brightness:se=1.6,variation:me=0,grain:de=.35,quality:ve=.75,mouseInteraction:ge=!0,mouseStrength:he=1,intro:xe=!0,fade:ye=0,opacity:pe=1,lightMode:Pe=!1,backgroundColor:B,paused:Ee=!1,dpr:be,className:H="",style:V,...Te})=>{const Y=z.useRef(null),j=z.useRef(null),U=z.useRef(null),Q={color:String(r),beamWidth:Math.max(8,p),rotation:v,speed:m,waveLength:Math.max(20,s),depth:Math.max(0,A),sharpness:b(D,0,1),twist:b(_,0,2),fillLight:b(F,0,1.5),glow:Math.max(0,ue),brightness:Math.max(0,se),variation:Number(me)||0,grain:Math.max(0,de),quality:b(ve,.25,1),mouseInteraction:ge,mouseStrength:Math.max(0,he),intro:xe,fade:b(ye,0,1),opacity:b(pe,0,1),lightMode:Pe,paused:Ee,dpr:be},h=z.useRef(Q);return h.current=Q,z.useEffect(()=>{const T=Y.current,x=j.current,e=x?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!T||!x||!e)return;const we=!!e.getExtension("EXT_color_buffer_float"),L=fe(e,Fe),S=fe(e,Ae);if(!L||!S)return;const $=e.createBuffer(),X=e.createVertexArray();e.bindVertexArray(X),e.bindBuffer(e.ARRAY_BUFFER,$),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);let g=null;const G=e.createFramebuffer(),y={width:0,height:0},Me=(t,a)=>{if(y.width===t&&y.height===a)return;y.width=t,y.height=a,g&&e.deleteTexture(g),g=e.createTexture(),e.bindTexture(e.TEXTURE_2D,g);const n=Math.floor(Math.log2(Math.max(t,a)))+1;e.texStorage2D(e.TEXTURE_2D,n,we?e.RGBA16F:e.RGBA8,t,a),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindFramebuffer(e.FRAMEBUFFER,G),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,g,0)},w=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),I=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,K=new Map,Re=t=>{const a=K.get(t);if(a)return a;let n=[1,1,1];if(w){w.clearRect(0,0,1,1),w.fillStyle="#ffffff",w.fillStyle=t,w.fillRect(0,0,1,1);const[d,u,i]=w.getImageData(0,0,1,1).data;n=[d,u,i].map(l=>Math.pow(l/255,2.2))}return K.set(t,n),n},c={width:1,height:1,fieldWidth:1,fieldHeight:1},f={x:0,y:0,inside:!1},o={clock:0,intro:h.current.intro&&!I?0:1,reach:0,x:0,y:0,lightY:0};let P=0,M=0,C=!0;const k=()=>{const t=h.current,a=o.intro*o.intro*o.intro*(o.intro*(o.intro*6-15)+10);e.bindVertexArray(X),Me(c.fieldWidth,c.fieldHeight);const n=t.rotation*Math.PI/180,d=(1-a)*-9,u=o.reach*t.mouseStrength,i=L.uniforms;e.bindFramebuffer(e.FRAMEBUFFER,G),e.viewport(0,0,y.width,y.height),e.useProgram(L.program),e.uniform2f(i.uView,c.width,c.height),e.uniform2f(i.uScale,c.width/y.width,c.height/y.height),e.uniform2f(i.uTurn,Math.cos(n),Math.sin(n)),e.uniform1f(i.uTime,o.clock*.12%289),e.uniform1f(i.uWidth,t.beamWidth),e.uniform1f(i.uWave,t.waveLength),e.uniform1f(i.uDepth,t.depth),e.uniform1f(i.uRough,.55-t.sharpness*.5),e.uniform1f(i.uSeed,t.variation),e.uniform1f(i.uTwist,t.twist),e.uniform1f(i.uFill,t.fillLight),e.uniform3f(i.uLight,0,3+d+o.lightY*u,10),e.uniform1f(i.uCamera,c.height*1.866),e.uniform4f(i.uPointer,o.x,c.height-o.y,u,Math.max(c.height,c.width)*.28),e.drawArrays(e.TRIANGLES,0,3),e.bindTexture(e.TEXTURE_2D,g),e.generateMipmap(e.TEXTURE_2D);const l=S.uniforms,E=Re(t.color),W=.2126*E[0]+.7152*E[1]+.0722*E[2],N=Math.min(1,.18/Math.max(W,.001)),q=E.map(ze=>Math.pow(Math.min(1,ze*N),1/2.2));e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,x.width,x.height),e.useProgram(S.program),e.uniform2f(l.uResolution,x.width,x.height),e.uniform3fv(l.uColor,E),e.uniform3fv(l.uInk,q),e.uniform1f(l.uGain,t.brightness),e.uniform1f(l.uGlow,t.glow),e.uniform1f(l.uPresence,a),e.uniform1f(l.uGrain,t.grain*1.75),e.uniform1f(l.uFade,t.fade),e.uniform1f(l.uOpacity,t.opacity),e.uniform1f(l.uLightMode,t.lightMode?1:0),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,g),e.uniform1i(l.uField,0),e.drawArrays(e.TRIANGLES,0,3)},J=t=>{if(P=0,!C||document.hidden)return;const a=h.current,n=M?Math.min(.05,(t-M)/1e3):1/60;M=t;const d=!a.paused&&!I;d&&(o.clock+=n*a.speed),!a.intro||I?o.intro=1:o.intro<1&&(o.intro=Math.min(1,o.intro+n/Le));const u=a.mouseInteraction&&f.inside&&!I;u&&o.reach<.01&&(o.x=f.x,o.y=f.y);const i=1-Math.exp(-n*7);o.x+=(f.x-o.x)*i,o.y+=(f.y-o.y)*i,o.reach+=((u?1:0)-o.reach)*(1-Math.exp(-n*(u?3.2:1.8)));const l=a.rotation*Math.PI/180,E=o.x-c.width/2,W=c.height/2-o.y,N=-Math.sin(l)*E+Math.cos(l)*W;o.lightY=b(N/(c.height*.5)*3,-4,4),k();const q=o.intro<1||Math.abs((u?1:0)-o.reach)>.002||Math.abs(f.x-o.x)+Math.abs(f.y-o.y)>.3;d||q?P=requestAnimationFrame(J):M=0},R=()=>{!P&&C&&!document.hidden&&(P=requestAnimationFrame(J))},O=()=>{const t=h.current,a=Math.max(1,T.clientWidth),n=Math.max(1,T.clientHeight),d=Math.min(t.dpr||window.devicePixelRatio||1,2);c.width=a,c.height=n,x.width=Math.max(1,Math.round(a*d)),x.height=Math.max(1,Math.round(n*d));let u=t.quality*d;a*n*u*u>ce&&(u=Math.sqrt(ce/(a*n))),c.fieldWidth=Math.max(1,Math.round(a*u)),c.fieldHeight=Math.max(1,Math.round(n*u)),P||k(),R()},Z=t=>{const a=T.getBoundingClientRect();f.x=t.clientX-a.left,f.y=t.clientY-a.top,f.inside=f.x>=0&&f.y>=0&&f.x<=a.width&&f.y<=a.height,R()},ee=()=>{f.inside=!1,R()},te=()=>{M=0,R()},oe=new ResizeObserver(O);oe.observe(T);const re=new IntersectionObserver(t=>{C=t.some(a=>a.isIntersecting),C&&(M=0,R())});re.observe(T),window.addEventListener("pointermove",Z,{passive:!0}),document.documentElement.addEventListener("pointerleave",ee),document.addEventListener("visibilitychange",te),O();let ae=h.current.quality,ne=h.current.dpr;return U.current=()=>{const t=h.current;if(t.quality!==ae||t.dpr!==ne){ae=t.quality,ne=t.dpr,O();return}P||k(),R()},()=>{cancelAnimationFrame(P),U.current=null,oe.disconnect(),re.disconnect(),window.removeEventListener("pointermove",Z),document.documentElement.removeEventListener("pointerleave",ee),document.removeEventListener("visibilitychange",te),g&&e.deleteTexture(g),e.deleteFramebuffer(G),e.deleteProgram(L.program),e.deleteProgram(S.program),e.deleteBuffer($),e.deleteVertexArray(X),e.getExtension("WEBGL_lose_context")?.loseContext()}},[]),z.useEffect(()=>{U.current?.()}),ie.jsx("div",{ref:Y,className:`beams-container${H?` ${H}`:""}`,style:B?{background:B,...V}:V,...Te,children:ie.jsx("canvas",{ref:j,className:"beams-canvas","aria-hidden":"true"})})};export{Ie as Beams,Ie as default};
