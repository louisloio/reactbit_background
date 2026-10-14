import{r as D,j as Oe}from"../text-animations-BzfSDftD.js";const R=24,it=8,U=3,rt=1.8,N=["top","middle","bottom"],st={top:{x:10,y:.5,rotate:-.4},middle:{x:5,y:0,rotate:.2},bottom:{x:2,y:-.7,rotate:-1}},lt={top:{offset:1,step:.2,light:.2,flip:1,depth:1,drift:.6},middle:{offset:2,step:.15,light:1,flip:0,depth:0,drift:1},bottom:{offset:1.5,step:.2,light:.32,flip:0,depth:.6,drift:1.4}},ct=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,ut=`#version 300 es
precision highp float;
precision highp int;
uniform vec2 uResolution;
uniform float uRatio;
uniform vec4 uWave[3];
uniform vec4 uShape[3];
uniform vec4 uParallax[3];
uniform int uCount[3];
uniform vec4 uLine[${R*3}];
uniform vec3 uLineColor[${R*3}];
uniform vec2 uMouseWarp[3];
uniform float uHaloReach;
uniform float uWidth;
uniform float uGlow;
uniform float uBrightness;
uniform float uFocus;
uniform float uEdgeFade;
uniform vec4 uMouse;
uniform float uBendRadius;
uniform float uBendStrength;
uniform vec4 uClicks[${U}];
uniform float uLight;
uniform float uOpaque;
uniform vec3 uBackground;
uniform float uOpacity;
uniform float uStyle;
uniform float uSpacing;
out vec4 outColor;

vec3 toSrgb(vec3 c) {
  return pow(max(c, 0.0), vec3(1.0 / 2.2));
}

vec3 inkOf(vec3 color) {
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  return color * min(1.0, 0.16 / max(luma, 0.001));
}

vec2 warp(vec2 p, float rotate, float flip) {
  float angle = rotate * log(length(p) + 1.0);
  vec2 r = p * mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
  if (flip > 0.5) r.x = -r.x;
  return r;
}

void main() {
  vec2 screen = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;
  screen.y = -screen.y;
  for (int k = 0; k < ${U}; k++) {
    vec4 click = uClicks[k];
    if (click.w == 0.0) continue;
    float age = click.z;
    float turn = 1.9 * smoothstep(0.0, 0.23, age) * exp(-max(age - 0.23, 0.0) * 1.1) * click.w;
    float spread = 0.3 * (1.0 + age * 0.55);
    vec2 offset = screen - click.xy;
    float angle = turn * exp(-dot(offset, offset) / (spread * spread));
    screen = click.xy + mat2(cos(angle), sin(angle), -sin(angle), cos(angle)) * offset;
  }
  vec3 light = vec3(0.0);
  vec3 bloom = vec3(0.0);
  vec3 inkColor = vec3(0.0);
  float inkAlpha = 0.0;
  float aa = 0.75 * uRatio;
  float invSigma = 1.0 / max(uBendRadius * uBendRadius, 1e-4);
  float tight = 1.0 / (2.6 * uRatio);
  float wide = 1.0 / (11.0 * uRatio);

  for (int w = 0; w < 3; w++) {
    int count = uCount[w];
    if (count <= 0) continue;
    vec4 wave = uWave[w];
    vec4 shape = uShape[w];
    vec2 r = warp(screen + uParallax[w].xy, wave.z, shape.w);
    vec2 rm = uMouseWarp[w];
    float blur = uFocus * uParallax[w].z;
    float width = uWidth * (1.0 + blur * 2.5);
    float soft = aa * (1.0 + blur * 7.0);
    float energy = (uWidth + aa) / (width + soft) * shape.z;
    float cut = uHaloReach + width * 2.0 + soft;
    float sx = sin(r.x);
    float cx = cos(r.x);
    float along = r.x - rm.x;
    float pull = uMouse.z * exp(-along * along * invSigma);
    float level = r.y + wave.y;
    int first = w * ${R};

    for (int i = 0; i < ${R}; i++) {
      if (i >= count) break;
      vec4 line = uLine[first + i];
      float y = (sx * line.x + cx * line.y) * line.z;
      float near = 0.0;
      if (pull > 0.002) {
        float across = (y - wave.y) - rm.y;
        near = exp(-across * across * invSigma) * pull;
        float push = uBendStrength * near;
        y += across * (uBendStrength < 0.0 ? min(-push, 2.5) : -min(push, 0.9));
      }
      float m = level - y;
      float slope = length(vec2(dFdx(m), dFdy(m)));
      float d = abs(m) / max(slope, 1e-5);
      if (d < cut) {
        float gap = d;
        float size = width;
        if (uStyle > 0.5) {
          float period = uSpacing / (uResolution.y * 0.5);
          float cell = (fract((r.x + line.w) / period + float(i) * 0.37) - 0.5) * uSpacing;
          float span = uStyle > 1.5 ? max(uSpacing * 0.32 - width, 0.0) : 0.0;
          gap = length(vec2(max(abs(cell) - span, 0.0), d));
          size = uStyle > 1.5 ? width : width * 1.6;
        }
        float core = smoothstep(size + soft, size - soft, gap);
        float fall = 1.0 - d / cut;
        float halo = (exp(-gap * tight) * 0.3 + exp(-d * wide) * 0.02 * fall * fall) * uGlow;
        vec3 color = uLineColor[first + i];
        float lift = 1.0 + near * 0.8;
        light += color * core * energy * lift;
        bloom += color * halo * shape.z * lift;
        float a = clamp(clamp(core * energy * 1.15 + halo * shape.z * 0.12, 0.0, 1.0) * lift, 0.0, 1.0);
        inkColor = inkOf(color) * a + inkColor * (1.0 - a);
        inkAlpha = a + inkAlpha * (1.0 - a);
      }
    }
  }

  float edge = 1.0;
  if (uEdgeFade > 0.0) {
    float u = gl_FragCoord.x / uResolution.x;
    float fade = uEdgeFade * 0.45;
    float left = smoothstep(0.0, fade, u);
    float right = smoothstep(0.0, fade, 1.0 - u);
    edge = left * left * (3.0 - 2.0 * left) * right * right * (3.0 - 2.0 * right);
  }

  if (uLight > 0.5) {
    float alpha = inkAlpha * edge * uOpacity;
    vec3 ink = toSrgb(inkColor / max(inkAlpha, 1e-4));
    if (uOpaque > 0.5) {
      outColor = vec4(mix(uBackground, ink, alpha), 1.0);
    } else {
      outColor = vec4(ink * alpha, alpha);
    }
    return;
  }

  vec3 capped = 0.28 * (1.0 - exp(-bloom / 0.28));
  vec3 glow = toSrgb(1.0 - exp(-(light + capped) * uBrightness * 1.2)) * edge * uOpacity;
  if (uOpaque > 0.5) {
    outColor = vec4(uBackground + glow * (1.0 - uBackground), 1.0);
  } else {
    outColor = vec4(glow, max(glow.r, max(glow.g, glow.b)));
  }
}`,b=(t,d,p)=>Math.min(p,Math.max(d,t)),ft=(t,d,p,a)=>{const w=p*Math.log(Math.hypot(t,d)+1),k=Math.cos(w),y=Math.sin(w),S=t*k+d*y;return[a>.5?-S:S,d*k-t*y]},De=(t,d,p)=>{const a=t.createShader(d);return a?(t.shaderSource(a,p),t.compileShader(a),t.getShaderParameter(a,t.COMPILE_STATUS)?a:(t.deleteShader(a),null)):null},dt=t=>{const d=De(t,t.VERTEX_SHADER,ct),p=De(t,t.FRAGMENT_SHADER,ut),a=t.createProgram();if(!d||!p||!a)return null;if(t.attachShader(a,d),t.attachShader(a,p),t.bindAttribLocation(a,0,"aPosition"),t.linkProgram(a),t.deleteShader(d),t.deleteShader(p),!t.getProgramParameter(a,t.LINK_STATUS))return t.deleteProgram(a),null;const w={},k=t.getProgramParameter(a,t.ACTIVE_UNIFORMS);for(let y=0;y<k;y++){const S=t.getActiveUniform(a,y);S&&(w[S.name.replace("[0]","")]=t.getUniformLocation(a,S.name))}return{program:a,uniforms:w}},We=(t,d,p,a)=>{if(typeof t=="number")return t;if(!Array.isArray(t)||t.length===0)return a;const w=d.indexOf(p);return t[w]??t[t.length-1]??a},pt=({linesGradient:t=["#e945f5","#ffffff"],enabledWaves:d=["top","middle","bottom"],lineCount:p=10,lineDistance:a=6,topWavePosition:w,middleWavePosition:k,bottomWavePosition:y,animationSpeed:S=1,amplitude:_e=1,lineWidth:Te=1,lineStyle:Z="solid",glow:ze=1,brightness:Ie=1,depthOfField:Ve=.5,edgeFade:Ne=0,interactive:Ue=!0,bendRadius:Xe=5,bendStrength:$e=-.5,mouseDamping:qe=.05,parallax:He=!0,parallaxStrength:Ge=.2,clickSwirl:je=!0,intro:Ye=!0,mixBlendMode:Ke="screen",backgroundColor:ee,lightMode:te=!1,opacity:Je=1,dpr:Qe,className:oe="",style:Ze,...et})=>{const ne=D.useRef(null),ae=D.useRef(null),X=D.useRef(null),$=Array.isArray(d)?d.filter(m=>N.includes(m)):N,ie={stops:Array.isArray(t)&&t.length?t.slice(0,it):["#ffffff"],waves:N.map(m=>{const g=$.includes(m),e={...st[m],...m==="top"?w:m==="middle"?k:y};return{count:g?b(Math.round(We(p,$,m,10)),0,R):0,distance:We(a,$,m,6)*.01,position:e}}),animationSpeed:Math.max(0,S),amplitude:Math.max(0,_e),lineWidth:Math.max(.1,Te),style:Z==="dashed"?2:Z==="dotted"?1:0,glow:Math.max(0,ze),brightness:Math.max(0,Ie),depthOfField:b(Ve,0,1),edgeFade:b(Ne,0,1),interactive:Ue,bendRadius:Math.max(.1,Xe),bendStrength:$e,mouseDamping:b(qe,0,1),parallax:He,parallaxStrength:Math.max(0,Ge),clickSwirl:je,intro:Ye,backgroundColor:ee,lightMode:te,opacity:b(Je,0,1),dpr:Qe},A=D.useRef(ie);return A.current=ie,D.useEffect(()=>{const m=ne.current,g=ae.current,e=g?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!m||!g||!e)return;const T=dt(e);if(!T)return;const i=T.uniforms,re=e.createBuffer(),q=e.createVertexArray();e.bindVertexArray(q),e.bindBuffer(e.ARRAY_BUFFER,re),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const F=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),H=new Map,se=(o,n)=>{if(!o)return n;const r=String(o);if(H.has(r))return H.get(r);let u=n;if(F){F.clearRect(0,0,1,1),F.fillStyle="#000000",F.fillStyle=r,F.fillRect(0,0,1,1);const[h,f,_]=F.getImageData(0,0,1,1).data;u=[h/255,f/255,_/255]}return H.set(r,u),u},L=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,s={x:0,y:0,nx:0,ny:0,vx:0,inside:!1},l={x:0,y:0,influence:0,px:0,py:0},M=[],le=new Float32Array(12),ce=new Float32Array(12),ue=new Float32Array(12),fe=new Int32Array(3),de=new Float32Array(R*3*4),me=new Float32Array(R*3*3),he=new Float32Array(6),G=new Float32Array(U*4);let j=0,E=A.current.intro&&!L?0:1,C=0,W=0,z=!0;const Y=()=>{const o=A.current,n=g.width,r=g.height,u=E*E*(3-2*E),h=n/Math.max(1,m.clientWidth),f=o.stops.map(c=>se(c,[1,1,1]).map(x=>Math.pow(x,2.2))),_=(2*l.x-n)/r,J=-(2*l.y-r)/r;o.waves.forEach((c,x)=>{const v=lt[N[x]],{x:Re,y:tt,rotate:Ee}=c.position,be=l.px*v.drift,ke=-l.py*v.drift;le.set([Re,tt,Ee,0],x*4),ce.set([v.offset,v.step,v.light,v.flip],x*4),ue.set([be,ke,v.depth,0],x*4),he.set(ft(_+be,J+ke,Ee,v.flip),x*2),fe[x]=c.count;for(let B=0;B<c.count;B++){const Fe=v.offset+v.step*B,Le=c.distance*B+Re,Ce=Le+Fe+j*.1,ot=Math.sin(Fe+j*.2)*.3*o.amplitude*u,Pe=x*R+B;de.set([Math.cos(Ce),Math.sin(Ce),ot,Le],Pe*4);const Be=(c.count>1?B/(c.count-1):0)*Math.max(f.length-1,0),V=Math.min(Math.floor(Be),Math.max(f.length-2,0)),nt=Math.min(V+1,f.length-1),Q=b(Be-V,0,1),at=Q*Q*(3-2*Q);for(let O=0;O<3;O++)me[Pe*3+O]=f[V][O]+(f[nt][O]-f[V][O])*at}}),G.fill(0),M.forEach((c,x)=>G.set([c.x,c.y,c.age,c.spin],x*4)),e.viewport(0,0,n,r),e.useProgram(T.program),e.bindVertexArray(q),e.uniform2f(i.uResolution,n,r),e.uniform1f(i.uRatio,h),e.uniform4fv(i.uWave,le),e.uniform4fv(i.uShape,ce),e.uniform4fv(i.uParallax,ue),e.uniform1iv(i.uCount,fe),e.uniform4fv(i.uLine,de),e.uniform3fv(i.uLineColor,me),e.uniform2fv(i.uMouseWarp,he),e.uniform1f(i.uHaloReach,11*h*Math.log(160*o.glow+1)),e.uniform1f(i.uWidth,o.lineWidth*.5*h),e.uniform1f(i.uGlow,o.glow),e.uniform1f(i.uBrightness,o.brightness*u),e.uniform1f(i.uFocus,o.depthOfField),e.uniform1f(i.uEdgeFade,o.edgeFade),e.uniform4f(i.uMouse,l.x,l.y,l.influence,0),e.uniform1f(i.uBendRadius,o.bendRadius*.09),e.uniform1f(i.uBendStrength,o.bendStrength*2.5),e.uniform4fv(i.uClicks,G),e.uniform1f(i.uLight,o.lightMode?1:0),e.uniform1f(i.uOpaque,o.backgroundColor?1:0),e.uniform3fv(i.uBackground,se(o.backgroundColor,o.lightMode?[1,1,1]:[0,0,0])),e.uniform1f(i.uOpacity,o.opacity*u),e.uniform1f(i.uStyle,o.style),e.uniform1f(i.uSpacing,(o.style===2?22:9)*h),e.drawArrays(e.TRIANGLES,0,3)},pe=o=>{if(C=0,!z||document.hidden)return;const n=A.current,r=W?b((o-W)/1e3,5e-4,.05):1/60;W=o;const u=L?0:1;j+=r*n.animationSpeed*u,n.intro&&!L&&E<1?E=Math.min(1,E+r/rt):(!n.intro||L)&&(E=1);const h=1-Math.pow(1-n.mouseDamping,r*60),f=n.interactive&&s.inside&&!L;f&&(l.x+=(s.x-l.x)*h,l.y+=(s.y-l.y)*h),l.influence+=((f?1:0)-l.influence)*h;const _=n.parallax&&f?s.nx*n.parallaxStrength:0,J=n.parallax&&f?s.ny*n.parallaxStrength:0;l.px+=(_-l.px)*h,l.py+=(J-l.py)*h;for(let c=M.length-1;c>=0;c--)M[c].age+=r,M[c].age>4&&M.splice(c,1);Y(),C=requestAnimationFrame(pe)},P=()=>{!C&&z&&!document.hidden&&(C=requestAnimationFrame(pe))},K=()=>{const o=A.current,n=Math.max(1,m.clientWidth),r=Math.max(1,m.clientHeight),u=Math.min(o.dpr||window.devicePixelRatio||1,2);g.width=Math.max(1,Math.round(n*u)),g.height=Math.max(1,Math.round(r*u)),Y(),P()},ge=o=>{const n=m.getBoundingClientRect(),r=o.clientX-n.left,u=o.clientY-n.top,h=g.width/Math.max(1,n.width);s.inside=r>=0&&u>=0&&r<=n.width&&u<=n.height;const f=r*h;Math.abs(f-s.x)>.5&&(s.vx=f-s.x),s.x=f,s.y=(n.height-u)*h,s.nx=r/Math.max(1,n.width)-.5,s.ny=.5-u/Math.max(1,n.height)},xe=o=>{const n=s.inside;ge(o),s.inside&&!n&&l.influence<.05&&(l.x=s.x,l.y=s.y),P()},ve=o=>{if(ge(o),!s.inside||!A.current.clickSwirl||L)return;const n=(2*s.x-g.width)/g.height,r=-(2*s.y-g.height)/g.height;M.unshift({x:n,y:r,age:0,spin:s.vx<0?-1:1}),M.length>U&&M.pop(),P()},I=o=>{o.pointerType!=="mouse"&&(s.inside=!1)},we=()=>{s.inside=!1},ye=()=>{W=0,P()},Se=new ResizeObserver(K);Se.observe(m);const Ae=new IntersectionObserver(o=>{z=o.some(n=>n.isIntersecting),z&&(W=0,P())});Ae.observe(m),window.addEventListener("pointermove",xe,{passive:!0}),window.addEventListener("pointerdown",ve,{passive:!0}),window.addEventListener("pointerup",I,{passive:!0}),window.addEventListener("pointercancel",I,{passive:!0}),document.documentElement.addEventListener("pointerleave",we),document.addEventListener("visibilitychange",ye),K();let Me=A.current.dpr;return X.current=()=>{const o=A.current;if(o.dpr!==Me){Me=o.dpr,K();return}C||Y(),P()},()=>{cancelAnimationFrame(C),X.current=null,Se.disconnect(),Ae.disconnect(),window.removeEventListener("pointermove",xe),window.removeEventListener("pointerdown",ve),window.removeEventListener("pointerup",I),window.removeEventListener("pointercancel",I),document.documentElement.removeEventListener("pointerleave",we),document.removeEventListener("visibilitychange",ye),e.deleteProgram(T.program),e.deleteBuffer(re),e.deleteVertexArray(q),e.getExtension("WEBGL_lose_context")?.loseContext()}},[]),D.useEffect(()=>{X.current?.()}),Oe.jsx("div",{ref:ne,className:`floating-lines-container${oe?` ${oe}`:""}`,style:{...Ze,mixBlendMode:te||ee?"normal":Ke},...et,children:Oe.jsx("canvas",{ref:ae,className:"floating-lines-canvas","aria-hidden":"true"})})};export{pt as default};
