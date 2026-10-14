import{r as o,j as $,R as X,T as Y,P as J,M as K}from"../text-animations-Covp24vw.js";const O="#ffffff",B=l=>{const r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(l);return r?[parseInt(r[1],16)/255,parseInt(r[2],16)/255,parseInt(r[3],16)/255]:[1,1,1]},U=(l,r,s)=>{const c=.2*Math.min(r,s);switch(l){case"top-left":return{anchor:[0,-c],dir:[0,1]};case"top-right":return{anchor:[r,-c],dir:[0,1]};case"left":return{anchor:[-.2*r,.5*s],dir:[1,0]};case"right":return{anchor:[(1+.2)*r,.5*s],dir:[-1,0]};case"bottom-left":return{anchor:[0,s+c],dir:[0,-1]};case"bottom-center":return{anchor:[.5*r,s+c],dir:[0,-1]};case"bottom-right":return{anchor:[r,s+c],dir:[0,-1]};default:return{anchor:[.5*r,-c],dir:[0,1]}}},Z=({raysOrigin:l="top-center",raysColor:r=O,raysSpeed:s=1,lightSpread:h=1,rayLength:c=2,pulsating:b=!1,fadeDistance:w=1,saturation:S=1,followMouse:D=!0,mouseInfluence:p=.1,noiseAmount:P=0,distortion:A=0,lightMode:T=!1,className:j=""})=>{const n=o.useRef(null),y=o.useRef(null),m=o.useRef(null),E=o.useRef({x:.5,y:.5}),v=o.useRef({x:.5,y:.5}),x=o.useRef(null),F=o.useRef(null),d=o.useRef(null),[z,k]=o.useState(!1),R=o.useRef(null);return o.useEffect(()=>{if(n.current)return R.current=new IntersectionObserver(e=>{const t=e[0];k(t.isIntersecting)},{threshold:.1}),R.current.observe(n.current),()=>{R.current&&(R.current.disconnect(),R.current=null)}},[]),o.useEffect(()=>!z||!n.current?void 0:(d.current&&(d.current(),d.current=null),(async()=>{if(!n.current||(await new Promise(i=>setTimeout(i,10)),!n.current))return;const t=new X({dpr:Math.min(window.devicePixelRatio,2),alpha:!0});m.current=t;const a=t.gl;for(a.canvas.style.width="100%",a.canvas.style.height="100%";n.current.firstChild;)n.current.removeChild(n.current.firstChild);n.current.appendChild(a.canvas);const C=`
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`,g=`precision highp float;

uniform float iTime;
uniform vec2  iResolution;

uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;
uniform float lightMode;

varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                  float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);

  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
  
  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  float distance = length(sourceToCoord);
  // Core appshell change: reach is measured on the longer side (was width only), so the rays still
  // reach into tall, narrow containers such as the Chat AI drawer. Wide areas are unchanged.
  float span = max(iResolution.x, iResolution.y);
  float maxDistance = span * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
  
  float fadeFalloff = clamp((span * fadeDistance - distance) / (span * fadeDistance), 0.5, 1.0);
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0, 1.0
  );

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  
  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 rays1 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349,
                           1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234,
                           1.1 * raysSpeed);

  fragColor = rays1 * 0.5 + rays2 * 0.4;

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  float brightness = 1.0 - (coord.y / iResolution.y);
  fragColor.x *= 0.1 + brightness * 0.8;
  fragColor.y *= 0.3 + brightness * 0.6;
  fragColor.z *= 0.5 + brightness * 0.5;

  if (saturation != 1.0) {
    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
  }

  fragColor.rgb *= raysColor;

  if (lightMode > 0.5) {
    vec3 mapped = vec3(1.0) - exp(-max(fragColor.rgb, vec3(0.0)) * 1.35);
    float energy = clamp(max(mapped.r, max(mapped.g, mapped.b)), 0.0, 1.0);
    vec3 hue = mapped / max(energy, 0.0001);
    vec3 ink = mix(hue * 0.25, hue * 0.72, energy);
    fragColor = vec4(mix(vec3(1.0), ink, energy), 1.0);
  }
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor  = color;
}`,u={iTime:{value:0},iResolution:{value:[1,1]},rayPos:{value:[0,0]},rayDir:{value:[0,1]},raysColor:{value:B(r)},raysSpeed:{value:s},lightSpread:{value:h},rayLength:{value:c},pulsating:{value:b?1:0},fadeDistance:{value:w},saturation:{value:S},mousePos:{value:[.5,.5]},mouseInfluence:{value:p},noiseAmount:{value:P},distortion:{value:A},lightMode:{value:T?1:0}};y.current=u;const L=new Y(a),q=new J(a,{vertex:C,fragment:g,uniforms:u}),W=new K(a,{geometry:L,program:q});F.current=W;const I=()=>{if(!n.current||!t)return;t.dpr=Math.min(window.devicePixelRatio,2);const{clientWidth:i,clientHeight:f}=n.current;t.setSize(i,f);const _=t.dpr,G=i*_,N=f*_;u.iResolution.value=[G,N];const{anchor:H,dir:V}=U(l,G,N);u.rayPos.value=H,u.rayDir.value=V},M=i=>{if(!(!m.current||!y.current||!F.current)){u.iTime.value=i*.001,D&&p>0&&(v.current.x=v.current.x*.92+E.current.x*(1-.92),v.current.y=v.current.y*.92+E.current.y*(1-.92),u.mousePos.value=[v.current.x,v.current.y]);try{t.render({scene:W}),x.current=requestAnimationFrame(M)}catch(f){console.warn("WebGL rendering error:",f);return}}};window.addEventListener("resize",I),I(),x.current=requestAnimationFrame(M),d.current=()=>{if(x.current&&(cancelAnimationFrame(x.current),x.current=null),window.removeEventListener("resize",I),t)try{const i=t.gl.canvas,f=t.gl.getExtension("WEBGL_lose_context");f&&f.loseContext(),i&&i.parentNode&&i.parentNode.removeChild(i)}catch(i){console.warn("Error during WebGL cleanup:",i)}m.current=null,y.current=null,F.current=null}})(),()=>{d.current&&(d.current(),d.current=null)}),[z,l,r,s,h,c,b,w,S,D,p,P,A,T]),o.useEffect(()=>{if(!y.current||!n.current||!m.current)return;const e=y.current,t=m.current;e.raysColor.value=B(r),e.raysSpeed.value=s,e.lightSpread.value=h,e.rayLength.value=c,e.pulsating.value=b?1:0,e.fadeDistance.value=w,e.saturation.value=S,e.mouseInfluence.value=p,e.noiseAmount.value=P,e.distortion.value=A,e.lightMode.value=T?1:0;const{clientWidth:a,clientHeight:C}=n.current,g=t.dpr,{anchor:u,dir:L}=U(l,a*g,C*g);e.rayPos.value=u,e.rayDir.value=L},[r,s,h,l,c,b,w,S,p,P,A,T]),o.useEffect(()=>{const e=t=>{if(!n.current||!m.current)return;const a=n.current.getBoundingClientRect(),C=(t.clientX-a.left)/a.width,g=(t.clientY-a.top)/a.height;E.current={x:C,y:g}};if(D)return window.addEventListener("mousemove",e),()=>window.removeEventListener("mousemove",e)},[D]),$.jsx("div",{ref:n,className:`light-rays-container ${j}`.trim()})};export{Z as default};
