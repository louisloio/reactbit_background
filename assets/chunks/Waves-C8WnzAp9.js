import{r as z,j as Ge}from"../text-animations-Cpfg-DyU.js";const mt={solid:0,dashed:1},_=12,ht=4,vt=2.2,ze=640,Ee=64,dt=Ee*Math.sqrt(Math.PI/2)/ze,je=16e5,pt=`#version 300 es
precision highp float;
precision highp int;
uniform vec2 uView;
uniform float uRatio;
uniform vec2 uAxis;
uniform float uSpacing;
uniform float uStep;
uniform vec2 uStart;
uniform float uAmplitude;
uniform vec2 uFrequency;
uniform vec2 uDrift;
uniform float uTwist;
uniform uint uSeed;
uniform sampler2D uField;
uniform ivec2 uFieldSize;
uniform float uCell;
uniform float uLimit;
uniform float uReach;
uniform float uReveal;
uniform float uBand;
out float vAcross;
out float vAlong;
out float vEnergy;
out float vShow;
out float vPhase;

const vec2 GRADIENTS[12] = vec2[12](
  vec2(1.0, 1.0), vec2(-1.0, 1.0), vec2(1.0, -1.0), vec2(-1.0, -1.0),
  vec2(1.0, 0.0), vec2(-1.0, 0.0), vec2(1.0, 0.0), vec2(-1.0, 0.0),
  vec2(0.0, 1.0), vec2(0.0, -1.0), vec2(0.0, 1.0), vec2(0.0, -1.0)
);

vec2 gradient(vec2 cell) {
  uvec2 q = uvec2(ivec2(cell) + 65536) + uvec2(uSeed * 7919u, uSeed * 104729u);
  q = 1103515245u * ((q >> 1u) ^ q.yx);
  uint n = 1103515245u * (q.x ^ (q.y >> 3u));
  return GRADIENTS[(n >> 16u) % 12u];
}

float ease(float t) {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float perlin(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  float n00 = dot(gradient(i), f);
  float n10 = dot(gradient(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float n01 = dot(gradient(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float n11 = dot(gradient(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  vec2 u = vec2(ease(f.x), ease(f.y));
  return mix(mix(n00, n10, u.x), mix(n01, n11, u.x), u.y);
}

vec2 node(ivec2 cell) {
  return texelFetch(uField, clamp(cell, ivec2(0), uFieldSize - 1), 0).xy;
}

void weights(float f, out vec4 w, out vec4 d) {
  float g = 1.0 - f;
  float f2 = f * f;
  float f3 = f2 * f;
  w = vec4(g * g * g, 3.0 * f3 - 6.0 * f2 + 4.0, -3.0 * f3 + 3.0 * f2 + 3.0 * f + 1.0, f3) / 6.0;
  d = vec4(-g * g, 3.0 * f2 - 4.0 * f, -3.0 * f2 + 2.0 * f + 1.0, f2) * 0.5;
}

vec2 field(vec2 point, out mat2 slope) {
  vec2 t = point / uCell;
  vec2 base = floor(t);
  vec2 f = t - base;
  vec4 wx;
  vec4 dx;
  vec4 wy;
  vec4 dy;
  weights(f.x, wx, dx);
  weights(f.y, wy, dy);
  ivec2 origin = ivec2(base) - 1;
  vec2 value = vec2(0.0);
  vec2 alongX = vec2(0.0);
  vec2 alongY = vec2(0.0);
  for (int j = 0; j < 4; j++) {
    vec2 row = vec2(0.0);
    vec2 rowSlope = vec2(0.0);
    for (int i = 0; i < 4; i++) {
      vec2 tap = node(origin + ivec2(i, j));
      row += tap * wx[i];
      rowSlope += tap * dx[i];
    }
    value += row * wy[j];
    alongX += rowSlope * wy[j];
    alongY += row * dy[j];
  }
  float size = length(value);
  float scale = size > 0.0001 ? uLimit * tanh(size / uLimit) / size : 1.0;
  slope = mat2(alongX, alongY) * (scale / uCell);
  return value * scale;
}

vec2 wave(vec2 rest) {
  float turn = perlin(rest * uFrequency + uDrift) * 12.0 * uTwist;
  vec2 local = rest + vec2(cos(turn), sin(turn) * 0.5) * uAmplitude;
  return uView * 0.5 + vec2(local.x * uAxis.x - local.y * uAxis.y, local.x * uAxis.y + local.y * uAxis.x);
}

void main() {
  int index = gl_VertexID >> 1;
  float side = float(gl_VertexID & 1) * 2.0 - 1.0;
  float u = uStart.x + float(gl_InstanceID) * uSpacing;
  float v = uStart.y + float(index) * uStep;
  vec2 flowing = wave(vec2(u, v));
  vec2 bend = wave(vec2(u, v + uStep)) - wave(vec2(u, v - uStep));
  mat2 slope;
  vec2 shift = field(flowing, slope);
  vec2 point = flowing + shift;
  float energy = length(shift);
  vec2 tangent = bend + slope * bend;
  float span = max(length(tangent), 0.0001);
  vec2 normal = vec2(-tangent.y, tangent.x) / span;
  vec2 corner = point + normal * side * uReach / uRatio;
  vAcross = side * uReach;
  vAlong = v;
  vEnergy = energy;
  vShow = clamp((uReveal - abs(u)) / uBand, 0.0, 1.0);
  uint line = uint(gl_InstanceID) * 747796405u + uSeed * 2891336453u + 1u;
  line = ((line >> ((line >> 28u) + 4u)) ^ line) * 277803737u;
  vPhase = float((line >> 22u) ^ line) / 4294967295.0;
  vec2 clip = corner / uView * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}`,xt=`#version 300 es
precision highp float;
uniform vec2 uView;
uniform float uRatio;
uniform float uHalf;
uniform float uThin;
uniform int uStyle;
uniform float uPeriod;
uniform float uFlow;
uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uBase;
uniform float uHeat;
uniform float uFade;
uniform float uOpacity;
in float vAcross;
in float vAlong;
in float vEnergy;
in float vShow;
in float vPhase;
out vec4 outColor;

float smootherstep(float edge, float x) {
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  float coverage = clamp(uHalf + 0.5 - abs(vAcross), 0.0, 1.0) * uThin;
  if (uStyle == 1) {
    float phase = (vAlong + uFlow) / uPeriod + vPhase;
    float blur = max(fwidth(phase), 0.0001);
    coverage *= clamp((0.25 - abs(fract(phase) - 0.5)) / blur + 0.5, 0.0, 1.0);
  }
  float heat = smoothstep(0.0, uHeat, vEnergy);
  vec2 uv = gl_FragCoord.xy / (uView * uRatio);
  float edge = uFade * 0.5;
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);
  float alpha = coverage * mix(uBase, 1.0, heat) * mask * vShow * uOpacity;
  outColor = vec4(mix(uColor, uAccent, heat) * alpha, alpha);
}`,T=(a,f,R)=>Math.min(R,Math.max(f,a)),ye=a=>{const f=T(a,0,1);return f*f*f*(f*(f*6-15)+10)},ke=(a,f,R)=>{const u=a.createShader(f);return u?(a.shaderSource(u,R),a.compileShader(u),a.getShaderParameter(u,a.COMPILE_STATUS)?u:(a.deleteShader(u),null)):null},gt=a=>{const f=ke(a,a.VERTEX_SHADER,pt),R=ke(a,a.FRAGMENT_SHADER,xt),u=a.createProgram();if(!f||!R||!u)return null;if(a.attachShader(u,f),a.attachShader(u,R),a.linkProgram(u),a.deleteShader(f),a.deleteShader(R),!a.getProgramParameter(u,a.LINK_STATUS))return a.deleteProgram(u),null;const ee={},ce=a.getProgramParameter(u,a.ACTIVE_UNIFORMS);for(let B=0;B<ce;B++){const H=a.getActiveUniform(u,B);H&&(ee[H.name]=a.getUniformLocation(u,H.name))}return{program:u,uniforms:ee}},yt=({lineColor:a="#ffffff",accentColor:f,backgroundColor:R="transparent",lineStyle:u="solid",spacing:ee=10,lineWidth:ce=1,rotation:B=0,amplitude:H=32,scale:Be=1,twist:He=1,speed:We=1,variation:Ye=0,mouseInteraction:Ke=!0,mouseRadius:$e=175,mouseStrength:Je=1,bounce:Qe=.5,returnDuration:Ze=1.4,clickRipple:et=!0,intro:tt=!0,fade:ot=0,opacity:nt=1,lightMode:it=!1,paused:at=!1,dpr:rt,className:Me="",style:st})=>{const Te=z.useRef(null),Re=z.useRef(null),le=z.useRef(null),Se={lineColor:String(a),accentColor:f?String(f):"",lineStyle:mt[u]??0,spacing:Math.max(2,ee),lineWidth:Math.max(.25,ce),rotation:B,amplitude:Math.max(0,H),scale:Math.max(.05,Be),twist:Math.max(0,He),speed:We,variation:Math.max(0,Math.round(Ye)),mouseInteraction:Ke,mouseRadius:Math.max(20,$e),mouseStrength:Math.max(0,Je),bounce:T(Qe,0,1),returnDuration:Math.max(.2,Ze),clickRipple:et,intro:tt,fade:T(ot,0,1),opacity:T(nt,0,1),lightMode:it,paused:at,dpr:rt},y=z.useRef(Se);return y.current=Se,z.useEffect(()=>{const V=Te.current,D=Re.current,e=D?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!V||!D||!e)return;const te=gt(e);if(!te)return;const r=te.uniforms,be=e.createVertexArray(),W=e.createTexture();e.bindTexture(e.TEXTURE_2D,W),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.pixelStorei(e.UNPACK_ALIGNMENT,1);const q=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),P=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,ue=new Map,Ae=t=>{if(ue.has(t))return ue.get(t);let i=[1,1,1];if(q){q.clearRect(0,0,1,1),q.fillStyle="#ffffff",q.fillStyle=t,q.fillRect(0,0,1,1);const[s,l,c]=q.getImageData(0,0,1,1).data;i=[s/255,l/255,c/255]}return ue.set(t,i),i},ct=t=>{const i=t.map(c=>Math.pow(c,2.2)),s=.2126*i[0]+.7152*i[1]+.0722*i[2],l=Math.min(1,.045/Math.max(s,1e-4));return i.map(c=>Math.pow(c*l,1/2.2))},d={width:1,height:1,ratio:1},o={cols:0,rows:0,shift:new Float32Array(0),speed:new Float32Array(0),top:0,bottom:-1,left:0,right:-1},n={x:0,y:0,sx:0,sy:0,vx:0,vy:0,inside:!1},C=[],E={flow:0,intro:y.current.intro&&!P?0:1};let G=0,U=0,oe=!0;const lt=t=>Math.max(12,t.mouseRadius*.5),ut=()=>{o.cols=Math.ceil(d.width/_)+2,o.rows=Math.ceil(d.height/_)+2,o.shift=new Float32Array(o.cols*o.rows*2),o.speed=new Float32Array(o.cols*o.rows*2),o.top=0,o.bottom=-1,o.left=0,o.right=-1,e.bindTexture(e.TEXTURE_2D,W),e.texImage2D(e.TEXTURE_2D,0,e.RG32F,o.cols,o.rows,0,e.RG,e.FLOAT,o.shift)},_e=(t,i,s,l)=>{const c=T(Math.floor(t/_),0,o.cols-1),h=T(Math.ceil(s/_),0,o.cols-1),S=T(Math.floor(i/_),0,o.rows-1),x=T(Math.ceil(l/_),0,o.rows-1),v=o.bottom<o.top;o.top=v?S:Math.min(o.top,S),o.bottom=v?x:Math.max(o.bottom,x),o.left=v?c:Math.min(o.left,c),o.right=v?h:Math.max(o.right,h)},ft=t=>{const i=y.current,s=1-Math.exp(-t/.045),l=n.sx+(n.x-n.sx)*s,c=n.sy+(n.y-n.sy)*s,h=1-Math.exp(-t/.06);n.vx+=((l-n.sx)/t-n.vx)*h,n.vy+=((c-n.sy)/t-n.vy)*h,n.sx=l,n.sy=c;const S=1-.85*i.bounce,x=4/(S*i.returnDuration),v=i.mouseRadius,b=Math.hypot(n.vx,n.vy),L=i.mouseInteraction&&n.inside&&!P?26e3*Math.tanh(b/1400)*i.mouseStrength:0;L>1&&_e(n.sx-v,n.sy-v,n.sx+v,n.sy+v);const I=[];for(let m=C.length-1;m>=0;m--){const g=C[m];g.age+=t;const F=g.age*ze,k=1-F/g.range;if(k<=0){C.splice(m,1);continue}const p=F+Ee*3;_e(g.x-p,g.y-p,g.x+p,g.y+p),I.push({x:g.x,y:g.y,front:F,power:150*x*k*Math.sqrt(k)/dt})}if(o.bottom<o.top)return!1;const Y=x*x,K=2*S*x,ae=Math.min(16,Math.max(1,Math.ceil(t/Math.min(1/120,.6/x)))),N=t/ae,me=b>.001?n.vx/b:0,he=b>.001?n.vy/b:0,{cols:w,shift:A,speed:O,left:j,right:ve}=o;let de=0;for(let m=o.top;m<=o.bottom;m++){const g=m*_;for(let F=j;F<=ve;F++){const k=F*_,p=(m*w+F)*2;let xe=0,ge=0;if(L>1){const M=Math.hypot(k-n.sx,g-n.sy);if(M<v){const Q=ye(1-M/v)*L;xe+=me*Q,ge+=he*Q}}for(const M of I){const Q=k-M.x,Ve=g-M.y,Z=Math.hypot(Q,Ve),we=(Z-M.front)/Ee;if(Z>.001&&Math.abs(we)<3){const qe=M.power*Math.exp(-we*we*2)*ye(Z/56);xe+=Q/Z*qe,ge+=Ve/Z*qe}}let re=A[p],se=A[p+1],$=O[p],J=O[p+1];for(let M=0;M<ae;M++)$+=(xe-Y*re-K*$)*N,J+=(ge-Y*se-K*J)*N,re+=$*N,se+=J*N;A[p]=re,A[p+1]=se,O[p]=$,O[p+1]=J,de=Math.max(de,Math.abs(re)+Math.abs(se)+(Math.abs($)+Math.abs(J))*.05)}}const pe=o.top,Oe=o.bottom-o.top+1;if(de<.02&&L<=1&&!I.length){for(let m=o.top;m<=o.bottom;m++)A.fill(0,(m*w+j)*2,(m*w+ve+1)*2),O.fill(0,(m*w+j)*2,(m*w+ve+1)*2);o.top=0,o.bottom=-1}return e.bindTexture(e.TEXTURE_2D,W),e.texSubImage2D(e.TEXTURE_2D,0,0,pe,w,Oe,e.RG,e.FLOAT,A.subarray(pe*w*2,(pe+Oe)*w*2)),o.bottom>=o.top},ne=()=>{const t=y.current,i=t.rotation*Math.PI/180,s=Math.cos(i),l=Math.sin(i),c=lt(t),h=t.amplitude*1.1+c+t.spacing*2+8,S=(d.width*Math.abs(s)+d.height*Math.abs(l))/2+h,x=(d.width*Math.abs(l)+d.height*Math.abs(s))/2+h,v=Math.ceil(S/t.spacing),b=v*2+1;let L=ht,I=Math.ceil(x*2/L)+1;b*I*2>je&&(I=Math.max(16,Math.floor(je/(b*2))),L=x*2/(I-1));const Y=t.lineWidth*d.ratio,K=Math.max(.5,Y/2),ae=K+1,N=E.intro,me=t.intro&&!P?(1-Math.pow(1-T(N/.7,0,1),3))*S*1.3:1e6,he=t.intro&&!P?ye((N-.1)/.9):1,w=Ae(t.lineColor),A=t.lightMode?ct(w):w,O=t.accentColor?Ae(t.accentColor):A,j=E.flow+t.variation*37.1;e.viewport(0,0,D.width,D.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA),e.useProgram(te.program),e.bindVertexArray(be),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,W),e.uniform1i(r.uField,0),e.uniform2f(r.uView,d.width,d.height),e.uniform1f(r.uRatio,d.ratio),e.uniform2f(r.uAxis,s,l),e.uniform1f(r.uSpacing,t.spacing),e.uniform1f(r.uStep,L),e.uniform2f(r.uStart,-v*t.spacing,-x),e.uniform1f(r.uAmplitude,t.amplitude*he),e.uniform2f(r.uFrequency,.002/t.scale,.0015/t.scale),e.uniform2f(r.uDrift,j*.025,j*.0075),e.uniform1f(r.uTwist,t.twist),e.uniform1ui(r.uSeed,t.variation),e.uniform2i(r.uFieldSize,o.cols,o.rows),e.uniform1f(r.uCell,_),e.uniform1f(r.uLimit,c),e.uniform1f(r.uReach,ae),e.uniform1f(r.uReveal,me),e.uniform1f(r.uBand,Math.max(1,S*.3)),e.uniform1f(r.uHalf,K),e.uniform1f(r.uThin,Math.min(1,Y)),e.uniform1i(r.uStyle,t.lineStyle),e.uniform1f(r.uPeriod,t.spacing*2.6),e.uniform1f(r.uFlow,E.flow*16%(t.spacing*2.6)),e.uniform3fv(r.uColor,A),e.uniform3fv(r.uAccent,O),e.uniform1f(r.uBase,.62),e.uniform1f(r.uHeat,c*.55),e.uniform1f(r.uFade,t.fade),e.uniform1f(r.uOpacity,t.opacity),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,I*2,b)},Pe=t=>{if(G=0,!oe||document.hidden)return;const i=y.current,s=U?T((t-U)/1e3,5e-4,.05):1/60;if(U=t,i.paused){E.intro=1,ne(),U=0;return}P||(E.flow+=s*i.speed),!i.intro||P?E.intro=1:E.intro<1&&(E.intro=Math.min(1,E.intro+s/vt));const l=ft(s);ne();const c=n.inside&&i.mouseInteraction&&Math.hypot(n.vx,n.vy)>1;!P||l||c||C.length||E.intro<1?G=requestAnimationFrame(Pe):U=0},X=()=>{!G&&oe&&!document.hidden&&(G=requestAnimationFrame(Pe))},fe=()=>{const t=y.current,i=Math.max(1,V.clientWidth),s=Math.max(1,V.clientHeight),l=Math.min(t.dpr||window.devicePixelRatio||1,2);d.width=i,d.height=s,D.width=Math.max(1,Math.round(i*l)),D.height=Math.max(1,Math.round(s*l)),d.ratio=D.width/i,ut(),ne(),X()},Le=(t,i)=>{const s=V.getBoundingClientRect(),l=t.clientX-s.left,c=t.clientY-s.top,h=l>=0&&c>=0&&l<=s.width&&c<=s.height;return(i||h&&!n.inside)&&(n.sx=l,n.sy=c,n.vx=0,n.vy=0),n.inside=h,n.x=l,n.y=c,{x:l,y:c,rect:s,inside:h}},Ie=t=>{Le(t,!1),y.current.paused||X()},Fe=t=>{const i=y.current,{x:s,y:l,rect:c,inside:h}=Le(t,t.pointerType!=="mouse");h&&i.clickRipple&&!i.paused&&!P&&(C.push({x:s,y:l,age:0,range:Math.max(360,Math.hypot(c.width,c.height)*.55)}),C.length>6&&C.shift()),X()},ie=t=>{t.pointerType!=="mouse"&&(n.inside=!1)},De=()=>{n.inside=!1,X()},Ce=()=>{U=0,X()},Ue=new ResizeObserver(fe);Ue.observe(V);const Xe=new IntersectionObserver(t=>{oe=t.some(i=>i.isIntersecting),oe&&(U=0,X())});Xe.observe(V),window.addEventListener("pointermove",Ie,{passive:!0}),window.addEventListener("pointerdown",Fe,{passive:!0}),window.addEventListener("pointerup",ie,{passive:!0}),window.addEventListener("pointercancel",ie,{passive:!0}),document.documentElement.addEventListener("pointerleave",De),document.addEventListener("visibilitychange",Ce),fe();let Ne=y.current.dpr;return le.current=()=>{const t=y.current;if(t.dpr!==Ne){Ne=t.dpr,fe();return}G||ne(),X()},()=>{cancelAnimationFrame(G),le.current=null,Ue.disconnect(),Xe.disconnect(),window.removeEventListener("pointermove",Ie),window.removeEventListener("pointerdown",Fe),window.removeEventListener("pointerup",ie),window.removeEventListener("pointercancel",ie),document.documentElement.removeEventListener("pointerleave",De),document.removeEventListener("visibilitychange",Ce),e.deleteProgram(te.program),e.deleteVertexArray(be),e.deleteTexture(W),e.getExtension("WEBGL_lose_context")?.loseContext()}},[]),z.useEffect(()=>{le.current?.()}),Ge.jsx("div",{ref:Te,className:`waves${Me?` ${Me}`:""}`,style:{backgroundColor:R,...st},children:Ge.jsx("canvas",{ref:Re,className:"waves__canvas","aria-hidden":"true"})})};export{yt as default};
