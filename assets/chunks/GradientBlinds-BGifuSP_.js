import{r as b,j as ce}from"../text-animations-CJoAwL_r.js";const P=8,z=4,Oe=1.8,H=1.6,Ne=`#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,Ve=`#version 300 es
precision highp float;
precision highp int;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uMouse;
uniform float uAngle;
uniform float uNoise;
uniform float uBlindCount;
uniform float uSpotlightRadius;
uniform float uSpotlightSoftness;
uniform float uSpotlightOpacity;
uniform float uMirror;
uniform float uDistort;
uniform float uShineFlip;
uniform vec3 uColors[8];
uniform int uColorCount;
uniform float uLightMode;
uniform float uShine;
uniform float uRelief;
uniform float uGlow;
uniform float uSway;
uniform float uSwayTime;
uniform float uHover;
uniform vec4 uWaves[4];
uniform float uIntro;
uniform float uGrainTime;
uniform vec3 uLightColor;
uniform float uPerspective;
uniform float uGradientShift;

out vec4 outColor;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

vec2 rotate2D(vec2 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c) * p;
}

vec2 blindSpace(vec2 uv0) {
  float aspect = uResolution.x / uResolution.y;
  vec2 p = uv0 * 2.0 - 1.0;
  p.x *= aspect;
  vec2 pr = rotate2D(p, uAngle);
  pr.x /= aspect;
  vec2 uv = pr * 0.5 + 0.5;
  if (abs(uPerspective) > 0.001) {
    float k = uPerspective * 2.2;
    uv.x = (exp(k * uv.x) - 1.0) / (exp(k) - 1.0);
  }
  if (uDistort > 0.0) {
    float a = uv.y * 6.0;
    float b = uv.x * 6.0;
    float w = 0.01 * uDistort;
    uv.x += sin(a) * w;
    uv.y += cos(b) * w;
  }
  return uv;
}

vec3 gradientColor(float t) {
  float tt = clamp(t, 0.0, 1.0);
  int count = max(uColorCount, 2);
  float scaled = tt * float(count - 1);
  int seg = min(int(floor(scaled)), count - 2);
  float f = scaled - float(seg);
  if (tt >= 1.0) return uColors[count - 1];
  return mix(uColors[seg], uColors[seg + 1], f);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv0 = frag / uResolution;
  vec2 uvMod = blindSpace(uv0);

  float count = max(uBlindCount, 1.0);
  float stripePhase = uvMod.x * count;
  float pixel = max(fwidth(stripePhase), 1e-5);

  float t = uvMod.x;
  if (uGradientShift != 0.0) {
    t = 1.0 - abs(1.0 - fract((t + uGradientShift) * 0.5) * 2.0);
  }
  if (uMirror > 0.5) {
    t = 1.0 - abs(1.0 - 2.0 * fract(t));
  }
  vec3 base = gradientColor(t);

  vec2 offset = uMouse / uResolution;
  float d = length(uv0 - offset);
  float r = max(uSpotlightRadius, 1e-4);
  float spot = (1.0 - 2.0 * pow(d / r, uSpotlightSoftness)) * uSpotlightOpacity;

  float slat = floor(stripePhase);
  float s = stripePhase - slat;
  float stripeAA = clamp(count * 1.25 / min(uResolution.x, uResolution.y), 0.001, 0.12);
  float edgeBlend = 1.0 - smoothstep(0.0, stripeAA, min(s, 1.0 - s));
  float across = mix(s, 0.5, edgeBlend);
  float ramp = uShineFlip > 0.5 ? 1.0 - across : across;

  float unit = min(uResolution.x, uResolution.y);
  float reach = max(uSpotlightRadius, 0.05) * unit;
  vec2 toLight = uMouse - frag;
  float nearLight = exp(-dot(toLight, toLight) / (reach * reach));

  float tilt = 0.0;
  float pulse = 0.0;
  if (uSway > 0.0) {
    tilt += uSway * 0.5 * sin(uSwayTime * 0.9 + slat * 0.55) * (0.6 + 0.4 * sin(uSwayTime * 0.37 + slat * 0.21));
  }
  tilt += uHover * nearLight * 0.7;
  float aspect = uResolution.x / uResolution.y;
  for (int i = 0; i < 4; i++) {
    vec4 wave = uWaves[i];
    if (wave.w <= 0.0) continue;
    float age = uTime - wave.z;
    if (age < 0.0 || age > ${H.toFixed(2)}) continue;
    float life = age / ${H.toFixed(2)};
    vec2 origin = blindSpace(wave.xy / uResolution);
    float slats = abs(slat + 0.5 - origin.x * count);
    float front = age * max(count, 4.0) * 0.95;
    float k = (slats - front) / (0.8 + life * 1.2);
    float along = (uvMod.y - origin.y) / max(0.42 + life * 0.5, 0.01);
    float fade = (1.0 - life) * (1.0 - life);
    float ring = exp(-k * k) * exp(-along * along) * fade * smoothstep(0.0, 0.2, age);
    tilt += ring * 0.9;
    pulse += ring;
  }
  if (uIntro < 1.0) {
    float settle = smoothstep(0.0, 1.0, clamp(uIntro * 1.5 - uv0.x * 0.5, 0.0, 1.0));
    tilt -= (1.0 - settle) * 1.2;
  }

  float edge = ramp;
  float calm = 1.0 - 0.6 * clamp(spot, 0.0, 1.0);
  ramp = pow(clamp(ramp, 0.0, 1.0), exp(tilt * 0.9));
  ramp *= 1.0 - 0.3 * min(pulse, 1.0) * calm;
  float crease = uRelief * 0.38 * smoothstep(0.62, 1.0, ramp);
  float sheen = uShine * exp(-pow((edge - 0.035) / 0.07, 2.0)) * (0.3 + 0.7 * nearLight) * (1.0 - edgeBlend);

  vec3 lit = spot > 0.0 ? uLightColor * spot : vec3(spot);
  lit += uLightColor * min(pulse, 1.0) * 0.35 * calm;
  vec3 revealSignal = lit + base - vec3(ramp + crease);

  vec3 col;
  if (uLightMode > 0.5) {
    vec3 luma = vec3(0.2126, 0.7152, 0.0722);
    float peak = max(base.r, max(base.g, base.b));
    float low = min(base.r, min(base.g, base.b));
    float chroma = (peak - low) / max(peak, 0.0001);
    vec3 hue = base / max(peak, 0.0001);
    hue = clamp(mix(vec3(dot(hue, luma)), hue, 1.3), 0.0, 1.0);
    hue *= mix(1.0, 0.82, smoothstep(0.55, 0.9, dot(hue, luma)));
    vec3 tint = mix(base, hue, smoothstep(0.06, 0.28, chroma));
    vec3 revealed = clamp(revealSignal, 0.0, 1.0);
    float coverage = max(revealed.r, max(revealed.g, revealed.b));
    float stroke = 1.0 - smoothstep(pixel, pixel * 2.2, edge);
    col = mix(vec3(1.0), tint, 0.72 * smoothstep(0.0, 1.0, coverage));
    col = mix(col, tint * 0.85, stroke * clamp(coverage * 1.5, 0.0, 1.0) * 0.7);
    col = mix(col, vec3(1.0), clamp(sheen, 0.0, 1.0) * 0.5);
    float grain = max(0.5 * (hash(frag + uGrainTime) + hash(frag.yx + uGrainTime * 1.7)) - 0.5, 0.0);
    col = clamp(col - vec3(grain * uNoise * 0.12 * coverage), 0.0, 1.0);
  } else {
    vec3 haze = base * uGlow * 0.4 * smoothstep(0.0, 1.0, spot) * (0.4 + 0.6 * ramp);
    col = revealSignal + haze + mix(base, uLightColor, 0.45) * sheen * 0.7;
    vec3 over = max(col - 0.8, 0.0);
    col = min(col, vec3(0.8)) + 0.2 * (1.0 - exp(-over / 0.2));
    float luma = dot(clamp(col, 0.0, 1.0), vec3(0.2126, 0.7152, 0.0722));
    float grain = 0.5 * (hash(frag + uGrainTime) + hash(frag.yx + uGrainTime * 1.7)) - 0.5;
    col += grain * uNoise * (0.45 + 0.55 * smoothstep(0.0, 0.5, luma));
  }

  float presence = smoothstep(0.0, 0.65, uIntro);
  col = uLightMode > 0.5 ? mix(vec3(1.0), col, presence) : col * presence;
  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`,v=(i,s,f)=>Math.min(f,Math.max(s,i)),fe=(i,s,f)=>{const r=i.createShader(s);return r?(i.shaderSource(r,f),i.compileShader(r),i.getShaderParameter(r,i.COMPILE_STATUS)?r:(i.deleteShader(r),null)):null},We=i=>{const s=fe(i,i.VERTEX_SHADER,Ne),f=fe(i,i.FRAGMENT_SHADER,Ve),r=i.createProgram();if(!s||!f||!r)return null;if(i.attachShader(r,s),i.attachShader(r,f),i.linkProgram(r),i.deleteShader(s),i.deleteShader(f),!i.getProgramParameter(r,i.LINK_STATUS))return i.deleteProgram(r),null;const m={},N=i.getProgramParameter(r,i.ACTIVE_UNIFORMS);for(let R=0;R<N;R++){const F=i.getActiveUniform(r,R);if(!F)continue;const I=F.name.replace(/\[0\]$/,"");m[I]=i.getUniformLocation(r,I)}return{program:r,uniforms:m}},he=i=>{const s=String(i||"").replace("#","").padEnd(6,"0"),f=parseInt(s.slice(0,2),16)/255,r=parseInt(s.slice(2,4),16)/255,m=parseInt(s.slice(4,6),16)/255;return[f||0,r||0,m||0]},me=i=>{const s=(i&&i.length?i:["#FF9FFC","#5227FF"]).slice(0,P);for(s.length===1&&s.push(s[0]);s.length<P;)s.push(s[s.length-1]);const f=new Float32Array(P*3);for(let m=0;m<P;m++)f.set(he(s[m]),m*3);const r=Math.max(2,Math.min(P,i?.length??2));return{flat:f,count:r}},Be=({className:i="",style:s,dpr:f,paused:r=!1,gradientColors:m,angle:N=0,noise:R=.3,blindCount:F=16,blindMinWidth:I=60,mouseDampening:de=.15,mirrorGradient:pe=!1,spotlightRadius:ve=.5,spotlightSoftness:ge=1,spotlightOpacity:xe=1,distortAmount:ye=0,shineDirection:we="left",lightColor:Se="#ffffff",perspective:Me=0,gradientSpeed:be=0,shine:Re=.4,relief:Ce=.5,glow:Ee=.4,sway:Ae=.35,speed:Le=1,hoverTilt:Te=.6,clickEffect:Pe="ripple",idle:Fe="drift",intro:Ie=!0,mixBlendMode:j="lighten",lightMode:K=!1})=>{const U=b.useRef(null),X=b.useRef(null),V=b.useRef(null),Ge=(m&&m.length?m:["#FF9FFC","#5227FF"]).join(","),$={paused:r,colorKey:Ge,gradientColors:m,angle:N,noise:v(R,0,2),blindCount:Math.max(1,F||1),blindMinWidth:I,mouseDampening:Math.max(0,de),mirrorGradient:pe,spotlightRadius:ve,spotlightSoftness:ge,spotlightOpacity:xe,distortAmount:ye,shineDirection:we,lightColor:Se,perspective:v(Me,-1,1),gradientSpeed:be,shine:v(Re,0,2),relief:v(Ce,0,1),glow:v(Ee,0,2),sway:v(Ae,0,1),speed:v(Le,0,4),hoverTilt:v(Te,0,1.5),clickEffect:Pe,idle:Fe,intro:Ie,lightMode:K,dpr:f},x=b.useRef($);return x.current=$,b.useEffect(()=>{const w=U.current,g=X.current,t=g?.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,premultipliedAlpha:!1});if(!w||!g||!t)return;const G=We(t);if(!G)return;const n=G.uniforms,Y=t.createVertexArray(),S=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,l={width:1,height:1,ratio:1},d={x:0,y:0,inside:!1},o={x:0,y:0,vx:0,vy:0,tx:0,ty:0,ready:!1},p=new Float32Array(z*4);let W=0,k=0,C=0,M=0,q=0,J=0,E=x.current.intro&&!S?0:1,Q="",B=me(x.current.gradientColors),A=0,L=0,D=!0;const ke=e=>{if(e.blindMinWidth&&e.blindMinWidth>0){const a=Math.max(1,Math.floor(l.width/e.blindMinWidth));return Math.max(1,e.blindCount?Math.min(e.blindCount,a):a)}return Math.max(1,e.blindCount)},Z=()=>{const e=x.current;Q!==e.colorKey&&(B=me(e.gradientColors),Q=e.colorKey),t.viewport(0,0,g.width,g.height),t.useProgram(G.program),t.bindVertexArray(Y),t.uniform2f(n.uResolution,g.width,g.height),t.uniform1f(n.uTime,C),t.uniform2f(n.uMouse,o.x*l.ratio,(l.height-o.y)*l.ratio),t.uniform1f(n.uAngle,e.angle*Math.PI/180),t.uniform1f(n.uNoise,e.noise),t.uniform1f(n.uBlindCount,ke(e)),t.uniform1f(n.uSpotlightRadius,e.spotlightRadius),t.uniform1f(n.uSpotlightSoftness,e.spotlightSoftness),t.uniform1f(n.uSpotlightOpacity,e.spotlightOpacity),t.uniform1f(n.uMirror,e.mirrorGradient?1:0),t.uniform1f(n.uDistort,e.distortAmount),t.uniform1f(n.uShineFlip,e.shineDirection==="right"?1:0),t.uniform3fv(n.uColors,B.flat),t.uniform1i(n.uColorCount,B.count),t.uniform1f(n.uLightMode,e.lightMode?1:0),t.uniform1f(n.uShine,e.shine),t.uniform1f(n.uRelief,e.relief),t.uniform1f(n.uGlow,e.glow),t.uniform1f(n.uSway,S?0:e.sway),t.uniform1f(n.uSwayTime,M),t.uniform1f(n.uHover,k*e.hoverTilt),t.uniform4fv(n.uWaves,p),t.uniform1f(n.uIntro,E),t.uniform1f(n.uGrainTime,J),t.uniform3fv(n.uLightColor,he(e.lightColor||"#ffffff")),t.uniform1f(n.uPerspective,e.perspective),t.uniform1f(n.uGradientShift,q),t.drawArrays(t.TRIANGLES,0,3),t.bindVertexArray(null)},De=e=>{d.inside?(o.tx=d.x,o.ty=d.y):e.idle==="center"?(o.tx=l.width/2,o.ty=l.height/2):e.idle==="drift"&&!S&&(o.tx=l.width*(.5+.22*Math.sin(M*.23)+.05*Math.sin(M*.61+1.3)),o.ty=l.height*(.5+.16*Math.sin(M*.31+.7)+.04*Math.sin(M*.83)))},_e=(e,a)=>{const u=e.mouseDampening;if(u<=0){o.x=o.tx,o.y=o.ty,o.vx=0,o.vy=0;return}const h=2.4/u,T=h*h,c=2*h,_=Math.max(1,Math.ceil(a/.008)),O=a/_;for(let ue=0;ue<_;ue++)o.vx+=(T*(o.tx-o.x)-c*o.vx)*O,o.vy+=(T*(o.ty-o.y)-c*o.vy)*O,o.x+=o.vx*O,o.y+=o.vy*O},ee=()=>{const e=x.current;l.width=Math.max(1,w.clientWidth),l.height=Math.max(1,w.clientHeight),l.ratio=Math.min(e.dpr||window.devicePixelRatio||1,2),g.width=Math.max(1,Math.round(l.width*l.ratio)),g.height=Math.max(1,Math.round(l.height*l.ratio)),o.ready||(o.ready=!0,o.x=o.tx=l.width/2,o.y=o.ty=l.height/2),Z(),y()},te=e=>{if(A=0,!D||document.hidden)return;const a=x.current,u=L?v((e-L)/1e3,.001,1/20):1/60;if(L=e,a.paused)return;C+=u,S||(M+=u*a.speed,q=(q+u*a.gradientSpeed*.06)%2),J=Math.floor(C*24)*17.13,E<1&&(E=Math.min(1,E+u/Oe)),k+=((d.inside?1:0)-k)*(1-Math.exp(-u/.35)),De(a),_e(a,u);for(let c=0;c<z;c++)p[c*4+3]>0&&C-p[c*4+2]>H&&(p[c*4+3]=0);Z(),(Math.abs(o.tx-o.x)>.05||Math.abs(o.ty-o.y)>.05||Math.abs(o.vx)+Math.abs(o.vy)>.05||Math.abs((d.inside?1:0)-k)>.002||E<1||p.some((c,_)=>_%4===3&&c>0)||!S&&(a.noise>0||a.gradientSpeed!==0||a.sway>0&&a.speed>0||a.idle==="drift"&&!d.inside))&&(A=requestAnimationFrame(te))};function y(){!A&&D&&!document.hidden&&(L=0,A=requestAnimationFrame(te))}const oe=e=>{const a=w.getBoundingClientRect(),u=e.clientX-a.left,h=e.clientY-a.top;return{x:u,y:h,inside:u>=0&&h>=0&&u<=a.width&&h<=a.height}},ie=e=>{const{x:a,y:u,inside:h}=oe(e);d.x=a,d.y=u,d.inside=h,h&&y()},ne=e=>{const a=x.current,{x:u,y:h,inside:T}=oe(e);if(!T||S||a.clickEffect!=="ripple")return;const c=W*4;p[c]=u*l.ratio,p[c+1]=(l.height-h)*l.ratio,p[c+2]=C,p[c+3]=1,W=(W+1)%z,y()},ae=()=>{d.inside=!1,y()},re=()=>{L=0,y()},se=new ResizeObserver(ee);se.observe(w);const le=new IntersectionObserver(e=>{D=e.some(a=>a.isIntersecting),D&&y()});return le.observe(w),window.addEventListener("pointermove",ie,{passive:!0}),window.addEventListener("pointerdown",ne,{passive:!0}),document.documentElement.addEventListener("pointerleave",ae),document.addEventListener("visibilitychange",re),ee(),V.current=y,()=>{cancelAnimationFrame(A),V.current=null,se.disconnect(),le.disconnect(),window.removeEventListener("pointermove",ie),window.removeEventListener("pointerdown",ne),document.documentElement.removeEventListener("pointerleave",ae),document.removeEventListener("visibilitychange",re),t.deleteVertexArray(Y),t.deleteProgram(G.program),t.getExtension("WEBGL_lose_context")?.loseContext()}},[]),b.useEffect(()=>{V.current?.()}),ce.jsx("div",{ref:U,className:`gradient-blinds-container${i?` ${i}`:""}`,style:{...!K&&j?{mixBlendMode:j}:null,...s},children:ce.jsx("canvas",{ref:X,className:"gradient-blinds-canvas","aria-hidden":"true"})})};export{Be as default};
