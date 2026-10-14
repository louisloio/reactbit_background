import{r as S,j as ve}from"../text-animations-Cpfg-DyU.js";const Qe=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,et=`#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 uResolution;
uniform float uDpr;
uniform float uScale;
uniform float uTime;
uniform float uBeamX;
uniform vec4 uSurface;
uniform float uRadius;
uniform vec3 uIntro;
uniform vec4 uPour;
uniform vec2 uRun;
uniform vec4 uLens;
uniform sampler2D uReveal;
uniform vec4 uRevealMap;
uniform vec2 uRevealInfo;
uniform float uAtmosphere;
uniform vec4 uAmount;
uniform vec4 uShape;
uniform vec4 uExtra;
uniform float uTheme;
uniform vec3 uTint[16];

#define BEAM uTint[0]
#define LEFT uTint[1]
#define RIGHT uTint[2]
#define CYAN uTint[3]
#define PINK uTint[4]
#define LILAC uTint[5]
#define SKY uTint[6]
#define PURPLE uTint[7]
#define DEEP uTint[8]
#define MIST uTint[9]
#define NAVY uTint[10]
#define WARM uTint[11]
#define EMBER uTint[12]
#define WHITE uTint[13]
#define HAZE uTint[14]
#define LAVENDER uTint[15]

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

float sq(float x) {
  return x * x;
}

float roundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

vec3 spill(float e, float fall, float strength, float front, float t, out vec3 glow) {
  glow = vec3(0.0);
  if (strength < 0.0005) return vec3(0.0);
  float f = max(fall, 0.0);
  float d = max(e, 0.0);
  float u = d / (6.0 + 0.28 * f);
  float start = smoothstep(-6.0, 12.0, fall);
  float fade = exp(-sq(max(f - 125.0, 0.0) / 40.0));
  float streak = 0.88 + 0.24 * noise(vec2(u * 6.0, f / 22.0 - t * 1.7));
  float bright = pow(strength, 1.5);
  float soft = sqrt(strength);
  float warmth = smoothstep(90.0, 130.0, f);
  vec3 coreK = mix(WHITE, WARM, warmth * exp(-d / 9.0));
  float core = mix(9.0, 2.6, warmth) * exp(-sq(d / (3.5 + 0.04 * f))) * exp(-sq(max(f - 130.0, 0.0) / 38.0));
  float wall = 24.0 * exp(-sq(d / 1.1)) * exp(-sq(max(f - 100.0, 0.0) / 30.0));
  float bandCenter = 0.7 - 0.3 * smoothstep(30.0, 110.0, f);
  float offset = u - bandCenter;
  float decay = (1.05 - bandCenter) / 1.31;
  float profile = offset < 0.0 ? exp(-sq(offset / 0.3)) : exp(-offset / decay);
  profile *= 1.0 - smoothstep(1.0, 1.4, u);
  vec3 bandA = mix(CYAN, PINK, smoothstep(50.0, 75.0, f));
  bandA = mix(bandA, LILAC, smoothstep(100.0, 125.0, f));
  vec3 bandB = mix(SKY, PURPLE, smoothstep(50.0, 75.0, f));
  vec3 fanK = mix(bandA, bandB, smoothstep(0.06, 0.18, offset));
  fanK = mix(fanK, DEEP, smoothstep(0.22, 0.42, offset));
  vec3 thread = WHITE * wall * bright + coreK * core * streak * bright;
  glow += fanK * 4.5 * profile * fade * streak * bright;
  glow += MIST * 0.7 * exp(-max(u - 1.0, 0.0) / 0.9) * smoothstep(0.7, 1.2, u) * fade * soft;
  glow += EMBER * 0.35 * exp(-sq((f - 165.0) / 22.0)) * exp(-d / 25.0) * bright;
  float lag = u * (6.0 + 0.28 * f) * 0.35;
  float reveal = 1.0 - smoothstep(front - 70.0, front + 8.0, f + lag);
  glow *= start * reveal;
  return thread * start * reveal;
}

vec3 easeLight(vec3 light, float amount) {
  return -log(max(1.0 - amount * (1.0 - exp(-light)), vec3(0.0001)));
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y * uDpr - gl_FragCoord.y) / uDpr;
  vec2 p = frag / uScale;
  float t = uTime;
  float bx = uBeamX / uScale;
  float sl = uSurface.x / uScale;
  float sy = uSurface.y / uScale;
  float sr = uSurface.z / uScale;
  float sb = uSurface.w / uScale;
  float radius = uRadius / uScale;
  float dx = p.x - bx;
  float adx = abs(dx);
  float h = sy - p.y;
  float hp = max(h, 0.0);
  float above = smoothstep(-0.5, 0.5, h);
  float side = smoothstep(-24.0, 24.0, dx);
  vec3 sideK = mix(mix(LAVENDER, LEFT, smoothstep(40.0, 140.0, adx)), RIGHT, side);
  float beamWidth = uShape.x;
  float flare = uShape.y;
  float spread = 250.0 * uShape.z;
  float reachL = max(bx - sl, 1.0);
  float reachR = max(sr - bx, 1.0);
  float reach = dx < 0.0 ? reachL : reachR;
  float layerLen = clamp(0.29 * reach, 20.0, 100.0) * sqrt(uShape.z);
  float run = uRun.x;
  float runMask = 1.0 - smoothstep(run - 34.0, run + 6.0, adx);
  float bead = exp(-sq((adx - run + 16.0) / (18.0 + 0.04 * run))) * uRun.y;
  float flowMask = (1.0 - smoothstep(0.75 * spread, 1.1 * spread, adx)) * runMask;
  float edgeMask = (1.0 - smoothstep(0.8 * spread, 1.25 * spread, adx)) * runMask;
  float bloom = uIntro.y;
  vec2 center = vec2((sl + sr) * 0.5, (sy + sb) * 0.5);
  vec2 halfSize = vec2((sr - sl) * 0.5, (sb - sy) * 0.5);
  float sd = roundBox(p - center, halfSize, radius);
  float outline = max(sd, 0.0);
  float below = max(p.y - sy - radius, 0.0);
  float hug = smoothstep(-0.5, 0.5, sd) * exp(-sq(below / 14.0));
  float hugWide = smoothstep(-0.5, 0.5, sd) * exp(-sq(below / 40.0));

  vec3 col = vec3(0.0);

  float breathe = 1.0 + uExtra.x * (0.12 * sin(t * 1.5708) + 0.08 * (noise(vec2(t * 0.5, 3.0)) - 0.5));

  float front = uIntro.x / uScale;
  float drop = smoothstep(front + 10.0, front - 110.0, p.y);
  float falling = 1.0 - smoothstep(sy - 24.0, sy, front);
  float top = mix(0.3, 1.0, smoothstep(0.0, 0.3 * sy, p.y));
  float beamCore = 24.0 * exp(-adx / (2.0 * beamWidth));
  float beamHalo = 1.3 * exp(-adx / (6.0 * beamWidth)) + 0.3 * exp(-adx / (22.0 * beamWidth));
  vec3 haloK = mix(BEAM, sideK, exp(-hp / 80.0));
  col += (BEAM * beamCore + haloK * beamHalo) * top * above * drop;
  float head = exp(-sq((p.y - front) / 24.0)) * falling;
  col += mix(WHITE, BEAM, 0.35) * head * (7.0 * exp(-adx / (2.6 * beamWidth)) + 1.0 * exp(-adx / (14.0 * beamWidth)));

  float psi = adx * (outline + 1.0);
  float rise = max(hp - 17.9 * flare, 0.0);
  float skirtAmp = 16.6 * (exp(-sq(rise / (11.8 * flare))) + 0.3 * exp(-rise / (60.0 * flare)));
  float skirtSpread = mix(134.0, 155.0, side) * breathe * flare * flare * mix(0.35, 1.0, min(bloom, 1.0)) * max(bloom, 1.0);
  float skirt = skirtAmp * exp(-psi / skirtSpread) * exp(-sq(adx / (max(layerLen, 60.0 * sqrt(uShape.z)) * 1.48))) * hug;
  col += sideK * skirt * flowMask * min(bloom, 1.0);

  float layer = 12.0 * exp(-adx / layerLen) * exp(-outline / (0.19 * layerLen)) * (1.0 + 0.4 * bead);
  col += sideK * layer * hug * flowMask * min(bloom, 1.0);
  float washMask = smoothstep(sl - 60.0, sl + 6.0, p.x) * (1.0 - smoothstep(sr - 6.0, sr + 45.0, p.x));
  float wash = 1.4 * exp(-adx / 100.0) * exp(-outline / 30.0);
  col += mix(BEAM, sideK, 0.25) * wash * hugWide * washMask * flowMask * min(bloom, 1.0);
  float highWash = 0.7 * exp(-adx / 140.0) * exp(-outline / 60.0);
  col += mix(BEAM, NAVY, 0.5) * highWash * hugWide * washMask * runMask * min(bloom, 1.0);

  float sideSign = dx < 0.0 ? 0.0 : 1.0;
  float along = 0.5 * log((hp + 1.0) / (adx + 1.0));
  float lineScale = 6.0;
  float lp = log(max(psi, 1.0) / (120.0 * flare * flare)) * lineScale;
  float lineIndex = floor(lp) + sideSign * 97.0;
  float wobble = 0.22 * (noise(vec2(lineIndex * 3.7, t * 0.4 + along)) - 0.5);
  float lf = fract(lp + wobble) - 0.5;
  float gradient = lineScale * length(vec2(hp + 1.0, adx)) / max(psi, 1.0) / uScale;
  float halfWidth = max(0.35 * gradient, 0.0001);
  float drawWidth = max(halfWidth, 0.6 * gradient);
  float lineShape = exp(-lf * lf / (drawWidth * drawWidth)) * (halfWidth / drawWidth);
  float lineOn = step(0.3, hash(vec2(lineIndex, 1.3)));
  float lineFlow = smoothstep(0.25, 0.85, noise(vec2(lineIndex * 5.3 + 2.0, along * 3.0 + t * 1.1)));
  float flareArea = 120.0 * flare * flare;
  float lineEnvelope = smoothstep(0.85 * flareArea, 1.4 * flareArea, psi) * (1.0 - smoothstep(3.2 * flareArea, 7.5 * flareArea, psi));
  lineEnvelope *= exp(-adx / (layerLen * 1.5)) * hug * flowMask * (1.0 - smoothstep(35.0 * flare, 80.0 * flare, hp));
  float lineBright = mix(0.35, 1.0, hash(vec2(lineIndex, 4.0)));
  col += mix(sideK, WHITE, 0.6) * lineShape * lineOn * lineFlow * lineEnvelope * lineBright * 2.6 * uAmount.w * min(bloom, 1.0);

  float edgeGlow = 22.8 * exp(-sq(adx / (150.0 * uShape.z))) * edgeMask * (1.0 + 0.9 * bead);
  float onTop = 1.0 - smoothstep(sy + radius, sy + radius + 10.0, p.y);
  float edgeLine = (exp(-sq(max(sd, 0.0) / 0.9)) + 0.12 * exp(-max(sd, 0.0) / 3.0)) * edgeGlow * onTop;
  col += mix(sideK, WHITE, 0.6) * edgeLine * min(bloom, 1.0);

  float pour = uShape.w;
  float baseline = exp(-sq(130.0 / 150.0));
  float strengthR = exp(-sq(reachR / (150.0 * uShape.z))) * (1.0 - smoothstep(0.8 * spread, 1.25 * spread, reachR)) / baseline * pour;
  float strengthL = exp(-sq(reachL / (150.0 * uShape.z))) * (1.0 - smoothstep(0.8 * spread, 1.25 * spread, reachL)) / baseline * pour;
  float fallY = p.y - sy - 0.3 * radius;
  float rightHalf = smoothstep(center.x - 4.0, center.x + 4.0, p.x);
  float haloR = exp(-length(p - vec2(sr - 0.3 * radius, sy + 0.3 * radius)) / 40.0) * sqrt(strengthR);
  float haloL = exp(-length(p - vec2(sl + 0.3 * radius, sy + 0.3 * radius)) / 40.0) * sqrt(strengthL);
  vec3 glowR;
  vec3 glowL;
  col += spill(sd, fallY, strengthR, uPour.y, t, glowR) * rightHalf;
  col += spill(sd, fallY, strengthL, uPour.x, t, glowL) * (1.0 - rightHalf);
  col += easeLight(glowR * rightHalf + NAVY * 0.9 * haloR, uPour.w);
  col += easeLight(glowL * (1.0 - rightHalf) + NAVY * 0.9 * haloL, uPour.z);

  vec2 toLens = frag - uLens.xy;
  float lens = exp(-dot(toLens, toLens) / sq(uLens.z)) * uLens.w;
  col *= 1.0 + 0.35 * lens * hug;
  float fogAmount = uAmount.y * uAtmosphere;
  float near = exp(-adx / 150.0);
  float envelope = near * (0.3 + 0.4 * exp(-hp / 50.0) + 1.2 * exp(-p.y / 120.0));
  if (fogAmount > 0.001 && h > -2.0 && envelope * max(0.25, 6.0 * exp(-adx / 50.0)) > 0.002) {
    vec2 fq = vec2(dx / 1.7, h) / 85.0 + vec2(t * 0.012, -t * 0.03) + uExtra.zw;
    vec2 fw = vec2(fbm(fq * 1.3 + vec2(1.7, 9.2) + t * 0.03), fbm(fq * 1.3 + vec2(8.3, 2.8) - t * 0.025));
    float cloud = fbm(fq + 1.4 * fw);
    float density = smoothstep(0.5, 0.78, cloud);
    float lit = exp(-adx / 50.0);
    float fogMask = smoothstep(-2.0, 20.0, h);
    float reached = smoothstep(front + 80.0, front - 40.0, p.y);
    vec3 fog = (HAZE * 0.45 + BEAM * 6.0 * lit * reached) * density * envelope * fogMask;
    float surfaceLit = exp(-adx / (layerLen * 1.3)) * exp(-outline / 28.0) * hugWide * flowMask * washMask * min(bloom, 1.0);
    fog += sideK * 2.2 * surfaceLit * (smoothstep(0.38, 0.72, cloud) - 0.35) * fogMask;
    float smoke = smoothstep(0.3, 0.75, cloud);
    fog += BEAM * 0.35 * exp(-adx / (22.0 * beamWidth)) * (0.35 + 0.9 * smoke) * fogMask * top * drop;
    col += fog * fogAmount * (1.0 + 1.2 * lens) * mix(1.0, 0.45, uTheme);
  }

  if (uRevealInfo.y > 0.001 && uLens.w > 0.002) {
    vec2 toReveal = frag - uLens.xy;
    float reveal = exp(-dot(toReveal, toReveal) / sq(uRevealInfo.x)) * uLens.w;
    vec2 uv = frag * uRevealMap.xy + uRevealMap.zw;
    float onImage = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
    vec4 ui = texture(uReveal, uv);
    float ink = max(ui.r, max(ui.g, ui.b)) * onImage;
    float lit = clamp(col.b * 0.9, 0.0, 1.0) * (1.0 - smoothstep(0.9, 2.2, col.b));
    float clearance = smoothstep(60.0 * sqrt(beamWidth), 150.0 * sqrt(beamWidth), adx);
    col += mix(BEAM, WHITE, 0.4) * ink * reveal * lit * clearance * uRevealInfo.y * 2.2;
  }

  float haze = col.b;
  float dotGrid = 1.0 - smoothstep(0.16, 0.32, length(fract(frag / 3.0) - 0.5));
  col += BEAM * dotGrid * clamp(haze, 0.0, 1.5) * (1.0 - smoothstep(1.5, 4.0, haze)) * (0.18 + 0.3 * lens) * uExtra.y;
  if (lens > 0.002) {
    vec2 drift = frag - vec2(0.0, t * 14.0);
    vec2 sparkCell = floor(drift / 7.0);
    vec2 sparkPos = (sparkCell + 0.2 + 0.6 * vec2(hash(sparkCell + 5.1), hash(sparkCell + 2.3))) * 7.0;
    float sparkDist = length(drift - sparkPos);
    float sparkOn = step(0.8, hash(sparkCell + 8.8));
    float sparkTwinkle = 0.5 + 0.5 * sin(t * 5.0 + hash(sparkCell + 3.7) * 6.283);
    col += WHITE * exp(-sparkDist * sparkDist / 0.35) * sparkOn * sparkTwinkle * lens * clamp(haze * 1.5, 0.0, 1.0) * 1.6 * uAmount.z;
  }

  float dustAmount = uAmount.z;
  if (dustAmount > 0.001) {
    float dustLp = log(max(psi, 1.0) / (120.0 * flare * flare)) * 2.2;
    vec2 flowCell = vec2(dustLp / 1.1, (along + t * 0.22) / 0.06);
    vec2 cellId = floor(flowCell) + vec2(sideSign * 131.0, 0.0);
    vec2 cellJitter = vec2(hash(cellId + 1.7), hash(cellId + 8.3));
    vec2 particleFlow = (floor(flowCell) + 0.1 + cellJitter * 0.8) * vec2(1.1, 0.06);
    float particlePsi = 120.0 * flare * flare * exp(particleFlow.x / 2.2);
    float particleAlong = particleFlow.y - t * 0.22;
    float particleX = sqrt(particlePsi * exp(-2.0 * particleAlong)) - 1.0;
    float particleH = sqrt(particlePsi * exp(2.0 * particleAlong)) - 1.0;
    float particleDist = length(vec2(adx - particleX, hp - particleH)) * uScale;
    float particleOn = step(0.62, hash(cellId + 3.1));
    float particleTwinkle = 0.5 + 0.5 * sin(t * 5.0 + hash(cellId + 9.2) * 6.283);
    float dustZone = exp(-sq(log(max(psi, 1.0) / (200.0 * flare * flare)) / 0.55)) * hug * flowMask * smoothstep(0.0, 6.0, outline);
    col += WHITE * exp(-particleDist * particleDist / 0.3) * particleOn * particleTwinkle * dustZone * 3.0 * dustAmount * min(bloom, 1.0);

    vec2 glitterCell = vec2(dx / 3.0, (p.y - t * 26.0) / 9.0);
    vec2 glitterId = floor(glitterCell);
    vec2 glitterJitter = vec2(hash(glitterId + 4.4), hash(glitterId + 2.9));
    vec2 glitterPos = (glitterId + 0.15 + glitterJitter * 0.7) * vec2(3.0, 9.0);
    float glitterDist = length(vec2(dx, p.y - t * 26.0) - glitterPos) * uScale;
    float glitterOn = step(0.7, hash(glitterId + 6.6));
    float glitterTwinkle = 0.5 + 0.5 * sin(t * 6.0 + hash(glitterId + 1.1) * 6.283);
    float glitterZone = exp(-adx / (5.0 * beamWidth)) * smoothstep(1.5, 4.0, adx / beamWidth) * above * smoothstep(25.0, 70.0, hp) * top * drop;
    col += WHITE * exp(-glitterDist * glitterDist / 0.25) * glitterOn * glitterTwinkle * glitterZone * 2.2 * dustAmount * uAtmosphere;
  }

  col *= uAmount.x * (1.0 + uIntro.z * 0.9 * exp(-length(vec2(dx, h * 1.6)) / 70.0));
  col *= smoothstep(-0.75, 0.25, sd * uScale);

  vec3 emit = 1.0 - exp(-col * mix(1.0, 0.6, uTheme));
  float peak = max(emit.r, max(emit.g, emit.b));
  if (uTheme > 0.5) {
    float low = min(emit.r, min(emit.g, emit.b));
    float chroma = peak - low;
    vec3 hue = (emit - low) / max(chroma, 0.0001);
    float alpha = clamp(pow(chroma, 1.35) * 1.3, 0.0, 1.0) * 0.9;
    outColor = vec4((hue * 0.82 + 0.06) * alpha, alpha);
  } else {
    outColor = vec4(emit, peak);
  }
}`,ge=[[0,1],[-11.5,.77],[9.5,.95],[-53.5,.79],[39.5,.77],[16,.81],[-16.3,.92],[13.3,.96],[3,1.01],[1,.68],[1,1.15],[142.5,.51],[113.6,.28],[-7.5,.13],[-2.7,.32],[7.5,.81]],be=.78,Re=2048,Q=1.25,K=5,g=(a,m,u)=>Math.min(u,Math.max(m,a)),tt=a=>1-Math.pow(1-g(a,0,1),3),at=a=>{const r=8*Math.sqrt(.6155999999999999);return 1-Math.exp(-.62*8*a)*(Math.cos(r*a)+.62*8/r*Math.sin(r*a))},ot=([a,m,u])=>{const r=Math.max(a,m,u),d=Math.min(a,m,u),h=r-d;let b=0;return h>0&&(r===a?b=(m-u)/h%6:r===m?b=(u-a)/h+2:b=(a-m)/h+4),[(b*60+360)%360,r>0?h/r:0]},rt=(a,m)=>{const u=(a%360+360)%360/60,r=m,d=r*(1-Math.abs(u%2-1)),h=1-r,[b,I,O]=u<1?[r,d,0]:u<2?[d,r,0]:u<3?[0,r,d]:u<4?[0,d,r]:u<5?[d,0,r]:[r,0,d];return[b+h,I+h,O+h]},Te=a=>{const[m,u]=ot(a),r=u/be,d=new Float32Array(ge.length*3);return ge.forEach(([h,b],I)=>{d.set(rt(m+h,g(be*b*r,0,1)),I*3)}),d},Ee=(a,m,u)=>{const r=a.createShader(m);return r?(a.shaderSource(r,u),a.compileShader(r),a.getShaderParameter(r,a.COMPILE_STATUS)?r:(a.deleteShader(r),null)):null},lt=(a,m,u)=>{const r=Ee(a,a.VERTEX_SHADER,m),d=Ee(a,a.FRAGMENT_SHADER,u),h=a.createProgram();return!r||!d||!h?null:(a.attachShader(h,r),a.attachShader(h,d),a.linkProgram(h),a.deleteShader(r),a.deleteShader(d),a.getProgramParameter(h,a.LINK_STATUS)?h:(a.deleteProgram(h),null))},st=(a,m,u)=>{const r={};for(const d of u)r[d]=a.getUniformLocation(m,d);return r},ft=({surfaceRef:a,beamPosition:m=.6,surfaceLevel:u=1,color:r="#3847ff",intensity:d=1.8,beamWidth:h=1.5,flare:b=1.5,spread:I=1.5,spill:O=1,fog:we=.2,dust:Ae=1.6,streaks:Me=1.5,dots:ye=1,pulse:Le=1.5,speed:Se=1.5,seed:Ie=3,mouseInteraction:ke=!0,revealImage:Pe,revealRadius:We=220,revealOpacity:_e=.6,intro:De=!0,theme:qe="dark",paused:Ce=!1,dpr:Be,...He})=>{const ee=S.useRef(null),te=S.useRef(null),C=S.useRef(null),ae={surfaceRef:a,beamPosition:g(m,0,1),surfaceLevel:g(u,0,1),color:String(r),intensity:Math.max(0,d),beamWidth:g(h,.2,5),flare:g(b,.2,4),spread:g(I,.1,4),spill:Math.max(0,O),fog:Math.max(0,we),dust:Math.max(0,Ae),streaks:Math.max(0,Me),dots:Math.max(0,ye),pulse:Math.max(0,Le),speed:Se,seed:Ie,mouseInteraction:ke,revealImage:Pe,revealRadius:Math.max(1,We),revealOpacity:g(_e,0,1),intro:De,theme:qe,paused:Ce,dpr:Be},k=S.useRef(ae);k.current=ae,S.useEffect(()=>{const E=ee.current,R=te.current,e=R?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!E||!R||!e)return;const P=lt(e,Qe,et);if(!P)return;const p=st(e,P,["uResolution","uDpr","uScale","uTime","uBeamX","uSurface","uRadius","uIntro","uPour","uRun","uLens","uReveal","uRevealMap","uRevealInfo","uAtmosphere","uAmount","uShape","uExtra","uTheme","uTint"]),X=e.createVertexArray(),re=e.createBuffer();e.bindVertexArray(X),e.bindBuffer(e.ARRAY_BUFFER,re),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const le=e.getAttribLocation(P,"aPosition");e.enableVertexAttribArray(le),e.vertexAttribPointer(le,2,e.FLOAT,!1,0,0),e.bindVertexArray(null);const B=e.createTexture();e.bindTexture(e.TEXTURE_2D,B),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([0,0,0,0])),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const G=document.createElement("canvas");G.width=1,G.height=1;const w=G.getContext("2d",{willReadFrequently:!0}),Y=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,i={time:0,introTime:k.current.intro&&!Y?0:K,width:1,height:1,ratio:1,colorKey:"",tints:Te([.22,.28,1]),observed:null,pointer:{x:0,y:0,inside:!1},lens:{x:0,y:0,vx:0,vy:0,strength:0,placed:!1},reveal:{src:"",ready:!1,width:1,height:1,image:null}};let A=0,M=0,H=!0,N=!0;const Fe=t=>{if(!w)return[.22,.28,1];w.clearRect(0,0,1,1),w.fillStyle="#3847ff",w.fillStyle=t,w.fillRect(0,0,1,1);const[s,o,l]=w.getImageData(0,0,1,1).data;return[s/255,o/255,l/255]},Ue=t=>{t.color!==i.colorKey&&(i.colorKey=t.color,i.tints=Te(Fe(t.color)))},ze=t=>{const s=t.revealImage?String(t.revealImage):"",o=i.reveal;if(s===o.src||(o.src=s,o.ready=!1,o.image&&(o.image.onload=null),!s))return;const l=new Image;l.crossOrigin="anonymous",l.decoding="async",l.onload=()=>{if(!N||o.src!==s)return;const f=l.naturalWidth||l.width||1,c=l.naturalHeight||l.height||1,n=Math.min(1,2048/Math.max(f,c)),x=document.createElement("canvas");x.width=Math.max(1,Math.round(f*n)),x.height=Math.max(1,Math.round(c*n)),x.getContext("2d")?.drawImage(l,0,0,x.width,x.height),e.bindTexture(e.TEXTURE_2D,B),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,x),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),o.width=x.width,o.height=x.height,o.ready=!0,C.current?.()},l.src=s,o.image=l},Ke=(t,s,o)=>{const l=t.surfaceRef?.current??null;if(l!==i.observed&&(i.observed&&F.unobserve(i.observed),l&&F.observe(l),i.observed=l),l){const f=E.getBoundingClientRect(),c=l.getBoundingClientRect();if(c.width>0){const n=getComputedStyle(l),x=Math.max(parseFloat(n.borderTopLeftRadius)||0,parseFloat(n.borderTopRightRadius)||0);return{left:c.left-f.left,top:c.top-f.top,right:c.right-f.left,bottom:c.bottom-f.top,radius:Math.min(x,c.width/2,c.height/2),real:!0}}}return{left:-s*2,top:t.surfaceLevel*o,right:s*3,bottom:o*3,radius:0,real:!1}},se=()=>{const t=Math.max(1,E.clientWidth),s=Math.max(1,E.clientHeight),o=k.current,l=Math.min(o.dpr||window.devicePixelRatio||1,2),f=Math.max(t,s)*l,c=f>Re?l*Re/f:l,n=Math.max(1,Math.round(t*c)),x=Math.max(1,Math.round(s*c));(R.width!==n||R.height!==x)&&(R.width=n,R.height=x),i.width=t,i.height=s,i.ratio=R.width/t,V()},V=()=>{const t=k.current;Ue(t);const{width:s,height:o}=i,l=Math.max(.2,Math.min(s/585,o/507));let f=Ke(t,s,o),c=t.beamPosition*s;if(f.real){const _=f.radius+6;c>=f.left&&c<=f.right?c=g(c,f.left+_,f.right-_):f={left:-s*2,top:o,right:s*3,bottom:o*3,radius:0,real:!1}}const n=-.15*o,x=f.top-n+.3*o,L=i.introTime,T=L>=K,U=T?f.top+.3*o:n+x*Math.pow(g(L/Q,0,1),1.3),Z=Q*Math.pow(Math.max(0,f.top-n)/x,1/1.3),v=L-Z,Oe=T?1:v<=0?0:at(v),Xe=T||v<=0?0:Math.exp(-v/.35)*(1-Math.exp(-v/.05)),z=t.spread*250*1.3+80,he=T?1e5:v<=0?-40:z*(1-Math.exp(-1.15*v)),Ge=T||v<=0?0:Math.exp(-1.15*v)*(1-Math.exp(-v/.08)),me=_=>{if(T)return[1e3,1];if(v<=0)return[-_,0];const $=Math.min(_,z*.97),$e=-Math.log(1-$/z)/1.15,D=v-$e,q=g((D+.15)/.8,0,1),xe=q*q*q*(q*(q*6-15)+10);return D<=0?[he-$,xe]:[1.15*(z-$)*D+260*D*D,xe]},[Ye,Ve]=me((c-f.left)/l),[Ze,je]=me((f.right-c)/l),Je=T?1:v<=0?.3*tt(L/Q):.3+.7*(1-Math.exp(-1.3*v)),de=Number(t.seed)||0;e.viewport(0,0,R.width,R.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(P),e.uniform2f(p.uResolution,s,o),e.uniform1f(p.uDpr,i.ratio),e.uniform1f(p.uScale,l),e.uniform1f(p.uTime,i.time),e.uniform1f(p.uBeamX,c),e.uniform4f(p.uSurface,f.left,f.top,f.right,f.bottom),e.uniform1f(p.uRadius,f.radius),e.uniform3f(p.uIntro,U,Oe,Xe),e.uniform4f(p.uPour,Ye,Ze,Ve,je),e.uniform2f(p.uRun,he,Ge),e.uniform4f(p.uLens,i.lens.x,i.lens.y,95*l,i.lens.strength),ze(t);const{reveal:W}=i,pe=Math.max(s/W.width,o/W.height),j=W.width*pe,J=W.height*pe;e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,B),e.uniform1i(p.uReveal,0),e.uniform4f(p.uRevealMap,1/j,1/J,(j-s)/2/j,(J-o)/2/J),e.uniform2f(p.uRevealInfo,t.revealRadius,W.ready?t.revealOpacity:0),e.uniform1f(p.uAtmosphere,Je),e.uniform4f(p.uAmount,t.intensity,t.fog,t.dust,t.streaks),e.uniform4f(p.uShape,t.beamWidth,t.flare,t.spread,t.spill),e.uniform4f(p.uExtra,t.pulse,t.dots,34.34+de*7.31,11.58+de*3.17),e.uniform1f(p.uTheme,t.theme==="light"?1:0),e.uniform3fv(p.uTint,i.tints),e.bindVertexArray(X),e.drawArrays(e.TRIANGLES,0,3),e.bindVertexArray(null)},ne=t=>{if(A=0,!N||!H||document.hidden)return;const s=k.current,o=M?Math.min(.05,(t-M)/1e3):1/60;M=t;const l=!s.paused&&!Y;l&&(i.time+=o*s.speed);const f=i.introTime<K;f&&(i.introTime=Math.min(K,i.introTime+o));const{pointer:c,lens:n}=i,x=s.mouseInteraction&&c.inside&&!Y;x&&!n.placed&&(n.x=c.x,n.y=c.y,n.vx=0,n.vy=0,n.placed=!0);const L=120*(c.x-n.x)-19*n.vx,T=120*(c.y-n.y)-19*n.vy;n.vx+=L*o,n.vy+=T*o,n.x+=n.vx*o,n.y+=n.vy*o;const U=x?1:0;n.strength+=(U-n.strength)*(1-Math.exp(-o/(U>n.strength?.3:.55))),n.strength<.001&&!x&&(n.placed=!1),V();const Z=Math.abs(i.lens.strength-(s.mouseInteraction&&i.pointer.inside?1:0))>.002||Math.hypot(i.lens.vx,i.lens.vy)>.5;l||f||Z?A=requestAnimationFrame(ne):M=0},y=()=>{!A&&N&&H&&!document.hidden&&(A=requestAnimationFrame(ne))},ie=t=>{const s=E.getBoundingClientRect(),o=t.clientX-s.left,l=t.clientY-s.top;i.pointer.x=o,i.pointer.y=l,i.pointer.inside=o>=0&&l>=0&&o<=s.width&&l<=s.height,y()},fe=()=>{i.pointer.inside=!1,y()},ce=()=>{M=0,y()},F=new ResizeObserver(se);F.observe(E);const ue=new IntersectionObserver(t=>{H=t.some(s=>s.isIntersecting),H&&(M=0,y())});return ue.observe(E),window.addEventListener("pointermove",ie,{passive:!0}),document.documentElement.addEventListener("pointerleave",fe),document.addEventListener("visibilitychange",ce),se(),y(),C.current=()=>{A||V(),y()},()=>{N=!1,cancelAnimationFrame(A),C.current=null,F.disconnect(),ue.disconnect(),window.removeEventListener("pointermove",ie),document.documentElement.removeEventListener("pointerleave",fe),document.removeEventListener("visibilitychange",ce),e.deleteTexture(B),e.deleteBuffer(re),e.deleteVertexArray(X),e.deleteProgram(P)}},[]),S.useEffect(()=>{C.current?.()});const{className:oe="",...Ne}=He;return ve.jsx("div",{ref:ee,className:`laser-flow-container${oe?` ${oe}`:""}`,...Ne,children:ve.jsx("canvas",{ref:te,className:"laser-flow-canvas","aria-hidden":"true"})})};export{ft as LaserFlow,ft as default};
