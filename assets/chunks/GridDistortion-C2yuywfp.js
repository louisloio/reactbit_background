import{r as I,j as _e}from"../text-animations-Cof0zUdW.js";const Be=`#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Oe=`#version 300 es
precision highp float;
uniform sampler2D uImage;
uniform sampler2D uField;
uniform vec2 uGrid;
uniform vec2 uCover;
uniform float uSoftness;
uniform float uChroma;
uniform float uReveal;
in vec2 vUv;
out vec4 outColor;

vec2 fieldAt(ivec2 cell) {
  return texelFetch(uField, clamp(cell, ivec2(0), ivec2(uGrid) - 1), 0).rg;
}

vec3 sampleImage(vec2 uv) {
  return texture(uImage, (uv - 0.5) * uCover + 0.5).rgb;
}

void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  vec2 g = uv * uGrid;
  vec2 blocky = fieldAt(ivec2(floor(g)));
  vec2 p = g - 0.5;
  ivec2 base = ivec2(floor(p));
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  vec2 soft = mix(
    mix(fieldAt(base), fieldAt(base + ivec2(1, 0)), f.x),
    mix(fieldAt(base + ivec2(0, 1)), fieldAt(base + ivec2(1, 1)), f.x),
    f.y
  );
  vec2 shift = mix(blocky, soft, uSoftness);
  float spread = uChroma * 0.35;
  vec3 color = vec3(
    sampleImage(uv - shift * (1.0 + spread)).r,
    sampleImage(uv - shift).g,
    sampleImage(uv - shift * (1.0 - spread)).b
  );
  outColor = vec4(color * uReveal, uReveal);
}`,ke=["drag","push","swirl"],We=18,Ue=1.6,P=(m,M,A)=>Math.min(A,Math.max(M,m)),ye=(m,M,A)=>{let c=Math.imul(m,668265261)^Math.imul(M,374761393)^Math.imul(A,739982445);return c=Math.imul(c^c>>>15,2246822507),c=Math.imul(c^c>>>13,3266489909),((c^c>>>16)>>>0)/2147483648-1},Ie=(m,M,A)=>{const c=m.createShader(M);return c?(m.shaderSource(c,A),m.compileShader(c),m.getShaderParameter(c,m.COMPILE_STATUS)?c:(m.deleteShader(c),null)):null},He=({imageSrc:m,grid:M=15,radius:A=.18,strength:c=.15,relaxation:Pe=.96,mode:Q="drag",softness:De=0,chroma:be=0,idle:Xe=.3,clickRipple:Fe=!0,intro:Se=!0,className:Z="",style:Le})=>{const ee=I.useRef(null),te=I.useRef(null),O=I.useRef(null),oe={grid:P(Math.round(M),2,120),radius:P(A,.01,1),strength:Math.max(0,c),relaxation:P(Pe,0,.995),mode:ke.includes(Q)?Q:"drag",softness:P(De,0,1),chroma:P(be,0,2),idle:P(Xe,0,1),clickRipple:Fe,intro:Se},w=I.useRef(oe);return w.current=oe,I.useEffect(()=>{const _=ee.current,D=te.current,e=D?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1});if(!_||!D||!e)return;const j=Ie(e,e.VERTEX_SHADER,Be),z=Ie(e,e.FRAGMENT_SHADER,Oe),v=e.createProgram();if(!j||!z||!v||(e.attachShader(v,j),e.attachShader(v,z),e.linkProgram(v),!e.getProgramParameter(v,e.LINK_STATUS)))return;e.useProgram(v);const re=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,re),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const ne=e.getAttribLocation(v,"aPosition");e.enableVertexAttribArray(ne),e.vertexAttribPointer(ne,2,e.FLOAT,!1,0,0);const g={};for(const o of["uImage","uField","uGrid","uCover","uSoftness","uChroma","uReveal"])g[o]=e.getUniformLocation(v,o);e.uniform1i(g.uImage,0),e.uniform1i(g.uField,1);const V=e.createTexture();e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,V),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([0,0,0,0])),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.MIRRORED_REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.MIRRORED_REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR);const ie=e.createTexture();e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,ie),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const C=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,l={x:0,y:0,px:0,py:0,inside:!1},t={width:1,height:1,cols:0,rows:0,sim:new Float32Array(0),out:new Float32Array(0),ripples:[],time:0,reveal:0,loaded:!1,imageAspect:1,request:0,lastMove:-10,phantom:1};let b=0,N=0,k=!0,W=!0;const $=()=>{const o=w.current.grid,n=Math.max(1,Math.round(o*t.height/t.width));o===t.cols&&n===t.rows||(t.cols=o,t.rows=n,t.sim=new Float32Array(o*n*2),t.out=new Float32Array(o*n*2),e.activeTexture(e.TEXTURE1),e.texImage2D(e.TEXTURE_2D,0,e.RG32F,o,n,0,e.RG,e.FLOAT,t.out))},Ge=()=>{const{sim:o,cols:n,rows:r,width:i,height:s}=t,f=Math.min(i,s)*.12;for(let u=0;u<r;u++)for(let h=0;h<n;h++){const d=(u*n+h)*2;o[d]=ye(h+1,u+1,11)*f/i,o[d+1]=ye(h+1,u+1,23)*f/s}},se=(o,n,r,i,s,f)=>{const{sim:u,cols:h,rows:d,width:a,height:T}=t,E=Math.max(1,o.radius*a),x=a/h,p=T/d,U=Math.hypot(i,s),q=(.25+o.strength)*.4*a,K=Math.max(0,Math.floor((n-E)/x)),F=Math.min(h-1,Math.floor((n+E)/x)),S=Math.max(0,Math.floor((r-E)/p)),H=Math.min(d-1,Math.floor((r+E)/p));for(let y=S;y<=H;y++)for(let R=K;R<=F;R++){const L=(R+.5)*x-n,B=(y+.5)*p-r,G=Math.hypot(L,B);if(G>=E)continue;const ve=1-(G/E)**2,Te=o.strength*We*f*ve*ve;let pe=i,Re=s;if(o.mode!=="drag"){const Ae=G>0?L/G:0,we=G>0?B/G:0;pe=o.mode==="push"?Ae*U:-we*U,Re=o.mode==="push"?we*U:Ae*U}const Y=(y*h+R)*2,ge=u[Y]*a+pe*Te,xe=u[Y+1]*T+Re*Te,J=Math.hypot(ge,xe),Me=J>0?q*Math.tanh(J/q)/J:0;u[Y]=ge*Me/a,u[Y+1]=xe*Me/T}},ae=o=>[t.width*(.5+.34*Math.sin(o*.43)+.08*Math.sin(o*1.21+1.7)),t.height*(.5+.3*Math.sin(o*.61+.9)+.08*Math.cos(o*1.03+.4))],Ce=(o,n)=>{const{sim:r}=t,i=Math.pow(o.relaxation,n*60);let s=0;for(let a=0;a<r.length;a++)r[a]*=i,Math.abs(r[a])<1e-5?r[a]=0:s=Math.max(s,Math.abs(r[a]));if(o.strength<=0)return s;const f=l.x-l.px,u=l.y-l.py;l.px=l.x,l.py=l.y,l.inside&&(f||u)&&(t.lastMove=t.time,se(o,l.x,l.y,f,u,1),s=Math.max(s,.001));const h=C?0:o.idle,d=t.time-t.lastMove>2.5;if(t.phantom=P(t.phantom+(d?n:-n*3),0,1),h>0&&t.phantom>0){const[a,T]=ae(t.time),[E,x]=ae(t.time-n);se(o,a,T,a-E,T-x,h*.6*t.phantom*t.phantom)}return s},ce=o=>{const{sim:n,out:r,cols:i,rows:s,width:f,height:u,time:h}=t;if(r.set(n),t.ripples.length){const d=f/i,a=u/s,T=Math.hypot(f,u),E=Math.max(d,a)*1.2+T*.03,x=f*(.03+o.strength*.3);t.ripples=t.ripples.filter(p=>h-p.start<Ue);for(const p of t.ripples){const U=(h-p.start)/Ue,q=U*T*.75,K=(1-U)**2;for(let F=0;F<s;F++)for(let S=0;S<i;S++){const H=(S+.5)*d-p.x,y=(F+.5)*a-p.y,R=Math.hypot(H,y),L=Math.exp(-(((R-q)/E)**2))*K;if(L<.002||R===0)continue;const B=(F*i+S)*2;r[B]+=H/R*(L*x/f),r[B+1]+=y/R*(L*x/u)}}}},le=()=>{const{width:o,height:n}=t,r=o/n,i=r>t.imageAspect?[1,t.imageAspect/r]:[r/t.imageAspect,1];e.viewport(0,0,D.width,D.height),e.activeTexture(e.TEXTURE1),e.texSubImage2D(e.TEXTURE_2D,0,0,0,t.cols,t.rows,e.RG,e.FLOAT,t.out);const s=w.current;e.uniform2f(g.uGrid,t.cols,t.rows),e.uniform2f(g.uCover,i[0],i[1]),e.uniform1f(g.uSoftness,s.softness),e.uniform1f(g.uChroma,s.chroma),e.uniform1f(g.uReveal,t.reveal),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.drawArrays(e.TRIANGLES,0,3)},ue=o=>{if(b=0,!W||!k)return;const n=w.current,r=N?Math.min(.05,(o-N)/1e3):1/60;N=o,t.time+=r,$(),t.loaded&&(t.reveal=C?1:Math.min(1,t.reveal+r/.6));const i=Ce(n,r);ce(n),le(),i>0||t.ripples.length>0||n.idle>0&&!C||t.reveal<1?b=requestAnimationFrame(ue):N=0},X=()=>{b||!W||!k||(b=requestAnimationFrame(ue))},Ne=o=>{const n=++t.request;if(!o)return;const r=new Image;r.crossOrigin="anonymous",r.decoding="async",r.onload=()=>{!W||n!==t.request||(e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,V),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,r),e.generateMipmap(e.TEXTURE_2D),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),t.imageAspect=r.naturalWidth/Math.max(1,r.naturalHeight),$(),w.current.intro&&!C&&Ge(),t.loaded=!0,X())},r.src=o},he=o=>{const n=_.getBoundingClientRect(),r=o.clientX-n.left,i=o.clientY-n.top,s=r>=0&&i>=0&&r<=n.width&&i<=n.height;s&&!l.inside&&(l.px=r,l.py=i),l.x=r,l.y=i,l.inside=s,s&&X()},me=o=>{if(!w.current.clickRipple||C)return;const n=_.getBoundingClientRect(),r=o.clientX-n.left,i=o.clientY-n.top;r<0||i<0||r>n.width||i>n.height||(t.ripples.push({x:r,y:i,start:t.time}),t.ripples.length>4&&t.ripples.shift(),X())},fe=()=>{const o=Math.min(window.devicePixelRatio||1,2);t.width=Math.max(1,_.clientWidth),t.height=Math.max(1,_.clientHeight),D.width=Math.round(t.width*o),D.height=Math.round(t.height*o),$(),b||(ce(w.current),le()),X()};O.current={load:Ne,wake:X};const de=new ResizeObserver(fe);de.observe(_);const Ee=new IntersectionObserver(o=>{k=o.some(n=>n.isIntersecting),k&&(N=0,X())});return Ee.observe(_),window.addEventListener("pointermove",he,{passive:!0}),window.addEventListener("pointerdown",me,{passive:!0}),fe(),()=>{W=!1,cancelAnimationFrame(b),O.current=null,de.disconnect(),Ee.disconnect(),window.removeEventListener("pointermove",he),window.removeEventListener("pointerdown",me),e.deleteTexture(V),e.deleteTexture(ie),e.deleteBuffer(re),e.deleteProgram(v),e.deleteShader(j),e.deleteShader(z)}},[]),I.useEffect(()=>{O.current?.load(m)},[m]),I.useEffect(()=>{O.current?.wake()}),_e.jsx("div",{ref:ee,className:`distortion-container${Z?` ${Z}`:""}`,style:Le,children:_e.jsx("canvas",{ref:te,className:"distortion-container__canvas","aria-hidden":"true"})})};export{He as default};
