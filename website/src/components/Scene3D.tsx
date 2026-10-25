import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, useGLTF } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { scrollState, lerp, smoothstep } from '../lib/scrollState'

/** Spherical glass-shard blast — shards on a fibonacci sphere exploding from centre */
function Shards() {
  const { scene } = useGLTF('/models/alche_shards.glb')
  const group = useRef<THREE.Group>(null)
  const clusterRef = useRef<THREE.Group>(null)
  const core = useRef<THREE.Mesh>(null)
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])
  const cluster = useMemo(() => {
    const g = new THREE.Group()
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        const m = o as THREE.Mesh
        const raw = m.material as THREE.Material & Record<string, unknown>
        const isGlass = raw.transmission !== undefined
        const mat = raw as unknown as THREE.MeshPhysicalMaterial & THREE.MeshStandardMaterial
        if (mat && isGlass) {
          mat.transmission = 0.85
          mat.thickness = 1.8
          mat.roughness = 0.05
          mat.envMapIntensity = 3.0
          mat.ior = 1.6
          mat.color = new THREE.Color('#9db8ff')
          mat.attenuationDistance = 2.5
          mat.attenuationColor = new THREE.Color('#3355ff')
          mat.emissive = new THREE.Color('#1a2fbb')
          mat.emissiveIntensity = 0.25
        } else if (mat) {
          mat.metalness = 1
          mat.roughness = 0.08
          mat.envMapIntensity = 3.2
          mat.color = new THREE.Color('#dfe8ff')
          mat.emissive = new THREE.Color('#2233aa')
          mat.emissiveIntensity = 0.15
        }
        mat.needsUpdate = true
      }
    })
    g.add(scene)
    return g
  }, [scene])

  const glassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#a8c0ff',
        metalness: 0.1,
        roughness: 0.04,
        transmission: 0.75,
        thickness: 1.4,
        ior: 1.55,
        envMapIntensity: 3.5,
        emissive: new THREE.Color('#2244dd'),
        emissiveIntensity: 0.4,
        side: THREE.DoubleSide,
      }),
    [],
  )
  const chromeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#e8eeff',
        metalness: 1,
        roughness: 0.1,
        envMapIntensity: 3.5,
        emissive: new THREE.Color('#1a2a99'),
        emissiveIntensity: 0.25,
      }),
    [],
  )
  const coreMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#4d7cff'),
        transparent: true,
        opacity: 0.85,
      }),
    [],
  )

  // fibonacci-sphere shard cloud
  const shards = useMemo(() => {
    const N = 42
    const golden = Math.PI * (3 - Math.sqrt(5))
    const arr: {
      dir: THREE.Vector3
      rot: THREE.Euler
      scale: number
      kind: number
      spin: number
    }[] = []
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2
      const r = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = golden * i
      arr.push({
        dir: new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r),
        rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
        scale: 0.1 + Math.random() * 0.38,
        kind: i % 3,
        spin: 0.15 + Math.random() * 0.55,
      })
    }
    return arr
  }, [])

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    const s = scrollState
    const heroFly = s.hero

    // blast radius: tight at load, blooms open, drifts back through hero
    const bloom = smoothstep(0, 0.35, 0.15 + heroFly * 0.85 + Math.sin(t * 0.35) * 0.04)
    const radius = lerp(0.35, 2.6, bloom)

    group.current.rotation.y = t * 0.12 + heroFly * 1.4 + s.works * 0.7
    group.current.rotation.x = Math.sin(t * 0.18) * 0.18 + s.works * 0.3
    group.current.position.z = lerp(1.8, -6.0, heroFly) + s.works * -1.6
    group.current.position.x = s.px * 0.45
    group.current.position.y = s.py * -0.3 + Math.sin(t * 0.2) * 0.15
    const fade = 1 - smoothstep(0.82, 1, s.about)
    // shrink/dim blast during works so gallery cards stay the star
    const worksDamp = 1 - smoothstep(0.02, 0.2, s.works) * 0.55
    group.current.scale.setScalar(lerp(1.15, 1.85, heroFly) * fade * worksDamp)
    group.current.visible = fade > 0.02

    group.current.children.forEach((child) => {
      // GLB cluster stays near the core
      if ((child as THREE.Group).isObject3D && child.userData.blend) {
        child.position.set(0, 0, 0)
        child.rotation.y = t * 0.25
        return
      }
    })

    for (let i = 0; i < shards.length; i++) {
      const mesh = meshRefs.current[i]
      const cfg = shards[i]
      if (!mesh || !cfg) continue
      const rr = radius + Math.sin(t * 0.8 + i * 1.3) * 0.12
      mesh.position.copy(cfg.dir).multiplyScalar(rr)
      mesh.rotation.x = cfg.rot.x + t * cfg.spin
      mesh.rotation.y = cfg.rot.y + t * cfg.spin * 0.7
      const sc = cfg.scale * lerp(0.55, 1.2, bloom)
      mesh.scale.setScalar(sc)
    }

    if (core.current) {
      const sc = (0.28 + Math.sin(t * 2.4) * 0.035 + bloom * 0.22) * (1 - smoothstep(0.92, 1, s.about))
      core.current.scale.setScalar(sc)
      core.current.position.copy(group.current.position)
      coreMat.opacity = 0.55 + Math.sin(t * 3.1) * 0.15
    }
  })

  return (
    <>
      <group ref={group}>
        {/* GLB glass cluster near core */}
        <group userData={{ blend: true }} scale={0.55}>
          <primitive object={cluster} />
        </group>
        {/* procedural spherical shard blast */}
        {shards.map((cfg, i) => (
          <mesh
            key={i}
            ref={(el) => {
              meshRefs.current[i] = el
            }}
            rotation={[cfg.rot.x, cfg.rot.y, cfg.rot.z]}
            material={cfg.kind === 0 ? glassMat : chromeMat}
          >
            {cfg.kind === 0 ? <octahedronGeometry args={[1, 0]} /> : <tetrahedronGeometry args={[1, 0]} />}
          </mesh>
        ))}
      </group>
      {/* glowing blast core */}
      <mesh ref={core} material={coreMat}>
        <sphereGeometry args={[1, 32, 32]} />
      </mesh>
    </>
  )
}

function LogoTriangle() {
  const { scene } = useGLTF('/models/alche_logo.glb')
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    const s = scrollState
    // big glass A that sits behind hero type, drifts with works cards
    ref.current.rotation.y = Math.sin(t * 0.3) * 0.35 + s.works * 2.4
    ref.current.rotation.z = Math.sin(t * 0.2) * 0.06
    ref.current.position.set(
      lerp(0, 0.2, s.hero) + s.px * 0.3,
      lerp(-0.2, 0.1, s.works) + Math.sin(t * 0.5) * 0.08,
      lerp(-1.5, -3.2, s.hero) + s.works * 1.2,
    )
    const sc = lerp(0.8, 1.6, smoothstep(0, 0.35, s.hero)) * (1 - smoothstep(0.9, 1, s.about))
    ref.current.scale.setScalar(sc)
  })
  return (
    <group ref={ref}>
      <primitive object={scene} />
    </group>
  )
}

function IriRing() {
  const { scene } = useGLTF('/models/alche_ring.glb')
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    const s = scrollState
    // only visible during services (white chapter) — dimmed ghost ring
    const vis = smoothstep(0.62, 0.72, s.progress) * (1 - smoothstep(0.82, 0.9, s.progress))
    ref.current.visible = vis > 0.01
    ref.current.rotation.x = t * 0.25
    ref.current.rotation.y = t * 0.18
    ref.current.position.set(0, 0, -2)
    ref.current.scale.setScalar(1.6 * vis)
  })
  return (
    <group ref={ref}>
      <primitive object={scene} />
    </group>
  )
}

/** Dark digital-tile room (instanced panels like an LED virtual studio) */
function TileRoom() {
  const ref = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const tiles = useMemo(() => {
    const arr: { x: number; y: number; z: number; ry: number; s: number; e: number }[] = []
    // curved back wall
    for (let ix = -10; ix <= 10; ix++) {
      for (let iy = -5; iy <= 5; iy++) {
        const a = ix * 0.12
        arr.push({
          x: Math.sin(a) * 9,
          y: iy * 1.05,
          z: -Math.cos(a) * 9 + 2,
          ry: a,
          s: 0.96,
          e: 0.35 + Math.random() * 0.65,
        })
      }
    }
    // floor
    for (let ix = -8; ix <= 8; ix++) {
      for (let iz = 0; iz < 8; iz++) {
        arr.push({
          x: ix * 1.1,
          y: -6.0,
          z: iz * 1.1 - 3,
          ry: 0,
          s: 1.0,
          e: 0.15 + Math.random() * 0.3,
        })
      }
    }
    return arr
  }, [])

  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0a1030',
        emissive: '#0b1e6e',
        emissiveIntensity: 0.55,
        roughness: 0.4,
        metalness: 0.6,
      }),
    [],
  )

  useFrame((state) => {
    const mesh = ref.current
    if (!mesh) return
    const t = state.clock.elapsedTime
    const s = scrollState
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i]
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.2 + i * 0.37)
      dummy.position.set(tile.x, tile.y, tile.z)
      dummy.rotation.set(0, tile.ry, 0)
      const sc = tile.s * (0.92 + pulse * 0.06)
      dummy.scale.set(sc, sc, 0.08)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      const c = 0.25 + tile.e * pulse * 0.8
      mesh.setColorAt(i, tmpColor.setRGB(c * 0.25, c * 0.4, c * 1.2))
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    // room fades away for the white chapter
    const dim = 1 - smoothstep(0.55, 0.68, s.progress)
    mat.emissiveIntensity = 0.55 * dim
    mat.opacity = dim
    mat.transparent = dim < 0.99
    mesh.visible = dim > 0.02
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, tiles.length]} material={mat} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
    </instancedMesh>
  )
}

const tmpColor = new THREE.Color()

function Rig() {
  const { camera } = useThree()
  useFrame((state) => {
    const s = scrollState
    const t = state.clock.elapsedTime
    // camera choreography: dolly back through hero, push into works, rise for about, settle for featured
    const z = lerp(6.5, 5.2, smoothstep(0, 0.18, s.progress)) + s.works * 0.8 + smoothstep(0.55, 0.75, s.progress) * 2.2
    const y = lerp(0, 0.6, s.hero) + smoothstep(0.55, 0.75, s.progress) * 1.4
    const x = s.px * 0.5 + s.works * Math.sin(s.works * Math.PI) * 0.4
    camera.position.set(x, y + Math.sin(t * 0.3) * 0.05, z)
    camera.lookAt(0, s.works * -0.3, -2)
  })
  return null
}

export default function Scene3D() {
  // phones get a lighter DPR + fewer post effects for battery/thermals
  const isPhone = typeof window !== 'undefined' && window.innerWidth < 640
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        dpr={isPhone ? [1, 1.25] : [1, 1.75]}
        gl={{ antialias: !isPhone, alpha: false, powerPreference: 'high-performance' }}
        camera={{ fov: isPhone ? 52 : 42, position: [0, 0, 6.5], near: 0.1, far: 60 }}
      >
        <color attach="background" args={['#04050c']} />
        <fog attach="fog" args={['#04050c', 8, 26]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 6, 6]} intensity={1.4} color="#9db4ff" />
        <directionalLight position={[-6, -2, 4]} intensity={0.6} color="#4d6bff" />
        <Environment resolution={256}>
          <Lightformer intensity={2.4} color="#6f8cff" position={[0, 4, -6]} scale={[10, 6, 1]} />
          <Lightformer intensity={1.6} color="#ffffff" position={[5, 0, 2]} rotation={[0, -Math.PI / 3, 0]} scale={[4, 8, 1]} />
          <Lightformer intensity={1.2} color="#2233aa" position={[-6, 0, 1]} rotation={[0, Math.PI / 3, 0]} scale={[4, 8, 1]} />
          <Lightformer intensity={2.0} color="#ffffff" position={[0, -3, 3]} scale={[8, 2, 1]} />
        </Environment>
        <TileRoom />
        <LogoTriangle />
        <Shards />
        <IriRing />
        <Rig />
        <EffectComposer>
          <Bloom intensity={0.85} luminanceThreshold={0.55} luminanceSmoothing={0.25} mipmapBlur />
          <ChromaticAberration offset={[0.0009, 0.0006]} />
          <Vignette eskil={false} offset={0.25} darkness={0.75} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}

useGLTF.preload('/models/alche_shards.glb')
useGLTF.preload('/models/alche_logo.glb')
useGLTF.preload('/models/alche_ring.glb')
