import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Camera, CameraOff } from 'lucide-react';
import styles from '../styles/components/ARViewer.module.css';

interface ARViewerProps {
  targetId: string;
  markerUrl: string;
  targetUrl: string;
}

const ARViewer: React.FC<ARViewerProps> = ({ targetId, markerUrl, targetUrl }) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    if (!targetId || !markerUrl || !targetUrl || !sceneRef.current) {
      setError('Invalid target information or scene reference');
      setIsLoading(false);
      return;
    }

    let scene: THREE.Scene,
        camera: THREE.Camera,
        renderer: THREE.WebGLRenderer,
        arToolkitSource: any,
        arToolkitContext: any,
        markerRoot: THREE.Group;

    const init = async () => {
      scene = new THREE.Scene();
      camera = new THREE.Camera();
      scene.add(camera);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      sceneRef.current.appendChild(renderer.domElement);

      const ambientLight = new THREE.AmbientLight(0xcccccc, 0.5);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
      directionalLight.position.set(0, 5, 0);
      scene.add(directionalLight);

      arToolkitSource = new (window as any).THREEx.ArToolkitSource({ sourceType: 'webcam' });
      arToolkitContext = new (window as any).THREEx.ArToolkitContext({
        cameraParametersUrl: '/camera_para.dat',
        detectionMode: 'mono',
      });

      await new Promise<void>((resolve) => {
        arToolkitSource.init(() => {
          arToolkitSource.onResize(renderer.domElement);
          resolve();
        });
      });

      arToolkitContext.init(() => {
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
      });

      markerRoot = new THREE.Group();
      scene.add(markerRoot);

      const markerControls = new (window as any).THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
        type: 'pattern',
        patternUrl: markerUrl,
      });

      // Load target file based on its type
      const fileExtension = targetUrl.split('.').pop()?.toLowerCase();
      if (fileExtension === 'glb' || fileExtension === 'gltf') {
        const loader = new GLTFLoader();
        loader.load(
          targetUrl,
          (gltf) => {
            const model = gltf.scene;
            model.scale.set(0.1, 0.1, 0.1);
            markerRoot.add(model);
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
      } else if (fileExtension === 'jpg' || fileExtension === 'png' || fileExtension === 'gif') {
        const loader = new THREE.TextureLoader();
        loader.load(
          targetUrl,
          (texture) => {
            const material = new THREE.MeshBasicMaterial({ map: texture });
            const geometry = new THREE.PlaneGeometry(1, 1);
            const mesh = new THREE.Mesh(geometry, material);
            markerRoot.add(mesh);
            setIsLoading(false);
            setIsCameraActive(true);
          },
          undefined,
          (error) => {
            console.error('Error loading image:', error);
            setError('Failed to load image');
            setIsLoading(false);
          }
        );
      } else if (fileExtension === 'mp4' || fileExtension === 'webm') {
        const video = document.createElement('video');
        video.src = targetUrl;
        video.loop = true;
        video.muted = true;
        video.play();

        const texture = new THREE.VideoTexture(video);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const geometry = new THREE.PlaneGeometry(1, 1);
        const mesh = new THREE.Mesh(geometry, material);
        markerRoot.add(mesh);
        setIsLoading(false);
        setIsCameraActive(true);
      } else {
        setError('Unsupported file type');
        setIsLoading(false);
      }

      const animate = () => {
        requestAnimationFrame(animate);
        if (arToolkitSource.ready !== false) {
          arToolkitContext.update(arToolkitSource.domElement);
        }
        renderer.render(scene, camera);
      };
      animate();
    };

    init();

    const handleResize = () => {
      arToolkitSource.onResize(renderer.domElement);
      arToolkitSource.copySizeTo(renderer.domElement);
      if (arToolkitContext.arController !== null) {
        arToolkitSource.copySizeTo(arToolkitContext.arController.canvas);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current && renderer) {
        sceneRef.current.removeChild(renderer.domElement);
      }
    };
  }, [targetId, markerUrl, targetUrl]);

  const toggleCamera = () => {
    setIsCameraActive(!isCameraActive);
    // In a real implementation, you would start/stop the AR.js source here
  };

  if (error) {
    return (
      <Card className={styles.errorCard}>
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
    <div className={styles.arViewer}>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <Loader2 className={styles.loadingSpinner} />
          <p>Loading AR experience...</p>
        </div>
      )}
      <div ref={sceneRef} className={styles.arScene} />
      <Button
        className={styles.cameraToggle}
        onClick={toggleCamera}
        variant="outline"
      >
        {isCameraActive ? <CameraOff /> : <Camera />}
      </Button>
    </div>
  );
};

export default ARViewer;