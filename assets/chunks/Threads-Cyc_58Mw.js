import{r as y,j as ne}from"../text-animations-Covp24vw.js";const De=`#version 300 es
precision highp float;
in vec2 aPoint;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uFrame;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;
uniform float uCount;
uniform float uThickness;
uniform float uSoftness;
uniform float uWaves;
uniform float uSplit;
uniform float uFray;
uniform float uSeed;
uniform vec2 uTurn;
uniform vec4 uPart;
uniform float uTaper;
out float vEdge;
out float vBand;
out float vDraw;
out float vAlpha;
out float vIndex;

float Perlin2D(vec2 P) {
  vec2 Pi = floor(P);
  vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
  vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
  Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
  Pt += vec2(26.0, 161.0).xyxy;
  Pt *= Pt;
  Pt = Pt.xzxz * Pt.yyww;
  vec4 hash_x = fract(Pt * (1.0 / 951.135664));
  vec4 hash_y = fract(Pt * (1.0 / 642.949883));
  vec4 grad_x = hash_x - 0.49999;
  vec4 grad_y = hash_y - 0.49999;
  vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y) * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
  grad_results *= 1.4142135623730950;
  vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
  vec4 blend2 = vec4(blend, vec2(1.0 - blend));
  return dot(grad_results, blend2.zxzx * blend2.wwyy);
}

void main() {
  float perc = float(gl_InstanceID) / uCount;
  float x = aPoint.x;
  float pixel = 1.0 / max(uResolution.x, uResolution.y);
  float splitPoint = uSplit + perc * uFray;
  float amplitudeNormal = smoothstep(splitPoint, max(0.7, splitPoint + 0.2), x);
  float finalAmplitude = amplitudeNormal * 0.5 * uAmplitude * (1.0 + (uMouse.y - 0.5) * 0.2);
  float timeScaled = uTime / 10.0 + (uMouse.x - 0.5);
  float blur = smoothstep(splitPoint, splitPoint + 0.05, x) * perc;
  float xnoise = mix(
    Perlin2D(vec2(timeScaled * 2.5 + uSeed, (x * uWaves + perc) * 2.5)),
    Perlin2D(vec2(timeScaled * 3.5 + uSeed, (x * uWaves + timeScaled) * 3.5)) / 1.5,
    x * 0.3
  );
  float y = 0.5 + (perc - 0.5) * uDistance + xnoise / 2.0 * finalAmplitude;
  vec2 local = vec2((x - 0.5) * uFrame.x, (y - 0.5) * uFrame.y);
  if (uPart.z > 0.0) {
    vec2 delta = local - uPart.xy;
    float reach = uPart.w;
    float pull = exp(-dot(delta, delta) / (reach * reach));
    local.y += delta.y * pull * uPart.z;
  }
  float width = 7.0 * uThickness * pixel * (1.0 - perc);
  float band = (width / 2.0 + 10.0 * uSoftness * pixel * blur) * uFrame.y;
  float draw = max(band, 1.0);
  local.y += aPoint.y * draw;
  vec2 turned = vec2(local.x * uTurn.x - local.y * uTurn.y, local.x * uTurn.y + local.y * uTurn.x);
  gl_Position = vec4(turned / (uResolution * 0.5), 0.0, 1.0);
  vEdge = aPoint.y * draw;
  vBand = band;
  vDraw = draw;
  vAlpha = 1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3)) * uTaper;
  vIndex = perc;
}`,Ue=`#version 300 es
precision highp float;
in float vEdge;
in float vBand;
in float vDraw;
in float vAlpha;
in float vIndex;
uniform vec3 uColor;
uniform vec3 uAccent;
out vec4 outColor;
void main() {
  float coverage = (1.0 - smoothstep(0.0, vDraw, abs(vEdge))) * (vBand / vDraw) * vAlpha;
  outColor = vec4(mix(uColor, uAccent, vIndex) * coverage, coverage);
}`,Ce=`#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Le=`#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uLines;
uniform vec2 uResolution;
uniform float uFade;
uniform float uOpacity;
uniform float uCurve;
out vec4 outColor;

float smootherstep(float edge, float x) {
  float t = clamp(x / edge, 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  vec4 lines = texture(uLines, vUv);
  float alpha = lines.a;
  vec3 color = alpha > 0.0001 ? lines.rgb / alpha : vec3(0.0);
  float mask = uOpacity;
  if (uFade > 0.0) {
    vec2 px = vUv * uResolution;
    float edge = uFade * min(uResolution.x, uResolution.y) * 0.5;
    mask *= smootherstep(edge, px.x) * smootherstep(edge, uResolution.x - px.x);
    mask *= smootherstep(edge, px.y) * smootherstep(edge, uResolution.y - px.y);
  }
  outColor = vec4(color * pow(alpha, uCurve), alpha) * mask;
}`,ae=1920,f=(n,l,d)=>Math.min(d,Math.max(l,n)),ie=(n,l,d)=>{const c=n.createShader(l);return c?(n.shaderSource(c,d),n.compileShader(c),n.getShaderParameter(c,n.COMPILE_STATUS)?c:(n.deleteShader(c),null)):null},se=(n,l,d)=>{const c=ie(n,n.VERTEX_SHADER,l),h=ie(n,n.FRAGMENT_SHADER,d),m=n.createProgram();return!c||!h||!m?null:(n.attachShader(m,c),n.attachShader(m,h),n.linkProgram(m),n.deleteShader(c),n.deleteShader(h),n.getProgramParameter(m,n.LINK_STATUS)?m:(n.deleteProgram(m),null))},ue=(n,l,d)=>{const c={};for(const h of d)c[h]=n.getUniformLocation(l,h);return c},Ie=({color:n=[1,1,1],accentColor:l,amplitude:d=1.7,distance:c=.4,enableMouseInteraction:h=!1,lineCount:m=90,thickness:ce=.6,softness:le=1.3,speed:fe=.6,waves:de=1.05,split:me=.04,fray:he=.5,angle:pe=25,seed:ve=0,parting:xe=0,taper:Ee=.85,brightness:Re=1.4,fade:Pe=0,opacity:ye=1,paused:ge=!1,...Ae})=>{const O=y.useRef(null),X=y.useRef(null),F=y.useRef(null),Te=`${Array.isArray(n)?n.join(","):String(n)}|${Array.isArray(l)?l.join(","):String(l??"")}`,V={color:n,accentColor:l,colorKey:Te,amplitude:d,distance:c,enableMouseInteraction:h,lineCount:f(Math.round(m),1,400),thickness:Math.max(0,ce),softness:Math.max(0,le),speed:fe,waves:Math.max(0,de),split:f(me,0,1),fray:f(he,0,1),angle:pe,seed:ve,parting:f(xe,0,1),taper:f(Ee,0,1),brightness:f(Re,.25,2),fade:f(Pe,0,1),opacity:f(ye,0,1),paused:ge},w=y.useRef(V);w.current=V,y.useEffect(()=>{const x=O.current,p=X.current,e=p?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!x||!p||!e)return;const g=se(e,De,Ue),A=se(e,Ce,Le);if(!g||!A)return;const i=ue(e,g,["uTime","uResolution","uFrame","uAmplitude","uDistance","uMouse","uCount","uThickness","uSoftness","uWaves","uSplit","uFray","uSeed","uTurn","uPart","uTaper","uColor","uAccent"]),T=ue(e,A,["uLines","uResolution","uFade","uOpacity","uCurve"]),S=e.createVertexArray(),D=e.createBuffer();e.bindVertexArray(S),e.bindBuffer(e.ARRAY_BUFFER,D);const z=e.getAttribLocation(g,"aPoint");e.enableVertexAttribArray(z),e.vertexAttribPointer(z,2,e.FLOAT,!1,0,0);const U=e.createVertexArray(),G=e.createBuffer();e.bindVertexArray(U),e.bindBuffer(e.ARRAY_BUFFER,G),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const W=e.getAttribLocation(A,"aPosition");e.enableVertexAttribArray(W),e.vertexAttribPointer(W,2,e.FLOAT,!1,0,0),e.bindVertexArray(null);const b=e.createTexture(),C=e.createFramebuffer();e.bindTexture(e.TEXTURE_2D,b),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const L=document.createElement("canvas");L.width=1,L.height=1;const E=L.getContext("2d",{willReadFrequently:!0}),_e=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,t={time:0,width:1,height:1,segments:0,colorKey:"",color:[1,1,1],accent:[1,1,1],mouse:[.5,.5],targetMouse:[.5,.5],pointer:[0,0],targetPointer:[0,0],presence:0,inside:!1};let R=0,P=0,M=!0,B=!0;const Y=r=>{if(Array.isArray(r))return[0,1,2].map(u=>f(Number(r[u]??1),0,1));if(!E)return[1,1,1];E.clearRect(0,0,1,1),E.fillStyle="#ffffff",E.fillStyle=String(r),E.fillRect(0,0,1,1);const[o,a,s]=E.getImageData(0,0,1,1).data;return[o/255,a/255,s/255]},Me=r=>{r.colorKey!==t.colorKey&&(t.colorKey=r.colorKey,t.color=Y(r.color),t.accent=r.accentColor===void 0||r.accentColor===null?t.color:Y(r.accentColor))},Fe=r=>{if(r===t.segments)return;t.segments=r;const o=new Float32Array((r+1)*4);for(let a=0;a<=r;a++){const s=a/r;o.set([s,-1,s,1],a*4)}e.bindBuffer(e.ARRAY_BUFFER,D),e.bufferData(e.ARRAY_BUFFER,o,e.STATIC_DRAW)},K=()=>{const r=Math.max(1,x.clientWidth),o=Math.max(1,x.clientHeight),a=Math.min(window.devicePixelRatio||1,2),s=Math.max(r,o)*a,u=s>ae?a*ae/s:a;p.width=Math.max(1,Math.round(r*u)),p.height=Math.max(1,Math.round(o*u)),t.width=r,t.height=o,e.bindTexture(e.TEXTURE_2D,b),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,p.width,p.height,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,C),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,b,0),e.bindFramebuffer(e.FRAMEBUFFER,null),Fe(f(Math.round(r/3),96,640)),I()},I=()=>{const r=w.current;Me(r);const o=p.width,a=p.height,s=r.angle*Math.PI/180,u=Math.cos(s),v=Math.sin(s),N=Math.abs(o*u)+Math.abs(a*v),we=Math.abs(o*v)+Math.abs(a*u),Z=o/t.width,ee=r.enableMouseInteraction?t.mouse:[.5,.5],Se=r.parting*t.presence*2,te=t.pointer[0]*Z,re=t.pointer[1]*Z,oe=[te*u+re*v,-te*v+re*u];e.bindFramebuffer(e.FRAMEBUFFER,C),e.viewport(0,0,o,a),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA),e.useProgram(g),e.uniform1f(i.uTime,t.time),e.uniform2f(i.uResolution,o,a),e.uniform2f(i.uFrame,N,we),e.uniform1f(i.uAmplitude,r.amplitude),e.uniform1f(i.uDistance,r.distance),e.uniform2f(i.uMouse,ee[0],ee[1]),e.uniform1f(i.uCount,r.lineCount),e.uniform1f(i.uThickness,r.thickness),e.uniform1f(i.uSoftness,r.softness),e.uniform1f(i.uWaves,r.waves),e.uniform1f(i.uSplit,r.split),e.uniform1f(i.uFray,r.fray),e.uniform1f(i.uSeed,r.seed*13.37),e.uniform2f(i.uTurn,u,v),e.uniform4f(i.uPart,oe[0],oe[1],Se,Math.min(o,a)*.16),e.uniform1f(i.uTaper,r.taper),e.uniform3f(i.uColor,t.color[0],t.color[1],t.color[2]),e.uniform3f(i.uAccent,t.accent[0],t.accent[1],t.accent[2]),e.bindVertexArray(S),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,(t.segments+1)*2,r.lineCount),e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,o,a),e.disable(e.BLEND),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(A),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,b),e.uniform1i(T.uLines,0),e.uniform2f(T.uResolution,o,a),e.uniform1f(T.uFade,r.fade),e.uniform1f(T.uOpacity,r.opacity),e.uniform1f(T.uCurve,2/r.brightness),e.bindVertexArray(U),e.drawArrays(e.TRIANGLES,0,3),e.bindVertexArray(null)},j=r=>{if(R=0,!B||!M||document.hidden)return;const o=w.current,a=P?Math.min(.05,(r-P)/1e3):1/60;P=r;const s=!o.paused&&!_e;s&&(t.time+=a*o.speed);const u=1-Math.exp(-a*3);t.mouse[0]+=(t.targetMouse[0]-t.mouse[0])*u,t.mouse[1]+=(t.targetMouse[1]-t.mouse[1])*u;const v=1-Math.exp(-a*10);t.pointer[0]+=(t.targetPointer[0]-t.pointer[0])*v,t.pointer[1]+=(t.targetPointer[1]-t.pointer[1])*v,t.presence+=((t.inside&&o.parting>0?1:0)-t.presence)*(1-Math.exp(-a*4)),I();const N=Math.abs(t.targetMouse[0]-t.mouse[0])>5e-4||Math.abs(t.targetMouse[1]-t.mouse[1])>5e-4||Math.abs(t.targetPointer[0]-t.pointer[0])>.05||Math.abs(t.targetPointer[1]-t.pointer[1])>.05||Math.abs((t.inside&&o.parting>0?1:0)-t.presence)>.002;s||N?R=requestAnimationFrame(j):P=0},_=()=>{!R&&B&&M&&!document.hidden&&(R=requestAnimationFrame(j))},H=r=>{const o=x.getBoundingClientRect(),a=(r.clientX-o.left)/Math.max(1,o.width),s=(r.clientY-o.top)/Math.max(1,o.height),u=a>=0&&a<=1&&s>=0&&s<=1;u?(t.targetMouse=[a,1-s],t.targetPointer=[r.clientX-o.left-o.width/2,o.height/2-(r.clientY-o.top)],!t.inside&&t.presence<.01&&(t.pointer=[...t.targetPointer])):t.inside&&(t.targetMouse=[.5,.5]),t.inside=u,_()},q=()=>{t.inside=!1,t.targetMouse=[.5,.5],_()},$=()=>{P=0,_()},J=new ResizeObserver(K);J.observe(x);const Q=new IntersectionObserver(r=>{M=r.some(o=>o.isIntersecting),M&&(P=0,_())});return Q.observe(x),window.addEventListener("pointermove",H,{passive:!0}),document.documentElement.addEventListener("pointerleave",q),document.addEventListener("visibilitychange",$),K(),F.current=()=>{R||I(),_()},()=>{B=!1,cancelAnimationFrame(R),F.current=null,J.disconnect(),Q.disconnect(),window.removeEventListener("pointermove",H),document.documentElement.removeEventListener("pointerleave",q),document.removeEventListener("visibilitychange",$),e.deleteFramebuffer(C),e.deleteTexture(b),e.deleteBuffer(D),e.deleteBuffer(G),e.deleteVertexArray(S),e.deleteVertexArray(U),e.deleteProgram(g),e.deleteProgram(A)}},[]),y.useEffect(()=>{F.current?.()});const{className:k="",...be}=Ae;return ne.jsx("div",{ref:O,className:`threads-container${k?` ${k}`:""}`,...be,children:ne.jsx("canvas",{ref:X,className:"threads-canvas","aria-hidden":"true"})})};export{Ie as default};
