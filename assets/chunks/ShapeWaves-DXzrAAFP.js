import{r as w,j as vt}from"../text-animations-BFa__3NK.js";import{l as _t,o as At,i as It,s as Lt,u as ze,a as qt,e as Se,t as Be,f as Bt}from"./index-Bv2gyG3N.js";function xt(g,i,c="read-write"){const R=_t(g,"storage"),m=typeof c=="string"?{access:c}:c,v=Dt(R.device,i,m.access??"read-write",void 0,m.indirect??!1);return At(R,v,O=>O.destroy(),O=>{v.onDestroy(O)})}class Fe{size;access;buffer;constructor(i,c){this.buffer=i,this.access=c,this.size=i.options.size}static create(i,c,R,m,v=!1){const O=v?["storage","copy_dst","copy_src","indirect"]:["storage","copy_dst","copy_src"],ae=i.createBuffer({size:c,usage:O,label:m});return new Fe(ae,R)}read(){return this.buffer.read(this.size)}write(i,c=0){this.buffer.write(Ot(i),c)}get gpu(){return this.buffer.gpu}get resourceIdentity(){return this.buffer.resourceIdentity}onDestroy(i){return this.buffer.onDestroy(i)}destroy(){this.buffer.destroy()}}function Dt(g,i,c,R,m=!1){return Fe.create(g,i,c,R,m)}function Ot(g){if(g instanceof ArrayBuffer||ArrayBuffer.isView(g))return g;throw new TypeError("StorageBuffer.write() requires ArrayBuffer or ArrayBufferView.")}const Ct={mixed:0,squares:1,circles:2,triangles:3},Ft=2,Wt=1024,$t=32,Ht=.1,De=1/60,Nt=.42,Gt=.94,jt=.972,Ut=.01,yt=.2,Ce=.3,wt=.16,ne=1+Ce+wt+yt,Vt=`
fn mod289v3(x: vec3f) -> vec3f { return x - floor(x * (1.0 / 289.0)) * 289.0; }
fn mod289v4(x: vec4f) -> vec4f { return x - floor(x * (1.0 / 289.0)) * 289.0; }
fn permute(x: vec4f) -> vec4f { return mod289v4(((x * 34.0) + 10.0) * x); }
fn taylorInvSqrt(r: vec4f) -> vec4f { return 1.79284291400159 - 0.85373472095314 * r; }
fn fadeCurve(t: vec3f) -> vec3f { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

fn cnoise(P: vec3f) -> f32 {
  var Pi0 = floor(P);
  var Pi1 = Pi0 + vec3f(1.0);
  Pi0 = mod289v3(Pi0);
  Pi1 = mod289v3(Pi1);
  let Pf0 = fract(P);
  let Pf1 = Pf0 - vec3f(1.0);
  let ix = vec4f(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  let iy = vec4f(Pi0.yy, Pi1.yy);
  let iz0 = Pi0.zzzz;
  let iz1 = Pi1.zzzz;

  let ixy = permute(permute(ix) + iy);
  let ixy0 = permute(ixy + iz0);
  let ixy1 = permute(ixy + iz1);

  var gx0 = ixy0 * (1.0 / 7.0);
  var gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  let gz0 = vec4f(0.5) - abs(gx0) - abs(gy0);
  let sz0 = step(gz0, vec4f(0.0));
  gx0 -= sz0 * (step(vec4f(0.0), gx0) - 0.5);
  gy0 -= sz0 * (step(vec4f(0.0), gy0) - 0.5);

  var gx1 = ixy1 * (1.0 / 7.0);
  var gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  let gz1 = vec4f(0.5) - abs(gx1) - abs(gy1);
  let sz1 = step(gz1, vec4f(0.0));
  gx1 -= sz1 * (step(vec4f(0.0), gx1) - 0.5);
  gy1 -= sz1 * (step(vec4f(0.0), gy1) - 0.5);

  var g000 = vec3f(gx0.x, gy0.x, gz0.x);
  var g100 = vec3f(gx0.y, gy0.y, gz0.y);
  var g010 = vec3f(gx0.z, gy0.z, gz0.z);
  var g110 = vec3f(gx0.w, gy0.w, gz0.w);
  var g001 = vec3f(gx1.x, gy1.x, gz1.x);
  var g101 = vec3f(gx1.y, gy1.y, gz1.y);
  var g011 = vec3f(gx1.z, gy1.z, gz1.z);
  var g111 = vec3f(gx1.w, gy1.w, gz1.w);

  let norm0 = taylorInvSqrt(vec4f(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  let norm1 = taylorInvSqrt(vec4f(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  let n000 = dot(g000, Pf0);
  let n100 = dot(g100, vec3f(Pf1.x, Pf0.yz));
  let n010 = dot(g010, vec3f(Pf0.x, Pf1.y, Pf0.z));
  let n110 = dot(g110, vec3f(Pf1.xy, Pf0.z));
  let n001 = dot(g001, vec3f(Pf0.xy, Pf1.z));
  let n101 = dot(g101, vec3f(Pf1.x, Pf0.y, Pf1.z));
  let n011 = dot(g011, vec3f(Pf0.x, Pf1.yz));
  let n111 = dot(g111, Pf1);

  let f = fadeCurve(Pf0);
  let nz = mix(vec4f(n000, n100, n010, n110), vec4f(n001, n101, n011, n111), f.z);
  let ny = mix(nz.xy, nz.zw, f.y);
  return 2.2 * mix(ny.x, ny.y, f.x);
}

fn fbm(p: vec3f) -> f32 {
  var total = 0.0;
  var amplitude = 1.0;
  var weight = 0.0;
  var frequency = 1.0;
  for (var i = 0; i < 2; i++) {
    total += amplitude * cnoise(p * frequency);
    weight += amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return total / weight;
}
`,Xt=`
struct Params {
  resolution: vec4f,
  placement: vec4f,
  grid: vec4f,
  field: vec4f,
  motion: vec4f,
  color: vec4f,
  hover: vec4f,
  background: vec4f,
}
@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var maskTexture: texture_2d<f32>;
@group(0) @binding(2) var maskSampler: sampler;
@group(0) @binding(3) var<storage, read> charges: array<f32>;

const SEED = vec2f(12.9898, 78.233);
const GLOW_THRESHOLD = 0.6;
${Vt}

fn sdIsoscelesTriangle(point: vec2f, q: vec2f) -> f32 {
  let p = vec2f(abs(point.x), point.y);
  let a = p - q * clamp(dot(p, q) / dot(q, q), 0.0, 1.0);
  let b = p - q * vec2f(clamp(p.x / q.x, 0.0, 1.0), 1.0);
  let s = -sign(q.y);
  let d = min(vec2f(dot(a, a), s * (p.x * q.y - p.y * q.x)), vec2f(dot(b, b), s * (p.y - q.y)));
  return -sqrt(d.x) * sign(d.y);
}

fn shapeDistance(p: vec2f, shape: i32, c: f32) -> f32 {
  if (shape == 0) { return max(abs(p.x), abs(p.y)) - c; }
  if (shape == 1) { return length(p) - c; }
  return sdIsoscelesTriangle(vec2f(p.x, p.y + c), vec2f(c, 2.0 * c));
}

fn hash21(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let resolution = params.resolution.xy;
  let cellPx = params.grid.x;
  let dotSize = params.grid.y;
  let mode = i32(params.grid.z + 0.5);
  let cols = i32(params.grid.w + 0.5);
  let background = params.background.rgb;
  let toSurface = params.hover.w < 0.5;

  let pixel = uv * resolution;
  let origin = params.placement.xy;
  let rows = i32(params.placement.z + 0.5);
  let cell = floor((pixel - origin) / cellPx);
  if (cell.y < 0.0 || i32(cell.y) >= rows || cell.x < 0.0 || i32(cell.x) >= cols) {
    return vec4f(background, select(0.0, 1.0, toSurface));
  }
  let center = origin + (cell + 0.5) * cellPx;
  let local = (pixel - center) / (cellPx * 0.5);
  let cellUv = center / resolution;

  if (params.motion.z > 0.5 && textureSampleLevel(maskTexture, maskSampler, cellUv, 0.0).r > 0.5) {
    return vec4f(background, select(0.0, 1.0, toSurface));
  }

  var level = 1.0;
  let fade = params.motion.w;
  if (fade > 0.0) {
    let q = abs(uv * 2.0 - 1.0);
    let radius = pow(pow(q.x, 2.5) + pow(q.y, 2.5), 1.0 / 2.5) / pow(2.0, 1.0 / 2.5);
    level = 1.0 - smoothstep(max(0.0, 1.0 - fade * 2.2), 1.0, radius);
  }
  let noise = fbm(vec3f((center + params.motion.xy) / params.field.x + SEED, params.field.w));
  let tone = clamp((noise * 0.5 + 0.5 - params.field.y) * params.field.z + 0.5, 0.0, 1.0);
  let band = i32(min(tone, 0.999999) * 3.0);

  var charge = 0.0;
  let index = i32(cell.y) * cols + i32(cell.x);
  if (index >= 0 && index < i32(arrayLength(&charges))) { charge = charges[index]; }
  let stepped = (band + i32(clamp(charge, 0.0, 0.999) * 3.0)) % 3;

  var shape = 2 - stepped;
  var size = dotSize;
  if (mode != 0) {
    shape = mode - 1;
    size = dotSize * mix(0.45, 1.0, f32(stepped) / 2.0);
  }
  let introProgress = params.placement.w;
  var front = 0.0;
  if (introProgress < ${ne.toFixed(2)}) {
    let radial = length((center - resolution * 0.5) / (resolution * 0.5)) * 0.70710678;
    let warp = cnoise(vec3f(cellUv * vec2f(3.2, 2.4) + SEED, 4.7)) * ${Ce.toFixed(2)};
    let jitter = hash21(cell) * ${wt.toFixed(2)};
    let spread = radial + warp + jitter + ${Ce.toFixed(2)};
    let band = ${yt.toFixed(2)} * (0.6 + 0.8 * hash21(cell + vec2f(17.0, 9.0)));
    let t = clamp((introProgress - spread) / band, 0.0, 1.0);
    if (t <= 0.0) {
      return vec4f(background, select(0.0, 1.0, toSurface));
    }
    let back = t - 1.0;
    size = max(size * (1.0 + 2.70158 * back * back * back + 1.70158 * back * back), 0.02);
    front = 1.0 - smoothstep(0.0, 1.0, abs(introProgress - spread) / band);
  }
  let aa = 2.0 / cellPx;
  let coverage = smoothstep(aa, -aa, shapeDistance(local, shape, size));

  let tint = mix(params.color.rgb, params.hover.rgb, max(smoothstep(0.15, 0.85, charge), front * 0.35));

  let rgb = mix(background, tint, coverage * level);
  if (toSurface) { return vec4f(rgb, 1.0); }
  let luminance = dot(tint * level, vec3f(0.2126, 0.7152, 0.0722));
  let glow = max(0.0, (luminance - GLOW_THRESHOLD) / (1.0 - GLOW_THRESHOLD)) * coverage;
  return vec4f(rgb, glow);
}
`,ht=`
struct Blur { direction: vec4f }
@group(0) @binding(0) var<uniform> blur: Blur;
@group(0) @binding(1) var sourceTexture: texture_2d<f32>;
@group(0) @binding(2) var sourceSampler: sampler;

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let sigma = blur.direction.z;
  let radius = i32(ceil(3.0 * sigma));
  var sum = vec3f(0.0);
  var weight = 0.0;
  for (var i = -radius; i <= radius; i++) {
    let offset = f32(i);
    let w = exp(-(offset * offset) / (2.0 * sigma * sigma));
    let sample = textureSampleLevel(sourceTexture, sourceSampler, uv + offset * blur.direction.xy, 0.0);
    sum += select(sample.rgb, sample.rgb * sample.a, blur.direction.w > 0.5) * w;
    weight += w;
  }
  return vec4f(sum / weight, 1.0);
}
`,Yt=`
struct Composite { strength: vec4f }
@group(0) @binding(0) var<uniform> composite: Composite;
@group(0) @binding(1) var sceneTexture: texture_2d<f32>;
@group(0) @binding(2) var glowTexture: texture_2d<f32>;
@group(0) @binding(3) var linearSampler: sampler;

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let scene = textureSampleLevel(sceneTexture, linearSampler, uv, 0.0).rgb;
  let glow = textureSampleLevel(glowTexture, linearSampler, uv, 0.0).rgb;
  return vec4f(scene + glow * composite.strength.x, 1.0);
}
`,Oe=(g,i)=>{const c=typeof g=="string"?g.trim():"";let m=(/^#?([\da-f]{3}|[\da-f]{6})$/i.exec(c)||/^#?([\da-f]{6})$/i.exec(i))[1];return m.length===3&&(m=m.replace(/./g,v=>v+v)),[0,2,4].map(v=>parseInt(m.slice(v,v+2),16)/255)};function Kt({text:g="",fontFamily:i='Geist, "Geist Sans", system-ui, sans-serif',fontWeight:c=500,textSize:R=.6,shapes:m="mixed",cellSize:v=10,dotSize:O=.75,color:ae="#929292",hoverColor:We="#ffffff",backgroundColor:Pe="#000000",speed:$e=1,scale:He=1,contrast:Ne=1,brightness:Ge=.4,flow:je=0,direction:Ue=0,fade:Ve=.25,interactive:Xe=!0,splashRadius:Ye=40,splashStrength:Je=.4,glow:Ze=.35,intro:Ke=!0,introDuration:Qe=1.6,introKey:Me=0,paused:et=!1,onError:tt,className:bt=""}){const rt=w.useRef(null),st=w.useRef(null),[zt,nt]=w.useState(!1),h=w.useRef(null),oe=w.useRef(()=>{}),ie=w.useRef(()=>{}),at=w.useRef(tt);h.current={text:String(g??""),fontFamily:i,fontWeight:c,textSize:R,shapes:m,cellSize:Math.max(2,v),dotSize:O,color:ae,hoverColor:We,backgroundColor:Pe,speed:$e,scale:Math.max(.05,He),contrast:Ne,brightness:Ge,flow:je,direction:Ue,fade:Ve,interactive:Xe,splashRadius:Ye,splashStrength:Je,glow:Ze,intro:Ke,introDuration:Math.max(.1,Qe),introKey:Me,paused:et},at.current=tt;const St=[m,v,O,ae,We,Pe,$e,He,Ne,Ge,je,Ue,Ve,Xe,Ye,Je,Ze,Ke,Qe,et].join("|"),Pt=[g,i,c,R].join("|"),Ee=w.useRef(()=>{});return w.useEffect(()=>{oe.current()},[St]),w.useEffect(()=>{ie.current()},[Pt]),w.useEffect(()=>{Me&&Ee.current()},[Me]),w.useEffect(()=>{const ce=rt.current,le=st.current;if(!ce||!le)return;let b=!1,A=!1,r,J,C,I=0,fe=0,ot=0,Z=[0,0],F=1,ue=!0,it=!1,d=1,z=1,L=10,H=[0,0],T=new Float32Array(1),y=new Float32Array(1),N=new Float32Array(1),ge=0,ct=0,K=ne,me=!1,G=!1,j=null,Re,de,pe,W=()=>{};const q={x:0,y:0,at:0,inside:!1},Q=window.matchMedia("(prefers-reduced-motion: reduce)"),ve=document.createElement("canvas"),k=ve.getContext("2d"),xe=()=>W(),Te=()=>{j=null},Mt=(n,_,l)=>{const p=h.current,S=Math.max(.5,p.splashRadius*F/L*.5),B=Math.ceil(S*2.5),P=(n*F-H[0])/L-.5,M=(_*F-H[1])/L-.5,ee=Math.max(0,Math.floor(M-B)),X=Math.min(z-1,Math.ceil(M+B)),Y=Math.max(0,Math.floor(P-B)),he=Math.min(d-1,Math.ceil(P+B));for(let U=ee;U<=X;U++){const te=U-M;for(let V=Y;V<=he;V++){const re=V-P,ye=l*Math.exp(-(re*re+te*te)/(2*S*S)),se=U*d+V;y[se]=Math.min(1.2,y[se]+ye)}}G=!0},lt=n=>{if(!h.current.interactive)return;j||(j=ce.getBoundingClientRect());const _=performance.now(),l=n.clientX-j.left,p=n.clientY-j.top,S=l>=0&&p>=0&&l<=j.width&&p<=j.height;if(S){const B=q.inside?Math.max(8,_-q.at):16,M=(q.inside?Math.hypot(l-q.x,p-q.y):0)/B*1e3;Mt(l,p,Math.min(1,.22+M*6e-4)*h.current.splashStrength),W()}q.x=l,q.y=p,q.at=_,q.inside=S},ke=n=>{if(b||A)return;A=!0,I&&cancelAnimationFrame(I),I=0,de?.disconnect(),pe?.disconnect(),Re?.(),oe.current=()=>{},ie.current=()=>{};const _=r;r=void 0,_?.dispose(),nt(!1),at.current?.(n instanceof Error?n:new Error(String(n)))},ft=()=>(F=Math.min(window.devicePixelRatio||1,Ft),[Math.max(1,Math.round(le.clientWidth*F)),Math.max(1,Math.round(le.clientHeight*F))]);return(async()=>{try{if(r=await It({powerPreference:"low-power"}),b)return r.dispose();Re=r.onError(ke);const n=ft(),_=navigator.gpu.getPreferredCanvasFormat(),l=Lt(r,le,{dpr:F,size:n,autoResize:!1,format:_}),p=ze(r,{resolution:[n[0],n[1],1/n[0],1/n[1]],placement:[0,0,1,0],grid:[10,.75,0,1],field:[320,.5,2.8,0],motion:[0,0,0,.25],color:[.573,.573,.573,1],hover:[1,1,1,0],background:[0,0,0,1]}),S=qt(r,{minFilter:"linear",magFilter:"linear",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"}),B=(e,t)=>r.device.createTexture({size:[e,t],format:"rgba8unorm",usage:["texture_binding","copy_dst","render_attachment"],label:"shape-waves-mask"});J=B(1,1),C=xt(r,4,"read"),C.write(T);const P=Se(r,Xt,{label:"shape-waves-scene",set:{params:p,maskTexture:J,maskSampler:S,charges:C}}),M=Be(r,{size:n,format:"rgba8unorm",label:"shape-waves-scene"}),ee=e=>[Math.max(1,Math.ceil(e[0]/2)),Math.max(1,Math.ceil(e[1]/2))],X=Be(r,{size:ee(n),format:"rgba8unorm",label:"shape-waves-glow-a"}),Y=Be(r,{size:ee(n),format:"rgba8unorm",label:"shape-waves-glow-b"}),he=ze(r,{direction:[0,0,4,1]}),U=ze(r,{direction:[0,0,4,0]}),te=Se(r,ht,{label:"shape-waves-glow-x",set:{blur:he,sourceTexture:M,sourceSampler:S}}),V=Se(r,ht,{label:"shape-waves-glow-y",set:{blur:U,sourceTexture:X,sourceSampler:S}}),re=ze(r,{strength:[2,0,0,0]}),ye=Se(r,Yt,{label:"shape-waves-composite",set:{composite:re,sceneTexture:M,glowTexture:Y,linearSampler:S}});if(await Promise.all([P.compile({colors:[_]}),P.compile(M),te.compile(X),V.compile(Y),ye.compile({colors:[_]})]),b)return;const se=()=>h.current.glow>0;let ut=!1;const Et=()=>{const e=h.current,[t,o]=l.size,f=Math.max(1,Math.round(t/(e.cellSize*F)));L=t/f;const s=Math.max(1,Math.floor(o/L));if(H=[0,(o-s*L)/2],f===d&&s===z&&T.length===d*z)return;d=f,z=s,T=new Float32Array(d*z),y=new Float32Array(d*z),N=new Float32Array(d*z),G=!1;const E=xt(r,T.byteLength,"read");E.write(T),P.set({charges:E}),C.destroy(),C=E},Rt=()=>{const e=d-1,t=z-1;let o=0;for(let s=0;s<z;s++){const E=(s===0?s:s-1)*d,a=(s===t?s:s+1)*d,x=s*d;for(let u=0;u<d;u++){const D=x+u,we=x+(u===0?u:u-1),be=x+(u===e?u:u+1),$=y[D],Ie=y[we]+y[be]+y[E+u]+y[a+u]-4*$,Le=($-N[D])*Gt,pt=($+Le+Nt*Ie)*jt;N[D]=pt;const qe=Math.min(1,Math.max(0,pt));T[D]=qe,qe>o&&(o=qe)}}const f=y;return y=N,N=f,o},Tt=e=>{if(!G)return!1;ge=Math.min(ge+e,De*4);let t=1;for(;ge>=De;)ge-=De,t=Rt();return t<Ut&&(y.fill(0),N.fill(0),T.fill(0),G=!1),C.write(T),G},kt=()=>{const e=h.current;return ue&&!document.hidden&&!e.paused&&e.speed>0&&!Q.matches},gt=e=>{if(I=0,b||A)return;const t=h.current,o=fe?Math.min(.1,(e-fe)/1e3):0;fe=e;const f=kt();if(f){ot+=o*Ht*t.speed;const a=t.direction*Math.PI/180,x=t.flow*L*o;Z=[Z[0]+Math.cos(a)*x,Z[1]+Math.sin(a)*x]}const s=ue&&!document.hidden&&Tt(o);me&&(me=!1,ct=e,K=0);const E=K<ne;E&&(K=Math.min(ne,(e-ct)/1e3/t.introDuration*ne)),p.set({placement:[H[0],H[1],z,K]}),p.set({field:[$t*L*t.scale,.5-(t.brightness-.5)*.4,2.8*t.contrast,ot]}),p.set({motion:[Z[0],Z[1],t.text.trim()?1:0,t.fade]});try{Bt(r,a=>{if(!se()){a.pass(l,P);return}a.pass(M,P),a.pass(X,te),a.pass(Y,V),a.pass(l,ye)})}catch(a){ke(a);return}it||(it=!0,nt(!0)),f||s||E?I=requestAnimationFrame(gt):fe=0};W=()=>{b||A||I||(I=requestAnimationFrame(gt))};const _e=()=>{const e=h.current,t=e.text.trim(),[o,f]=l.size,s=t.length>0,E=s?Math.min(1,Wt/Math.max(o,f)):0,a=s?Math.max(1,Math.round(o*E)):1,x=s?Math.max(1,Math.round(f*E)):1;if(ve.width=a,ve.height=x,k.fillStyle="#000",k.fillRect(0,0,a,x),s){let D=Math.max(1,e.textSize*x);k.font=`${e.fontWeight} ${D}px ${e.fontFamily}`;const we=k.measureText(t).width,be=a*.9;we>be&&(D=Math.max(1,D*be/we),k.font=`${e.fontWeight} ${D}px ${e.fontFamily}`),k.textAlign="center",k.textBaseline="alphabetic";const $=k.measureText(t),Ie=(a+$.actualBoundingBoxLeft-$.actualBoundingBoxRight)/2,Le=(x+$.actualBoundingBoxAscent-$.actualBoundingBoxDescent)/2;k.fillStyle="#fff",k.fillText(t,Ie,Le)}const u=B(a,x);r.gpu.queue.copyExternalImageToTexture({source:ve},{texture:u.gpu},[a,x]),P.set({maskTexture:u}),J.destroy(),J=u},Ae=()=>{if(b||A)return;const e=h.current;Et(),p.set({placement:[H[0],H[1],z,K],grid:[L,Math.min(1,Math.max(.1,e.dotSize)),Ct[e.shapes]??0,d],color:[...Oe(e.color,"#929292"),1],hover:[...Oe(e.hoverColor,"#ffffff"),se()?1:0],background:[...Oe(e.backgroundColor,"#000000"),1]}),re.set({strength:[2*e.glow,0,0,0]}),e.intro!==ut&&(ut=e.intro,e.intro&&!Q.matches&&(me=!0)),!e.interactive&&G&&(y.fill(0),N.fill(0),T.fill(0),G=!1,C.write(T)),W()},mt=()=>{if(b||A)return;_e(),Ae();const e=h.current;!e.text.trim()||!document.fonts?.load||document.fonts.load(`${e.fontWeight} 32px ${e.fontFamily}`).then(()=>{b||A||(_e(),W())}).catch(()=>{})},dt=()=>{if(b||A)return;Te();const e=ft();(e[0]!==l.size[0]||e[1]!==l.size[1])&&l.resize(e);const[t,o]=l.size;M.resize([t,o]);const f=ee([t,o]);X.resize(f),Y.resize(f),he.set({direction:[1/f[0],0,4,1]}),U.set({direction:[0,1/f[1],4,0]}),p.set({resolution:[t,o,1/t,1/o]}),_e(),Ae()};oe.current=Ae,ie.current=mt,Ee.current=()=>{b||A||!h.current.intro||Q.matches||(me=!0,W())},de=new ResizeObserver(dt),de.observe(ce),pe=new IntersectionObserver(e=>{ue=e.some(t=>t.isIntersecting),ue&&W()},{threshold:0}),pe.observe(ce),document.addEventListener("visibilitychange",xe),Q.addEventListener("change",xe),window.addEventListener("pointermove",lt,{passive:!0}),window.addEventListener("scroll",Te,{capture:!0,passive:!0}),dt(),mt()}catch(n){ke(n)}})(),()=>{b=!0,W=()=>{},oe.current=()=>{},ie.current=()=>{},Ee.current=()=>{},document.removeEventListener("visibilitychange",xe),Q.removeEventListener("change",xe),window.removeEventListener("pointermove",lt),window.removeEventListener("scroll",Te,{capture:!0}),de?.disconnect(),pe?.disconnect(),Re?.(),I&&cancelAnimationFrame(I),J?.destroy(),C?.destroy(),r?.dispose()}},[]),vt.jsx("div",{ref:rt,className:`shape-waves ${bt}`,"data-ready":zt,style:{backgroundColor:Pe},"aria-hidden":"true",children:vt.jsx("canvas",{ref:st,className:"shape-waves__canvas"})})}export{Kt as default};
