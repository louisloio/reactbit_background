import{r as C,j as ye}from"../text-animations-CYBZrtvX.js";const Se=8,$=24,te=4,be=1.3,je=.06,Me=2.6,$e=1.6,Ae=["#120f17","#2a0f0a","#9a3412","#f97316","#fed7aa"],He={linear:0,radial:1},ne=.2,Ye=`#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,Ke=`#version 300 es
precision highp float;
precision highp int;
uniform float uAspect;
uniform float uTime;
uniform vec3 uRamp[8];
uniform int uCount;
uniform int uType;
uniform vec2 uDir;
uniform float uExtent;
uniform float uBands;
uniform float uSoftness;
uniform float uFlow;
uniform float uScale;
uniform float uSilk;
uniform vec4 uStir[24];
uniform float uStirWeight[24];
uniform vec4 uTwirl[4];
uniform vec2 uSeed;
uniform float uContrast;
uniform float uSaturation;
uniform float uSettle;
uniform float uReveal;
in vec2 vUv;
out vec4 outColor;

vec2 hash2(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.xx + q.yz) * q.zy) * 2.0 - 1.0;
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(hash2(i), f);
  float b = dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return 0.5 + 0.5 * mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

vec2 drift(vec2 p, float t) {
  vec2 w1 = vec2(
    noise(p * 0.85 + vec2(t * 0.11, t * 0.07)),
    noise(p * 0.85 + vec2(4.1, 1.7) - vec2(t * 0.08, t * 0.12))
  );
  vec2 w2 = vec2(
    noise(p * 1.55 + w1 * 1.8 + vec2(1.3, 7.1) + t * 0.05),
    noise(p * 1.55 + w1 * 1.8 + vec2(6.4, 2.2) - t * 0.06)
  );
  return (w1 - 0.5) * 1.1 + (w2 - 0.5) * 0.55;
}

vec2 warp(vec2 p) {
  vec2 q = p / uScale;
  if (uType == 1) {
    float turn = uTime * 0.35;
    q = mat2(cos(turn), sin(turn), -sin(turn), cos(turn)) * q;
  } else {
    q += vec2(-uDir.y, uDir.x) * uTime * 0.45;
  }
  return p + drift(q + uSeed, uTime) * uFlow * uScale * uSettle;
}

float coord(vec2 p) {
  vec2 w = warp(p);
  return uType == 1 ? 1.0 - length(w) * 1.1 : dot(w, uDir) / uExtent + 0.5;
}

vec3 labToRgb(vec3 lab) {
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;
  float s = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;
  l = l * l * l;
  m = m * m * m;
  s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
}

vec3 encode(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

void main() {
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  for (int i = 0; i < 24; i++) {
    float w = uStirWeight[i];
    if (w <= 0.0) continue;
    vec2 d = p - uStir[i].xy;
    p -= uStir[i].zw * w * exp(-dot(d, d) / 0.045);
  }
  for (int i = 0; i < 4; i++) {
    float angle = uTwirl[i].z;
    if (angle == 0.0) continue;
    vec2 d = p - uTwirl[i].xy;
    float a = angle * exp(-dot(d, d) / (uTwirl[i].w * uTwirl[i].w));
    float c = cos(a);
    float s = sin(a);
    p = uTwirl[i].xy + mat2(c, -s, s, c) * d;
  }
  float raw = coord(p);
  float s = raw;
  if (uBands > 1.0) {
    s *= uBands;
    float cycle = floor(s);
    s = fract(s);
    if (mod(cycle, 2.0) > 0.5) s = 1.0 - s;
  }
  s = clamp(s, 0.0, 1.0);
  float scaled = s * float(uCount - 1);
  int index = int(min(floor(scaled), float(uCount - 2)));
  float f = scaled - float(index);
  float edge = max(uSoftness * 0.5, fwidth(scaled) * 0.75);
  float shaped = smoothstep(0.5 - edge, 0.5 + edge, f);
  vec3 from = uRamp[0];
  vec3 to = uRamp[1];
  for (int i = 0; i < 7; i++) {
    if (i == index) {
      from = uRamp[i];
      to = uRamp[i + 1];
    }
  }
  vec3 lab = mix(from, to, shaped);
  if (uSilk > 0.0) {
    vec2 grad = vec2(coord(p + vec2(0.004, 0.0)) - raw, coord(p + vec2(0.0, 0.004)) - raw) / 0.004;
    vec2 slope = grad * sin(3.14159265 * clamp(raw, 0.0, 1.0) * uBands) * uSilk * 4.0;
    vec3 normal = normalize(vec3(-slope, 1.0));
    vec3 light = normalize(vec3(-uDir.y, uDir.x, 1.2));
    float diffuse = dot(normal, light) - light.z;
    lab = uRamp[0] + (lab - uRamp[0]) * (1.0 + (diffuse * 0.35 + max(diffuse, 0.0) * diffuse * 0.6) * uSilk);
  }
  lab = mix(uRamp[0], lab, smoothstep(0.0, 1.0, uReveal * 1.5 - length(vUv - 0.5) * 0.6));
  lab.x = (lab.x - 0.55) * uContrast + 0.55;
  lab.yz *= uSaturation;
  outColor = vec4(encode(labToRgb(lab)), 1.0);
}`,Je=`#version 300 es
precision highp float;
uniform sampler2D uField;
uniform float uGrain;
uniform float uGrainSize;
uniform float uFrame;
in vec2 vUv;
out vec4 outColor;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float clump(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
  vec3 color = texture(uField, vUv).rgb;
  vec2 pixel = gl_FragCoord.xy + uFrame * vec2(17.0, 59.0);
  float fine = hash(pixel) + hash(pixel + 7.13) - 1.0;
  float coarse = (clump(pixel / max(uGrainSize, 1.0)) - 0.5) * 2.0;
  float grain = mix(fine, coarse, clamp(uGrainSize - 1.0, 0.0, 1.0) * 0.8);
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color += grain * uGrain * (0.45 + 2.2 * luma * (1.0 - luma));
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`,v=(n,g,h)=>Math.min(h,Math.max(g,n)),oe=n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4,Qe=([n,g,h])=>{const l=oe(n),f=oe(g),w=oe(h),b=Math.cbrt(.4122214708*l+.5363325363*f+.0514459929*w),E=Math.cbrt(.2119034982*l+.6806995451*f+.1073969566*w),T=Math.cbrt(.0883024619*l+.2817188376*f+.6299787005*w);return[.2104542553*b+.793617785*E-.0040720468*T,1.9779984951*b-2.428592205*E+.4505937099*T,.0259040371*b+.7827717662*E-.808675766*T]},Fe=(n,g,h)=>{const l=n.createShader(g);return l?(n.shaderSource(l,h),n.compileShader(l),n.getShaderParameter(l,n.COMPILE_STATUS)?l:(n.deleteShader(l),null)):null},_e=(n,g)=>{const h=Fe(n,n.VERTEX_SHADER,Ye),l=Fe(n,n.FRAGMENT_SHADER,g),f=n.createProgram();if(!h||!l||!f)return null;if(n.attachShader(f,h),n.attachShader(f,l),n.linkProgram(f),n.deleteShader(h),n.deleteShader(l),!n.getProgramParameter(f,n.LINK_STATUS))return n.deleteProgram(f),null;const w={},b=n.getProgramParameter(f,n.ACTIVE_UNIFORMS);for(let E=0;E<b;E++){const T=n.getActiveUniform(f,E);if(!T)continue;const G=T.name.replace(/\[0\]$/,"");w[G]=n.getUniformLocation(f,G)}return{program:f,uniforms:w}},et=({colors:n=Ae,type:g="linear",angle:h=55,bands:l=1,speed:f=1,flow:w=.8,scale:b=1,softness:E=1,silk:T=.35,grainAmount:G=.08,grainSize:Le=1.2,grainAnimated:Ue=!0,contrast:De=1,saturation:Pe=1,variation:Ie=0,interactive:Ce=!0,stir:ze=1,clickSwirl:qe=!0,intro:Xe=!0,lightMode:ke=!1,dpr:Ge,className:ie="",style:Oe,...Be})=>{const re=C.useRef(null),ae=C.useRef(null),H=C.useRef(null),O=(Array.isArray(n)&&n.length?n:Ae).slice(0,Se),se={colors:O.length>1?O:[O[0],O[0]],type:He[g]??0,angle:h,bands:v(l,1,8),speed:Math.max(0,f),flow:v(w,0,3),scale:v(b,.25,3),softness:v(E,0,1),silk:v(T,0,1),grainAmount:v(G,0,.5),grainSize:v(Le,.5,4),grainAnimated:Ue,contrast:v(De,.2,2),saturation:v(Pe,0,2),variation:Math.max(0,Ie),interactive:Ce,stir:v(ze,0,2),clickSwirl:qe,intro:Xe,lightMode:ke,dpr:Ge},R=C.useRef(se);return R.current=se,C.useEffect(()=>{const F=re.current,y=ae.current,e=y?.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1});if(!F||!y||!e)return;const B=_e(e,Ke),N=_e(e,Je);if(!B||!N)return;const s=B.uniforms,W=N.uniforms,ce=e.createVertexArray(),z=e.createTexture();e.bindTexture(e.TEXTURE_2D,z),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const Y=e.createFramebuffer(),_={width:0,height:0},L=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),ue=new Map,Ne=t=>{const o=String(t),i=ue.get(o);if(i)return i;let c=[0,0,0];if(L){L.clearRect(0,0,1,1),L.fillStyle="#000000",L.fillStyle=o,L.fillRect(0,0,1,1);const[M,A,x]=L.getImageData(0,0,1,1).data;c=[M/255,A/255,x/255]}return ue.set(o,c),c},U=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,m={width:1,height:1,ratio:1},K=new Float32Array(Se*3),le=new Float32Array($*4),J=new Float32Array($),Q=new Float32Array(te*4),d=[],p=[],r={x:.5,y:.5,sx:.5,sy:.5,vx:0,inside:!1,fresh:!0};let fe="",me=0,S=R.current.intro&&!U?0:1,Z=0,ee=0,q=0,D=0,V=!0;const We=()=>{const t=R.current,o=`${t.colors.join(",")}|${t.lightMode}`;if(o===fe)return;fe=o;const i=t.colors.map(c=>Qe(Ne(c)));if(!t.lightMode)i.forEach((c,M)=>K.set(c,M*3));else{const c=i.map(([A])=>Math.abs(A-i[0][0])<.1),M=i.filter((A,x)=>!c[x]).reverse();i.forEach((A,x)=>{const[X,I,a]=c[x]?[1,0,0]:M.shift();K.set([X+(1-X)*ne,I*(1-ne),a*(1-ne)],x*3)})}},de=()=>{const t=R.current,o=m.width/m.height;We(),e.bindVertexArray(ce),e.disable(e.BLEND),e.bindFramebuffer(e.FRAMEBUFFER,Y),e.viewport(0,0,_.width,_.height),e.useProgram(B.program),e.uniform1f(s.uAspect,o),e.uniform1f(s.uTime,me),e.uniform3fv(s.uRamp,K),e.uniform1i(s.uCount,t.colors.length);const i=t.angle*Math.PI/180;e.uniform1i(s.uType,t.type),e.uniform2f(s.uDir,Math.sin(i),Math.cos(i)),e.uniform1f(s.uExtent,o*Math.abs(Math.sin(i))+Math.abs(Math.cos(i))),e.uniform1f(s.uBands,t.bands),e.uniform1f(s.uSoftness,t.softness),e.uniform1f(s.uFlow,t.flow),e.uniform1f(s.uScale,t.scale),e.uniform1f(s.uSilk,t.silk),e.uniform4fv(s.uStir,le),e.uniform1fv(s.uStirWeight,J),e.uniform4fv(s.uTwirl,Q),e.uniform2f(s.uSeed,t.variation*3.17,t.variation*1.91),e.uniform1f(s.uContrast,t.contrast),e.uniform1f(s.uSaturation,t.saturation),e.uniform1f(s.uSettle,S*S*(3-2*S)),e.uniform1f(s.uReveal,S),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,y.width,y.height),e.useProgram(N.program),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,z),e.uniform1i(W.uField,0),e.uniform1f(W.uGrain,t.grainAmount),e.uniform1f(W.uGrainSize,t.grainSize*m.ratio),e.uniform1f(W.uFrame,Z),e.drawArrays(e.TRIANGLES,0,3)},he=()=>{const t=R.current;m.width=Math.max(1,F.clientWidth),m.height=Math.max(1,F.clientHeight),m.ratio=Math.min(t.dpr||window.devicePixelRatio||1,2),y.width=Math.max(1,Math.round(m.width*m.ratio)),y.height=Math.max(1,Math.round(m.height*m.ratio));const o=Math.max(1,Math.round(y.width/2)),i=Math.max(1,Math.round(y.height/2));(o!==_.width||i!==_.height)&&(_.width=o,_.height=i,e.bindTexture(e.TEXTURE_2D,z),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,o,i,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,Y),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,z,0),e.bindFramebuffer(e.FRAMEBUFFER,null)),de(),P()},Ve=(t,o)=>{const i=R.current,c=1-Math.exp(-t/.06),M=r.sx,A=r.sy;r.sx+=(r.x-r.sx)*c,r.sy+=(r.y-r.sy)*c;const x=(r.sx-M)/t*o,X=(r.sy-A)/t;r.vx=x;const I=d[0];if(d.forEach(a=>{a.done&&(a.age+=t)}),i.interactive&&r.inside&&Math.hypot(x,X)>.02&&!U){(!I||I.done)&&(d.unshift({x:0,y:0,vx:0,vy:0,age:0,grow:0,done:!1}),d.length>$&&d.pop());const a=d[0];a.x=(r.sx-.5)*o,a.y=r.sy-.5,a.vx=x,a.vy=X,a.grow=Math.min(1,a.grow+t/je),a.done=a.grow>=1}else I&&(I.done=!0);for(;d.length&&d[d.length-1].age>be;)d.pop();for(let a=0;a<$;a++){const u=d[a];if(!u){J[a]=0;continue}const k=1-u.age/be,j=Math.min(1,2.2/Math.max(Math.hypot(u.vx,u.vy),.001));le.set([u.x,u.y,u.vx*j,u.vy*j],a*4),J[a]=k*k*u.grow*i.stir*.05}for(p.forEach(a=>{a.age+=t});p.length&&p[p.length-1].age>Me;)p.pop();for(let a=0;a<te;a++){const u=p[a];if(!u){Q[a*4+2]=0;continue}const k=u.age/Me,j=Math.min(1,u.age/.18)*(1-k)*(1-k);Q.set([u.x,u.y,u.direction*2.4*j,.16+.1*Math.min(1,u.age/.5)],a*4)}},ve=t=>{if(q=0,!V||document.hidden)return;const o=R.current,i=D?v((t-D)/1e3,.001,.05):1/60;D=t,U||(me+=i*o.speed*.16),S<1&&(S=Math.min(1,S+i/$e)),ee+=i,o.grainAnimated&&!U&&ee>1/24&&(ee=0,Z=(Z+1)%97),Ve(i,m.width/m.height),de(),!U&&(o.speed>0||o.grainAnimated)||S<1||d.length>0||p.length>0?q=requestAnimationFrame(ve):D=0};function P(){!q&&V&&!document.hidden&&(q=requestAnimationFrame(ve))}const pe=t=>{const o=F.getBoundingClientRect(),i=(t.clientX-o.left)/Math.max(1,o.width),c=1-(t.clientY-o.top)/Math.max(1,o.height);r.inside=i>=0&&i<=1&&c>=0&&c<=1,r.x=i,r.y=c,(r.fresh||!r.inside)&&(r.sx=i,r.sy=c,r.fresh=!1)},xe=t=>{pe(t),(r.inside||d.length)&&P()},ge=t=>{pe(t);const o=R.current;!r.inside||!o.clickSwirl||U||(p.unshift({x:(r.x-.5)*(m.width/m.height),y:r.y-.5,age:0,direction:r.vx<0?1:-1}),p.length>te&&p.pop(),P())},Ee=()=>{r.inside=!1},we=()=>{D=0,P()},Te=new ResizeObserver(he);Te.observe(F);const Re=new IntersectionObserver(t=>{V=t.some(o=>o.isIntersecting),V&&(D=0,P())});return Re.observe(F),window.addEventListener("pointermove",xe,{passive:!0}),window.addEventListener("pointerdown",ge,{passive:!0}),document.documentElement.addEventListener("pointerleave",Ee),document.addEventListener("visibilitychange",we),he(),H.current=P,()=>{cancelAnimationFrame(q),H.current=null,Te.disconnect(),Re.disconnect(),window.removeEventListener("pointermove",xe),window.removeEventListener("pointerdown",ge),document.documentElement.removeEventListener("pointerleave",Ee),document.removeEventListener("visibilitychange",we),e.deleteTexture(z),e.deleteFramebuffer(Y),e.deleteVertexArray(ce),e.deleteProgram(B.program),e.deleteProgram(N.program),e.getExtension("WEBGL_lose_context")?.loseContext()}},[]),C.useEffect(()=>{H.current?.()}),ye.jsx("div",{ref:re,className:`grainient-container${ie?` ${ie}`:""}`,style:Oe,...Be,children:ye.jsx("canvas",{ref:ae,className:"grainient-canvas","aria-hidden":"true"})})};export{et as default};
