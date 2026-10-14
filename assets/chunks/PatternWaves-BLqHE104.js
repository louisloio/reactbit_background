import{r as T,R as vt,T as pt,a as Ie,M as oe,P as re,j as dt}from"../text-animations-Covp24vw.js";import{R as Oe}from"./RenderTarget-BNhFmZ5k.js";const De={silk:{pattern:"dot",wave:"silk",spacing:9,markSize:.95,depth:.95,light:0,shine:.8,contrast:1.2,speed:.35,scale:1,direction:20},ocean:{pattern:"dot",wave:"swell",spacing:10,markSize:.9,depth:.42,light:0,shine:1,contrast:1.2,speed:.5,scale:1,direction:100},pond:{pattern:"dot",wave:"ripple",spacing:10,markSize:.9,depth:.55,light:0,shine:1.2,contrast:1.2,speed:.5,scale:1,direction:35},lines:{pattern:"line",wave:"silk",spacing:12,markSize:.42,depth:.9,light:0,shine:.6,contrast:1.2,speed:.3,scale:1,direction:20},terminal:{pattern:"glyph",wave:"ripple",spacing:13,markSize:.95,depth:.75,light:0,shine:.9,contrast:1.4,speed:.3,scale:1.1,direction:200},mesh:{pattern:"plus",wave:"silk",spacing:14,markSize:.8,depth:.95,light:0,shine:1,contrast:1.45,speed:.4,scale:1.1,direction:325}},ht={dot:0,square:1,plus:2,line:3,glyph:4},mt={silk:0,swell:1,ripple:2},gt={none:0,edges:1,center:2,bottom:3,top:4},We=".:-=+*#%@",xt="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",M=128,Ne=520,_e=8,wt=60,yt=45e5,St=2,r=(c,u,l)=>Math.min(Math.max(c,u),l),le=c=>.2126*c[0]+.7152*c[1]+.0722*c[2],Ue=(c,u)=>{try{const l=document.createElement("canvas").getContext("2d");if(!l)return u;l.fillStyle="#000000",l.fillStyle=c;const x=l.fillStyle;if(x.startsWith("#")){const f=parseInt(x.slice(1),16);return[(f>>16&255)/255,(f>>8&255)/255,(f&255)/255,1]}const s=x.match(/[\d.]+/g);return!s||s.length<3?u:[Number(s[0])/255,Number(s[1])/255,Number(s[2])/255,s[3]?Number(s[3]):1]}catch{return u}},kt=c=>{const u=Array.from(c&&c.length?c:We),l=Math.ceil(Math.sqrt(u.length)),x=Math.ceil(u.length/l),s=document.createElement("canvas");s.width=l*M,s.height=x*M;const f=s.getContext("2d");return f?(f.fillStyle="#ffffff",f.textAlign="center",f.textBaseline="middle",f.font=`500 ${Math.round(M*.86)}px ${xt}`,u.forEach((H,C)=>{const q=C%l*M+M/2,X=Math.floor(C/l)*M+M/2;f.fillText(H,q,X)}),{canvas:s,columns:l,lines:x,count:u.length}):null},se=`#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`,At=`#version 300 es
precision highp float;
precision highp int;
uniform vec2 uSize;
uniform float uDpr;
uniform vec2 uOrigin;
uniform vec2 uPitch;
uniform int uWave;
uniform float uTime;
uniform float uUnit;
uniform vec2 uHeading;
uniform float uAmp;
uniform float uDepth;
uniform vec3 uLight;
uniform float uShine;
uniform float uContrast;
uniform float uInk;
uniform float uOpacity;
uniform int uFade;
uniform float uFadeSize;
uniform float uAppear;
uniform sampler2D tRipple;
uniform float uRipple;
out vec4 fragColor;

const float FOLDS = 5.5;

uvec3 scramble(uvec3 v) {
  v = v * 1664525u + 1013904223u;
  v.x += v.y * v.z;
  v.y += v.z * v.x;
  v.z += v.x * v.y;
  v ^= v >> 16u;
  v.x += v.y * v.z;
  v.y += v.z * v.x;
  v.z += v.x * v.y;
  return v;
}

vec3 lattice(vec3 corner) {
  uvec3 h = scramble(uvec3(ivec3(corner) + 4096));
  return vec3(h & 65535u) / 32767.5 - 1.0;
}

float gradientNoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = p - i;
  vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float n000 = dot(lattice(i), f);
  float n100 = dot(lattice(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0));
  float n010 = dot(lattice(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0));
  float n110 = dot(lattice(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0));
  float n001 = dot(lattice(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0));
  float n101 = dot(lattice(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0));
  float n011 = dot(lattice(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0));
  float n111 = dot(lattice(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0));
  return mix(
    mix(mix(n000, n100, u.x), mix(n010, n110, u.x), u.y),
    mix(mix(n001, n101, u.x), mix(n011, n111, u.x), u.y),
    u.z
  );
}

vec2 turn(vec2 v, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

float surface(vec2 p, float t) {
  if (uWave == 0) {
    vec2 side = vec2(-uHeading.y, uHeading.x);
    float u = dot(p, uHeading);
    float v = dot(p, side);
    float bend = gradientNoise(vec3(v * 0.85, u * 0.3, t * 0.05)) * 1.7 + 0.4 * sin(v * 1.6 + t * 0.2);
    float phase = u * FOLDS + bend - t * 0.45;
    float swell = 0.6 + 0.4 * gradientNoise(vec3(u * 0.55 + 3.0, v * 0.45, t * 0.04));
    float fold = sin(phase) + 0.32 * sin(2.0 * phase + 1.3);
    float ripple = 0.16 * sin(u * FOLDS * 2.5 + bend * 1.9 - t * 0.9 + 2.1);
    return (fold + ripple) * swell;
  }
  if (uWave == 1) {
    float bend = gradientNoise(vec3(p * 0.6, t * 0.05)) * 0.6;
    float phase = dot(p, uHeading) * 15.0 + bend * 2.2 - t * 1.4;
    float swell = sin(phase) + 0.3 * sin(2.0 * phase - 0.8);
    float roll = 0.75 + 0.25 * gradientNoise(vec3(p * 0.9 + 11.0, t * 0.05));
    return 0.8 * swell * roll;
  }
  float r = length(p + uHeading * 1.2);
  float bend = gradientNoise(vec3(p * 1.2, t * 0.05)) * 0.1;
  return sin((r + bend) * 9.0 - t * 1.8) * (0.45 + 0.55 * exp(-(r - 0.6) * 0.8));
}

float heightAt(vec2 css) {
  float h = surface((css - 0.5 * uSize) / uUnit, uTime) * uAmp;
  if (uRipple > 0.0) h += texture(tRipple, css / uSize).r * uRipple;
  return h;
}

void main() {
  vec2 cell = floor(gl_FragCoord.xy);
  vec2 center = uOrigin + (cell + 0.5) * uPitch;
  vec2 css = center / uDpr;
  vec2 uv = css / uSize;
  float e = max(uPitch.y / uDpr, 4.0);
  float h = heightAt(css);
  float hx = (heightAt(css + vec2(e, 0.0)) - heightAt(css - vec2(e, 0.0))) / (2.0 * e);
  float hy = (heightAt(css + vec2(0.0, e)) - heightAt(css - vec2(0.0, e))) / (2.0 * e);
  vec2 grad = vec2(hx, hy) * uUnit * uDepth * 0.4;
  vec3 n = normalize(vec3(-grad, 1.0));

  float diffuse = clamp(dot(n, uLight), 0.0, 1.0);
  vec3 halfway = normalize(uLight + vec3(0.0, 0.0, 1.0));
  float spec = pow(clamp(dot(n, halfway), 0.0, 1.0), 160.0) * uShine * 1.15;
  float hollow = 0.7 + 0.3 * clamp(h * 0.5 + 0.5, 0.0, 1.0);
  float tone = clamp(diffuse * hollow * 0.78 + spec, 0.0, 1.0);
  tone = clamp((tone - 0.42) * uContrast + 0.42, 0.0, 1.0);

  float level = uInk > 0.5 ? pow(clamp(1.0 - tone / 0.46, 0.0, 1.0), 2.4) * 0.72 : pow(tone, 2.2);
  float emphasis = uInk > 0.5 ? smoothstep(0.55, 0.95, level) : clamp(spec * 1.6, 0.0, 1.0);

  float fade = 1.0;
  vec2 c = uv * 2.0 - 1.0;
  if (uFade == 1) {
    fade = 1.0 - smoothstep(1.0 - uFadeSize, 1.18, length(c));
  } else if (uFade == 2) {
    fade = mix(0.05, 1.0, smoothstep(0.08, 0.08 + uFadeSize, length(c * vec2(1.0, 1.35))));
  } else if (uFade == 3) {
    fade = smoothstep(0.0, uFadeSize, uv.y);
  } else if (uFade == 4) {
    fade = smoothstep(0.0, uFadeSize, 1.0 - uv.y);
  }

  float reach = length(css - 0.5 * uSize) / max(0.5 * length(uSize), 1.0);
  float appear = smoothstep(reach - 0.05, reach + 0.3, uAppear * 1.35);

  float alpha = uOpacity * fade * appear * (0.22 + 0.78 * level);
  float lift = clamp(h * uDepth * 0.42, -0.48, 0.48);
  fragColor = vec4(level, alpha, emphasis, lift + 0.5);
}
`,bt=`#version 300 es
precision highp float;
uniform sampler2D tState;
uniform vec2 uTexel;
uniform vec2 uSize;
uniform vec2 uFrom;
uniform vec2 uTo;
uniform float uRadius;
uniform float uImpulse;
uniform float uDamping;
out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy * uTexel;
  vec2 state = texture(tState, uv).rg;
  float left = texture(tState, uv - vec2(uTexel.x, 0.0)).r;
  float right = texture(tState, uv + vec2(uTexel.x, 0.0)).r;
  float below = texture(tState, uv - vec2(0.0, uTexel.y)).r;
  float above = texture(tState, uv + vec2(0.0, uTexel.y)).r;
  float next = ((left + right + below + above) * 0.5 - state.g) * uDamping;
  vec2 p = uv * uSize;
  vec2 segment = uTo - uFrom;
  float along = clamp(dot(p - uFrom, segment) / max(dot(segment, segment), 1e-4), 0.0, 1.0);
  float d = length(p - uFrom - segment * along) / uRadius;
  next -= uImpulse * exp(-d * d * 2.0);
  fragColor = vec4(next, state.r, 0.0, 1.0);
}
`,Ft=`#version 300 es
precision highp float;
precision highp int;
uniform sampler2D tField;
uniform sampler2D tAtlas;
uniform vec2 uOrigin;
uniform vec2 uPitch;
uniform vec2 uGrid;
uniform int uPattern;
uniform float uMarkSize;
uniform float uStroke;
uniform vec3 uColor;
uniform vec3 uAccent;
uniform vec4 uBackground;
uniform vec3 uAtlas;
out vec4 fragColor;

float box(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float coverage(vec2 local, float level) {
  float span = uPitch.y * uMarkSize;
  float area = max(sqrt(level), 0.14);
  if (uPattern == 0) {
    return clamp(0.5 - (length(local) - 0.5 * span * area), 0.0, 1.0);
  }
  if (uPattern == 1) {
    float extent = 0.5 * span * area;
    return clamp(0.5 - box(local, vec2(extent), extent * 0.3), 0.0, 1.0);
  }
  if (uPattern == 2) {
    float arm = 0.5 * span * mix(0.3, 1.0, level);
    float width = 0.5 * uStroke;
    return clamp(0.5 - min(box(local, vec2(arm, width), width), box(local, vec2(width, arm), width)), 0.0, 1.0);
  }
  if (uAtlas.z < 1.0) return 0.0;
  vec2 g = local / span + 0.5;
  if (g.x < 0.0 || g.y < 0.0 || g.x > 1.0 || g.y > 1.0) return 0.0;
  float index = min(floor(level * uAtlas.z), uAtlas.z - 1.0);
  vec2 tile = vec2(mod(index, uAtlas.x), floor(index / uAtlas.x));
  vec2 atlasUv = (tile + vec2(g.x, 1.0 - g.y)) / uAtlas.xy;
  vec2 texel = 1.0 / (span * uAtlas.xy);
  return textureGrad(tAtlas, atlasUv, vec2(texel.x, 0.0), vec2(0.0, texel.y)).a;
}

vec4 lineInk(vec2 rel) {
  float fx = rel.x / uPitch.x - 0.5;
  float c0 = clamp(floor(fx), 0.0, uGrid.x - 1.0);
  float c1 = min(c0 + 1.0, uGrid.x - 1.0);
  float t = clamp(fx - c0, 0.0, 1.0);
  float row = floor(rel.y / uPitch.y);
  vec4 ink = vec4(0.0);
  for (int k = -1; k <= 1; k++) {
    float cy = row + float(k);
    if (cy < 0.0 || cy >= uGrid.y) continue;
    vec4 a = texelFetch(tField, ivec2(int(c0), int(cy)), 0);
    vec4 b = texelFetch(tField, ivec2(int(c1), int(cy)), 0);
    vec4 f = mix(a, b, t);
    if (f.g < 0.002) continue;
    float y = (cy + 0.5 + f.a - 0.5) * uPitch.y;
    float slope = (b.a - a.a) * uPitch.y / uPitch.x;
    float thickness = max(uStroke, uPitch.y * uMarkSize * f.r);
    float d = abs(rel.y - y) / sqrt(1.0 + slope * slope) - 0.5 * thickness;
    float alpha = clamp(0.5 - d, 0.0, 1.0) * f.g;
    if (alpha > ink.a) ink = vec4(mix(uColor, uAccent, f.b) * alpha, alpha);
  }
  return ink;
}

void main() {
  vec2 rel = gl_FragCoord.xy - uOrigin;
  vec4 background = vec4(uBackground.rgb * uBackground.a, uBackground.a);
  vec4 ink = vec4(0.0);
  if (uPattern == 3) {
    ink = lineInk(rel);
  } else {
    float cx = floor(rel.x / uPitch.x);
    float row = floor(rel.y / uPitch.y);
    if (cx >= 0.0 && cx < uGrid.x) {
      for (int k = -1; k <= 1; k++) {
        float cy = row + float(k);
        if (cy < 0.0 || cy >= uGrid.y) continue;
        vec4 f = texelFetch(tField, ivec2(int(cx), int(cy)), 0);
        if (f.g < 0.002) continue;
        vec2 center = (vec2(cx, cy) + 0.5) * uPitch + vec2(0.0, (f.a - 0.5) * uPitch.y);
        float alpha = coverage(rel - center, f.r) * f.g;
        if (alpha > ink.a) ink = vec4(mix(uColor, uAccent, f.b) * alpha, alpha);
      }
    }
  }
  fragColor = ink + background * (1.0 - ink.a);
}
`,zt=({preset:c="silk",pattern:u,wave:l,spacing:x,markSize:s,depth:f,light:H,shine:C,contrast:q,speed:X,scale:Be,direction:Ge,color:ce="#ffffff",backgroundColor:ue="#000000",opacity:He=1,fade:qe="edges",fadeSize:Xe=.5,characters:Ye=We,interactive:Ve=!0,cursorSize:je=50,cursorStrength:$e=.6,intro:Ke=!0,paused:Je=!1,className:Qe="",style:Ze})=>{const fe=T.useRef(null),ve=T.useRef(null),Y=T.useRef(null),et=De[c]||De.silk,p=(d,h)=>d??et[h],tt=T.useMemo(()=>({color:Ue(ce,[1,1,1,1]),background:Ue(ue,[0,0,0,1])}),[ce,ue]);return T.useEffect(()=>{ve.current={...tt,pattern:p(u,"pattern"),wave:p(l,"wave"),spacing:p(x,"spacing"),markSize:p(s,"markSize"),depth:p(f,"depth"),light:p(H,"light"),shine:p(C,"shine"),contrast:p(q,"contrast"),speed:p(X,"speed"),scale:p(Be,"scale"),direction:p(Ge,"direction"),opacity:He,fade:qe,fadeSize:Xe,characters:Ye,interactive:Ve,cursorSize:je,cursorStrength:$e,intro:Ke,paused:Je},Y.current?.()}),T.useEffect(()=>{const d=fe.current;if(!d)return;const h=new vt({alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1}),i=h.gl;if(!h.isWebgl2){i.getExtension("WEBGL_lose_context")?.loseContext();return}i.clearColor(0,0,0,0);const w=i.canvas;w.style.display="block",w.style.width="100%",w.style.height="100%",w.setAttribute("aria-hidden","true"),d.appendChild(w);const V=new pt(i),j=new Ie(i),at=!!i.getExtension("EXT_color_buffer_float"),E=t=>{i.deleteFramebuffer(t.buffer),i.deleteTexture(t.texture.texture)},pe=(t,e)=>new Oe(i,{width:t,height:e,depth:!1,minFilter:i.NEAREST,magFilter:i.NEAREST}),de=(t,e)=>new Oe(i,{width:t,height:e,depth:!1,type:i.HALF_FLOAT,format:i.RGBA,internalFormat:i.RGBA16F,minFilter:i.LINEAR,magFilter:i.LINEAR});let y=pe(1,1),o=null;const $=new Ie(i,{generateMipmaps:!0,minFilter:i.LINEAR_MIPMAP_LINEAR,magFilter:i.LINEAR,flipY:!1}),n={uSize:{value:[1,1]},uDpr:{value:1},uOrigin:{value:[0,0]},uPitch:{value:[1,1]},uWave:{value:0},uTime:{value:0},uUnit:{value:Ne},uHeading:{value:[1,0]},uAmp:{value:0},uDepth:{value:.5},uLight:{value:[0,0,1]},uShine:{value:.8},uContrast:{value:1},uInk:{value:0},uOpacity:{value:1},uFade:{value:0},uFadeSize:{value:.5},uAppear:{value:0},tRipple:{value:j},uRipple:{value:0}},it=new oe(i,{geometry:V,program:new re(i,{vertex:se,fragment:At,uniforms:n,depthTest:!1,depthWrite:!1})}),S={tState:{value:j},uTexel:{value:[1,1]},uSize:{value:[1,1]},uFrom:{value:[0,0]},uTo:{value:[0,0]},uRadius:{value:40},uImpulse:{value:0},uDamping:{value:.975}},nt=new oe(i,{geometry:V,program:new re(i,{vertex:se,fragment:bt,uniforms:S,depthTest:!1,depthWrite:!1})}),v={tField:{value:y.texture},tAtlas:{value:$},uOrigin:{value:[0,0]},uPitch:{value:[1,1]},uGrid:{value:[1,1]},uPattern:{value:0},uMarkSize:{value:.9},uStroke:{value:2},uColor:{value:[1,1,1]},uAccent:{value:[1,1,1]},uBackground:{value:[0,0,0,1]},uAtlas:{value:[1,1,0]}},ot=new oe(i,{geometry:V,program:new re(i,{vertex:se,fragment:Ft,uniforms:v,depthTest:!1,depthWrite:!1})}),K=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1;let A=1,k=1,P=0,J=performance.now(),he=0,L=0,I=!0,Q=!0,O=!0,me=0,z=!1,D=0,ge="";const a={x:0,y:0,inside:!1,placed:!1,lastX:0,lastY:0,burst:0},rt=()=>{if(!at)return;const t=r(Math.ceil(A/_e),4,512),e=r(Math.ceil(k/_e),4,512);o&&o.width===t&&o.height===e||(o&&(E(o.read),E(o.write)),o={width:t,height:e,read:de(t,e),write:de(t,e)},z=!1)},lt=()=>{o&&([o.read,o.write].forEach(t=>{h.bindFramebuffer(t),i.viewport(0,0,t.width,t.height),i.clear(i.COLOR_BUFFER_BIT)}),h.bindFramebuffer())},st=t=>{if(t.characters===ge)return;ge=t.characters;const e=kt(t.characters);e&&($.image=e.canvas,v.uAtlas.value=[e.columns,e.lines,e.count])},xe=()=>{A=Math.max(1,d.clientWidth),k=Math.max(1,d.clientHeight),h.dpr=Math.min(window.devicePixelRatio||1,2,Math.sqrt(yt/(A*k))),h.setSize(A,k),rt(),O=!0,b()},ct=(t,e,m)=>{D=Math.min(D+m*wt,4);const g=r(e.cursorStrength,0,1),Z=Math.hypot(a.x-a.lastX,a.y-a.lastY);let R=(a.inside?Math.min(Z/14,1)*.35*g:0)+a.burst*g;for(a.burst=0,S.uTexel.value=[1/t.width,1/t.height],S.uSize.value=[A,k],S.uFrom.value=[a.lastX,k-a.lastY],S.uTo.value=[a.x,k-a.y],S.uRadius.value=r(e.cursorSize,8,400);D>=1;){D-=1,S.tState.value=t.read.texture,S.uImpulse.value=R,h.render({scene:nt,target:t.write,clear:!1});const ee=t.read;t.read=t.write,t.write=ee,R=0}a.lastX=a.x,a.lastY=a.y},we=t=>{if(P=0,!Q)return;const e=ve.current,m=Math.min(.05,Math.max(1/240,(t-J)/1e3));if(J=t,!e)return;const g=!e.paused&&!K&&e.speed!==0;g&&(he+=m*e.speed),L=e.intro&&!K?Math.min(1,L+m/St):1;const Z=1-Math.pow(1-r(L/.75,0,1),3),R=r((L-.1)/.9,0,1),ee=R*R*(3-2*R),te=e.interactive&&!K&&!!o&&e.cursorStrength>0;te&&a.inside&&!a.placed&&(a.lastX=a.x,a.lastY=a.y,a.placed=!0),te&&(a.inside||a.burst>0)&&(me=t+5e3);const ze=te&&t<me;ze&&o?(ct(o,e,m),z=!0):z&&(lt(),z=!1);const _=ht[e.pattern]??0;_===4&&st(e);const ae=i.canvas.width,Re=i.canvas.height,U=ae/A,F=Math.max(4,Math.round(r(e.spacing,4,120)*U)),W=_===3?Math.max(2,Math.round(F/4)):F,B=Math.min(4096,Math.ceil(ae/W)+1),G=Math.min(4096,Math.ceil(Re/F)+2),Te=[Math.floor((ae-B*W)/2),Math.floor((Re-G*F)/2)];(y.width!==B||y.height!==G)&&(E(y),y=pe(B,G),v.tField.value=y.texture);const Pe=e.direction*Math.PI/180,Le=(e.direction+180+r(e.light,-90,90))*Math.PI/180,ie=e.background,ne=ie[3]>.02?le(e.color)<le(ie):le(e.color)<.5;n.uSize.value=[A,k],n.uDpr.value=U,n.uOrigin.value=Te,n.uPitch.value=[W,F],n.uWave.value=mt[e.wave]??0,n.uTime.value=he,n.uUnit.value=Ne*r(e.scale,.2,5),n.uHeading.value=[Math.cos(Pe),Math.sin(Pe)],n.uAmp.value=ee,n.uDepth.value=r(e.depth,0,1.5),n.uLight.value=[Math.cos(Le)*.78,Math.sin(Le)*.78,.62],n.uShine.value=r(e.shine,0,2),n.uContrast.value=r(e.contrast,.3,3),n.uInk.value=ne?1:0,n.uOpacity.value=r(e.opacity,0,1),n.uFade.value=gt[e.fade]??0,n.uFadeSize.value=r(e.fadeSize,.05,1),n.uAppear.value=Z,n.tRipple.value=o&&z?o.read.texture:j,n.uRipple.value=z?.32:0,h.render({scene:it,target:y}),v.uOrigin.value=Te,v.uPitch.value=[W,F],v.uGrid.value=[B,G],v.uPattern.value=_,v.uMarkSize.value=r(e.markSize,.05,1),v.uStroke.value=_===3?.9*U:Math.max(1.1*U,F*.08);const ut=ne?0:1,ft=ne?.35:.55;v.uColor.value=e.color.slice(0,3),v.uAccent.value=e.color.slice(0,3).map(Ce=>Ce+(ut-Ce)*ft),v.uBackground.value=ie,h.render({scene:ot}),O=!1,I&&(g||L<1||ze||O)&&(P=requestAnimationFrame(we))},b=()=>{P||!I||!Q||(J=performance.now(),P=requestAnimationFrame(we))},ye=t=>{const e=d.getBoundingClientRect(),m=t.clientX-e.left,g=t.clientY-e.top;return{x:m,y:g,inside:m>=0&&g>=0&&m<=e.width&&g<=e.height}},Se=t=>{const e=ye(t);a.x=e.x,a.y=e.y,e.inside!==a.inside&&(a.placed=!1),a.inside=e.inside,e.inside&&b()},ke=t=>{const e=ye(t);e.inside&&(a.x=e.x,a.y=e.y,a.inside||(a.lastX=e.x,a.lastY=e.y),a.burst=1.2,b())},N=()=>{a.inside=!1,a.placed=!1,b()},Ae=t=>{t.relatedTarget||N()},be=t=>{t.pointerType==="touch"&&N()},Fe=()=>{document.hidden||b()};window.addEventListener("pointermove",Se,{passive:!0}),window.addEventListener("pointerdown",ke,{passive:!0}),window.addEventListener("pointerout",Ae,{passive:!0}),window.addEventListener("pointerup",be,{passive:!0}),window.addEventListener("blur",N),document.addEventListener("visibilitychange",Fe);const Me=new ResizeObserver(xe);Me.observe(d);const Ee=new IntersectionObserver(([t])=>{I=t.isIntersecting,b()});return Ee.observe(d),Y.current=()=>{O=!0,b()},xe(),()=>{Q=!1,I=!1,cancelAnimationFrame(P),Me.disconnect(),Ee.disconnect(),window.removeEventListener("pointermove",Se),window.removeEventListener("pointerdown",ke),window.removeEventListener("pointerout",Ae),window.removeEventListener("pointerup",be),window.removeEventListener("blur",N),document.removeEventListener("visibilitychange",Fe),Y.current=null,o&&(E(o.read),E(o.write)),E(y),i.deleteTexture($.texture),i.getExtension("WEBGL_lose_context")?.loseContext(),w.parentNode&&w.parentNode.removeChild(w)}},[]),dt.jsx("div",{ref:fe,className:`pattern-waves ${Qe}`.trim(),style:Ze})};export{zt as default};
