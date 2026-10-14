import{r as A,j as Ee}from"../text-animations-BFa__3NK.js";const ze=2,C=4,Ve={glitch:.7,degauss:1.6},He={blocks:0,dots:1,characters:2},$e={none:0,glitch:1,degauss:2},qe=[[".###.","#..##","#.#.#","##..#",".###."],["..#..",".##..","..#..","..#..",".###."],["####.","....#",".###.","#....","#####"],["####.","....#",".###.","....#","####."],["#..#.","#..#.","#####","...#.","...#."],["#####","#....","####.","....#","####."],[".###.","#....","####.","#...#",".###."],["#####","....#","...#.","..#..","..#.."],[".###.","#...#",".###.","#...#",".###."],[".###.","#...#",".####","....#",".###."],[".###.","#...#","#####","#...#","#...#"],["####.","#...#","####.","#...#","####."],[".####","#....","#....","#....",".####"],["####.","#...#","#...#","#...#","####."],["#####","#....","####.","#....","#####"],["#####","#....","####.","#....","#...."],[".....","..#..",".###.","..#..","....."],[".....",".....",".###.",".....","....."],[".#...","..#..","...#.","..#..",".#..."],["....#","...#.","..#..",".#...","#...."],[".....","#.#.#",".###.","#.#.#","....."],[".....","#####",".....","#####","....."],[".....",".....",".....",".....","#####"]],Q=qe.map(o=>o.reduce((c,u,a)=>{let s=c;for(let y=0;y<5;y++)u[y]==="#"&&(s+=2**(a*5+y));return s},0)),je=`#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,Ye=`
float time;

float noise(vec2 p) {
  return sin(p.x * 10.0) * sin(p.y * (3.0 + sin(time * 0.090909))) + 0.2;
}

mat2 rotate(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c);
}

float fbm(vec2 p) {
  p *= 1.1;
  float f = 0.0;
  float amp = 0.5 * uNoiseAmp;
  mat2 modify0 = rotate(time * 0.02);
  f += amp * noise(p);
  p = modify0 * p * 2.0;
  amp *= 0.454545;
  mat2 modify1 = rotate(time * 0.02);
  f += amp * noise(p);
  p = modify1 * p * 2.0;
  amp *= 0.454545;
  f += amp * noise(p);
  return f;
}

float pattern(vec2 p) {
  vec2 offset1 = vec2(1.0);
  vec2 offset0 = vec2(0.0);
  mat2 rot01 = rotate(0.1 * time);
  mat2 rot1 = rotate(0.1);
  vec2 q = vec2(fbm(p + offset1), fbm(rot01 * p + offset1));
  vec2 r = vec2(fbm(rot1 * q + offset0), fbm(q + offset0));
  return fbm(p + r);
}
`,We=`#version 300 es
precision highp float;
precision highp int;

uniform float iTime;
uniform vec2 uGridMul;
uniform float uNoiseAmp;
uniform float uScale;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform float uUseMouse;
uniform float uPageLoadProgress;
uniform float uUsePageLoadAnimation;
uniform ivec2 uOrigin;
uniform sampler2D uPrev0;
uniform sampler2D uPrev1;
uniform float uDecay;
uniform float uFresh;
uniform float uHover;

layout(location = 0) out vec4 outRings;
layout(location = 1) out vec4 outExtra;
${Ye}
void main() {
  time = iTime * 0.333333;
  ivec2 texel = ivec2(gl_FragCoord.xy);
  vec2 grid = uGridMul * 15.0;
  vec2 s = vec2(texel + uOrigin) / grid;
  float intensity = pattern(s * 0.1) * 1.3 - 0.03;
  float lift = 0.0;
  float strike = 0.0;

  if (uUseMouse > 0.5) {
    vec2 mouseWorld = uMouse * uScale;
    float distToMouse = distance(s, mouseWorld);
    float mouseInfluence = exp(-distToMouse * 8.0) * uMouseStrength * 10.0;
    intensity += mouseInfluence;
    float ripple = sin(distToMouse * 20.0 - iTime * 5.0) * 0.1 * mouseInfluence;
    intensity += ripple;
    lift = mouseInfluence;
  }

  if (uUsePageLoadAnimation > 0.5) {
    float cellRandom = fract(sin(dot(s, vec2(12.9898, 78.233))) * 43758.5453);
    float cellDelay = cellRandom * 0.8;
    float cellProgress = clamp((uPageLoadProgress - cellDelay) / 0.2, 0.0, 1.0);
    float fadeAlpha = smoothstep(0.0, 1.0, cellProgress);
    intensity *= fadeAlpha;
    strike = sin(3.14159265 * cellProgress) * step(0.1, intensity);
  }

  vec4 on0 = step(vec4(0.1), intensity - vec4(0.0, 1.0, 2.0, 4.0) * 0.0625);
  vec2 on1 = step(vec2(0.1), intensity - vec2(5.0, 8.0) * 0.0625);
  float level = clamp((intensity - 0.1) / 0.6, 0.0, 1.0);
  float heat = max(clamp(lift / 3.0, 0.0, 1.0) * uHover, strike);

  vec4 prev0 = texelFetch(uPrev0, texel, 0) * (1.0 - uFresh);
  vec4 prev1 = texelFetch(uPrev1, texel, 0) * (1.0 - uFresh);
  vec4 fade0 = max(prev0 * uDecay - 1.0 / 255.0, 0.0);
  vec4 fade1 = max(prev1 * uDecay - 1.0 / 255.0, 0.0);

  outRings = max(on0, fade0);
  outExtra = vec4(max(on1, fade1.xy), max(level, fade1.z), max(heat, fade1.w));
}`,Ke=`const uint FONT[${Q.length}] = uint[${Q.length}](${Q.map(o=>`${o}u`).join(", ")});`,Je=`#version 300 es
precision highp float;
precision highp int;

uniform float iTime;
uniform vec3 iResolution;
uniform float uScale;
uniform vec2 uGridMul;
uniform float uDigitSize;
uniform float uScanlineIntensity;
uniform float uGlitchAmount;
uniform float uFlickerAmount;
uniform float uChromaticAberration;
uniform float uDither;
uniform float uCurvature;
uniform vec3 uTint;
uniform float uBrightness;
uniform float uLightMode;
uniform sampler2D uRings0;
uniform sampler2D uRings1;
uniform ivec2 uOrigin;
uniform ivec2 uCellCount;
uniform int uGlyphs;
uniform float uGlow;
uniform float uScramble;
uniform float uMouseGlow;
uniform float uVignette;
uniform vec4 uClicks[${C}];
uniform int uClickMode;
uniform float uClickSeconds;
uniform float uClock;

out vec4 outColor;

${Ke}

float time;
float clickTear;
float clickSplit;
float pixelHeat;

float hash21(vec2 p) {
  p = fract(p * 234.56);
  p += dot(p, p + 34.56);
  return fract(p.x * p.y);
}

float hashCell(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

ivec2 cellTexel(vec2 cell) {
  return clamp(ivec2(cell) - uOrigin, ivec2(0), uCellCount - 1);
}

float ringValue(float n, vec4 r0, vec4 r1) {
  if (n < 0.5) return r0.x;
  if (n < 1.5) return r0.y;
  if (n < 2.5) return r0.z;
  if (n < 4.5) return r0.w;
  if (n < 5.5) return r1.x;
  return r1.y;
}

float digit(vec2 p) {
  vec2 grid = uGridMul * 15.0;
  vec2 cell = floor(p * grid);
  ivec2 texel = cellTexel(cell);
  vec4 r0 = texelFetch(uRings0, texel, 0);
  vec4 r1 = texelFetch(uRings1, texel, 0);
  float boost = 1.0 + r1.w * uMouseGlow * 1.3;
  pixelHeat = max(pixelHeat, r1.w);
  p = fract(p * grid);
  p *= uDigitSize;

  float px5 = p.x * 5.0;
  float py5 = (1.0 - p.y) * 5.0;
  float x = fract(px5);
  float y = fract(py5);
  float i = floor(py5) - 2.0;
  float j = floor(px5) - 2.0;
  float inside = step(0.0, p.x) * step(p.x, 1.0) * step(0.0, p.y) * step(p.y, 1.0);

  if (uGlyphs == 2) {
    float rate = 1.2 + r1.w * uScramble * 18.0;
    float phase = hashCell(cell * 1.37 + 4.1);
    float epoch = floor(iTime * rate + phase * 7.0);
    float pick = hashCell(cell + vec2(epoch * 0.731, epoch * 1.913));
    uint glyph = FONT[int(min(pick * float(FONT.length()), float(FONT.length()) - 1.0))];
    int bit = int(i + 2.0) * 5 + int(j + 2.0);
    float lit = float((glyph >> uint(clamp(bit, 0, 24))) & 1u);
    float glow = max(r0.x, r1.z);
    float shade = 0.35 + 0.65 * r1.z;
    return inside * lit * glow * shade * boost * (0.2 + y * 0.8) * (0.75 + x * 0.25);
  }

  float n = i * i + j * j;
  float on = ringValue(n, r0, r1);
  if (uGlyphs == 1) {
    vec2 d = vec2(x, y) - 0.5;
    float radius = 0.36 + 0.06 * on;
    float edge = fwidth(px5) * 0.75;
    float dot = 1.0 - smoothstep(radius - edge, radius + edge, length(d));
    return inside * on * dot * boost * (0.55 + 0.45 * (1.0 - length(d) / 0.5));
  }
  float brightness = on * (0.2 + y * 0.8) * (0.75 + x * 0.25);
  return inside * brightness * boost;
}

float onOff(float a, float b, float c) {
  return step(c, sin(iTime + a * cos(iTime * b))) * uFlickerAmount;
}

float displace(vec2 look) {
  float y = look.y - mod(iTime * 0.25, 1.0);
  float window = 1.0 / (1.0 + 50.0 * y * y);
  return sin(look.y * 20.0 + iTime) * 0.0125 * onOff(4.0, 2.0, 0.8) * (1.0 + cos(iTime * 60.0)) * window;
}

vec2 getLight(vec2 p) {
  float bar = step(mod(p.y + time * 20.0, 1.0), 0.2) * 0.4 + 1.0;
  bar *= uScanlineIntensity;

  float displacement = displace(p);
  p.x += displacement;

  if (uGlitchAmount != 1.0) {
    float extra = displacement * (uGlitchAmount - 1.0);
    p.x += extra;
  }

  p.x += clickTear;

  float middle = digit(p);

  const float off = 0.002;
  float sum = digit(p + vec2(-off, -off)) + digit(p + vec2(0.0, -off)) + digit(p + vec2(off, -off)) +
              digit(p + vec2(-off, 0.0)) + digit(p + vec2(0.0, 0.0)) + digit(p + vec2(off, 0.0)) +
              digit(p + vec2(-off, off)) + digit(p + vec2(0.0, off)) + digit(p + vec2(off, off));

  return vec2(0.9 * middle, sum * 0.1 * bar);
}

float glowAt(vec2 p) {
  vec2 grid = uGridMul * 15.0;
  vec2 cell = floor(p * grid);
  vec2 cellPx = iResolution.xy / (uScale * grid);
  float sigma = 0.5 * min(cellPx.x, cellPx.y);
  float center = 0.5 * min(1.0, 1.0 / max(uDigitSize, 0.001));
  float total = 0.0;
  for (int oy = -1; oy <= 1; oy++) {
    for (int ox = -1; ox <= 1; ox++) {
      vec2 c = cell + vec2(float(ox), float(oy));
      ivec2 texel = cellTexel(c);
      vec4 r0 = texelFetch(uRings0, texel, 0);
      vec4 r1 = texelFetch(uRings1, texel, 0);
      float emission = uGlyphs == 2
        ? max(r0.x, r1.z) * (0.35 + 0.65 * r1.z) * 0.45
        : (r0.x + 4.0 * (r0.y + r0.z + r0.w + r1.y) + 8.0 * r1.x) / 25.0;
      emission *= 1.0 + r1.w * uMouseGlow * 1.6;
      vec2 d = (p - (c + center) / grid) * iResolution.xy / uScale;
      total += emission * exp(-dot(d, d) / (2.0 * sigma * sigma));
    }
  }
  return total;
}

vec2 barrel(vec2 uv) {
  vec2 c = uv * 2.0 - 1.0;
  float r2 = dot(c, c);
  c *= 1.0 + uCurvature * r2;
  return c * 0.5 + 0.5;
}

void main() {
  time = iTime * 0.333333;
  vec2 uv = gl_FragCoord.xy / iResolution.xy;

  if (uCurvature != 0.0) {
    uv = barrel(uv);
  }

  clickTear = 0.0;
  clickSplit = 0.0;
  if (uClickMode > 0) {
    for (int k = 0; k < ${C}; k++) {
      vec4 click = uClicks[k];
      if (click.w <= 0.0) continue;
      float age = uClock - click.z;
      if (age < 0.0 || age > uClickSeconds) continue;
      float life = age / uClickSeconds;
      float envelope = (1.0 - life) * (1.0 - life);
      if (uClickMode == 1) {
        float tick = floor(age * 30.0);
        float bands = 14.0 + 26.0 * hashCell(vec2(click.z, tick * 0.37));
        float row = floor(uv.y * bands);
        float pickRow = hashCell(vec2(row + tick * 7.0, click.z * 17.0));
        float torn = step(0.42, pickRow);
        float reach = exp(-abs(uv.y - click.y) * 2.5);
        float shift = (hashCell(vec2(row * 1.7 + tick, click.z)) - 0.5) * 0.22;
        clickTear += shift * torn * envelope * reach;
        clickSplit = max(clickSplit, envelope * reach * (0.4 + 0.6 * torn));
      } else {
        vec2 aspect = vec2(iResolution.x / iResolution.y, 1.0);
        vec2 delta = (uv - click.xy) * aspect;
        float dist = length(delta);
        float front = age * 1.6;
        float band = exp(-pow((dist - front) / 0.18, 2.0));
        float wave = sin((dist - front) * 40.0) * band;
        uv += delta / aspect * wave * 0.05 * envelope;
        clickSplit = max(clickSplit, envelope * band);
      }
    }
  }

  vec2 p = uv * uScale;
  pixelHeat = 0.0;
  vec2 lightG = getLight(p);
  float heat = pixelHeat;
  vec2 lightR = lightG;
  vec2 lightB = lightG;

  float split = uChromaticAberration + clickSplit * 6.0;
  if (split != 0.0) {
    vec2 ca = vec2(split) / iResolution.xy;
    lightR = getLight(p + ca);
    lightB = getLight(p - ca);
  }

  if (uGlow > 0.0) {
    float bloom = uGlow * 0.2 * glowAt(p);
    lightR.y += bloom;
    lightG.y += bloom;
    lightB.y += bloom;
  }

  vec3 core = vec3(lightR.x, lightG.x, lightB.x);
  vec3 halo = vec3(lightR.y, lightG.y, lightB.y);
  vec3 raw = core + halo;

  vec3 luma = vec3(0.2126, 0.7152, 0.0722);
  float peak = max(uTint.r, max(uTint.g, uTint.b));
  float phosphor = clamp(uGlow, 0.0, 1.0);
  vec3 vividTint = clamp(mix(vec3(dot(uTint, luma)), uTint, 1.0 + 0.8 * phosphor), 0.0, 1.0);
  vec3 coreTint = mix(uTint, vec3(peak), phosphor * 0.45 * smoothstep(0.45, 0.9, core));
  vec3 col = core * coreTint + halo * vividTint;
  col += (vec3(1.0) - uTint) * min(raw, vec3(1.0)) * heat * uMouseGlow * 0.6;
  col *= uBrightness;

  if (uVignette > 0.0) {
    float edge = 0.04 + 0.22 * uVignette;
    vec2 fade = smoothstep(vec2(0.0), vec2(edge), uv) * smoothstep(vec2(0.0), vec2(edge), 1.0 - uv);
    float mask = fade.x * fade.y;
    mask = mask * mask * (3.0 - 2.0 * mask);
    float keep = mix(1.0, mask, clamp(uVignette * 1.5, 0.0, 1.0));
    col *= keep;
    core *= keep;
    halo *= keep;
  }

  if (uLightMode > 0.5) {
    vec3 luma = vec3(0.2126, 0.7152, 0.0722);
    float lum = dot(uTint, luma);
    float peak = max(uTint.r, max(uTint.g, uTint.b));
    vec3 hue = uTint / max(peak, 0.0001);
    vec3 vivid = clamp(mix(vec3(dot(hue, luma)), hue, 1.6), 0.0, 1.0);
    vivid = clamp(vivid * (0.3 / max(dot(vivid, luma), 0.0001)), 0.0, 1.0);
    vec3 ink = mix(uTint, vivid, smoothstep(0.3, 0.6, lum));
    vec3 cover = (core * 1.15 + halo * 0.4) * uBrightness * (1.0 + heat * uMouseGlow * 0.4);
    if (uDither > 0.0) cover += (hash21(gl_FragCoord.xy) - 0.5) * (uDither * 0.003922);
    cover = clamp(cover, 0.0, 0.94);
    float alpha = max(cover.r, max(cover.g, cover.b));
    outColor = vec4(alpha - cover * (1.0 - ink), alpha);
    return;
  }

  if (uDither > 0.0) {
    float rnd = hash21(gl_FragCoord.xy);
    col += (rnd - 0.5) * (uDither * 0.003922);
  }

  col = clamp(col, 0.0, 1.0);
  outColor = vec4(col, max(col.r, max(col.g, col.b)));
}`,S=(o,c,u)=>Math.min(u,Math.max(c,o)),Re=(o,c,u)=>{const a=o.createShader(c);return a?(o.shaderSource(a,u),o.compileShader(a),o.getShaderParameter(a,o.COMPILE_STATUS)?a:(o.deleteShader(a),null)):null},ke=(o,c)=>{const u=Re(o,o.VERTEX_SHADER,je),a=Re(o,o.FRAGMENT_SHADER,c),s=o.createProgram();if(!u||!a||!s)return null;if(o.attachShader(s,u),o.attachShader(s,a),o.linkProgram(s),o.deleteShader(u),o.deleteShader(a),!o.getProgramParameter(s,o.LINK_STATUS))return o.deleteProgram(s),null;const y={},$=o.getProgramParameter(s,o.ACTIVE_UNIFORMS);for(let F=0;F<$;F++){const U=o.getActiveUniform(s,F);if(!U)continue;const N=U.name.replace(/\[0\]$/,"");y[N]=o.getUniformLocation(s,N)}return{program:s,uniforms:y}},Qe=o=>{let c=String(o||"#ffffff").replace("#","").trim();(c.length===3||c.length===4)&&(c=c.slice(0,3).split("").map(a=>a+a).join(""));const u=parseInt(c.slice(0,6),16);return Number.isNaN(u)?[1,1,1]:[(u>>16&255)/255,(u>>8&255)/255,(u&255)/255]};function tt({scale:o=1,gridMul:c=[2,1],digitSize:u=1.5,timeScale:a=.3,pause:s=!1,scanlineIntensity:y=.3,glitchAmount:$=1,flickerAmount:F=1,noiseAmp:U=1,chromaticAberration:N=0,dither:q=0,curvature:Me=.2,tint:be="#ffffff",mouseReact:we=!0,mouseStrength:Ae=.2,pageLoadAnimation:Se=!0,brightness:Ce=1,glyphs:Fe="blocks",glow:_e=.5,persistence:Ge=.5,scramble:De=.5,mouseGlow:Pe=.6,vignette:Le=.25,clickEffect:Z="glitch",variation:Ue,lightMode:Ne=!1,dpr:Oe,className:ee="",style:Ie,...Xe}){const te=A.useRef(null),oe=A.useRef(null),j=A.useRef(null),ie={scale:Math.max(.05,o),gridX:Math.max(.1,(c?.[0]??2)*15),gridY:Math.max(.1,(c?.[1]??1)*15),digitSize:u,timeScale:a,pause:s,scanlineIntensity:y,glitchAmount:$,flickerAmount:F,noiseAmp:U,chromaticAberration:N,dither:typeof q=="boolean"?q?1:0:q,curvature:Me,tint:be,mouseReact:we,mouseStrength:Ae,pageLoadAnimation:Se,brightness:Ce,glyphs:He[Fe]??0,glow:S(_e,0,3),persistence:S(Ge,0,1),scramble:S(De,0,1),mouseGlow:S(Pe,0,1),vignette:S(Le,0,1),clickEffect:$e[Z]??0,clickSeconds:Ve[Z]??1,variation:Ue,lightMode:Ne,dpr:Oe},R=A.useRef(ie);return R.current=ie,A.useEffect(()=>{const b=te.current,g=oe.current,e=g?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!b||!g||!e)return;const O=ke(e,We),I=ke(e,Je);if(!O||!I)return;const m=O.uniforms,r=I.uniforms,Y=e.createVertexArray(),re=()=>{const t=e.createTexture();return e.bindTexture(e.TEXTURE_2D,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,1,1,0,e.RGBA,e.UNSIGNED_BYTE,null),t},_=[0,1].map(()=>{const t=re(),i=re(),n=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,n),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT1,e.TEXTURE_2D,i,0),{rings:t,extra:i,framebuffer:n}});e.bindFramebuffer(e.FRAMEBUFFER,null);const w=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,d={width:1,height:1,ratio:1,columns:1},f={x:0,y:0,w:1,h:1,key:""},h={x:.5,y:.5,inside:!1},k={x:.5,y:.5},E=new Float32Array(C*4);let W=0,X=0,B=0,G=0,K=!0;const ne=R.current.variation;let J=(typeof ne=="number"?ne*10:Math.random()*100)*R.current.timeScale,D=R.current.pageLoadAnimation&&!w?0:1,P=0,z=0,V=!0,H=0;const ae=t=>{const i=1+Math.max(0,t.curvature)*2,n=.5-.5*i,l=.5+.5*i,p=.06*Math.max(1,Math.abs(t.glitchAmount))*Math.max(1,Math.abs(t.flickerAmount))+.2,x=t.gridX*d.columns,L=Math.floor((n*t.scale-p)*x)-2,T=Math.floor((l*t.scale+p)*x)+2,v=Math.floor((n*t.scale-p)*t.gridY)-2,xe=Math.floor((l*t.scale+p)*t.gridY)+2,Te=`${L}:${T}:${v}:${xe}`;if(Te!==f.key){f.key=Te,f.x=L,f.y=v,f.w=Math.max(1,Math.min(4096,T-L+1)),f.h=Math.max(1,Math.min(4096,xe-v+1));for(const ye of _)for(const Be of[ye.rings,ye.extra])e.bindTexture(e.TEXTURE_2D,Be),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,f.w,f.h,0,e.RGBA,e.UNSIGNED_BYTE,null);K=!0}},le=(t,i)=>{const n=_[G],l=_[1-G];e.bindFramebuffer(e.FRAMEBUFFER,l.framebuffer),e.drawBuffers([e.COLOR_ATTACHMENT0,e.COLOR_ATTACHMENT1]),e.viewport(0,0,f.w,f.h),e.disable(e.BLEND),e.useProgram(O.program),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,n.rings),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,n.extra),e.uniform1i(m.uPrev0,0),e.uniform1i(m.uPrev1,1),e.uniform1f(m.iTime,J),e.uniform2f(m.uGridMul,t.gridX*d.columns/15,t.gridY/15),e.uniform1f(m.uNoiseAmp,t.noiseAmp),e.uniform1f(m.uScale,t.scale),e.uniform2f(m.uMouse,k.x,k.y),e.uniform1f(m.uMouseStrength,t.mouseStrength),e.uniform1f(m.uUseMouse,t.mouseReact?1:0),e.uniform1f(m.uPageLoadProgress,D),e.uniform1f(m.uUsePageLoadAnimation,t.pageLoadAnimation?1:0),e.uniform2i(m.uOrigin,f.x,f.y),e.uniform1f(m.uDecay,i),e.uniform1f(m.uFresh,K?1:0),e.uniform1f(m.uHover,B),e.bindVertexArray(Y),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.FRAMEBUFFER,null),G=1-G,K=!1},ce=()=>{const t=R.current,i=_[G];e.viewport(0,0,g.width,g.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(I.program),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,i.rings),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,i.extra),e.uniform1i(r.uRings0,0),e.uniform1i(r.uRings1,1),e.uniform1f(r.iTime,J),e.uniform3f(r.iResolution,g.width,g.height,g.width/g.height),e.uniform1f(r.uScale,t.scale),e.uniform2f(r.uGridMul,t.gridX*d.columns/15,t.gridY/15),e.uniform1f(r.uDigitSize,t.digitSize),e.uniform1f(r.uScanlineIntensity,t.scanlineIntensity),e.uniform1f(r.uGlitchAmount,w?0:t.glitchAmount),e.uniform1f(r.uFlickerAmount,w?0:t.flickerAmount),e.uniform1f(r.uChromaticAberration,t.chromaticAberration),e.uniform1f(r.uDither,t.dither),e.uniform1f(r.uCurvature,t.curvature),e.uniform3fv(r.uTint,Qe(t.tint)),e.uniform1f(r.uBrightness,t.brightness),e.uniform1f(r.uLightMode,t.lightMode?1:0),e.uniform2i(r.uOrigin,f.x,f.y),e.uniform2i(r.uCellCount,f.w,f.h),e.uniform1i(r.uGlyphs,t.glyphs),e.uniform1f(r.uGlow,t.glow),e.uniform1f(r.uScramble,t.scramble),e.uniform1f(r.uMouseGlow,t.mouseGlow),e.uniform1f(r.uVignette,t.vignette),e.uniform4fv(r.uClicks,E),e.uniform1i(r.uClickMode,t.clickEffect),e.uniform1f(r.uClickSeconds,t.clickSeconds),e.uniform1f(r.uClock,X),e.bindVertexArray(Y),e.drawArrays(e.TRIANGLES,0,3),e.bindVertexArray(null)},ue=()=>{const t=R.current;d.width=Math.max(1,b.clientWidth),d.height=Math.max(1,b.clientHeight),d.ratio=Math.min(t.dpr||window.devicePixelRatio||1,2),d.columns=Math.min(1,d.width/d.height/1.5),g.width=Math.max(1,Math.round(d.width*d.ratio)),g.height=Math.max(1,Math.round(d.height*d.ratio)),ae(t),le(t,0),ce(),M()},fe=t=>{if(P=0,!V||document.hidden)return;const i=R.current,n=z?S((t-z)/1e3,.001,1/20):1/60;z=t,X+=n,!i.pause&&!w&&(J+=n*i.timeScale);const l=h.inside?h.x:.5,p=h.inside?h.y:.5,x=1-Math.exp(-n/(h.inside?.19988:.6));k.x+=(l-k.x)*x,k.y+=(p-k.y)*x,B+=((h.inside?1:0)-B)*(1-Math.exp(-n/.35));for(let v=0;v<C;v++)E[v*4+3]>0&&X-E[v*4+2]>i.clickSeconds&&(E[v*4+3]=0);ae(i);const L=i.persistence>0?Math.exp(-n/(.08+i.persistence*1.4)):0;le(i,L),ce(),D<1&&(D=Math.min(1,D+n/ze));let T=!(i.pause||w)||D<1;T=T||Math.abs(l-k.x)+Math.abs(p-k.y)>1e-4,T=T||Math.abs((h.inside?1:0)-B)>.001;for(let v=0;v<C;v++)T=T||E[v*4+3]>0;H=T?0:H+n,H<2.5&&(P=requestAnimationFrame(fe))};function M(){H=0,!P&&V&&!document.hidden&&(z=0,P=requestAnimationFrame(fe))}const se=t=>{const i=b.getBoundingClientRect(),n=(t.clientX-i.left)/Math.max(i.width,1),l=1-(t.clientY-i.top)/Math.max(i.height,1);return{x:n,y:l,inside:n>=0&&n<=1&&l>=0&&l<=1}},me=t=>{const{x:i,y:n,inside:l}=se(t),p=h.inside;h.inside=l,l&&(h.x=i,h.y=n),(l||p)&&M()},de=t=>{const i=R.current,{x:n,y:l,inside:p}=se(t);if(!p||w||!i.clickEffect)return;const x=W*4;E[x]=n,E[x+1]=l,E[x+2]=X,E[x+3]=1,W=(W+1)%C,M()},ve=()=>{h.inside=!1,M()},he=()=>M(),pe=new ResizeObserver(ue);pe.observe(b);const ge=new IntersectionObserver(t=>{V=t.some(i=>i.isIntersecting),V&&M()});return ge.observe(b),window.addEventListener("pointermove",me,{passive:!0}),window.addEventListener("pointerdown",de,{passive:!0}),document.documentElement.addEventListener("pointerleave",ve),document.addEventListener("visibilitychange",he),ue(),j.current=M,()=>{cancelAnimationFrame(P),j.current=null,pe.disconnect(),ge.disconnect(),window.removeEventListener("pointermove",me),window.removeEventListener("pointerdown",de),document.documentElement.removeEventListener("pointerleave",ve),document.removeEventListener("visibilitychange",he);for(const t of _)e.deleteTexture(t.rings),e.deleteTexture(t.extra),e.deleteFramebuffer(t.framebuffer);e.deleteVertexArray(Y),e.deleteProgram(O.program),e.deleteProgram(I.program),e.getExtension("WEBGL_lose_context")?.loseContext()}},[]),A.useEffect(()=>{j.current?.()}),Ee.jsx("div",{ref:te,className:`faulty-terminal-container${ee?` ${ee}`:""}`,style:Ie,...Xe,children:Ee.jsx("canvas",{ref:oe,className:"faulty-terminal-canvas","aria-hidden":"true"})})}export{tt as default};
