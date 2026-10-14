import{r as H,j as ze}from"../text-animations-CYFpTz0Y.js";import{U as W,V as D,b as F,Q as se,X as We,Y as Xe,_ as qe,z as X,$ as k,a0 as j,a1 as Ae,L as ye,a2 as we,S as ae,O as Be,M as De,C as Pe,e as Q,a3 as Y,a as J,a4 as Ke,J as Ie,a5 as S,a6 as $e,k as Qe,a7 as Fe,a8 as ce,a9 as Ye,w as je,x as Te,W as Je,aa as Ze,P as et,c as tt}from"./three.module-DU3sk976.js";var st=(()=>{const e=new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),t=new Float32Array([0,0,2,0,0,2]),s=new je;return s.setAttribute("position",new Te(e,3)),s.setAttribute("uv",new Te(t,2)),s})(),O=class oe{static get fullscreenGeometry(){return st}constructor(t="Pass",s=new ae,r=new Be){this.name=t,this.renderer=null,this.scene=s,this.camera=r,this.screen=null,this.rtt=!0,this.needsSwap=!0,this.needsDepthBlit=!1,this.needsDepthTexture=!1,this.enabled=!0}get renderToScreen(){return!this.rtt}set renderToScreen(t){if(this.rtt===t){const s=this.fullscreenMaterial;s!==null&&(s.needsUpdate=!0),this.rtt=!t}}set mainScene(t){}set mainCamera(t){}setRenderer(t){this.renderer=t}isEnabled(){return this.enabled}setEnabled(t){this.enabled=t}get fullscreenMaterial(){return this.screen!==null?this.screen.material:null}set fullscreenMaterial(t){let s=this.screen;s!==null?s.material=t:(s=new De(oe.fullscreenGeometry,t),s.frustumCulled=!1,this.scene===null&&(this.scene=new ae),this.scene.add(s),this.screen=s)}getFullscreenMaterial(){return this.fullscreenMaterial}setFullscreenMaterial(t){this.fullscreenMaterial=t}getDepthTexture(){return null}setDepthTexture(t,s=j){}render(t,s,r,i,a){throw new Error("Render method not implemented!")}setSize(t,s){}initialize(t,s,r){}dispose(){for(const t of Object.keys(this)){const s=this[t];(s instanceof X||s instanceof Fe||s instanceof ce||s instanceof oe)&&this[t].dispose()}this.fullscreenMaterial!==null&&this.fullscreenMaterial.dispose()}},rt=class extends O{constructor(){super("ClearMaskPass",null,null),this.needsSwap=!1}render(e,t,s,r,i){const a=e.state.buffers.stencil;a.setLocked(!1),a.setTest(!1)}},it=`#ifdef COLOR_WRITE
#include <common>
#include <dithering_pars_fragment>
#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#endif
#ifdef DEPTH_WRITE
#include <packing>
#ifdef GL_FRAGMENT_PRECISION_HIGH
uniform highp sampler2D depthBuffer;
#else
uniform mediump sampler2D depthBuffer;
#endif
float readDepth(const in vec2 uv){
#if DEPTH_PACKING == 3201
return unpackRGBAToDepth(texture2D(depthBuffer,uv));
#else
return texture2D(depthBuffer,uv).r;
#endif
}
#endif
#ifdef USE_WEIGHTS
uniform vec4 channelWeights;
#endif
uniform float opacity;varying vec2 vUv;void main(){
#ifdef COLOR_WRITE
vec4 texel=texture2D(inputBuffer,vUv);
#ifdef USE_WEIGHTS
texel*=channelWeights;
#endif
gl_FragColor=opacity*texel;
#ifdef COLOR_SPACE_CONVERSION
#include <colorspace_fragment>
#endif
#include <dithering_fragment>
#else
gl_FragColor=vec4(0.0);
#endif
#ifdef DEPTH_WRITE
gl_FragDepth=readDepth(vUv);
#endif
}`,nt="varying vec2 vUv;void main(){vUv=position.xy*0.5+0.5;gl_Position=vec4(position.xy,1.0,1.0);}",at=class extends J{constructor(){super({name:"CopyMaterial",defines:{COLOR_SPACE_CONVERSION:"1",DEPTH_PACKING:"0",COLOR_WRITE:"1"},uniforms:{inputBuffer:new S(null),depthBuffer:new S(null),channelWeights:new S(null),opacity:new S(1)},blending:Ie,toneMapped:!1,depthWrite:!1,depthTest:!1,fragmentShader:it,vertexShader:nt}),this.depthFunc=Ye}get inputBuffer(){return this.uniforms.inputBuffer.value}set inputBuffer(e){const t=e!==null;this.colorWrite!==t&&(t?this.defines.COLOR_WRITE=!0:delete this.defines.COLOR_WRITE,this.colorWrite=t,this.needsUpdate=!0),this.uniforms.inputBuffer.value=e}get depthBuffer(){return this.uniforms.depthBuffer.value}set depthBuffer(e){const t=e!==null;this.depthWrite!==t&&(t?this.defines.DEPTH_WRITE=!0:delete this.defines.DEPTH_WRITE,this.depthTest=t,this.depthWrite=t,this.needsUpdate=!0),this.uniforms.depthBuffer.value=e}set depthPacking(e){this.defines.DEPTH_PACKING=e.toFixed(0),this.needsUpdate=!0}get colorSpaceConversion(){return this.defines.COLOR_SPACE_CONVERSION!==void 0}set colorSpaceConversion(e){this.colorSpaceConversion!==e&&(e?this.defines.COLOR_SPACE_CONVERSION=!0:delete this.defines.COLOR_SPACE_CONVERSION,this.needsUpdate=!0)}get channelWeights(){return this.uniforms.channelWeights.value}set channelWeights(e){e!==null?(this.defines.USE_WEIGHTS="1",this.uniforms.channelWeights.value=e):delete this.defines.USE_WEIGHTS,this.needsUpdate=!0}setInputBuffer(e){this.uniforms.inputBuffer.value=e}getOpacity(e){return this.uniforms.opacity.value}setOpacity(e){this.uniforms.opacity.value=e}},ot=class extends O{constructor(e,t=!0){super("CopyPass"),this.fullscreenMaterial=new at,this.needsSwap=!1,this.renderTarget=e,e===void 0&&(this.renderTarget=new X(1,1,{minFilter:k,magFilter:k,stencilBuffer:!1,depthBuffer:!1}),this.renderTarget.texture.name="CopyPass.Target"),this.autoResize=t}get resize(){return this.autoResize}set resize(e){this.autoResize=e}get texture(){return this.renderTarget.texture}getTexture(){return this.renderTarget.texture}setAutoResizeEnabled(e){this.autoResize=e}render(e,t,s,r,i){this.fullscreenMaterial.inputBuffer=t.texture,e.setRenderTarget(this.renderToScreen?null:this.renderTarget),e.render(this.scene,this.camera)}setSize(e,t){this.autoResize&&this.renderTarget.setSize(e,t)}initialize(e,t,s){s!==void 0&&(this.renderTarget.texture.type=s,s!==W?this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH="1":e!==null&&e.outputColorSpace===F&&(this.renderTarget.texture.colorSpace=F))}},Re=new Pe,Ne=class extends O{constructor(e=!0,t=!0,s=!1){super("ClearPass",null,null),this.needsSwap=!1,this.color=e,this.depth=t,this.stencil=s,this.overrideClearColor=null,this.overrideClearAlpha=-1}setClearFlags(e,t,s){this.color=e,this.depth=t,this.stencil=s}getOverrideClearColor(){return this.overrideClearColor}setOverrideClearColor(e){this.overrideClearColor=e}getOverrideClearAlpha(){return this.overrideClearAlpha}setOverrideClearAlpha(e){this.overrideClearAlpha=e}render(e,t,s,r,i){const a=this.overrideClearColor,n=this.overrideClearAlpha,o=e.getClearAlpha(),d=a!==null,E=n>=0;d?(e.getClearColor(Re),e.setClearColor(a,E?n:o)):E&&e.setClearAlpha(n),e.setRenderTarget(this.renderToScreen?null:t),e.clear(this.color,this.depth,this.stencil),d?e.setClearColor(Re,o):E&&e.setClearAlpha(o)}},ct=class extends O{constructor(e,t){super("MaskPass",e,t),this.needsSwap=!1,this.clearPass=new Ne(!1,!1,!0),this.inverse=!1}set mainScene(e){this.scene=e}set mainCamera(e){this.camera=e}get inverted(){return this.inverse}set inverted(e){this.inverse=e}get clear(){return this.clearPass.enabled}set clear(e){this.clearPass.enabled=e}getClearPass(){return this.clearPass}isInverted(){return this.inverted}setInverted(e){this.inverted=e}render(e,t,s,r,i){const a=e.getContext(),n=e.state.buffers,o=this.scene,d=this.camera,E=this.clearPass,A=this.inverted?0:1,b=1-A;n.color.setMask(!1),n.depth.setMask(!1),n.color.setLocked(!0),n.depth.setLocked(!0),n.stencil.setTest(!0),n.stencil.setOp(a.REPLACE,a.REPLACE,a.REPLACE),n.stencil.setFunc(a.ALWAYS,A,4294967295),n.stencil.setClear(b),n.stencil.setLocked(!0),this.clearPass.enabled&&(this.renderToScreen?E.render(e,null):(E.render(e,t),E.render(e,s))),this.renderToScreen?(e.setRenderTarget(null),e.render(o,d)):(e.setRenderTarget(t),e.render(o,d),e.setRenderTarget(s),e.render(o,d)),n.color.setLocked(!1),n.depth.setLocked(!1),n.stencil.setLocked(!1),n.stencil.setFunc(a.EQUAL,1,4294967295),n.stencil.setOp(a.KEEP,a.KEEP,a.KEEP),n.stencil.setLocked(!0)}};function lt(e,t){const s=e.getContext();if(t<=0||typeof s.renderbufferStorageMultisample!="function")return 0;const r=s.getParameter(s.MAX_SAMPLES),i=Math.min(t,r);if(i<=0)return 0;const a=s.getParameter(s.RENDERBUFFER_BINDING),n=s.createRenderbuffer();try{return s.bindRenderbuffer(s.RENDERBUFFER,n),s.renderbufferStorageMultisample(s.RENDERBUFFER,i,s.RGBA8,1,1),i}catch{return 0}finally{s.bindRenderbuffer(s.RENDERBUFFER,a),s.deleteRenderbuffer(n)}}var re=1/1e3,ut=1e3,ft=class{constructor(){this.startTime=performance.now(),this.previousTime=0,this.currentTime=0,this._delta=0,this._elapsed=0,this._fixedDelta=1e3/60,this.timescale=1,this.useFixedDelta=!1,this._autoReset=!1}get autoReset(){return this._autoReset}set autoReset(e){typeof document<"u"&&document.hidden!==void 0&&(e?document.addEventListener("visibilitychange",this):document.removeEventListener("visibilitychange",this),this._autoReset=e)}get delta(){return this._delta*re}get fixedDelta(){return this._fixedDelta*re}set fixedDelta(e){this._fixedDelta=e*ut}get elapsed(){return this._elapsed*re}update(e){this.useFixedDelta?this._delta=this.fixedDelta:(this.previousTime=this.currentTime,this.currentTime=(e!==void 0?e:performance.now())-this.startTime,this._delta=this.currentTime-this.previousTime),this._delta*=this.timescale,this._elapsed+=this._delta}reset(){this._delta=0,this._elapsed=0,this.currentTime=performance.now()-this.startTime}getDelta(){return this.delta}getElapsed(){return this.elapsed}handleEvent(e){document.hidden||(this.currentTime=performance.now()-this.startTime)}dispose(){this.autoReset=!1}},Se=class{constructor(e=null,{depthBuffer:t=!0,stencilBuffer:s=!1,multisampling:r=0,frameBufferType:i=W}={}){this.renderer=null,this.inputBuffer=this.createBuffer(t,s,i,r),this.outputBuffer=this.inputBuffer.clone(),this.copyPass=new ot,this.depthRenderTarget=null,this.passes=[],this.timer=new ft,this.autoRenderToScreen=!0,this.setRenderer(e)}get stableDepthTexture(){return this.depthRenderTarget===null?null:this.depthRenderTarget.depthTexture}get multisampling(){return this.inputBuffer.samples}set multisampling(e){const t=this.renderer===null?e:lt(this.renderer,e);this.multisampling!==t&&(this.inputBuffer.samples=t,this.outputBuffer.samples=t,this.inputBuffer.dispose(),this.outputBuffer.dispose())}getTimer(){return this.timer}getRenderer(){return this.renderer}setRenderer(e){if(this.renderer=e,e!==null){const t=e.getSize(new D),s=e.getContext().getContextAttributes().alpha,r=this.inputBuffer.texture.type;r===W&&e.outputColorSpace===F&&(this.inputBuffer.texture.colorSpace=F,this.outputBuffer.texture.colorSpace=F,this.inputBuffer.dispose(),this.outputBuffer.dispose());const i=this.multisampling;this.multisampling=i,e.autoClear=!1,this.setSize(t.width,t.height);for(const a of this.passes)a.initialize(e,s,r)}}replaceRenderer(e,t=!0){const s=this.renderer,r=s.domElement.parentNode;return this.setRenderer(e),t&&r!==null&&(r.removeChild(s.domElement),r.appendChild(e.domElement)),s}createDepthTexture(){const e=new se;e.name="EffectComposer.InputDepth",this.inputBuffer.stencilBuffer?(e.format=We,e.type=Xe):e.type=qe;const t=new se;t.format=e.format,t.type=e.type,t.name="EffectComposer.OutputDepth";const s=new se;s.format=e.format,s.type=e.type,s.name="EffectComposer.StableDepth",this.inputBuffer.depthTexture=e,this.outputBuffer.depthTexture=t,this.inputBuffer.dispose(),this.outputBuffer.dispose();const{width:r,height:i}=this.inputBuffer;this.depthRenderTarget=new X(r,i,{depthBuffer:!0,stencilBuffer:this.inputBuffer.stencilBuffer,depthTexture:s})}blitDepthBuffer(e){const t=this.renderer,s=this.depthRenderTarget,r=t.properties,i=t.getContext();t.setRenderTarget(s);const a=r.get(e).__webglFramebuffer,n=r.get(s).__webglFramebuffer,o=e.stencilBuffer?i.DEPTH_BUFFER_BIT|i.STENCIL_BUFFER_BIT:i.DEPTH_BUFFER_BIT;i.bindFramebuffer(i.READ_FRAMEBUFFER,a),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,n),i.blitFramebuffer(0,0,e.width,e.height,0,0,s.width,s.height,o,i.NEAREST),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),t.setRenderTarget(null)}deleteDepthTexture(){const e=this.stableDepthTexture;for(const t of this.passes)t.getDepthTexture()===e&&t.setDepthTexture(null);this.depthRenderTarget!==null&&(this.depthRenderTarget.dispose(),this.depthRenderTarget=null),this.inputBuffer.depthTexture!==null&&(this.inputBuffer.depthTexture.dispose(),this.inputBuffer.depthTexture=null),this.outputBuffer.depthTexture!==null&&(this.outputBuffer.depthTexture.dispose(),this.outputBuffer.depthTexture=null)}createBuffer(e,t,s,r){const i=this.renderer,a=i===null?new D:i.getDrawingBufferSize(new D),n=new X(a.width,a.height,{minFilter:k,magFilter:k,samples:r,stencilBuffer:t,depthBuffer:e,type:s});return s===W&&i!==null&&i.outputColorSpace===F&&(n.texture.colorSpace=F),n.texture.name="EffectComposer.Buffer",n.texture.generateMipmaps=!1,n}setMainScene(e){for(const t of this.passes)t.mainScene=e}setMainCamera(e){for(const t of this.passes)t.mainCamera=e}addPass(e,t){const s=this.passes,r=this.renderer,i=r.getDrawingBufferSize(new D),a=r.getContext().getContextAttributes().alpha,n=this.inputBuffer.texture.type;if(e.renderer=r,e.setSize(i.width,i.height),e.initialize(r,a,n),this.autoRenderToScreen&&(s.length>0&&(s[s.length-1].renderToScreen=!1),e.renderToScreen&&(this.autoRenderToScreen=!1)),t!==void 0?s.splice(t,0,e):s.push(e),this.autoRenderToScreen&&(s[s.length-1].renderToScreen=!0),e.needsDepthTexture||this.depthRenderTarget!==null)if(this.depthRenderTarget===null){this.createDepthTexture();for(const o of s)o.setDepthTexture(this.stableDepthTexture)}else e.setDepthTexture(this.stableDepthTexture)}removePass(e){const t=this.passes,s=t.indexOf(e);if(s!==-1&&t.splice(s,1).length>0){const a=this.stableDepthTexture;if(a!==null){const n=(d,E)=>d||E.needsDepthTexture;t.reduce(n,!1)||(e.getDepthTexture()===a&&e.setDepthTexture(null),this.deleteDepthTexture())}this.autoRenderToScreen&&s===t.length&&(e.renderToScreen=!1,t.length>0&&(t[t.length-1].renderToScreen=!0))}}removeAllPasses(){const e=this.passes;this.deleteDepthTexture(),e.length>0&&(this.autoRenderToScreen&&(e[e.length-1].renderToScreen=!1),this.passes=[])}render(e){const t=this.renderer,s=this.copyPass;let r=this.inputBuffer,i=this.outputBuffer,a,n=!1;e===void 0&&(this.timer.update(),e=this.timer.getDelta());for(const o of this.passes)if(o.enabled){if(o.render(t,r,i,e,n),o.needsDepthBlit&&this.depthRenderTarget!==null&&this.blitDepthBuffer(r),o.needsSwap){if(n){s.renderToScreen=o.renderToScreen;const d=t.getContext(),E=t.state.buffers.stencil;E.setFunc(d.NOTEQUAL,1,4294967295),s.render(t,r,i,e,n),E.setFunc(d.EQUAL,1,4294967295)}a=r,r=i,i=a}o instanceof ct?n=!0:o instanceof rt&&(n=!1)}}setSize(e,t,s){const r=this.renderer,i=r.getSize(new D);(e===void 0||t===void 0)&&(e=i.width,t=i.height),(i.width!==e||i.height!==t)&&r.setSize(e,t,s);const a=r.getDrawingBufferSize(new D);this.inputBuffer.setSize(a.width,a.height),this.outputBuffer.setSize(a.width,a.height),this.depthRenderTarget!==null&&this.depthRenderTarget.setSize(a.width,a.height);for(const n of this.passes)n.setSize(a.width,a.height)}reset(){this.dispose(),this.autoRenderToScreen=!0}dispose(){for(const e of this.passes)e.dispose();this.deleteDepthTexture(),this.inputBuffer.dispose(),this.outputBuffer.dispose(),this.copyPass.dispose(),this.timer.dispose(),this.passes=[],O.fullscreenGeometry.dispose()}},U={NONE:0,DEPTH:1,CONVOLUTION:2},f={FRAGMENT_HEAD:"FRAGMENT_HEAD",FRAGMENT_MAIN_UV:"FRAGMENT_MAIN_UV",FRAGMENT_MAIN_IMAGE:"FRAGMENT_MAIN_IMAGE",VERTEX_HEAD:"VERTEX_HEAD",VERTEX_MAIN_SUPPORT:"VERTEX_MAIN_SUPPORT"},dt=class{constructor(){this.shaderParts=new Map([[f.FRAGMENT_HEAD,null],[f.FRAGMENT_MAIN_UV,null],[f.FRAGMENT_MAIN_IMAGE,null],[f.VERTEX_HEAD,null],[f.VERTEX_MAIN_SUPPORT,null]]),this.defines=new Map,this.uniforms=new Map,this.blendModes=new Map,this.extensions=new Set,this.attributes=U.NONE,this.varyings=new Set,this.uvTransformation=!1,this.readDepth=!1,this.colorSpace=ye}},ie=!1,xe=class{constructor(e=null){this.originalMaterials=new Map,this.material=null,this.materials=null,this.materialsBackSide=null,this.materialsDoubleSide=null,this.materialsFlatShaded=null,this.materialsFlatShadedBackSide=null,this.materialsFlatShadedDoubleSide=null,this.setMaterial(e),this.meshCount=0,this.replaceMaterial=t=>{if(t.isMesh){let s;if(t.material.flatShading)switch(t.material.side){case Y:s=this.materialsFlatShadedDoubleSide;break;case Q:s=this.materialsFlatShadedBackSide;break;default:s=this.materialsFlatShaded;break}else switch(t.material.side){case Y:s=this.materialsDoubleSide;break;case Q:s=this.materialsBackSide;break;default:s=this.materials;break}this.originalMaterials.set(t,t.material),t.isSkinnedMesh?t.material=s[2]:t.isInstancedMesh?t.material=s[1]:t.material=s[0],++this.meshCount}}}cloneMaterial(e){if(!(e instanceof J))return e.clone();const t=e.uniforms,s=new Map;for(const i in t){const a=t[i].value;a.isRenderTargetTexture&&(t[i].value=null,s.set(i,a))}const r=e.clone();for(const i of s)t[i[0]].value=i[1],r.uniforms[i[0]].value=i[1];return r}setMaterial(e){if(this.disposeMaterials(),this.material=e,e!==null){const t=this.materials=[this.cloneMaterial(e),this.cloneMaterial(e),this.cloneMaterial(e)];for(const s of t)s.uniforms=Object.assign({},e.uniforms),s.side=Ke;t[2].skinning=!0,this.materialsBackSide=t.map(s=>{const r=this.cloneMaterial(s);return r.uniforms=Object.assign({},e.uniforms),r.side=Q,r}),this.materialsDoubleSide=t.map(s=>{const r=this.cloneMaterial(s);return r.uniforms=Object.assign({},e.uniforms),r.side=Y,r}),this.materialsFlatShaded=t.map(s=>{const r=this.cloneMaterial(s);return r.uniforms=Object.assign({},e.uniforms),r.flatShading=!0,r}),this.materialsFlatShadedBackSide=t.map(s=>{const r=this.cloneMaterial(s);return r.uniforms=Object.assign({},e.uniforms),r.flatShading=!0,r.side=Q,r}),this.materialsFlatShadedDoubleSide=t.map(s=>{const r=this.cloneMaterial(s);return r.uniforms=Object.assign({},e.uniforms),r.flatShading=!0,r.side=Y,r})}}render(e,t,s){const r=e.shadowMap.enabled;if(e.shadowMap.enabled=!1,ie){const i=this.originalMaterials;this.meshCount=0,t.traverse(this.replaceMaterial),e.render(t,s);for(const a of i)a[0].material=a[1];this.meshCount!==i.size&&i.clear()}else{const i=t.overrideMaterial;t.overrideMaterial=this.material,e.render(t,s),t.overrideMaterial=i}e.shadowMap.enabled=r}disposeMaterials(){if(this.material!==null){const e=this.materials.concat(this.materialsBackSide).concat(this.materialsDoubleSide).concat(this.materialsFlatShaded).concat(this.materialsFlatShadedBackSide).concat(this.materialsFlatShadedDoubleSide);for(const t of e)t.dispose()}}dispose(){this.originalMaterials.clear(),this.disposeMaterials()}static get workaroundEnabled(){return ie}static set workaroundEnabled(e){ie=e}},c={ADD:0,ALPHA:1,AVERAGE:2,COLOR:3,COLOR_BURN:4,COLOR_DODGE:5,DARKEN:6,DIFFERENCE:7,DIVIDE:8,DST:9,EXCLUSION:10,HARD_LIGHT:11,HARD_MIX:12,HUE:13,INVERT:14,INVERT_RGB:15,LIGHTEN:16,LINEAR_BURN:17,LINEAR_DODGE:18,LINEAR_LIGHT:19,LUMINOSITY:20,MULTIPLY:21,NEGATION:22,NORMAL:23,OVERLAY:24,PIN_LIGHT:25,REFLECT:26,SATURATION:27,SCREEN:28,SOFT_LIGHT:29,SRC:30,SUBTRACT:31,VIVID_LIGHT:32},ht="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb+src.rgb;return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",pt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){return mix(dst,src,src.a*opacity);}",mt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=(dst.rgb+src.rgb)*0.5;return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",vt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=RGBToHSL(dst.rgb);vec3 b=RGBToHSL(src.rgb);vec3 c=HSLToRGB(vec3(b.xy,a.z));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",gt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=dst.rgb,b=src.rgb;vec3 c=mix(step(0.0,b)*(1.0-min(vec3(1.0),(1.0-a)/max(b,1e-9))),vec3(1.0),step(1.0,a));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Et="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=dst.rgb,b=src.rgb;vec3 c=step(0.0,a)*mix(min(vec3(1.0),a/max(1.0-b,1e-9)),vec3(1.0),step(1.0,b));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Tt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=min(dst.rgb,src.rgb);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Rt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=abs(dst.rgb-src.rgb);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",St="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb/max(src.rgb,1e-9);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",xt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb+src.rgb-2.0*dst.rgb*src.rgb;return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",bt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=min(dst.rgb,1.0);vec3 b=min(src.rgb,1.0);vec3 c=mix(2.0*a*b,1.0-2.0*(1.0-a)*(1.0-b),step(0.5,b));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",_t="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=step(1.0,dst.rgb+src.rgb);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Ct="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=RGBToHSL(dst.rgb);vec3 b=RGBToHSL(src.rgb);vec3 c=HSLToRGB(vec3(b.x,a.yz));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Mt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=max(1.0-src.rgb,0.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",At="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=src.rgb*max(1.0-dst.rgb,0.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",yt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=max(dst.rgb,src.rgb);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",wt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=clamp(src.rgb+dst.rgb-1.0,0.0,1.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Bt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=min(dst.rgb+src.rgb,1.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Dt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=clamp(2.0*src.rgb+dst.rgb-1.0,0.0,1.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Pt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=RGBToHSL(dst.rgb);vec3 b=RGBToHSL(src.rgb);vec3 c=HSLToRGB(vec3(a.xy,b.z));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",It="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb*src.rgb;return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Ft="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=max(1.0-abs(1.0-dst.rgb-src.rgb),0.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Nt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){return mix(dst,src,opacity);}",Ot="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=2.0*src.rgb*dst.rgb;vec3 b=1.0-2.0*(1.0-src.rgb)*(1.0-dst.rgb);vec3 c=mix(a,b,step(0.5,dst.rgb));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Gt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 src2=2.0*src.rgb;vec3 c=mix(mix(src2,dst.rgb,step(0.5*dst.rgb,src.rgb)),max(src2-1.0,vec3(0.0)),step(dst.rgb,src2-1.0));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Ut="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=min(dst.rgb*dst.rgb/max(1.0-src.rgb,1e-9),1.0);vec3 c=mix(a,src.rgb,step(1.0,src.rgb));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Lt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=RGBToHSL(dst.rgb);vec3 b=RGBToHSL(src.rgb);vec3 c=HSLToRGB(vec3(a.x,b.y,a.z));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Ht="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb+src.rgb-min(dst.rgb*src.rgb,1.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",kt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 src2=2.0*src.rgb;vec3 d=dst.rgb+(src2-1.0);vec3 w=step(0.5,src.rgb);vec3 a=dst.rgb-(1.0-src2)*dst.rgb*(1.0-dst.rgb);vec3 b=mix(d*(sqrt(dst.rgb)-dst.rgb),d*dst.rgb*((16.0*dst.rgb-12.0)*dst.rgb+3.0),w*(1.0-step(0.25,dst.rgb)));vec3 c=mix(a,b,w);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Vt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){return src;}",zt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=max(dst.rgb-src.rgb,0.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Wt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=mix(max(1.0-min((1.0-dst.rgb)/(2.0*src.rgb),1.0),0.0),min(dst.rgb/(2.0*(1.0-src.rgb)),1.0),step(0.5,src.rgb));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Xt=new Map([[c.ADD,ht],[c.ALPHA,pt],[c.AVERAGE,mt],[c.COLOR,vt],[c.COLOR_BURN,gt],[c.COLOR_DODGE,Et],[c.DARKEN,Tt],[c.DIFFERENCE,Rt],[c.DIVIDE,St],[c.DST,null],[c.EXCLUSION,xt],[c.HARD_LIGHT,bt],[c.HARD_MIX,_t],[c.HUE,Ct],[c.INVERT,Mt],[c.INVERT_RGB,At],[c.LIGHTEN,yt],[c.LINEAR_BURN,wt],[c.LINEAR_DODGE,Bt],[c.LINEAR_LIGHT,Dt],[c.LUMINOSITY,Pt],[c.MULTIPLY,It],[c.NEGATION,Ft],[c.NORMAL,Nt],[c.OVERLAY,Ot],[c.PIN_LIGHT,Gt],[c.REFLECT,Ut],[c.SATURATION,Lt],[c.SCREEN,Ht],[c.SOFT_LIGHT,kt],[c.SRC,Vt],[c.SUBTRACT,zt],[c.VIVID_LIGHT,Wt]]),qt=class extends Ae{constructor(e,t=1){super(),this._blendFunction=e,this.opacity=new S(t)}getOpacity(){return this.opacity.value}setOpacity(e){this.opacity.value=e}get blendFunction(){return this._blendFunction}set blendFunction(e){this._blendFunction=e,this.dispatchEvent({type:"change"})}getBlendFunction(){return this.blendFunction}setBlendFunction(e){this.blendFunction=e}getShaderCode(){return Xt.get(this.blendFunction)}},Oe=class extends Ae{constructor(e,t,{attributes:s=U.NONE,blendFunction:r=c.NORMAL,defines:i=new Map,uniforms:a=new Map,extensions:n=null,vertexShader:o=null}={}){super(),this.name=e,this.renderer=null,this.attributes=s,this.fragmentShader=t,this.vertexShader=o,this.defines=i,this.uniforms=a,this.extensions=n,this.blendMode=new qt(r),this.blendMode.addEventListener("change",d=>this.setChanged()),this._inputColorSpace=ye,this._outputColorSpace=we}get inputColorSpace(){return this._inputColorSpace}set inputColorSpace(e){this._inputColorSpace=e,this.setChanged()}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e,this.setChanged()}set mainScene(e){}set mainCamera(e){}getName(){return this.name}setRenderer(e){this.renderer=e}getDefines(){return this.defines}getUniforms(){return this.uniforms}getExtensions(){return this.extensions}getBlendMode(){return this.blendMode}getAttributes(){return this.attributes}setAttributes(e){this.attributes=e,this.setChanged()}getFragmentShader(){return this.fragmentShader}setFragmentShader(e){this.fragmentShader=e,this.setChanged()}getVertexShader(){return this.vertexShader}setVertexShader(e){this.vertexShader=e,this.setChanged()}setChanged(){this.dispatchEvent({type:"change"})}setDepthTexture(e,t=j){}update(e,t,s){}setSize(e,t){}initialize(e,t,s){}dispose(){for(const e of Object.keys(this)){const t=this[e];(t instanceof X||t instanceof Fe||t instanceof ce||t instanceof O)&&this[e].dispose()}}},be=class extends O{constructor(e,t,s=null){super("RenderPass",e,t),this.needsSwap=!1,this.needsDepthBlit=!0,this.clearPass=new Ne,this.overrideMaterialManager=s===null?null:new xe(s),this.ignoreBackground=!1,this.skipShadowMapUpdate=!1,this.selection=null}set mainScene(e){this.scene=e}set mainCamera(e){this.camera=e}get renderToScreen(){return super.renderToScreen}set renderToScreen(e){super.renderToScreen=e,this.clearPass.renderToScreen=e}get overrideMaterial(){const e=this.overrideMaterialManager;return e!==null?e.material:null}set overrideMaterial(e){const t=this.overrideMaterialManager;e!==null?t!==null?t.setMaterial(e):this.overrideMaterialManager=new xe(e):t!==null&&(t.dispose(),this.overrideMaterialManager=null)}getOverrideMaterial(){return this.overrideMaterial}setOverrideMaterial(e){this.overrideMaterial=e}get clear(){return this.clearPass.enabled}set clear(e){this.clearPass.enabled=e}getSelection(){return this.selection}setSelection(e){this.selection=e}isBackgroundDisabled(){return this.ignoreBackground}setBackgroundDisabled(e){this.ignoreBackground=e}isShadowMapDisabled(){return this.skipShadowMapUpdate}setShadowMapDisabled(e){this.skipShadowMapUpdate=e}getClearPass(){return this.clearPass}render(e,t,s,r,i){const a=this.scene,n=this.camera,o=this.selection,d=n.layers.mask,E=a.background,A=e.shadowMap.autoUpdate,b=this.renderToScreen?null:t;o!==null&&n.layers.set(o.getLayer()),this.skipShadowMapUpdate&&(e.shadowMap.autoUpdate=!1),(this.ignoreBackground||this.clearPass.overrideClearColor!==null)&&(a.background=null),this.clearPass.enabled&&this.clearPass.render(e,t),e.setRenderTarget(b),this.overrideMaterialManager!==null?this.overrideMaterialManager.render(e,a,n):e.render(a,n),n.layers.mask=d,a.background=E,e.shadowMap.autoUpdate=A}},Kt=`#include <common>
#include <packing>
#include <dithering_pars_fragment>
#define packFloatToRGBA(v) packDepthToRGBA(v)
#define unpackRGBAToFloat(v) unpackRGBAToDepth(v)
#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#if DEPTH_PACKING == 3201
uniform lowp sampler2D depthBuffer;
#elif defined(GL_FRAGMENT_PRECISION_HIGH)
uniform highp sampler2D depthBuffer;
#else
uniform mediump sampler2D depthBuffer;
#endif
uniform vec2 resolution;uniform vec2 texelSize;uniform float cameraNear;uniform float cameraFar;uniform float aspect;uniform float time;varying vec2 vUv;vec4 sRGBToLinear(const in vec4 value){return vec4(mix(pow(value.rgb*0.9478672986+vec3(0.0521327014),vec3(2.4)),value.rgb*0.0773993808,vec3(lessThanEqual(value.rgb,vec3(0.04045)))),value.a);}float readDepth(const in vec2 uv){
#if DEPTH_PACKING == 3201
float depth=unpackRGBAToDepth(texture2D(depthBuffer,uv));
#else
float depth=texture2D(depthBuffer,uv).r;
#endif
#if defined(USE_LOGARITHMIC_DEPTH_BUFFER) || defined(LOG_DEPTH)
float d=pow(2.0,depth*log2(cameraFar+1.0))-1.0;float a=cameraFar/(cameraFar-cameraNear);float b=cameraFar*cameraNear/(cameraNear-cameraFar);depth=a+b/d;
#elif defined(USE_REVERSED_DEPTH_BUFFER)
depth=1.0-depth;
#endif
return depth;}float getViewZ(const in float depth){
#ifdef PERSPECTIVE_CAMERA
return perspectiveDepthToViewZ(depth,cameraNear,cameraFar);
#else
return orthographicDepthToViewZ(depth,cameraNear,cameraFar);
#endif
}vec3 RGBToHCV(const in vec3 RGB){vec4 P=mix(vec4(RGB.bg,-1.0,2.0/3.0),vec4(RGB.gb,0.0,-1.0/3.0),step(RGB.b,RGB.g));vec4 Q=mix(vec4(P.xyw,RGB.r),vec4(RGB.r,P.yzx),step(P.x,RGB.r));float C=Q.x-min(Q.w,Q.y);float H=abs((Q.w-Q.y)/(6.0*C+EPSILON)+Q.z);return vec3(H,C,Q.x);}vec3 RGBToHSL(const in vec3 RGB){vec3 HCV=RGBToHCV(RGB);float L=HCV.z-HCV.y*0.5;float S=HCV.y/(1.0-abs(L*2.0-1.0)+EPSILON);return vec3(HCV.x,S,L);}vec3 HueToRGB(const in float H){float R=abs(H*6.0-3.0)-1.0;float G=2.0-abs(H*6.0-2.0);float B=2.0-abs(H*6.0-4.0);return clamp(vec3(R,G,B),0.0,1.0);}vec3 HSLToRGB(const in vec3 HSL){vec3 RGB=HueToRGB(HSL.x);float C=(1.0-abs(2.0*HSL.z-1.0))*HSL.y;return(RGB-0.5)*C+HSL.z;}FRAGMENT_HEAD void main(){FRAGMENT_MAIN_UV vec4 color0=texture2D(inputBuffer,UV);vec4 color1=vec4(0.0);FRAGMENT_MAIN_IMAGE color0.a=clamp(color0.a,0.0,1.0);gl_FragColor=color0;
#ifdef ENCODE_OUTPUT
#include <colorspace_fragment>
#endif
#include <dithering_fragment>
}`,$t="uniform vec2 resolution;uniform vec2 texelSize;uniform float cameraNear;uniform float cameraFar;uniform float aspect;uniform float time;varying vec2 vUv;VERTEX_HEAD void main(){vUv=position.xy*0.5+0.5;VERTEX_MAIN_SUPPORT gl_Position=vec4(position.xy,1.0,1.0);}",Qt=class extends J{constructor(e,t,s,r,i=!1){super({name:"EffectMaterial",defines:{THREE_REVISION:$e.replace(/\D+/g,""),DEPTH_PACKING:"0",ENCODE_OUTPUT:"1"},uniforms:{inputBuffer:new S(null),depthBuffer:new S(null),resolution:new S(new D),texelSize:new S(new D),cameraNear:new S(.3),cameraFar:new S(1e3),aspect:new S(1),time:new S(0)},blending:Ie,toneMapped:!1,depthWrite:!1,depthTest:!1,dithering:i}),e&&this.setShaderParts(e),t&&this.setDefines(t),s&&this.setUniforms(s),this.copyCameraSettings(r)}set inputBuffer(e){this.uniforms.inputBuffer.value=e}setInputBuffer(e){this.uniforms.inputBuffer.value=e}get depthBuffer(){return this.uniforms.depthBuffer.value}set depthBuffer(e){this.uniforms.depthBuffer.value=e}get depthPacking(){return Number(this.defines.DEPTH_PACKING)}set depthPacking(e){this.defines.DEPTH_PACKING=e.toFixed(0),this.needsUpdate=!0}setDepthBuffer(e,t=j){this.depthBuffer=e,this.depthPacking=t}setShaderData(e){this.setShaderParts(e.shaderParts),this.setDefines(e.defines),this.setUniforms(e.uniforms),this.setExtensions(e.extensions)}setShaderParts(e){return this.fragmentShader=Kt.replace(f.FRAGMENT_HEAD,e.get(f.FRAGMENT_HEAD)||"").replace(f.FRAGMENT_MAIN_UV,e.get(f.FRAGMENT_MAIN_UV)||"").replace(f.FRAGMENT_MAIN_IMAGE,e.get(f.FRAGMENT_MAIN_IMAGE)||""),this.vertexShader=$t.replace(f.VERTEX_HEAD,e.get(f.VERTEX_HEAD)||"").replace(f.VERTEX_MAIN_SUPPORT,e.get(f.VERTEX_MAIN_SUPPORT)||""),this.needsUpdate=!0,this}setDefines(e){for(const t of e.entries())this.defines[t[0]]=t[1];return this.needsUpdate=!0,this}setUniforms(e){for(const t of e.entries())this.uniforms[t[0]]=t[1];return this}setExtensions(e){this.extensions={};for(const t of e)this.extensions[t]=!0;return this}get encodeOutput(){return this.defines.ENCODE_OUTPUT!==void 0}set encodeOutput(e){this.encodeOutput!==e&&(e?this.defines.ENCODE_OUTPUT="1":delete this.defines.ENCODE_OUTPUT,this.needsUpdate=!0)}isOutputEncodingEnabled(e){return this.encodeOutput}setOutputEncodingEnabled(e){this.encodeOutput=e}get time(){return this.uniforms.time.value}set time(e){this.uniforms.time.value=e}setDeltaTime(e){this.uniforms.time.value+=e}adoptCameraSettings(e){this.copyCameraSettings(e)}copyCameraSettings(e){e&&(this.uniforms.cameraNear.value=e.near,this.uniforms.cameraFar.value=e.far,e instanceof Qe?this.defines.PERSPECTIVE_CAMERA="1":delete this.defines.PERSPECTIVE_CAMERA,this.needsUpdate=!0)}setSize(e,t){const s=this.uniforms;s.resolution.value.set(e,t),s.texelSize.value.set(1/e,1/t),s.aspect.value=e/t}static get Section(){return f}};function _e(e,t,s){for(const r of t){const i="$1"+e+r.charAt(0).toUpperCase()+r.slice(1),a=new RegExp("([^\\.])(\\b"+r+"\\b)","g");for(const n of s.entries())n[1]!==null&&s.set(n[0],n[1].replace(a,i))}}function Yt(e,t,s){let r=t.getFragmentShader(),i=t.getVertexShader();const a=r!==void 0&&/mainImage/.test(r),n=r!==void 0&&/mainUv/.test(r);if(s.attributes|=t.getAttributes(),r===void 0)throw new Error(`Missing fragment shader (${t.name})`);if(n&&(s.attributes&U.CONVOLUTION)!==0)throw new Error(`Effects that transform UVs are incompatible with convolution effects (${t.name})`);if(!a&&!n)throw new Error(`Could not find mainImage or mainUv function (${t.name})`);{const o=/\w+\s+(\w+)\([\w\s,]*\)\s*{/g,d=s.shaderParts;let E=d.get(f.FRAGMENT_HEAD)||"",A=d.get(f.FRAGMENT_MAIN_UV)||"",b=d.get(f.FRAGMENT_MAIN_IMAGE)||"",G=d.get(f.VERTEX_HEAD)||"",l=d.get(f.VERTEX_MAIN_SUPPORT)||"";const T=new Set,m=new Set;if(n&&(A+=`	${e}MainUv(UV);
`,s.uvTransformation=!0),i!==null&&/mainSupport/.test(i)){const v=/mainSupport *\([\w\s]*?uv\s*?\)/.test(i);l+=`	${e}MainSupport(`,l+=v?`vUv);
`:`);
`;for(const g of i.matchAll(/(?:varying\s+\w+\s+([\S\s]*?);)/g))for(const _ of g[1].split(/\s*,\s*/))s.varyings.add(_),T.add(_),m.add(_);for(const g of i.matchAll(o))m.add(g[1])}for(const v of r.matchAll(o))m.add(v[1]);for(const v of t.defines.keys())m.add(v.replace(/\([\w\s,]*\)/g,""));for(const v of t.uniforms.keys())m.add(v);m.delete("while"),m.delete("for"),m.delete("if"),t.uniforms.forEach((v,g)=>s.uniforms.set(e+g.charAt(0).toUpperCase()+g.slice(1),v)),t.defines.forEach((v,g)=>s.defines.set(e+g.charAt(0).toUpperCase()+g.slice(1),v));const w=new Map([["fragment",r],["vertex",i]]);_e(e,m,s.defines),_e(e,m,w),r=w.get("fragment"),i=w.get("vertex");const M=t.blendMode;if(s.blendModes.set(M.blendFunction,M),a){t.inputColorSpace!==null&&t.inputColorSpace!==s.colorSpace&&(b+=t.inputColorSpace===F?`color0 = sRGBTransferOETF(color0);
	`:`color0 = sRGBToLinear(color0);
	`),t.outputColorSpace!==we?s.colorSpace=t.outputColorSpace:t.inputColorSpace!==null&&(s.colorSpace=t.inputColorSpace);const v=/MainImage *\([\w\s,]*?depth[\w\s,]*?\)/;b+=`${e}MainImage(color0, UV, `,(s.attributes&U.DEPTH)!==0&&v.test(r)&&(b+="depth, ",s.readDepth=!0),b+=`color1);
	`;const g=e+"BlendOpacity";s.uniforms.set(g,M.opacity),b+=`color0 = blend${M.blendFunction}(color0, color1, ${g});

	`,E+=`uniform float ${g};

`}if(E+=r+`
`,i!==null&&(G+=i+`
`),d.set(f.FRAGMENT_HEAD,E),d.set(f.FRAGMENT_MAIN_UV,A),d.set(f.FRAGMENT_MAIN_IMAGE,b),d.set(f.VERTEX_HEAD,G),d.set(f.VERTEX_MAIN_SUPPORT,l),t.extensions!==null)for(const v of t.extensions)s.extensions.add(v)}}var Ce=class extends O{constructor(e,...t){super("EffectPass"),this.fullscreenMaterial=new Qt(null,null,null,e),this.listener=s=>this.handleEvent(s),this.effects=[],this.setEffects(t),this.skipRendering=!1,this.minTime=1,this.maxTime=Number.POSITIVE_INFINITY,this.timeScale=1}set mainScene(e){for(const t of this.effects)t.mainScene=e}set mainCamera(e){this.fullscreenMaterial.copyCameraSettings(e);for(const t of this.effects)t.mainCamera=e}get encodeOutput(){return this.fullscreenMaterial.encodeOutput}set encodeOutput(e){this.fullscreenMaterial.encodeOutput=e}get dithering(){return this.fullscreenMaterial.dithering}set dithering(e){const t=this.fullscreenMaterial;t.dithering=e,t.needsUpdate=!0}setEffects(e){for(const t of this.effects)t.removeEventListener("change",this.listener);this.effects=e.sort((t,s)=>s.attributes-t.attributes);for(const t of this.effects)t.addEventListener("change",this.listener)}updateMaterial(){const e=new dt;let t=0;for(const n of this.effects)if(n.blendMode.blendFunction===c.DST)e.attributes|=n.getAttributes()&U.DEPTH;else{if((e.attributes&n.getAttributes()&U.CONVOLUTION)!==0)throw new Error(`Convolution effects cannot be merged (${n.name})`);Yt("e"+t++,n,e)}let s=e.shaderParts.get(f.FRAGMENT_HEAD),r=e.shaderParts.get(f.FRAGMENT_MAIN_IMAGE),i=e.shaderParts.get(f.FRAGMENT_MAIN_UV);const a=/\bblend\b/g;for(const n of e.blendModes.values())s+=n.getShaderCode().replace(a,`blend${n.blendFunction}`)+`
`;(e.attributes&U.DEPTH)!==0?(e.readDepth&&(r=`float depth = readDepth(UV);

	`+r),this.needsDepthTexture=this.getDepthTexture()===null):this.needsDepthTexture=!1,e.colorSpace===F&&(r+=`color0 = sRGBToLinear(color0);
	`),e.uvTransformation?(i=`vec2 transformedUv = vUv;
`+i,e.defines.set("UV","transformedUv")):e.defines.set("UV","vUv"),e.shaderParts.set(f.FRAGMENT_HEAD,s),e.shaderParts.set(f.FRAGMENT_MAIN_IMAGE,r),e.shaderParts.set(f.FRAGMENT_MAIN_UV,i);for(const[n,o]of e.shaderParts)o!==null&&e.shaderParts.set(n,o.trim().replace(/^#/,`
#`));this.skipRendering=t===0,this.needsSwap=!this.skipRendering,this.fullscreenMaterial.setShaderData(e)}recompile(){this.updateMaterial()}getDepthTexture(){return this.fullscreenMaterial.depthBuffer}setDepthTexture(e,t=j){this.fullscreenMaterial.depthBuffer=e,this.fullscreenMaterial.depthPacking=t;for(const s of this.effects)s.setDepthTexture(e,t)}render(e,t,s,r,i){for(const a of this.effects)a.update(e,t,r);if(!this.skipRendering||this.renderToScreen){const a=this.fullscreenMaterial;a.inputBuffer=t.texture,a.time+=r*this.timeScale,e.setRenderTarget(this.renderToScreen?null:s),e.render(this.scene,this.camera)}}setSize(e,t){this.fullscreenMaterial.setSize(e,t);for(const s of this.effects)s.setSize(e,t)}initialize(e,t,s){this.renderer=e;for(const r of this.effects)r.initialize(e,t,s);this.updateMaterial(),s!==void 0&&s!==W&&(this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH="1")}dispose(){super.dispose();for(const e of this.effects)e.removeEventListener("change",this.listener),e.dispose()}handleEvent(e){e.type==="change"&&this.recompile()}};const jt=()=>{const t=document.createElement("canvas");t.width=64,t.height=64;const s=t.getContext("2d");if(!s)throw new Error("2D context not available");s.fillStyle="black",s.fillRect(0,0,t.width,t.height);const r=new ce(t);r.minFilter=k,r.magFilter=k,r.generateMipmaps=!1;const i=[];let a=null;const n=64;let o=.1*64;const d=1/n,E=()=>{s.fillStyle="black",s.fillRect(0,0,t.width,t.height)},A=l=>{const T={x:l.x*64,y:(1-l.y)*64};let m=1;const w=_=>Math.sin(_*Math.PI/2),M=_=>-_*(_-2);l.age<n*.3?m=w(l.age/(n*.3)):m=M(1-(l.age-n*.3)/(n*.7))||0,m*=l.force;const v=`${(l.vx+1)/2*255}, ${(l.vy+1)/2*255}, ${m*255}`,g=320;s.shadowOffsetX=g,s.shadowOffsetY=g,s.shadowBlur=o,s.shadowColor=`rgba(${v},${.22*m})`,s.beginPath(),s.fillStyle="rgba(255,0,0,1)",s.arc(T.x-g,T.y-g,o,0,Math.PI*2),s.fill()};return{canvas:t,texture:r,addTouch:l=>{let T=0,m=0,w=0;if(a){const M=l.x-a.x,v=l.y-a.y;if(M===0&&v===0)return;const g=M*M+v*v,_=Math.sqrt(g);m=M/(_||1),w=v/(_||1),T=Math.min(g*1e4,1)}a={x:l.x,y:l.y},i.push({x:l.x,y:l.y,age:0,force:T,vx:m,vy:w})},update:()=>{E();for(let l=i.length-1;l>=0;l--){const T=i[l],m=T.force*d*(1-T.age/n);T.x+=T.vx*m,T.y+=T.vy*m,T.age++,T.age>n&&i.splice(l,1)}for(let l=0;l<i.length;l++)A(i[l]);r.needsUpdate=!0},set radiusScale(l){o=.1*64*l},get radiusScale(){return o/(.1*64)},size:64}},Jt=(e,t)=>{const s=`
    uniform sampler2D uTexture;
    uniform float uStrength;
    uniform float uTime;
    uniform float uFreq;

    void mainUv(inout vec2 uv) {
      vec4 tex = texture2D(uTexture, uv);
      float vx = tex.r * 2.0 - 1.0;
      float vy = tex.g * 2.0 - 1.0;
      float intensity = tex.b;

      float wave = 0.5 + 0.5 * sin(uTime * uFreq + intensity * 6.2831853);

      float amt = uStrength * intensity * wave;

      uv += vec2(vx, vy) * amt;
    }
    `;return new Oe("LiquidEffect",s,{uniforms:new Map([["uTexture",new S(e)],["uStrength",new S(t?.strength??.025)],["uTime",new S(0)],["uFreq",new S(t?.freq??4.5)]])})},Me={square:0,circle:1,triangle:2,diamond:3},Zt=`
void main() {
  gl_Position = vec4(position, 1.0);
}
`,es=`
precision highp float;

uniform vec3  uColor;
uniform vec2  uResolution;
uniform float uTime;
uniform float uPixelSize;
uniform float uScale;
uniform float uDensity;
uniform float uPixelJitter;
uniform int   uEnableRipples;
uniform float uRippleSpeed;
uniform float uRippleThickness;
uniform float uRippleIntensity;
uniform float uEdgeFade;

uniform int   uShapeType;
const int SHAPE_SQUARE   = 0;
const int SHAPE_CIRCLE   = 1;
const int SHAPE_TRIANGLE = 2;
const int SHAPE_DIAMOND  = 3;

const int   MAX_CLICKS = 10;

uniform vec2  uClickPos  [MAX_CLICKS];
uniform float uClickTimes[MAX_CLICKS];

out vec4 fragColor;

float Bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2. + a.y * a.y * .75);
}
#define Bayer4(a) (Bayer2(.5*(a))*0.25 + Bayer2(a))
#define Bayer8(a) (Bayer4(.5*(a))*0.25 + Bayer2(a))

#define FBM_OCTAVES     5
#define FBM_LACUNARITY  1.25
#define FBM_GAIN        1.0

float hash11(float n){ return fract(sin(n)*43758.5453); }

float vnoise(vec3 p){
  vec3 ip = floor(p);
  vec3 fp = fract(p);
  float n000 = hash11(dot(ip + vec3(0.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n100 = hash11(dot(ip + vec3(1.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n010 = hash11(dot(ip + vec3(0.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n110 = hash11(dot(ip + vec3(1.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n001 = hash11(dot(ip + vec3(0.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n101 = hash11(dot(ip + vec3(1.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n011 = hash11(dot(ip + vec3(0.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  float n111 = hash11(dot(ip + vec3(1.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  vec3 w = fp*fp*fp*(fp*(fp*6.0-15.0)+10.0);
  float x00 = mix(n000, n100, w.x);
  float x10 = mix(n010, n110, w.x);
  float x01 = mix(n001, n101, w.x);
  float x11 = mix(n011, n111, w.x);
  float y0  = mix(x00, x10, w.y);
  float y1  = mix(x01, x11, w.y);
  return mix(y0, y1, w.z) * 2.0 - 1.0;
}

float fbm2(vec2 uv, float t){
  vec3 p = vec3(uv * uScale, t);
  float amp = 1.0;
  float freq = 1.0;
  float sum = 1.0;
  for (int i = 0; i < FBM_OCTAVES; ++i){
    sum  += amp * vnoise(p * freq);
    freq *= FBM_LACUNARITY;
    amp  *= FBM_GAIN;
  }
  return sum * 0.5 + 0.5;
}

float maskCircle(vec2 p, float cov){
  float r = sqrt(cov) * .25;
  float d = length(p - 0.5) - r;
  float aa = 0.5 * fwidth(d);
  return cov * (1.0 - smoothstep(-aa, aa, d * 2.0));
}

float maskTriangle(vec2 p, vec2 id, float cov){
  bool flip = mod(id.x + id.y, 2.0) > 0.5;
  if (flip) p.x = 1.0 - p.x;
  float r = sqrt(cov);
  float d  = p.y - r*(1.0 - p.x);
  float aa = fwidth(d);
  return cov * clamp(0.5 - d/aa, 0.0, 1.0);
}

float maskDiamond(vec2 p, float cov){
  float r = sqrt(cov) * 0.564;
  return step(abs(p.x - 0.49) + abs(p.y - 0.49), r);
}

void main(){
  float pixelSize = uPixelSize;
  vec2 fragCoord = gl_FragCoord.xy - uResolution * .5;
  float aspectRatio = uResolution.x / uResolution.y;

  vec2 pixelId = floor(fragCoord / pixelSize);
  vec2 pixelUV = fract(fragCoord / pixelSize);

  float cellPixelSize = 8.0 * pixelSize;
  vec2 cellId = floor(fragCoord / cellPixelSize);
  vec2 cellCoord = cellId * cellPixelSize;
  vec2 uv = cellCoord / uResolution * vec2(aspectRatio, 1.0);

  float base = fbm2(uv, uTime * 0.05);
  base = base * 0.5 - 0.65;

  float feed = base + (uDensity - 0.5) * 0.3;

  float speed     = uRippleSpeed;
  float thickness = uRippleThickness;
  const float dampT     = 1.0;
  const float dampR     = 10.0;

  if (uEnableRipples == 1) {
    for (int i = 0; i < MAX_CLICKS; ++i){
      vec2 pos = uClickPos[i];
      if (pos.x < 0.0) continue;
      float cellPixelSize = 8.0 * pixelSize;
      vec2 cuv = (((pos - uResolution * .5 - cellPixelSize * .5) / (uResolution))) * vec2(aspectRatio, 1.0);
      float t = max(uTime - uClickTimes[i], 0.0);
      float r = distance(uv, cuv);
      float waveR = speed * t;
      float ring  = exp(-pow((r - waveR) / thickness, 2.0));
      float atten = exp(-dampT * t) * exp(-dampR * r);
      feed = max(feed, ring * atten * uRippleIntensity);
    }
  }

  float bayer = Bayer8(fragCoord / uPixelSize) - 0.5;
  float bw = step(0.5, feed + bayer);

  float h = fract(sin(dot(floor(fragCoord / uPixelSize), vec2(127.1, 311.7))) * 43758.5453);
  float jitterScale = 1.0 + (h - 0.5) * uPixelJitter;
  float coverage = bw * jitterScale;
  float M;
  if      (uShapeType == SHAPE_CIRCLE)   M = maskCircle (pixelUV, coverage);
  else if (uShapeType == SHAPE_TRIANGLE) M = maskTriangle(pixelUV, pixelId, coverage);
  else if (uShapeType == SHAPE_DIAMOND)  M = maskDiamond(pixelUV, coverage);
  else                                   M = coverage;

  if (uEdgeFade > 0.0) {
    vec2 norm = gl_FragCoord.xy / uResolution;
    float edge = min(min(norm.x, norm.y), min(1.0 - norm.x, 1.0 - norm.y));
    float fade = smoothstep(0.0, uEdgeFade, edge);
    M *= fade;
  }

  vec3 color = uColor;

  // sRGB gamma correction - convert linear to sRGB for accurate color output
  vec3 srgbColor = mix(
    color * 12.92,
    1.055 * pow(color, vec3(1.0 / 2.4)) - 0.055,
    step(0.0031308, color)
  );

  fragColor = vec4(srgbColor, M);
}
`,ne=10,is=({variant:e="square",pixelSize:t=3,color:s="#B497CF",className:r,style:i,antialias:a=!0,patternScale:n=2,patternDensity:o=1,liquid:d=!1,liquidStrength:E=.1,liquidRadius:A=1,pixelSizeJitter:b=0,enableRipples:G=!0,rippleIntensityScale:l=1,rippleThickness:T=.1,rippleSpeed:m=.3,liquidWobbleSpeed:w=4.5,autoPauseOffscreen:M=!0,speed:v=.5,transparent:g=!0,edgeFade:_=.5,noiseAmount:q=0})=>{const le=H.useRef(null),Ge=H.useRef({visible:!0}),ue=H.useRef(v),C=H.useRef(null),Z=H.useRef(null);return H.useEffect(()=>{const P=le.current;if(!P)return;ue.current=v;const Ue=["antialias","liquid","noiseAmount"],fe={antialias:a,liquid:d,noiseAmount:q};let K=!1;if(!C.current)K=!0;else if(Z.current){for(const u of Ue)if(Z.current[u]!==fe[u]){K=!0;break}}if(K){if(C.current){const p=C.current;p.resizeObserver?.disconnect(),cancelAnimationFrame(p.raf),p.quad?.geometry.dispose(),p.material.dispose(),p.composer?.dispose(),p.renderer.dispose(),p.renderer.forceContextLoss(),p.renderer.domElement.parentElement===P&&P.removeChild(p.renderer.domElement),C.current=null}const u=document.createElement("canvas"),h=new Je({canvas:u,antialias:a,alpha:!0,powerPreference:"high-performance"});h.domElement.style.width="100%",h.domElement.style.height="100%",h.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),P.appendChild(h.domElement),g?h.setClearAlpha(0):h.setClearColor(0,1);const y={uResolution:{value:new D(0,0)},uTime:{value:0},uColor:{value:new Pe(s)},uClickPos:{value:Array.from({length:ne},()=>new D(-1,-1))},uClickTimes:{value:new Float32Array(ne)},uShapeType:{value:Me[e]??0},uPixelSize:{value:t*h.getPixelRatio()},uScale:{value:n},uDensity:{value:o},uPixelJitter:{value:b},uEnableRipples:{value:G?1:0},uRippleSpeed:{value:m},uRippleThickness:{value:T},uRippleIntensity:{value:l},uEdgeFade:{value:_}},V=new ae,L=new Be(-1,1,1,-1,0,1),de=new J({vertexShader:Zt,fragmentShader:es,uniforms:y,transparent:!0,depthTest:!1,depthWrite:!1,glslVersion:Ze}),Le=new et(2,2),he=new De(Le,de);V.add(he);const pe=new tt,me=()=>{const p=P.clientWidth||1,R=P.clientHeight||1;h.setSize(p,R,!1),y.uResolution.value.set(h.domElement.width,h.domElement.height),C.current?.composer&&C.current.composer.setSize(h.domElement.width,h.domElement.height),y.uPixelSize.value=t*h.getPixelRatio()};me();const ve=new ResizeObserver(me);ve.observe(P);const ge=(()=>{if(typeof window<"u"&&window.crypto?.getRandomValues){const p=new Uint32Array(1);return window.crypto.getRandomValues(p),p[0]/4294967295}return Math.random()})()*1e3;let x,N,z;if(d){N=jt(),N.radiusScale=A,x=new Se(h);const p=new be(V,L);z=Jt(N.texture,{strength:E,freq:w});const R=new Ce(L,z);R.renderToScreen=!0,x.addPass(p),x.addPass(R)}if(q>0){x||(x=new Se(h),x.addPass(new be(V,L)));const p=new Oe("NoiseEffect","uniform float uTime; uniform float uAmount; float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);} void mainUv(inout vec2 uv){} void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){ float n=hash(floor(uv*vec2(1920.0,1080.0))+floor(uTime*60.0)); float g=(n-0.5)*uAmount; outputColor=inputColor+vec4(vec3(g),0.0);} ",{uniforms:new Map([["uTime",new S(0)],["uAmount",new S(q)]])}),R=new Ce(L,p);R.renderToScreen=!0,x&&x.passes.length>0&&x.passes.forEach(I=>I.renderToScreen=!1),x.addPass(R)}x&&x.setSize(h.domElement.width,h.domElement.height);const Ee=p=>{const R=h.domElement.getBoundingClientRect(),I=h.domElement.width/R.width,B=h.domElement.height/R.height,te=(p.clientX-R.left)*I,Ve=(R.height-(p.clientY-R.top))*B;return{fx:te,fy:Ve,w:h.domElement.width,h:h.domElement.height}},He=p=>{const{fx:R,fy:I}=Ee(p),B=C.current?.clickIx??0;y.uClickPos.value[B].set(R,I),y.uClickTimes.value[B]=y.uTime.value,C.current&&(C.current.clickIx=(B+1)%ne)},ke=p=>{if(!N)return;const{fx:R,fy:I,w:B,h:te}=Ee(p);N.addTouch({x:R/B,y:I/te})};h.domElement.addEventListener("pointerdown",He,{passive:!0}),h.domElement.addEventListener("pointermove",ke,{passive:!0});let $=0;const ee=()=>{if(M&&!Ge.current.visible){$=requestAnimationFrame(ee);return}y.uTime.value=ge+pe.getElapsedTime()*ue.current,z&&(z.uniforms.get("uTime").value=y.uTime.value),x?(N&&N.update(),x.passes.forEach(p=>{const R=p.effects;R&&R.forEach(I=>{const B=I.uniforms?.get("uTime");B&&(B.value=y.uTime.value)})}),x.render()):h.render(V,L),$=requestAnimationFrame(ee)};$=requestAnimationFrame(ee),C.current={renderer:h,scene:V,camera:L,material:de,clock:pe,clickIx:0,uniforms:y,resizeObserver:ve,raf:$,quad:he,timeOffset:ge,composer:x,touch:N,liquidEffect:z}}else{const u=C.current;if(u.uniforms.uShapeType.value=Me[e]??0,u.uniforms.uPixelSize.value=t*u.renderer.getPixelRatio(),u.uniforms.uColor.value.set(s),u.uniforms.uScale.value=n,u.uniforms.uDensity.value=o,u.uniforms.uPixelJitter.value=b,u.uniforms.uEnableRipples.value=G?1:0,u.uniforms.uRippleIntensity.value=l,u.uniforms.uRippleThickness.value=T,u.uniforms.uRippleSpeed.value=m,u.uniforms.uEdgeFade.value=_,g?u.renderer.setClearAlpha(0):u.renderer.setClearColor(0,1),u.liquidEffect){const h=u.liquidEffect;h&&(h.value=E);const y=u.liquidEffect.uniforms.get("uFreq");y&&(y.value=w)}u.touch&&(u.touch.radiusScale=A)}return Z.current=fe,()=>{if(C.current&&K||!C.current)return;const u=C.current;u.resizeObserver?.disconnect(),cancelAnimationFrame(u.raf),u.quad?.geometry.dispose(),u.material.dispose(),u.composer?.dispose(),u.renderer.dispose(),u.renderer.forceContextLoss(),u.renderer.domElement.parentElement===P&&P.removeChild(u.renderer.domElement),C.current=null}},[a,d,q,t,n,o,G,l,T,m,b,_,g,E,A,w,M,e,s,v]),ze.jsx("div",{ref:le,className:`pixel-blast-container ${r??""}`,style:i,"aria-label":"PixelBlast interactive background"})};export{is as default};
