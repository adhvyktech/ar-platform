import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Camera, CameraOff } from 'lucide-react';

let GLTFLoader;
if (typeof window !== 'undefined') {
  import('three/examples/jsm/loaders/GLTFLoader').then((module) => {
    GLTFLoader = module.GLTFLoader;
  });
}

interface ARViewerProps {
  targetId: string;
  markerUrl: string;
  targetUrl: string;
}

const ARViewer: React.FC<ARViewerProps> = ({ targetId, markerUrl, targetUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    if (!targetId || !markerUrl || !targetUrl || !canvasRef.current) {
      setError('Invalid target information or scene reference');
      setIsLoading(false);
      return;
    }

    let scene: THREE.Scene,
        camera: THREE.PerspectiveCamera,
        renderer: THREE.WebGLRenderer,
        controls: OrbitControls;

    const init = async () => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);

      controls = new OrbitControls(camera, renderer.domElement);

      const ambientLight = new THREE.AmbientLight(0xcccccc, 0.5);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
      directionalLight.position.set(0, 5, 0);
      scene.add(directionalLight);

      camera.position.z = 5;

      const loader = new GLTFLoader();
      loader.load(
        targetUrl,
        (gltf) => {
          scene.add(gltf.scene);
          setIsLoading(false);
          setIsCameraActive(true);
        },
        undefined,
        (error) => {
          console.error('Error loading 3D model:', error);
          setError('Failed to load 3D model');
          setIsLoading(false);
        }
      );

      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();
    };

    init();

    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [targetId, markerUrl, targetUrl]);

  const toggleCamera = () => {
    setIsCameraActive(!isCameraActive);
    // In a real implementation, you would start/stop the AR.js source here
  };

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
    );
  }

  return (
    <div className="ar-viewer">
      {isLoading && (
        <div className="loading-overlay">
          <Loader2 className="loading-spinner" />
          <p>Loading AR experience...</p>
        </div>
      )}
      <canvas ref={canvasRef} className="ar-scene" />
      <Button
        className="camera-toggle"
        onClick={toggleCamera}
        variant="outline"
      >
        {isCameraActive ? <CameraOff /> : <Camera />}
      </Button>
    </div>
  );
};

export default ARViewer;