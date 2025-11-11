
"use client"

import { useEffect, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { MeshTransmissionMaterial } from "@react-three/drei"
import * as THREE from "three"

export type AgentState = null | "thinking" | "listening" | "talking"

export interface OrbProps {
  colors?: [string, string]
  colorsRef?: React.RefObject<[string, string]>
  resizeDebounce?: number
  seed?: number
  agentState?: AgentState
  volumeMode?: "auto" | "manual"
  manualInput?: number
  manualOutput?: number
  inputVolumeRef?: React.RefObject<number>
  outputVolumeRef?: React.RefObject<number>
  getInputVolume?: () => number
  getOutputVolume?: () => number
  className?: string
  inputLevel?: number
  outputLevel?: number
}

function OrbMesh({
  colors = ["#CADCFC", "#A0B9D1"],
  colorsRef,
  seed = Math.random() * 1000,
  agentState,
  volumeMode = "auto",
  manualInput,
  manualOutput,
  inputVolumeRef,
  outputVolumeRef,
  getInputVolume,
  getOutputVolume,
  inputLevel,
  outputLevel,
}: OrbProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<any>(null)
  const { viewport } = useThree()

  const [currentColors, setCurrentColors] = useState(colors)

  useEffect(() => {
    if (colorsRef?.current) {
      setCurrentColors(colorsRef.current)
    } else {
      setCurrentColors(colors)
    }
  }, [colors, colorsRef])

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return

    const time = state.clock.getElapsedTime()

    // Get volume based on mode
    let inputVolume = 0
    let outputVolume = 0

    if (volumeMode === "manual") {
      inputVolume = manualInput ?? 0
      outputVolume = manualOutput ?? 0
    } else {
      if (inputVolumeRef?.current !== undefined) {
        inputVolume = inputVolumeRef.current
      } else if (getInputVolume) {
        inputVolume = getInputVolume()
      } else if (inputLevel !== undefined) {
        inputVolume = inputLevel
      }

      if (outputVolumeRef?.current !== undefined) {
        outputVolume = outputVolumeRef.current
      } else if (getOutputVolume) {
        outputVolume = getOutputVolume()
      } else if (outputLevel !== undefined) {
        outputVolume = outputLevel
      }
    }

    const maxVolume = Math.max(inputVolume, outputVolume)
    const scale = 1 + maxVolume * 0.4

    // Agent state affects animation
    let rotationSpeed = 0.5
    let distortionAmount = 0.3
    let temporalDistortion = 0.1

    if (agentState === "talking") {
      rotationSpeed = 2.0
      distortionAmount = 0.6 + maxVolume * 0.6
      temporalDistortion = 0.3 + maxVolume * 0.4
    } else if (agentState === "listening") {
      rotationSpeed = 1.0
      distortionAmount = 0.4 + maxVolume * 0.3
      temporalDistortion = 0.2
    } else if (agentState === "thinking") {
      rotationSpeed = 1.2
      distortionAmount = 0.45
      temporalDistortion = 0.25
    }

    // Smooth flowing rotation
    meshRef.current.rotation.x = Math.sin(time * rotationSpeed + seed) * 0.2
    meshRef.current.rotation.y = time * rotationSpeed * 0.3
    meshRef.current.rotation.z = Math.cos(time * rotationSpeed * 0.7 + seed) * 0.1
    meshRef.current.scale.setScalar(scale)

    // Update material properties for flowing effect
    if (materialRef.current) {
      materialRef.current.distortion = distortionAmount
      materialRef.current.temporalDistortion = temporalDistortion
      materialRef.current.distortionScale = 0.6 + Math.sin(time * 0.5) * 0.2
    }
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.2, 5]} />
      <MeshTransmissionMaterial
        ref={materialRef}
        background={new THREE.Color(currentColors[0])}
        color={new THREE.Color(currentColors[1])}
        backside
        backsideThickness={0.8}
        thickness={0.8}
        distortion={0.3}
        temporalDistortion={0.1}
        distortionScale={0.6}
        transmission={1}
        roughness={0.15}
        metalness={0.05}
        clearcoat={1}
        clearcoatRoughness={0.05}
        anisotropy={0.8}
        chromaticAberration={0.15}
        samples={6}
        resolution={512}
      />
    </mesh>
  )
}

export function Orb({
  colors = ["#CADCFC", "#A0B9D1"],
  colorsRef,
  resizeDebounce = 100,
  seed,
  agentState,
  volumeMode = "auto",
  manualInput,
  manualOutput,
  inputVolumeRef,
  outputVolumeRef,
  getInputVolume,
  getOutputVolume,
  className = "",
  inputLevel,
  outputLevel,
}: OrbProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 50 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <directionalLight position={[-10, -10, -5]} intensity={0.6} />
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#CADCFC" />
        <OrbMesh
          colors={colors}
          colorsRef={colorsRef}
          seed={seed}
          agentState={agentState}
          volumeMode={volumeMode}
          manualInput={manualInput}
          manualOutput={manualOutput}
          inputVolumeRef={inputVolumeRef}
          outputVolumeRef={outputVolumeRef}
          getInputVolume={getInputVolume}
          getOutputVolume={getOutputVolume}
          inputLevel={inputLevel}
          outputLevel={outputLevel}
        />
      </Canvas>
    </div>
  )
}
