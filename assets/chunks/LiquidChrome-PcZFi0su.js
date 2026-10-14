import{r as M,j as ge}from"../text-animations-C31ni2K3.js";const Xe=24e5,xe=4,we=1/120,De=`#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() {
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
}`,ze=`#version 300 es
precision highp float;
uniform sampler2D uState;
uniform vec2 uSize;
uniform vec4 uStroke;
uniform vec2 uImpulse;
out vec4 fragColor;

float segment(vec2 p, vec2 a, vec2 b) {
  vec2 ab = b - a;
  float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-4), 0.0, 1.0);
  return length(p - a - ab * t);
}

void main() {
  vec2 texel = 1.0 / uSize;
  vec2 uv = gl_FragCoord.xy * texel;
  vec2 state = texture(uState, uv).rg;
  vec2 around =
    texture(uState, uv - vec2(texel.x, 0.0)).rg +
    texture(uState, uv + vec2(texel.x, 0.0)).rg +
    texture(uState, uv - vec2(0.0, texel.y)).rg +
    texture(uState, uv + vec2(0.0, texel.y)).rg -
    4.0 * state;
  float next = state.r + (state.r - state.g) * 0.982 + 0.3 * around.r + 0.08 * (around.r - around.g);
  next *= 0.998;
  if (uImpulse.x != 0.0) {
    float d = segment(gl_FragCoord.xy, uStroke.xy, uStroke.zw) / uImpulse.y;
    next += uImpulse.x * exp(-d * d);
  }
  fragColor = vec4(next, state.r, 0.0, 1.0);
}`,Ce=`#version 300 es
precision highp float;
uniform sampler2D uState;
uniform vec2 uSize;
out vec4 fragColor;

void main() {
  vec2 texel = 1.0 / uSize;
  vec2 uv = gl_FragCoord.xy * texel;
  float left = texture(uState, uv - vec2(texel.x, 0.0)).r;
  float right = texture(uState, uv + vec2(texel.x, 0.0)).r;
  float down = texture(uState, uv - vec2(0.0, texel.y)).r;
  float up = texture(uState, uv + vec2(0.0, texel.y)).r;
  fragColor = vec4((right - left) * 0.5, (up - down) * 0.5, 0.0, 1.0);
}`,ke=`#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uUnit;
uniform float uTime;
uniform float uAmplitude;
uniform vec2 uFrequency;
uniform float uDetail;
uniform float uSharpness;
uniform float uDepth;
uniform float uPresence;
uniform vec3 uTint;
uniform vec2 uShift;
uniform float uRoughness;
uniform float uExposure;
uniform float uLight;
uniform sampler2D uSlope;
uniform vec2 uSlopeSize;
uniform float uRipple;
out vec4 fragColor;

vec2 slopeAt(vec2 uv) {
  vec2 st = uv * uSlopeSize - 0.5;
  vec2 i = floor(st);
  vec2 f = st - i;
  vec2 f2 = f * f;
  vec2 f3 = f2 * f;
  vec2 w0 = (-f3 + 3.0 * f2 - 3.0 * f + 1.0) / 6.0;
  vec2 w1 = (3.0 * f3 - 6.0 * f2 + 4.0) / 6.0;
  vec2 w2 = (-3.0 * f3 + 3.0 * f2 + 3.0 * f + 1.0) / 6.0;
  vec2 w3 = f3 / 6.0;
  vec2 g0 = w0 + w1;
  vec2 g1 = w2 + w3;
  vec2 h0 = (i - 0.5 + w1 / g0) / uSlopeSize;
  vec2 h1 = (i + 1.5 + w3 / g1) / uSlopeSize;
  vec2 a = texture(uSlope, vec2(h0.x, h0.y)).rg;
  vec2 b = texture(uSlope, vec2(h1.x, h0.y)).rg;
  vec2 c = texture(uSlope, vec2(h0.x, h1.y)).rg;
  vec2 d = texture(uSlope, vec2(h1.x, h1.y)).rg;
  return g0.y * (g0.x * a + g1.x * b) + g1.y * (g0.x * c + g1.x * d);
}

float lamp(vec2 p, vec2 center, vec2 size, float soft) {
  vec2 grown = size + soft;
  vec2 q = (p - center) / grown;
  q *= q;
  float d = sqrt(sqrt(dot(q, q)));
  float edge = soft / min(grown.x, grown.y);
  float shape = (1.0 - smoothstep(1.0 - edge, 1.0 + edge, d)) * (1.0 - 0.45 * d * d);
  return shape * size.x * size.y / (grown.x * grown.y);
}

vec3 studio(vec3 r, float blur) {
  vec2 p = r.xy / max(r.z + 1.0, 0.05);
  p += uShift * smoothstep(0.3, 1.0, length(p));
  float radius = length(p);
  float soft = 0.008 + blur;
  vec2 dir = p / max(radius, 1e-3);
  float key = lamp(p, vec2(-0.25, 0.42), vec2(0.3, 0.12), soft);
  float side = lamp(p, vec2(0.48, 0.12), vec2(0.06, 0.3), soft);
  float ground = lamp(p, vec2(-0.1, -0.55), vec2(0.45, 0.06), soft);
  float rise = smoothstep(-1.0, 1.0, dir.y);
  if (uLight > 0.5) {
    float edge = 0.008 + blur * 0.8;
    float lobe = smoothstep(0.15, 0.85, 0.5 + 0.5 * sin(atan(dir.y, dir.x) * 2.0 + 0.9));
    float tone = mix(2.4, 0.95, smoothstep(0.5 - edge, 1.0 + edge, radius));
    tone = mix(tone, 0.02, smoothstep(0.98 - edge, 1.12 + edge, radius));
    tone = mix(tone, mix(0.03, 0.3, lobe) * (0.8 + 0.4 * rise), smoothstep(1.15 - edge, 1.3 + edge, radius));
    float width = 0.035 + edge;
    tone += 2.4 * exp(-pow((radius - 1.4) / width, 2.0)) * min(1.0, 0.06 / width) * (0.6 + 0.4 * rise);
    return vec3(tone) * (1.0 - 0.5 * side) * (1.0 - 0.3 * ground) + 0.8 * key;
  }
  float width = 0.015 + soft * 2.0;
  float rim = exp(-abs(radius - 1.0) / width) * 0.031 / width * (0.8 + smoothstep(-0.5, 0.8, p.y));
  float band = 1.0 - 0.95 * smoothstep(1.04 - soft, 1.12 + soft, radius);
  float wall = smoothstep(1.25, 1.55, radius) * (0.6 + 0.4 * rise);
  float streak = smoothstep(0.2, 0.8, 0.5 + 0.5 * sin(atan(dir.y, dir.x) * 3.0 + 0.6));
  vec3 color = vec3(0.004, 0.004, 0.005) + 0.02 * smoothstep(-0.4, 0.6, p.y);
  color += vec3(1.0, 0.97, 0.94) * key * 4.0 + vec3(0.9, 0.95, 1.0) * side * 3.0 + ground * 1.2;
  color += vec3(1.0, 0.98, 0.95) * rim;
  color *= band;
  return color + vec3(mix(0.45, 1.8, streak)) * wall;
}

vec3 shade(vec2 slope, vec3 v, float blur, vec3 f0) {
  float steep = length(slope);
  slope *= 3.0 * tanh(steep / 3.0) / max(steep, 1e-6);
  vec3 n = normalize(vec3(-slope, 1.0));
  vec3 r = reflect(v, n);
  float facing = clamp(dot(n, -v), 0.0, 1.0);
  return studio(r, blur) * (f0 + (1.0 - f0) * pow(1.0 - facing, 5.0));
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = (2.0 * frag - uResolution) / uUnit;
  vec2 p = uv;
  vec2 rowX = vec2(1.0, 0.0);
  vec2 rowY = vec2(0.0, 1.0);
  float amplitude = uAmplitude * uPresence;
  for (float i = 1.0; i < 9.0; i++) {
    if (i > uDetail) break;
    float a = amplitude / i;
    float soften = exp(0.3 - 0.3 * i);
    float argX = i * uFrequency.x * p.y + uTime;
    p.x += a * cos(argX);
    rowX -= a * sin(argX) * i * uFrequency.x * soften * rowY;
    float argY = i * uFrequency.y * p.x + uTime;
    p.y += a * cos(argY);
    rowY -= a * sin(argY) * i * uFrequency.y * soften * rowX;
  }
  float phase = uTime - p.x - p.y;
  vec2 field = -(rowX + rowY);
  float density = max(length(field), 1e-3);
  vec2 across = field / density;
  float k = uSharpness;
  float sn = sin(phase);
  float cs = cos(phase);
  float th = tanh(k * sn);
  float bevel = (1.0 - th * th) / tanh(k);
  float fade = smoothstep(3.0, 9.0, 3.14159 * uUnit / density);
  float weight = uDepth * uPresence * fade;
  vec2 slope = k * cs * bevel * weight * across + slopeAt(frag / uResolution) * uRipple;
  vec2 sweep = -k * bevel * (sn + 2.0 * k * cs * cs * th) * weight * density * 2.0 / uUnit * across;
  vec2 stepX = dFdx(slope);
  vec2 stepY = dFdy(slope);
  vec2 crease = dot(stepX, stepX) > dot(stepY, stepY) ? stepX : stepY;
  if (dot(crease, crease) > dot(sweep, sweep)) sweep = crease;
  float bend = length(sweep);
  float alpha = smoothstep(0.0, 0.1, length(slope));
  vec3 f0 = mix(vec3(1.0), uTint, smoothstep(0.05, 0.6, length(slope))) * 0.92;
  vec3 v = normalize(vec3(uv * 0.08, -1.0));
  float blur = uRoughness * 0.35;
  vec3 light;
  if (bend < 0.01) {
    light = shade(slope, v, blur + bend * 0.5, f0);
  } else {
    light = vec3(0.0);
    for (float t = -0.375; t < 0.4; t += 0.25) {
      light += shade(slope + sweep * t, v, blur + bend * 0.15, f0);
    }
    light *= 0.25;
  }
  vec3 color = pow(aces(light * uExposure), vec3(1.0 / 2.2));
  float grain = fract(52.9829189 * fract(dot(frag, vec2(0.06711056, 0.00583715))));
  color += (grain - 0.5) / 255.0;
  fragColor = vec4(clamp(color, 0.0, 1.0) * alpha, alpha);
}`,h=(n,m,s)=>Math.min(s,Math.max(m,n)),qe=n=>{if(Array.isArray(n))return[0,1,2].map(a=>h(Number(n[a])||0,0,1));const m=String(n||"").trim(),s=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(m);if(s){const a=s[1].length===3?s[1].replace(/./g,p=>p+p):s[1];return[0,2,4].map(p=>parseInt(a.slice(p,p+2),16)/255)}const i=/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(m);return i?[i[1],i[2],i[3]].map(a=>h(parseFloat(a)/255,0,1)):[1,1,1]},Ee=(n,m,s)=>{const i=n.createShader(m);return i?(n.shaderSource(i,s),n.compileShader(i),n.getShaderParameter(i,n.COMPILE_STATUS)?i:(console.error(n.getShaderInfoLog(i)),n.deleteShader(i),null)):null},Z=(n,m)=>{const s=Ee(n,n.VERTEX_SHADER,De),i=Ee(n,n.FRAGMENT_SHADER,m),a=s&&i?n.createProgram():null;if(!s||!i||!a)return s&&n.deleteShader(s),i&&n.deleteShader(i),null;if(n.attachShader(a,s),n.attachShader(a,i),n.linkProgram(a),n.deleteShader(s),n.deleteShader(i),!n.getProgramParameter(a,n.LINK_STATUS))return console.error(n.getProgramInfoLog(a)),n.deleteProgram(a),null;const p={},N=n.getProgramParameter(a,n.ACTIVE_UNIFORMS);for(let _=0;_<N;_++){const P=n.getActiveUniform(a,_);P&&(p[P.name]=n.getUniformLocation(a,P.name))}return{program:a,uniforms:p}},Ge=({color:n="#ffffff",speed:m=.2,amplitude:s=.3,frequencyX:i=3,frequencyY:a=3,detail:p=4,thickness:N=1,depth:_=1,roughness:P=.3,exposure:ye=1,interactive:be=!0,rippleStrength:Se=1,rippleSize:Te=1,tilt:Re=1,intro:Me=!0,lightMode:Fe=!1,maxDevicePixelRatio:Ae=2,className:ee="",style:Le})=>{const te=M.useRef(null),re=M.useRef(null),Y=M.useRef(null),[oe,_e]=M.useState(0),ne={tint:qe(n).map(b=>Math.pow(b,2.2)),speed:Math.max(0,m),amplitude:h(s,0,2),frequency:[Math.max(.1,i),Math.max(.1,a)],detail:h(Math.round(p),1,8),thickness:h(N,.25,4),depth:Math.max(0,_),roughness:h(P,0,1),exposure:Math.max(0,ye),interactive:be,rippleStrength:Math.max(0,Se),rippleSize:h(Te,.2,4),tilt:Math.max(0,Re),intro:Me,light:Fe,maxRatio:h(Ae,.5,3)},F=M.useRef(ne);return F.current=ne,M.useEffect(()=>{Y.current?.()}),M.useEffect(()=>{const b=te.current,f=re.current;if(!b||!f)return;const e=f.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"}),X=e?Z(e,ke):null;if(!e||!X)return;const V=!!e.getExtension("EXT_color_buffer_float"),v=V?Z(e,ze):null,S=V?Z(e,Ce):null,D=window.matchMedia("(prefers-reduced-motion: reduce)").matches,ie=e.createVertexArray(),d={width:1,height:1},w=[];let g=null,U=0,ae=1;const u={x:0,y:0,inside:!1,ready:!1,nx:0,ny:0},c={yaw:0,pitch:0,vyaw:0,vpitch:0},I=[];let z=Math.random()*40,C=F.current.intro&&!D&&oe===0?0:1,k=0,H=0,T=0,q=0,j=!0,W=document.visibilityState!=="hidden",$=!1;const K=(o,r)=>{const t=e.createTexture();e.bindTexture(e.TEXTURE_2D,t),e.texImage2D(e.TEXTURE_2D,0,e.RG16F,o,r,0,e.RG,e.HALF_FLOAT,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const l=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,l),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT),e.bindFramebuffer(e.FRAMEBUFFER,null),{texture:t,framebuffer:l}},O=o=>{o&&(e.deleteTexture(o.texture),e.deleteFramebuffer(o.framebuffer))},J=()=>{const o=F.current,r=b.getBoundingClientRect(),t=Math.max(1,r.width),l=Math.max(1,r.height),R=Math.min(window.devicePixelRatio||1,o.maxRatio,Math.sqrt(Xe/(t*l))),A=Math.max(1,Math.round(t*R)),L=Math.max(1,Math.round(l*R));if((f.width!==A||f.height!==L)&&(f.width=A,f.height=L),ae=Math.min(A,L),!V||!v||!S)return;const x=h(Math.round(t/xe),16,512),y=h(Math.round(l/xe),16,512);x===d.width&&y===d.height&&w.length||(w.forEach(O),w.length=0,O(g),Object.assign(d,{width:x,height:y}),w.push(K(x,y),K(x,y)),g=K(x,y))},Pe=o=>{if(!(!v||!S||!g)){e.useProgram(v.program),e.viewport(0,0,d.width,d.height),e.uniform2f(v.uniforms.uSize,d.width,d.height),e.activeTexture(e.TEXTURE0),e.uniform1i(v.uniforms.uState,0);for(let r=0;r<o;r++){const t=r===0?I.shift():null;t?(e.uniform4f(v.uniforms.uStroke,t.ax,t.ay,t.bx,t.by),e.uniform2f(v.uniforms.uImpulse,t.strength,t.radius)):e.uniform2f(v.uniforms.uImpulse,0,1);const l=w[U],R=w[1-U];e.bindTexture(e.TEXTURE_2D,l.texture),e.bindFramebuffer(e.FRAMEBUFFER,R.framebuffer),e.drawArrays(e.TRIANGLES,0,3),U=1-U}e.useProgram(S.program),e.uniform2f(S.uniforms.uSize,d.width,d.height),e.uniform1i(S.uniforms.uState,0),e.bindTexture(e.TEXTURE_2D,w[U].texture),e.bindFramebuffer(e.FRAMEBUFFER,g.framebuffer),e.drawArrays(e.TRIANGLES,0,3)}},Ue=o=>{e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,f.width,f.height);const r=X.uniforms;e.useProgram(X.program),e.uniform2f(r.uResolution,f.width,f.height),e.uniform1f(r.uUnit,ae),e.uniform1f(r.uTime,z),e.uniform1f(r.uAmplitude,o.amplitude),e.uniform2f(r.uFrequency,o.frequency[0],o.frequency[1]),e.uniform1f(r.uDepth,o.depth),e.uniform1f(r.uDetail,o.detail),e.uniform1f(r.uSharpness,5/(3*o.thickness)),e.uniform1f(r.uPresence,1-Math.pow(1-C,3)),e.uniform3fv(r.uTint,o.tint),e.uniform2f(r.uShift,c.yaw,c.pitch),e.uniform1f(r.uRoughness,o.roughness),e.uniform1f(r.uExposure,o.exposure),e.uniform1f(r.uLight,o.light?1:0),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,g?g.texture:null),e.uniform1i(r.uSlope,0),e.uniform2f(r.uSlopeSize,d.width,d.height),e.uniform1f(r.uRipple,g?o.rippleStrength*2.2:0),e.drawArrays(e.TRIANGLES,0,3)},se=o=>{if(T=0,$)return;const r=F.current,t=h((o-q)/1e3||0,0,.05);q=Math.max(q,o),z+=t*r.speed*(D?.25:1),C=Math.min(1,C+t/1.8);const l=r.interactive&&u.inside,R=D?0:r.tilt,A=(l?u.nx*.35:.22*Math.sin(z*1.3))*R,L=(l?-u.ny*.28:.16*Math.sin(z*.9+1.7))*R,x=36,y=2*Math.sqrt(x)*.95;if(c.vyaw+=((A-c.yaw)*x-c.vyaw*y)*t,c.vpitch+=((L-c.pitch)*x-c.vpitch*y)*t,c.yaw+=c.vyaw*t,c.pitch+=c.vpitch*t,e.bindVertexArray(ie),g){H+=t;const G=Math.min(4,Math.floor(H/we));H-=G*we,G>0&&(Pe(G),k=Math.max(0,k*Math.pow(.982,G)))}Ue(r);const Ie=Math.abs(c.vyaw)+Math.abs(c.vpitch)>1e-4||Math.abs(A-c.yaw)+Math.abs(L-c.pitch)>1e-4;(r.speed>0||C<1||Ie||k>.002||I.length>0)&&j&&W&&(T=requestAnimationFrame(se))},E=()=>{T||$||!j||!W||(q=performance.now(),T=requestAnimationFrame(se))};Y.current=()=>{J(),E()};const ue=(o,r)=>{const t=b.getBoundingClientRect();return{x:(o-t.left)/t.width*d.width,y:(1-(r-t.top)/t.height)*d.height,nx:(o-t.left)/t.width*2-1,ny:(r-t.top)/t.height*2-1,inside:o>=t.left&&o<=t.right&&r>=t.top&&r<=t.bottom}},ce=(o,r)=>{!g||!r.interactive||D||(I.push(o),I.length>6&&I.shift(),k=1)},fe=o=>{const r=F.current,t=ue(o.clientX,o.clientY);if(u.nx=h(t.nx,-1,1),u.ny=h(t.ny,-1,1),u.inside=t.inside,t.inside&&u.ready){const l=Math.hypot(t.x-u.x,t.y-u.y);l>.25&&ce({ax:u.x,ay:u.y,bx:t.x,by:t.y,strength:-Math.min(.45,.04+l*.045)*r.rippleSize,radius:4*r.rippleSize},r)}u.x=t.x,u.y=t.y,u.ready=t.inside,E()},le=o=>{const r=F.current,t=ue(o.clientX,o.clientY);t.inside&&(ce({ax:t.x,ay:t.y,bx:t.x,by:t.y,strength:-1.6*r.rippleSize,radius:6*r.rippleSize},r),E())},Q=()=>{u.inside=!1,u.ready=!1,E()},B=o=>{o.pointerType!=="mouse"&&Q()};window.addEventListener("pointermove",fe,{passive:!0}),window.addEventListener("pointerdown",le,{passive:!0}),window.addEventListener("pointerup",B,{passive:!0}),window.addEventListener("pointercancel",B,{passive:!0}),document.documentElement.addEventListener("pointerleave",Q);const de=o=>{o.preventDefault(),$=!0,cancelAnimationFrame(T),T=0},he=()=>_e(o=>o+1);f.addEventListener("webglcontextlost",de),f.addEventListener("webglcontextrestored",he);const me=new ResizeObserver(()=>{J(),E()});me.observe(b);const pe=new IntersectionObserver(o=>{j=o.some(r=>r.isIntersecting),E()});pe.observe(b);const ve=()=>{W=document.visibilityState!=="hidden",E()};return document.addEventListener("visibilitychange",ve),J(),E(),()=>{cancelAnimationFrame(T),Y.current=null,me.disconnect(),pe.disconnect(),window.removeEventListener("pointermove",fe),window.removeEventListener("pointerdown",le),window.removeEventListener("pointerup",B),window.removeEventListener("pointercancel",B),document.documentElement.removeEventListener("pointerleave",Q),document.removeEventListener("visibilitychange",ve),f.removeEventListener("webglcontextlost",de),f.removeEventListener("webglcontextrestored",he),e.isContextLost()||(w.forEach(O),O(g),e.deleteVertexArray(ie),e.deleteProgram(X.program),v&&e.deleteProgram(v.program),S&&e.deleteProgram(S.program))}},[oe]),ge.jsx("div",{ref:te,className:`liquid-chrome${ee?` ${ee}`:""}`,style:Le,children:ge.jsx("canvas",{ref:re,className:"liquid-chrome__canvas","aria-hidden":"true"})})};export{Ge as default};
