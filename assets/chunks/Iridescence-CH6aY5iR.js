import{r as S,j as me}from"../text-animations-Cof0zUdW.js";const ke=`#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Oe=`#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uColor;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uScale;
uniform float uRotation;
uniform int uDetail;
uniform float uWarp;
uniform float uHue;
uniform float uSaturation;
uniform float uBrightness;
uniform float uContrast;
uniform float uGrain;
uniform float uSeed;
uniform float uFade;
uniform float uOpacity;
uniform sampler2D uField;
uniform float uStir;
uniform vec3 uPointer;
uniform float uSheen;
uniform vec4 uSwirls[6];
in vec2 vUv;
out vec4 outColor;

vec3 hueRotate(vec3 c, float angle) {
  const vec3 k = vec3(0.57735027);
  float ca = cos(angle);
  return c * ca + cross(k, c) * sin(angle) + k * dot(k, c) * (1.0 - ca);
}

float smootherstep(float edge, float x) {
  float t = clamp(x / edge, 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 aspect = uResolution / mr;
  vec2 st = vUv - texture(uField, vUv).rg * uStir;

  for (int k = 0; k < 6; k++) {
    vec4 swirl = uSwirls[k];
    if (swirl.w == 0.0) continue;
    vec2 delta = (st - swirl.xy) * aspect;
    float angle = swirl.w * exp(-dot(delta, delta) / (swirl.z * swirl.z));
    float ca = cos(angle);
    float sa = sin(angle);
    st = swirl.xy + vec2(ca * delta.x - sa * delta.y, sa * delta.x + ca * delta.y) / aspect;
  }

  vec2 uv = (st * 2.0 - 1.0) * aspect;
  float c = cos(uRotation);
  float s = sin(uRotation);
  uv = mat2(c, -s, s, c) * uv / uScale;
  uv += (uMouse - vec2(0.5)) * uAmplitude;

  float d = -uTime * 0.5;
  float a = 0.0;
  for (int i = 0; i < 24; i++) {
    if (i >= uDetail) break;
    float fi = float(i);
    a += cos(fi - d - a * uv.x * uWarp);
    d += sin(uv.y * fi + a);
  }
  d += uTime * 0.5;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;

  vec2 toPointer = (vUv - uPointer.xy) * aspect;
  col += col * uPointer.z * uSheen * 0.8 * exp(-dot(toPointer, toPointer) / 0.09);

  col = hueRotate(col, uHue);
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(luma), col, uSaturation);
  col = (col - 0.5) * uContrast + 0.5;
  col *= uBrightness;
  col += (hash(gl_FragCoord.xy + uSeed) - 0.5) * uGrain * 0.12;
  col = clamp(col, 0.0, 1.0);

  float alpha = uOpacity;
  if (uFade > 0.0) {
    vec2 px = vUv * uResolution;
    float edge = uFade * mr * 0.5;
    alpha *= smootherstep(edge, px.x) * smootherstep(edge, uResolution.x - px.x);
    alpha *= smootherstep(edge, px.y) * smootherstep(edge, uResolution.y - px.y);
  }
  outColor = vec4(col * alpha, alpha);
}`,Ge=48,he=6,V=3.2,g=(f,A,F)=>Math.min(F,Math.max(A,f)),ve=(f,A,F)=>{const p=f.createShader(A);return p?(f.shaderSource(p,F),f.compileShader(p),f.getShaderParameter(p,f.COMPILE_STATUS)?p:(f.deleteShader(p),null)):null},We=({color:f=[1,1,1],speed:A=1,amplitude:F=.1,mouseReact:p=!0,scale:pe=1,detail:xe=8,rotation:Re=0,warp:ge=1,hueShift:we=0,saturation:Ee=1,brightness:Me=1.5,contrast:Te=1,stir:ye=.5,sheen:Se=.3,clickSwirl:Ae=!0,grain:Fe=0,fade:Pe=0,opacity:_e=1,resolution:be=1,paused:Ue=!1,className:Y="",style:Le})=>{const $=S.useRef(null),J=S.useRef(null),I=S.useRef(null),Q={colorKey:Array.isArray(f)?f.join(","):String(f),color:f,speed:A,amplitude:F,mouseReact:p,scale:Math.max(.05,pe),detail:g(Math.round(xe),1,24),rotation:Re,warp:ge,hueShift:we,saturation:Math.max(0,Ee),brightness:Math.max(0,Me),contrast:Math.max(0,Te),stir:Math.max(0,ye),sheen:Math.max(0,Se),clickSwirl:Ae,grain:g(Fe,0,1),fade:g(Pe,0,1),opacity:g(_e,0,1),resolution:g(be,.1,2),paused:Ue},x=S.useRef(Q);return x.current=Q,S.useEffect(()=>{const w=$.current,R=J.current,e=R?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1});if(!w||!R||!e)return;const X=ve(e,e.VERTEX_SHADER,ke),k=ve(e,e.FRAGMENT_SHADER,Oe),v=e.createProgram();if(!X||!k||!v||(e.attachShader(v,X),e.attachShader(v,k),e.linkProgram(v),!e.getProgramParameter(v,e.LINK_STATUS)))return;e.useProgram(v);const Z=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,Z),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const ee=e.getAttribLocation(v,"aPosition");e.enableVertexAttribArray(ee),e.vertexAttribPointer(ee,2,e.FLOAT,!1,0,0);const n={};for(const o of["uResolution","uTime","uColor","uMouse","uAmplitude","uScale","uRotation","uDetail","uWarp","uHue","uSaturation","uBrightness","uContrast","uGrain","uSeed","uFade","uOpacity","uField","uStir","uPointer","uSheen","uSwirls"])n[o]=e.getUniformLocation(v,o);const U=e.createTexture();e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,U),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.uniform1i(n.uField,0);const O=document.createElement("canvas");O.width=1,O.height=1;const E=O.getContext("2d",{willReadFrequently:!0}),G=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,u={x:.5,y:.5,inside:!1,tracked:!1},t={width:1,height:1,phase:0,mouse:[.5,.5],presence:0,color:[1,1,1],colorKey:"",cols:0,rows:0,field:new Float32Array(0),scratch:new Float32Array(0),fieldActive:!1,swirls:[],seed:0},B=new Float32Array(he*4);let M=0,P=0,L=!0,N=!0;const De=o=>{if(o.colorKey===t.colorKey)return;if(t.colorKey=o.colorKey,Array.isArray(o.color)){t.color=[0,1,2].map(s=>g(Number(o.color[s]??1),0,1));return}if(!E)return;E.clearRect(0,0,1,1),E.fillStyle="#ffffff",E.fillStyle=String(o.color),E.fillRect(0,0,1,1);const[r,i,a]=E.getImageData(0,0,1,1).data;t.color=[r/255,i/255,a/255]},Ce=()=>{const o=Ge,r=g(Math.round(o*t.height/t.width),6,96);o===t.cols&&r===t.rows||(t.cols=o,t.rows=r,t.field=new Float32Array(o*r*2),t.scratch=new Float32Array(o*r*2),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,U),e.texImage2D(e.TEXTURE_2D,0,e.RG16F,o,r,0,e.RG,e.FLOAT,t.field))},Ie=(o,r,i,a)=>{const{cols:s,rows:d,field:h}=t,c=.22,m=t.width/t.height,_=Math.max(0,Math.floor((o-c/m)*s)),H=Math.min(s-1,Math.ceil((o+c/m)*s)),z=Math.max(0,Math.floor((r-c)*d)),j=Math.min(d-1,Math.ceil((r+c)*d));for(let y=z;y<=j;y++)for(let l=_;l<=H;l++){const D=((l+.5)/s-o)*m,ce=(y+.5)/d-r,b=1-(D*D+ce*ce)/(c*c);if(b<=0)continue;const C=(y*s+l)*2,ue=h[C]+i*b*b*3.2,le=h[C+1]+a*b*b*3.2,q=Math.hypot(ue,le),fe=.4,de=q>0?fe*Math.tanh(q/fe)/q:0;h[C]=ue*de,h[C+1]=le*de}t.fieldActive=!0},Xe=o=>{const{cols:r,rows:i,field:a,scratch:s}=t,d=Math.exp(-o*1.4);let h=0;for(let c=0;c<i;c++)for(let m=0;m<r;m++){const _=(c*r+m)*2,H=(c*r+Math.max(0,m-1))*2,z=(c*r+Math.min(r-1,m+1))*2,j=(Math.max(0,c-1)*r+m)*2,y=(Math.min(i-1,c+1)*r+m)*2;for(let l=0;l<2;l++){const D=(a[_+l]*12+a[H+l]+a[z+l]+a[j+l]+a[y+l])/16;s[_+l]=D*d,h=Math.max(h,Math.abs(s[_+l]))}}a.set(s),h<4e-4&&(a.fill(0),t.fieldActive=!1)},W=()=>{const o=x.current;De(o),Ce(),e.viewport(0,0,R.width,R.height),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,U),e.texSubImage2D(e.TEXTURE_2D,0,0,0,t.cols,t.rows,e.RG,e.FLOAT,t.field),B.fill(0),t.swirls.forEach((r,i)=>{const a=.21*(1+.4*r.age),s=Math.exp(-r.age*1.35)-Math.exp(-r.age*10),d=Math.min(1,(V-r.age)/.8);B.set([r.x,r.y,a,3*s*d*(.21/a)**2],i*4)}),e.uniform2f(n.uResolution,t.width,t.height),e.uniform1f(n.uTime,t.phase),e.uniform3f(n.uColor,t.color[0],t.color[1],t.color[2]),e.uniform2f(n.uMouse,t.mouse[0],t.mouse[1]),e.uniform1f(n.uAmplitude,o.amplitude),e.uniform1f(n.uScale,o.scale),e.uniform1f(n.uRotation,o.rotation*Math.PI/180),e.uniform1i(n.uDetail,o.detail),e.uniform1f(n.uWarp,o.warp),e.uniform1f(n.uHue,o.hueShift*Math.PI/180),e.uniform1f(n.uSaturation,o.saturation),e.uniform1f(n.uBrightness,o.brightness),e.uniform1f(n.uContrast,o.contrast),e.uniform1f(n.uGrain,o.grain),e.uniform1f(n.uSeed,t.seed),e.uniform1f(n.uFade,o.fade),e.uniform1f(n.uOpacity,o.opacity),e.uniform1f(n.uStir,o.mouseReact?o.stir:0),e.uniform3f(n.uPointer,u.x,u.y,o.mouseReact?t.presence:0),e.uniform1f(n.uSheen,o.sheen),e.uniform4fv(n.uSwirls,B),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.drawArrays(e.TRIANGLES,0,3)},te=o=>{if(M=0,!N||!L)return;const r=x.current,i=P?Math.min(.05,(o-P)/1e3):1/60;P=o;const a=!r.paused&&!G;a&&(t.phase+=i*r.speed);const s=r.mouseReact&&u.tracked?[u.x,u.y]:[.5,.5],d=1-Math.exp(-i*5);t.mouse[0]+=(s[0]-t.mouse[0])*d,t.mouse[1]+=(s[1]-t.mouse[1])*d,t.presence+=((u.inside?1:0)-t.presence)*(1-Math.exp(-i*4)),t.fieldActive&&Xe(i),t.swirls=t.swirls.filter(c=>(c.age+=i)<V),r.grain>0&&a&&(t.seed=Math.floor(o/42)%997),W();const h=Math.abs(s[0]-t.mouse[0])>5e-4||Math.abs(s[1]-t.mouse[1])>5e-4||Math.abs((u.inside?1:0)-t.presence)>.002;a||h||t.fieldActive||t.swirls.length?M=requestAnimationFrame(te):P=0},T=()=>{M||!N||!L||(M=requestAnimationFrame(te))},oe=o=>{const r=w.getBoundingClientRect();return{x:(o.clientX-r.left)/Math.max(1,r.width),y:1-(o.clientY-r.top)/Math.max(1,r.height)}},re=o=>{const r=x.current,{x:i,y:a}=oe(o),s=i>=0&&i<=1&&a>=0&&a<=1;s&&r.mouseReact&&!G&&u.inside&&r.stir>0&&Ie(i,a,i-u.x,a-u.y),u.x=i,u.y=a,u.inside=s,s&&(u.tracked=!0),T()},ae=()=>{u.inside=!1,T()},ie=o=>{if(!x.current.clickSwirl||G)return;const{x:i,y:a}=oe(o);if(!(i<0||i>1||a<0||a>1)){if(t.swirls.length>=he){if(t.swirls[0].age<V-.4)return;t.swirls.shift()}t.swirls.push({x:i,y:a,age:0}),T()}},K=()=>{const o=x.current,r=Math.min(window.devicePixelRatio||1,2)*o.resolution;t.width=Math.max(1,w.clientWidth),t.height=Math.max(1,w.clientHeight),R.width=Math.max(1,Math.round(t.width*r)),R.height=Math.max(1,Math.round(t.height*r)),W(),T()};I.current=()=>{const o=Math.min(window.devicePixelRatio||1,2)*x.current.resolution;R.width!==Math.max(1,Math.round(t.width*o))?K():M||W(),T()};const ne=new ResizeObserver(K);ne.observe(w);const se=new IntersectionObserver(o=>{L=o.some(r=>r.isIntersecting),L&&(P=0,T())});return se.observe(w),window.addEventListener("pointermove",re,{passive:!0}),window.addEventListener("pointerdown",ie,{passive:!0}),document.documentElement.addEventListener("pointerleave",ae),K(),()=>{N=!1,cancelAnimationFrame(M),I.current=null,ne.disconnect(),se.disconnect(),window.removeEventListener("pointermove",re),window.removeEventListener("pointerdown",ie),document.documentElement.removeEventListener("pointerleave",ae),e.deleteTexture(U),e.deleteBuffer(Z),e.deleteProgram(v),e.deleteShader(X),e.deleteShader(k)}},[]),S.useEffect(()=>{I.current?.()}),me.jsx("div",{ref:$,className:`iridescence-container${Y?` ${Y}`:""}`,style:Le,children:me.jsx("canvas",{ref:J,className:"iridescence-canvas","aria-hidden":"true"})})};export{We as default};
