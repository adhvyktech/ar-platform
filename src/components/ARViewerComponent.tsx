import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ARViewerComponentProps {
  targetId: string;
  markerUrl: string;
  targetUrl: string;
}

const ARViewerComponent: React.FC<ARViewerComponentProps> = ({ targetId, markerUrl, targetUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });

    renderer.setSize(window.innerWidth, window.innerHeight);

    const controls = new OrbitControls(camera, renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    camera.position.z = 5;

    const loader = new GLTFLoader();
    loader.load(
      targetUrl,
      (gltf) => {
        scene.add(gltf.scene);
      },
      undefined,
      (error) => {
        console.error('An error occurred while loading the 3D model:', error);
      }
    );

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [targetUrl]);

  return (
    <Card className="w-full h-screen">
      <CardHeader>
        <CardTitle>AR Viewer</CardTitle>
      </CardHeader>
      <CardContent>
        <canvas ref={canvasRef} className="w-full h-full" />
        <div className="absolute bottom-4 left-4">
          <Button>Toggle AR Mode</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ARViewerComponent;