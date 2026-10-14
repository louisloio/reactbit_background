import{r as A,j as X}from"../text-animations-CYFpTz0Y.js";const ve=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,xe=`#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 uResolution;
uniform float uDpr;
uniform float uTime;
uniform float uAngle;
uniform float uScale;
uniform float uLayers;
uniform float uWaves;
uniform float uTwist;
uniform float uThreads;
uniform float uSpread;
uniform float uThickness;
uniform float uGlow;
uniform float uBrightness;
uniform float uVignette;
uniform float uGrain;
uniform float uIntro;
uniform vec3 uGlowColor;
uniform vec3 uLineColor;
uniform vec4 uLens;
uniform float uLight;

const float PI = 3.14159265359;

mat2 rotate2d(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float hairline(float value, float width, float px) {
  px = max(px, 1e-5);
  float w = 0.5 * width * uDpr * px;
  float draw = max(w, 0.75 * px);
  return exp(-value * value / (draw * draw)) * (w / draw);
}

void main() {
  vec2 resolution = uResolution * uDpr;
  vec2 uv = (2.0 * gl_FragCoord.xy - resolution) / resolution.y;
  float time = uTime;
  vec2 p = uv / max(uScale, 0.05);
  p = rotate2d(uAngle) * p;

  vec2 lensPoint = (2.0 * vec2(uLens.x, uResolution.y - uLens.y) * uDpr - resolution) / resolution.y;
  float lens = exp(-dot(uv - lensPoint, uv - lensPoint) / (uLens.z * uLens.z)) * uLens.w;

  float threads = 0.0;
  float ghosts = 0.0;
  float halo = 0.0;

  for (int index = 0; index < 10; index++) {
    float fi = float(index) + 1.0;
    if (fi > uLayers) break;

    p += uWaves * sin(p.yx * fi * 3.0 + time * (0.15 + fi * 0.08));
    float radius = length(p);
    float polarAngle = atan(p.y, p.x);
    polarAngle += sin(radius * 5.0 - time * 1.2 + fi) * uTwist;
    p = vec2(cos(polarAngle), sin(polarAngle)) * radius;

    float strand = p.x * 3.0 + time + fi;
    float center = PI * floor(strand / PI + 0.5);
    float offset = strand - center;
    float strandId = center / PI;
    halo += exp(-8.0 * abs(sin(strand))) / fi;

    float count = max(uThreads, 1.0);
    float even = 1.0 - mod(count, 2.0);
    float spacing = 0.03 * uSpread;
    float slot = offset / spacing + 0.5 * even;
    float slotPx = fwidth(strand) / spacing;
    float thread = floor(slot + 0.5);
    float rank = thread - 0.5 * even;
    float inside = step(abs(rank), 0.5 * (count - 1.0) + 0.01);
    float seed = hash(vec2(strandId * 7.13 + fi * 3.7, thread * 1.91 + fi));
    float shimmer = 0.55 + 0.45 * sin(p.y * (1.6 + seed * 1.8) + time * (0.6 + seed) + seed * 6.283);
    float taper = 1.0 - smoothstep(0.0, 0.5 * count + 0.6, abs(rank)) * 0.65;
    float appear = smoothstep(seed * 0.6, seed * 0.6 + 0.4, uIntro);
    threads += hairline(slot - thread, uThickness, slotPx) * inside * mix(0.35, 1.0, seed) * shimmer * taper * appear / sqrt(fi);

    float ghostPhase = p.x * (5.0 + fi * 2.0) + sin(p.y * 3.0 + time);
    float ghostLine = sin(ghostPhase) / max(fwidth(sin(ghostPhase)), 1e-5);
    ghosts += exp(-ghostLine * ghostLine / (0.8 * uThickness * uDpr + 0.6)) / fi;
  }

  float center = exp(-2.2 * dot(uv, uv));
  float cloud = exp(-1.5 * length(uv + vec2(sin(time * 0.3) * 0.25, cos(time * 0.25) * 0.18)));
  float vignette = 1.0 - smoothstep(0.35, 1.45, length(uv));
  float edge = mix(1.0 - uVignette, 1.0, vignette);
  float intro = smoothstep(0.0, 1.0, uIntro);
  float grain = (hash(gl_FragCoord.xy + fract(time * 13.7) * 91.0) - 0.5) * uGrain;

  float threadLight = threads * 2.2 * (1.0 + 0.6 * lens);
  float ghostLight = ghosts * 0.1 * intro * (1.0 + 1.5 * lens);
  float glowLight = halo * 0.6 * uGlow * intro;
  float airLight = (center * 0.07 + cloud * 0.1) * uGlow * intro;

  if (uLight > 0.5) {
    float ink = (1.0 - exp(-(threadLight * 1.1 + ghostLight * 1.4) * uBrightness)) * edge;
    float wash = (1.0 - exp(-(glowLight + airLight * 0.6) * 0.9 * uBrightness)) * 0.5 * edge;
    ink = clamp(ink * (1.0 + grain * 2.0), 0.0, 1.0);
    vec3 color = uLineColor * ink + uGlowColor * wash * (1.0 - ink);
    outColor = vec4(color, ink + wash * (1.0 - ink));
  } else {
    vec3 light = uLineColor * (threadLight + ghostLight) + uGlowColor * (glowLight + airLight);
    light *= uBrightness * edge;
    vec3 color = 1.0 - exp(-light);
    float peak = max(color.r, max(color.g, color.b));
    color = max(color + grain * peak, 0.0);
    outColor = vec4(color, max(color.r, max(color.g, color.b)));
  }
}`,Y=2048,T=(r,f,c)=>Math.min(c,Math.max(f,r)),J=(r,f,c)=>{const l=r.createShader(f);return l?(r.shaderSource(l,c),r.compileShader(l),r.getShaderParameter(l,r.COMPILE_STATUS)?l:(r.deleteShader(l),null)):null},we=(r,f,c)=>{const l=J(r,r.VERTEX_SHADER,f),m=J(r,r.FRAGMENT_SHADER,c),h=r.createProgram();return!l||!m||!h?null:(r.attachShader(h,l),r.attachShader(h,m),r.linkProgram(h),r.deleteShader(l),r.deleteShader(m),r.getProgramParameter(h,r.LINK_STATUS)?h:(r.deleteProgram(h),null))},ye=(r,f,c)=>{const l={};for(const m of c)l[m]=r.getUniformLocation(f,m);return l},be=({glowColor:r="#2f5bff",lineColor:f,speed:c=.2,scale:l=2,rotation:m=0,rotationSpeed:h=.25,layers:Q=4,waves:Z=.015,twist:ee=.1,threads:te=1,spread:oe=1,thickness:ne=1,glow:re=2,brightness:ie=1.4,vignette:ae=.8,grain:se=.03,mouseInteraction:le=!0,intro:ue=!0,lightMode:fe=!1,paused:ce=!1,dpr:he,...de})=>{const D=A.useRef(null),B=A.useRef(null),C=A.useRef(null),V={glowColor:String(r),lineColor:f?String(f):"",speed:c,scale:Math.max(.05,l),rotation:m,rotationSpeed:h,layers:T(Math.round(Q),1,10),waves:Math.max(0,Z),twist:Math.max(0,ee),threads:T(Math.round(te),1,16),spread:Math.max(.1,oe),thickness:T(ne,.2,6),glow:Math.max(0,re),brightness:Math.max(0,ie),vignette:T(ae,0,1),grain:Math.max(0,se),mouseInteraction:le,intro:ue,lightMode:fe,paused:ce,dpr:he},R=A.useRef(V);R.current=V,A.useEffect(()=>{const v=D.current,d=B.current,e=d?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!v||!d||!e)return;const M=we(e,ve,xe);if(!M)return;const s=ye(e,M,["uResolution","uDpr","uTime","uAngle","uScale","uLayers","uWaves","uTwist","uThreads","uSpread","uThickness","uGlow","uBrightness","uVignette","uGrain","uIntro","uGlowColor","uLineColor","uLens","uLight"]),S=e.createVertexArray(),N=e.createBuffer();e.bindVertexArray(S),e.bindBuffer(e.ARRAY_BUFFER,N),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const O=e.getAttribLocation(M,"aPosition");e.enableVertexAttribArray(O),e.vertexAttribPointer(O,2,e.FLOAT,!1,0,0),e.bindVertexArray(null);const E=document.createElement("canvas");E.width=1,E.height=1;const x=E.getContext("2d",{willReadFrequently:!0}),k=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,o={time:0,spin:0,introTime:R.current.intro&&!k?0:10,width:1,height:1,ratio:1,colorKey:"",glow:[.2,.22,.63],line:[.8,.82,1],pointer:{x:0,y:0,inside:!1},lens:{x:0,y:0,vx:0,vy:0,strength:0,placed:!1}};let w=0,y=0,P=!0,I=!0;const W=(t,i)=>{if(!x||!t)return i;x.clearRect(0,0,1,1),x.fillStyle="#000000",x.fillStyle=t,x.fillRect(0,0,1,1);const[a,u,p]=x.getImageData(0,0,1,1).data;return[a/255,u/255,p/255]},ge=t=>{const i=`${t.glowColor}|${t.lineColor}|${t.lightMode}`;i!==o.colorKey&&(o.colorKey=i,o.glow=W(t.glowColor,[.2,.22,.63]),t.lineColor?o.line=W(t.lineColor,o.glow):t.lightMode?o.line=o.glow.map(a=>a*.6):o.line=o.glow.map(a=>a+(1-a)*.78))},U=()=>{const t=Math.max(1,v.clientWidth),i=Math.max(1,v.clientHeight),a=R.current,u=Math.min(a.dpr||window.devicePixelRatio||1,2),p=Math.max(t,i)*u,g=p>Y?u*Y/p:u,n=Math.max(1,Math.round(t*g)),b=Math.max(1,Math.round(i*g));(d.width!==n||d.height!==b)&&(d.width=n,d.height=b),o.width=t,o.height=i,o.ratio=d.width/t,G()},G=()=>{const t=R.current;ge(t);const i=T(o.introTime/2.2,0,1);e.viewport(0,0,d.width,d.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(M),e.uniform2f(s.uResolution,o.width,o.height),e.uniform1f(s.uDpr,o.ratio),e.uniform1f(s.uTime,o.time),e.uniform1f(s.uAngle,t.rotation*Math.PI/180+o.spin),e.uniform1f(s.uScale,t.scale),e.uniform1f(s.uLayers,t.layers),e.uniform1f(s.uWaves,t.waves),e.uniform1f(s.uTwist,t.twist),e.uniform1f(s.uThreads,t.threads),e.uniform1f(s.uSpread,t.spread),e.uniform1f(s.uThickness,t.thickness),e.uniform1f(s.uGlow,t.glow),e.uniform1f(s.uBrightness,t.brightness),e.uniform1f(s.uVignette,t.vignette),e.uniform1f(s.uGrain,t.grain),e.uniform1f(s.uIntro,1-Math.pow(1-i,3)),e.uniform3f(s.uGlowColor,o.glow[0],o.glow[1],o.glow[2]),e.uniform3f(s.uLineColor,o.line[0],o.line[1],o.line[2]),e.uniform4f(s.uLens,o.lens.x,o.lens.y,.32,o.lens.strength),e.uniform1f(s.uLight,t.lightMode?1:0),e.bindVertexArray(S),e.drawArrays(e.TRIANGLES,0,3),e.bindVertexArray(null)},z=t=>{if(w=0,!I||!P||document.hidden)return;const i=R.current,a=y?Math.min(.05,(t-y)/1e3):1/60;y=t;const u=!i.paused&&!k;u&&(o.time+=a*i.speed,o.spin+=a*i.speed*i.rotationSpeed);const p=o.introTime<2.2;p&&(o.introTime+=a);const{pointer:g,lens:n}=o,b=i.mouseInteraction&&g.inside&&!k;b&&!n.placed&&(n.x=g.x,n.y=g.y,n.vx=0,n.vy=0,n.placed=!0),n.vx+=(110*(g.x-n.x)-19*n.vx)*a,n.vy+=(110*(g.y-n.y)-19*n.vy)*a,n.x+=n.vx*a,n.y+=n.vy*a;const F=b?1:0;n.strength+=(F-n.strength)*(1-Math.exp(-a/(F>n.strength?.3:.55))),!b&&n.strength<.001&&(n.placed=!1),G();const pe=Math.abs(F-n.strength)>.002||Math.hypot(n.vx,n.vy)>.5;u||p||pe?w=requestAnimationFrame(z):y=0},L=()=>{!w&&I&&P&&!document.hidden&&(w=requestAnimationFrame(z))},$=t=>{const i=v.getBoundingClientRect(),a=t.clientX-i.left,u=t.clientY-i.top;o.pointer.x=a,o.pointer.y=u,o.pointer.inside=a>=0&&u>=0&&a<=i.width&&u<=i.height,L()},j=()=>{o.pointer.inside=!1,L()},q=()=>{y=0,L()},H=new ResizeObserver(U);H.observe(v);const K=new IntersectionObserver(t=>{P=t.some(i=>i.isIntersecting),P&&(y=0,L())});return K.observe(v),window.addEventListener("pointermove",$,{passive:!0}),document.documentElement.addEventListener("pointerleave",j),document.addEventListener("visibilitychange",q),U(),L(),C.current=()=>{w||G(),L()},()=>{I=!1,cancelAnimationFrame(w),C.current=null,H.disconnect(),K.disconnect(),window.removeEventListener("pointermove",$),document.documentElement.removeEventListener("pointerleave",j),document.removeEventListener("visibilitychange",q),e.deleteBuffer(N),e.deleteVertexArray(S),e.deleteProgram(M)}},[]),A.useEffect(()=>{C.current?.()});const{className:_="",...me}=de;return X.jsx("div",{ref:D,className:`ghost-fibers-container${_?` ${_}`:""}`,...me,children:X.jsx("canvas",{ref:B,className:"ghost-fibers-canvas","aria-hidden":"true"})})};export{be as default};
