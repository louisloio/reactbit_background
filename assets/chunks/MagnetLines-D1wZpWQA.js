import{r as ae,j as ze}from"../text-animations-Cpfg-DyU.js";const Ht=`#version 300 es
layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec2 aCenter;
layout(location = 2) in vec4 aState;
uniform mat3 uView;
uniform vec2 uCanvas;
uniform vec2 uOffset;
uniform vec2 uLine;
uniform float uStretch;
uniform float uHead;
uniform float uPad;
uniform float uFar;
out vec2 vLocal;
out vec2 vHalf;
out float vEmphasis;
out float vFlash;
out float vAngle;
out float vShown;
void main() {
  float angle = aState.x;
  float emphasis = aState.y;
  float halfLength = uLine.x * (1.0 + uStretch * emphasis);
  float halfWidth = uLine.y;
  vec2 extent = vec2(halfLength + uPad, max(halfWidth, uHead * halfLength) + uPad);
  vec2 local = aCorner * extent;
  vec2 axis = vec2(cos(angle), sin(angle));
  vec2 point = aCenter + axis * local.x + vec2(-axis.y, axis.x) * local.y;
  vec3 screen = uView * vec3(point, 1.0);
  vec2 scale = vec2(2.0 / uCanvas.x, -2.0 / uCanvas.y);
  vec2 shift = vec2(-1.0 + 2.0 * uOffset.x / uCanvas.x, 1.0 - 2.0 * uOffset.y / uCanvas.y);
  gl_Position = vec4(screen.xy * scale + shift * screen.z, 0.0, screen.z);
  float depth = (uView * vec3(aCenter, 1.0)).z;
  vLocal = local;
  vHalf = vec2(halfLength, halfWidth);
  vEmphasis = emphasis;
  vFlash = aState.z;
  vAngle = angle;
  vShown = aState.w * (1.0 - smoothstep(uFar * 0.45, uFar, depth));
}`,Nt=`#version 300 es
precision highp float;
in vec2 vLocal;
in vec2 vHalf;
in float vEmphasis;
in float vFlash;
in float vAngle;
in float vShown;
out vec4 fragColor;
uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uAccentMix;
uniform float uOpacity;
uniform float uFade;
uniform int uShape;
uniform float uHead;
uniform float uRainbow;
uniform float uTone;
uniform float uPeriod;
uniform vec2 uCanvas;
uniform vec2 uOffset;
uniform vec2 uPixels;
uniform vec2 uEdge;

float ndot(vec2 a, vec2 b) {
  return a.x * b.x - a.y * b.y;
}

float rhombus(vec2 p, vec2 b) {
  p = abs(p);
  float h = clamp(ndot(b - 2.0 * p, b) / dot(b, b), -1.0, 1.0);
  float d = length(p - 0.5 * b * vec2(1.0 - h, 1.0 + h));
  return d * sign(p.x * b.y + p.y * b.x - b.x * b.y);
}

float triangle(vec2 p, vec2 q) {
  p.x = abs(p.x);
  vec2 a = p - q * clamp(dot(p, q) / dot(q, q), 0.0, 1.0);
  vec2 b = p - q * vec2(clamp(p.x / q.x, 0.0, 1.0), 1.0);
  float s = -sign(q.y);
  vec2 d = min(vec2(dot(a, a), s * (p.x * q.y - p.y * q.x)), vec2(dot(b, b), s * (p.y - q.y)));
  return -sqrt(d.x) * sign(d.y);
}

float capsule(vec2 p, float from, float to, float radius) {
  float x = clamp(p.x, from, to);
  return length(vec2(p.x - x, p.y)) - radius;
}

float feather(float distance, float zone) {
  if (zone <= 0.0) return 1.0;
  float t = clamp(distance / zone, 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

vec3 spectrum(float hue, float tone) {
  vec3 k = clamp(abs(fract(hue + vec3(0.0, 2.0, 1.0) / 3.0) * 6.0 - 3.0) - 1.0, 0.0, 1.0);
  k = k * k * (3.0 - 2.0 * k);
  float chroma = (1.0 - abs(2.0 * tone - 1.0)) * 0.92;
  return tone + chroma * (k - 0.5);
}

void main() {
  vec2 p = vLocal;
  float aa = max(length(fwidth(p)) * 0.7071, 0.0001);
  float halfWidth = max(vHalf.y, aa * 0.5);
  float thin = vHalf.y / halfWidth;
  float halfLength = max(vHalf.x, halfWidth);
  float d;
  if (uShape == 1) {
    float head = min(halfLength * 0.9, max(halfWidth * 4.5, halfLength * 0.55));
    float wing = max(uHead * halfLength, halfWidth * 2.2);
    float shaft = capsule(p, -halfLength + halfWidth, halfLength - head * 0.6, halfWidth);
    float tip = triangle(vec2(p.y, halfLength - p.x), vec2(wing, head));
    d = min(shaft, tip);
  } else if (uShape == 2) {
    d = rhombus(p, vec2(halfLength, max(uHead * halfLength, halfWidth)));
  } else {
    d = capsule(p, -halfLength + halfWidth, halfLength - halfWidth, halfWidth);
  }
  float coverage = clamp(0.5 - d / aa, 0.0, 1.0) * thin;
  if (coverage <= 0.0) discard;

  float emphasis = clamp(vEmphasis + vFlash, 0.0, 1.0);
  vec3 color = mix(uColor, uAccent, uAccentMix * emphasis);
  if (uShape == 2) {
    float north = smoothstep(-aa, aa, p.x);
    color = mix(uColor, uAccent, north);
  }
  if (uRainbow > 0.5) {
    float hue = fract(vAngle / uPeriod);
    vec3 tint = spectrum(hue, uTone);
    color = uShape == 2 ? mix(tint, uColor, 1.0 - smoothstep(-aa, aa, p.x)) : tint;
  }
  float alpha = uOpacity * mix(1.0 - uFade, 1.0, clamp(vEmphasis, 0.0, 1.0));
  alpha = clamp(alpha + vFlash * 0.6, 0.0, 1.0) * coverage * vShown;
  vec2 point = vec2(gl_FragCoord.x, uPixels.y - gl_FragCoord.y) * (uCanvas / uPixels) - uOffset;
  vec2 inside = min(point, uCanvas - 2.0 * uOffset - point);
  alpha *= feather(inside.x, uEdge.x) * feather(inside.y, uEdge.y);
  fragColor = vec4(color * alpha, alpha);
}`,Dt=["orbit","attract","spiral","dipole"],St={line:0,arrow:1,needle:2},je=Math.PI*2,Ee=520,Ge=.34,Et=700,Vt=1.1,Xt=.65,Je=4,Le=3e4,E=(n,c,a)=>Math.min(a,Math.max(c,n)),Ke=n=>n*n*n*(n*(n*6-15)+10),oe=(n,c)=>{const a=c/2;return((n+a)%c+c)%c-a},$t=(n,c)=>{let a=Math.imul(n+40503,2246822519)^Math.imul(c+9973,3266489917);return a=Math.imul(a^a>>>15,668265263),a=Math.imul(a^a>>>13,374761393),((a^a>>>16)>>>0)/4294967296*2-1},Pe=n=>{const c=String(n||"").trim(),a=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c);if(a){const h=a[1].length===3?a[1].replace(/./g,m=>m+m):a[1];return[0,2,4].map(m=>parseInt(h.slice(m,m+2),16)/255)}const o=/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(c);if(o)return[o[1],o[2],o[3]].map(h=>E(parseFloat(h)/255,0,1));if(typeof document<"u"){const h=document.createElement("canvas").getContext("2d");if(h){h.fillStyle="#000000",h.fillStyle=c;const m=String(h.fillStyle);if(m!=="#000000"||/^(#0{3}|#0{6}|black)$/i.test(c))return Pe(m)}}return[.94,.94,.94]},zt=n=>(Math.max(...n)+Math.min(...n))/2,Lt=(n,c,a)=>{const o=n.createShader(c);return o?(n.shaderSource(o,a),n.compileShader(o),n.getShaderParameter(o,n.COMPILE_STATUS)?o:(console.error(n.getShaderInfoLog(o)),n.deleteShader(o),null)):null},jt=n=>{const c=Lt(n,n.VERTEX_SHADER,Ht),a=Lt(n,n.FRAGMENT_SHADER,Nt),o=c&&a?n.createProgram():null;if(!c||!a||!o)return c&&n.deleteShader(c),a&&n.deleteShader(a),null;if(n.attachShader(o,c),n.attachShader(o,a),n.linkProgram(o),n.deleteShader(c),n.deleteShader(a),!n.getProgramParameter(o,n.LINK_STATUS))return console.error(n.getProgramInfoLog(o)),n.deleteProgram(o),null;const h={},m=n.getProgramParameter(o,n.ACTIVE_UNIFORMS);for(let y=0;y<m;y++){const L=n.getActiveUniform(o,y);L&&(h[L.name]=n.getUniformLocation(o,L.name))}return{program:o,uniforms:h}},Pt=(n,c)=>{const a=[];for(let o=0;o<3;o++)for(let h=0;h<3;h++)a.push(n[o*3]*c[h]+n[o*3+1]*c[h+3]+n[o*3+2]*c[h+6]);return a},It=n=>{const[c,a,o,h,m,y,L,U,P]=n,B=m*P-y*U,k=y*L-h*P,V=h*U-m*L,X=c*B+a*k+o*V;return[B,o*U-a*P,a*y-o*m,k,c*P-o*L,o*h-c*y,V,a*L-c*U,c*m-a*h].map(g=>g/X)},we=(n,c,a)=>{const o=n[6]*c+n[7]*a+n[8];return[(n[0]*c+n[1]*a+n[2])/o,(n[3]*c+n[4]*a+n[5])/o,o]},Gt=(n,c,a,o,h)=>{const m=n*Math.PI/180,y=c*Math.PI/180,L=Math.max(a,o)*1.25,U=[Math.cos(y),0,0,Math.sin(m)*Math.sin(y),Math.cos(m),0,Math.sin(y)*Math.cos(m)/L,-Math.sin(m)/L,1];if(h){const q=Pt([1,0,a/2,0,1,o/2,0,0,1],U);return{forward:q,inverse:It(q),minScale:1,maxScale:1}}const P=[[-a/2,-o/2],[a/2,-o/2],[a/2,o/2],[-a/2,o/2]].map(([q,Ie])=>we(U,q,Ie)),B=P.map(q=>q[0]),k=P.map(q=>q[1]),V=Math.max(...B)-Math.min(...B),X=Math.max(...k)-Math.min(...k),g=Math.min(1,a/Math.max(1,V),o/Math.max(1,X)),$=(Math.max(...B)+Math.min(...B))/2,W=(Math.max(...k)+Math.min(...k))/2,Q=[g,0,a/2-$*g,0,g,o/2-W*g,0,0,1],re=Pt(Q,U),se=P.map(q=>g/Math.abs(q[2]));return{forward:re,inverse:It(re),minScale:Math.min(...se),maxScale:Math.max(...se)}},Kt=(n,c,a,o,h)=>{const m=n.inverse,y=Math.max(o,h)*2,L=[[-y,-y],[c+y,-y],[c+y,a+y],[-y,a+y]],U=([g,$])=>m[6]*g+m[7]*$+m[8]-1/Je,P=[];if(L.forEach((g,$)=>{const W=L[($+1)%L.length],Q=U(g),re=U(W);if(Q>=0&&P.push(g),Q>=0!=re>=0){const se=Q/(Q-re);P.push([g[0]+(W[0]-g[0])*se,g[1]+(W[1]-g[1])*se])}}),P.length<3)return null;let B=1/0,k=1/0,V=-1/0,X=-1/0;for(const[g,$]of P){const W=we(m,g,$);B=Math.min(B,W[0]),k=Math.min(k,W[1]),V=Math.max(V,W[0]),X=Math.max(X,W[1])}return{fromColumn:Math.floor((B+c/2)/o-.5)-1,toColumn:Math.ceil((V+c/2)/o-.5)+1,fromRow:Math.floor((k+a/2)/h-.5)-1,toRow:Math.ceil((X+a/2)/h-.5)+1}},Qt=({spacing:n=30,rows:c,columns:a,containerSize:o,lineColor:h="#efefef",accentColor:m,lineWidth:y=2,lineHeight:L=18,baseAngle:U=-10,mode:P="orbit",shape:B="line",rainbow:k=!1,radius:V=200,fade:X=.65,edgeFade:g=0,stretch:$=.4,reach:W=0,scatter:Q=0,inertia:re=.35,bounce:se=.3,ripple:q=.3,clickPulse:Ie=!0,intro:Ct=!0,idle:_t=!1,tiltX:Bt=0,tiltY:Ot=0,maxDevicePixelRatio:Tt=2,className:Qe="",style:Ze})=>{const et=ae.useRef(null),tt=ae.useRef(null),nt=ae.useRef(null),Ce=ae.useRef(null),[at,Yt]=ae.useState(0),ot=typeof o=="number"?`${o}px`:o,_e=!!ot,Be=Pe(h),rt=m?Pe(m):null,st={square:_e,spacing:Math.max(4,Number(n)||30),rows:c?E(Math.round(c),1,400):0,columns:a?E(Math.round(a),1,400):0,lineWidth:y,lineHeight:L,baseAngle:U*Math.PI/180,mode:Dt.includes(P)?P:"orbit",shape:St[B]!==void 0?B:"line",color:Be,accent:rt??(B==="needle"?Pe("#f43f5e"):Be),accentMix:rt?1:0,rainbow:k,tone:E(zt(Be),.42,.66),radius:Math.max(1,V),fade:E(X,0,1),edgeFade:E(g,0,1),stretch:E($,0,2),reach:Math.max(0,W),scatter:E(Q,0,1),inertia:E(re,0,1),bounce:E(se,0,1),ripple:E(q,0,1),clickPulse:Ie,intro:Ct,idle:_t,tiltX:E(Bt,-70,70),tiltY:E(Ot,-70,70),maxRatio:E(Tt,.5,3)},ve=ae.useRef(st);return ve.current=st,ae.useEffect(()=>{Ce.current?.()}),ae.useEffect(()=>{const xe=et.current,w=tt.current,Oe=nt.current;if(!xe||!w||!Oe)return;const e=w.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"default"}),be=e?jt(e):null;if(!e||!be)return;const ye=window.matchMedia("(prefers-reduced-motion: reduce)").matches,Te=e.createVertexArray();e.bindVertexArray(Te);const it=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,it),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const Ye=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,Ye),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,2,e.FLOAT,!1,0,0),e.vertexAttribDivisor(1,1);const Ae=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,Ae),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,0,0),e.vertexAttribDivisor(2,1),e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA);const f={width:1,height:1,pad:0,ratio:1,view:null,length:20,thickness:2,fill:!0,edgePad:1,minScale:1,maxScale:1,introSpeed:Et,bounds:[0,0,0,0],key:""},u={x:0,y:0,vx:0,vy:0,time:0,seen:!1,inside:!1,away:0},b={x:0,y:0,heading:0},z=[];let ie=0,me=new Float32Array(0),Ue=new Int32Array(0),ct=new Float32Array(0),ke=new Float32Array(0),lt=new Float32Array(0),j=new Float32Array(0),pe=new Float32Array(0),ce=new Float32Array(0),le=new Float32Array(0),We=new Uint8Array(0),fe=new Float32Array(0),Re=-1,ue=ve.current.intro&&!ye&&at===0,he=0,Fe=0,N=0,qe=!0,He=document.visibilityState!=="hidden",Ne=!1,Me=!0;const ft=r=>typeof r=="number"?r:(Oe.style.width=String(r),Oe.getBoundingClientRect().width),Ut=(r,s,i,d,I,A)=>{const v=r/d,C=s/I,R=A?Kt(i,r,s,v,C):{fromColumn:0,toColumn:d-1,fromRow:0,toRow:I-1},D=we(i.forward,0,0),F=[];if(R)for(let l=R.fromRow;l<=R.toRow;l++){const M=(l+.5)*C-s/2;for(let S=R.fromColumn;S<=R.toColumn;S++){const Ve=(S+.5)*v-r/2,[t,ee,te]=we(i.forward,Ve,M);if(A){if(te<=0||te>Je)continue;const de=.49*Math.min(v,C)/te;if(t<-de||t>r+de||ee<-de||ee>s+de)continue}F.push({x:Ve,y:M,column:S,row:l,w:te,distance:Math.hypot(t-D[0],ee-D[1])})}}F.length>Le&&(F.sort((l,M)=>l.w-M.w),F.length=Le);const O=new Map;for(let l=0;l<ie;l++)O.set(Ue[l*2]*65536+Ue[l*2+1],l);const p=F.length,_={centers:new Float32Array(p*2),cells:new Int32Array(p*2),reveal:new Float32Array(p),seeds:new Float32Array(p),rests:new Float32Array(p),angles:new Float32Array(p),speeds:new Float32Array(p),seenX:new Float32Array(p),seenY:new Float32Array(p),pending:new Uint8Array(p)};let K=0,H=1/0,Z=0;const T=[1/0,1/0,-1/0,-1/0];F.forEach((l,M)=>{_.centers[M*2]=l.x,_.centers[M*2+1]=l.y,_.cells[M*2]=l.column,_.cells[M*2+1]=l.row,_.reveal[M]=l.distance,_.seeds[M]=$t(l.column,l.row),K=Math.max(K,l.distance),H=Math.min(H,l.w),Z=Math.max(Z,l.w),T[0]=Math.min(T[0],l.x),T[1]=Math.min(T[1],l.y),T[2]=Math.max(T[2],l.x),T[3]=Math.max(T[3],l.y);const S=O.get(l.column*65536+l.row);if(S===void 0){_.pending[M]=1;return}_.angles[M]=j[S],_.speeds[M]=pe[S],_.seenX[M]=ce[S],_.seenY[M]=le[S]}),ie=p,{centers:me,cells:Ue,reveal:ct,seeds:lt,rests:ke,angles:j,speeds:pe,seenX:ce,seenY:le,pending:We}=_,fe=new Float32Array(p*4),f.introSpeed=Math.max(Et,K/Vt),f.bounds=p?T:[0,0,0,0],f.minScale=p?1/Z:1,f.maxScale=p?1/H:1,e.bindBuffer(e.ARRAY_BUFFER,Ye),e.bufferData(e.ARRAY_BUFFER,me,e.STATIC_DRAW),e.bindBuffer(e.ARRAY_BUFFER,Ae),e.bufferData(e.ARRAY_BUFFER,fe.byteLength||16,e.DYNAMIC_DRAW)},kt=()=>{const r=ve.current,s=xe.getBoundingClientRect(),i=Math.max(1,s.width),d=Math.max(1,s.height),I=Math.max(1,ft(r.lineHeight)),A=Math.max(.25,ft(r.lineWidth)),v=!r.square,C=v&&(r.tiltX!==0||r.tiltY!==0),R=Gt(r.tiltX,r.tiltY,i,d,v),D=Math.min(window.devicePixelRatio||1,r.maxRatio);let F=Math.max(1,Math.round(r.columns||(r.rows?r.rows*i/d:i/r.spacing))),O=Math.max(1,Math.round(r.rows||(r.columns?r.columns*d/i:d/r.spacing)));if(F*O>Le){const S=Math.sqrt(F*O/Le);F=Math.max(1,Math.floor(F/S)),O=Math.max(1,Math.floor(O/S))}const p=[v,F,O,i.toFixed(1),d.toFixed(1),C?`${r.tiltX},${r.tiltY}`:""].join("|");p!==f.key&&(f.key=p,Ut(i,d,R,F,O,C));const _=v?f.minScale:R.minScale,K=v?f.maxScale:R.maxScale,H=v?0:Math.ceil((I*(1+r.stretch)+A*2)*Math.max(1,K)+8),Z=i+H*2,T=d+H*2;w.style.left=`${-H}px`,w.style.top=`${-H}px`,w.style.width=`${Z}px`,w.style.height=`${T}px`;const l=Math.max(1,Math.round(Z*D)),M=Math.max(1,Math.round(T*D));(w.width!==l||w.height!==M)&&(w.width=l,w.height=M),Object.assign(f,{width:i,height:d,pad:H,ratio:D,view:R,length:I,thickness:A,fill:v,edgePad:2/(D*Math.max(.05,_))})},Wt=(r,s,i,d)=>{const I=i-me[s*2],A=d-me[s*2+1];if(r.mode==="dipole"){const C=Math.hypot(I,A)||1,R=-I/C,D=-A/C,F=Math.cos(b.heading),O=Math.sin(b.heading),p=F*R+O*D;return Math.atan2(3*p*D-O,3*p*R-F)}const v=Math.atan2(A,I);return r.mode==="attract"?v:r.mode==="spiral"?v+Math.PI/4:v+Math.PI/2},ut=r=>{if(he=0,Ne)return;const s=ve.current,i=E((r-Fe)/1e3||0,0,.05);Fe=Math.max(Fe,r),N+=i,Me&&kt(),Me=!1;const d=s.shape==="line"?Math.PI:je,I=s.scatter*Math.PI*.5;for(let t=0;t<ie;t++)ke[t]=s.baseAngle+Math.PI/2+lt[t]*I;const A=s.idle&&!ye&&(!u.seen||u.away>1.2);u.seen&&!u.inside&&(u.away+=i);let v=u.seen?u.x:0,C=u.seen?u.y:0;if(A){const t=Math.min(f.width,f.height)*.32;v=Math.cos(N*.37)*t+Math.sin(N*.21)*t*.35,C=Math.sin(N*.53+1.3)*t*.8}const R=1-Math.exp(-i/(u.seen&&!A?.035:.6));if(b.x+=(v-b.x)*R,b.y+=(C-b.y)*R,Math.hypot(u.vx,u.vy)>40){const t=oe(Math.atan2(u.vy,u.vx)-b.heading,je);b.heading+=t*(1-Math.exp(-i/.25))}u.vx*=Math.exp(-i/.12),u.vy*=Math.exp(-i/.12),ue&&Re<0&&(Re=N);const F=ue?N-Re:1/0;let O=!1;const p=s.inertia<=0||ye?0:Math.pow(6+42*Math.pow(1-s.inertia,2),2),_=p?2*Math.sqrt(p)*(1-.75*s.bounce):0,K=p?Math.max(1,Math.ceil(i/(1/240))):0,H=K?i/K:0,Z=ye?0:s.ripple/900,T=s.radius,l=s.reach*.55,M=s.reach;for(let t=z.length-1;t>=0;t--)N-z[t].start>z[t].life&&z.splice(t,1);let S=!1;for(let t=0;t<ie;t++){const ee=me[t*2],te=me[t*2+1],de=We[t]===1;if(de)ce[t]=b.x,le[t]=b.y;else{const x=Math.hypot(b.x-ee,b.y-te),Y=Z*x,ne=Y>0?1-Math.exp(-i/Y):1;ce[t]+=(b.x-ce[t])*ne,le[t]+=(b.y-le[t])*ne,Math.abs(b.x-ce[t])+Math.abs(b.y-le[t])>.05&&(S=!0)}const wt=ce[t],bt=le[t],Xe=Math.hypot(wt-ee,bt-te);let J=Wt(s,t,wt,bt);const ge=ke[t];if(M>0){const x=E((M-Xe)/Math.max(1,M-l),0,1);J=ge+oe(J-ge,d)*Ke(x)}let Se=1;if(ue){const x=(F-ct[t]/f.introSpeed)/Xt,Y=Ke(E(x,0,1));x<1&&(O=!0),J=ge+oe(J-ge,d)*Y,Se=E(x*2.5,0,1)}if(de)j[t]=ue?ge:J,pe[t]=0,We[t]=0;else if(!p)j[t]=j[t]+oe(J-j[t],d),pe[t]=0;else{let x=j[t],Y=pe[t];for(let ne=0;ne<K;ne++)Y+=(p*oe(J-x,d)-_*Y)*H,x+=Y*H;Math.abs(Y)<.002&&Math.abs(oe(J-x,d))<5e-4?(x+=oe(J-x,d),Y=0):S=!0,(x>40||x<-40)&&(x=oe(x,je)),j[t]=x,pe[t]=Y}let At=0,Rt=0;for(const x of z){const Y=(N-x.start)*Ee,ne=Math.hypot(ee-x.x,te-x.y),$e=(Y-ne)/(Ee*Ge);$e>0&&$e<1&&(At+=Ke($e)*d);const Ft=(Y-ne-Ee*Ge*.5)/60;Rt+=Math.exp(-Ft*Ft)*Math.max(0,1-(N-x.start)/x.life)}const qt=Math.exp(-(Xe*Xe)/(T*T))*Se;fe[t*4]=j[t]+At,fe[t*4+1]=qt,fe[t*4+2]=Math.min(1,Rt*.9)*Se,fe[t*4+3]=Se}if(ue&&!O&&N-Re>.2&&(ue=!1),Math.abs(v-b.x)+Math.abs(C-b.y)>.05&&(S=!0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,w.width,w.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),ie&&f.view){const t=be.uniforms;e.useProgram(be.program),e.uniformMatrix3fv(t.uView,!0,f.view.forward),e.uniform2f(t.uCanvas,f.width+f.pad*2,f.height+f.pad*2),e.uniform2f(t.uOffset,f.pad,f.pad),e.uniform2f(t.uLine,f.length/2,f.thickness/2),e.uniform1f(t.uStretch,s.stretch),e.uniform1f(t.uHead,s.shape==="needle"?.16:s.shape==="arrow"?.32:0),e.uniform1f(t.uPad,f.edgePad),e.uniform1f(t.uFar,f.fill?Je:1e6),e.uniform3fv(t.uColor,s.color),e.uniform3fv(t.uAccent,s.accent),e.uniform1f(t.uAccentMix,s.accentMix),e.uniform1f(t.uOpacity,1),e.uniform1f(t.uFade,s.fade),e.uniform1i(t.uShape,St[s.shape]),e.uniform1f(t.uRainbow,s.rainbow?1:0),e.uniform1f(t.uTone,s.tone),e.uniform1f(t.uPeriod,d),e.uniform2f(t.uPixels,w.width,w.height),e.uniform2f(t.uEdge,s.edgeFade*.34*f.width,s.edgeFade*.44*f.height),e.bindVertexArray(Te),e.bindBuffer(e.ARRAY_BUFFER,Ae),e.bufferSubData(e.ARRAY_BUFFER,0,fe),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,4,ie)}(S||ue||z.length>0||A)&&qe&&He&&(he=requestAnimationFrame(ut))},G=()=>{he||Ne||!qe||!He||(Fe=performance.now(),he=requestAnimationFrame(ut))};Ce.current=()=>{Me=!0,G()};const ht=(r,s)=>{if(!f.view)return null;const i=xe.getBoundingClientRect(),[d,I,A]=we(f.view.inverse,r-i.left,s-i.top);if(A<=0)return null;const v=r>=i.left&&r<=i.right&&s>=i.top&&s<=i.bottom;return{x:d,y:I,inside:v}},De=r=>{const s=ht(r.clientX,r.clientY);if(!s)return;const i=performance.now(),d=Math.max(1,i-u.time)/1e3;u.seen&&d<.2&&(u.vx=u.vx*.6+(s.x-u.x)/d*.4,u.vy=u.vy*.6+(s.y-u.y)/d*.4),u.time=i,u.x=s.x,u.y=s.y,u.seen=!0,u.inside=s.inside,s.inside&&(u.away=0),G()},dt=r=>{if(De(r),!ve.current.clickPulse||ye||!ie)return;const i=ht(r.clientX,r.clientY);if(!i||!(f.fill?i.inside:Math.abs(i.x)<=f.width/2&&Math.abs(i.y)<=f.height/2))return;const[I,A,v,C]=f.bounds,R=Math.max(Math.hypot(i.x-I,i.y-A),Math.hypot(i.x-v,i.y-A),Math.hypot(i.x-I,i.y-C),Math.hypot(i.x-v,i.y-C));z.push({x:i.x,y:i.y,start:N,life:Math.min(6,R/Ee+Ge+.1)}),z.length>6&&z.shift(),G()},mt=()=>{u.inside=!1,G()};window.addEventListener("pointermove",De,{passive:!0}),window.addEventListener("pointerdown",dt,{passive:!0}),document.documentElement.addEventListener("pointerleave",mt);const pt=r=>{r.preventDefault(),Ne=!0,cancelAnimationFrame(he),he=0},vt=()=>Yt(r=>r+1);w.addEventListener("webglcontextlost",pt),w.addEventListener("webglcontextrestored",vt);const xt=new ResizeObserver(()=>{Me=!0,G()});xt.observe(xe);const yt=()=>{Me=!0,G()};window.addEventListener("resize",yt);const Mt=new IntersectionObserver(r=>{qe=r.some(s=>s.isIntersecting),G()});Mt.observe(xe);const gt=()=>{He=document.visibilityState!=="hidden",G()};return document.addEventListener("visibilitychange",gt),G(),()=>{cancelAnimationFrame(he),Ce.current=null,xt.disconnect(),Mt.disconnect(),window.removeEventListener("pointermove",De),window.removeEventListener("pointerdown",dt),window.removeEventListener("resize",yt),document.documentElement.removeEventListener("pointerleave",mt),document.removeEventListener("visibilitychange",gt),w.removeEventListener("webglcontextlost",pt),w.removeEventListener("webglcontextrestored",vt),e.isContextLost()||(e.deleteBuffer(it),e.deleteBuffer(Ye),e.deleteBuffer(Ae),e.deleteVertexArray(Te),e.deleteProgram(be.program))}},[at]),ze.jsxs("div",{ref:et,className:`magnet-lines${_e?" magnet-lines--square":""}${Qe?` ${Qe}`:""}`,style:_e?{width:ot,...Ze}:Ze,children:[ze.jsx("canvas",{ref:tt,className:"magnet-lines__canvas","aria-hidden":"true"}),ze.jsx("span",{ref:nt,className:"magnet-lines__probe","aria-hidden":"true"})]})};export{Qt as default};
