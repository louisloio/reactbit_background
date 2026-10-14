import{r as H,j as ft}from"../text-animations-C31ni2K3.js";const gt=12,xt=3,de=gt+xt,Q=128,Dt=`
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() {
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
}`,Gt=`
layout(location = 0) in vec2 aSegment;
uniform mat3 uForward;
uniform vec2 uResolution;
uniform float uUnit;
uniform vec2 uCenter;
uniform vec4 uShape[SLOTS];
uniform vec4 uFrame[SLOTS];
uniform float uReach;
uniform float uSplit;
flat out int vSlot;
out vec2 vPlane;
void main() {
  vec4 shape = uShape[gl_InstanceID];
  vec2 origin = uCenter + uFrame[gl_InstanceID].xy;
  float angle = aSegment.x * 6.2831853;
  vec2 direction = vec2(cos(angle), sin(angle));
  vec3 inner = uForward * vec3(origin + direction * shape.x, 1.0);
  vec3 outer = uForward * vec3(origin + direction * (shape.x + 0.01), 1.0);
  float pixels = length(outer.xy / outer.z - inner.xy / inner.z) * 100.0 * uUnit;
  float band = uReach / max(pixels, 1e-3) + uSplit * shape.x;
  vec2 plane = origin + direction * max(shape.x + aSegment.y * band, 0.0);
  vec3 screen = uForward * vec3(plane, 1.0);
  gl_Position = vec4(screen.xy * (2.0 * uUnit / uResolution), 0.0, screen.z);
  vPlane = plane;
  vSlot = gl_InstanceID;
}`,Nt=`
uniform vec2 uResolution;
uniform vec2 uScale;
uniform float uUnit;
uniform mat3 uInverse;
uniform vec2 uCenter;
uniform int uCount;
uniform vec4 uShape[SLOTS];
uniform vec4 uFrame[SLOTS];
uniform vec4 uTint[SLOTS];
uniform vec4 uHover;
uniform vec2 uBounds;
uniform float uSplit;
uniform float uOpacity;

out vec4 fragColor;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float angleOf(vec2 v) {
  vec2 a = abs(v);
  float t = min(a.x, a.y) / max(max(a.x, a.y), 1e-6);
  float r = t * (0.5 + 0.1738 * (1.0 - t));
  return a.y > a.x ? 1.0 - r : r;
}

float nearness(vec2 plane) {
  vec2 offset = plane - uHover.xy;
  return uHover.z * exp(-dot(offset, offset) * uHover.w);
}

vec3 prismOf(vec3 tint) {
  return mix(tint, vec3(dot(tint, vec3(0.3333))), 0.65) * 0.85;
}

vec4 toneMap(vec3 light) {
  float peak = max(max(light.r, light.g), light.b);
  if (peak <= 0.0) return vec4(0.0);
  float level = 1.0 - exp(-peak);
  vec3 color = mix(light * (level / peak), vec3(level), smoothstep(1.4, 3.6, peak) * 0.4);
  return vec4(color, level);
}
`,Ht=`
uniform vec4 uHalo;
uniform vec3 uRange;

float haloOf(float d) {
  float fall = exp(-d * uHalo.y);
  float tight = fall * fall;
  tight *= tight;
  float window = clamp(1.0 - (d - uRange.x) * uRange.y, 0.0, 1.0);
  return (uHalo.z * tight + uHalo.w * fall) * window * window;
}

void main() {
  vec3 projected = uInverse * vec3((gl_FragCoord.xy * uScale - 0.5 * uResolution) / uUnit, 1.0);
  vec2 plane = projected.xy / projected.z;
  vec2 base = plane - uCenter;
  float reach = length(base);
  if (projected.z <= 0.0 || reach < uBounds.x || reach > uBounds.y) {
    fragColor = vec4(0.0);
    return;
  }
  float boost = 1.0 + 1.6 * nearness(plane);
  float limit = uRange.z + uSplit;
  vec3 light = vec3(0.0);
  float alpha = 0.0;

  for (int i = 0; i < SLOTS; i++) {
    if (i >= uCount) break;
    vec4 shape = uShape[i];
    vec4 frame = uFrame[i];
    vec2 w = base - frame.xy;
    float len = length(w);
    float d = abs(len - shape.x);
    if (d > limit) continue;
    float a = angleOf(vec2(dot(w, frame.zw), frame.z * w.y - frame.w * w.x));
    if (a > shape.w) continue;
    float energy = shape.y * max(exp(-shape.z * a * a * a) - 0.002, 0.0) * boost;
    vec3 tint = uTint[i].rgb;
#ifdef PRISM
    float offset = uSplit * shape.x;
    vec3 halo = vec3(haloOf(abs(len - shape.x - offset)), haloOf(d), haloOf(abs(len - shape.x + offset)));
#else
    vec3 halo = vec3(haloOf(d));
#endif
#ifdef LIGHT
    float layer = clamp(energy * dot(halo, vec3(0.3333)), 0.0, 1.0);
    light = tint * layer + light * (1.0 - layer);
    alpha = layer + alpha * (1.0 - layer);
#else
#ifdef PRISM
    tint = prismOf(tint);
#endif
    light += tint * energy * halo;
#endif
  }
#ifdef LIGHT
  fragColor = vec4(light, alpha);
#elif defined(PACKED)
  fragColor = vec4(1.0 - exp(-light), 1.0);
#else
  fragColor = vec4(light, 1.0);
#endif
}`,Xt=`
uniform sampler2D uGlow;
uniform float uGrain;
uniform float uTime;

void main() {
  vec4 glow = texture(uGlow, gl_FragCoord.xy / uResolution);
  float grain = 1.0;
  if (uGrain > 0.0) grain += uGrain * (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 413.0) - 0.5) * 1.8;
  float dither = (hash(gl_FragCoord.xy) - 0.5) / 255.0;
#ifdef LIGHT
  float alpha = clamp(glow.a * grain, 0.0, 1.0);
  if (alpha <= 0.0) {
    fragColor = vec4(0.0);
    return;
  }
  vec3 ink = glow.rgb * grain;
  alpha = clamp(alpha + dither, 0.0, 1.0);
  fragColor = vec4(min(ink, vec3(alpha)), alpha) * uOpacity;
#else
#ifdef PACKED
  vec3 light = -log(1.0 - min(glow.rgb, vec3(0.9995))) * grain;
#else
  vec3 light = glow.rgb * grain;
#endif
  vec4 color = toneMap(light);
  if (color.a <= 0.0) {
    fragColor = vec4(0.0);
    return;
  }
  float alpha = clamp(color.a + dither, 0.0, 1.0);
  fragColor = vec4(min(color.rgb, vec3(alpha)), alpha) * uOpacity;
#endif
}`,zt=`
flat in int vSlot;
in vec2 vPlane;
uniform float uWidth;

float coverage(float pixels, float halfWidth) {
  return clamp(max(halfWidth, 0.5) - pixels + 0.5, 0.0, 1.0) * min(halfWidth * 2.0, 1.0);
}

void main() {
  vec4 shape = uShape[vSlot];
  vec4 frame = uFrame[vSlot];
  vec4 tint = uTint[vSlot];
  vec2 w = vPlane - uCenter - frame.xy;
  float len = length(w);
  float stretch = 1.0 / max(length(vec2(dFdx(len), dFdy(len))), 1e-6);
  float a = angleOf(vec2(dot(w, frame.zw), frame.z * w.y - frame.w * w.x));
  float near = nearness(vPlane);
  float energy = shape.y * max(exp(-shape.z * a * a * a) - 0.002, 0.0) * (1.0 + 1.6 * near) * step(a, shape.w);
  float halfWidth = uWidth * (1.0 + 0.45 * near) * max(1.0 - a, 0.5) * tint.w;
  float pixels = abs(len - shape.x) * stretch;
#ifdef PRISM
  float offset = uSplit * shape.x;
  vec3 core = vec3(
    coverage(abs(len - shape.x - offset) * stretch, halfWidth),
    coverage(pixels, halfWidth),
    coverage(abs(len - shape.x + offset) * stretch, halfWidth)
  );
#else
  vec3 core = vec3(coverage(pixels, halfWidth));
#endif
#ifdef LIGHT
  float hot = core.g * clamp(1.0 - pixels / max(halfWidth * 0.35, 0.3), 0.0, 1.0);
  float layer = energy * max(max(core.r, core.g), core.b);
  if (layer <= 0.0) discard;
#ifdef PRISM
  vec3 color = clamp(1.0 - (1.0 - tint.rgb) * core * 1.4, 0.0, 1.0);
#else
  vec3 color = tint.rgb;
#endif
  color = mix(color, vec3(1.0), hot * 0.7);
  fragColor = vec4(color * layer, layer) * uOpacity;
#else
#ifdef PRISM
  vec4 color = toneMap(prismOf(tint.rgb) * energy * core * 1.7);
#else
  vec4 color = toneMap(tint.rgb * energy * core * 1.7);
#endif
  if (color.a <= 0.0) discard;
  fragColor = color * uOpacity;
#endif
}`,ut=(o,s)=>["#version 300 es","precision highp float;",`#define SLOTS ${de}`,...s.map(i=>`#define ${i}`),o].join(`
`),Vt={glow:Ht,compose:Xt,line:zt},kt=["pulse","ripple","breathe"],X=3.45,ht=.5,dt=2.6,he=1.1,mt=.9,T=(o,s,i)=>Math.min(i,Math.max(s,o)),j=(o,s,i)=>{const r=T((i-o)/(s-o),0,1);return r*r*(3-2*r)},Wt=o=>Math.min(j(0,.7,o),1-j(.5,3.25,o)),pt=o=>o<=.04045?o/12.92:Math.pow((o+.055)/1.055,2.4),Le=o=>{const s=String(o||"").trim(),i=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s);if(i){const l=i[1].length===3?i[1].replace(/./g,a=>a+a):i[1];return[0,2,4].map(a=>parseInt(l.slice(a,a+2),16)/255)}const r=/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(s);if(r)return[r[1],r[2],r[3]].map(l=>T(parseFloat(l)/255,0,1));if(typeof document<"u"){const l=document.createElement("canvas").getContext("2d");if(l){l.fillStyle="#000000",l.fillStyle=s;const a=String(l.fillStyle);if(a!=="#000000"||/^(#0{3}|#0{6}|black)$/i.test(s))return Le(a)}}return[.66,.33,.97]},vt=(o,s,i)=>{const r=o.createShader(s);return r?(o.shaderSource(r,i),o.compileShader(r),o.getShaderParameter(r,o.COMPILE_STATUS)?r:(console.error(o.getShaderInfoLog(r)),o.deleteShader(r),null)):null},jt=(o,s,i)=>{const r=vt(o,o.VERTEX_SHADER,s),l=vt(o,o.FRAGMENT_SHADER,i),a=r&&l?o.createProgram():null;if(!r||!l||!a)return r&&o.deleteShader(r),l&&o.deleteShader(l),null;if(o.attachShader(a,r),o.attachShader(a,l),o.linkProgram(a),o.deleteShader(r),o.deleteShader(l),!o.getProgramParameter(a,o.LINK_STATUS))return console.error(o.getProgramInfoLog(a)),o.deleteProgram(a),null;const S={},y=o.getProgramParameter(a,o.ACTIVE_UNIFORMS);for(let w=0;w<y;w++){const F=o.getActiveUniform(a,w);F&&(S[F.name.replace(/\[0\]$/,"")]=o.getUniformLocation(a,F.name))}return{program:a,uniforms:S}},qt=o=>{const[s,i,r,l,a,S,y,w,F]=o,Z=a*F-S*w,ee=S*y-l*F,te=l*w-a*y,me=s*Z+i*ee+r*te;return[Z,r*w-i*F,i*S-r*a,ee,s*F-r*y,r*l-s*S,te,i*y-s*w,s*a-i*l].map(pe=>pe/me)},$t=(o,s)=>{const i=o*Math.PI/180,r=s*Math.PI/180,l=Math.cos(i),a=Math.sin(i),S=Math.cos(r),y=Math.sin(r),w=[S,y*a,0,0,l,0,y*l/dt,-a/dt,1];return{forward:w,inverse:qt(w)}},Yt=(o,s,i)=>{const r=o[6]*s+o[7]*i+o[8];return[(o[0]*s+o[1]*i+o[2])/r,(o[3]*s+o[4]*i+o[5])/r,r]},Jt=({color:o="#A855F7",colorTwo:s="#6366F1",ringCount:i=6,motion:r="pulse",speed:l=1,lineThickness:a=2,glow:S=1,baseRadius:y=.35,radiusStep:w=.1,expansion:F=.1,taper:Z=1.5,rotation:ee=0,spin:te=0,tilt:me=0,dispersion:pe=0,grain:wt=0,opacity:Et=1,followMouse:Mt=!1,mouseInfluence:Rt=.2,hoverScale:St=1.2,hoverIntensity:yt=1,parallax:bt=.05,clickBurst:Tt=!0,intro:Ft=!0,theme:At="dark",maxDevicePixelRatio:Lt=2,className:_e="",style:_t})=>{const Ie=H.useRef(null),Oe=H.useRef(null),ve=H.useRef(null),[Ce,It]=H.useState(0),ge=At==="light",Pe=Le(o),Ue=Le(s),Be={color:ge?Pe:Pe.map(pt),colorTwo:ge?Ue:Ue.map(pt),ringCount:T(Math.round(i),1,gt),motion:kt.includes(r)?r:"pulse",speed:Math.max(0,l),lineThickness:Math.max(.25,a),glow:T(S,0,3),baseRadius:Math.max(.01,y),radiusStep:Math.max(0,w),expansion:F,taper:Math.max(.5,Z),rotation:ee*Math.PI/180,spin:te,tilt:T(me,-80,80),dispersion:T(pe,0,1),grain:T(wt,0,1),opacity:T(Et,0,1),followMouse:Mt,mouseInfluence:Rt,hoverScale:Math.max(.5,St),hoverIntensity:Math.max(0,yt),parallax:bt,clickBurst:Tt,intro:Ft,light:ge,maxRatio:T(Lt,.5,3)},B=H.useRef(Be);return B.current=Be,H.useEffect(()=>{ve.current?.()}),H.useEffect(()=>{const q=Ie.current,m=Oe.current;if(!q||!m)return;const e=m.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"default"});if(!e)return;const oe=new Map,z=(t,n)=>{const c=`${t}|${n.join(",")}`;if(!oe.has(c)){const d=ut(t==="line"?Gt:Dt,n);oe.set(c,jt(e,d,ut(`${Nt}${Vt[t]}`,n)))}return oe.get(c)};if(!z("glow",[])||!z("compose",[])||!z("line",[]))return;const $=window.matchMedia("(prefers-reduced-motion: reduce)").matches,De=e.createVertexArray(),xe=e.createVertexArray(),Ge=e.createBuffer(),Ne=new Float32Array((Q+1)*4);for(let t=0;t<=Q;t++)Ne.set([t/Q,-1,t/Q,1],t*4);e.bindVertexArray(xe),e.bindBuffer(e.ARRAY_BUFFER,Ge),e.bufferData(e.ARRAY_BUFFER,Ne,e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.bindVertexArray(null);const ne=e.createTexture(),we=e.createFramebuffer(),D={width:0,height:0};let Ee=!!e.getExtension("EXT_color_buffer_float");const He=new Float32Array(de*4),Xe=new Float32Array(de*4),ze=new Float32Array(de*4),G={width:1,height:1,ratio:1,unit:1},h={x:0,y:0,inside:!1,touch:!1},u={x:0,y:0,vx:0,vy:0,hover:0,hoverVelocity:0},_=[];let C=B.current.intro&&B.current.speed>0&&!$&&Ce===0,P=C?0:1.6,V=0,N=0,re=0,Me=!0,Re=document.visibilityState!=="hidden",Se=!1;const ye=()=>{const t=B.current,n=q.getBoundingClientRect(),c=Math.min(window.devicePixelRatio||1,t.maxRatio),d=Math.max(1,Math.round(n.width*c)),v=Math.max(1,Math.round(n.height*c));(m.width!==d||m.height!==v)&&(m.width=d,m.height=v),Object.assign(G,{width:d,height:v,ratio:c,unit:Math.max(1,Math.min(d,v))});const x=Math.max(1,Math.ceil(d/2)),E=Math.max(1,Math.ceil(v/2));if(D.width===x&&D.height===E)return;Object.assign(D,{width:x,height:E});const M=g=>{e.bindTexture(e.TEXTURE_2D,ne),e.texImage2D(e.TEXTURE_2D,0,g?e.RGBA16F:e.RGBA8,x,E,0,e.RGBA,g?e.HALF_FLOAT:e.UNSIGNED_BYTE,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindFramebuffer(e.FRAMEBUFFER,we),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,ne,0);const A=e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE;return e.bindFramebuffer(e.FRAMEBUFFER,null),A};M(Ee)||(Ee=!1,M(!1))},Ot=(t,n,c)=>{const d=c>1?n/(c-1):0;if(t.motion==="ripple"){const M=c*t.radiusStep+t.expansion,g=X*Math.max(1,c)*.32,A=P/g+n/c,R=A-Math.floor(A),b=P-R*g>=-1e-4||!C?j(0,.12,R)*(1-j(.62,1,R)):0,Y=R*Math.max(1,c-1);return{radius:t.baseRadius+R*M,life:b,virtual:Y,mix:R,opening:1}}if(t.motion==="breathe"){const M=Math.sin(P/4*Math.PI*2-n*.55),g=C?j(n*.12,n*.12+.9,P):1;return{radius:t.baseRadius+n*t.radiusStep+t.expansion*.5*(1+M),life:(.78+.22*M)*g,virtual:n,mix:d,opening:1}}const v=P-n*ht,x=(v%X+X)%X,E=C&&v<0?0:Wt(x);return{radius:t.baseRadius+n*t.radiusStep+(1-Math.pow(1-x/X,2))*t.expansion,life:E,virtual:n,mix:d,opening:C&&v<X?j(0,.9,v):1}},Ct=()=>{const t=B.current,n=t.ringCount,c=u.hover,d=$?0:1,v=1+(t.hoverScale-1)*c*d,x=u.x*d,E=u.y*d,M=t.tilt-E*t.parallax*260,g=x*t.parallax*260,A=$t(M,g),R=t.followMouse?[x*t.mouseInfluence,E*t.mouseInfluence]:[0,0],L=t.spin*P*.6;let b=0,Y=1/0,ie=0,be=0;const Ze=(p,f,O,U,ce,le,W,fe)=>{if(f<=.002)return;const J=10*p*O*O*O;He.set([p,f,J,J>6.2?Math.cbrt(6.2/J):2],b*4),Xe.set([ce,le,Math.cos(U),Math.sin(U)],b*4),ze.set([t.color[0]+(t.colorTwo[0]-t.color[0])*W,t.color[1]+(t.colorTwo[1]-t.color[1])*W,t.color[2]+(t.colorTwo[2]-t.color[2])*W,fe],b*4),Y=Math.min(Y,p),ie=Math.max(ie,p),be=Math.max(be,Math.hypot(ce,le)),b++};for(let p=0;p<n;p++){const f=Ot(t,p,n);let O=f.radius*v,U=f.life;for(const W of _){const fe=V-W.start,J=(W.radius+fe*mt)*v,lt=Math.pow(Math.max(0,1-fe/he),1.5),ue=(J-O)/.08;O+=.04*Math.exp(-ue*ue)*lt,U=Math.min(1.6,U+.9*Math.exp(-ue*ue*1.6)*lt)}const ce=Math.pow(t.taper,f.virtual)/Math.max(.08,f.opening),le=t.rotation+L*(p%2?-1:1)*(1+p*.15);Ze(O,U,ce,le,p*t.parallax*x,p*t.parallax*E,f.mix,1)}for(const p of _){const f=V-p.start,O=Math.pow(Math.max(0,1-f/he),1.5),U=(p.radius+f*mt)*v;Ze(U,1.5*O,.85,t.rotation,0,0,T(f/he,0,1),1.15)}if(e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,m.width,m.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),!b)return;const k=[];t.light&&k.push("LIGHT"),t.dispersion>0&&k.push("PRISM"),Ee||k.push("PACKED");const et=z("glow",k),tt=z("compose",k),ot=z("line",k);if(!et||!tt||!ot)return;const nt=(t.light?.3:1)*(1-t.dispersion*.45),rt=.012+.033*t.glow,Pt=.5*Math.min(1,t.glow)*nt,Ut=.9*t.glow*nt,se=rt*4.5+.008,at=t.dispersion*.03,it=se+at*ie+be+.01,st=t.lineThickness*G.ratio,Bt=st*(1+.45*t.hoverIntensity)*1.15+1.5,ct=Yt(A.inverse,h.x,h.y),Te=p=>{const f=p.uniforms;return e.useProgram(p.program),e.uniform2f(f.uResolution,m.width,m.height),e.uniform1f(f.uUnit,G.unit),e.uniform2f(f.uCenter,R[0],R[1]),e.uniform1i(f.uCount,b),e.uniform4fv(f.uShape,He),e.uniform4fv(f.uFrame,Xe),e.uniform4fv(f.uTint,ze),e.uniform4f(f.uHover,ct[0]-R[0],ct[1]-R[1],c*t.hoverIntensity,1/.03),e.uniform1f(f.uSplit,at),e.uniform1f(f.uOpacity,t.opacity),f};e.bindVertexArray(De),e.bindFramebuffer(e.FRAMEBUFFER,we),e.viewport(0,0,D.width,D.height),e.clear(e.COLOR_BUFFER_BIT);const K=Te(et);e.uniform2f(K.uScale,m.width/D.width,m.height/D.height),e.uniformMatrix3fv(K.uInverse,!0,A.inverse),e.uniform2f(K.uBounds,Math.max(0,Y-it),ie+it),e.uniform4f(K.uHalo,0,1/rt,Pt,Ut),e.uniform3f(K.uRange,se*.45,1/(se*.55),se),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,m.width,m.height);const Fe=Te(tt);e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,ne),e.uniform1i(Fe.uGlow,0),e.uniform1f(Fe.uGrain,t.grain),e.uniform1f(Fe.uTime,V),e.drawArrays(e.TRIANGLES,0,3);const Ae=Te(ot);e.uniformMatrix3fv(Ae.uForward,!0,A.forward),e.uniform1f(Ae.uReach,Bt),e.uniform1f(Ae.uWidth,st),e.enable(e.BLEND),t.light?e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA):e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_COLOR,e.ONE,e.ONE_MINUS_SRC_ALPHA),e.bindVertexArray(xe),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,(Q+1)*2,b),e.disable(e.BLEND),e.bindVertexArray(null)},Ve=t=>{if(N=0,Se)return;const n=B.current,c=T((t-re)/1e3||0,0,.05);re=Math.max(re,t),V+=c,$||(P+=c*n.speed);const d=h.inside?h.x/Math.max(1e-6,G.width/G.unit):0,v=h.inside?h.y/Math.max(1e-6,G.height/G.unit):0,x=70,E=2*Math.sqrt(x)*.9,M=Math.max(1,Math.ceil(c/(1/240))),g=c/M;for(let L=0;L<M;L++){u.vx+=(x*(d-u.x)-E*u.vx)*g,u.vy+=(x*(v-u.y)-E*u.vy)*g,u.x+=u.vx*g,u.y+=u.vy*g;const b=h.inside?1:0;u.hoverVelocity+=(40*(b-u.hover)-2*Math.sqrt(40)*u.hoverVelocity)*g,u.hover+=u.hoverVelocity*g}for(let L=_.length-1;L>=0;L--)V-_[L].start>he&&_.splice(L,1);C&&P>(n.ringCount+2)*ht+X&&(C=!1),Ct();const A=Math.abs(u.vx)+Math.abs(u.vy)+Math.abs(u.hoverVelocity)>1e-4||Math.abs((h.inside?1:0)-u.hover)>.001;(n.speed>0&&!$||A||_.length>0||C)&&Me&&Re&&(N=requestAnimationFrame(Ve))},I=()=>{N||Se||!Me||!Re||(re=performance.now(),N=requestAnimationFrame(Ve))};ve.current=()=>{ye(),I()};const ke=t=>{const n=q.getBoundingClientRect(),c=t.clientX>=n.left&&t.clientX<=n.right&&t.clientY>=n.top&&t.clientY<=n.bottom,d=Math.max(1,Math.min(n.width,n.height));return{x:(t.clientX-n.left-n.width/2)/d,y:(n.top+n.height/2-t.clientY)/d,inside:c}},We=t=>{if(t.pointerType==="touch"&&!h.touch)return;const n=ke(t);h.x=n.x,h.y=n.y,h.inside=n.inside,I()},je=t=>{const n=ke(t);if(!n.inside)return;h.x=n.x,h.y=n.y,h.inside=!0,h.touch=t.pointerType==="touch";const c=B.current;c.clickBurst&&!$&&(_.push({start:V,radius:Math.max(.04,c.baseRadius*.45)}),_.length>xt&&_.shift()),I()},ae=t=>{t.pointerType==="touch"&&(h.touch=!1,h.inside=!1,I())},qe=()=>{h.inside=!1,I()};window.addEventListener("pointermove",We,{passive:!0}),window.addEventListener("pointerdown",je,{passive:!0}),window.addEventListener("pointerup",ae,{passive:!0}),window.addEventListener("pointercancel",ae,{passive:!0}),document.documentElement.addEventListener("pointerleave",qe);const $e=t=>{t.preventDefault(),Se=!0,cancelAnimationFrame(N),N=0},Ye=()=>It(t=>t+1);m.addEventListener("webglcontextlost",$e),m.addEventListener("webglcontextrestored",Ye);const Ke=new ResizeObserver(()=>{ye(),I()});Ke.observe(q);const Je=new IntersectionObserver(t=>{Me=t.some(n=>n.isIntersecting),I()});Je.observe(q);const Qe=()=>{Re=document.visibilityState!=="hidden",I()};return document.addEventListener("visibilitychange",Qe),ye(),I(),()=>{cancelAnimationFrame(N),ve.current=null,Ke.disconnect(),Je.disconnect(),window.removeEventListener("pointermove",We),window.removeEventListener("pointerdown",je),window.removeEventListener("pointerup",ae),window.removeEventListener("pointercancel",ae),document.documentElement.removeEventListener("pointerleave",qe),document.removeEventListener("visibilitychange",Qe),m.removeEventListener("webglcontextlost",$e),m.removeEventListener("webglcontextrestored",Ye),e.isContextLost()||(e.deleteVertexArray(De),e.deleteTexture(ne),e.deleteFramebuffer(we),oe.forEach(t=>t&&e.deleteProgram(t.program)),e.deleteVertexArray(xe),e.deleteBuffer(Ge))}},[Ce]),ft.jsx("div",{ref:Ie,className:`magic-rings${_e?` ${_e}`:""}`,style:_t,children:ft.jsx("canvas",{ref:Oe,className:"magic-rings__canvas","aria-hidden":"true"})})};export{Jt as default};
