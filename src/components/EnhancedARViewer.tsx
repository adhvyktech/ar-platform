import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import styles from '../styles/components/EnhancedARViewer.module.css';

interface ARElement {
  id: string;
  type: 'model' | 'image' | 'video' | 'text';
  name: string;
  url?: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  content?: string;
}

interface Animation {
  targetId: string;
  property: 'position' | 'rotation' | 'scale';
  keyframes: { time: number; value: number[] }[];
}

interface ARExperience {
  id: string;
  name: string;
  elements: ARElement[];
  animations: Animation[];
}

const ARObject: React.FC<{ element: ARElement; isSelected: boolean; onSelect: () => void }> = ({ element, isSelected, onSelect }) => {
  const { scene } = useThree();
  const objectRef = useRef<THREE.Object3D>();

  useEffect(() => {
    if (element.type === 'model') {
      const { scene: modelScene } = useGLTF(element.url!);
      objectRef.current = modelScene.clone();
    } else if (element.type === 'image') {
      const texture = new THREE.TextureLoader().load(element.url!);
      const geometry = new THREE.PlaneGeometry(1, 1);
      const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
      objectRef.current = new THREE.Mesh(geometry, material);
    } else if (element.type === 'video') {
      const video = document.createElement('video');
      video.src = element.url!;
      video.loop = true;
      video.muted = true;
      video.play();
      const texture = new THREE.VideoTexture(video);
      const geometry = new THREE.PlaneGeometry(1, 1);
      const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
      objectRef.current = new THREE.Mesh(geometry, material);
    }

    if (objectRef.current) {
      objectRef.current.position.set(...element.position);
      objectRef.current.rotation.set(...element.rotation);
      objectRef.current.scale.setScalar(element.scale);
      scene.add(objectRef.current);
    }

    return () => {
      if (objectRef.current) {
        scene.remove(objectRef.current);
      }
    };
  }, [element, scene]);

  useFrame(() => {
    if (objectRef.current && isSelected) {
      objectRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group onClick={onSelect}>
      {element.type === 'text' && (
        <Text
          position={element.position}
          rotation={element.rotation}
          scale={[element.scale, element.scale, element.scale]}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {element.content}
        </Text>
      )}
      {isSelected && (
        <Html position={element.position}>
          <div className={styles.objectLabel}>{element.name}</div>
        </Html>
      )}
    </group>
  );
};

const EnhancedARViewer: React.FC<{ experience: ARExperience }> = ({ experience }) => {
  const [selectedElement, setSelectedElement] = useState<ARElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef(null);

  // Load models outside of the callback
  const { scene: modelScene } = useGLTF('/path/to/your/model.glb');

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const animate = () => {
      if (isPlaying) {
        setCurrentTime((prevTime) => (prevTime + 1 / 60) % 10); // 10-second loop
      }
      requestAnimationFrame(animate);
    };
    animate();
    
    // Your initialization code here
  }, [isPlaying]);

  const handleElementClick = (element: ARElement) => {
    setSelectedElement(element);
  };

  return (
    <div ref={containerRef} className={styles.enhancedARViewer}>
      <Canvas ref={canvasRef} camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        {experience.elements.map((element) => (
          <ARObject
            key={element.id}
            element={element}
            isSelected={selectedElement?.id === element.id}
            onSelect={() => handleElementClick(element)}
          />
        ))}
        <primitive object={modelScene.clone()} position={[0, 0, 0]} />
        <OrbitControls />
      </Canvas>
      {showControls && (
        <div className={styles.controls}>
          <Card>
            <CardHeader>
              <CardTitle>{experience.name}</CardTitle>
              <CardDescription>AR Experience Controls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.controlButtons}>
                <Button onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button onClick={() => setCurrentTime(0)}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
              <Slider
                value={[currentTime]}
                max={10}
                step={0.01}
                onValueChange={(value) => setCurrentTime(value[0])}
              />
              <div className={styles.switchContainer}>
                <Switch
                  checked={showControls}
                  onCheckedChange={setShowControls}
                  id="show-controls"
                />
                <label htmlFor="show-controls">Show Controls</label>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {selectedElement && (
        <div className={styles.elementInfo}>
          <h3>{selectedElement.name}</h3>
          <p>Type: {selectedElement.type}</p>
          <p>Position: {selectedElement.position.join(', ')}</p>
          <p>Rotation: {selectedElement.rotation.join(', ')}</p>
          <p>Scale: {selectedElement.scale}</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedARViewer;