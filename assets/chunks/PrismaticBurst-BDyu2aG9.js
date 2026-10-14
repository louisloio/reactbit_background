import{r as D,j as Xe}from"../text-animations-Cpfg-DyU.js";const Ue=4,Ne=4,vt=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,xt=`#version 300 es
precision highp float;
precision highp int;

uniform vec2 uResolution;
uniform float uTime;
uniform float uPhase;
uniform float uIntensity;
uniform mat3 uOrient;
uniform int uColorCount;
uniform float uDistort;
uniform vec2 uOffset;
uniform sampler2D uGradient;
uniform float uNoiseAmount;
uniform int uRayCount;
uniform float uZoom;
uniform float uRayWidth;
uniform float uTwist;
uniform float uFlow;
uniform float uCenterFade;
uniform vec4 uPointer;
uniform vec4 uPulses[4];
uniform vec3 uIntro;
uniform float uEncode;
out vec4 outColor;

float hash21(vec2 p) {
  p = floor(p);
  float f = 52.9829189 * fract(dot(p, vec2(0.065, 0.005)));
  return fract(f);
}

mat2 rot30() {
  return mat2(0.8, -0.5, 0.5, 0.8);
}

float layeredNoise(vec2 fragPx) {
  vec2 p = mod(fragPx + vec2(uTime * 30.0, -uTime * 21.0), 1024.0);
  vec2 q = rot30() * p;
  float n = 0.0;
  n += 0.40 * hash21(q);
  n += 0.25 * hash21(q * 2.0 + 17.0);
  n += 0.20 * hash21(q * 4.0 + 47.0);
  n += 0.10 * hash21(q * 8.0 + 113.0);
  n += 0.05 * hash21(q * 16.0 + 191.0);
  return n;
}

float edgeFade(vec2 frag, vec2 res, vec2 offset) {
  vec2 toC = frag - 0.5 * res - offset;
  float r = length(toC) / (0.5 * min(res.x, res.y) * uCenterFade);
  float x = clamp(r, 0.0, 1.0);
  float q = x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
  float s = q * 0.5;
  s = pow(s, 1.5);
  float tail = 1.0 - pow(1.0 - s, 2.0);
  s = mix(s, tail, 0.2);
  float dn = (layeredNoise(frag * 0.15) - 0.5) * 0.0015 * s;
  return clamp(s + dn, 0.0, 1.0);
}

vec2 rot2(vec2 v, float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c) * v;
}

float bendAngle(vec3 q, float t) {
  return 0.8 * sin(q.x * 0.55 + t * 0.6) + 0.7 * sin(q.y * 0.50 - t * 0.5) + 0.6 * sin(q.z * 0.60 + t * 0.7);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  float t = uPhase;
  float jitterAmp = 0.1 * clamp(uNoiseAmount, 0.0, 1.0);
  vec2 centered = 2.0 * (frag - uOffset) - uResolution;
  vec3 dir = normalize(vec3(centered, uResolution.y * max(uZoom, 1e-3)));
  float marchT = 0.0;
  vec3 col = vec3(0.0);
  float n = layeredNoise(frag);
  float amp = clamp(uDistort, 0.0, 50.0) * 0.15;
  float edge = 0.5 - 0.35 * (uRayWidth - 1.0);
  mat2 twist = mat2(1.0);
  if (uTwist != 0.0) {
    float a = uTwist * length(centered) / uResolution.y;
    float c = cos(a);
    float s = sin(a);
    twist = mat2(c, s, -s, c);
  }

  for (int i = 0; i < 44; ++i) {
    vec3 P = marchT * dir;
    P.z -= 2.0;
    float rad = length(P);
    vec3 Pl = P * (10.0 / max(rad, 1e-6));
    if (uTwist != 0.0) Pl.xy = twist * Pl.xy;
    Pl = uOrient * Pl;

    float stepLen = min(rad - 0.3, n * jitterAmp) + 0.1;

    vec3 Pb = Pl;
    if (amp > 0.0) {
      float grow = smoothstep(0.35, 3.0, marchT);
      float a1 = amp * grow * bendAngle(Pl * 0.6, t);
      float a2 = 0.5 * amp * grow * bendAngle(Pl.zyx * 0.5 + 3.1, t * 0.9);
      Pb.xz = rot2(Pb.xz, a1);
      Pb.xy = rot2(Pb.xy, a2);
    }

    float rayPattern = smoothstep(
      edge,
      edge + 0.2,
      sin(Pb.x + cos(Pb.y) * cos(Pb.z)) * sin(Pb.z + sin(Pb.y) * cos(Pb.x + t))
    );

    if (uRayCount > 0) {
      float ang = atan(Pb.y, Pb.x);
      float comb = 0.5 + 0.5 * cos(float(uRayCount) * ang);
      comb = pow(comb, 3.0);
      rayPattern *= smoothstep(0.15, 0.95, comb);
    }

    float depth = marchT - uFlow;
    vec3 spectral;
    if (uColorCount > 0) {
      float saw = fract(depth * 0.25);
      float tRay = saw * saw * (3.0 - 2.0 * saw);
      spectral = 2.0 * texture(uGradient, vec2(clamp(tRay, 0.0, 1.0), 0.5)).rgb;
    } else {
      spectral = 1.0 + cos(depth * 3.0 + vec3(0.0, 1.0, 2.0));
    }

    col += (0.05 / (0.4 + stepLen)) * smoothstep(5.0, 0.0, rad) * spectral * rayPattern;
    marchT += stepLen;
  }

  col *= edgeFade(frag, uResolution, uOffset);
  col *= uIntensity;

  float unit = 0.5 * min(uResolution.x, uResolution.y);
  float radius = length(frag - 0.5 * uResolution - uOffset) / unit;
  float lift = 1.0;
  for (int k = 0; k < 4; k++) {
    vec4 pulse = uPulses[k];
    if (pulse.y <= 0.0) continue;
    float d = (radius - pulse.x) / pulse.z;
    lift += pulse.y * exp(-d * d) + pulse.w;
  }
  if (uPointer.z > 0.0) {
    vec2 m = (frag - uPointer.xy) / unit;
    lift += uPointer.z * exp(-dot(m, m) / max(uPointer.w * uPointer.w, 1e-4));
  }
  if (uIntro.z > 0.0) {
    vec2 toC = frag - 0.5 * uResolution - uOffset;
    float ang = atan(toC.y, toC.x);
    float streak = 0.5 + 0.22 * sin(ang * 5.0 + 1.3) + 0.16 * sin(ang * 13.0 + 4.1) + 0.12 * sin(ang * 29.0 + 2.2);
    float front = uIntro.x * (0.7 + 0.3 * streak);
    float d = (radius - front) / 0.2;
    lift += uIntro.y * exp(-d * d);
    lift *= smoothstep(front, front - 0.5, radius);
  }

  outColor = vec4(col * lift * uEncode, 1.0);
}`,gt=`#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec2 uTarget;
uniform vec2 uTexel;
uniform float uLimit;
out vec4 outColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uTarget;
  vec3 color = texture(uSource, uv - uTexel).rgb;
  color += texture(uSource, uv + uTexel).rgb;
  color += texture(uSource, uv + vec2(uTexel.x, -uTexel.y)).rgb;
  color += texture(uSource, uv + vec2(-uTexel.x, uTexel.y)).rgb;
  outColor = vec4(min(color * 0.25, vec3(uLimit)), 1.0);
}`,pt=`#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec2 uTarget;
uniform vec2 uStep;
out vec4 outColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uTarget;
  vec3 color = texture(uSource, uv).rgb * 0.181862;
  color += (texture(uSource, uv + uStep * 1.423135).rgb + texture(uSource, uv - uStep * 1.423135).rgb) * 0.284316;
  color += (texture(uSource, uv + uStep * 3.326702).rgb + texture(uSource, uv - uStep * 3.326702).rgb) * 0.106598;
  color += (texture(uSource, uv + uStep * 5.242989).rgb + texture(uSource, uv - uStep * 5.242989).rgb) * 0.018156;
  outColor = vec4(color, 1.0);
}`,Et=`#version 300 es
precision highp float;
uniform sampler2D uScene;
uniform vec2 uSceneSize;
uniform sampler2D uBloom0;
uniform sampler2D uBloom1;
uniform sampler2D uBloom2;
uniform sampler2D uBloom3;
uniform vec2 uView;
uniform float uExact;
uniform float uDecode;
uniform float uBloom;
uniform float uFade;
uniform float uLightMode;
out vec4 outColor;

vec3 tap(vec2 uv) {
  return textureLod(uScene, uv, 0.0).rgb;
}

vec3 bicubic(vec2 uv) {
  vec2 position = uv * uSceneSize;
  vec2 center = floor(position - 0.5) + 0.5;
  vec2 f = position - center;
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));
  vec2 w3 = f * f * (-0.5 + 0.5 * f);
  vec2 w12 = w1 + w2;
  vec2 t0 = (center - 1.0) / uSceneSize;
  vec2 t3 = (center + 2.0) / uSceneSize;
  vec2 t12 = (center + w2 / w12) / uSceneSize;
  vec3 result = tap(vec2(t0.x, t0.y)) * w0.x * w0.y;
  result += tap(vec2(t12.x, t0.y)) * w12.x * w0.y;
  result += tap(vec2(t3.x, t0.y)) * w3.x * w0.y;
  result += tap(vec2(t0.x, t12.y)) * w0.x * w12.y;
  result += tap(vec2(t12.x, t12.y)) * w12.x * w12.y;
  result += tap(vec2(t3.x, t12.y)) * w3.x * w12.y;
  result += tap(vec2(t0.x, t3.y)) * w0.x * w3.y;
  result += tap(vec2(t12.x, t3.y)) * w12.x * w3.y;
  result += tap(vec2(t3.x, t3.y)) * w3.x * w3.y;
  return max(result, 0.0);
}

float smootherstep01(float t) {
  t = clamp(t, 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uView;
  vec3 col = uExact > 0.5 ? texelFetch(uScene, ivec2(gl_FragCoord.xy), 0).rgb : bicubic(uv);
  if (uBloom > 0.0) {
    vec3 halo = texture(uBloom0, uv).rgb * 0.42;
    halo += texture(uBloom1, uv).rgb * 0.3;
    halo += texture(uBloom2, uv).rgb * 0.18;
    halo += texture(uBloom3, uv).rgb * 0.1;
    col += halo * uBloom * (uLightMode > 0.5 ? 0.25 : 1.0);
  }
  col = clamp(col * uDecode, 0.0, 1.0);

  float mask = 1.0;
  float edge = uFade * 0.5;
  if (edge > 0.0) {
    mask *= smootherstep01(uv.x / edge) * smootherstep01((1.0 - uv.x) / edge);
    mask *= smootherstep01(uv.y / edge) * smootherstep01((1.0 - uv.y) / edge);
  }

  if (uLightMode > 0.5) {
    float energy = max(max(col.r, col.g), col.b);
    vec3 hue = col / max(energy, 0.0001);
    float neutral = min(hue.r, min(hue.g, hue.b));
    hue = max(hue - vec3(neutral * 0.68), vec3(0.0));
    hue /= max(max(hue.r, max(hue.g, hue.b)), 0.0001);
    vec3 pigment = mix(hue, hue * hue, 0.24) * 0.64;
    float coverage = smoothstep(0.001, 0.32, energy);
    coverage = pow(coverage, 0.72) * 0.92 * mask;
    outColor = vec4(pigment * coverage, coverage);
  } else {
    col *= mask;
    outColor = vec4(col, max(col.r, max(col.g, col.b)));
  }
}`,ke={low:.35,medium:.5,high:.7},Be=.2,wt=2.4,Oe=1.5,ze={rotate:0,rotate3d:1,hover:2},S=(r,u,c)=>Math.min(c,Math.max(u,r)),Ge=r=>{if(r==null)return 0;if(typeof r=="number")return r;const u=parseFloat(String(r).trim().replace("px",""));return Number.isNaN(u)?0:u},fe=r=>{const u=Math.cos(r),c=Math.sin(r);return[1,0,0,0,u,-c,0,c,u]},le=r=>{const u=Math.cos(r),c=Math.sin(r);return[u,0,c,0,1,0,-c,0,u]},Tt=r=>{const u=Math.cos(r),c=Math.sin(r);return[u,-c,0,c,u,0,0,0,1]},q=(r,u)=>{const c=new Float32Array(9);for(let m=0;m<3;m++)for(let f=0;f<3;f++)c[m*3+f]=r[f]*u[m*3]+r[3+f]*u[m*3+1]+r[6+f]*u[m*3+2];return c},qe=(r,u,c)=>{const m=r.createShader(u);return m?(r.shaderSource(m,c),r.compileShader(m),r.getShaderParameter(m,r.COMPILE_STATUS)?m:(r.deleteShader(m),null)):null},j=(r,u)=>{const c=qe(r,r.VERTEX_SHADER,vt),m=qe(r,r.FRAGMENT_SHADER,u),f=r.createProgram();if(!c||!m||!f)return null;if(r.attachShader(f,c),r.attachShader(f,m),r.bindAttribLocation(f,0,"aPosition"),r.linkProgram(f),r.deleteShader(c),r.deleteShader(m),!r.getProgramParameter(f,r.LINK_STATUS))return r.deleteProgram(f),null;const Y={},Z=r.getProgramParameter(f,r.ACTIVE_UNIFORMS);for(let N=0;N<Z;N++){const k=r.getActiveUniform(f,N);k&&(Y[k.name.replace(/\[0\]$/,"")]=r.getUniformLocation(f,k.name))}return{program:f,uniforms:Y}},Rt=({colors:r,intensity:u=2,speed:c=.5,animationType:m="rotate3d",distort:f=0,rayCount:Y=0,rayWidth:Z=1,zoom:N=1,twist:k=0,flow:Ye=0,centerFade:We=1,grain:Ve=.8,glow:He=0,offset:me,mouseInteraction:je=!0,mouseStrength:Ze=.5,hoverDampness:$e=.25,clickBurst:Ke=!0,intro:Qe=!0,fade:Je=0,quality:et="high",resolution:tt,lightMode:ot=!1,mixBlendMode:$,paused:rt=!1,dpr:nt,className:he="",style:it})=>{const de=D.useRef(null),ve=D.useRef(null),K=D.useRef(null),P=D.useRef(null),[at,ut]=D.useState(0);return P.current={colors:Array.isArray(r)?r.slice(0,64).map(String):[],intensity:Math.max(0,u),speed:c,animation:ze[m]??ze.rotate3d,distort:Math.max(0,f),rayCount:Math.max(0,Math.floor(Y??0)),rayWidth:S(Z,.2,2.5),zoom:Math.max(.05,N),twist:k,flow:Ye,centerFade:S(We,.5,3),grain:S(Ve,.3,1),glow:Math.max(0,He),offsetX:Ge(me?.x),offsetY:Ge(me?.y),mouseInteraction:je,mouseStrength:Math.max(0,Ze),hoverDampness:S($e,0,1),clickBurst:Ke,intro:Qe,fade:S(Je,0,1),scale:S(tt??ke[et]??ke.high,Be,1),lightMode:ot,paused:rt,dpr:nt},D.useEffect(()=>{const p=de.current,v=ve.current,e=v?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!p||!v||!e)return;const xe=!!e.getExtension("EXT_color_buffer_float"),Q=j(e,xt),J=j(e,gt),W=j(e,pt),ee=j(e,Et);if(!Q||!J||!W||!ee)return;const ge=t=>{t.preventDefault()},pe=()=>ut(t=>t+1);v.addEventListener("webglcontextlost",ge),v.addEventListener("webglcontextrestored",pe);const Ee=e.createBuffer(),te=e.createVertexArray();e.bindVertexArray(te),e.bindBuffer(e.ARRAY_BUFFER,Ee),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const st=xe?e.RGBA16F:e.RGBA8,oe=xe?1:.25,re=()=>({texture:null,framebuffer:e.createFramebuffer(),width:0,height:0}),B=re(),V=Array.from({length:Ue},()=>[re(),re()]),ne=(t,n,i)=>{t.texture&&t.width===n&&t.height===i||(t.texture&&e.deleteTexture(t.texture),t.texture=e.createTexture(),t.width=n,t.height=i,e.bindTexture(e.TEXTURE_2D,t.texture),e.texStorage2D(e.TEXTURE_2D,1,st,n,i),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindFramebuffer(e.FRAMEBUFFER,t.framebuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t.texture,0))},O=(t,n)=>(e.bindFramebuffer(e.FRAMEBUFFER,t?t.framebuffer:null),e.viewport(0,0,t?t.width:v.width,t?t.height:v.height),e.useProgram(n.program),n.uniforms),A=(t,n)=>{e.activeTexture(e.TEXTURE0+t),e.bindTexture(e.TEXTURE_2D,n)},ie=e.createTexture();let we=null;const I=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),ct=t=>{if(!I)return[255,255,255];I.clearRect(0,0,1,1),I.fillStyle="#ffffff",I.fillStyle=t,I.fillRect(0,0,1,1);const[n,i,h]=I.getImageData(0,0,1,1).data;return[n,i,h]},ft=t=>{const n=t.join("|");if(n===we)return;we=n;const i=Math.max(1,t.length),h=new Uint8Array(i*4).fill(255);t.forEach((y,R)=>h.set(ct(y),R*4)),e.bindTexture(e.TEXTURE_2D,ie),e.pixelStorei(e.UNPACK_ALIGNMENT,1),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,i,1,0,e.RGBA,e.UNSIGNED_BYTE,h),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)},z=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,d={x:0,y:0,inside:!1},o={time:0,phase:0,flow:0,kick:0,intro:P.current.intro&&!z?0:1,hoverX:.5,hoverY:.5,smoothX:0,smoothY:0,touch:0,governor:1,slow:0,quick:0},T=[],ae=new Float32Array(Ne*4);let _=0,M=0,H=!0;const ue=()=>{const t=P.current,n=v.width,i=v.height,h=Math.max(1,p.clientWidth),y=Math.max(1,p.clientHeight),R=Math.max(Be,t.scale*o.governor),E=Math.max(1,Math.round(n*R)),x=Math.max(1,Math.round(i*R)),ce=E===n&&x===i;e.bindVertexArray(te),ne(B,E,x),V.forEach((a,s)=>{const w=Math.max(1,Math.round(h/2**(s+1))),C=Math.max(1,Math.round(y/2**(s+1)));ne(a[0],w,C),ne(a[1],w,C)}),ft(t.colors);const g=E/h,X=t.mouseInteraction?o.touch:0,Le=h>0?o.smoothX/h*2-1:0,Ce=y>0?o.smoothY/y*2-1:0,Fe=.06*t.mouseStrength*X*Math.min(E,x)*.5,De=t.offsetX*g+Le*Fe,Ie=t.offsetY*g-Ce*Fe,G=o.phase;let U;if(t.animation===0){const a=G*.2,s=Math.cos(a);U=[s,0,Math.cos(a+11),0,1,0,Math.cos(a+33),0,s]}else if(t.animation===1)U=q(q(Tt(G*.17),le(G*.21)),fe(G*.31));else{const a=o.hoverX*2-1,s=o.hoverY*2-1;U=q(le(a*.6),fe(s*.6))}if(t.animation!==2&&X>0){const a=.3*t.mouseStrength*X;U=q(U,q(le(Le*a),fe(Ce*a)))}ae.fill(0),T.forEach((a,s)=>{const w=a.age/Oe;ae.set([a.age*1.7,1.6*Math.pow(1-w,1.6),.2+a.age*.16,.35*Math.exp(-a.age*7)],s*4)});const mt=.5*Math.min(E,x),ht=Math.hypot(E*.5+Math.abs(De),x*.5+Math.abs(Ie))/Math.max(mt,1),dt=1-Math.pow(1-o.intro,3),l=O(B,Q);if(A(0,ie),e.uniform1i(l.uGradient,0),e.uniform2f(l.uResolution,E,x),e.uniform1f(l.uTime,o.time),e.uniform1f(l.uPhase,G),e.uniform1f(l.uIntensity,t.intensity),e.uniformMatrix3fv(l.uOrient,!1,U),e.uniform1i(l.uColorCount,t.colors.length),e.uniform1f(l.uDistort,t.distort),e.uniform2f(l.uOffset,De,Ie),e.uniform1f(l.uNoiseAmount,t.grain),e.uniform1i(l.uRayCount,t.rayCount),e.uniform1f(l.uZoom,t.zoom),e.uniform1f(l.uRayWidth,t.rayWidth),e.uniform1f(l.uTwist,t.twist),e.uniform1f(l.uFlow,o.flow),e.uniform1f(l.uCenterFade,t.centerFade*Math.max(1,t.zoom)),e.uniform4f(l.uPointer,o.smoothX*g,(y-o.smoothY)*g,t.mouseInteraction?.7*t.mouseStrength*X:0,.45),e.uniform4fv(l.uPulses,ae),e.uniform3f(l.uIntro,dt*(ht+.6)/.7,1.6*(1-o.intro),o.intro<1?1:0),e.uniform1f(l.uEncode,oe),e.drawArrays(e.TRIANGLES,0,3),t.glow>0){let a=B;V.forEach(([s,w])=>{const C=O(s,J);A(0,a.texture),e.uniform1i(C.uSource,0),e.uniform2f(C.uTarget,s.width,s.height),e.uniform2f(C.uTexel,1/a.width,1/a.height),e.uniform1f(C.uLimit,3*oe),e.drawArrays(e.TRIANGLES,0,3);let F=O(w,W);A(0,s.texture),e.uniform1i(F.uSource,0),e.uniform2f(F.uTarget,w.width,w.height),e.uniform2f(F.uStep,1/s.width,0),e.drawArrays(e.TRIANGLES,0,3),F=O(s,W),A(0,w.texture),e.uniform1i(F.uSource,0),e.uniform2f(F.uTarget,s.width,s.height),e.uniform2f(F.uStep,0,1/w.height),e.drawArrays(e.TRIANGLES,0,3),a=s})}const b=O(null,ee);A(0,B.texture),e.uniform1i(b.uScene,0),V.forEach(([a],s)=>{A(s+1,a.texture),e.uniform1i(b[`uBloom${s}`],s+1)}),e.uniform2f(b.uSceneSize,E,x),e.uniform2f(b.uView,n,i),e.uniform1f(b.uExact,ce?1:0),e.uniform1f(b.uDecode,1/oe),e.uniform1f(b.uBloom,t.glow),e.uniform1f(b.uFade,t.fade),e.uniform1f(b.uLightMode,t.lightMode?1:0),e.drawArrays(e.TRIANGLES,0,3);for(let a=Ue;a>=0;a--)A(a,null)},lt=t=>{t>1/40?(o.slow+=1,o.quick=0):t<1/55&&(o.quick+=1,o.slow=0),o.slow>20?(o.governor=Math.max(.5,o.governor*.85),o.slow=0):o.quick>180&&o.governor<1&&(o.governor=Math.min(1,o.governor*1.1),o.quick=0)},Te=t=>{if(_=0,!H||document.hidden)return;const n=P.current,i=M?Math.min(.05,(t-M)/1e3):1/60;M&&lt((t-M)/1e3),M=t,!n.intro||z?o.intro=1:o.intro<1&&(o.intro=Math.min(1,o.intro+i/wt));const h=3*Math.pow(1-o.intro,2),y=!n.paused&&!z;y&&(o.time+=i,o.phase+=i*n.speed*(1+h)+o.kick*i,o.flow+=i*n.flow*1.2),o.kick*=Math.exp(-i*3.5),o.kick<.001&&(o.kick=0);const R=n.mouseInteraction&&d.inside&&!z,E=.02+n.hoverDampness*.5,x=1-Math.exp(-i/E);if(R&&o.touch<.01&&(o.smoothX=d.x,o.smoothY=d.y),o.smoothX+=(d.x-o.smoothX)*x,o.smoothY+=(d.y-o.smoothY)*x,o.touch+=((R?1:0)-o.touch)*(1-Math.exp(-i*(R?5:2.5))),n.animation===2&&d.inside){const g=Math.max(1,p.clientWidth),X=Math.max(1,p.clientHeight);o.hoverX+=(S(d.x/g,0,1)-o.hoverX)*x,o.hoverY+=(S(d.y/X,0,1)-o.hoverY)*x}for(let g=T.length-1;g>=0;g--)T[g].age+=i,T[g].age>Oe&&T.splice(g,1);ue();const ce=o.intro<1||T.length>0||o.kick>0||Math.abs((R?1:0)-o.touch)>.002||Math.abs(d.x-o.smoothX)+Math.abs(d.y-o.smoothY)>.2;y&&(n.speed!==0||n.grain>0||n.flow!==0)||ce?_=requestAnimationFrame(Te):M=0},L=()=>{!_&&H&&!document.hidden&&(_=requestAnimationFrame(Te))},se=()=>{const t=P.current,n=Math.max(1,p.clientWidth),i=Math.max(1,p.clientHeight),h=Math.min(t.dpr||window.devicePixelRatio||1,2);v.width=Math.max(1,Math.round(n*h)),v.height=Math.max(1,Math.round(i*h)),_||ue(),L()},ye=t=>{const n=p.getBoundingClientRect(),i=t.clientX-n.left,h=t.clientY-n.top;return{x:i,y:h,inside:i>=0&&h>=0&&i<=n.width&&h<=n.height}},Re=t=>{const n=ye(t);d.x=n.x,d.y=n.y,d.inside=n.inside,L()},be=t=>{const n=ye(t);if(!n.inside)return;d.x=n.x,d.y=n.y,d.inside=!0;const i=P.current;i.mouseInteraction&&i.clickBurst&&!z&&(T.length>=Ne&&T.shift(),T.push({age:0}),o.kick=Math.min(5,o.kick+2.4)),L()},Pe=()=>{d.inside=!1,L()},Me=()=>{M=0,L()},Se=new ResizeObserver(se);Se.observe(p);const Ae=new IntersectionObserver(t=>{H=t.some(n=>n.isIntersecting),H&&(M=0,L())});Ae.observe(p),window.addEventListener("pointermove",Re,{passive:!0}),window.addEventListener("pointerdown",be,{passive:!0}),document.documentElement.addEventListener("pointerleave",Pe),document.addEventListener("visibilitychange",Me),se();let _e=P.current.dpr;return K.current=()=>{const t=P.current;if(t.dpr!==_e){_e=t.dpr,se();return}_||ue(),L()},()=>{cancelAnimationFrame(_),K.current=null,v.removeEventListener("webglcontextlost",ge),v.removeEventListener("webglcontextrestored",pe),Se.disconnect(),Ae.disconnect(),window.removeEventListener("pointermove",Re),window.removeEventListener("pointerdown",be),document.documentElement.removeEventListener("pointerleave",Pe),document.removeEventListener("visibilitychange",Me),[B,...V.flat()].forEach(t=>{t.texture&&e.deleteTexture(t.texture),e.deleteFramebuffer(t.framebuffer)}),e.deleteTexture(ie),[Q,J,W,ee].forEach(t=>e.deleteProgram(t.program)),e.deleteBuffer(Ee),e.deleteVertexArray(te),e.isContextLost()||e.getExtension("WEBGL_lose_context")?.loseContext()}},[at]),D.useEffect(()=>{K.current?.()}),Xe.jsx("div",{ref:de,className:`prismatic-burst-container${he?` ${he}`:""}`,style:it,children:Xe.jsx("canvas",{ref:ve,className:"prismatic-burst-canvas",style:$&&$!=="none"?{mixBlendMode:$}:void 0,"aria-hidden":"true"})})};export{Rt as default};
