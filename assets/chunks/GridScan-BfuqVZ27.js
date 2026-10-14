import{r as C,j as ee}from"../text-animations-Covp24vw.js";const ce=4,Xe=2.4,st=2.2,le=1.25,ut="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js",ft="https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights",dt={solid:0,dashed:1,dotted:2},ht=`#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,vt=`#version 300 es
precision highp float;
precision highp int;
uniform float uAspect;
uniform float uPixel;
uniform vec3 uEye;
uniform float uDepth;
uniform vec3 uCell;
uniform float uThick;
uniform float uDot;
uniform int uStyle;
uniform vec3 uLineColor;
uniform vec3 uScanColor;
uniform vec3 uCoreColor;
uniform float uFade;
uniform float uScanZ;
uniform float uScanDir;
uniform float uScanAlpha;
uniform float uScanWidth;
uniform float uTrail;
uniform float uReveal;
uniform float uPoints;
uniform float uReflect;
uniform float uHaze;
uniform float uShade;
uniform float uLight;
uniform vec4 uPing[4];
uniform float uPingAlpha[4];
uniform vec4 uHover;
uniform float uTime;
in vec2 vUv;
layout(location = 0) out vec4 outColor;
layout(location = 1) out vec4 outGlow;

struct Light {
  float grid;
  float fade;
  float core;
  float trail;
  float spill;
  float ping;
  float wake;
  float reveal;
};

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

vec2 hash2(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.xx + q.yz) * q.zy);
}

float lines(float across, float along, float period, float dash, float fa, float fb) {
  float u = across / period;
  float du = fa / period;
  float d = abs(fract(u + 0.5) - 0.5) / max(du, 1e-5);
  float dense = smoothstep(0.1, 0.4, du);
  if (uStyle == 2) {
    float c = along / dash * 5.0;
    float dc = fb / dash * 5.0;
    float e = abs(fract(c + 0.5) - 0.5) / max(dc, 1e-5);
    float cov = clamp(uThick + 1.0 - length(vec2(d, e)), 0.0, 1.0);
    float mean = min(1.0, 3.1416 * (uThick + 0.5) * (uThick + 0.5) * du * dc);
    return mix(cov, mean, max(dense, smoothstep(0.1, 0.4, dc)));
  }
  float cov = clamp(uThick + 0.5 - d, 0.0, 1.0);
  float mean = min(1.0, 2.0 * uThick * du);
  if (uStyle == 1) {
    float c = along / dash * 4.0;
    float dc = fb / dash * 4.0;
    float e = abs(fract(c + 0.5) - 0.5);
    float m = clamp((0.25 - e) / max(dc, 1e-5) + 0.5, 0.0, 1.0);
    cov *= mix(m, 0.5, smoothstep(0.1, 0.4, dc));
    mean *= 0.5;
  }
  return mix(cov, mean, dense);
}

float depthFade(float z) {
  float n = clamp(z / uDepth, 0.0, 1.0);
  return mix(1.0, (exp(-3.0 * n) - 0.0497871) / 0.9502129, uFade);
}

vec3 project(vec3 eye, vec3 o, int face, float plane) {
  vec3 d = o - eye;
  float t = face == 0 ? (plane - o.x) / d.x : (face == 1 ? (plane - o.y) / d.y : (plane - o.z) / d.z);
  return o + d * t;
}

void trace(vec3 o, vec3 d, out int face, out float plane, out vec3 h) {
  float sx = d.x > 0.0 ? 0.5 * uAspect : -0.5 * uAspect;
  float sy = d.y > 0.0 ? 0.5 : -0.5;
  float tx = abs(d.x) > 1e-6 ? (sx - o.x) / d.x : 1e9;
  float ty = abs(d.y) > 1e-6 ? (sy - o.y) / d.y : 1e9;
  float t = (uDepth - o.z) / d.z;
  face = 2;
  plane = uDepth;
  if (tx < t) {
    face = 0;
    plane = sx;
    t = tx;
  }
  if (ty < t) {
    face = 1;
    plane = sy;
    t = ty;
  }
  h = o + d * t;
}

vec2 faceUv(vec3 h, int face) {
  if (face == 0) return vec2(h.z, h.y + 0.5);
  if (face == 1) return vec2(h.x + 0.5 * uAspect, h.z);
  return vec2(h.x + 0.5 * uAspect, h.y + 0.5);
}

Light illuminate(vec3 h, int face, vec2 uv, vec2 foot, float blur) {
  Light l;
  vec2 cell = face == 0 ? uCell.zy : (face == 1 ? uCell.xz : uCell.xy);
  vec2 f = foot * blur;
  float minor = max(lines(uv.x, uv.y, cell.x, cell.y, f.x, f.y), lines(uv.y, uv.x, cell.y, cell.x, f.y, f.x));
  float major = max(
    lines(uv.x, uv.y, cell.x * 4.0, cell.y, f.x, f.y),
    lines(uv.y, uv.x, cell.y * 4.0, cell.x, f.y, f.x)
  );
  l.grid = max(minor * 0.75, major) / blur;
  float z = h.z;
  l.fade = depthFade(z);
  l.reveal = smoothstep(uReveal, uReveal - 0.2, z);
  float zFoot = face == 0 ? f.x : (face == 1 ? f.y : 0.0);
  float width = max(uScanWidth, zFoot * 1.1);
  float dz = z - uScanZ;
  l.core = exp(-dz * dz / (width * width)) * (face == 2 ? 0.45 : 1.0) * uScanAlpha;
  float behind = -dz * uScanDir;
  l.trail = exp(-max(behind, 0.0) / uTrail) * smoothstep(-width, width * 0.5, behind) * uScanAlpha;
  l.spill = exp(-dz * dz / 0.05) * uScanAlpha;
  l.ping = 0.0;
  l.wake = 0.0;
  for (int i = 0; i < 4; i++) {
    float alpha = uPingAlpha[i];
    if (alpha <= 0.0) continue;
    float dist = length(h - uPing[i].xyz) - uPing[i].w;
    l.ping += exp(-dist * dist / 0.0012) * alpha;
    l.wake += exp(min(dist, 0.0) / 0.22) * smoothstep(0.03, -0.03, dist) * alpha;
  }
  return l;
}

void over(inout vec4 acc, vec3 color, float alpha) {
  alpha = clamp(alpha, 0.0, 1.0);
  acc = vec4(color * alpha, alpha) + acc * (1.0 - alpha);
}

void paint(inout vec4 color, inout float energy, Light l, float gain, float lift, float hover) {
  float base = l.grid * l.fade * l.reveal * lift;
  float far = l.fade * l.reveal * gain;
  float lit = l.grid * (l.core * 1.2 + l.trail * 0.75 + l.ping * 1.4 + l.wake * 0.5 + hover * 0.5) * far;
  float sheen = (l.core * 0.14 + l.spill * 0.05 + l.trail * 0.03 + l.ping * 0.2 + l.wake * 0.04) * far;
  float laser = (l.core + l.ping * 0.35) * far;
  over(color, uLineColor, base);
  over(color, uScanColor, sheen);
  over(color, uScanColor, lit);
  over(color, uCoreColor, laser * 0.9);
  energy += laser * 0.9 + lit * 0.5;
}

void main() {
  vec3 p = vec3((vUv.x - 0.5) * uAspect, vUv.y - 0.5, 0.0);
  vec3 d = p - uEye;
  int face;
  float plane;
  vec3 h;
  trace(p, d, face, plane, h);
  vec3 hx = project(uEye, p + vec3(uPixel, 0.0, 0.0), face, plane);
  vec3 hy = project(uEye, p + vec3(0.0, uPixel, 0.0), face, plane);
  vec2 uv = faceUv(h, face);
  vec2 ux = faceUv(hx, face) - uv;
  vec2 uy = faceUv(hy, face) - uv;
  vec2 foot = vec2(length(vec2(ux.x, uy.x)), length(vec2(ux.y, uy.y)));
  Light l = illuminate(h, face, uv, foot, 1.0);

  vec4 color = vec4(0.0);
  float energy = 0.0;

  if (uShade > 0.0) {
    vec2 gaps = face == 0
      ? vec2(0.5 - abs(h.y), uDepth - h.z)
      : (face == 1 ? vec2(0.5 * uAspect - abs(h.x), uDepth - h.z) : vec2(0.5 * uAspect - abs(h.x), 0.5 - abs(h.y)));
    vec2 crease = 1.0 - exp(-max(gaps, 0.0) / 0.16);
    float occlusion = crease.x * crease.y;
    float lamp = 1.0 / (1.0 + h.z * h.z * 0.9);
    float tilt = face == 1 ? (plane < 0.0 ? 1.1 : 0.85) : (face == 2 ? 0.8 : 1.0);
    float glowSpill = (l.spill * 0.5 + l.trail * 0.12) * l.reveal * l.fade;
    if (uLight > 0.5) {
      float shadow = (1.0 - lamp * tilt) * 0.09 + (1.0 - occlusion) * 0.2;
      over(color, vec3(0.0), shadow * uShade * l.reveal * l.fade);
    } else {
      over(color, vec3(1.0), lamp * tilt * occlusion * 0.11 * uShade * l.reveal * l.fade);
    }
    over(color, uScanColor, glowSpill * uShade * occlusion * 0.35);
  }

  if (face == 1 && plane < 0.0 && uReflect > 0.0) {
    vec3 mirror = vec3(uEye.x, -1.0 - uEye.y, uEye.z);
    vec3 r = h - mirror;
    int face2;
    float plane2;
    vec3 h2;
    trace(h, r, face2, plane2, h2);
    vec2 uv2 = faceUv(h2, face2);
    vec2 ux2 = faceUv(project(mirror, hx, face2, plane2), face2) - uv2;
    vec2 uy2 = faceUv(project(mirror, hy, face2, plane2), face2) - uv2;
    vec2 foot2 = vec2(length(vec2(ux2.x, uy2.x)), length(vec2(ux2.y, uy2.y)));
    float travel = length(h2 - h);
    Light m = illuminate(h2, face2, uv2, foot2, 1.0 + travel * 4.0);
    m.reveal *= l.reveal;
    float grazing = 1.0 - normalize(r).y;
    float gain = (0.3 + 0.7 * grazing * grazing * grazing * grazing) * uReflect * exp(-travel * 1.1) * (uLight > 0.5 ? 0.6 : 1.0);
    float reflected = 0.0;
    paint(color, reflected, m, gain, 0.0, 0.0);
    energy += reflected * 0.6;
  }

  vec3 near = h - uHover.xyz;
  float hover = exp(-dot(near, near) / 0.08) * uHover.w;
  paint(color, energy, l, 1.0, 1.0, hover);

  if (uPoints > 0.5) {
    vec2 cell = face == 0 ? uCell.zy : (face == 1 ? uCell.xz : uCell.xy);
    vec2 spacing = cell / 2.5;
    vec2 q = uv / spacing;
    vec2 id = floor(q);
    vec2 seed = id + vec2(float(face) * 13.7 + plane * 5.3, float(face) * 3.1);
    vec2 delta = (q - id - (0.2 + 0.6 * hash2(seed))) * spacing;
    float det = ux.x * uy.y - ux.y * uy.x;
    vec2 s = vec2(delta.x * uy.y - delta.y * uy.x, ux.x * delta.y - ux.y * delta.x) / det;
    float radius = uDot * mix(1.0, 0.55, clamp(h.z / uDepth, 0.0, 1.0));
    float spot = clamp(radius + 0.5 - length(s), 0.0, 1.0);
    float gap = min(spacing.x / foot.x, spacing.y / foot.y);
    float r = hash(seed + 7.7);
    float flicker = 0.75 + 0.25 * sin(uTime * (3.0 + r * 5.0) + r * 40.0);
    float dots = spot * smoothstep(5.0, 10.0, gap) * smoothstep(0.25, 0.6, r) * (0.3 + 0.7 * r * r) * flicker;
    float hot = l.core * 2.5 + l.ping * 1.6;
    float warm = l.trail * l.trail * 1.3 + l.wake * 0.6 + hover * 1.3;
    float spark = dots * (hot + warm) * l.fade * l.reveal;
    over(color, mix(uScanColor, uCoreColor, clamp(hot / max(hot + warm, 1e-4), 0.0, 1.0)), spark);
    energy += spark * 0.9;
  }

  if (uHaze > 0.0 && uScanAlpha > 0.0 && uScanZ > 0.0 && h.z > uScanZ) {
    vec3 c = p + d * (uScanZ / d.z);
    float grain = hash(floor(c.xy * 180.0) + floor(uTime * 24.0) * 7.0);
    float edge = min(0.5 * uAspect - abs(c.x), 0.5 - abs(c.y));
    float rim = exp(-edge / 0.06);
    float veil = uHaze * uScanAlpha * (0.45 + 0.9 * grain) * (0.55 + rim * 1.6);
    over(color, uScanColor, veil * depthFade(uScanZ) * l.reveal);
  }

  energy = clamp(energy, 0.0, 1.0);
  outColor = color;
  outGlow = vec4(uScanColor * energy, energy);
}`,mt=`#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec2 uTexel;
in vec2 vUv;
out vec4 outColor;
void main() {
  vec2 o = uTexel;
  outColor = 0.25 * (
    texture(uSource, vUv + vec2(-o.x, -o.y)) +
    texture(uSource, vUv + vec2(o.x, -o.y)) +
    texture(uSource, vUv + vec2(-o.x, o.y)) +
    texture(uSource, vUv + vec2(o.x, o.y))
  );
}`,pt=`#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec2 uStep;
in vec2 vUv;
out vec4 outColor;
void main() {
  vec4 sum = texture(uSource, vUv) * 0.1964825501511404;
  sum += (texture(uSource, vUv + uStep * 1.411764705882353) + texture(uSource, vUv - uStep * 1.411764705882353)) * 0.2969069646728344;
  sum += (texture(uSource, vUv + uStep * 3.2941176470588234) + texture(uSource, vUv - uStep * 3.2941176470588234)) * 0.09447039785044732;
  sum += (texture(uSource, vUv + uStep * 5.176470588235294) + texture(uSource, vUv - uStep * 5.176470588235294)) * 0.010381362401148057;
  outColor = sum;
}`,xt=`#version 300 es
precision highp float;
uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform float uGlow;
in vec2 vUv;
out vec4 outColor;
float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}
void main() {
  vec4 scene = texture(uScene, vUv);
  vec4 bloom = texture(uBloom, vUv) * uGlow;
  bloom.a = min(bloom.a, 1.0);
  bloom.rgb = min(bloom.rgb, vec3(bloom.a));
  vec4 color = scene + bloom * (1.0 - scene.a);
  float noise = (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  color.a = clamp(color.a + noise, 0.0, 1.0);
  color.rgb = clamp(color.rgb + noise, vec3(0.0), vec3(color.a));
  outColor = color;
}`,y=(a,d,h)=>Math.min(h,Math.max(d,a)),je=(a,d,h)=>{const p=a.createShader(d);return p?(a.shaderSource(p,h),a.compileShader(p),a.getShaderParameter(p,a.COMPILE_STATUS)?p:(a.deleteShader(p),null)):null},se=(a,d)=>{const h=je(a,a.VERTEX_SHADER,ht),p=je(a,a.FRAGMENT_SHADER,d),b=a.createProgram();if(!h||!p||!b)return null;if(a.attachShader(b,h),a.attachShader(b,p),a.linkProgram(b),a.deleteShader(h),a.deleteShader(p),!a.getProgramParameter(b,a.LINK_STATUS))return a.deleteProgram(b),null;const te={},he=a.getProgramParameter(b,a.ACTIVE_UNIFORMS);for(let $=0;$<he;$++){const ae=a.getActiveUniform(b,$);if(!ae)continue;const oe=ae.name.replace(/\[0\]$/,"");te[oe]=a.getUniformLocation(b,oe)}return{program:b,uniforms:te}},ue=a=>{const d=a.createTexture();return a.bindTexture(a.TEXTURE_2D,d),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.LINEAR),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,a.LINEAR),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE),{texture:d,width:0,height:0}},fe=(a,d,h,p)=>{d.width===h&&d.height===p||(d.width=h,d.height=p,a.bindTexture(a.TEXTURE_2D,d.texture),a.texImage2D(a.TEXTURE_2D,0,a.RGBA8,h,p,0,a.RGBA,a.UNSIGNED_BYTE,null))};let de=null;const yt=()=>window.faceapi?Promise.resolve(window.faceapi):(de||(de=new Promise((a,d)=>{const h=document.createElement("script");h.src=ut,h.async=!0,h.onload=()=>window.faceapi?a(window.faceapi):d(new Error("face-api.js")),h.onerror=()=>{de=null,d(new Error("face-api.js"))},document.head.appendChild(h)})),de),gt={loading:"Loading face tracking",searching:"Looking for a face",tracking:"Tracking",blocked:"Camera unavailable"},wt=({linesColor:a,scanColor:d,cells:h=8,lineThickness:p=1,lineStyle:b="solid",depth:te=3,depthFade:he=.6,parallax:$=1,points:ae=!0,reflection:oe=.35,shading:Ge=.7,scanDirection:He="forward",scanDuration:Ve=2.4,scanDelay:We=1.6,scanWidth:Ze=1,trail:Ye=.5,glow:$e=.6,autoScan:Ke=!0,interactive:Je=!0,clickEffect:Qe="ping",enableWebcam:ve=!1,showPreview:Ee=!1,modelsPath:we=ft,enableGyro:et=!1,intro:tt=!0,lightMode:me=!1,dpr:at,className:Te="",style:ot,...rt})=>{const be=C.useRef(null),Se=C.useRef(null),Re=C.useRef(null),pe=C.useRef(null),k=C.useRef(null),[nt,K]=C.useState("loading"),Ae={linesColor:a??(me?"#d4d4d8":"#4d4757"),scanColor:d??(me?"#0284c7":"#7dd3fc"),cells:y(h,2,40),thickness:y(p,.5,4),style:dt[b]??0,depth:y(te,.5,12),depthFade:y(he,0,1),parallax:y($,0,3),points:ae,reflection:y(oe,0,1),shading:y(Ge,0,1),direction:He,duration:y(Ve,.3,20),delay:y(We,0,30),scanWidth:y(Ze,.2,5),trail:y(Ye,0,1),glow:y($e,0,1.5),autoScan:Ke,interactive:Je,clickEffect:Qe,enableGyro:et,intro:tt,lightMode:me,dpr:at},F=C.useRef(Ae);return F.current=Ae,C.useEffect(()=>{const E=be.current,f=Se.current,e=f?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!E||!f||!e)return;const I=se(e,vt),P=se(e,mt),v=se(e,pt),X=se(e,xt);if(!I||!P||!v||!X)return;const U=e.createVertexArray(),O=ue(e),D=ue(e),x=ue(e),S=ue(e),L=e.createFramebuffer(),j=e.createFramebuffer(),J=e.createFramebuffer(),B=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),re=new Map,ne=t=>{const r=String(t),o=re.get(r);if(o)return o;let l=[1,1,1];if(B){B.clearRect(0,0,1,1),B.fillStyle="#000000",B.fillStyle=r,B.fillRect(0,0,1,1);const[s,T,M]=B.getImageData(0,0,1,1).data;l=[s/255,T/255,M/255]}return re.set(r,l),l},g=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,w={width:1,height:1,ratio:1},i={x:0,y:0,vx:0,vy:0,tx:0,ty:0,f:le,vf:0,tf:le},N={x:0,y:0,inside:!1},A={x:0,y:0,held:!1},W={gamma:0,beta:0,ready:!1,asked:!1},m={x:0,y:0,z:0,strength:0,ready:!1},c={z:0,dir:1,alpha:0,start:0,sweeps:0,waiting:!1},_=[],Me=new Float32Array(ce*4),xe=new Float32Array(ce);let z=0,q=F.current.intro&&!g?0:1,Q=0,Z=0,ie=!0,Y=0;const ye=()=>{const t=F.current,r=w.width/w.height,o=1/Math.round(t.cells),l=r/Math.max(1,Math.round(r/o)),s=Math.max(o,Math.round(t.depth/o)*o);return{aspect:r,cx:l,cy:o,roomDepth:s}},Fe=(t,r)=>{const{aspect:o,roomDepth:l}=ye(),s=(t-.5)*o,T=r-.5,M=s-i.x,u=T-i.y,n=i.f,G=M>0?.5*o:-.5*o,H=u>0?.5:-.5;let V=l/n;return Math.abs(M)>1e-6&&(V=Math.min(V,(G-s)/M)),Math.abs(u)>1e-6&&(V=Math.min(V,(H-T)/u)),{x:s+M*V,y:T+u*V,z:n*V}},Ue=t=>{c.dir=t.direction==="backward"||t.direction==="pingpong"&&c.sweeps%2===1?-1:1,c.start=z,c.waiting=!1,c.sweeps+=1},it=(t,r)=>{if(q<1){const s=q;c.dir=1,c.z=s*(r+.4)-.2,c.alpha=Math.min(1,s*6)*(1-Math.max(0,s-.85)/.15);return}if(c.sweeps===0&&!c.waiting&&(c.waiting=!0,c.start=z,c.alpha=0),c.waiting){c.alpha=0,t.autoScan&&!g&&z-c.start>=t.delay&&Ue(t);return}const o=(z-c.start)/t.duration;if(o>=1){c.waiting=!0,c.start=z,c.alpha=0;return}const l=o*(r+.3)-.15;c.z=c.dir>0?l:r-l,c.alpha=Math.min(1,o/.12)*Math.min(1,(1-o)/.12)},ct=t=>{const r=Math.max(1,Math.ceil(t/.008333333333333333)),o=t/r;for(let l=0;l<r;l++)i.vx+=((i.tx-i.x)*42-i.vx*11)*o,i.vy+=((i.ty-i.y)*42-i.vy*11)*o,i.vf+=((i.tf-i.f)*42-i.vf*11)*o,i.x+=i.vx*o,i.y+=i.vy*o,i.f+=i.vf*o},ge=(t,r,o)=>{A.x=y(t,-1,1),A.y=y(r,-1,1),A.held=o},lt=t=>{const r=w.width/w.height,o=g?0:1,l=A.held?A.x:(Math.sin(z*.21)*.2+Math.sin(z*.083+1.3)*.12)*o,s=A.held?A.y:Math.sin(z*.17+2.1)*.16*o;i.tx=l*t.parallax*.22*r,i.ty=s*t.parallax*.22},ze=()=>{const t=F.current;w.width=Math.max(1,E.clientWidth),w.height=Math.max(1,E.clientHeight),w.ratio=Math.min(t.dpr||window.devicePixelRatio||1,2),f.width=Math.max(1,Math.round(w.width*w.ratio)),f.height=Math.max(1,Math.round(w.height*w.ratio)),fe(e,O,f.width,f.height),fe(e,D,f.width,f.height),e.bindFramebuffer(e.FRAMEBUFFER,L),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,O.texture,0),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT1,e.TEXTURE_2D,D.texture,0);const r=Math.max(1,Math.round(f.width/4)),o=Math.max(1,Math.round(f.height/4));fe(e,x,r,o),fe(e,S,r,o),e.bindFramebuffer(e.FRAMEBUFFER,j),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,x.texture,0),e.bindFramebuffer(e.FRAMEBUFFER,J),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,S.texture,0),e.bindFramebuffer(e.FRAMEBUFFER,null),Ce(),R()},Ce=()=>{const t=F.current,{aspect:r,cx:o,cy:l,roomDepth:s}=ye(),T=ne(t.linesColor),M=ne(t.scanColor),u=t.lightMode?M:M.map(H=>H+(1-H)*.65),n=I.uniforms;e.bindVertexArray(U),e.disable(e.BLEND),e.bindFramebuffer(e.FRAMEBUFFER,L),e.drawBuffers([e.COLOR_ATTACHMENT0,e.COLOR_ATTACHMENT1]),e.viewport(0,0,f.width,f.height),e.useProgram(I.program),e.uniform1f(n.uAspect,r),e.uniform1f(n.uPixel,1/f.height),e.uniform3f(n.uEye,i.x,i.y,-i.f),e.uniform1f(n.uDepth,s),e.uniform3f(n.uCell,o,l,l),e.uniform1f(n.uThick,t.thickness*w.ratio*.5),e.uniform1f(n.uDot,1.8*w.ratio),e.uniform1i(n.uStyle,t.style),e.uniform3fv(n.uLineColor,T),e.uniform3fv(n.uScanColor,M),e.uniform3fv(n.uCoreColor,u),e.uniform1f(n.uFade,t.depthFade),e.uniform1f(n.uScanZ,c.z),e.uniform1f(n.uScanDir,c.dir),e.uniform1f(n.uScanAlpha,c.alpha),e.uniform1f(n.uScanWidth,.006*t.scanWidth),e.uniform1f(n.uTrail,.04+t.trail*1.1),e.uniform1f(n.uReveal,q<1?c.z+.05:1e4),e.uniform1f(n.uPoints,t.points?1:0),e.uniform1f(n.uReflect,t.reflection),e.uniform1f(n.uHaze,t.lightMode?.03:.05),e.uniform1f(n.uShade,t.shading),e.uniform1f(n.uLight,t.lightMode?1:0),e.uniform4fv(n.uPing,Me),e.uniform1fv(n.uPingAlpha,xe),e.uniform4f(n.uHover,m.x,m.y,m.z,m.strength),e.uniform1f(n.uTime,z),e.drawArrays(e.TRIANGLES,0,3);const G=t.glow>0;if(G){e.bindFramebuffer(e.FRAMEBUFFER,j),e.viewport(0,0,x.width,x.height),e.useProgram(P.program),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,D.texture),e.uniform1i(P.uniforms.uSource,0),e.uniform2f(P.uniforms.uTexel,1/D.width,1/D.height),e.drawArrays(e.TRIANGLES,0,3);const H=2.2*w.ratio/2;e.useProgram(v.program),e.uniform1i(v.uniforms.uSource,0),e.bindFramebuffer(e.FRAMEBUFFER,J),e.bindTexture(e.TEXTURE_2D,x.texture),e.uniform2f(v.uniforms.uStep,H/x.width,0),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.FRAMEBUFFER,j),e.bindTexture(e.TEXTURE_2D,S.texture),e.uniform2f(v.uniforms.uStep,0,H/x.height),e.drawArrays(e.TRIANGLES,0,3)}e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,f.width,f.height),e.useProgram(X.program),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,O.texture),e.uniform1i(X.uniforms.uScene,0),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,x.texture),e.uniform1i(X.uniforms.uBloom,1),e.uniform1f(X.uniforms.uGlow,G?t.glow*(t.lightMode?.8:1.6):0),e.drawArrays(e.TRIANGLES,0,3),e.activeTexture(e.TEXTURE0)},De=t=>{if(Q=0,!ie||document.hidden)return;const r=F.current,o=Z?y((t-Z)/1e3,.001,.05):1/60;Z=t,z+=o,q<1&&(q=Math.min(1,q+o/st));const{roomDepth:l}=ye();it(r,l),lt(r),ct(o);const s=r.interactive&&N.inside&&!g?1:0;if(s){const u=Fe(N.x,N.y);m.ready||Object.assign(m,u,{ready:!0});const n=1-Math.exp(-o/.08);m.x+=(u.x-m.x)*n,m.y+=(u.y-m.y)*n,m.z+=(u.z-m.z)*n}m.strength+=(s-m.strength)*(1-Math.exp(-o/.25)),!s&&m.strength<.01&&(m.ready=!1);for(let u=_.length-1;u>=0;u--)_[u].age+=o,_[u].age>Xe&&_.splice(u,1);for(let u=0;u<ce;u++){const n=_[u];if(!n){xe[u]=0;continue}const G=n.age/Xe;Me.set([n.x,n.y,n.z,n.age*1.15],u*4),xe[u]=Math.min(1,n.age/.05)*(1-G)*(1-G)}Ce();const T=Math.abs(i.tx-i.x)+Math.abs(i.ty-i.y)+Math.abs(i.tf-i.f)>1e-4||Math.abs(i.vx)+Math.abs(i.vy)+Math.abs(i.vf)>1e-4;q<1||!g&&r.autoScan||!c.waiting||_.length>0||T||m.strength>.002||!g&&r.parallax>0&&!A.held||r.points&&!g&&c.alpha>0?Q=requestAnimationFrame(De):Z=0};function R(){!Q&&ie&&!document.hidden&&(Q=requestAnimationFrame(De))}const Le=t=>{const r=E.getBoundingClientRect(),o=(t.clientX-r.left)/Math.max(1,r.width),l=1-(t.clientY-r.top)/Math.max(1,r.height);return{u:o,v:l,inside:o>=0&&o<=1&&l>=0&&l<=1}},_e=t=>{const r=F.current,{u:o,v:l,inside:s}=Le(t);N.x=o,N.y=l;const T=N.inside;N.inside=s,s?(window.clearTimeout(Y),Y=0,!k.current?.active&&r.interactive&&!g&&ge(o*2-1,l*2-1,!0),R()):T&&!Y&&(Y=window.setTimeout(()=>{Y=0,k.current?.active||(A.held=!1),R()},220),R())},ke=t=>{const r=F.current,{u:o,v:l,inside:s}=Le(t);if(!(!s||g||r.clickEffect==="none")){if(r.clickEffect==="scan")q>=1&&Ue(r);else{const T=Fe(o,l);_.unshift({...T,age:0}),_.length>ce&&_.pop()}R()}},Pe=()=>{N.inside=!1,k.current?.active||(A.held=!1),R()},Oe=t=>{!F.current.enableGyro||k.current?.active||g||t.gamma===null||t.beta===null||(W.ready||Object.assign(W,{gamma:t.gamma,beta:t.beta,ready:!0}),ge((t.gamma-W.gamma)/25,(t.beta-W.beta)/-25,!0),R())},Be=()=>{const t=F.current,r=window.DeviceOrientationEvent?.requestPermission;!t.enableGyro||W.asked||typeof r!="function"||(W.asked=!0,r.call(window.DeviceOrientationEvent).catch(()=>{}))},Ne=()=>{Z=0,R()},qe=new ResizeObserver(ze);qe.observe(E);const Ie=new IntersectionObserver(t=>{ie=t.some(r=>r.isIntersecting),ie&&(Z=0,R())});return Ie.observe(E),window.addEventListener("pointermove",_e,{passive:!0}),window.addEventListener("pointerdown",ke,{passive:!0}),window.addEventListener("deviceorientation",Oe),window.addEventListener("click",Be),document.documentElement.addEventListener("pointerleave",Pe),document.addEventListener("visibilitychange",Ne),k.current={active:!1,move:(t,r,o)=>{g||(ge(t*1.3,r*1.3,!0),i.tf=le*y(o,.6,1.6),R())},release:()=>{i.tf=le,A.held=!1,R()}},ze(),pe.current=R,()=>{cancelAnimationFrame(Q),window.clearTimeout(Y),pe.current=null,k.current=null,qe.disconnect(),Ie.disconnect(),window.removeEventListener("pointermove",_e),window.removeEventListener("pointerdown",ke),window.removeEventListener("deviceorientation",Oe),window.removeEventListener("click",Be),document.documentElement.removeEventListener("pointerleave",Pe),document.removeEventListener("visibilitychange",Ne),[O,D,x,S].forEach(t=>e.deleteTexture(t.texture)),[L,j,J].forEach(t=>e.deleteFramebuffer(t)),e.deleteVertexArray(U),[I,P,v,X].forEach(t=>e.deleteProgram(t.program)),e.getExtension("WEBGL_lose_context")?.loseContext()}},[]),C.useEffect(()=>{pe.current?.()}),C.useEffect(()=>{if(!ve)return;const E=Re.current;if(!E)return;let f=!1,e=null,I=0,P=0;const v={x:0,y:0,near:1,ready:!1};return K("loading"),(async()=>{try{const U=await yt();if(await U.nets.tinyFaceDetector.loadFromUri(we),f)return;if(e=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:640},height:{ideal:480}},audio:!1}),f){e.getTracks().forEach(x=>x.stop());return}E.srcObject=e,await E.play(),K("searching");const O=new U.TinyFaceDetectorOptions({inputSize:224,scoreThreshold:.45}),D=async()=>{if(f)return;let x=null;try{x=await U.detectSingleFace(E,O)}catch{x=null}if(f)return;const S=k.current;if(x&&S){const L=x.box,j=E.videoWidth||1,J=E.videoHeight||1,B=-((L.x+L.width/2)/j-.5)*2,re=-((L.y+L.height/2)/J-.5)*2,ne=.32/Math.max(.08,L.width/j),g=v.ready?.45:1;v.x+=(B-v.x)*g,v.y+=(re-v.y)*g,v.near+=(ne-v.near)*g,v.ready=!0,P=0,S.active=!0,S.move(v.x,v.y,v.near),K("tracking")}else S&&++P>12&&S.active&&(S.active=!1,v.ready=!1,S.release(),K("searching"));I=window.setTimeout(D,40)};D()}catch{f||K("blocked")}})(),()=>{f=!0,window.clearTimeout(I),e?.getTracks().forEach(O=>O.stop()),E.srcObject=null;const U=k.current;U?.active&&(U.active=!1,U.release())}},[ve,we]),ee.jsxs("div",{ref:be,className:`grid-scan${Te?` ${Te}`:""}`,style:ot,...rt,children:[ee.jsx("canvas",{ref:Se,className:"grid-scan-canvas","aria-hidden":"true"}),ve&&ee.jsxs("div",{className:Ee?"grid-scan-preview":"grid-scan-hidden",children:[ee.jsx("video",{ref:Re,className:"grid-scan-video",muted:!0,playsInline:!0}),Ee&&ee.jsx("span",{className:"grid-scan-status",children:gt[nt]})]})]})};export{wt as GridScan,wt as default};
