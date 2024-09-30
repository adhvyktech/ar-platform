import React, { useRef, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Camera, CameraOff } from 'lucide-react'

interface ARViewerProps {
  targetId: string
  markerUrl: string
  targetUrl: string
}

function Model({ url }: { url: string }) {
  const gltf = useGLTF(url) as GLTF
  return <primitive object={gltf.scene} />
}

function Scene({ targetUrl }: { targetUrl: string }) {
  const { camera } = useThree()
  
  React.useEffect(() => {
    camera.position.z = 5
  }, [camera])

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 5, 0]} intensity={0.7} />
      <Model url={targetUrl} />
      <OrbitControls />
    </>
  )
}

const ARViewer: React.FC<ARViewerProps> = ({ targetId, markerUrl, targetUrl }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)

  React.useEffect(() => {
    if (!targetId || !markerUrl || !targetUrl) {
      setError('Invalid target information')
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [targetId, markerUrl, targetUrl])

  const toggleCamera = () => {
    setIsCameraActive(!isCameraActive)
    // In a real implementation, you would start/stop the AR.js source here
  }

  if (error) {
    return (
      <Card className="error-card">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="ar-viewer" style={{ width: '100%', height: '100vh' }}>
      {isLoading && (
        <div className="loading-overlay">
          <Loader2 className="loading-spinner" />
          <p>Loading AR experience...</p>
        </div>
      )}
      <Canvas>
        <Scene targetUrl={targetUrl} />
      </Canvas>
      <Button
        className="camera-toggle"
        onClick={toggleCamera}
        variant="outline"
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 1000
        }}
      >
        {isCameraActive ? <CameraOff /> : <Camera />}
      </Button>
    </div>
  )
}

export default ARViewer