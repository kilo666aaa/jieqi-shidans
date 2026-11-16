import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// All geometry and textures are local. No network assets or hidden scene services.
function texture(kind) {
  const c = document.createElement('canvas'); c.width = 768; c.height = 1024;
  const g = c.getContext('2d');
  g.fillStyle = kind === 'menu' ? '#f5ecd5' : '#a38560'; g.fillRect(0, 0, c.width, c.height);
  let seed = 71; const rand = () => ((seed = seed * 16807 % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < 1400; i++) { g.strokeStyle = kind === 'menu' ? `rgba(117,96,52,${rand() * .05})` : `rgba(62,40,24,${rand() * .17})`; g.beginPath(); let y = rand() * 1024; g.moveTo(0, y); g.bezierCurveTo(220, y + rand() * 15, 500, y - rand() * 14, 768, y); g.stroke(); }
  if (kind === 'menu') {
    g.strokeStyle = '#c6af7b'; g.lineWidth = 3; g.strokeRect(36, 36, 696, 952);
    g.fillStyle = '#75816a'; g.textAlign = 'center'; g.font = '34px serif'; g.fillText('不 时 · 不 食', 384, 144);
    g.fillStyle = '#294d3e'; g.font = 'bold 140px serif'; g.fillText('立冬', 384, 380);
    g.font = '36px serif'; g.fillText('一碗热汤', 384, 505); g.fillText('一餐时令', 384, 564);
    g.strokeStyle = '#c6af7b'; g.beginPath(); g.moveTo(145, 650); g.lineTo(623, 650); g.stroke();
    g.fillStyle = '#95624b'; g.font = '38px serif'; g.fillText('翻 开 食 单  ↗', 384, 750);
    g.fillStyle = '#a7533c'; g.fillRect(334, 832, 100, 100); g.fillStyle = '#f5ecd5'; g.font = '35px serif'; g.fillText('时令', 384, 895);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function Box({ position, scale, color, ...rest }) { return <mesh position={position} scale={scale} castShadow receiveShadow {...rest}><boxGeometry /><meshStandardMaterial color={color} roughness={.82} /></mesh>; }
function Leaf({ position, rotation, scale = 1, color = '#5b7257' }) {
  const geometry = useMemo(() => { const s = new THREE.Shape(); s.moveTo(0, 0); s.bezierCurveTo(-.22, .2, -.2, .55, 0, .75); s.bezierCurveTo(.25, .45, .18, .15, 0, 0); return new THREE.ShapeGeometry(s); }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} position={position} rotation={rotation} scale={scale} castShadow><meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={.8} /></mesh>;
}
function Stem({ points, color = '#6b6850', radius = .025 }) { const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), [points]); return <mesh castShadow><tubeGeometry args={[curve, 12, radius, 5, false]} /><meshStandardMaterial color={color} roughness={.9} /></mesh>; }
// A localized bronze ring and four pollen-like glints make each target tangible.
// Reduced motion retains the visible selection ring without orbiting particles.
function InteractionGlow({ active, position, radius, paused, reduced, pulse }) {
  const orbit = useRef();
  const phase = useRef(0);

  useEffect(() => { phase.current = pulse * .6; }, [pulse]);
  useFrame((_, delta) => {
    if (!active || paused || reduced || !orbit.current) return;
    phase.current += Math.min(delta, .06) * .6;
    orbit.current.rotation.y = phase.current;
    orbit.current.children.forEach((sparkle, index) => {
      sparkle.position.y = .12 + Math.sin(phase.current * 2 + index * 1.7) * .06;
    });
  });

  return (
    <group position={position} visible={active}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <ringGeometry args={[radius * .87, radius, 48]} />
        <meshBasicMaterial color="#b28a46" transparent opacity={.55} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .002, 0]} raycast={() => null}>
        <ringGeometry args={[radius * 1.1, radius * 1.13, 48]} />
        <meshBasicMaterial color="#d0ac6a" transparent opacity={.45} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <group ref={orbit} visible={!reduced}>
        {[0, 1, 2, 3].map(index => {
          const angle = index * Math.PI / 2;
          return (
            <mesh key={index} position={[Math.cos(angle) * radius, .12, Math.sin(angle) * radius]} scale={[1, 1.6, 1]} raycast={() => null}>
              <octahedronGeometry args={[.05, 0]} />
              <meshBasicMaterial color="#fff1bd" transparent opacity={.95} toneMapped={false} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
function Scene({ paused, reduced, focus, pulse, onOpen, onTea, onLeaf, onFocus, onReady }) {
  const { camera, size, pointer, invalidate, gl } = useThree();
  const cup = useRef(), paper = useRef(), plant = useRef(), steam = useRef(), clock = useRef(0);
  const [hover, setHover] = useState('');
  const wood = useMemo(() => texture('wood'), []), menu = useMemo(() => texture('menu'), []);
  const bowl = useMemo(() => new THREE.LatheGeometry([[.0, .0], [.17, .0], [.2, .05], [.25, .13], [.31, .3], [.32, .36], [.29, .37], [.27, .31], [.22, .12], [.12, .075]].map(p => new THREE.Vector2(...p)), 40), []);
  useEffect(() => { camera.zoom = Math.min(size.width / 6.5, size.height / 4.7); camera.updateProjectionMatrix(); invalidate(); }, [size, camera, invalidate]);
  useEffect(() => { onReady(); }, [onReady]);
  useEffect(() => { invalidate(); }, [focus, pulse, invalidate]);
  useEffect(() => () => { wood.dispose(); menu.dispose(); bowl.dispose(); gl.domElement.style.cursor = ''; }, [wood, menu, bowl, gl]);
  const events = (id, action) => ({ onPointerOver: e => { e.stopPropagation(); setHover(id); onFocus(id); gl.domElement.style.cursor = 'pointer'; }, onPointerOut: () => { setHover(''); onFocus(''); gl.domElement.style.cursor = ''; }, onClick: e => { e.stopPropagation(); action(); } });
  const lit = id => hover === id || focus === id;
  useFrame((_, dt) => {
    if (paused || reduced) return;
    clock.current += Math.min(dt, .06); const t = clock.current;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, 6.6 + pointer.x * .65, .035);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 5.6 + pointer.y * .3, .035); camera.lookAt(0, 1.05, 0);
    if (paper.current) paper.current.position.y = THREE.MathUtils.lerp(paper.current.position.y, lit('menu') ? 1.31 : 1.23, .1);
    if (cup.current) cup.current.position.y = THREE.MathUtils.lerp(cup.current.position.y, lit('cup') ? .99 : .94, .1);
    if (plant.current) plant.current.rotation.z = Math.sin(t * .65) * (lit('leaf') ? .06 : .015);
    if (steam.current) { steam.current.children.forEach((m, i) => { m.position.y = .36 + ((t * .16 + i * .15 + pulse * .1) % .8); m.position.x = Math.sin(t * .8 + i) * .07; m.material.opacity = (.8 - (m.position.y - .36)) * (lit('cup') ? .62 : .32); }); }
  });
  return <>
    <color attach="background" args={['#eeeadd']} />
    <ambientLight intensity={1.1} color="#e6e9d9" /><hemisphereLight args={['#f8f0d8', '#788374', 1.8]} />
    <directionalLight position={[-3, 7, 5]} intensity={3} color="#ffe6b8" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-normalBias={.035} />
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -.42, 0]}><planeGeometry args={[200, 200]} /><shadowMaterial transparent opacity={.12} /></mesh>
    <group rotation={[0, -.1, 0]}>
      <mesh receiveShadow position={[0, -.22, 0]}><cylinderGeometry args={[2.95, 2.75, .38, 64]} /><meshStandardMaterial color="#a8ad95" roughness={1} /></mesh>
      <mesh receiveShadow position={[0, -.015, 0]}><cylinderGeometry args={[2.94, 2.94, .09, 64]} /><meshStandardMaterial color="#d7d6bd" roughness={1} /></mesh>
      {[[-1.7, -.2],[-1.1,-.55],[-.5,-.85],[.1,-1.05]].map(([x,z],i) => <mesh key={i} position={[x,.07,z]} rotation={[0,i*.7,0]} receiveShadow><cylinderGeometry args={[.29,.32,.08,7]} /><meshStandardMaterial color="#b6baa8" roughness={1} /></mesh>)}
      <group position={[0, 1.6, -1.35]}>
        <mesh castShadow receiveShadow><torusGeometry args={[1.37,.15,12,80]} /><meshStandardMaterial color="#e5e1cc" roughness={.92} /></mesh>
        <mesh position={[0,0,-.1]}><torusGeometry args={[1.37,.17,10,80]} /><meshStandardMaterial color="#acb39e" roughness={.92} /></mesh>
        {[-1,1].map(side => <group key={side} position={[side*1.95,-.2,-.05]}><Box position={[0,0,0]} scale={[.78,2.5,.22]} color="#e2ddc6"/><Box position={[0,1.29,0]} scale={[.95,.14,.36]} color="#647263"/>{[-.23,0,.23].map(x=><Box key={x} position={[x,.3,.14]} scale={[.025,1.3,.02]} color="#b6baa3"/>)}</group>)}
      </group>
      {/* Faceted mountains remain beyond the gate, with distinct silhouettes. */}
      {[[-.95,.68,-2.05,1.05,'#aebba1'],[.25,.85,-2.25,1.25,'#b9c4ae'],[1.2,.55,-2.05,.85,'#8fa58b']].map(([x,y,z,s,c],i) => <mesh key={i} position={[x,y,z]} scale={[s,1,s*.38]}><coneGeometry args={[.9,y*2,5]} /><meshStandardMaterial color={c} roughness={1} /></mesh>)}
      <mesh position={[-.9,2.48,-2.1]}><sphereGeometry args={[.22,24,16]} /><meshBasicMaterial color="#f3cf82" /></mesh>
      <group position={[0,.61,.75]}>
        <mesh castShadow receiveShadow><boxGeometry args={[3.2,.14,1.58]} /><meshStandardMaterial map={wood} color="#c8ab7f" roughness={.72} /></mesh>
        {[[-1.2,.5],[1.2,.5],[-1.2,-.5],[1.2,-.5]].map(([x,z],i)=><Box key={i} position={[x,-.32,z]} scale={[.12,.6,.12]} color="#847154"/>)}
        <Box position={[0,-.18,.5]} scale={[2.55,.15,.09]} color="#a38b64"/>
      </group>
      <group ref={paper} position={[.65,1.23,.68]} rotation={[-.52,-.13,-.08]} {...events('menu', onOpen)}>
        <mesh castShadow receiveShadow><boxGeometry args={[1.04,1.4,.045]} /><meshStandardMaterial color={lit('menu')?'#fff4d4':'#e1d0a7'} roughness={.95} /></mesh>
        <mesh position={[0,0,.024]}><planeGeometry args={[1.02,1.38]} /><meshBasicMaterial map={menu} color={lit('menu')?'#ffffff':'#f2ecdd'} toneMapped={false} /></mesh>
        <mesh position={[-.49,0,.03]}><boxGeometry args={[.025,1.4,.015]} /><meshStandardMaterial color="#b49a63"/></mesh>
      </group>
      <InteractionGlow active={lit('menu')} position={[.65,.695,.72]} radius={.74} paused={paused} reduced={reduced} pulse={pulse} />
      <InteractionGlow active={lit('cup')} position={[-.68,.702,1.05]} radius={.53} paused={paused} reduced={reduced} pulse={pulse} />
      <InteractionGlow active={lit('leaf')} position={[-1.98,.058,-.62]} radius={.43} paused={paused} reduced={reduced} pulse={pulse} />
      <group ref={cup} position={[-.68,.94,1.05]} {...events('cup', onTea)}>
        <mesh><sphereGeometry args={[.37,12,8]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh>
        <mesh position={[0,-.19,0]} castShadow><cylinderGeometry args={[.43,.39,.045,48]} /><meshStandardMaterial color="#aec3ad" roughness={.3} /></mesh>
        <mesh geometry={bowl} position={[0,-.16,0]} castShadow receiveShadow><meshPhysicalMaterial color={lit('cup')?'#c7dcca':'#aec9b8'} roughness={.22} metalness={.02} clearcoat={.8} /></mesh>
        <mesh position={[0,.15,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.277,40]} /><meshStandardMaterial color="#74522b" roughness={.23} metalness={.1} /></mesh>
        <group ref={steam}>{[0,1,2].map(i => <mesh key={i} position={[0,.4+i*.18,0]} rotation={[0,i,0]}><torusGeometry args={[.085+i*.018,.009,5,24,Math.PI*1.5]} /><meshBasicMaterial color="#fff9e9" transparent opacity={.35} depthWrite={false} /></mesh>)}</group>
      </group>
      <group position={[-1.23,.83,.3]}>
        <mesh castShadow><sphereGeometry args={[.29,32,20]} /><meshPhysicalMaterial color="#718d75" roughness={.26} clearcoat={.8}/></mesh>
        <mesh position={[0,.24,0]} castShadow><cylinderGeometry args={[.13,.2,.055,28]}/><meshStandardMaterial color="#7d967d" roughness={.3}/></mesh>
        <mesh position={[0,.29,0]}><sphereGeometry args={[.045,16,12]}/><meshStandardMaterial color="#56745e"/></mesh>
        <mesh position={[-.28,.03,0]} rotation={[0,0,.5]} castShadow><coneGeometry args={[.08,.35,20]}/><meshStandardMaterial color="#718d75" roughness={.3}/></mesh>
        <mesh position={[.27,.02,0]} rotation={[0,Math.PI/2,0]} castShadow><torusGeometry args={[.16,.035,8,32]}/><meshStandardMaterial color="#718d75" roughness={.3}/></mesh>
      </group>
      <group position={[-1.98,.05,-.62]} ref={plant} {...events('leaf', onLeaf)}>
        <mesh position={[0,.24,0]} castShadow><cylinderGeometry args={[.29,.21,.47,24]}/><meshStandardMaterial color="#937a59" roughness={.9}/></mesh>
        <mesh position={[0,.48,0]}><cylinderGeometry args={[.25,.25,.015,24]}/><meshStandardMaterial color="#595a40"/></mesh>
        <Stem points={[[0,.48,0],[.04,1.15,0],[-.2,1.85,0]]}/>
        {Array.from({length:8},(_,i)=><Leaf key={i} position={[.03-i*.017,.65+i*.16,0]} rotation={[.2,(i%2?-.6:.5),i%2?-.85:.85]} scale={.53+(i%3)*.07} color={lit('leaf')?'#8caa69':i%2?'#567854':'#7c8d5f'}/>)}
      </group>
      <group position={[1.95,1.58,-.95]}>
        <Box position={[0,.68,0]} scale={[.025,.55,.025]} color="#746c4a"/>
        <mesh castShadow><sphereGeometry args={[.24,12,14]}/><meshStandardMaterial color="#e6c68e" emissive="#dca45c" emissiveIntensity={.35} roughness={.8}/></mesh>
        <Box position={[0,-.25,0]} scale={[.19,.055,.19]} color="#7b6648"/>
      </group>
      {[[-2.3,1.05],[2.1,.65],[1.9,-1.7]].map(([x,z],i)=><mesh key={i} position={[x,.12,z]} rotation={[0,i,.2]} castShadow><dodecahedronGeometry args={[.26,0]}/><meshStandardMaterial color="#98a18b" roughness={1}/></mesh>)}
    </group>
  </>;
}
class SceneBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    this.props.onError(error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function mount(host, options = {}) {
  const probe = document.createElement('canvas');
  const context = probe.getContext('webgl2', { failIfMajorPerformanceCaveat: false });
  if (!context) {
    throw new Error('WebGL2 unavailable');
  }
  context.getExtension('WEBGL_lose_context')?.loseContext();

  const root = createRoot(host);
  let disposed = false;
  let paused = !!options.paused;
  let reduced = !!options.reduced;
  let focus = '';
  let pulse = 0;
  let canvas = null;

  function ready() {
    if (!disposed) options.onReady?.();
  }

  function activateTea() {
    focus = 'cup';
    pulse += 1;
    options.onTea?.();
    render();
  }

  function activateLeaf() {
    focus = 'leaf';
    pulse += 1;
    options.onLeaf?.();
    render();
  }

  function handleContextLoss(event) {
    options.onError?.(event);
  }

  function configureRenderer({ camera, gl }) {
    camera.lookAt(0, 1.05, 0);
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
    canvas = gl.domElement;
    canvas.setAttribute('aria-label', '立冬三维庭院：青瓷茶盏、木案食单与月洞门');
    canvas.setAttribute('role', 'img');
    canvas.addEventListener('webglcontextlost', handleContextLoss);
  }

  function render() {
    if (disposed) return;
    root.render(
      <SceneBoundary onError={handleContextLoss}>
        <Canvas
          shadows
          dpr={[1, 1.5]}
          orthographic
          camera={{ position: [6.6, 5.6, 8.8], zoom: 65, near: .1, far: 100 }}
          frameloop={paused || reduced ? 'demand' : 'always'}
          gl={{ antialias: true, alpha: false, powerPreference: 'low-power' }}
          onCreated={configureRenderer}
        >
          <Scene
            paused={paused}
            reduced={reduced}
            focus={focus}
            pulse={pulse}
            onReady={ready}
            onOpen={() => options.onOpen?.()}
            onTea={activateTea}
            onLeaf={activateLeaf}
            onFocus={id => options.onFocus?.(id)}
          />
        </Canvas>
      </SceneBoundary>
    );
  }

  render();
  return {
    setPaused(value, lowMotion = reduced) {
      paused = value;
      reduced = lowMotion;
      render();
    },
    focus(id) {
      focus = id;
      render();
    },
    tea: activateTea,
    leaf: activateLeaf,
    dispose() {
      if (disposed) return;
      disposed = true;
      canvas?.removeEventListener('webglcontextlost', handleContextLoss);
      root.unmount();
    }
  };
}
