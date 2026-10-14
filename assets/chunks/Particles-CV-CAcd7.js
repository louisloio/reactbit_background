import{r as G,j as Qe}from"../text-animations-Cof0zUdW.js";const kt={circle:0,square:1,ring:2,sparkle:3},Dt={parallax:0,repel:1,attract:2},Ot={none:0,up:1,down:2,forward:3},zt=2e4,et=900,tt=9e3,te=4,me=10,ve=1/Math.tan(7.5*Math.PI/180),rt=.1,U=100,It=1.8,_e=1.5,it=520,st=46,Vt=`#version 300 es
precision highp float;
layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec3 aPosition;
layout(location = 2) in vec4 aRandom;
layout(location = 3) in vec3 aColor;
uniform mat3 uRotation;
uniform vec3 uOffset;
uniform float uSpread;
uniform float uTime;
uniform float uCamera;
uniform float uAspect;
uniform vec2 uView;
uniform float uRatio;
uniform float uSize;
uniform float uRandomness;
uniform float uBlur;
uniform float uFocus;
uniform float uGlow;
uniform float uTwinkle;
uniform int uShape;
uniform int uDrift;
uniform float uTravel;
uniform vec4 uPointer;
uniform int uEffect;
uniform float uStrength;
uniform vec4 uBursts[${te}];
uniform int uBurstCount;
uniform float uReveal;
out vec2 vLocal;
out float vRadius;
out float vBlur;
out float vAlpha;
out float vHalo;
out float vSeed;
out vec3 vColor;

vec3 bob(vec4 r, float t) {
  return vec3(
    sin(t * r.z + 6.28 * r.w) * mix(0.1, 1.5, r.x),
    sin(t * r.y + 6.28 * r.x) * mix(0.1, 1.5, r.w),
    sin(t * r.w + 6.28 * r.y) * mix(0.1, 1.5, r.z)
  );
}

void main() {
  vec3 pos = aPosition * uSpread;
  pos.z *= ${me.toFixed(1)};
  vec3 wobble = bob(aRandom, uTime);
  vec3 world = uRotation * pos + uOffset + wobble;
  float edge = 1.0;
  if (uDrift == 1 || uDrift == 2) {
    float span = uSpread * 2.0 + 3.0;
    float k = mod(aRandom.w * span + uOffset.y + wobble.y + (uDrift == 1 ? uTravel : -uTravel), span);
    world.y = k - span * 0.5;
    edge = smoothstep(0.0, span * 0.12, k) * smoothstep(span, span * 0.88, k);
  } else if (uDrift == 3) {
    float span = uSpread * ${me.toFixed(1)} * 2.0 + 3.0;
    float k = mod(aRandom.y * span + uOffset.z + wobble.z + uTravel, span);
    world.z = k - span * 0.5;
    edge = smoothstep(0.0, span * 0.1, k);
  }
  vec3 view = world - vec3(0.0, 0.0, uCamera);
  float dist = length(view);
  float ahead = -view.z;
  if (ahead < ${rt.toFixed(2)} || ahead > ${U.toFixed(1)}) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    return;
  }
  edge *= smoothstep(1.0, 4.0, ahead);
  vec2 ndc = vec2(view.x * ${ve.toFixed(6)} / uAspect, view.y * ${ve.toFixed(6)}) / ahead;
  vec2 screen = (ndc * 0.5 + 0.5) * uView;

  vec2 shift = vec2(0.0);
  float flash = 0.0;
  if (uEffect != 0 && uPointer.z > 0.001) {
    vec2 delta = screen - uPointer.xy;
    float reach = length(delta);
    float falloff = exp(-dot(delta, delta) / (uPointer.w * uPointer.w));
    vec2 away = reach > 0.001 ? delta / reach : vec2(0.0);
    shift += (uEffect == 1 ? away * uPointer.w * 0.5 : -delta * 0.6) * falloff * uStrength * uPointer.z;
  }
  for (int i = 0; i < ${te}; i++) {
    if (i >= uBurstCount) break;
    vec4 burst = uBursts[i];
    vec2 delta = screen - burst.xy;
    float reach = length(delta);
    float wave = exp(-pow((reach - burst.z * ${it.toFixed(1)}) / ${st.toFixed(1)}, 2.0));
    vec2 away = reach > 0.001 ? delta / reach : vec2(0.0);
    float fade = (1.0 - burst.z) * (1.0 - burst.z) * burst.w;
    shift += away * wave * fade * 56.0 * smoothstep(0.0, 30.0, reach);
    flash += wave * fade;
  }
  screen += shift;

  float diameter = (uRandomness <= 0.0 ? uSize : uSize * (1.0 + uRandomness * (aRandom.x - 0.5)) / dist) * (1.0 + min(flash, 1.0) * 0.6);
  float device = diameter * uRatio;
  float radius = max(diameter, 1.0 / uRatio) * 0.5;
  float coverage = min(1.0, device * device);
  float blur = uBlur * max(uFocus - dist, 0.0) / max(dist, 1.0);
  float halo = uGlow > 0.0 ? radius * 2.5 + 2.0 : 0.0;
  float extent = radius * (uShape == 3 ? 1.6 : 1.0) + blur + halo + 1.5;

  float twinkle = 1.0 - uTwinkle * 0.6 * (0.5 + 0.5 * sin(uTime * (6.0 + aRandom.y * 14.0) + aRandom.w * 40.0));
  float far = smoothstep(${U.toFixed(1)}, ${(U*.9).toFixed(1)}, ahead);
  float focus = radius / (radius + blur);
  float reveal = clamp(uReveal * 1.6 - aRandom.z * 0.6, 0.0, 1.0);

  vLocal = aCorner * extent;
  vRadius = radius;
  vBlur = blur;
  vHalo = halo;
  vSeed = aRandom.y;
  vAlpha = min(1.0, coverage * twinkle * (1.0 + flash * 1.4)) * far * edge * max(focus, 0.35) * reveal * reveal;
  vColor = aColor;
  gl_Position = vec4((screen + aCorner * extent) / uView * 2.0 - 1.0, 0.0, 1.0);
}`,Ut=`#version 300 es
precision highp float;
precision highp int;
uniform int uShape;
uniform float uGlow;
uniform float uRatio;
uniform float uTime;
uniform float uSoft;
uniform float uShimmer;
uniform float uOpacity;
in vec2 vLocal;
in float vRadius;
in float vBlur;
in float vAlpha;
in float vHalo;
in float vSeed;
in vec3 vColor;
out vec4 outColor;

float ray(vec2 q, float aa) {
  float width = 0.14 * max(0.0, 1.0 - q.x);
  return (1.0 - smoothstep(width - aa, width + aa, q.y)) * step(q.x, 1.0);
}

void main() {
  float soft = vBlur + 0.7 / uRatio + vRadius * uSoft;
  float d = length(vLocal);
  float shape;
  if (uShape == 1) {
    float box = max(abs(vLocal.x), abs(vLocal.y));
    shape = 1.0 - smoothstep(vRadius * 0.86 - soft, vRadius * 0.86 + soft, box);
  } else if (uShape == 2) {
    float edge = max(vRadius * 0.22, 0.6 / uRatio);
    shape = 1.0 - smoothstep(edge - soft, edge + soft, abs(d - vRadius * 0.8));
  } else if (uShape == 3) {
    float reach = vRadius * 1.6;
    vec2 q = abs(vLocal) / max(reach, 0.0001);
    float aa = soft / max(reach, 0.0001);
    shape = max(max(ray(q, aa), ray(q.yx, aa)), 1.0 - smoothstep(vRadius * 0.32 - soft, vRadius * 0.32 + soft, d));
  } else {
    shape = 1.0 - smoothstep(vRadius - soft, vRadius + soft, d);
  }
  float halo = vHalo > 0.0 ? exp(-d / (vHalo * 0.35)) * uGlow * 0.4 : 0.0;
  float alpha = clamp(shape + halo * (1.0 - shape), 0.0, 1.0) * vAlpha * uOpacity * (1.0 - uSoft);
  if (alpha < 0.002) discard;
  vec2 uv = vLocal / max(vRadius * 2.0, 0.0001) + 0.5;
  vec3 color = clamp(vColor + uShimmer * 0.2 * sin(uv.yxx + uTime + vSeed * 6.28), 0.0, 1.0);
  outColor = vec4(color * alpha, alpha);
}`,Yt=`#version 300 es
precision highp float;
layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec4 aEnds;
layout(location = 2) in vec4 aTint;
uniform vec2 uView;
uniform float uRatio;
uniform float uWidth;
out float vAcross;
out float vHalf;
out vec4 vTint;

void main() {
  vec2 a = aEnds.xy;
  vec2 b = aEnds.zw;
  vec2 along = b - a;
  float span = max(length(along), 0.0001);
  vec2 normal = vec2(-along.y, along.x) / span;
  float reach = uWidth * 0.5 + 1.0 / uRatio;
  vec2 point = mix(a, b, aCorner.x * 0.5 + 0.5) + normal * aCorner.y * reach;
  vAcross = aCorner.y * reach;
  vHalf = uWidth * 0.5;
  vTint = aTint;
  gl_Position = vec4(point / uView * 2.0 - 1.0, 0.0, 1.0);
}`,Nt=`#version 300 es
precision highp float;
uniform float uRatio;
uniform float uOpacity;
in float vAcross;
in float vHalf;
in vec4 vTint;
out vec4 outColor;

void main() {
  float edge = 0.6 / uRatio;
  float cover = 1.0 - smoothstep(vHalf - edge, vHalf + edge, abs(vAcross));
  float alpha = cover * vTint.a * uOpacity;
  outColor = vec4(vTint.rgb * alpha, alpha);
}`,S=(i,g,R)=>Math.min(R,Math.max(g,i)),ot=(i,g,R)=>{const F=i.createShader(g);return F?(i.shaderSource(F,R),i.compileShader(F),i.getShaderParameter(F,i.COMPILE_STATUS)?F:(i.deleteShader(F),null)):null},at=(i,g,R)=>{const F=ot(i,i.VERTEX_SHADER,g),j=ot(i,i.FRAGMENT_SHADER,R),T=i.createProgram();if(!F||!j||!T)return null;if(i.attachShader(T,F),i.attachShader(T,j),i.linkProgram(T),i.deleteShader(F),i.deleteShader(j),!i.getProgramParameter(T,i.LINK_STATUS))return i.deleteProgram(T),null;const oe={},pe=i.getProgramParameter(T,i.ACTIVE_UNIFORMS);for(let K=0;K<pe;K++){const Z=i.getActiveUniform(T,K);Z&&(oe[Z.name.replace("[0]","")]=i.getUniformLocation(T,Z.name))}return{program:T,uniforms:oe}},$t=i=>{let g=i>>>0;return()=>{g=g+1831565813>>>0;let R=g;return R=Math.imul(R^R>>>15,R|1),R^=R+Math.imul(R^R>>>7,R|61),((R^R>>>14)>>>0)/4294967296}},Ht=i=>1-Math.pow(1-S(i,0,1),3),nt=(i,g)=>(i%g+g)%g,qt=({particleCount:i=200,particleSpread:g=10,speed:R=.1,particleColors:F=["#ffffff"],moveParticlesOnHover:j=!0,particleHoverFactor:T=1,alphaParticles:oe=!1,particleBaseSize:pe=100,sizeRandomness:K=1,cameraDistance:Z=20,disableRotation:ct=!1,pixelRatio:ft,shape:lt="circle",glow:ut=.5,twinkle:dt=.3,depthOfField:ht=0,connections:mt=!1,connectionDistance:vt=110,hoverEffect:pt="parallax",hoverRadius:xt=140,clickBurst:Rt=!0,drift:wt="none",driftSpeed:yt=1,variation:At=0,intro:bt=!0,opacity:gt=1,lightMode:Ft=!1,paused:Et=!1,className:Pe="",style:Mt})=>{const Ce=G.useRef(null),Le=G.useRef(null),xe=G.useRef(null),ke=(Array.isArray(F)?F:[F]).filter(Boolean).map(String),De={count:S(Math.round(i),1,zt),spread:Math.max(.1,g),speed:R,colors:ke.length?ke:["#ffffff"],mouse:j,hoverFactor:Math.max(0,T),soft:oe,size:Math.max(0,pe),randomness:Math.max(0,K),camera:Math.max(1,Z),rotate:!ct,dpr:ft,shape:kt[lt]??0,glow:Math.max(0,ut),twinkle:S(dt,0,1),depthOfField:Math.max(0,ht),connections:mt,connectionDistance:Math.max(10,vt),hoverEffect:Dt[pt]??0,hoverRadius:Math.max(20,xt),clickBurst:Rt,drift:Ot[wt]??0,driftSpeed:yt,variation:Math.max(0,Math.round(At)),intro:bt,opacity:S(gt,0,1),lightMode:Ft,paused:Et},k=G.useRef(De);return k.current=De,G.useEffect(()=>{const Y=Ce.current,D=Le.current,e=D?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!Y||!D||!e)return;const ae=at(e,Vt,Ut),O=at(e,Yt,Nt);if(!ae||!O)return;const ne=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,ne),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW);const Re=e.createBuffer(),we=e.createBuffer(),ye=e.createBuffer(),Ae=e.createVertexArray();e.bindVertexArray(Ae),e.bindBuffer(e.ARRAY_BUFFER,ne),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const be=(t,o,n)=>{e.bindBuffer(e.ARRAY_BUFFER,t),e.enableVertexAttribArray(o),e.vertexAttribPointer(o,n,e.FLOAT,!1,0,0),e.vertexAttribDivisor(o,1)};be(Re,1,3),be(we,2,4),be(ye,3,3);const ge=e.createBuffer(),C=new Float32Array(tt*8),Fe=e.createVertexArray();e.bindVertexArray(Fe),e.bindBuffer(e.ARRAY_BUFFER,ne),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ARRAY_BUFFER,ge),e.bufferData(e.ARRAY_BUFFER,C.byteLength,e.DYNAMIC_DRAW),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,32,0),e.vertexAttribDivisor(1,1),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,32,16),e.vertexAttribDivisor(2,1),e.bindVertexArray(null);const N=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),J=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,Ee=new Map,Oe=t=>{if(Ee.has(t))return Ee.get(t);let o=[1,1,1];if(N){N.clearRect(0,0,1,1),N.fillStyle="#ffffff",N.fillStyle=t,N.fillRect(0,0,1,1);const[n,r,f]=N.getImageData(0,0,1,1).data;o=[n/255,r/255,f/255]}return Ee.set(t,o),o},St=t=>{const o=t.map(f=>Math.pow(f,2.2)),n=.2126*o[0]+.7152*o[1]+.0722*o[2],r=Math.min(1,.06/Math.max(n,1e-4));return o.map(f=>Math.pow(f*r,1/2.2))},w={width:1,height:1,ratio:1},s={x:0,y:0,sx:0,sy:0,nx:0,ny:0,inside:!1,active:0},u={clock:0,spin:0,travel:0,offsetX:0,offsetY:0,reveal:k.current.intro&&!J?0:1},B=[],ze=new Float32Array(te*4),x={key:"",count:0,positions:new Float32Array(0),randoms:new Float32Array(0),colors:new Float32Array(0)},d={x:new Float32Array(0),y:new Float32Array(0),ahead:new Float32Array(0),alpha:new Float32Array(0)};let $=0,H=0,re=!0;const Tt=t=>{const o=`${t.count}|${t.variation}|${t.colors.join(",")}|${t.lightMode?1:0}`;if(o===x.key)return;x.key=o;const n=$t(t.variation*7919+1),r=t.count,f=new Float32Array(r*3),a=new Float32Array(r*4),h=new Float32Array(r*3),l=t.colors.map(m=>t.lightMode?St(Oe(m)):Oe(m));for(let m=0;m<r;m++){let v,E,p,y;do v=n()*2-1,E=n()*2-1,p=n()*2-1,y=v*v+E*E+p*p;while(y>1||y===0);const _=Math.cbrt(n());f.set([v*_,E*_,p*_],m*3),a.set([n(),n(),n(),n()],m*4),h.set(l[Math.floor(n()*l.length)],m*3)}x.count=r,x.positions=f,x.randoms=a,x.colors=h;const c=Math.min(r,et);d.x=new Float32Array(c),d.y=new Float32Array(c),d.ahead=new Float32Array(c),d.alpha=new Float32Array(c),e.bindBuffer(e.ARRAY_BUFFER,Re),e.bufferData(e.ARRAY_BUFFER,f,e.STATIC_DRAW),e.bindBuffer(e.ARRAY_BUFFER,we),e.bufferData(e.ARRAY_BUFFER,a,e.STATIC_DRAW),e.bindBuffer(e.ARRAY_BUFFER,ye),e.bufferData(e.ARRAY_BUFFER,h,e.STATIC_DRAW)},Bt=t=>{const o=u.clock*1e3,n=t.rotate?Math.sin(o*2e-4)*.1:0,r=t.rotate?Math.cos(o*5e-4)*.15:0,f=t.rotate?u.spin:0,[a,h,l,c,m,v]=[Math.sin(n),Math.cos(n),Math.sin(r),Math.cos(r),Math.sin(f),Math.cos(f)];return[c*v+l*a*m,h*m,-l*v+c*a*m,-c*m+l*a*v,h*v,l*m+c*a*v,l*h,-a,c*h]},Ie=()=>[u.offsetX,u.offsetY,-(1-Ht(u.reveal))*70],_t=(t,o)=>{const n=Math.min(x.count,et),[r,f,a]=Ie(),h=w.width/w.height,l=u.clock,c=t.hoverRadius,m=t.hoverEffect!==0?s.active:0,v=t.spread*2+3,E=t.spread*me*2+3;for(let p=0;p<n;p++){const y=x.positions[p*3]*t.spread,_=x.positions[p*3+1]*t.spread,M=x.positions[p*3+2]*t.spread*me,Q=x.randoms[p*4],q=x.randoms[p*4+1],W=x.randoms[p*4+2],z=x.randoms[p*4+3],ce=Math.sin(l*W+6.28*z)*(.1+1.4*Q),P=Math.sin(l*q+6.28*Q)*(.1+1.4*z),Ge=Math.sin(l*z+6.28*q)*(.1+1.4*W),Ct=o[0]*y+o[3]*_+o[6]*M+r+ce;let je=o[1]*y+o[4]*_+o[7]*M+f+P,Ke=o[2]*y+o[5]*_+o[8]*M+a+Ge,fe=1;if(t.drift===1||t.drift===2){const b=nt(z*v+f+P+(t.drift===1?u.travel:-u.travel),v);je=b-v/2;const A=S(b/(v*.12),0,1),L=S((v-b)/(v*.12),0,1);fe=A*A*(3-2*A)*L*L*(3-2*L)}else if(t.drift===3){const b=nt(q*E+a+Ge+u.travel,E);Ke=b-E/2;const A=S(b/(E*.1),0,1);fe=A*A*(3-2*A)}const I=t.camera-Ke;if(I<rt||I>U){d.alpha[p]=0;continue}const Se=S((I-1)/3,0,1);fe*=Se*Se*(3-2*Se);let le=Ct*ve/h/I*.5*w.width+w.width/2,ue=je*ve/I*.5*w.height+w.height/2,de=0,he=0;if(m>.001){const b=le-s.sx,A=ue-s.sy,L=Math.hypot(b,A),V=Math.exp(-(b*b+A*A)/(c*c))*t.hoverFactor*m;t.hoverEffect===1&&L>.001?(de+=b/L*c*.5*V,he+=A/L*c*.5*V):t.hoverEffect===2&&(de-=b*.6*V,he-=A*.6*V)}for(const b of B){const A=b.age/_e,L=le-b.x,V=ue-b.y,ee=Math.hypot(L,V);if(ee<.001)continue;const Lt=Math.exp(-Math.pow((ee-A*it)/st,2)),Be=S(ee/30,0,1),Je=Lt*(1-A)*(1-A)*56*Be*Be*(3-2*Be);de+=L/ee*Je,he+=V/ee*Je}le+=de,ue+=he;const Te=S((U-I)/(U-U*.9),0,1),Ze=S(u.reveal*1.6-W*.6,0,1);d.x[p]=le,d.y[p]=ue,d.ahead[p]=I,d.alpha[p]=Te*Te*(3-2*Te)*fe*Ze*Ze}return n},Pt=(t,o)=>{const n=_t(t,o),r=t.connectionDistance,f=Math.max(1,Math.ceil(w.width/r)+2),a=new Map;for(let c=0;c<n;c++){if(d.alpha[c]<.02)continue;const m=(Math.floor(d.y[c]/r)+1)*f+Math.floor(d.x[c]/r)+1,v=a.get(m);v?v.push(c):a.set(m,[c])}let h=0;const l=r*r;for(const[c,m]of a)for(const v of[0,1,f-1,f,f+1]){const E=v===0?m:a.get(c+v);if(E)for(let p=0;p<m.length;p++){const y=m[p];for(let _=v===0?p+1:0;_<E.length;_++){const M=E[_],Q=d.x[y]-d.x[M],q=d.y[y]-d.y[M],W=Q*Q+q*q;if(W>l)continue;const z=S(1-Math.abs(d.ahead[y]-d.ahead[M])/18,0,1);if(z<=0)continue;if(h>=tt)return h;const ce=1-Math.sqrt(W)/r,P=h*8;C[P]=d.x[y],C[P+1]=d.y[y],C[P+2]=d.x[M],C[P+3]=d.y[M],C[P+4]=(x.colors[y*3]+x.colors[M*3])/2,C[P+5]=(x.colors[y*3+1]+x.colors[M*3+1])/2,C[P+6]=(x.colors[y*3+2]+x.colors[M*3+2])/2,C[P+7]=ce*ce*z*.7*Math.min(d.alpha[y],d.alpha[M]),h++}}}return h},ie=()=>{const t=k.current;Tt(t);const o=Bt(t),[n,r,f]=Ie();if(e.viewport(0,0,D.width,D.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA),t.connections){const l=Pt(t,o);l&&(e.useProgram(O.program),e.bindVertexArray(Fe),e.bindBuffer(e.ARRAY_BUFFER,ge),e.bufferSubData(e.ARRAY_BUFFER,0,C.subarray(0,l*8)),e.uniform2f(O.uniforms.uView,w.width,w.height),e.uniform1f(O.uniforms.uRatio,w.ratio),e.uniform1f(O.uniforms.uWidth,1),e.uniform1f(O.uniforms.uOpacity,t.opacity),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,4,l))}const a=ae.uniforms;let h=0;for(let l=B.length-1;l>=0&&h<te;l--)ze.set([B[l].x,B[l].y,B[l].age/_e,1],h*4),h++;e.useProgram(ae.program),e.bindVertexArray(Ae),e.uniformMatrix3fv(a.uRotation,!1,o),e.uniform3f(a.uOffset,n,r,f),e.uniform1f(a.uSpread,t.spread),e.uniform1f(a.uTime,u.clock),e.uniform1f(a.uCamera,t.camera),e.uniform1f(a.uAspect,w.width/w.height),e.uniform2f(a.uView,w.width,w.height),e.uniform1f(a.uRatio,w.ratio),e.uniform1f(a.uSize,t.size),e.uniform1f(a.uRandomness,t.randomness),e.uniform1f(a.uBlur,t.depthOfField*14),e.uniform1f(a.uFocus,t.camera+14),e.uniform1f(a.uGlow,t.lightMode?t.glow*.3:t.glow),e.uniform1f(a.uTwinkle,t.twinkle),e.uniform1i(a.uShape,t.shape),e.uniform1i(a.uDrift,t.drift),e.uniform1f(a.uTravel,u.travel),e.uniform4f(a.uPointer,s.sx,s.sy,s.active,t.hoverRadius),e.uniform1i(a.uEffect,t.hoverEffect),e.uniform1f(a.uStrength,t.hoverFactor),e.uniform4fv(a.uBursts,ze),e.uniform1i(a.uBurstCount,h),e.uniform1f(a.uReveal,u.reveal),e.uniform1f(a.uSoft,t.soft?.2:0),e.uniform1f(a.uShimmer,t.lightMode?0:1),e.uniform1f(a.uOpacity,t.opacity),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,4,x.count),e.bindVertexArray(null)},Ve=t=>{if($=0,!re||document.hidden)return;const o=k.current,n=H?S((t-H)/1e3,5e-4,.05):1/60;if(H=t,o.paused){u.reveal=1,ie(),H=0;return}const r=J?0:1,f=n*o.speed*r;u.clock+=f,o.rotate&&(u.spin+=f*.6),u.travel+=n*o.driftSpeed*r*(o.drift===3?6:.9);const a=o.mouse&&s.inside&&!J,h=1-Math.exp(-n/.35),l=a&&o.hoverEffect===0?o.hoverFactor:0;u.offsetX+=(-s.nx*l-u.offsetX)*h,u.offsetY+=(-s.ny*l-u.offsetY)*h,s.sx+=(s.x-s.sx)*(1-Math.exp(-n/.06)),s.sy+=(s.y-s.sy)*(1-Math.exp(-n/.06)),s.active+=((a?1:0)-s.active)*(1-Math.exp(-n/.2));for(let c=B.length-1;c>=0;c--)B[c].age+=n,B[c].age>=_e&&B.splice(c,1);!o.intro||J?u.reveal=1:u.reveal<1&&(u.reveal=Math.min(1,u.reveal+n/It)),ie(),$=requestAnimationFrame(Ve)},X=()=>{!$&&re&&!document.hidden&&($=requestAnimationFrame(Ve))},Me=()=>{const t=k.current,o=Math.max(1,Y.clientWidth),n=Math.max(1,Y.clientHeight),r=Math.min(t.dpr||window.devicePixelRatio||1,2);w.width=o,w.height=n,D.width=Math.max(1,Math.round(o*r)),D.height=Math.max(1,Math.round(n*r)),w.ratio=D.width/o,ie(),X()},Ue=t=>{const o=Y.getBoundingClientRect(),n=t.clientX-o.left,r=t.clientY-o.top,f=s.inside;s.inside=n>=0&&r>=0&&n<=o.width&&r<=o.height,s.x=n,s.y=o.height-r,s.nx=n/Math.max(1,o.width)*2-1,s.ny=-(r/Math.max(1,o.height)*2-1),s.inside&&!f&&(s.sx=s.x,s.sy=s.y)},Ye=t=>{Ue(t),k.current.paused||X()},Ne=t=>{const o=k.current;Ue(t),!(!s.inside||!o.clickBurst||o.paused||J)&&(B.push({x:s.x,y:s.y,age:0}),B.length>te&&B.shift(),X())},se=t=>{t.pointerType!=="mouse"&&(s.inside=!1)},$e=()=>{s.inside=!1},He=()=>{H=0,X()},Xe=new ResizeObserver(Me);Xe.observe(Y);const qe=new IntersectionObserver(t=>{re=t.some(o=>o.isIntersecting),re&&(H=0,X())});qe.observe(Y),window.addEventListener("pointermove",Ye,{passive:!0}),window.addEventListener("pointerdown",Ne,{passive:!0}),window.addEventListener("pointerup",se,{passive:!0}),window.addEventListener("pointercancel",se,{passive:!0}),document.documentElement.addEventListener("pointerleave",$e),document.addEventListener("visibilitychange",He),Me();let We=k.current.dpr;return xe.current=()=>{const t=k.current;if(t.dpr!==We){We=t.dpr,Me();return}$||ie(),X()},()=>{cancelAnimationFrame($),xe.current=null,Xe.disconnect(),qe.disconnect(),window.removeEventListener("pointermove",Ye),window.removeEventListener("pointerdown",Ne),window.removeEventListener("pointerup",se),window.removeEventListener("pointercancel",se),document.documentElement.removeEventListener("pointerleave",$e),document.removeEventListener("visibilitychange",He),e.deleteProgram(ae.program),e.deleteProgram(O.program),[ne,Re,we,ye,ge].forEach(t=>e.deleteBuffer(t)),e.deleteVertexArray(Ae),e.deleteVertexArray(Fe),e.getExtension("WEBGL_lose_context")?.loseContext()}},[]),G.useEffect(()=>{xe.current?.()}),Qe.jsx("div",{ref:Ce,className:`particles-container${Pe?` ${Pe}`:""}`,style:Mt,children:Qe.jsx("canvas",{ref:Le,className:"particles-canvas","aria-hidden":"true"})})};export{qt as default};
