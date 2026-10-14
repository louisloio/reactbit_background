import{r as M,j as he}from"../text-animations-CYBZrtvX.js";const ke=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,k=`#version 300 es
precision highp float;
const float PI = 3.14159265;
const float TAU = 6.28318531;
const float HALF_PI = 1.5707963;
`,pe=`
uniform vec2 uView;
uniform vec2 uOffset;
uniform float uRotation;
uniform float uFocalLength;
uniform float uTime;
uniform float uSpeed1;
uniform float uSpeed2;
uniform float uDir2;
uniform float uBend1;
uniform float uBend2;
uniform float uThickness;
uniform vec3 uHeat;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uCore;
uniform float uRange;

vec4 traceLight(vec2 pixel) {
  vec2 coord = pixel + uOffset - 0.5 * uView;
  float c = cos(uRotation);
  float sn = sin(uRotation);
  coord = mat2(c, -sn, sn, c) * coord;
  vec3 u = normalize(vec3(coord / uView.y, uFocalLength));
  vec3 o = vec3(0.0, 0.0, -7.0);
  float t = uTime * PI;
  float t1 = t * 0.7;
  float t2 = t * 0.9;
  float tSpeed1 = t * uSpeed1;
  float tSpeed2 = t * uSpeed2 * uDir2;
  float s = 1.0;
  float d = 0.0;
  vec2 k = vec2(0.0);
  for (int i = 0; i < 14; ++i) {
    vec3 p = o + u * d;
    p.x -= 15.0;
    float px = p.x;
    float swell = uHeat.y * exp(-pow((px - uHeat.x) / uHeat.z, 2.0));
    float wob1 = uBend1 + swell * (0.16 + 0.2 * uBend1) + sin(t1 + px * 0.8) * 0.1;
    float wob2 = uBend2 + swell * (0.16 + 0.2 * uBend2) + cos(t2 + px * 1.1) * 0.1;
    vec2 a = sin(vec2(px, px + HALF_PI) + tSpeed1) * wob1;
    vec2 b = cos(vec2(px, px + HALF_PI) + tSpeed2) * wob2;
    float cut = px + uThickness;
    k.x = max(cut, length(p.yz - a) - uThickness);
    k.y = max(cut, length(p.yz - b) - uThickness);
    s = min(s, min(k.x, k.y));
    if (s < 0.001 || d > 300.0) break;
    d += s * 0.7;
  }
  vec3 raw = max(cos(d * TAU) - s * sqrt(d) - vec3(k, 0.0), 0.0);
  float field = max(raw.r, max(raw.g, raw.b));
  raw.gb += 0.1;
  raw = raw * 0.4 + raw.brg * 0.6 + raw * raw;
  float lum = dot(raw, vec3(0.299, 0.587, 0.114));
  float w1 = max(0.0, 1.0 - k.x * 2.0) + 0.0001;
  float w2 = max(0.0, 1.0 - k.y * 2.0) + 0.0001;
  vec3 base = (uColor1 * w1 + uColor2 * w2) / (w1 + w2);
  float soft = smoothstep(0.03, 0.36, field);
  float hot = smoothstep(0.32, 0.8, field);
  vec3 light = base * lum * 2.6 * soft + mix(base, vec3(1.0), 0.55) * hot * uCore * 2.0;
  return vec4(light * uRange, field);
}
`,Ie=`${k}
${pe}
uniform vec2 uScale;
out vec4 outColor;
void main() {
  outColor = traceLight(gl_FragCoord.xy * uScale);
}`,Ue=`${k}
${pe}
uniform vec2 uScale;
uniform sampler2D uCoarse;
uniform vec2 uCoarseSize;
uniform vec2 uFineSize;
out vec4 outColor;
void main() {
  vec2 uv = gl_FragCoord.xy / uFineSize;
  vec2 pos = uv * uCoarseSize - 0.5;
  ivec2 cell = ivec2(floor(pos));
  ivec2 last = ivec2(uCoarseSize) - 1;
  float a = texelFetch(uCoarse, clamp(cell, ivec2(0), last), 0).a;
  float b = texelFetch(uCoarse, clamp(cell + ivec2(1, 0), ivec2(0), last), 0).a;
  float c = texelFetch(uCoarse, clamp(cell + ivec2(0, 1), ivec2(0), last), 0).a;
  float d = texelFetch(uCoarse, clamp(cell + ivec2(1, 1), ivec2(0), last), 0).a;
  float high = max(max(a, b), max(c, d));
  float low = min(min(a, b), min(c, d));
  if (high > 0.02 && low < 0.4) outColor = traceLight(gl_FragCoord.xy * uScale);
  else outColor = texture(uCoarse, uv);
}`,Xe=`${k}
uniform sampler2D uSource;
uniform vec2 uTexel;
uniform vec2 uTarget;
out vec4 outColor;
void main() {
  vec2 uv = gl_FragCoord.xy / uTarget;
  vec4 sum = texture(uSource, uv) * 4.0;
  sum += texture(uSource, uv - uTexel);
  sum += texture(uSource, uv + uTexel);
  sum += texture(uSource, uv + vec2(uTexel.x, -uTexel.y));
  sum += texture(uSource, uv - vec2(uTexel.x, -uTexel.y));
  outColor = sum / 8.0;
}`,He=`${k}
uniform sampler2D uSource;
uniform sampler2D uBase;
uniform vec2 uTexel;
uniform vec2 uTarget;
out vec4 outColor;
void main() {
  vec2 uv = gl_FragCoord.xy / uTarget;
  vec2 h = uTexel * 0.5;
  vec4 sum = texture(uSource, uv + vec2(-h.x * 2.0, 0.0));
  sum += texture(uSource, uv + vec2(h.x * 2.0, 0.0));
  sum += texture(uSource, uv + vec2(0.0, -h.y * 2.0));
  sum += texture(uSource, uv + vec2(0.0, h.y * 2.0));
  sum += texture(uSource, uv + vec2(-h.x, h.y)) * 2.0;
  sum += texture(uSource, uv + h) * 2.0;
  sum += texture(uSource, uv + vec2(h.x, -h.y)) * 2.0;
  sum += texture(uSource, uv - h) * 2.0;
  outColor = sum / 12.0 + texture(uBase, uv);
}`,We=`${k}
uniform sampler2D uLight;
uniform sampler2D uBloom;
uniform vec2 uResolution;
uniform float uExposure;
uniform float uGlow;
uniform float uCore;
uniform float uPresence;
uniform float uGrain;
uniform float uFade;
uniform float uOpacity;
uniform float uTime;
uniform float uLightMode;
uniform vec3 uLens;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float smootherstep(float edge, float x) {
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 offset = gl_FragCoord.xy - uLens.xy;
  float lens = uLens.z * exp(-dot(offset, offset) / (uResolution.y * uResolution.y * 0.045));
  vec4 source = texture(uLight, uv);
  vec3 hdr = source.rgb * uExposure * uPresence * (1.0 + lens * 0.35);
  hdr += texture(uBloom, uv).rgb * uExposure * uPresence * uGlow * (0.18 + lens * 0.08);
  float edge = uFade * 0.5;
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);
  float grain = (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;
  float peak = max(hdr.r, max(hdr.g, hdr.b));
  if (uLightMode > 0.5) {
    vec3 hue = hdr / max(peak, 0.0001);
    float tone = dot(hue, vec3(0.2126, 0.7152, 0.0722));
    vec3 ink = pow(clamp(hue * min(1.0, 0.6 / max(tone, 0.001)), 0.0, 1.0), vec3(1.0 / 2.2));
    float feather = max(fwidth(source.a) * 1.25, 0.02);
    float body = smoothstep(0.15 - feather, 0.15 + feather, source.a) * uPresence;
    vec3 color = mix(ink, vec3(1.0), smoothstep(12.0, 26.0, peak) * uCore);
    float halo = (1.0 - exp(-peak * 0.5)) * 0.3 * min(uGlow, 1.5);
    float alpha = clamp(body * 0.92 + (1.0 - body) * halo, 0.0, 1.0) * mask * uOpacity;
    color = mix(ink, color, body);
    outColor = vec4(clamp(color + grain, 0.0, 1.0) * alpha, alpha);
  } else {
    vec3 mapped = 1.0 - exp(-hdr);
    float level = max(mapped.r, max(mapped.g, mapped.b));
    mapped = clamp(mapped + grain * level, 0.0, 1.0) * mask * uOpacity;
    outColor = vec4(mapped, max(mapped.r, max(mapped.g, mapped.b)));
  }
}`,F=4,de=3,Ge=1.8,xe=24e5,D=(i,w,p)=>Math.min(p,Math.max(w,i)),ve=(i,w,p)=>{const d=i.createShader(w);return d?(i.shaderSource(d,p),i.compileShader(d),i.getShaderParameter(d,i.COMPILE_STATUS)?d:(i.deleteShader(d),null)):null},B=(i,w)=>{const p=ve(i,i.VERTEX_SHADER,ke),d=ve(i,i.FRAGMENT_SHADER,w),m=i.createProgram();if(!p||!d||!m)return null;if(i.attachShader(m,p),i.attachShader(m,d),i.bindAttribLocation(m,0,"aPosition"),i.linkProgram(m),i.deleteShader(p),i.deleteShader(d),!i.getProgramParameter(m,i.LINK_STATUS))return i.deleteProgram(m),null;const I={},z=i.getProgramParameter(m,i.ACTIVE_UNIFORMS);for(let _=0;_<z;_++){const L=i.getActiveUniform(m,_);L&&(I[L.name]=i.getUniformLocation(m,L.name))}return{program:m,uniforms:I}};function ze({colors:i=["#A855F7","#06B6D4"],speed:w=1,speed1:p=.05,speed2:d=.05,dir2:m=1,bend1:I=1,bend2:z=.5,thickness:_=.3,focalLength:L=1.25,rotationDeg:ge=0,xOffset:Te=0,yOffset:we=0,brightness:Ee=1,glow:Re=1,core:ye=.6,grain:Se=.03,quality:be=1,mouseInteraction:Ae=!0,intro:Ce=!0,fade:Me=0,opacity:Fe=1,lightMode:_e=!1,paused:Le=!1,dpr:Pe,className:Q="",...Oe}){const K=M.useRef(null),J=M.useRef(null),N=M.useRef(null),Z={color1:String(i?.[0]??"#A855F7"),color2:String(i?.[1]??i?.[0]??"#06B6D4"),speed:w,speed1:p,speed2:d,dir2:m,bend1:I,bend2:z,thickness:Math.max(.02,_),focalLength:Math.max(.05,L),rotation:ge*Math.PI/180,xOffset:Te,yOffset:we,brightness:Math.max(0,Ee),glow:Math.max(0,Re),core:D(ye,0,1),grain:Math.max(0,Se),quality:D(be,.25,1),mouseInteraction:Ae,intro:Ce,fade:D(Me,0,1),opacity:D(Fe,0,1),lightMode:_e,paused:Le,dpr:Pe},g=M.useRef(Z);return g.current=Z,M.useEffect(()=>{const R=K.current,v=J.current,e=v?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!R||!v||!e)return;const ee=!!e.getExtension("EXT_color_buffer_float"),te=ee?1:.25,s={coarse:B(e,Ie),fine:B(e,Ue),down:B(e,Xe),up:B(e,He),composite:B(e,We)};if(Object.values(s).some(t=>!t))return;const oe=e.createBuffer(),q=e.createVertexArray();e.bindVertexArray(q),e.bindBuffer(e.ARRAY_BUFFER,oe),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const U=()=>({texture:e.createTexture(),framebuffer:e.createFramebuffer(),width:0,height:0}),X=(t,o,a)=>{t.width===o&&t.height===a||(t.width=o,t.height=a,e.bindTexture(e.TEXTURE_2D,t.texture),ee?e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,o,a,0,e.RGBA,e.HALF_FLOAT,null):e.texImage2D(e.TEXTURE_2D,0,e.RGBA,o,a,0,e.RGBA,e.UNSIGNED_BYTE,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindFramebuffer(e.FRAMEBUFFER,t.framebuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t.texture,0))},H=U(),P=U(),y=Array.from({length:F+1},U),W=Array.from({length:F},U),S=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),G=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,$=new Map,re=t=>{if($.has(t))return $.get(t);let o=[1,1,1];if(S){S.clearRect(0,0,1,1),S.fillStyle="#000000",S.fillStyle=t,S.fillRect(0,0,1,1);const[a,n,c]=S.getImageData(0,0,1,1).data;o=[a,n,c].map(f=>Math.pow(f/255,2.2))}return $.set(t,o),o},r={width:1,height:1,fineWidth:1,fineHeight:1,coarseWidth:1,coarseHeight:1},h={x:0,y:0,inside:!1},u={time:0,intro:g.current.intro&&!G?0:1,heat:0,heatVelocity:0,heatX:0,lensX:0,lensY:0};let E=0,b=0,V=!0;const O=(t,o,a,n)=>{e.bindFramebuffer(e.FRAMEBUFFER,o?o.framebuffer:null),e.viewport(0,0,a,n),e.useProgram(t.program),e.drawArrays(e.TRIANGLES,0,3)},A=(t,o,a,n)=>{e.activeTexture(e.TEXTURE0+a),e.bindTexture(e.TEXTURE_2D,n),e.uniform1i(t.uniforms[o],a)},ae=(t,o,a)=>{const n=t.uniforms;e.useProgram(t.program),e.uniform2f(n.uView,r.width,r.height),e.uniform2f(n.uOffset,o.xOffset,o.yOffset),e.uniform1f(n.uRotation,o.rotation),e.uniform1f(n.uFocalLength,o.focalLength),e.uniform1f(n.uTime,u.time),e.uniform1f(n.uSpeed1,o.speed1),e.uniform1f(n.uSpeed2,o.speed2),e.uniform1f(n.uDir2,o.dir2),e.uniform1f(n.uBend1,o.bend1*(.3+.7*a)),e.uniform1f(n.uBend2,o.bend2*(.3+.7*a)),e.uniform1f(n.uThickness,o.thickness),e.uniform3f(n.uHeat,u.heatX,u.heat,1.4),e.uniform3fv(n.uColor1,re(o.color1)),e.uniform3fv(n.uColor2,re(o.color2)),e.uniform1f(n.uCore,o.core),e.uniform1f(n.uRange,te)},Y=()=>{const t=g.current,o=u.intro*u.intro*(3-2*u.intro);e.bindVertexArray(q),X(H,r.coarseWidth,r.coarseHeight),X(P,r.fineWidth,r.fineHeight),ae(s.coarse,t,o),e.uniform2f(s.coarse.uniforms.uScale,r.width/r.coarseWidth,r.height/r.coarseHeight),O(s.coarse,H,r.coarseWidth,r.coarseHeight);const a=s.fine;ae(a,t,o),e.uniform2f(a.uniforms.uScale,r.width/r.fineWidth,r.height/r.fineHeight),e.uniform2f(a.uniforms.uCoarseSize,r.coarseWidth,r.coarseHeight),e.uniform2f(a.uniforms.uFineSize,r.fineWidth,r.fineHeight),A(a,"uCoarse",0,H.texture),O(a,P,r.fineWidth,r.fineHeight);let n=P;for(let l=0;l<=F;l++){const x=y[l],T=l===0?Math.round(r.width/2):n.width>>1,Be=l===0?Math.round(r.height/2):n.height>>1;X(x,Math.max(1,T),Math.max(1,Be)),e.useProgram(s.down.program),e.uniform2f(s.down.uniforms.uTexel,1/n.width,1/n.height),e.uniform2f(s.down.uniforms.uTarget,x.width,x.height),A(s.down,"uSource",0,n.texture),O(s.down,x,x.width,x.height),n=x}for(let l=F-1;l>=1;l--){const x=l===F-1?y[F]:W[l+1],T=W[l];X(T,y[l].width,y[l].height),e.useProgram(s.up.program),e.uniform2f(s.up.uniforms.uTexel,1/x.width,1/x.height),e.uniform2f(s.up.uniforms.uTarget,T.width,T.height),A(s.up,"uSource",0,x.texture),A(s.up,"uBase",1,y[l].texture),O(s.up,T,T.width,T.height)}const c=s.composite,f=c.uniforms;e.useProgram(c.program),e.uniform2f(f.uResolution,v.width,v.height),e.uniform1f(f.uExposure,2.4*t.brightness/te),e.uniform1f(f.uGlow,t.glow),e.uniform1f(f.uCore,t.core),e.uniform1f(f.uPresence,o*o),e.uniform1f(f.uGrain,t.grain),e.uniform1f(f.uFade,t.fade),e.uniform1f(f.uOpacity,t.opacity),e.uniform1f(f.uTime,u.time),e.uniform1f(f.uLightMode,t.lightMode?1:0),e.uniform3f(f.uLens,u.lensX*v.width/r.width,(r.height-u.lensY)*v.height/r.height,u.heat),A(c,"uLight",0,P.texture),A(c,"uBloom",1,W[1].texture),O(c,null,v.width,v.height)},De=t=>{if(!(t.mouseInteraction&&h.inside)||G)return null;const o=h.x+t.xOffset-r.width/2,a=r.height-h.y+t.yOffset-r.height/2,n=Math.cos(t.rotation),c=Math.sin(t.rotation);return 7*(n*o+c*a)/r.height/t.focalLength-15},ne=t=>{if(E=0,!V||document.hidden)return;const o=g.current,a=b?Math.min(.05,(t-b)/1e3):1/60;b=t;const n=!o.paused&&!G;n&&(u.time+=a*o.speed),!o.intro||G?u.intro=1:u.intro<1&&(u.intro=Math.min(1,u.intro+a/Ge));const c=De(o);c!==null&&(u.heatX+=(c-u.heatX)*(1-Math.exp(-a*6))),u.heatVelocity+=(120*((c===null?0:1)-u.heat)-19*u.heatVelocity)*a,u.heat=D(u.heat+u.heatVelocity*a,0,1.15),u.lensX+=(h.x-u.lensX)*(1-Math.exp(-a*8)),u.lensY+=(h.y-u.lensY)*(1-Math.exp(-a*8)),Y();const f=u.intro<1||u.heat>.001||Math.abs(u.heatVelocity)>.001;n||f?E=requestAnimationFrame(ne):b=0},C=()=>{!E&&V&&!document.hidden&&(E=requestAnimationFrame(ne))},j=()=>{const t=g.current,o=Math.max(1,R.clientWidth),a=Math.max(1,R.clientHeight),n=Math.min(t.dpr||window.devicePixelRatio||1,2);r.width=o,r.height=a,v.width=Math.max(1,Math.round(o*n)),v.height=Math.max(1,Math.round(a*n));let c=t.quality;o*a*c*c>xe&&(c=Math.sqrt(xe/(o*a))),r.fineWidth=Math.max(1,Math.round(o*c)),r.fineHeight=Math.max(1,Math.round(a*c)),r.coarseWidth=Math.max(1,Math.round(r.fineWidth/de)),r.coarseHeight=Math.max(1,Math.round(r.fineHeight/de)),E||Y(),C()},ie=t=>{const o=R.getBoundingClientRect();h.x=t.clientX-o.left,h.y=t.clientY-o.top,h.inside=h.x>=0&&h.y>=0&&h.x<=o.width&&h.y<=o.height,C()},ue=()=>{h.inside=!1,C()},ce=()=>{b=0,C()},se=new ResizeObserver(j);se.observe(R);const fe=new IntersectionObserver(t=>{V=t.some(o=>o.isIntersecting),V&&(b=0,C())});fe.observe(R),window.addEventListener("pointermove",ie,{passive:!0}),document.documentElement.addEventListener("pointerleave",ue),document.addEventListener("visibilitychange",ce),j();let le=g.current.quality,me=g.current.dpr;return N.current=()=>{const t=g.current;if(t.quality!==le||t.dpr!==me){le=t.quality,me=t.dpr,j();return}E||Y(),C()},()=>{cancelAnimationFrame(E),N.current=null,se.disconnect(),fe.disconnect(),window.removeEventListener("pointermove",ie),document.documentElement.removeEventListener("pointerleave",ue),document.removeEventListener("visibilitychange",ce);for(const t of[H,P,...y,...W])e.deleteTexture(t.texture),e.deleteFramebuffer(t.framebuffer);for(const t of Object.values(s))e.deleteProgram(t.program);e.deleteBuffer(oe),e.deleteVertexArray(q),e.getExtension("WEBGL_lose_context")?.loseContext()}},[]),M.useEffect(()=>{N.current?.()}),he.jsx("div",{ref:K,className:`plasma-wave-container${Q?` ${Q}`:""}`,...Oe,children:he.jsx("canvas",{ref:J,className:"plasma-wave-canvas","aria-hidden":"true"})})}export{ze as default};
