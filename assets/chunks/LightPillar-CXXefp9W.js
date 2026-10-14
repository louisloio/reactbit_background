import{r as b,j as fe}from"../text-animations-CJoAwL_r.js";const ze=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Be=`#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uTarget;
uniform vec2 uRot;
uniform vec2 uPillarRot;
uniform vec2 uWave;
uniform float uShift;
uniform float uPillarWidth;
uniform float uPillarHeight;
uniform int uDetail;
uniform vec3 uTopColor;
uniform vec3 uBottomColor;
uniform float uGlowAmount;
uniform float uWidthNorm;
out vec4 outColor;

void main() {
  vec2 vUv = gl_FragCoord.xy / uTarget;
  vec2 uv = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
  uv.x -= uShift;
  uv = vec2(uPillarRot.x * uv.x - uPillarRot.y * uv.y, uPillarRot.y * uv.x + uPillarRot.x * uv.y);

  vec3 ro = vec3(0.0, 0.0, -10.0);
  vec3 rd = normalize(vec3(uv, 1.0));
  vec3 origin = vec3(uRot.x * ro.x - uRot.y * ro.z, ro.y, uRot.y * ro.x + uRot.x * ro.z);
  vec3 dir = vec3(uRot.x * rd.x - uRot.y * rd.z, rd.y, uRot.y * rd.x + uRot.x * rd.z);

  float glow = 0.0;
  float lift = 0.0;
  float t = 0.1;
  for (int i = 0; i < 80; i++) {
    vec3 p = origin + dir * t;
    vec3 q = p;
    q.y = p.y * uPillarHeight + uTime;

    float freq = 1.0;
    float amp = 1.0;
    for (int j = 0; j < 6; j++) {
      if (j >= uDetail) break;
      q.xz = vec2(uWave.y * q.x - uWave.x * q.z, uWave.x * q.x + uWave.y * q.z);
      q += cos(q.zxy * freq - uTime * float(j) * 2.0) * amp;
      freq *= 2.0;
      amp *= 0.5;
    }

    float d = length(cos(q.xz)) - 0.2;
    float bound = length(p.xz) - uPillarWidth;
    float h = max(4.0 - abs(d - bound), 0.0);
    d = max(d, bound) + h * h * 0.015625;
    d = abs(d) * 0.15 + 0.01;

    float weight = 1.0 / d;
    glow += weight;
    lift += clamp((15.0 - p.y) / 30.0, 0.0, 1.0) * weight;

    t += d;
    if (t > 50.0) break;
  }

  vec3 col = tanh((uBottomColor * glow + (uTopColor - uBottomColor) * lift) * uGlowAmount / uWidthNorm);
  float peak = max(col.r, max(col.g, col.b));
  outColor = vec4(col, smoothstep(0.62, 1.0, peak));
}`,We=`#version 300 es
precision highp float;
uniform sampler2D uField;
uniform vec2 uFieldSize;
uniform vec2 uView;
uniform vec2 uAspect;
uniform vec2 uPillarRot;
uniform float uShift;
uniform float uIntensity;
uniform float uNoiseIntensity;
uniform float uLightMode;
uniform float uNeutral;
uniform float uBloom;
uniform float uFade;
uniform float uReveal;
uniform float uFlare;
uniform vec4 uPulses[3];
out vec4 outColor;

vec3 tap(vec2 uv) {
  return textureLod(uField, uv, 0.0).rgb;
}

vec3 bicubic(vec2 uv) {
  vec2 position = uv * uFieldSize;
  vec2 center = floor(position - 0.5) + 0.5;
  vec2 f = position - center;
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));
  vec2 w3 = f * f * (-0.5 + 0.5 * f);
  vec2 w12 = w1 + w2;
  vec2 t0 = (center - 1.0) / uFieldSize;
  vec2 t3 = (center + 2.0) / uFieldSize;
  vec2 t12 = (center + w2 / w12) / uFieldSize;
  vec3 result = vec3(0.0);
  result += tap(vec2(t0.x, t0.y)) * w0.x * w0.y;
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
  vec3 col = bicubic(uv);

  if (uBloom > 0.0) {
    vec4 l3 = textureLod(uField, uv, 3.0);
    vec4 l4 = textureLod(uField, uv, 4.0);
    vec4 l5 = textureLod(uField, uv, 5.0);
    vec4 l6 = textureLod(uField, uv, 6.0);
    float halo = l3.a * 0.3 + l4.a * 0.3 + l5.a * 0.25 + l6.a * 0.15;
    vec3 tint = l4.rgb + l5.rgb;
    tint /= max(max(tint.r, max(tint.g, tint.b)), 0.001);
    vec3 glow = clamp(tint * halo * uBloom * 1.1, 0.0, 1.0);
    col = 1.0 - (1.0 - clamp(col, 0.0, 1.0)) * (1.0 - glow);
  }

  vec2 p = (uv * 2.0 - 1.0) * uAspect;
  p.x -= uShift;
  float axis = uPillarRot.y * p.x + uPillarRot.x * p.y;

  float boost = 0.0;
  for (int i = 0; i < 3; i++) {
    vec4 pulse = uPulses[i];
    if (pulse.y <= 0.0) continue;
    float offset = (axis - pulse.x) / 0.24;
    boost += exp(-offset * offset) * pulse.y;
  }
  float head = (axis - uReveal + 0.35) / 0.3;
  boost += exp(-head * head) * uFlare;
  float lum = max(col.r, max(col.g, col.b));
  col += mix(col, vec3(lum), 0.45) * boost * 1.8;

  col -= fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) / 15.0 * uNoiseIntensity;
  vec3 result = clamp(col * uIntensity, 0.0, 1.0);

  float mask = smoothstep(uReveal, uReveal - 0.9, axis);
  float edge = uFade * 0.5;
  if (edge > 0.0) {
    mask *= smootherstep01(uv.x / edge) * smootherstep01((1.0 - uv.x) / edge);
    mask *= smootherstep01(uv.y / edge) * smootherstep01((1.0 - uv.y) / edge);
  }

  if (uLightMode > 0.5) {
    float energy = max(result.r, max(result.g, result.b));
    vec3 hue = result / max(energy, 0.001);
    float coverage = smoothstep(0.025, 0.95, energy);
    hue = pow(clamp(hue, 0.0, 1.0), vec3(1.25));
    vec3 tinted = mix(vec3(1.0), hue, coverage * 0.94 * mask);
    vec3 ink = vec3(1.0) - pow(result, vec3(1.6)) * 0.85 * mask;
    result = mix(tinted, ink, uNeutral);
  } else {
    result *= mask;
  }
  outColor = vec4(result, 1.0);
}`,me={low:.35,medium:.5,high:.6},Xe=2.1,he=1.4,de=.25,B=(i,y,v)=>Math.min(v,Math.max(y,i)),Oe=i=>1-Math.pow(1-i,3),Ge=i=>i*i*i*(i*(i*6-15)+10),ve=(i,y,v)=>{const f=i.createShader(y);return f?(i.shaderSource(f,v),i.compileShader(f),i.getShaderParameter(f,i.COMPILE_STATUS)?f:(i.deleteShader(f),null)):null},xe=(i,y)=>{const v=ve(i,i.VERTEX_SHADER,ze),f=ve(i,i.FRAGMENT_SHADER,y),c=i.createProgram();if(!v||!f||!c)return null;if(i.attachShader(c,v),i.attachShader(c,f),i.bindAttribLocation(c,0,"aPosition"),i.linkProgram(c),i.deleteShader(v),i.deleteShader(f),!i.getProgramParameter(c,i.LINK_STATUS))return i.deleteProgram(c),null;const U={},W=i.getProgramParameter(c,i.ACTIVE_UNIFORMS);for(let _=0;_<W;_++){const L=i.getActiveUniform(c,_);L&&(U[L.name.replace(/\[0\]$/,"")]=i.getUniformLocation(c,L.name))}return{program:c,uniforms:U}},He=({topColor:i="#5227FF",bottomColor:y="#FF9FFC",intensity:v=1,rotationSpeed:f=.3,flow:c=1,interactive:U=!0,clickPulse:W=!0,glowAmount:_=.002,bloom:L=.5,pillarWidth:pe=3,pillarHeight:ge=.4,pillarRotation:we=25,twist:Re=.4,detail:Ee=4,noiseIntensity:ye=.5,fade:Te=0,intro:Me=!0,mixBlendMode:be="screen",quality:Fe="high",resolution:Ae,lightMode:Pe=!1,paused:Se=!1,className:Y="",style:_e})=>{const $=b.useRef(null),K=b.useRef(null),X=b.useRef(null),C=b.useRef(null),[Le,Ce]=b.useState(0);return C.current={topColor:String(i),bottomColor:String(y),intensity:Math.max(0,v),rotationSpeed:f,flow:c,interactive:U,clickPulse:W,glowAmount:Math.max(0,_),bloom:Math.max(0,L),pillarWidth:Math.max(.05,pe),pillarHeight:ge,pillarRotation:we,twist:Re,detail:Math.round(B(Ee,1,6)),noiseIntensity:Math.max(0,ye),fade:B(Te,0,1),intro:Me,scale:B(Ae??me[Fe]??me.high,de,2),lightMode:Pe,paused:Se},b.useEffect(()=>{const F=$.current,m=K.current,e=m?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!F||!m||!e)return;const Ie=!!e.getExtension("EXT_color_buffer_float"),D=xe(e,Be),k=xe(e,We);if(!D||!k)return;const Q=t=>{t.preventDefault()},J=()=>Ce(t=>t+1);m.addEventListener("webglcontextlost",Q),m.addEventListener("webglcontextrestored",J);const Z=e.createBuffer(),O=e.createVertexArray();e.bindVertexArray(O),e.bindBuffer(e.ARRAY_BUFFER,Z),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);let x=null;const G=e.createFramebuffer(),h={width:0,height:0},Ue=(t,r)=>{if(h.width===t&&h.height===r)return;h.width=t,h.height=r,x&&e.deleteTexture(x),x=e.createTexture(),e.bindTexture(e.TEXTURE_2D,x);const n=Math.floor(Math.log2(Math.max(t,r)))+1;e.texStorage2D(e.TEXTURE_2D,n,Ie?e.RGBA16F:e.RGBA8,t,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindFramebuffer(e.FRAMEBUFFER,G),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,x,0)},A=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),V=new Map,N=t=>{if(V.has(t))return V.get(t);let r=[1,1,1];if(A){A.clearRect(0,0,1,1),A.fillStyle="#ffffff",A.fillStyle=t,A.fillRect(0,0,1,1);const[n,s,g]=A.getImageData(0,0,1,1).data;r=[n/255,s/255,g/255]}return V.set(t,r),r},I=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,a={width:1,height:1,ratio:1},P={x:0,y:0,inside:!1},p=[],H=new Float32Array(12),o={clock:0,intro:C.current.intro&&!I?0:1,touch:0,spin:0,lean:0,shift:0,governor:1,slow:0,quick:0};let T=0,w=0,q=!0;const De=(t,r,n)=>{const s=a.width/a.height,g=(t/a.width*2-1)*s-o.shift,d=1-r/a.height*2;return Math.sin(n)*g+Math.cos(n)*d},j=()=>{const t=C.current,r=Math.max(de,t.scale*o.governor),n=Math.max(1,Math.round(a.width*r)),s=Math.max(1,Math.round(a.height*r));Ue(n,s);const g=Ge(o.intro),d=Oe(o.intro),R=(t.pillarRotation+o.lean)*Math.PI/180,z=o.clock*.3+o.spin,E=t.pillarWidth*(.3+.7*g);e.bindVertexArray(O);const l=D.uniforms;e.bindFramebuffer(e.FRAMEBUFFER,G),e.viewport(0,0,h.width,h.height),e.useProgram(D.program),e.uniform1f(l.uTime,o.clock*t.flow),e.uniform2f(l.uResolution,a.width,a.height),e.uniform2f(l.uTarget,h.width,h.height),e.uniform2f(l.uRot,Math.cos(z),Math.sin(z)),e.uniform2f(l.uPillarRot,Math.cos(R),Math.sin(R)),e.uniform2f(l.uWave,Math.sin(t.twist),Math.cos(t.twist)),e.uniform1f(l.uShift,o.shift),e.uniform1f(l.uPillarWidth,E),e.uniform1f(l.uPillarHeight,t.pillarHeight),e.uniform1i(l.uDetail,t.detail),e.uniform3fv(l.uTopColor,N(t.topColor)),e.uniform3fv(l.uBottomColor,N(t.bottomColor)),e.uniform1f(l.uGlowAmount,t.glowAmount),e.uniform1f(l.uWidthNorm,E/3),e.drawArrays(e.TRIANGLES,0,3),e.bindTexture(e.TEXTURE_2D,x),t.bloom>0&&e.generateMipmap(e.TEXTURE_2D),H.fill(0),p.forEach((S,qe)=>{H.set([S.axis+S.age*1.7,Math.exp(-S.age/(he*.45)),0,0],qe*4)});const u=k.uniforms;e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,m.width,m.height),e.useProgram(k.program),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,x),e.uniform1i(u.uField,0),e.uniform2f(u.uFieldSize,h.width,h.height),e.uniform2f(u.uView,m.width,m.height),e.uniform2f(u.uAspect,a.width/a.height,1),e.uniform2f(u.uPillarRot,Math.cos(R),Math.sin(R)),e.uniform1f(u.uShift,o.shift),e.uniform1f(u.uIntensity,t.intensity*(.15+.85*d)*(1+.12*o.touch)),e.uniform1f(u.uNoiseIntensity,t.noiseIntensity),e.uniform1f(u.uLightMode,t.lightMode?1:0);const le=S=>Math.max(...S)-Math.min(...S),Ne=Math.max(le(N(t.topColor)),le(N(t.bottomColor)));e.uniform1f(u.uNeutral,1-B((Ne-.08)/.12,0,1)),e.uniform1f(u.uBloom,t.bloom),e.uniform1f(u.uFade,t.fade);const ce=a.width/a.height+1.2;e.uniform1f(u.uReveal,o.intro>=1?1e4:-ce+d*(ce*2+1.2)),e.uniform1f(u.uFlare,o.intro>=1?0:(1-d)*1.3*Math.min(1,o.intro*8)),e.uniform4fv(u.uPulses,H),e.drawArrays(e.TRIANGLES,0,3)},ke=t=>{t>1/40?(o.slow+=1,o.quick=0):t<1/55&&(o.quick+=1,o.slow=0),o.slow>20?(o.governor=Math.max(.5,o.governor*.85),o.slow=0):o.quick>180&&o.governor<1&&(o.governor=Math.min(1,o.governor*1.1),o.quick=0)},ee=t=>{if(T=0,!q||document.hidden)return;const r=C.current,n=w?Math.min(.05,(t-w)/1e3):1/60;w&&ke((t-w)/1e3),w=t;const s=!r.paused&&!I&&r.rotationSpeed!==0;s&&(o.clock+=n*.96*r.rotationSpeed),!r.intro||I?o.intro=1:o.intro<1&&(o.intro=Math.min(1,o.intro+n/Xe));const g=r.interactive&&P.inside&&!I,d=g?P.x/a.width-.5:0,R=1-Math.exp(-n*2.4);o.spin+=(d*1.4-o.spin)*R,o.lean+=(d*9-o.lean)*R,o.shift+=(d*.35*(a.width/a.height)-o.shift)*R,o.touch+=((g?1:0)-o.touch)*(1-Math.exp(-n*3));for(let E=p.length-1;E>=0;E--)p[E].age+=n,p[E].age>he*2.2&&p.splice(E,1);j();const z=o.intro<1||p.length>0||Math.abs(d*1.4-o.spin)>5e-4||Math.abs((g?1:0)-o.touch)>.002;s||z?T=requestAnimationFrame(ee):w=0},M=()=>{!T&&q&&!document.hidden&&(T=requestAnimationFrame(ee))},te=()=>{const t=Math.max(1,F.clientWidth),r=Math.max(1,F.clientHeight),n=Math.min(window.devicePixelRatio||1,2);a.width=t,a.height=r,a.ratio=n,m.width=Math.max(1,Math.round(t*n)),m.height=Math.max(1,Math.round(r*n)),T||j(),M()},oe=t=>{const r=F.getBoundingClientRect(),n=t.clientX-r.left,s=t.clientY-r.top;return{x:n,y:s,inside:n>=0&&s>=0&&n<=r.width&&s<=r.height}},ie=t=>{const r=oe(t);P.x=r.x,P.y=r.y,P.inside=r.inside,M()},re=t=>{const r=C.current;if(!r.clickPulse||I)return;const n=oe(t);if(!n.inside)return;const s=(r.pillarRotation+o.lean)*Math.PI/180;p.push({axis:De(n.x,n.y,s),age:0}),p.length>3&&p.shift(),M()},ne=()=>{P.inside=!1,M()},ae=()=>{w=0,M()},ue=new ResizeObserver(te);ue.observe(F);const se=new IntersectionObserver(t=>{q=t.some(r=>r.isIntersecting),q&&(w=0,M())});return se.observe(F),window.addEventListener("pointermove",ie,{passive:!0}),window.addEventListener("pointerdown",re,{passive:!0}),document.documentElement.addEventListener("pointerleave",ne),document.addEventListener("visibilitychange",ae),te(),X.current=()=>{T||j(),M()},()=>{cancelAnimationFrame(T),X.current=null,m.removeEventListener("webglcontextlost",Q),m.removeEventListener("webglcontextrestored",J),ue.disconnect(),se.disconnect(),window.removeEventListener("pointermove",ie),window.removeEventListener("pointerdown",re),document.documentElement.removeEventListener("pointerleave",ne),document.removeEventListener("visibilitychange",ae),x&&e.deleteTexture(x),e.deleteFramebuffer(G),e.deleteProgram(D.program),e.deleteProgram(k.program),e.deleteBuffer(Z),e.deleteVertexArray(O),e.isContextLost()||e.getExtension("WEBGL_lose_context")?.loseContext()}},[Le]),b.useEffect(()=>{X.current?.()}),fe.jsx("div",{ref:$,className:`light-pillar-container${Y?` ${Y}`:""}`,style:{mixBlendMode:be,..._e},children:fe.jsx("canvas",{ref:K,className:"light-pillar-canvas","aria-hidden":"true"})})};export{He as default};
