import{r as R,j as ue}from"../text-animations-Covp24vw.js";const Ae=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,_e=`#version 300 es
precision highp float;
uniform vec2 uView;
uniform vec2 uScale;
uniform float uZoom;
uniform vec2 uTurn;
uniform float uTime;
uniform float uFlow;
uniform float uWarp;
uniform vec3 uSeed;
uniform vec4 uPointer;
uniform vec2 uDrag;
uniform float uUnfold;
uniform float uDither;
out vec4 outColor;

vec4 sigmoid(vec4 x) {
  return 1.0 / (1.0 + exp(-x));
}

vec4 cppn(vec2 coordinate, vec3 latent) {
  vec4 buf[8];
  buf[6]=vec4(coordinate.x,coordinate.y,latent.x,latent.y);
  buf[7]=vec4(latent.z,sqrt(coordinate.x*coordinate.x+coordinate.y*coordinate.y),0.,0.);
  buf[0]=mat4(vec4(6.5404263,-3.6126034,0.7590882,-1.13613),vec4(2.4582713,3.1660357,1.2219609,0.06276096),vec4(-5.478085,-6.159632,1.8701609,-4.7742867),vec4(6.039214,-5.542865,-0.90925294,3.251348))*buf[6]+mat4(vec4(0.8473259,-5.722911,3.975766,1.6522468),vec4(-0.24321538,0.5839259,-1.7661959,-5.350116),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.))*buf[7]+vec4(0.21808943,1.1243913,-1.7969975,5.0294676);
  buf[1]=mat4(vec4(-3.3522482,-6.0612736,0.55641043,-4.4719114),vec4(0.8631464,1.7432913,5.643898,1.6106541),vec4(2.4941394,-3.5012043,1.7184316,6.357333),vec4(3.310376,8.209261,1.1355612,-1.165539))*buf[6]+mat4(vec4(5.24046,-13.034365,0.009859298,15.870829),vec4(2.987511,3.129433,-0.89023495,-1.6822904),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.))*buf[7]+vec4(-5.9457836,-6.573602,-0.8812491,1.5436668);
  buf[0]=sigmoid(buf[0]);buf[1]=sigmoid(buf[1]);
  buf[2]=mat4(vec4(-15.219568,8.095543,-2.429353,-1.9381982),vec4(-5.951362,4.3115187,2.6393783,1.274315),vec4(-7.3145227,6.7297835,5.2473326,5.9411426),vec4(5.0796127,8.979051,-1.7278991,-1.158976))*buf[6]+mat4(vec4(-11.967154,-11.608155,6.1486754,11.237008),vec4(2.124141,-6.263192,-1.7050359,-0.7021966),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.))*buf[7]+vec4(-4.17164,-3.2281182,-4.576417,-3.6401186);
  buf[3]=mat4(vec4(3.1832156,-13.738922,1.879223,3.233465),vec4(0.64300746,12.768129,1.9141049,0.50990224),vec4(-0.049295485,4.4807224,1.4733979,1.801449),vec4(5.0039253,13.000481,3.3991797,-4.5561905))*buf[6]+mat4(vec4(-0.1285731,7.720628,-3.1425676,4.742367),vec4(0.6393625,3.714393,-0.8108378,-0.39174938),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.))*buf[7]+vec4(-1.1811101,-21.621881,0.7851888,1.2329718);
  buf[2]=sigmoid(buf[2]);buf[3]=sigmoid(buf[3]);
  buf[4]=mat4(vec4(5.214916,-7.183024,2.7228765,2.6592617),vec4(-5.601878,-25.3591,4.067988,0.4602802),vec4(-10.57759,24.286327,21.102104,37.546658),vec4(4.3024497,-1.9625226,2.3458803,-1.372816))*buf[0]+mat4(vec4(-17.6526,-10.507558,2.2587414,12.462782),vec4(6.265566,-502.75443,-12.642513,0.9112289),vec4(-10.983244,20.741234,-9.701768,-0.7635988),vec4(5.383626,1.4819539,-4.1911616,-4.8444734))*buf[1]+mat4(vec4(12.785233,-16.345072,-0.39901125,1.7955981),vec4(-30.48365,-1.8345358,1.4542528,-1.1118771),vec4(19.872723,-7.337935,-42.941723,-98.52709),vec4(8.337645,-2.7312303,-2.2927687,-36.142323))*buf[2]+mat4(vec4(-16.298317,3.5471997,-0.44300047,-9.444417),vec4(57.5077,-35.609753,16.163465,-4.1534753),vec4(-0.07470326,-3.8656476,-7.0901804,3.1523974),vec4(-12.559385,-7.077619,1.490437,-0.8211543))*buf[3]+vec4(-7.67914,15.927437,1.3207729,-1.6686112);
  buf[5]=mat4(vec4(-1.4109162,-0.372762,-3.770383,-21.367174),vec4(-6.2103205,-9.35908,0.92529047,8.82561),vec4(11.460242,-22.348068,13.625772,-18.693201),vec4(-0.3429052,-3.9905605,-2.4626114,-0.45033523))*buf[0]+mat4(vec4(7.3481627,-4.3661838,-6.3037653,-3.868115),vec4(1.5462853,6.5488915,1.9701879,-0.58291394),vec4(6.5858274,-2.2180402,3.7127688,-1.3730392),vec4(-5.7973905,10.134961,-2.3395722,-5.965605))*buf[1]+mat4(vec4(-2.5132585,-6.6685553,-1.4029363,-0.16285264),vec4(-0.37908727,0.53738135,4.389061,-1.3024765),vec4(-0.70647055,2.0111287,-5.1659346,-3.728635),vec4(-13.562562,10.487719,-0.9173751,-2.6487076))*buf[2]+mat4(vec4(-8.645013,6.5546675,-6.3944063,-5.5933375),vec4(-0.57783127,-1.077275,36.91025,5.736769),vec4(14.283112,3.7146652,7.1452246,-4.5958776),vec4(2.7192075,3.6021907,-4.366337,-2.3653464))*buf[3]+vec4(-5.9000807,-4.329569,1.2427121,8.59503);
  buf[4]=sigmoid(buf[4]);buf[5]=sigmoid(buf[5]);
  buf[6]=mat4(vec4(-1.61102,0.7970257,1.4675229,0.20917463),vec4(-28.793737,-7.1390953,1.5025433,4.656581),vec4(-10.94861,39.66238,0.74318546,-10.095605),vec4(-0.7229728,-1.5483948,0.7301322,2.1687684))*buf[0]+mat4(vec4(3.2547753,21.489103,-1.0194173,-3.3100595),vec4(-3.7316632,-3.3792162,-7.223193,-0.23685838),vec4(13.1804495,0.7916005,5.338587,5.687114),vec4(-4.167605,-17.798311,-6.815736,-1.6451967))*buf[1]+mat4(vec4(0.604885,-7.800309,-7.213122,-2.741014),vec4(-3.522382,-0.12359311,-0.5258442,0.43852118),vec4(9.6752825,-22.853785,2.062431,0.099892326),vec4(-4.3196306,-17.730087,2.5184598,5.30267))*buf[2]+mat4(vec4(-6.545563,-15.790176,-6.0438633,-5.415399),vec4(-43.591583,28.551912,-16.00161,18.84728),vec4(4.212382,8.394307,3.0958717,8.657522),vec4(-5.0237565,-4.450633,-4.4768,-5.5010443))*buf[3]+mat4(vec4(1.6985557,-67.05806,6.897715,1.9004834),vec4(1.8680354,2.3915145,2.5231109,4.081538),vec4(11.158006,1.7294737,2.0738268,7.386411),vec4(-4.256034,-306.24686,8.258898,-17.132736))*buf[4]+mat4(vec4(1.6889864,-4.5852966,3.8534803,-6.3482175),vec4(1.3543309,-1.2640043,9.932754,2.9079645),vec4(-5.2770967,0.07150358,-0.13962056,3.3269649),vec4(28.34703,-4.918278,6.1044083,4.085355))*buf[5]+vec4(6.6818056,12.522166,-3.7075126,-4.104386);
  buf[7]=mat4(vec4(-8.265602,-4.7027016,5.098234,0.7509808),vec4(8.6507845,-17.15949,16.51939,-8.884479),vec4(-4.036479,-2.3946867,-2.6055532,-1.9866527),vec4(-2.2167742,-1.8135649,-5.9759874,4.8846445))*buf[0]+mat4(vec4(6.7790847,3.5076547,-2.8191125,-2.7028968),vec4(-5.743024,-0.27844876,1.4958696,-5.0517144),vec4(13.122226,15.735168,-2.9397483,-4.101023),vec4(-14.375265,-5.030483,-6.2599335,2.9848232))*buf[1]+mat4(vec4(4.0950394,-0.94011575,-5.674733,4.755022),vec4(4.3809423,4.8310084,1.7425908,-3.437416),vec4(2.117492,0.16342592,-104.56341,16.949184),vec4(-5.22543,-2.994248,3.8350096,-1.9364246))*buf[2]+mat4(vec4(-5.900337,1.7946124,-13.604192,-3.8060522),vec4(6.6583457,31.911177,25.164474,91.81147),vec4(11.840538,4.1503043,-0.7314397,6.768467),vec4(-6.3967767,4.034772,6.1714606,-0.32874924))*buf[3]+mat4(vec4(3.4992442,-196.91893,-8.923708,2.8142626),vec4(3.4806502,-3.1846354,5.1725626,5.1804223),vec4(-2.4009497,15.585794,1.2863957,2.0252278),vec4(-71.25271,-62.441242,-8.138444,0.50670296))*buf[4]+mat4(vec4(-12.291733,-11.176166,-7.3474145,4.390294),vec4(10.805477,5.6337385,-0.9385842,-4.7348723),vec4(-12.869276,-7.039391,5.3029537,7.5436664),vec4(1.4593618,8.91898,3.5101583,5.840625))*buf[5]+vec4(2.2415268,-6.705987,-0.98861027,-2.117676);
  buf[6]=sigmoid(buf[6]);buf[7]=sigmoid(buf[7]);
  buf[0]=mat4(vec4(1.6794263,1.3817469,2.9625452,0.),vec4(-1.8834411,-1.4806935,-3.5924516,0.),vec4(-1.3279216,-1.0918057,-2.3124623,0.),vec4(0.2662234,0.23235129,0.44178495,0.))*buf[0]+mat4(vec4(-0.6299101,-0.5945583,-0.9125601,0.),vec4(0.17828953,0.18300213,0.18182953,0.),vec4(-2.96544,-2.5819945,-4.9001055,0.),vec4(1.4195864,1.1868085,2.5176322,0.))*buf[1]+mat4(vec4(-1.2584374,-1.0552157,-2.1688404,0.),vec4(-0.7200217,-0.52666044,-1.438251,0.),vec4(0.15345335,0.15196142,0.272854,0.),vec4(0.945728,0.8861938,1.2766753,0.))*buf[2]+mat4(vec4(-2.4218085,-1.968602,-4.35166,0.),vec4(-22.683098,-18.0544,-41.954372,0.),vec4(0.63792,0.5470648,1.1078634,0.),vec4(-1.5489894,-1.3075932,-2.6444845,0.))*buf[3]+mat4(vec4(-0.49252132,-0.39877754,-0.91366625,0.),vec4(0.95609266,0.7923952,1.640221,0.),vec4(0.30616966,0.15693925,0.8639857,0.),vec4(1.1825981,0.94504964,2.176963,0.))*buf[4]+mat4(vec4(0.35446745,0.3293795,0.59547555,0.),vec4(-0.58784515,-0.48177817,-1.0614829,0.),vec4(2.5271258,1.9991658,4.6846647,0.),vec4(0.13042648,0.08864098,0.30187556,0.))*buf[5]+mat4(vec4(-1.7718065,-1.4033192,-3.3355875,0.),vec4(3.1664357,2.638297,5.378702,0.),vec4(-3.1724713,-2.6107926,-5.549295,0.),vec4(-2.851368,-2.249092,-5.3013067,0.))*buf[6]+mat4(vec4(1.5203838,1.2212278,2.8404984,0.),vec4(1.5210563,1.2651345,2.683903,0.),vec4(2.9789467,2.4364579,5.2347264,0.),vec4(2.2270417,1.8825914,3.8028636,0.))*buf[7]+vec4(-1.5468478,-3.6171484,0.24762098,0.);
  buf[0]=sigmoid(buf[0]);
  return vec4(buf[0].x,buf[0].y,buf[0].z,1.);
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

mat2 rotate(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, s, -s, c);
}

void main() {
  vec2 css = gl_FragCoord.xy * uScale;
  vec2 uv = (css * 2.0 - uView) / uView.y;
  uv.y = -uv.y;
  vec2 anchor = vec2(uView.x / uView.y, -1.0);

  vec2 pointer = vec2(uPointer.x * 2.0 - uView.x, uPointer.y * 2.0 - uView.y) / uView.y;
  vec2 offset = uv - pointer;
  float touch = uPointer.z * exp(-dot(offset, offset) / (uPointer.w * uPointer.w));
  uv = pointer + rotate(touch * 0.6) * offset;
  uv -= uDrag * touch;

  float t = uTime;
  uv = rotate(0.06 * uFlow * sin(t * 0.17)) * uv;
  uv += 0.05 * uFlow * vec2(sin(t * 0.21), cos(t * 0.13));
  uv = anchor + mat2(uTurn.x, uTurn.y, -uTurn.y, uTurn.x) * uv * 2.0 / uZoom;
  uv += uWarp * vec2(sin(uv.y * 6.283 + t * 0.5), cos(uv.x * 6.283 + t * 0.5)) * 0.05;

  vec3 latent = uSeed + 0.1 * uFlow * vec3(sin(0.3 * t), sin(0.69 * t), sin(0.44 * t));
  latent += touch * vec3(0.12, -0.1, 0.16);
  latent.z += uUnfold;

  vec3 veil = cppn(uv, latent).rgb;
  veil += (hash(gl_FragCoord.xy) - 0.5) * uDither;
  outColor = vec4(veil, 1.0);
}`,Pe=`#version 300 es
precision highp float;
uniform sampler2D uField;
uniform vec2 uResolution;
uniform vec2 uTexel;
uniform vec3 uColor;
uniform vec3 uInk;
uniform float uGain;
uniform float uSheen;
uniform float uGlow;
uniform float uPresence;
uniform float uGrain;
uniform float uFade;
uniform float uOpacity;
uniform float uTime;
uniform float uLightMode;
uniform vec4 uLight;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float smootherstep(float edge, float x) {
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float level(vec2 uv, float lod) {
  return textureLod(uField, uv, lod).b;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float base = clamp(level(uv, 0.0), 0.0, 1.0);
  float glow = 0.0;
  glow += level(uv, 2.0) * 0.4;
  glow += level(uv, 3.0) * 0.3;
  glow += level(uv, 4.0) * 0.2;
  glow += level(uv, 5.0) * 0.1;

  float dx = level(uv + vec2(uTexel.x, 0.0), 0.0) - level(uv - vec2(uTexel.x, 0.0), 0.0);
  float dy = level(uv + vec2(0.0, uTexel.y), 0.0) - level(uv - vec2(0.0, uTexel.y), 0.0);
  vec2 slope = vec2(dx / (2.0 * uTexel.x) * (uResolution.y / uResolution.x), dy / (2.0 * uTexel.y));
  vec3 normal = normalize(vec3(-slope * 0.12, 1.0));
  vec2 pixel = gl_FragCoord.xy / uResolution.y;
  vec3 toLight = normalize(vec3(uLight.xy - pixel, 0.7));
  vec3 halfway = normalize(toLight + vec3(0.0, 0.0, 1.0));
  float facing = max(dot(normal, halfway), 0.0);
  float sheen = pow(facing, 40.0) * smoothstep(0.08, 0.7, base);
  float near = uLight.z * exp(-dot(uLight.xy - pixel, uLight.xy - pixel) / 0.2);

  float energy = pow(base, 2.2) * uGain * (1.0 + near * 0.4);
  energy += pow(glow, 2.2) * uGlow * uGain;
  energy *= uPresence;
  vec3 light = uColor * energy;
  light += uColor * energy * energy * 0.35;
  vec3 gleam = mix(uColor * 2.0, vec3(1.0), 0.55);
  light += gleam * sheen * uSheen * (0.8 + near * 0.4) * uPresence;

  float edge = uFade * 0.5;
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);
  mask *= uOpacity;
  float grain = (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;
  float dither = (hash(gl_FragCoord.yx + 31.7) - 0.5) / 255.0;

  float peak = max(light.r, max(light.g, light.b));
  if (uLightMode > 0.5) {
    float cover = 1.0 - exp(-peak * 1.6);
    vec3 ink = mix(uInk, uInk * 0.82, smoothstep(0.5, 1.0, cover));
    ink = mix(ink, vec3(1.0), clamp(sheen * uSheen * 1.5, 0.0, 1.0) * 0.8);
    float alpha = clamp(cover * 0.85 * (1.0 + grain) + dither, 0.0, 1.0) * mask;
    outColor = vec4(ink * alpha, alpha);
  } else {
    vec3 color = 1.0 - exp(-light);
    color = pow(color, vec3(1.0 / 2.2));
    color = clamp(color + grain * peak + dither, 0.0, 1.0) * mask;
    outColor = vec4(color, max(color.r, max(color.g, color.b)));
  }
}`,Se=1.8,fe=9e5,P=(r,m,s)=>Math.min(s,Math.max(m,r)),Le=r=>{const m=Number(r)||0;if(!m)return[0,0,0];const s=l=>{const u=Math.sin(m*12.9898+l*78.233)*43758.5453;return u-Math.floor(u)-.5};return[s(1),s(2),s(3)]},ve=(r,m,s)=>{const l=r.createShader(m);return l?(r.shaderSource(l,s),r.compileShader(l),r.getShaderParameter(l,r.COMPILE_STATUS)?l:(r.deleteShader(l),null)):null},le=(r,m)=>{const s=ve(r,r.VERTEX_SHADER,Ae),l=ve(r,r.FRAGMENT_SHADER,m),u=r.createProgram();if(!s||!l||!u)return null;if(r.attachShader(u,s),r.attachShader(u,l),r.bindAttribLocation(u,0,"aPosition"),r.linkProgram(u),r.deleteShader(s),r.deleteShader(l),!r.getProgramParameter(u,r.LINK_STATUS))return r.deleteProgram(u),null;const S={},G=r.getProgramParameter(u,r.ACTIVE_UNIFORMS);for(let F=0;F<G;F++){const A=r.getActiveUniform(u,F);A&&(S[A.name]=r.getUniformLocation(u,A.name))}return{program:u,uniforms:S}},De=({color:r="#6b12ff",speed:m=.5,scale:s=1,rotation:l=0,flow:u=1,warp:S=0,variation:G=0,brightness:F=1,sheen:A=0,glow:se=.4,grain:me=.03,quality:he=.5,mouseInteraction:de=!0,mouseStrength:ge=1,intro:xe=!0,fade:be=0,opacity:pe=1,lightMode:ye=!1,paused:Ee=!1,dpr:Te,className:H="",...we})=>{const j=R.useRef(null),Z=R.useRef(null),V=R.useRef(null),Q={color:String(r),speed:m,scale:Math.max(.1,s),rotation:l,flow:Math.max(0,u),warp:Math.max(0,S),variation:G,brightness:Math.max(0,F),sheen:Math.max(0,A),glow:Math.max(0,se),grain:Math.max(0,me),quality:P(he,.25,1),mouseInteraction:de,mouseStrength:Math.max(0,ge),intro:xe,fade:P(be,0,1),opacity:P(pe,0,1),lightMode:ye,paused:Ee,dpr:Te},g=R.useRef(Q);return g.current=Q,R.useEffect(()=>{const y=j.current,x=Z.current,e=x?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!y||!x||!e)return;const $=!!e.getExtension("EXT_color_buffer_float"),L=le(e,_e),X=le(e,Pe);if(!L||!X)return;const K=e.createBuffer(),O=e.createVertexArray();e.bindVertexArray(O),e.bindBuffer(e.ARRAY_BUFFER,K),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const _=e.createTexture(),Y=e.createFramebuffer(),h={width:0,height:0},Me=(o,c)=>{if(h.width===o&&h.height===c)return;h.width=o,h.height=c,e.bindTexture(e.TEXTURE_2D,_);const a=Math.floor(Math.log2(Math.max(o,c)))+1;e.texStorage2D(e.TEXTURE_2D,a,$?e.RGBA16F:e.RGBA8,o,c),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindFramebuffer(e.FRAMEBUFFER,Y),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,_,0)},E=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),D=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,B=new Map,Re=o=>{if(B.has(o))return B.get(o);let c=[1,1,1];if(E){E.clearRect(0,0,1,1),E.fillStyle="#ffffff",E.fillStyle=o,E.fillRect(0,0,1,1);const[a,d,v]=E.getImageData(0,0,1,1).data;c=[a,d,v].map(M=>Math.pow(M/255,2.2))}return B.set(o,c),c},f={width:1,height:1,fieldWidth:1,fieldHeight:1},n={x:0,y:0,inside:!1},t={clock:0,intro:g.current.intro&&!D?0:1,touch:0,x:0,y:0,dragX:0,dragY:0,lightX:.5,lightY:.15};let b=0,T=0,C=!0;const N=()=>{const o=g.current,c=t.intro*t.intro*t.intro*(t.intro*(t.intro*6-15)+10);e.bindVertexArray(O),Me(f.fieldWidth,f.fieldHeight);const a=L.uniforms;e.bindFramebuffer(e.FRAMEBUFFER,Y),e.viewport(0,0,h.width,h.height),e.useProgram(L.program);const d=o.rotation*Math.PI/180,[v,M,W]=Le(o.variation);e.uniform2f(a.uView,f.width,f.height),e.uniform2f(a.uScale,f.width/h.width,f.height/h.height),e.uniform1f(a.uZoom,o.scale),e.uniform2f(a.uTurn,Math.cos(d),Math.sin(d)),e.uniform1f(a.uTime,t.clock),e.uniform1f(a.uFlow,o.flow),e.uniform1f(a.uWarp,o.warp),e.uniform3f(a.uSeed,.3948333106474662+v,.36+M,.14+W),e.uniform4f(a.uPointer,t.x,t.y,t.touch*o.mouseStrength*.9,.42),e.uniform2f(a.uDrag,t.dragX*2/f.height,t.dragY*2/f.height),e.uniform1f(a.uUnfold,(1-c)*.45),e.uniform1f(a.uDither,$?0:1/255),e.drawArrays(e.TRIANGLES,0,3),e.bindTexture(e.TEXTURE_2D,_),e.generateMipmap(e.TEXTURE_2D);const i=X.uniforms,p=Re(o.color),q=.2126*p[0]+.7152*p[1]+.0722*p[2],U=Math.min(1,.2/Math.max(q,.001)),I=p.map(k=>Math.pow(Math.min(1,k*U),1/2.2));e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,x.width,x.height),e.useProgram(X.program),e.uniform2f(i.uResolution,x.width,x.height),e.uniform2f(i.uTexel,1/h.width,1/h.height),e.uniform3fv(i.uColor,p),e.uniform3fv(i.uInk,I),e.uniform1f(i.uGain,1.15*o.brightness),e.uniform1f(i.uSheen,.5*o.sheen),e.uniform1f(i.uGlow,o.glow),e.uniform1f(i.uPresence,c),e.uniform1f(i.uGrain,o.grain),e.uniform1f(i.uFade,o.fade),e.uniform1f(i.uOpacity,o.opacity),e.uniform1f(i.uTime,t.clock%1e3),e.uniform1f(i.uLightMode,o.lightMode?1:0),e.uniform4f(i.uLight,t.lightX*f.width/f.height,1-t.lightY,t.touch*o.mouseStrength,0),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,_),e.uniform1i(i.uField,0),e.drawArrays(e.TRIANGLES,0,3)},J=o=>{if(b=0,!C||document.hidden)return;const c=g.current,a=T?Math.min(.05,(o-T)/1e3):1/60;T=o;const d=!c.paused&&!D;d&&(t.clock+=a*c.speed),!c.intro||D?t.intro=1:t.intro<1&&(t.intro=Math.min(1,t.intro+a/Se));const v=c.mouseInteraction&&n.inside&&!D;v&&t.touch<.01&&(t.x=n.x,t.y=n.y);const M=1-Math.exp(-a*9),W=t.x,i=t.y;t.x+=(n.x-t.x)*M,t.y+=(n.y-t.y)*M;const p=(t.x-W)/Math.max(a,.001),q=(t.y-i)/Math.max(a,.001),U=1-Math.exp(-a*5);t.dragX+=(P(p*.12,-120,120)-t.dragX)*U,t.dragY+=(P(-q*.12,-120,120)-t.dragY)*U,t.touch+=((v?1:0)-t.touch)*(1-Math.exp(-a*(v?3:1.6)));const I=v?n.x/f.width:.5,k=v?n.y/f.height:.15,ie=1-Math.exp(-a*4);t.lightX+=(I-t.lightX)*ie,t.lightY+=(k-t.lightY)*ie,N();const Fe=t.intro<1||Math.abs((v?1:0)-t.touch)>.002||Math.abs(t.dragX)+Math.abs(t.dragY)>.05||Math.abs(n.x-t.x)+Math.abs(n.y-t.y)>.3||Math.abs(I-t.lightX)+Math.abs(k-t.lightY)>5e-4;d||Fe?b=requestAnimationFrame(J):T=0},w=()=>{!b&&C&&!document.hidden&&(b=requestAnimationFrame(J))},z=()=>{const o=g.current,c=Math.max(1,y.clientWidth),a=Math.max(1,y.clientHeight),d=Math.min(o.dpr||window.devicePixelRatio||1,2);f.width=c,f.height=a,x.width=Math.max(1,Math.round(c*d)),x.height=Math.max(1,Math.round(a*d));let v=o.quality;c*a*v*v>fe&&(v=Math.sqrt(fe/(c*a))),f.fieldWidth=Math.max(1,Math.round(c*v)),f.fieldHeight=Math.max(1,Math.round(a*v)),b||N(),w()},ee=o=>{const c=y.getBoundingClientRect();n.x=o.clientX-c.left,n.y=o.clientY-c.top,n.inside=n.x>=0&&n.y>=0&&n.x<=c.width&&n.y<=c.height,w()},te=()=>{n.inside=!1,w()},oe=()=>{T=0,w()},re=new ResizeObserver(z);re.observe(y);const ae=new IntersectionObserver(o=>{C=o.some(c=>c.isIntersecting),C&&(T=0,w())});ae.observe(y),window.addEventListener("pointermove",ee,{passive:!0}),document.documentElement.addEventListener("pointerleave",te),document.addEventListener("visibilitychange",oe),z();let ce=g.current.quality,ne=g.current.dpr;return V.current=()=>{const o=g.current;if(o.quality!==ce||o.dpr!==ne){ce=o.quality,ne=o.dpr,z();return}b||N(),w()},()=>{cancelAnimationFrame(b),V.current=null,re.disconnect(),ae.disconnect(),window.removeEventListener("pointermove",ee),document.documentElement.removeEventListener("pointerleave",te),document.removeEventListener("visibilitychange",oe),e.deleteTexture(_),e.deleteFramebuffer(Y),e.deleteProgram(L.program),e.deleteProgram(X.program),e.deleteBuffer(K),e.deleteVertexArray(O),e.getExtension("WEBGL_lose_context")?.loseContext()}},[]),R.useEffect(()=>{V.current?.()}),ue.jsx("div",{ref:j,className:`dark-veil-container${H?` ${H}`:""}`,...we,children:ue.jsx("canvas",{ref:Z,className:"dark-veil-canvas","aria-hidden":"true"})})};export{De as DarkVeil,De as default};
