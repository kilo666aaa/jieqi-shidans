import React, { useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
attribute vec3 aScatter;
attribute float aSeed;
attribute float aSize;
uniform float uTime;
uniform float uScatter;
uniform float uSize;
varying vec3 vColor;
void main(){
  vec3 p = position;
  float wind = sin(uTime * 1.4 + aSeed * 6.283);
  p += aScatter * uScatter * (.65 + .35 * wind);
  p.x += sin(uTime * .7 + aSeed * 12.0) * .009;
  vec4 mv = modelViewMatrix * vec4(p,1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * aSize;
  vColor = color;
}`;
const fragmentShader = `
varying vec3 vColor;
void main(){
  float d = length(gl_PointCoord - vec2(.5));
  if(d>.5) discard;
  float alpha = smoothstep(.5,.16,d) * .88;
  gl_FragColor = vec4(vColor,alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

function cloudGeometry() {
  const positions = [], colors = [], scatter = [], seeds = [], sizes = [];
  let seed = 379;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const color = new THREE.Color();
  function point(x,y,z,hex,scale=1) {
    positions.push(x,y,z);
    color.set(hex); color.multiplyScalar(.8 + random()*.3);
    colors.push(color.r,color.g,color.b);
    scatter.push((random()-.5)*1.2,(random()-.5)*1.1,(random()-.5)*.8);
    seeds.push(random()); sizes.push((.65+random()*.8)*scale);
  }
  const bodyColors = ['#B7C6A9','#819C7A','#E1DFCA','#668768'];
  for(let i=0;i<4800;i++) {
    const y = random()*2-1, a=random()*Math.PI*2, r=Math.sqrt(1-y*y);
    point(.55*r*Math.cos(a)+.07*(1-y*y),1.02*y-.12,.47*r*Math.sin(a),bodyColors[Math.floor(random()*bodyColors.length)]);
  }
  for(let i=0;i<820;i++) {
    const t=random(), across=random()*2-1, width=Math.sin(Math.PI*t)*.28;
    point(.03+t*.88+across*width*.5,.83+t*.88+Math.sin(t*Math.PI)*.19-across*width*.35,
      Math.sin(t*Math.PI)*.18+across*width*.65,random()>.3?'#4A7856':'#A5BD8C',.95);
  }
  for(let i=0;i<110;i++) { const t=i/110; point(.02+t*.88,.83+t*.88+Math.sin(t*Math.PI)*.19,.16*Math.sin(t*Math.PI),'#9CAB76',.7); }
  for(let i=0;i<360;i++) {
    const a=random()*Math.PI*2, r=1.15+random()*.17;
    point(Math.cos(a)*r,-.54+Math.sin(a)*.22,Math.sin(a)*r*.67,random()>.25?'#9EAF99':'#C6A66B',.7);
  }
  for(let i=0;i<130;i++) {
    const a=random()*Math.PI*2, r=1.1+random()*.55;
    point(Math.cos(a)*r,(random()-.5)*2.4,Math.sin(a)*r*.5,random()>.3?'#9DB5A1':'#D2B778',.62);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geometry.setAttribute('aScatter',new THREE.Float32BufferAttribute(scatter,3));
  geometry.setAttribute('aSeed',new THREE.Float32BufferAttribute(seeds,1));
  geometry.setAttribute('aSize',new THREE.Float32BufferAttribute(sizes,1));
  return geometry;
}

function Hezhi({ state, onReady }) {
  const group = useRef(), ready = useRef(false);
  const { size, camera, gl, invalidate } = useThree();
  const geometry = useMemo(cloudGeometry,[]);
  const material = useMemo(()=>new THREE.ShaderMaterial({
    vertexShader,fragmentShader,vertexColors:true,transparent:true,depthWrite:false,
    uniforms:{uTime:{value:0},uScatter:{value:.02},uSize:{value:2}}
  }),[]);
  const mouth = useMemo(()=>new THREE.BufferGeometry().setFromPoints(Array.from({length:21},(_,i)=>{
    const x=(i/20-.5)*.15;return new THREE.Vector3(x,-.2-.025*Math.sin(i/20*Math.PI),.482);
  })),[]);
  useEffect(()=>{
    camera.zoom=Math.min(size.width/3.8,size.height/3.65);camera.updateProjectionMatrix();invalidate();
  },[size.width,size.height,camera,invalidate]);
  useEffect(()=>{
    if(state.paused)return;
    let frame=0,last=0;
    const tick=now=>{if(now-last>32){invalidate();last=now;}frame=requestAnimationFrame(tick);};
    frame=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(frame);
  },[state.paused,invalidate]);
  useEffect(()=>()=>{geometry.dispose();material.dispose();mouth.dispose();},[geometry,material,mouth]);
  useFrame((_,delta)=>{
    if(!state.paused)material.uniforms.uTime.value+=Math.min(delta,.06);
    const mode=state.mode;
    const target=mode==='thinking'?.43:mode==='answering'?.16:mode==='error'?.04:state.hovered?.19:.025;
    material.uniforms.uScatter.value=state.paused?0:THREE.MathUtils.lerp(material.uniforms.uScatter.value,target,.09);
    material.uniforms.uSize.value=(state.compact?1.45:2.0)*Math.min(gl.getPixelRatio(),1.5);
    if(group.current){
      const t=material.uniforms.uTime.value;
      group.current.position.y=state.paused?0:Math.sin(t*.8)*.045;
      if(!state.paused){
        group.current.rotation.y=THREE.MathUtils.lerp(group.current.rotation.y,state.pointer[0]*.23,.07);
        group.current.rotation.x=THREE.MathUtils.lerp(group.current.rotation.x,-state.pointer[1]*.1,.07);
      }
    }
    if(!ready.current){ready.current=true;onReady?.();}
  });
  return <group ref={group} position={[0,0,0]}>
    <mesh position={[.05,-.12,0]} scale={[.55,1.02,.47]}>
      <sphereGeometry args={[1,28,24]}/><meshBasicMaterial color="#EEEBDD" transparent opacity={.18} depthWrite={false}/>
    </mesh>
    <points geometry={geometry} material={material} frustumCulled={false}/>
    {[-.16,.16].map(x=><mesh key={x} position={[x,.08,.53]}>
      <sphereGeometry args={[.054,12,12]}/><meshBasicMaterial color="#29493B"/>
    </mesh>)}
    <line geometry={mouth}><lineBasicMaterial color="#54715B" transparent opacity={.8}/></line>
  </group>;
}

class Boundary extends React.Component {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(error){this.props.onError?.(error);}
  render(){return this.state.failed?null:this.props.children;}
}
function Scene({state,onReady,onError,onCreated}) {
  return <Boundary onError={onError}><Canvas orthographic dpr={[1,1.5]} frameloop="demand"
    camera={{position:[0,.2,7],zoom:60,near:.1,far:30}}
    gl={{alpha:true,antialias:true,powerPreference:'low-power'}}
    onCreated={context=>{context.gl.setClearColor(0x000000,0);onCreated(context);}}>
    <Hezhi state={state} onReady={onReady}/>
  </Canvas></Boundary>;
}
export function mount(host,options={}) {
  const root=createRoot(host);
  const state={mode:'idle',paused:false,compact:false,hovered:false,pointer:[0,0],...options};
  let disposed=false,invalidate=()=>{},canvas=null;
  const lost=event=>{event.preventDefault();options.onError?.(new Error('WebGL context lost'));};
  const render=()=>root.render(<Scene state={state} onReady={()=>{if(!disposed)options.onReady?.();}} onError={options.onError}
    onCreated={context=>{invalidate=context.invalidate;canvas=context.gl.domElement;canvas.addEventListener('webglcontextlost',lost);}}/>);
  render();
  return {
    update(next){if(disposed)return;const redraw=next.paused!==undefined&&next.paused!==state.paused;Object.assign(state,next);if(redraw)render();invalidate();},
    dispose(){if(disposed)return;disposed=true;canvas?.removeEventListener('webglcontextlost',lost);root.unmount();}
  };
}
