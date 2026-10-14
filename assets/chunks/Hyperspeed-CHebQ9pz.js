import{r as ne,j as Ot}from"../text-animations-CYFpTz0Y.js";import{W as Ut,L as rt,S as it,k as Vt,r as Nt,P as ut,j as T,M as re,s as kt,t as Gt,u as Ht,v as L,w as Yt,x as Me,y as jt,z as $t,H as Kt,U as qt,O as Zt,C as Jt,a as lt,V as Te,D as Qt,N as eo,E as to,F as st,G as b,Z as oo,J as ao,K as ct}from"./three.module-DU3sk976.js";const H=400,D=160,Y=80,j=1500,K=8,dt=["straight","gentle","winding","hills","racing","deep"],vt={dark:{background:"transparent",road:"#08080a",lines:"#25252d",tail:["#d856bf","#6750a2","#c247ac"],head:["#03b3c3","#0e5ea5","#324555"],poles:["#03b3c3"],dust:"#ffffff"},light:{background:"transparent",road:"#efeff2",lines:"#d0d0d7",tail:["#d856bf","#6750a2","#c247ac"],head:["#03b3c3","#0e5ea5","#324555"],poles:["#03b3c3"],dust:"#18181b"}},ce=`
  uniform float uTime;
  uniform float uCurvature;
  uniform vec4 uCurveA;
  uniform float uCurveB;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uPixel;
  #define PI 3.14159265358979
  float nsin(float v) { return sin(v) * 0.5 + 0.5; }
  vec3 gentle(float p) {
    return vec3(
      cos(p * PI * 5.0 + uTime) * 25.0 - cos(0.02 * PI * 5.0 + uTime) * 25.0,
      sin(p * PI * 2.0 + PI * 0.5 + uTime) * 15.0 - sin(0.02 * PI * 2.0 + PI * 0.5 + uTime) * 15.0,
      0.0
    );
  }
  float windX(float p) { return cos(PI * p * 4.0 + uTime) * 25.0 + pow(cos(PI * p * 8.0 + uTime * 2.0), 2.0) * 5.0; }
  float windY(float p) { return -nsin(PI * p * 8.0 + uTime) * 10.0 - pow(nsin(PI * p + uTime / 8.0), 5.0) * 10.0; }
  vec3 winding(float p) { return vec3(windX(p) - windX(0.0125), windY(p) - windY(0.0125), 0.0); }
  vec3 hills(float p) {
    return vec3(
      cos(p * PI * 3.0 + uTime) * 30.0 - cos(0.02 * PI * 3.0 + uTime) * 30.0,
      nsin(p * PI * 6.0 + uTime) * 30.0 - nsin(0.02 * PI * 6.0 + uTime) * 30.0,
      nsin(p * PI * 10.0 + uTime) * 20.0 - nsin(0.02 * PI * 10.0 + uTime) * 20.0
    );
  }
  vec3 racing(float p) {
    return vec3(
      sin(p * PI * 2.0 + uTime) * 35.0 - sin(0.0125 * PI * 2.0 + uTime) * 35.0,
      sin(p * PI * 3.0 + uTime) * 10.0 - sin(0.0125 * PI * 3.0 + uTime) * 10.0,
      0.0
    );
  }
  float deepX(float p) { return sin(p * PI * 4.0 + uTime) * 10.0; }
  float deepY(float p) { return pow(abs(p * 10.0), 2.0) + sin(p * PI * 8.0 + uTime) * 20.0; }
  vec3 deep(float p) { return vec3(deepX(p) - deepX(0.02), deepY(p) - deepY(0.02), 0.0); }
  vec3 bend(float p) {
    vec3 d = gentle(p) * uCurveA.x + winding(p) * uCurveA.y + hills(p) * uCurveA.z + racing(p) * uCurveA.w + deep(p) * uCurveB;
    return d * uCurvature;
  }
`,no=`
  ${ce}
  attribute vec4 aSeedA;
  attribute vec4 aSeedB;
  attribute float aPair;
  attribute float aTone;
  uniform float uTravel;
  uniform float uRoadX;
  uniform float uRoadWidth;
  uniform float uLanes;
  uniform float uDirection;
  uniform vec2 uSpeedRange;
  uniform float uTrail;
  uniform float uStretch;
  uniform float uSize;
  uniform float uRadiusScale;
  uniform float uMirror;
  uniform vec3 uColors[${K}];
  uniform float uColorCount;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vColor;
  varying float vFog;
  varying float vAbove;
  varying float vThin;
  void main() {
    float laneWidth = uRoadWidth / uLanes;
    float lane = min(floor(aSeedA.x * uLanes), uLanes - 1.0);
    float laneX = (lane + 0.5) * laneWidth - uRoadWidth * 0.5 + (aSeedA.y - 0.5) * 0.5 * laneWidth;
    float carWidth = mix(0.3, 0.5, aSeedA.z) * laneWidth;
    float radius = mix(0.05, 0.14, aSeedA.w) * uSize;
    float len = mix(0.03, 0.2, aSeedB.x) * uTravel * uTrail * (1.0 + uStretch);
    float speed = mix(uSpeedRange.x, uSpeedRange.y, aSeedB.y) * uDirection;
    vec3 center = vec3(
      uRoadX + laneX + aPair * carWidth,
      aSeedB.w * 0.8 + radius * 1.3,
      position.z * len + len - mod(uTime * speed + aSeedB.z * uTravel, uTravel)
    );
    vAbove = center.y;
    center.y = mix(center.y, -center.y * 1.8, uMirror);
    center += bend(abs(center.z / uTravel));
    float depth = max(0.1, -(modelViewMatrix * vec4(center, 1.0)).z);
    float wanted = radius * uRadiusScale;
    float shown = max(wanted, depth * uPixel * 0.75);
    vThin = wanted / shown;
    vec3 p = center + vec3(position.x * shown, position.y * shown * mix(1.0, 2.2, uMirror), 0.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vec3 n = normal;
    n.y *= 1.0 - 2.0 * uMirror;
    vNormal = normalize(normalMatrix * n);
    vView = -mv.xyz;
    vUv = uv;
    vColor = uColors[int(min(floor(aTone * uColorCount), uColorCount - 1.0))];
    vFog = smoothstep(uFogNear, uFogFar, -mv.z);
  }
`,ro=`
  uniform vec2 uFade;
  uniform float uIntensity;
  uniform float uSharp;
  uniform float uCore;
  uniform float uMirror;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vColor;
  varying float vFog;
  varying float vAbove;
  varying float vThin;
  void main() {
    float facing = abs(dot(normalize(vNormal), normalize(vView)));
    float alpha = pow(facing, uSharp) * smoothstep(uFade.x, uFade.y, vUv.x) * uIntensity * vThin * (1.0 - vFog);
    alpha *= mix(1.0, exp(-vAbove * 0.9), uMirror);
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(mix(vColor, vec3(1.0), pow(facing, 12.0) * uCore), min(alpha, 1.0));
  }
`,io=`
  ${ce}
  attribute vec4 aSeed;
  attribute float aIndex;
  attribute float aSide;
  uniform float uTravel;
  uniform float uCount;
  uniform float uEdge;
  uniform float uHeight;
  uniform float uRadiusScale;
  uniform float uMirror;
  uniform vec3 uColors[${K}];
  uniform float uColorCount;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vColor;
  varying float vFog;
  varying float vAbove;
  varying float vHeight;
  varying float vThin;
  void main() {
    vHeight = position.y + 0.5;
    float width = mix(0.08, 0.22, aSeed.y);
    float height = mix(1.3, 1.9, aSeed.z) * uHeight;
    float spacing = uTravel / max(uCount, 1.0);
    vec3 center = vec3(
      aSide * uEdge,
      vHeight * height,
      -uTravel + mod(uTime * 120.0 + (aIndex + aSeed.x * 0.6) * spacing, uTravel)
    );
    vAbove = center.y;
    center.y = mix(center.y, -center.y * 1.6, uMirror);
    center += bend(abs(center.z / uTravel));
    float depth = max(0.1, -(modelViewMatrix * vec4(center, 1.0)).z);
    float wanted = width * uRadiusScale;
    float shown = max(wanted, depth * uPixel * 0.75);
    vThin = wanted / shown;
    vec3 p = center + vec3(position.x * shown, 0.0, position.z * shown);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vNormal = normalize(normalMatrix * normal);
    vView = -mv.xyz;
    vColor = uColors[int(min(floor(aSeed.w * uColorCount), uColorCount - 1.0))];
    vFog = smoothstep(uFogNear, uFogFar, -mv.z);
  }
`,uo=`
  uniform float uIntensity;
  uniform float uSharp;
  uniform float uCore;
  uniform float uMirror;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vColor;
  varying float vFog;
  varying float vAbove;
  varying float vHeight;
  varying float vThin;
  void main() {
    float facing = abs(dot(normalize(vNormal), normalize(vView)));
    float ends = smoothstep(0.0, 0.08, vHeight) * smoothstep(1.0, 0.9, vHeight);
    float alpha = pow(facing, uSharp) * ends * uIntensity * vThin * (1.0 - vFog);
    alpha *= mix(1.0, exp(-vAbove * 0.6), uMirror);
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(mix(vColor, vec3(1.0), pow(facing, 12.0) * uCore), min(alpha, 1.0));
  }
`,lo=`
  ${ce}
  attribute vec4 aSeed;
  attribute float aEnd;
  uniform float uTravel;
  uniform float uStretch;
  uniform float uSpread;
  varying float vAlpha;
  void main() {
    float x = (aSeed.x - 0.5) * uSpread;
    float y = mix(1.0, 42.0, aSeed.y * aSeed.y);
    float speed = mix(140.0, 260.0, aSeed.w);
    float z = -uTravel + mod(uTime * speed + aSeed.z * uTravel, uTravel);
    float len = (0.6 + uStretch * 7.0) * mix(0.6, 1.4, aSeed.w);
    vec3 p = vec3(x, y, z + aEnd * len);
    p += bend(abs(p.z / uTravel));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vAlpha = aEnd * (1.0 - smoothstep(uFogNear, uFogFar, -mv.z));
  }
`,so=`
  uniform vec3 uColor;
  uniform float uIntensity;
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(uColor, vAlpha * uIntensity);
  }
`,co=`
  ${ce}
  uniform float uTravel;
  uniform float uWidth;
  varying vec2 vRoad;
  varying float vFog;
  void main() {
    vec3 p = position;
    p.x *= uWidth;
    vRoad = vec2(p.x, p.z);
    p += bend(abs(p.z / uTravel));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vFog = smoothstep(uFogNear, uFogFar, -mv.z);
  }
`,vo=`
  uniform float uTime;
  uniform vec3 uRoadColor;
  uniform vec3 uLineColor;
  uniform vec3 uBackground;
  uniform float uRoadWidth;
  uniform float uMedian;
  uniform float uLanes;
  uniform float uTransparent;
  uniform float uOpacity;
  varying vec2 vRoad;
  varying float vFog;
  float stripe(float d, float w) {
    float aa = fwidth(d) * 1.2;
    return 1.0 - smoothstep(w - aa, w + aa, d);
  }
  void main() {
    float rx = abs(vRoad.x) - uMedian * 0.5;
    vec3 color = rx < 0.0 ? mix(uRoadColor, uLineColor, 0.12) : uRoadColor;
    if (rx >= 0.0) {
      float laneWidth = uRoadWidth / uLanes;
      float shoulder = max(stripe(abs(rx - 0.3), 0.07), stripe(abs(rx - (uRoadWidth - 0.3)), 0.07));
      float nearest = floor(rx / laneWidth + 0.5);
      float inner = step(0.5, nearest) * step(nearest, uLanes - 0.5);
      float dash = step(0.5, fract((vRoad.y - uTime * 120.0) / 14.0));
      float marks = max(shoulder, stripe(abs(rx - nearest * laneWidth), 0.06) * inner * dash);
      color = mix(color, uLineColor, marks);
    }
    float alpha = mix(1.0, 1.0 - vFog, uTransparent) * uOpacity;
    gl_FragColor = vec4(mix(color, uBackground, vFog * (1.0 - uTransparent)), alpha);
  }
`,fo=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,mo=`
  uniform sampler2D uTexture;
  uniform vec2 uTexel;
  varying vec2 vUv;
  vec4 tap(vec2 offset) {
    return min(texture2D(uTexture, vUv + uTexel * offset), vec4(1.0));
  }
  void main() {
    vec4 sum = tap(vec2(0.0)) * 4.0 + tap(vec2(-1.0, -1.0)) + tap(vec2(1.0, -1.0)) + tap(vec2(-1.0, 1.0)) + tap(vec2(1.0, 1.0));
    gl_FragColor = sum * 0.125;
  }
`,mt=`
  uniform sampler2D uTexture;
  uniform vec2 uTexel;
  varying vec2 vUv;
  vec4 tent() {
    vec4 sum = texture2D(uTexture, vUv + uTexel * vec2(-1.0, 0.0));
    sum += texture2D(uTexture, vUv + uTexel * vec2(1.0, 0.0));
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.0, -1.0));
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.0, 1.0));
    sum += texture2D(uTexture, vUv + uTexel * vec2(-0.5, -0.5)) * 2.0;
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.5, -0.5)) * 2.0;
    sum += texture2D(uTexture, vUv + uTexel * vec2(-0.5, 0.5)) * 2.0;
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.5, 0.5)) * 2.0;
    return sum / 12.0;
  }
`,ho=`
  ${mt}
  void main() {
    gl_FragColor = tent();
  }
`,po=`
  ${mt}
  uniform float uStrength;
  uniform float uCeiling;
  uniform float uLight;
  void main() {
    vec4 color = tent() * uStrength;
    float peak = max(uLight > 0.5 ? color.a : max(color.r, max(color.g, color.b)), 0.0001);
    color *= uCeiling * (1.0 - exp(-peak / uCeiling)) / peak;
    gl_FragColor = uLight > 0.5 ? color : vec4(color.rgb, 0.0);
  }
`;let O=null;const $=n=>{if(O=O??document.createElement("canvas").getContext("2d"),!O)return[1,1,1];O.fillStyle="#000000",O.fillStyle=n;const o=String(O.fillStyle);if(o.startsWith("#")){const d=parseInt(o.slice(1,7),16);return[(d>>16&255)/255,(d>>8&255)/255,(d&255)/255]}const l=o.match(/[\d.]+/g)?.map(Number)??[0,0,0];return[l[0]/255,l[1]/255,l[2]/255]},be=(n,o,l)=>{const d=l.length?l:["#ffffff"];for(let v=0;v<K;v++)n.value[v].fromArray($(d[v%d.length]));o.value=Math.min(d.length,K)},ft=n=>{const o=new Qt;return o.setIndex(n.index),Object.entries(n.attributes).forEach(([l,d])=>o.setAttribute(l,d)),o},U=n=>Math.sin(n)*.5+.5,ie=(n,o)=>Math.cos(Math.PI*n*4+o)*25+Math.cos(Math.PI*n*8+o*2)**2*5,ue=(n,o)=>-U(Math.PI*n*8+o)*10-U(Math.PI*n+o/8)**5*10,le=(n,o)=>Math.sin(n*Math.PI*4+o)*10,se=(n,o)=>Math.abs(n*10)**2+Math.sin(n*Math.PI*8+o)*20,go=(n,o)=>{const{PI:l,cos:d,sin:v}=Math;return[[d(n*l*5+o)*25-d(.02*l*5+o)*25,v(n*l*2+l*.5+o)*15-v(.02*l*2+l*.5+o)*15,0],[ie(n,o)-ie(.0125,o),ue(n,o)-ue(.0125,o),0],[d(n*l*3+o)*30-d(.02*l*3+o)*30,U(n*l*6+o)*30-U(.02*l*6+o)*30,U(n*l*10+o)*20-U(.02*l*10+o)*20],[v(n*l*2+o)*35-v(.0125*l*2+o)*35,v(n*l*3+o)*10-v(.0125*l*3+o)*10,0],[le(n,o)-le(.02,o),se(n,o)-se(.02,o),0]]},xo=(n,o)=>{const[d,,v,q]=go(.025,n);return[[d[0]*o*2,d[1]*o*.4,-3],[(ie(.025,n)-ie(.025+.007,n))*o*-2,(ue(.025,n)-ue(.025+.007,n))*o*-5,-10],[v[0]*o*2,v[1]*o*2,v[2]*o*2-5],[q[0]*o,q[1]*o,-5],[(le(.025,n)-le(.025+.01,n))*o*-2,(se(.025,n)-se(.025+.01,n))*o*-4,-10]]},Co=({curve:n="winding",curvature:o=1,speed:l=1,boost:d=3,fov:v=90,boostFov:q=130,lanes:ht=3,roadWidth:pt=10,medianWidth:gt=2,density:xt=40,trailLength:wt=1,lightSize:yt=1,poles:Ct=20,poleHeight:Mt=1,dust:Tt=100,glow:bt=.6,reflections:St=.5,steer:At=.35,tailColors:Se,headColors:Ae,poleColors:Re,roadColor:Rt,roadOpacity:Ft=.1,lineColor:Et,background:Pt,theme:Fe="dark",interactive:It=!0,boosting:Lt=!1,onBoostStart:Ee,onBoostEnd:Pe,className:Ie="",style:Wt})=>{const Le=ne.useRef(null),S=vt[Fe]??vt.dark,We={light:Fe==="light",curve:dt.includes(n)?n:"winding",curvature:Math.max(0,o),speed:Math.max(0,l),boost:Math.max(1,d),fov:Math.min(170,Math.max(20,v)),boostFov:Math.min(170,Math.max(20,q)),lanes:Math.max(1,Math.round(ht)),roadWidth:Math.max(1,pt),medianWidth:Math.max(0,gt),density:Math.min(D,Math.max(0,Math.round(xt))),trailLength:Math.max(.05,wt),lightSize:Math.max(.1,yt),poles:Math.min(Y,Math.max(0,Math.round(Ct))),poleHeight:Math.max(.1,Mt),dust:Math.min(j,Math.max(0,Math.round(Tt))),glow:Math.max(0,bt),reflections:Math.max(0,St),steer:Math.max(0,At),tailColors:Se?.length?Se:S.tail,headColors:Ae?.length?Ae:S.head,poleColors:Re?.length?Re:S.poles,roadColor:Rt??S.road,roadOpacity:Math.min(1,Math.max(0,Ft)),lineColor:Et??S.lines,background:Pt??S.background,dustColor:S.dust,interactive:It,boosting:Lt},W=ne.useRef(We);W.current=We;const de=ne.useRef({onBoostStart:Ee,onBoostEnd:Pe});return de.current={onBoostStart:Ee,onBoostEnd:Pe},ne.useEffect(()=>{const m=Le.current;if(!m)return;const ze=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,s=new Ut({antialias:!0,alpha:!0,powerPreference:"high-performance"});s.outputColorSpace=rt,s.autoClear=!1,s.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),m.appendChild(s.domElement);const z=new it,p=new Vt(W.current.fov,1,.1,1e4);p.position.set(0,8,-5);const g={uTime:{value:0},uCurvature:{value:1},uCurveA:{value:new Nt},uCurveB:{value:0},uFogNear:{value:H*.22},uFogFar:{value:H*.95},uTravel:{value:H},uStretch:{value:0},uPixel:{value:.001}},x=[],Z=[],J=(t,e,r,c={})=>{const h=new lt({vertexShader:t,fragmentShader:e,uniforms:{...g,...r},transparent:!0,depthWrite:!1,...c});return x.push(h),h},Xe=()=>({value:Array.from({length:K},()=>new T(1,1,1))}),Q=new ut(1,H,1,220);Q.rotateX(-Math.PI/2),Q.translate(0,0,-H/2),x.push(Q);const w={uWidth:{value:1},uRoadColor:{value:new T},uLineColor:{value:new T},uBackground:{value:new T},uRoadWidth:{value:10},uMedian:{value:2},uLanes:{value:3},uTransparent:{value:0},uOpacity:{value:1}},ee=J(co,vo,w,{transparent:!0,depthWrite:!0}),te=new re(Q,ee);te.frustumCulled=!1,te.renderOrder=0,te.layers.enable(1),z.add(te);const _e=new kt(new Gt(new T(0,0,0),new T(0,0,-1)),24,1,7,!1);x.push(_e);const Be=(t,e,r)=>{const c=ft(_e),h=new Float32Array(D*2*4),f=new Float32Array(D*2*4),P=new Float32Array(D*2),N=new Float32Array(D*2);for(let M=0;M<D;M++){const B=[Math.random(),Math.random(),Math.random(),Math.random()],I=[Math.random(),Math.random(),Math.random(),Math.random()*Math.random()],G=Math.random();for(let i=0;i<2;i++){const u=M*2+i;h.set(B,u*4),f.set(I,u*4),P[u]=i?.5:-.5,N[u]=G}}c.setAttribute("aSeedA",new L(h,4)),c.setAttribute("aSeedB",new L(f,4)),c.setAttribute("aPair",new L(P,1)),c.setAttribute("aTone",new L(N,1)),c.instanceCount=0,x.push(c);const k={uRoadX:{value:0},uRoadWidth:{value:10},uLanes:{value:3},uDirection:{value:t},uSpeedRange:{value:new Te(...r)},uTrail:{value:1},uSize:{value:1},uColors:Xe(),uColorCount:{value:1},uFade:{value:new Te(...e)}},ae=(M,B,I,G)=>{const i=J(no,ro,{...k,uRadiusScale:{value:M},uSharp:{value:B},uMirror:{value:I},uIntensity:{value:1},uCore:{value:0}},{depthTest:!I});Z.push(i);const u=new re(c,i);return u.frustumCulled=!1,u.renderOrder=G,I||u.layers.enable(1),z.add(u),i};return{geometry:c,uniforms:k,reflection:ae(2.1,1.2,1,1),core:ae(1,.85,0,3)}},ve=Be(1,[0,.6],[60,80]),fe=Be(-1,[1,.4],[120,160]),De=new Ht(1,1,1,8,1,!0);x.push(De);const A=ft(De),Oe=new Float32Array(Y*2*4),Ue=new Float32Array(Y*2),Ve=new Float32Array(Y*2);for(let t=0;t<Y;t++)for(let e=0;e<2;e++){const r=t*2+e;Oe.set([Math.random(),Math.random(),Math.random(),Math.random()],r*4),Ue[r]=t+(e?.5:0),Ve[r]=e?1:-1}A.setAttribute("aSeed",new L(Oe,4)),A.setAttribute("aIndex",new L(Ue,1)),A.setAttribute("aSide",new L(Ve,1)),A.instanceCount=0,x.push(A);const X={uCount:{value:20},uEdge:{value:11},uHeight:{value:1},uColors:Xe(),uColorCount:{value:1}},Ne=(t,e,r,c)=>{const h=J(io,uo,{...X,uRadiusScale:{value:t},uSharp:{value:e},uMirror:{value:r},uIntensity:{value:1},uCore:{value:0}},{depthTest:!r});Z.push(h);const f=new re(A,h);return f.frustumCulled=!1,f.renderOrder=c,r||f.layers.enable(1),z.add(f),h},me={reflection:Ne(2.4,1.2,1,1),core:Ne(1,.8,0,3)},R=new Yt,he=new Float32Array(j*2*4),ke=new Float32Array(j*2);for(let t=0;t<j;t++){const e=[Math.random(),Math.random(),Math.random(),Math.random()];he.set(e,t*8),he.set(e,t*8+4),ke[t*2+1]=1}R.setAttribute("position",new Me(new Float32Array(j*2*3),3)),R.setAttribute("aSeed",new Me(he,4)),R.setAttribute("aEnd",new Me(ke,1)),R.setDrawRange(0,0),x.push(R);const oe={uSpread:{value:140},uColor:{value:new T(1,1,1)},uIntensity:{value:.5}},Ge=J(lo,so,oe);Z.push(Ge);const pe=new jt(R,Ge);pe.frustumCulled=!1,pe.renderOrder=4,z.add(pe);const zt=s.extensions.has("EXT_color_buffer_float")||s.extensions.has("EXT_color_buffer_half_float"),y=Array.from({length:5},(t,e)=>{const r=new $t(1,1,{type:zt?Kt:qt,depthBuffer:e===0});return x.push(r),r}),He=new it,Xt=new Zt(-1,1,1,-1,0,1),Ye=new ut(2,2);x.push(Ye);const ge=new re(Ye);ge.frustumCulled=!1,He.add(ge);const xe=(t,e)=>{const r=new lt({vertexShader:fo,fragmentShader:t,uniforms:{uTexture:{value:null},uTexel:{value:new Te},uStrength:{value:1},uCeiling:{value:1},uLight:{value:0}},depthTest:!1,depthWrite:!1,...e});return x.push(r),r},_t=xe(mo,{blending:ao}),Bt=xe(ho,{blending:ct,blendSrc:b,blendDst:b,blendSrcAlpha:b,blendDstAlpha:b}),F=xe(po,{blending:ct,blendSrc:b}),we=(t,e,r)=>{ge.material=t,t.uniforms.uTexture.value=e.texture,t.uniforms.uTexel.value.set(1/e.width,1/e.height),s.setRenderTarget(r),s.render(He,Xt)},je=new Jt;let $e=0;const a={boost:0,held:!1,fov:W.current.fov,fovVelocity:0,steerX:0,steerY:0,pointerX:0,pointerY:0,weights:[0,0,0,0,0],visible:!0},C={tail:"",head:"",poles:"",surface:"",light:null},E=new T;let V=0,ye=performance.now(),Ce=!0;const Dt=t=>{const e=t.tailColors.join();e!==C.tail&&(C.tail=e,be(ve.uniforms.uColors,ve.uniforms.uColorCount,t.tailColors));const r=t.headColors.join();r!==C.head&&(C.head=r,be(fe.uniforms.uColors,fe.uniforms.uColorCount,t.headColors));const c=t.poleColors.join();c!==C.poles&&(C.poles=c,be(X.uColors,X.uColorCount,t.poleColors));const h=[t.roadColor,t.lineColor,t.background,t.dustColor].join();if(h!==C.surface){C.surface=h,w.uRoadColor.value.fromArray($(t.roadColor)),w.uLineColor.value.fromArray($(t.lineColor)),oe.uColor.value.fromArray($(t.dustColor));const f=t.background==="transparent",P=f?[0,0,0]:$(t.background);w.uBackground.value.fromArray(P),w.uTransparent.value=f?1:0,je.setRGB(...P,rt),$e=f?0:1}C.light!==t.light&&(C.light=t.light,Z.forEach(f=>{f.blending=t.light?eo:to,f.needsUpdate=!0}),F.blendDst=t.light?st:b,F.blendSrcAlpha=t.light?b:oo,F.blendDstAlpha=t.light?st:b,F.uniforms.uLight.value=t.light?1:0)},Ke=()=>{const t=Math.max(1,m.clientWidth),e=Math.max(1,m.clientHeight);s.setSize(t,e,!1),y.forEach((r,c)=>r.setSize(Math.max(1,Math.round(t/2**(c+1))),Math.max(1,Math.round(e/2**(c+1))))),p.aspect=t/e,p.updateProjectionMatrix(),Ze()},qe=t=>{if(V=0,!Ce)return;const e=W.current,r=Math.min(.05,Math.max(.001,(t-ye)/1e3));ye=t,Dt(e);const c=a.held&&e.interactive||e.boosting?1:0;a.boost+=(c-a.boost)*(1-Math.exp(-r/(c>a.boost?.28:.85)));const h=e.speed*(ze?.3:1)*(1+(e.boost-1)*a.boost);g.uTime.value+=r*h,g.uStretch.value=a.boost*1.1,g.uCurvature.value=e.curvature;const f=dt.indexOf(e.curve)-1,P=1-Math.exp(-r/.6);a.weights=a.weights.map((i,u)=>i+((u===f?1:0)-i)*P),g.uCurveA.value.set(a.weights[0],a.weights[1],a.weights[2],a.weights[3]),g.uCurveB.value=a.weights[4];const N=e.roadWidth/2+e.medianWidth/2,k=.45+.55*e.roadOpacity;[ve,fe].forEach((i,u)=>{i.geometry.instanceCount=e.density*2,i.uniforms.uRoadX.value=u?N:-N,i.uniforms.uRoadWidth.value=e.roadWidth,i.uniforms.uLanes.value=e.lanes,i.uniforms.uTrail.value=e.trailLength,i.uniforms.uSize.value=e.lightSize,i.core.uniforms.uIntensity.value=e.light?.95:1+.35*a.boost,i.core.uniforms.uCore.value=e.light?0:.75,i.reflection.uniforms.uIntensity.value=e.reflections*(e.light?.22:.42)*k}),A.instanceCount=e.poles*2,X.uCount.value=Math.max(1,e.poles),X.uEdge.value=e.roadWidth+e.medianWidth/2+.8,X.uHeight.value=e.poleHeight,me.core.uniforms.uIntensity.value=e.light?.9:1,me.core.uniforms.uCore.value=e.light?0:.6,me.reflection.uniforms.uIntensity.value=e.reflections*(e.light?.2:.38)*k,R.setDrawRange(0,e.dust*2),oe.uIntensity.value=(e.light?.35:.45)*(1+a.boost),oe.uSpread.value=(e.roadWidth*2+e.medianWidth)*5,w.uWidth.value=e.roadWidth*2+e.medianWidth+3,w.uRoadWidth.value=e.roadWidth,w.uMedian.value=e.medianWidth,w.uLanes.value=e.lanes,w.uOpacity.value=e.roadOpacity,ee.depthWrite=e.roadOpacity>.5;const ae=ze?e.fov:e.fov+(e.boostFov-e.fov)*a.boost;a.fovVelocity+=((ae-a.fov)*90-a.fovVelocity*13)*r,a.fov+=a.fovVelocity*r,p.fov=a.fov,g.uPixel.value=2*Math.tan(a.fov*Math.PI/360)/Math.max(1,s.domElement.height);const M=1-Math.exp(-r/.35),B=e.interactive?e.steer:0;a.steerX+=(a.pointerX*B-a.steerX)*M,a.steerY+=(a.pointerY*B-a.steerY)*M,p.position.set(a.steerX*e.roadWidth*.45,8-a.steerY*2.5,-5);const I=xo(g.uTime.value,e.curvature),G=1-a.weights.reduce((i,u)=>i+u,0);if(E.set(0,0,-10*G),I.forEach((i,u)=>{E.x+=i[0]*a.weights[u],E.y+=i[1]*a.weights[u],E.z+=i[2]*a.weights[u]}),E.x+=a.steerX*2.5,E.add(p.position),p.lookAt(E),p.updateProjectionMatrix(),s.setRenderTarget(null),s.setClearColor(je,$e),s.clear(),s.render(z,p),e.glow>0){const i=g.uPixel.value;g.uPixel.value=i*(s.domElement.height/y[0].height),p.layers.set(1),ee.colorWrite=!1,s.setRenderTarget(y[0]),s.setClearColor(0,0),s.clear(),s.render(z,p),ee.colorWrite=!0,p.layers.set(0),g.uPixel.value=i;for(let u=1;u<y.length;u++)we(_t,y[u-1],y[u]);for(let u=y.length-1;u>1;u--)we(Bt,y[u],y[u-1]);F.uniforms.uStrength.value=e.glow*(e.light?.5:1.4),F.uniforms.uCeiling.value=e.glow*(e.light?.3:.5),we(F,y[1],null)}a.visible&&(V=requestAnimationFrame(qe))},Ze=()=>{V||!Ce||!a.visible||(ye=performance.now(),V=requestAnimationFrame(qe))},Je=t=>{a.held!==t&&(a.held=t,W.current.interactive&&(t?de.current.onBoostStart?.():de.current.onBoostEnd?.()))},Qe=t=>{t.button!==0&&t.pointerType==="mouse"||Je(!0)},_=()=>Je(!1),et=t=>{const e=m.getBoundingClientRect();a.pointerX=(t.clientX-e.left)/e.width*2-1,a.pointerY=(t.clientY-e.top)/e.height*2-1},tt=()=>{a.pointerX=0,a.pointerY=0},ot=t=>{W.current.interactive&&t.preventDefault()},at=new ResizeObserver(Ke);at.observe(m);const nt=new IntersectionObserver(t=>{a.visible=t.some(e=>e.isIntersecting),a.visible&&Ze()});return nt.observe(m),m.addEventListener("pointerdown",Qe),m.addEventListener("pointermove",et),m.addEventListener("pointerleave",tt),m.addEventListener("contextmenu",ot),window.addEventListener("pointerup",_),window.addEventListener("pointercancel",_),window.addEventListener("blur",_),Ke(),()=>{Ce=!1,cancelAnimationFrame(V),at.disconnect(),nt.disconnect(),m.removeEventListener("pointerdown",Qe),m.removeEventListener("pointermove",et),m.removeEventListener("pointerleave",tt),m.removeEventListener("contextmenu",ot),window.removeEventListener("pointerup",_),window.removeEventListener("pointercancel",_),window.removeEventListener("blur",_),x.forEach(t=>t.dispose()),s.dispose(),s.domElement.remove()}},[]),Ot.jsx("div",{ref:Le,className:`hyperspeed${Ie?` ${Ie}`:""}`,style:Wt})};export{Co as default};
