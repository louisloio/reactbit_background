import{r as C,j as ir}from"../text-animations-CJoAwL_r.js";import{i as Br,s as qr,f as _r,u as xe,d as Wr,t as be,a as Hr,e as Z}from"./index-Bv2gyG3N.js";const ar={right:0,left:1,center:2,full:3},pt={pearl:0,chrome:1,satin:2},E={none:0,repel:1,attract:2},A={none:0,dither:1,ascii:2},nr={stream:0,vortex:1,ribbon:2},wr=4.2,dt=1.8,ut={pearl:{roughness:.46,brightness:.92,glow:.54,highlightMix:.78},chrome:{roughness:.1,brightness:1.12,glow:.38,highlightMix:.9},satin:{roughness:.74,brightness:.84,glow:.42,highlightMix:.66}},sr={bold:{count:.58,size:1.32},balanced:{count:1,size:.96},fine:{count:1.15,size:.7}},lr={low:{count:1900,dpr:1.5,supersamplePixels:3e6},medium:{count:3200,dpr:2,supersamplePixels:6e6},high:{count:4600,dpr:2,supersamplePixels:8e6}},ct=[{countScale:1},{countScale:.86},{countScale:.72}],cr=[.25,.22,.18],I={interactive:{interval:1e3/60,continuous:!0},settling:{interval:1e3/60,continuous:!0},ambient:{interval:1e3/60,continuous:!0},partial:{interval:1e3/12,continuous:!1}},fr=(e,t)=>e.continuous?Math.max(e.interval,t):e.interval,Vr=(e,t,o,i)=>{const a=t+o;return i||a<=e-.5?e+o:a},b=(e,t,o)=>Math.min(o,Math.max(t,e)),pr=e=>({weights:xr(e),velocity:[0,0,0,0]}),dr=(e,t,o,i,a)=>{const l=xr(t);if(a){e.weights=l,e.velocity.fill(0);return}const c=6/i,g=Math.exp(-c*o);for(let d=0;d<4;d+=1){const w=e.weights[d]-l[d],y=e.velocity[d]+c*w;e.weights[d]=l[d]+(w+y*o)*g,e.velocity[d]=(e.velocity[d]-c*y*o)*g}e.weights.every((d,w)=>Math.abs(d-l[w])<1e-4&&Math.abs(e.velocity[w])<.001)&&(e.weights=l,e.velocity.fill(0))},Yr=(e,t)=>{const o=2.65+.61*e+.09*e*e,i=2.3+2*e+.35*e*e,a=Math.hypot(2.44*e,Math.sqrt(5)),l=Math.hypot(2.56*e,1);return e<.82?l*(t[0]+t[1]+t[2])+a*t[3]:o*(t[0]+t[1])+i*t[2]+a*t[3]},ur=()=>({pointerId:null,elapsed:0,amount:0,velocity:0,phase:0}),$r=(e,t,o)=>{if(o){e.pointerId=null,e.elapsed=0,e.amount=0,e.velocity=0;return}const i=e.elapsed;e.elapsed=e.pointerId===null?0:e.elapsed+t;const a=e.pointerId!==null&&e.elapsed>.15,l=a&&i<.15?e.elapsed-.15:t,c=a?1:0,g=a?3.8:3.2,d=Math.exp(-g*l),w=e.amount-c,y=e.velocity+g*w;e.amount=c+(w+y*l)*d,e.velocity=(e.velocity-g*y*l)*d,Math.abs(e.amount-c)<1e-4&&Math.abs(e.velocity)<.001&&(e.amount=c,e.velocity=0),e.amount>0&&(e.phase+=t*(.35+e.amount*.5))},ee=e=>{e.velocity??=[0,0],e.velocity[0]=0,e.velocity[1]=0,e.presenceVelocity=0},Gr=(e,t)=>{if(t<=0)return;const o=26,i=Math.exp(-o*t);for(let y=0;y<2;y+=1){const H=e.position[y]-e.raw[y],V=e.velocity[y]+o*H;e.position[y]=e.raw[y]+(H+V*t)*i,e.velocity[y]=(e.velocity[y]-o*V*t)*i}const a=e.active?1:0,l=e.active?24:12,c=Math.exp(-l*t),g=e.presence-a,d=e.presenceVelocity+l*g,w=a+(g+d*t)*c;e.presence=b(w,0,1),e.presenceVelocity=(e.presenceVelocity-l*d*t)*c,w!==e.presence&&(e.presenceVelocity=0),Math.abs(e.presence-a)<.001&&Math.abs(e.presenceVelocity)<.01&&(e.presence=a,e.presenceVelocity=0)},vr=()=>Array.from({length:4},()=>({origin:[.5,.5],age:0,duration:0,strength:0})),hr=(e,t,o,i=1)=>{const a=e.find(g=>g.strength===0);if(!a)return!1;a.origin=[...t],a.age=0;const l=(1+Math.abs(t[0]*2-1))*o,c=1+Math.abs(t[1]*2-1);return a.duration=Math.hypot(l,c)/wr+dt,a.strength=i,!0},jr=(e,t,o)=>{for(const i of e)o&&(i.strength=0),i.strength&&(i.age+=t,i.age>=i.duration&&(i.strength=0))},xr=e=>[0,1,2,3].map(t=>t===e?1:0),vt=(e,t,o)=>[e[0]+(t[0]-e[0])*o,e[1]+(t[1]-e[1])*o,e[2]+(t[2]-e[2])*o,1],Xr=`
struct ViewParams {
  viewport: vec4f,
  shape: vec4f,
  effects: vec4f,
  composition: vec4f,
  transport: vec4f,
  formation: vec4f,
  gather: vec4f,
  pointer: vec4f,
  shock: vec4f,
  shockB: vec4f,
  shockC: vec4f,
  shockD: vec4f,
  material: vec4f,
  light: vec4f,
  environment: vec4f,
  baseColor: vec4f,
  highlightColor: vec4f,
  accentColor: vec4f,
}

struct PathSample {
  position: vec3f,
  tangent: vec3f,
  phase: f32,
}

struct VertexOut {
  @builtin(position) position: vec4f,
  @location(0) @interpolate(flat, first) baseAlpha: vec4f,
  @location(1) @interpolate(flat, first) creaseColor: vec3f,
  @location(2) localCoord: vec2f,
}

@group(0) @binding(0) var<uniform> view: ViewParams;

fn hashU32(value: u32) -> u32 {
  var state = value * 747796405u + 2891336453u;
  let word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
  return (word >> 22u) ^ word;
}

fn unitFloat(value: u32) -> f32 {
  return f32(hashU32(value)) * (1.0 / 4294967296.0);
}

fn safeNormalize(value: vec3f) -> vec3f {
  return value / max(length(value), 0.0001);
}

fn safeNormalize2(value: vec2f) -> vec2f {
  return value / max(length(value), 0.0001);
}

fn cubic(p0: f32, p1: f32, p2: f32, p3: f32, t: f32) -> f32 {
  let oneMinusT = 1.0 - t;
  return oneMinusT * oneMinusT * oneMinusT * p0
    + 3.0 * oneMinusT * oneMinusT * t * p1
    + 3.0 * oneMinusT * t * t * p2
    + t * t * t * p3;
}

fn cubicDerivative(p0: f32, p1: f32, p2: f32, p3: f32, t: f32) -> f32 {
  let oneMinusT = 1.0 - t;
  return 3.0 * oneMinusT * oneMinusT * (p1 - p0)
    + 6.0 * oneMinusT * t * (p2 - p1)
    + 3.0 * t * t * (p3 - p2);
}

fn sideArc(phase: f32) -> f32 {
  let lookup = array<f32, 32>(
    0.000000, 0.052475, 0.097829, 0.135121, 0.166845, 0.195164, 0.221458, 0.246639,
    0.271368, 0.296184, 0.321577, 0.348019, 0.375973, 0.405832, 0.437746, 0.471327,
    0.505474, 0.538781, 0.570323, 0.599945, 0.628000, 0.655048, 0.681734, 0.708795,
    0.737169, 0.768244, 0.804295, 0.848010, 0.894805, 0.935083, 0.969270, 1.000000,
  );
  let scaled = clamp(phase, 0.0, 0.999999) * 31.0;
  let index = min(u32(floor(scaled)), 30u);
  return mix(lookup[index], lookup[index + 1u], fract(scaled));
}

fn fullArc(phase: f32) -> f32 {
  let lookup = array<f32, 32>(
    0.000000, 0.028092, 0.055939, 0.083892, 0.112291, 0.141449, 0.171637, 0.203033,
    0.235650, 0.269282, 0.303537, 0.337982, 0.372308, 0.406392, 0.440263, 0.474026,
    0.507794, 0.541636, 0.575553, 0.609470, 0.643257, 0.676761, 0.709855, 0.742465,
    0.774594, 0.806319, 0.837790, 0.869218, 0.900862, 0.933020, 0.965991, 1.000000,
  );
  let scaled = clamp(phase, 0.0, 0.999999) * 31.0;
  let index = min(u32(floor(scaled)), 30u);
  return mix(lookup[index], lookup[index + 1u], fract(scaled));
}

fn centerArc(phase: f32) -> f32 {
  let lookup = array<f32, 32>(
    0.000000, 0.028692, 0.059794, 0.096620, 0.140315, 0.179839, 0.212476, 0.241834,
    0.270282, 0.299332, 0.329968, 0.362347, 0.395341, 0.427241, 0.457283, 0.485900,
    0.514192, 0.543773, 0.577230, 0.618093, 0.661144, 0.696770, 0.727388, 0.756064,
    0.784657, 0.814415, 0.845979, 0.878880, 0.911508, 0.942489, 0.971712, 1.000000,
  );
  let scaled = clamp(phase, 0.0, 0.999999) * 31.0;
  let index = min(u32(floor(scaled)), 30u);
  return mix(lookup[index], lookup[index + 1u], fract(scaled));
}

fn mobileArc(phase: f32) -> f32 {
  let lookup = array<f32, 32>(
    0.000000, 0.028885, 0.057970, 0.087431, 0.117400, 0.147935, 0.179017, 0.210560,
    0.242467, 0.274689, 0.307272, 0.340367, 0.374193, 0.408970, 0.444794, 0.481483,
    0.518517, 0.555206, 0.591030, 0.625807, 0.659633, 0.692728, 0.725311, 0.757533,
    0.789440, 0.820983, 0.852065, 0.882600, 0.912569, 0.942030, 0.971115, 1.000000,
  );
  let scaled = clamp(phase, 0.0, 0.999999) * 31.0;
  let index = min(u32(floor(scaled)), 30u);
  return mix(lookup[index], lookup[index + 1u], fract(scaled));
}

fn sidePath(seedPhase: f32, distance: f32, aspect: f32, mirror: f32) -> PathSample {
  let pi = 3.14159265359;
  let pathLength = 2.65 + 0.61 * aspect + 0.09 * aspect * aspect;
  let phase = fract(seedPhase + distance / pathLength);
  let t = sideArc(phase);
  let x = cubic(1.24, 1.02, -0.28, 0.12, t) + sin(t * pi * 4.0 + 0.34) * 0.055;
  let y = cubic(1.38, 0.72, -0.56, -1.38, t) + sin(t * pi * 2.0 - 0.6) * 0.04;
  let z = sin(t * pi * 3.0) * 0.18;
  let derivative = vec3f(
    mirror * aspect * (
      cubicDerivative(1.24, 1.02, -0.28, 0.12, t)
        + cos(t * pi * 4.0 + 0.34) * pi * 4.0 * 0.055
    ),
    cubicDerivative(1.38, 0.72, -0.56, -1.38, t)
      + cos(t * pi * 2.0 - 0.6) * pi * 2.0 * 0.04,
    cos(t * pi * 3.0) * pi * 3.0 * 0.18,
  );
  var sample: PathSample;
  sample.position = vec3f(mirror * aspect * x, y, z);
  sample.tangent = safeNormalize(derivative);
  sample.phase = phase;
  return sample;
}

fn centerPath(seedPhase: f32, distance: f32, aspect: f32) -> PathSample {
  let pi = 3.14159265359;
  let pathLength = 2.3 + 2.0 * aspect + 0.35 * aspect * aspect;
  let phase = fract(seedPhase + distance / pathLength);
  let t = centerArc(phase);
  let angle = mix(-0.25 * pi, 1.75 * pi, t);
  let angleDerivative = 2.0 * pi;
  let radius = 0.72 + sin(t * pi * 4.0) * 0.12;
  let radiusDerivative = cos(t * pi * 4.0) * pi * 4.0 * 0.12;
  let derivative = vec3f(
    aspect * (
      -sin(angle) * angleDerivative * radius
        + cos(angle) * radiusDerivative
    ),
    cos(angle) * angleDerivative * radius
      + sin(angle) * radiusDerivative,
    cos(t * pi * 2.0) * pi * 2.0 * 0.16,
  );
  var sample: PathSample;
  sample.position = vec3f(
    cos(angle) * radius * aspect,
    sin(angle) * radius,
    sin(t * pi * 2.0) * 0.16,
  );
  sample.tangent = safeNormalize(derivative);
  sample.phase = phase;
  return sample;
}

fn fullPath(seedPhase: f32, distance: f32, aspect: f32) -> PathSample {
  let pi = 3.14159265359;
  let pathWidth = 2.44 * aspect;
  let pathLength = sqrt(pathWidth * pathWidth + 5.0);
  let phase = fract(seedPhase + distance / pathLength);
  let t = fullArc(phase);
  let derivative = vec3f(
    aspect * 2.44,
    cos((t * 1.72 - 0.2) * pi) * 1.72 * pi * 0.54
      + cos(t * pi * 3.0) * pi * 3.0 * 0.12,
    -sin(t * pi * 2.0 - 0.7) * pi * 2.0 * 0.22,
  );
  var sample: PathSample;
  sample.position = vec3f(
    mix(-aspect * 1.22, aspect * 1.22, t),
    sin((t * 1.72 - 0.2) * pi) * 0.54 + sin(t * pi * 3.0) * 0.12,
    cos(t * pi * 2.0 - 0.7) * 0.22,
  );
  sample.tangent = safeNormalize(derivative);
  sample.phase = phase;
  return sample;
}

fn mobilePath(seedPhase: f32, distance: f32, aspect: f32) -> PathSample {
  let pi = 3.14159265359;
  let pathWidth = 2.56 * aspect;
  let pathLength = sqrt(pathWidth * pathWidth + 1.0);
  let phase = fract(seedPhase + distance / pathLength);
  let t = mobileArc(phase);
  let derivative = vec3f(
    aspect * 2.56,
    cos(t * pi) * pi * 0.28 + cos(t * pi * 3.0) * pi * 3.0 * 0.06,
    -sin(t * pi * 2.0) * pi * 2.0 * 0.16,
  );
  var sample: PathSample;
  sample.position = vec3f(
    mix(-aspect * 1.28, aspect * 1.28, t),
    -0.86 + sin(t * pi) * 0.28 + sin(t * pi * 3.0) * 0.06,
    cos(t * pi * 2.0) * 0.16,
  );
  sample.tangent = safeNormalize(derivative);
  sample.phase = phase;
  return sample;
}

fn weightedPath(seedPhase: f32, phaseOffset: f32, aspect: f32, weights: vec4f) -> PathSample {
  // Every placement samples the same point along the stream, including its wrap seam.
  let phase = fract(seedPhase + phaseOffset);
  var result: PathSample;
  result.position = vec3f(0.0);
  result.tangent = vec3f(0.0);
  result.phase = phase;

  if (aspect < 0.82) {
    let compactWeight = weights.x + weights.y + weights.z;
    if (compactWeight > 0.0001) {
      let compact = mobilePath(phase, 0.0, aspect);
      result.position += compact.position * compactWeight;
      result.tangent += compact.tangent * compactWeight;
    }
    if (weights.w > 0.0001) {
      let wide = fullPath(phase, 0.0, aspect);
      result.position += wide.position * weights.w;
      result.tangent += wide.tangent * weights.w;
    }
  } else {
    if (weights.x > 0.0001) {
      let right = sidePath(phase, 0.0, aspect, 1.0);
      result.position += right.position * weights.x;
      result.tangent += right.tangent * weights.x;
    }
    if (weights.y > 0.0001) {
      let left = sidePath(phase, 0.0, aspect, -1.0);
      result.position += left.position * weights.y;
      result.tangent += left.tangent * weights.y;
    }
    if (weights.z > 0.0001) {
      let center = centerPath(phase, 0.0, aspect);
      result.position += center.position * weights.z;
      result.tangent += center.tangent * weights.z;
    }
    if (weights.w > 0.0001) {
      let wide = fullPath(phase, 0.0, aspect);
      result.position += wide.position * weights.w;
      result.tangent += wide.tangent * weights.w;
    }
  }

  result.tangent = safeNormalize(result.tangent + vec3f(0.0001, 0.0, 0.0));
  return result;
}

fn pointerField(delta: vec2f, radius: f32, flow: vec2f, depth: f32) -> vec2f {
  // A curved Gaussian follows the flow, with a long, boundary-free tail.
  let offset = delta / max(radius, 0.001);
  let along = dot(offset, flow);
  let across = dot(offset, vec2f(-flow.y, flow.x));
  let alongSquared = along * along;
  let layer = depth * inverseSqrt(1.0 + depth * depth);
  let bend = (0.22 * alongSquared + 0.12 * layer * along) / (1.0 + alongSquared);
  let curvedAcross = (across + bend) / (1.0 + layer * 0.18);
  let falloff = exp(-0.28 * alongSquared - 1.2 * curvedAcross * curvedAcross);
  return offset * falloff;
}

fn rippleWave(age: f32) -> f32 {
  if (age <= 0.0 || age >= ${dt}) { return 0.0; }
  let attack = smoothstep(0.0, 0.14, age);
  let release = 1.0 - smoothstep(1.4, ${dt}, age);
  return sin(age * 10.0) * exp(-age * 3.2) * attack * release;
}

fn rippleDisplacement(position: vec3f, pulse: vec4f) -> vec4f {
  if (pulse.w <= 0.0001) { return vec4f(0.0); }
  let perspective = 1.0 / max(0.62, 1.0 - position.z * 0.34);
  let delta = (position.xy * perspective - pulse.xy) * view.viewport.z;
  let distance = sqrt(dot(delta, delta) + 0.0016) - 0.04;
  let wave = rippleWave(pulse.z - distance / ${wr}) * pulse.w;
  let radial = delta / (distance + 0.12);
  return vec4f(radial * wave * 0.28, wave * 0.12, abs(wave));
}

fn shardVertex(index: u32) -> vec3f {
  let fold = 0.34;
  let vertices = array<vec3f, 6>(
    vec3f(0.0, 1.0, fold),
    vec3f(-0.72, 0.0, 0.0),
    vec3f(0.0, -1.0, fold),
    vec3f(0.0, 1.0, fold),
    vec3f(0.0, -1.0, fold),
    vec3f(0.72, 0.0, 0.0)
  );
  return vertices[index % 6u];
}

fn softbox(direction: vec3f, center: vec2f, size: vec2f) -> f32 {
  let q = abs((direction.xy - center) / size);
  let q2 = q * q;
  let q4 = q2 * q2;
  return exp(-(q4.x + q4.y));
}

fn aces(color: vec3f) -> vec3f {
  let a = 2.51;
  let b = 0.03;
  let c = 2.43;
  let d = 0.59;
  let e = 0.14;
  return clamp((color * (a * color + b)) / (color * (c * color + d) + e), vec3f(0.0), vec3f(1.0));
}

@vertex
fn vs_main(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VertexOut {
  let seedPhase = unitFloat(instanceIndex * 1664525u + 1013904223u);
  let seedLane = unitFloat(instanceIndex * 2246822519u + 3266489917u);
  let seedDepth = unitFloat(instanceIndex * 668265263u + 374761393u);
  let seedScale = unitFloat(instanceIndex * 1597334677u + 3812015801u);
  let aspect = view.viewport.x;
  let path = weightedPath(seedPhase, view.transport.x, aspect, view.composition);
  var direction = path.tangent;
  var planarNormal = safeNormalize2(vec2f(-direction.y, direction.x));

  let signedLane = seedLane * 2.0 - 1.0;
  let lane = sign(signedLane) * pow(abs(signedLane), 0.72);
  let widthProfile = 0.46 + pow(max(sin(path.phase * 3.14159265359), 0.0), 0.72) * 0.54;
  let looseSeed = unitFloat(instanceIndex * 3266489917u + 668265263u);
  let loose = smoothstep(0.92, 1.0, looseSeed);
  let flowWave = sin(path.phase * 37.6991118431 + seedDepth * 12.0);
  let laneWidth = (lane * 0.56 + flowWave * 0.055 * view.shape.z) * view.shape.x
    * widthProfile * (1.0 + loose * 0.72);
  let depthLane = (seedDepth * 2.0 - 1.0) * view.shape.y
    + cos(path.phase * 31.4159265359 + seedLane * 8.0) * 0.06 * view.shape.z;
  var renderPosition = path.position + vec3f(planarNormal * laneWidth, depthLane);

  if (view.formation.y + view.formation.z > 0.00001) {
    let center = vec2f((view.composition.x - view.composition.y) * aspect * 0.56, 0.0);
    var formedPosition = renderPosition * view.formation.x;
    var formedDirection = direction * view.formation.x;
    if (view.formation.y > 0.00001) {
      let radius = 0.16 + sqrt(seedLane) * 0.74 * (0.45 + view.shape.x * 0.55);
      // Constant tangential travel speed; inner rings turn faster without speeding up.
      let angle = seedPhase * 6.28318530718 + view.viewport.w / radius;
      let radial = vec2f(cos(angle), sin(angle));
      let position = vec3f(center + radial * radius, (seedDepth - 0.5) * view.shape.y * 0.65 + radial.y * 0.2);
      formedPosition += position * view.formation.y;
      formedDirection += safeNormalize(vec3f(-radial.y, radial.x, radial.x * 0.2)) * view.formation.y;
    }
    if (view.formation.z > 0.00001) {
      let phase = fract(seedPhase + view.viewport.w / (aspect * 3.0 + 2.0));
      let angle = phase * 6.28318530718;
      let ribbonWidth = (seedLane - 0.5) * 0.54 * view.shape.x;
      let position = vec3f(
        mix(-aspect * 1.35, aspect * 1.35, phase) + center.x * 0.5,
        sin(angle) * 0.42 + cos(angle * 2.0) * ribbonWidth,
        (cos(angle) * 0.35 + sin(angle * 2.0) * ribbonWidth + (seedDepth - 0.5) * 0.12) * view.shape.y
      );
      let tangent = safeNormalize(vec3f(aspect * 2.7, cos(angle) * 2.638938, -sin(angle) * 2.199115 * view.shape.y));
      formedPosition += position * view.formation.z;
      formedDirection += tangent * view.formation.z;
    }
    renderPosition = formedPosition;
    direction = safeNormalize(formedDirection + vec3f(0.0, 0.0, 0.02 * view.formation.x * (1.0 - view.formation.x)));
    planarNormal = safeNormalize2(vec2f(-direction.y, direction.x));
  }

  if (abs(view.pointer.w) > 0.0001) {
    let field = pointerField(
      view.pointer.xy - renderPosition.xy,
      view.pointer.z,
      vec2f(planarNormal.y, -planarNormal.x),
      renderPosition.z,
    );
    let lateral = field - direction.xy * dot(field, direction.xy);
    renderPosition += vec3f(lateral * view.pointer.w * 0.36, 0.0);
    direction = safeNormalize(vec3f(direction.xy + lateral * view.pointer.w * 0.65, direction.z));
  }

  if (view.gather.z > 0.00001) {
    // A Gaussian cloud has a dense center and soft outskirts, never a ring or a hard outline.
    let relative = (renderPosition.xy - view.gather.xy) * view.viewport.z;
    let reach = length(relative);
    let radius = sqrt(-2.0 * log(max(seedLane, 0.0001)));
    let angle = seedPhase * 6.28318530718 + view.gather.w * (0.3 + seedDepth * 0.18);
    let orbit = vec2f(cos(angle), sin(angle));
    let layer = seedDepth * 6.28318530718;
    let drift = vec2f(sin(layer + view.gather.w * 0.22), cos(layer * 1.7 - view.gather.w * 0.18)) * 0.055;
    let cloud = orbit * radius * vec2f(0.2, 0.16) + drift;
    let cluster = vec3f(view.gather.xy + cloud / view.viewport.z, (seedDepth - 0.5) * 0.42);
    // Distant layers arrive later; there is no single closing boundary.
    let amount = pow(view.gather.z, 1.0 + seedDepth * 0.65 + min(reach, 4.0) * 0.12);
    let curledDirection = safeNormalize(vec3f(-orbit.y, orbit.x, sin(layer) * 0.35));
    renderPosition = mix(renderPosition, cluster, amount);
    direction = safeNormalize(mix(direction, curledDirection, amount));
  }

  var rippleLight = 0.0;
  if (view.shock.w + view.shockB.w + view.shockC.w + view.shockD.w > 0.0001) {
    let displacement = rippleDisplacement(renderPosition, view.shock)
      + rippleDisplacement(renderPosition, view.shockB)
      + rippleDisplacement(renderPosition, view.shockC)
      + rippleDisplacement(renderPosition, view.shockD);
    rippleLight = min(displacement.w, 1.5);
    if (dot(displacement.xyz, displacement.xyz) > 0.0) {
      renderPosition += displacement.xyz;
      direction = safeNormalize(direction + displacement.xyz * 0.7);
    }
  }

  let shapeLocal = shardVertex(vertexIndex);
  var local = shapeLocal;
  local.x *= mix(0.72, 1.08, seedLane);
  local.y *= mix(0.82, 1.12, seedDepth);
  local.x += (seedDepth - 0.5) * (1.0 - abs(local.y)) * 0.16;

  var side = cross(vec3f(0.0, 0.0, 1.0), direction);
  let sideLengthSquared = dot(side, side);
  if (sideLengthSquared > 0.0001) {
    side *= inverseSqrt(sideLengthSquared);
  } else {
    side = vec3f(1.0, 0.0, 0.0);
  }
  let facing = cross(direction, side);
  let rollDirection = mix(-1.5, 1.7, seedDepth);
  let roll = seedLane * 6.28318530718 + view.viewport.w * rollDirection * view.effects.x * 2.4;
  let rollSin = sin(roll);
  let rollCos = cos(roll);
  let bankedSide = side * rollCos + facing * rollSin;
  let bankedFacing = facing * rollCos - side * rollSin;
  let depthScale = mix(0.56, 1.58, clamp(renderPosition.z * 0.62 + 0.5, 0.0, 1.0));
  let scaleShape = 0.46 + seedScale * 0.58 + pow(seedScale, 12.0) * 1.55;
  let size = view.viewport.y * scaleShape * depthScale * (1.0 - view.gather.z * 0.3);
  let width = size * 0.72;
  let lengthScale = size * 1.26 * view.effects.z;
  let world = renderPosition
    + direction * local.y * lengthScale
    + bankedSide * local.x * width
    + bankedFacing * local.z * width;

  let perspective = 1.0 / max(0.62, 1.0 - world.z * 0.34);
  let ndc = world.xy * view.viewport.z / vec2f(aspect, 1.0) * perspective;
  let depth = clamp(0.56 - world.z * 0.24, 0.03, 0.97);
  let triangle = vertexIndex / 3u;
  let corner = vertexIndex % 3u;
  var mapped = vec3f(0.0);
  var mappedCrease = vec3f(0.0);
  var shardAlpha = 0.0;

  if (corner == 0u) {
    let facetSide = select(-1.0, 1.0, triangle == 1u);
    let localNormal = vec3f(facetSide * 0.394903, 0.0, 0.918723);
    let normal = bankedSide * localNormal.x + bankedFacing * localNormal.z;
    let viewDirection = normalize(vec3f(-renderPosition.xy * 0.08, 1.0));
    let pointerShift = vec2f(view.light.w, view.shape.w);
    let keyDirection = view.light.xyz;
    let halfDirection = normalize(keyDirection + viewDirection);
    let roughness = clamp(view.material.x, 0.04, 0.96);
    let materialKind = view.material.y;
    let glow = view.material.w;
    let reflection = reflect(-viewDirection, normal);
    let broad = softbox(
      reflection,
      vec2f(-0.34, 0.28) + pointerShift * 0.36,
      vec2f(0.52, 0.22) + roughness * 0.3,
    );
    let strip = softbox(
      reflection,
      vec2f(0.48, -0.08) - pointerShift * 0.2,
      vec2f(0.12, 0.72),
    );
    let diffuse = max(dot(normal, keyDirection), 0.0);
    let specularPower = mix(92.0, 9.0, roughness);
    let specular = pow(max(dot(normal, halfDirection), 0.0), specularPower);
    let fresnelBase = 1.0 - max(dot(normal, viewDirection), 0.0);
    let fresnelSquared = fresnelBase * fresnelBase;
    let fresnel = fresnelSquared * fresnelSquared;
    let facet = mix(0.76, 1.0, smoothstep(-0.08, 0.08, normal.x));
    let depthFog = smoothstep(-0.68, 0.58, renderPosition.z);
    let depthTint = mix(view.accentColor.rgb * 0.52, view.baseColor.rgb, depthFog);
    var color = depthTint * (0.1 + diffuse * 0.3) * facet;
    color += view.highlightColor.rgb * (broad * mix(0.3, 0.86, 1.0 - roughness)) * (1.0 + glow * 0.14);
    color += view.accentColor.rgb * strip * (0.12 + fresnel * 0.42);
    color += view.highlightColor.rgb * specular * mix(0.82, 1.0, seedDepth);
    color += mix(view.baseColor.rgb, view.accentColor.rgb, seedLane) * fresnel * (0.15 + glow * 0.16);
    color += view.accentColor.rgb * (broad * 0.045 + fresnel * 0.075) * glow;
    var creaseColor = color + view.highlightColor.rgb * (0.08 + specular * 0.22);

    if (materialKind > 0.5 && materialKind < 1.5) {
      let materialLight = view.highlightColor.rgb * (broad + specular) * 0.32;
      color = color * 1.1 + materialLight;
      creaseColor = creaseColor * 1.1 + materialLight;
    } else if (materialKind >= 1.5) {
      let satinColor = view.baseColor.rgb * (0.46 + diffuse * 0.46);
      color = mix(color, satinColor, 0.56);
      creaseColor = mix(creaseColor, satinColor, 0.56);
    }

    // A light page acts as a broad fill light, keeping shaded facets in the chosen palette.
    let fill = mix(view.accentColor.rgb, view.baseColor.rgb, depthFog)
      * (0.38 + diffuse * 0.12) * facet * view.environment.x;
    color += fill;
    creaseColor += fill;

    // Reuse the displacement wave, so the accent catches each facet as the ripple arrives.
    let pulseColor = mix(view.accentColor.rgb, view.highlightColor.rgb, 0.18);
    color += pulseColor * rippleLight * (0.85 + fresnel * 0.45);
    creaseColor += pulseColor * rippleLight * 1.35;

    let fog = mix(0.42, 1.0, depthFog);
    let exposure = fog * view.material.z * view.effects.w;
    mapped = aces(color * exposure);
    mappedCrease = aces(creaseColor * exposure);
    shardAlpha = mix(0.58, 0.97, depthFog);
    // Open path endpoints can cross the viewport while morphing. Taper only that moving seam.
    let seam = smoothstep(0.0, 0.035, path.phase) * (1.0 - smoothstep(0.965, 1.0, path.phase));
    shardAlpha *= mix(1.0, seam, view.transport.y * view.formation.x * (1.0 - view.gather.z));
  }

  var out: VertexOut;
  out.position = vec4f(ndc, depth, 1.0);
  out.baseAlpha = vec4f(mapped, shardAlpha);
  out.creaseColor = mappedCrease - mapped;
  out.localCoord = shapeLocal.xy;
  return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4f {
  let crease = (1.0 - smoothstep(0.015, 0.11, abs(in.localCoord.x)))
    * (1.0 - smoothstep(0.78, 1.0, abs(in.localCoord.y)));
  var coverage = 1.0;
  if (view.effects.y > 0.001) {
    let diamondDistance = 1.0 - abs(in.localCoord.y) - abs(in.localCoord.x) / 0.72;
    let edgeWidth = max(fwidth(diamondDistance) * view.effects.y, 0.0001);
    coverage = smoothstep(0.0, edgeWidth, diamondDistance);
  }
  let mapped = in.baseAlpha.rgb + in.creaseColor * crease;
  let coveredAlpha = in.baseAlpha.a * coverage;
  return vec4f(mapped * coveredAlpha, coveredAlpha);
}
`,Ur=`
struct PostParams {
  viewport: vec4f,
  bloomInfo: vec4f,
  finishing: vec4f,
  background: vec4f,
  temporal: vec4f,
  tint: vec4f,
}

@group(0) @binding(0) var sceneTexture: texture_2d<f32>;
@group(0) @binding(1) var sceneSampler: sampler;
@group(0) @binding(2) var<uniform> post: PostParams;

fn visibleResidual(uv: vec2f) -> vec4f {
  let scene = textureSampleLevel(sceneTexture, sceneSampler, uv, 0.0).rgb;
  let residual = scene - post.background.rgb;
  let energy = dot(abs(residual), vec3f(0.2126, 0.7152, 0.0722));
  let threshold = post.bloomInfo.z;
  let knee = post.bloomInfo.w;
  let contribution = smoothstep(threshold - knee, threshold + knee, energy);
  let coverage = energy * contribution;
  // Store a premultiplied palette halo on light surfaces, never negative radiance.
  return vec4f(mix(residual * contribution, post.tint.rgb * coverage, post.finishing.w), coverage);
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let offset = post.bloomInfo.xy * 0.25;
  var glow = visibleResidual(uv + offset);
  glow += visibleResidual(uv - offset);
  glow += visibleResidual(uv + vec2f(offset.x, -offset.y));
  glow += visibleResidual(uv + vec2f(-offset.x, offset.y));
  return glow * 0.25;
}
`,mr=`
struct BlurParams {
  direction: vec4f,
}

@group(0) @binding(0) var bloomTexture: texture_2d<f32>;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var<uniform> blur: BlurParams;

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let nearOffset = blur.direction.xy * 1.3846153846;
  let farOffset = blur.direction.xy * 3.2307692308;
  var color = textureSampleLevel(bloomTexture, linearSampler, uv, 0.0) * 0.2270270270;
  color += textureSampleLevel(bloomTexture, linearSampler, uv + nearOffset, 0.0) * 0.3162162162;
  color += textureSampleLevel(bloomTexture, linearSampler, uv - nearOffset, 0.0) * 0.3162162162;
  color += textureSampleLevel(bloomTexture, linearSampler, uv + farOffset, 0.0) * 0.0702702703;
  color += textureSampleLevel(bloomTexture, linearSampler, uv - farOffset, 0.0) * 0.0702702703;
  return color;
}
`,te=[[0,0,0,0,0,0,0],[0,0,0,0,0,12,12],[0,12,12,0,12,12,0],[0,0,0,31,0,0,0],[0,0,31,0,31,0,0],[4,4,4,4,4,4,4],[1,2,2,4,8,8,16],[16,8,8,4,2,2,1],[0,4,4,31,4,4,0],[0,21,14,31,14,21,0],[0,17,10,4,10,17,0],[2,4,8,16,8,4,2],[8,4,2,1,2,4,8],[3,4,8,8,8,4,3],[24,4,2,2,2,4,24],[0,0,14,17,17,14,0],[14,17,17,17,17,17,14],[10,10,31,10,31,10,10],[14,17,23,21,23,16,14],[17,27,21,21,17,17,17],[17,17,17,21,21,27,17],[14,17,17,31,17,17,17]],br=[[.28,.26],[.72,.14],[.28,.56],[.72,.44],[.28,.86],[.72,.74]],ht=te.map(e=>br.map(([t,o])=>{let i=0,a=0;for(let l=0;l<28;l+=1)for(let c=0;c<20;c+=1)((c+.5)/20-t)**2*.36+((l+.5)/28-o)**2>.26**2||(i+=e[Math.floor(l/4)]>>4-Math.floor(c/4)&1,a+=1);return i/Math.max(a,1)}));for(let e=0;e<6;e+=1){const t=Math.max(...ht.map(o=>o[e]));for(const o of ht)o[e]/=Math.max(t,.001)}const yr=`
struct StyleParams {
  viewport: vec4f,
  background: vec4f,
  mode: vec4f,
}
@group(0) @binding(0) var sourceTexture: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> style: StyleParams;

fn sampleSource(pixel: vec2f) -> vec3f {
  if (any(pixel < vec2f(0.0)) || any(pixel >= style.viewport.xy)) { return style.background.rgb; }
  return textureSampleLevel(sourceTexture, sourceSampler, pixel / style.viewport.xy, 0.0).rgb;
}
fn inkLevel(color: vec3f) -> f32 {
  // Measure contrast against the chosen background, not black: white stays empty too.
  return clamp(dot(abs(color - style.background.rgb), vec3f(0.2126, 0.7152, 0.0722)) * 2.4, 0.0, 1.0);
}
`,Qr=`${yr}
const INNER = array<vec2f, 6>(${br.map(e=>`vec2f(${e.join(", ")})`).join(", ")});
const OUTER = array<vec2f, 10>(
  vec2f(0.28, -0.2), vec2f(0.72, -0.2), vec2f(-0.22, 0.25), vec2f(1.22, 0.25),
  vec2f(-0.22, 0.5), vec2f(1.22, 0.5), vec2f(-0.22, 0.75), vec2f(1.22, 0.75),
  vec2f(0.28, 1.2), vec2f(0.72, 1.2)
);
const RING = array<vec2f, 6>(vec2f(1.0, 0.0), vec2f(0.5, 0.8660254), vec2f(-0.5, 0.8660254),
  vec2f(-1.0, 0.0), vec2f(-0.5, -0.8660254), vec2f(0.5, -0.8660254));
const SHAPES = array<vec3f, ${te.length*2}>(
  ${ht.flatMap(e=>[e.slice(0,3),e.slice(3)]).map(e=>`vec3f(${e.map(t=>t.toFixed(6)).join(", ")})`).join(`,
  `)}
);
fn edgeContrast(value: f32, outside: f32) -> f32 {
  let peak = max(max(value, outside), 0.0001);
  return value * value / peak;
}
@fragment
fn fs_main(@builtin(position) pixel: vec4f) -> @location(0) vec4f {
  let base = floor(pixel.xy) * style.viewport.zw;
  var values: array<f32, 6>;
  var colorSum = vec3f(0.0);
  var weightSum = 0.0;
  for (var i = 0u; i < 6u; i++) {
    let center = base + INNER[i] * style.viewport.zw;
    var color = sampleSource(center);
    for (var tap = 0u; tap < 6u; tap++) {
      color += sampleSource(center + RING[tap] * style.viewport.w * 0.161);
    }
    color /= 7.0;
    values[i] = inkLevel(color);
    colorSum += color * values[i];
    weightSum += values[i];
  }
  if (weightSum < 0.025) { return vec4f(style.background.rgb, 0.0); }
  var edges: array<f32, 10>;
  for (var i = 0u; i < 10u; i++) { edges[i] = inkLevel(sampleSource(base + OUTER[i] * style.viewport.zw)); }
  values[0] = edgeContrast(values[0], max(max(edges[0], edges[1]), max(edges[2], edges[4])));
  values[1] = edgeContrast(values[1], max(max(edges[0], edges[1]), max(edges[3], edges[5])));
  values[2] = edgeContrast(values[2], max(edges[2], max(edges[4], edges[6])));
  values[3] = edgeContrast(values[3], max(edges[3], max(edges[5], edges[7])));
  values[4] = edgeContrast(values[4], max(max(edges[4], edges[6]), max(edges[8], edges[9])));
  values[5] = edgeContrast(values[5], max(max(edges[5], edges[7]), max(edges[8], edges[9])));
  let peak = max(max(max(values[0], values[1]), max(values[2], values[3])), max(values[4], values[5]));
  let gain = 1.0 / max(peak, 0.001);
  let a = vec3f(values[0], values[1], values[2]);
  let b = vec3f(values[3], values[4], values[5]);
  // Normalize shape separately from ink color so thin, dim shards do not all select space.
  let shapeA = a * sqrt(a * gain) * gain;
  let shapeB = b * sqrt(b * gain) * gain;
  var best = 0u;
  var bestDistance = 100.0;
  for (var glyph = 0u; glyph < ${te.length}u; glyph++) {
    let da = shapeA - SHAPES[glyph * 2u];
    let db = shapeB - SHAPES[glyph * 2u + 1u];
    let distance = dot(da, da) + dot(db, db);
    if (distance < bestDistance) { best = glyph; bestDistance = distance; }
  }
  // RGB stores the scene palette; alpha is an exact byte-sized glyph index, not opacity.
  let ink = style.background.rgb + (colorSum / weightSum - style.background.rgb) * 2.2;
  return vec4f(clamp(ink, vec3f(0.0), vec3f(1.0)), f32(best) / 255.0);
}
`,Kr=`${yr}
@group(0) @binding(3) var asciiCells: texture_2d<f32>;
const GLYPHS = array<vec2u, ${te.length}>(
  ${te.map(e=>`vec2u(${e.slice(0,4).reduce((t,o,i)=>t+o*2**(i*5),0)}u, ${e.slice(4).reduce((t,o,i)=>t+o*2**(i*5),0)}u)`).join(`,
  `)}
);
// A centered Bayer screen distributes quantization error across a stable 4×4 grid.
const THRESHOLDS = array<f32, 16>(
  0.03125, 0.53125, 0.15625, 0.65625, 0.78125, 0.28125, 0.90625, 0.40625,
  0.21875, 0.71875, 0.09375, 0.59375, 0.96875, 0.46875, 0.84375, 0.34375
);
fn glyphBit(glyph: u32, point: vec2i) -> f32 {
  if (any(point < vec2i(0)) || point.x >= 5 || point.y >= 7) { return 0.0; }
  let row = u32(point.y);
  let bits = select(GLYPHS[glyph].x, GLYPHS[glyph].y, row >= 4u);
  let shift = (row % 4u) * 5u + 4u - u32(point.x);
  return f32((bits >> shift) & 1u);
}
fn orderedDither(color: vec3f, background: vec3f, threshold: f32) -> vec3f {
  let residual = color - background;
  let levels = abs(residual) * 3.0;
  let quantized = (floor(levels) + step(vec3f(threshold), fract(levels))) / 3.0;
  return clamp(background + sign(residual) * quantized, vec3f(0.0), vec3f(1.0));
}
@fragment
fn fs_main(@builtin(position) pixel: vec4f) -> @location(0) vec4f {
  let cellPosition = pixel.xy / style.viewport.zw;
  let cell = vec2i(floor(cellPosition));
  if (style.mode.x < 1.5) {
    let color = sampleSource((vec2f(cell) + 0.5) * style.viewport.zw);
    let index = u32(cell.x % 4) * 4u + u32(cell.y % 4);
    return vec4f(orderedDither(color, style.background.rgb, THRESHOLDS[index]), 1.0);
  }
  let info = textureLoad(asciiCells, clamp(cell, vec2i(0), vec2i(textureDimensions(asciiCells)) - 1), 0);
  let glyph = min(u32(round(info.a * 255.0)), ${te.length-1}u);
  // Integrate the compact glyph over each display pixel; keep subpixel strokes visible.
  let local = fract(cellPosition) * vec2f(6.0, 10.0) - vec2f(0.5, 1.5);
  let footprint = vec2f(6.0, 10.0) / style.viewport.zw;
  let low = local - footprint * 0.5;
  let high = local + footprint * 0.5;
  let origin = vec2i(floor(low));
  var coverage = 0.0;
  for (var y = 0; y < 3; y++) {
    for (var x = 0; x < 3; x++) {
      let point = origin + vec2i(x, y);
      let overlap = max(vec2f(0.0), min(high, vec2f(point + 1)) - max(low, vec2f(point)));
      coverage += glyphBit(glyph, point) * overlap.x * overlap.y;
    }
  }
  coverage /= footprint.x * footprint.y;
  return vec4f(mix(style.background.rgb, info.rgb, clamp(coverage, 0.0, 1.0)), 1.0);
}
`,Jr=`
struct PostParams {
  viewport: vec4f,
  bloomInfo: vec4f,
  finishing: vec4f,
  background: vec4f,
  temporal: vec4f,
  tint: vec4f,
}

@group(0) @binding(0) var sceneTexture: texture_2d<f32>;
@group(0) @binding(1) var bloomTexture: texture_2d<f32>;
@group(0) @binding(2) var linearSampler: sampler;
@group(0) @binding(3) var<uniform> post: PostParams;

fn hash12(value: vec2f) -> f32 {
  let p = fract(value * vec2f(0.1031, 0.1030));
  let mixed = p + dot(p, p.yx + 33.33);
  return fract((mixed.x + mixed.y) * mixed.x);
}

@fragment
fn fs_main(@location(0) uv: vec2f, @builtin(position) pixel: vec4f) -> @location(0) vec4f {
  let background = post.background.rgb;
  // Scene and output have identical dimensions; never filter the sharp base image.
  var scene = textureLoad(sceneTexture, vec2i(pixel.xy), 0).rgb;

  if (post.finishing.z > 0.000001) {
    let aspect = post.viewport.x / max(post.viewport.y, 1.0);
    let centered = (uv - vec2f(0.5)) * vec2f(aspect, 1.0);
    let radius = clamp(length(centered) / 0.78, 0.0, 1.0);
    let radialDirection = centered / max(length(centered), 0.0001);
    let minResolution = min(post.viewport.x, post.viewport.y);
    let pixelOffset = radialDirection * (post.finishing.z * minResolution * radius * radius);
    let uvOffset = pixelOffset * post.viewport.zw;
    let positive = textureSampleLevel(sceneTexture, linearSampler, uv + uvOffset, 0.0).rgb;
    let negative = textureSampleLevel(sceneTexture, linearSampler, uv - uvOffset, 0.0).rgb;
    scene = vec3f(positive.r, scene.g, negative.b);
  }

  var foreground = scene - background;
  if (post.finishing.x > 0.0001) {
    let bloom = textureSampleLevel(bloomTexture, linearSampler, uv, 0.0);
    // A colored haze remains visible on white; protect the opaque facet colors underneath.
    let haloMask = 1.0 - smoothstep(0.04, 0.4, length(foreground));
    let haloOpacity = min(bloom.a * post.finishing.x * 1.8, 0.65) * haloMask;
    let haloColor = bloom.rgb / max(bloom.a, 0.00001);
    let lightForeground = mix(foreground, haloColor - background, haloOpacity);
    foreground = mix(foreground + bloom.rgb * post.finishing.x, lightForeground, post.finishing.w);
  }

  let signal = smoothstep(0.008, 0.18, length(foreground));
  if (post.finishing.y > 0.0001) {
    let grainSeed = floor(post.temporal.x * 60.0);
    let noise = hash12(floor(pixel.xy) + vec2f(grainSeed, grainSeed * 1.6180339)) - 0.5;
    foreground += vec3f(noise * post.finishing.y * signal);
  }

  return vec4f(clamp(background + foreground, vec3f(0.0), vec3f(1.0)), 1.0);
}
`,ft=(e,t)=>{const i=/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(e)||/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(t);return[parseInt(i[1],16)/255,parseInt(i[2],16)/255,parseInt(i[3],16)/255,1]},Zr=e=>{const t=navigator.deviceMemory||6,o=navigator.hardwareConcurrency||6,i=Math.max(1,e.clientWidth*e.clientHeight);return e.clientWidth<640||t<=4||o<=4?"low":i<=36e4&&t>=8&&o>=12?"high":"medium"},gr=(e,t)=>{const o=Math.max(1,t.clientWidth*t.clientHeight),i=Math.sqrt(e.supersamplePixels/o);return Math.max(1,Math.min(window.devicePixelRatio||1,e.dpr,i))},mt=(e,t=0)=>{const o=cr[t]??cr[0];return[Math.max(1,Math.round(e[0]*o)),Math.max(1,Math.round(e[1]*o))]},eo=(e,t,o=mt(t))=>{const i=xe(e,{viewport:[1,.0132,1,0],shape:[1,1,.36,0],effects:[1,2,1,1.12],composition:[0,0,0,1],transport:[0,0,0,0],formation:[1,0,0,0],gather:[0,0,0,0],pointer:[0,0,.54,0],shock:[0,0,4,0],shockB:[0,0,0,0],shockC:[0,0,0,0],shockD:[0,0,0,0],material:[.46,pt.pearl,.92,.54],light:[-.321,.49,.845,0],environment:[0,0,0,0],baseColor:[.5372549019607843,.41568627450980394,.7411764705882353,1],highlightColor:vt([.6588235294117647,.3333333333333333,.9686274509803922,1],[1,1,1,1],ut.pearl.highlightMix),accentColor:[.6588235294117647,.3333333333333333,.9686274509803922,1]}),a=xe(e,{viewport:[t[0],t[1],1/t[0],1/t[1]],bloomInfo:[1/o[0],1/o[1],.2,.12],finishing:[.5,.05,.0075,0],background:[.071,.059,.09,1],temporal:[0,0,0,0],tint:[137/255,106/255,189/255,1]}),l=Wr(e,{shader:Xr,vertices:6,blend:"premultiplied",cull:"none",depth:!1,label:"aero-shards-procedural"});l.set({view:i});const c=be(e,{size:t,format:"rgba8unorm",label:"aero-shards-scene"}),g=be(e,{size:o,format:"rgba16float",label:"aero-shards-bloom"}),d=be(e,{size:o,format:"rgba16float",label:"aero-shards-bloom-scratch"}),w=Hr(e,{minFilter:"linear",magFilter:"linear",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"}),y=Z(e,Ur,{label:"aero-shards-bloom-prefilter",set:{sceneTexture:c,sceneSampler:w,post:a}}),H=xe(e,{direction:[1/o[0],0,0,0]}),V=xe(e,{direction:[0,1/o[1],0,0]}),re=Z(e,mr,{label:"aero-shards-bloom-horizontal",set:{bloomTexture:g,linearSampler:w,blur:H}}),Be=Z(e,mr,{label:"aero-shards-bloom-vertical",set:{bloomTexture:d,linearSampler:w,blur:V}}),qe=Z(e,Jr,{label:"aero-shards-finish",set:{sceneTexture:c,bloomTexture:g,linearSampler:w,post:a}}),_e=be(e,{size:[1,1],format:"rgba8unorm",label:"aero-shards-style"}),ye=be(e,{size:[1,1],format:"rgba8unorm",label:"aero-shards-ascii-cells"}),oe=xe(e,{viewport:[t[0],t[1],6,10],background:[.071,.059,.09,1],mode:[0,0,0,0]}),We=Z(e,Qr,{label:"aero-shards-ascii-match",set:{sourceTexture:c,sourceSampler:w,style:oe}}),He=Z(e,Kr,{label:"aero-shards-style-resolve",set:{sourceTexture:c,sourceSampler:w,style:oe,asciiCells:ye}});return{viewParams:i,postParams:a,shardDraw:l,sceneTarget:c,bloomTarget:g,bloomScratchTarget:d,bloomEffect:y,blurParamsX:H,blurParamsY:V,bloomBlurX:re,bloomBlurY:Be,finishEffect:qe,styleTarget:_e,asciiTarget:ye,styleParams:oe,asciiEffect:We,styleEffect:He,styleSignature:""}},to=(e,t,o,i)=>{const a=t.effect,l=[a,...o,...i,...t.background].join("|");if(l===e.styleSignature)return;e.styleSignature=l;const c=(a===A.ascii?3.6:1)*o[0]/Math.max(i[0],1),g=(a===A.ascii?6:1)*o[1]/Math.max(i[1],1);e.styleTarget.resize(a?o:[1,1]),e.asciiTarget.resize(a===A.ascii?[Math.max(1,Math.ceil(o[0]/c)),Math.max(1,Math.ceil(o[1]/g))]:[1,1]),e.styleParams.set({viewport:[o[0],o[1],c,g],background:t.background,mode:[a,0,0,0]});const d=a?e.styleTarget:e.sceneTarget;e.bloomEffect.set({sceneTexture:d}),e.finishEffect.set({sceneTexture:d})},ro=async(e,t)=>{await Promise.all([e.shardDraw.compile({colors:[t]}),e.shardDraw.compile(e.sceneTarget),e.bloomEffect.compile(e.bloomTarget),e.bloomBlurX.compile(e.bloomScratchTarget),e.bloomBlurY.compile(e.bloomTarget),e.finishEffect.compile({colors:[t]}),e.asciiEffect.compile(e.asciiTarget),e.styleEffect.compile(e.styleTarget)])};function no({backgroundColor:e="#120F17",shardColor:t="#896ABD",accentColor:o="#A855F7",placement:i="full",flow:a="stream",material:l="pearl",detail:c="balanced",effect:g="none",scale:d=1,spread:w=1,depth:y=1,speed:H=1,spin:V=1,interaction:re="repel",density:Be=1.5,shardSize:qe=1.1,stretch:_e=1,turbulence:ye=1,glow:oe=1,edgeSoftness:We=2,bloom:He=.5,grain:Sr=.05,chromaticAberration:Pr=.0075,transitionDuration:Mr=1,interactionRadius:Tr=1.5,interactionStrength:zr=.5,rippleIntensity:gt=1,holdToGather:wt=!0,paused:xt=!1,className:Dr="",onError:bt}){const yt=C.useRef(null),St=C.useRef(null),Pt=C.useRef(bt),T=C.useRef(null),Ve=C.useRef(()=>{}),F=C.useRef({raw:[.5,.5],position:[.5,.5],velocity:[0,0],active:0,presence:0,presenceVelocity:0,initialized:!1}),$=C.useRef(vr()),M=C.useRef(ur()),[kr,Mt]=C.useState(!1),Se=ut[l]||ut.pearl,Tt=sr[c]||sr.balanced,Pe=A[g]??A.none,Lr=Pe===A.none?1:.4,Cr=Pe===A.none?1:1.75,zt=b(d,.5,2.5),Me=ft(e,"#120F17"),Er=ft(t,"#896ABD"),Dt=ft(o,"#A855F7"),kt=b(w,.15,1.1),Lt=b(y,0,1.25),Ye=b(H,0,2),Ct=b(V,0,2),Ar=E[re]??E.repel,Et=b(Be,.5,1.5),At=b(qe,.5,1.5),Rt=b(_e,.6,1.8),It=b(ye,0,2),Ft=b(oe,0,2),Nt=b(We,0,2),Ot=b(He,0,3),Bt=b(Sr,0,.12),qt=b(Pr,0,.01),_t=b(Mr,.2,2),Wt=b(Tr,.5,2),Ht=b(zr,0,2),Rr=Me[0]*.2126+Me[1]*.7152+Me[2]*.0722,$e=b((Rr-.58)/.24,0,1),Vt=$e*$e*(3-2*$e);T.current={background:Me,shard:Er,highlight:vt(Dt,[1,1,1,1],Se.highlightMix),accent:Dt,composition:ar[i]??ar.full,flow:nr[a]??nr.stream,material:pt[l]??pt.pearl,effect:Pe,detailCount:Tt.count*Et*Lr,shardSize:Tt.size*At*Cr,scale:zt,stretch:Rt*(1+Math.min(Ye*.34,1.2)*.1),speed:Ye,spin:Ct,turbulence:.36*It,spread:kt,depth:Lt,roughness:Se.roughness,brightness:Se.brightness,glow:Se.glow*Ft,edgeSoftness:Nt,bloom:Ot,grain:Bt,chromaticAberration:qt*(Pe===A.none?1:.2),exposure:1.12+(.96-1.12)*Vt,lightSurface:Vt,transitionDuration:_t,interaction:Ar,interactionRadius:(re==="attract"?.27:.18)*Wt,interactionStrength:Ht,rippleIntensity:b(gt,0,2),holdToGather:wt,paused:xt,signature:[e,t,o,i,a,l,c,g,zt,kt,Lt,Ye,Ct,re,Et,At,Rt,It,Ft,Nt,Ot,Bt,qt,_t,Wt,Ht,gt,wt,xt].join("|")};const Ir=T.current.signature;return Pt.current=bt,C.useEffect(()=>{Ve.current()},[Ir]),C.useEffect(()=>{const P=St.current,Te=yt.current;if(!P||!Te)return;ee(F.current),$.current=vr(),M.current=ur();let q=!1,ie=!1,N,O=0,R=0,Ge,je,ze,De,Y=!0,Xe=1,ae=!0,ne=0,se=0,k=Te.getBoundingClientRect(),Ue=!1,ke=!0,L=()=>{ae=!0};const G=window.matchMedia("(prefers-reduced-motion: reduce)"),Qe=s=>{if(q||ie)return;ie=!0,O&&cancelAnimationFrame(O),R&&window.clearTimeout(R),De?.disconnect(),ze?.disconnect(),Ge?.(),je?.();const n=N;N=void 0,n?.dispose();const h=s instanceof Error?s:new Error(String(s));Pt.current?.(h)},Yt=()=>{k=Te.getBoundingClientRect(),Ue=!1},$t=(s,n)=>{if(Ue&&Yt(),k.width<=0||k.height<=0)return null;const h=(s-k.left)/k.width,u=(n-k.top)/k.height;return h<0||h>1||u<0||u>1?null:[h,u]},Gt=s=>{const n=F.current;!n.initialized||!n.active&&n.presence===0?(n.raw=[...s],n.position=[...s],n.presence=0,ee(n),n.initialized=!0):(n.raw[0]=s[0],n.raw[1]=s[1]),n.active=1},j=()=>{F.current.active=0,M.current.pointerId=null;const s=performance.now();ne=s+140,se=s+680,L()},jt=s=>{const n=T.current;if(!s.isPrimary||!Y||n.interaction===E.none)return;const h=$t(s.clientX,s.clientY);if(!h){const p=F.current;(p.active||p.presence>0)&&j();return}Gt(h);const u=performance.now();ne=u+140,se=u+680,L()},Xt=s=>{const n=T.current;if(!s.isPrimary||s.button!==0||!Y||n.interaction===E.none||s.target instanceof Element&&s.target.closest('a, button, input, textarea, select, [role="button"], [contenteditable="true"]'))return;const h=$t(s.clientX,s.clientY);if(!h)return;!n.paused&&!G.matches&&n.speed>1e-4&&(hr($.current,h,k.width/Math.max(k.height,1)),n.holdToGather&&(M.current.pointerId=s.pointerId,M.current.elapsed=0)),Gt(h);const u=performance.now();ne=u+220,se=u+800,L()},Ut=s=>{const n=M.current;if(n.pointerId===s.pointerId){n.pointerId=null;const h=T.current;n.amount>.1&&!h.paused&&!G.matches&&h.interaction!==E.none&&hr($.current,F.current.raw,k.width/Math.max(k.height,1),1+n.amount*.8),L()}s.pointerType!=="mouse"&&j()},Qt=()=>{Ue=!0},X=()=>{ke=!0,M.current.pointerId=null,ee(F.current),L()};return window.addEventListener("pointermove",jt,{passive:!0}),window.addEventListener("pointerdown",Xt,{passive:!0}),window.addEventListener("pointerup",Ut,{passive:!0}),window.addEventListener("pointercancel",j,{passive:!0}),window.addEventListener("blur",j),window.addEventListener("scroll",Qt,{passive:!0,capture:!0}),document.addEventListener("visibilitychange",X),window.addEventListener("focus",X),G.addEventListener("change",X),ze=new IntersectionObserver(s=>{const n=s[0];if(Xe=n?.intersectionRatio??1,Y=n?n.isIntersecting&&Xe>=.02:!0,Y)ke=!0;else{ne=0,se=0;const h=F.current;h.active=0,h.presence=0,M.current.pointerId=null,ee(h)}L()},{threshold:[0,.02,.25]}),ze.observe(Te),(async()=>{try{Mt(!1);const s=Zr(P),n=lr[s]||lr.medium;if(N=await Br({powerPreference:"low-power"}),q)return N.dispose();je=N.onError(Qe);const h=navigator.gpu.getPreferredCanvasFormat(),u=qr(N,P,{dpr:gr(n,P),autoResize:!1,format:h}),p=eo(N,u.size,mt([P.clientWidth,P.clientHeight]));if(await ro(p,h),q)return;let Kt="",Ke=0,le=0,ce=0,Jt=0,Je=0,Zt=0,Le=!0;const Ze=pr(T.current.composition);let fe=Ze.weights,er=!1;const et=pr(T.current.flow);let _=T.current.scale,B=0,tt=0,Ce=!1,U=0,rt=performance.now(),ot=0,Ee=0,it=0,at=0,pe=1e3/60;const de=new Float32Array(30);let nt=0,st=0;const tr=f=>{const r=F.current,x=Math.abs(r.presence-r.active)>.004;return f<ne||x||$.current.some(v=>v.strength>0)||er||M.current.pointerId!==null||M.current.amount>0||et.weights[T.current.flow]<1||Math.abs(T.current.scale-_)>.001?I.interactive:f<se?I.settling:Xe<.25?I.partial:I.ambient},Ae=(f=tt)=>{const r=Math.max(1,u.size[0]),x=Math.max(1,u.size[1]),v=mt([P.clientWidth,P.clientHeight],f);p.sceneTarget.resize([r,x]),p.bloomTarget.resize(v),p.bloomScratchTarget.resize(v),p.blurParamsX.set({direction:[1/v[0],0,0,0]}),p.blurParamsY.set({direction:[0,1/v[1],0,0]}),p.postParams.set({viewport:[r,x,1/r,1/x],bloomInfo:[1/v[0],1/v[1],.2,.12]})},Fr=()=>{Yt();const f=gr(n,P),r=[Math.max(1,Math.round(P.clientWidth*f)),Math.max(1,Math.round(P.clientHeight*f))];(r[0]!==u.size[0]||r[1]!==u.size[1])&&u.resize(r),Ae()};Ge=u.onResize(()=>{Ae(),ae=!0,L()}),De=new ResizeObserver(()=>{Fr(),L()}),De.observe(P);const rr=(f,r,x)=>{const v=Math.max(0,Math.min(ct.length-1,f));v!==B&&(B=v,U=0,rt=r,ot=r,x===I.interactive||x===I.settling?Ce=!0:(tt=B,Ce=!1,Ae()))},Nr=f=>{const r=T.current,x=r.paused||G.matches||r.speed<=1e-4,v=ke||!Ke?0:Math.min(.05,Math.max(0,(it-Ke)/1e3));if(ke=!1,Ke=it,Kt=r.signature,ae=!1,x||(Jt+=v*r.speed*.34,Zt+=v),x?_=r.scale:_+=(r.scale-_)*(1-Math.exp(-v*12)),dr(Ze,r.composition,v,r.transitionDuration,x),fe=Ze.weights,er=fe[r.composition]!==1,!x){const m=u.size[0]/Math.max(u.size[1],1);Je=(Je+v*r.speed*.34/Yr(m,fe))%1}const S=F.current;dr(et,r.flow,v,r.transitionDuration,x),$r(M.current,v,x||!r.holdToGather||r.interaction===E.none),r.interaction===E.none?(S.active=0,S.presence=0,ee(S)):x?(S.position=[...S.raw],S.presence=S.active,ee(S)):S.initialized&&Gr(S,v),jr($.current,v,x||r.interaction===E.none);const z=ct[B],ue=Math.max(700,Math.round(n.count*r.detailCount*z.countScale)),Ie=Math.pow(1/z.countScale,.2),ve=.0125*r.shardSize*Ie,Q=u.size[0]/Math.max(u.size[1],1),Fe=r.interaction===E.none?0:S.presence,D=(S.position[0]-.5)*.38*Fe,he=(S.position[1]-.5)*-.24*Fe,Ne=-.38+D,K=.58+he,me=Math.hypot(Ne,K,1),lt=r.interaction===E.attract?1:-1,ge=r.interaction===E.none?0:S.presence*r.interactionStrength*lt*(1-M.current.amount),W=(S.position[0]*2-1)*Q/_,J=(1-S.position[1]*2)/_,we=1/_,Oe=$.current.map(m=>[(m.origin[0]*2-1)*Q*we,(1-m.origin[1]*2)*we,m.age,m.strength*r.interactionStrength*r.rippleIntensity*we]);p.viewParams.set({viewport:[Q,ve,_,Jt],shape:[r.spread,r.depth,r.turbulence,he],effects:[r.spin,r.edgeSoftness,r.stretch,r.exposure],composition:fe,transport:[Je,Math.min(1,(1-Math.max(...fe))*12),0,0],formation:et.weights,gather:[W,J,M.current.amount,M.current.phase],pointer:[W,J,r.interactionRadius*2*we,ge*we],shock:Oe[0],shockB:Oe[1],shockC:Oe[2],shockD:Oe[3],material:[r.roughness,r.material,r.brightness,r.glow],light:[Ne/me,K/me,1/me,D],environment:[r.lightSurface,0,0,0],baseColor:r.shard,highlightColor:r.highlight,accentColor:r.accent}),p.postParams.set({finishing:[r.bloom,r.grain,r.chromaticAberration,r.lightSurface],background:r.background,tint:vt(r.shard,r.accent,.4),temporal:[Zt,0,0,0]}),to(p,r,u.size,[P.clientWidth,P.clientHeight]),r.effect!==A.none||r.bloom>1e-4||r.grain>1e-4||r.chromaticAberration>1e-6?(f.pass({target:p.sceneTarget,clear:r.background},m=>{m.draw(p.shardDraw,{instances:ue})}),r.effect===A.ascii&&f.pass({target:p.asciiTarget,clear:[0,0,0,0]},m=>{m.draw(p.asciiEffect)}),r.effect!==A.none&&f.pass({target:p.styleTarget,clear:r.background},m=>{m.draw(p.styleEffect)}),r.bloom>1e-4&&(f.pass({target:p.bloomTarget,clear:[0,0,0,1]},m=>{m.draw(p.bloomEffect)}),f.pass({target:p.bloomScratchTarget,clear:[0,0,0,1]},m=>{m.draw(p.bloomBlurX)}),f.pass({target:p.bloomTarget,clear:[0,0,0,1]},m=>{m.draw(p.bloomBlurY)})),f.pass({target:u,clear:r.background},m=>{m.draw(p.finishEffect)})):f.pass({target:u,clear:r.background},m=>{m.draw(p.shardDraw,{instances:ue})}),Le&&(Le=!1,requestAnimationFrame(()=>{q||Mt(!0)}))},Re=()=>{q||ie||O||!Y||document.hidden||(O=requestAnimationFrame(Or))},or=f=>{if(q||ie||R||O||!Y||document.hidden)return;const r=Math.max(0,f-performance.now()-10);R=window.setTimeout(()=>{R=0,Re()},r)},Or=f=>{if(O=0,q||ie||!Y||document.hidden)return;if(at){const W=f-at;if(W>3&&W<35){de[st]=W,st=(st+1)%de.length,nt=Math.min(nt+1,de.length),pe=de[0];for(let J=1;J<nt;J+=1)pe=Math.min(pe,de[J])}}at=f;const r=T.current,x=r.signature!==Kt,v=r.paused||G.matches||r.speed<=1e-4;if(v&&!Le&&!x&&!ae)return;const S=Le||x||!le,z=tr(performance.now()),ue=fr(z,pe),Ie=le+ue,ve=ce?Math.min(ce,Ie):Ie;if(!S&&f<ve-.5){z.continuous?Re():or(ve);return}Ce&&z!==I.interactive&&z!==I.settling&&(tt=B,Ce=!1,Ae());const Q=le?f-le:1/0;it=f;const Fe=performance.now();try{_r(N,Nr)}catch(W){Qe(W);return}le=f;const D=performance.now(),he=D-Fe;Ee=Ee?Ee*.9+he*.1:he;const Ne=Number.isFinite(Q)&&Q>ue*1.65,K=Ee>4||Ne;K?U||(U=D):U=0,(K||z!==I.ambient)&&(rt=D);const me=U>0&&D-U>1800,lt=D-ot>2200;B<ct.length-1&&lt&&me?rr(B+1,D,z):B>0&&z===I.ambient&&!K&&D-rt>15e3&&D-ot>15e3&&rr(B-1,D,z);const ge=tr(performance.now());ce=Vr(f,ve,fr(ge,pe),S||ge.continuous!==z.continuous),!v&&(ge.continuous?Re():or(ce))};L=()=>{ae=!0,O||(ce=0),R&&(window.clearTimeout(R),R=0),Re()},Ve.current=L,L()}catch(s){Qe(s)}})(),()=>{q=!0,window.removeEventListener("pointermove",jt),window.removeEventListener("pointerdown",Xt),window.removeEventListener("pointerup",Ut),window.removeEventListener("pointercancel",j),window.removeEventListener("blur",j),window.removeEventListener("scroll",Qt,!0),document.removeEventListener("visibilitychange",X),window.removeEventListener("focus",X),G.removeEventListener("change",X),ze?.disconnect(),De?.disconnect(),Ge?.(),je?.(),O&&cancelAnimationFrame(O),R&&window.clearTimeout(R),Ve.current=()=>{},N?.dispose()}},[]),ir.jsx("div",{ref:yt,className:`aero-shards ${Dr}`,"data-ready":kr,style:{backgroundColor:e},"aria-hidden":"true",children:ir.jsx("canvas",{ref:St,className:"aero-shards__canvas"})})}export{no as default};
