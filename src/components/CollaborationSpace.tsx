import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, MessageSquare, Share2, Save } from 'lucide-react';
import io from 'socket.io-client';
import styles from '../styles/components/CollaborationSpace.module.css';

interface User {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

interface ARElement {
  id: string;
  type: 'model' | 'image' | 'video' | 'text';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  content?: string;
  url?: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  timestamp: Date;
}

const socket = io('http://localhost:3001'); // Replace with your actual WebSocket server URL

const CollaborationSpace: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [elements, setElements] = useState<ARElement[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [models, setModels] = useState<{ id: number; position: [number, number, number] }[]>([]);

  const { scene: modelScene } = useGLTF('/path/to/your/model.glb');

  useEffect(() => {
    // Simulating user login
    const user: User = {
      id: 'user1',
      name: 'John Doe',
      avatar: '/placeholder.svg?height=40&width=40',
      color: '#ff0000',
    };
    setCurrentUser(user);
    socket.emit('join', user);

    socket.on('users', (connectedUsers: User[]) => {
      setUsers(connectedUsers);
    });

    socket.on('elementUpdate', (updatedElement: ARElement) => {
      setElements((prevElements) =>
        prevElements.map((el) => (el.id === updatedElement.id ? updatedElement : el))
      );
    });

    socket.on('newElement', (newElement: ARElement) => {
      setElements((prevElements) => [...prevElements, newElement]);
    });

    socket.on('deleteElement', (elementId: string) => {
      setElements((prevElements) => prevElements.filter((el) => el.id !== elementId));
    });

    socket.on('chatMessage', (message: ChatMessage) => {
      setChatMessages((prevMessages) => [...prevMessages, message]);
    });

    // Your initialization code here

    return () => {
      socket.off('users');
      socket.off('elementUpdate');
      socket.off('newElement');
      socket.off('deleteElement');
      socket.off('chatMessage');
    };
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleElementUpdate = (updatedElement: ARElement) => {
    socket.emit('elementUpdate', updatedElement);
  };

  const handleNewElement = (newElement: ARElement) => {
    socket.emit('newElement', newElement);
  };

  const handleDeleteElement = (elementId: string) => {
    socket.emit('deleteElement', elementId);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && currentUser) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: currentUser.id,
        message: messageInput.trim(),
        timestamp: new Date(),
      };
      socket.emit('chatMessage', newMessage);
      setMessageInput('');
    }
  };

  const handleAddModel = () => {
    const newModel = {
      id: Date.now(),
      position: [Math.random() * 4 - 2, 0, Math.random() * 4 - 2] as [number, number, number],
    };
    setModels((prevModels) => [...prevModels, newModel]);
  };

  // AR Scene Component
  const ARScene: React.FC = () => {
    const { scene } = useThree();
    const [loadedModels, setLoadedModels] = useState<THREE.Object3D[]>([]);

    // Load models outside of the callback
    useEffect(() => {
      const loadModel = async (url: string) => {
        const { scene: modelScene } = await useGLTF(url);
        setLoadedModels((prevModels) => [...prevModels, modelScene.clone()]);
      };

      elements.forEach((element) => {
        if (element.type === 'model' && element.url) {
          loadModel(element.url);
        }
      });

      return () => {
        scene.children.forEach((child) => {
          if (child.name.startsWith('element-')) {
            scene.remove(child);
          }
        });
      };
    }, [elements, scene]);

    // Add elements to the scene based on their types
    useEffect(() => {
      elements.forEach((element, index) => {
        let object: THREE.Object3D | null = null;

        if (loadedModels[index]) {
          object = loadedModels[index];
        } else if (element.type === 'image' || element.type === 'video') {
          const geometry = new THREE.PlaneGeometry(1, 1);
          const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
          if (element.type === 'image') {
            const texture = new THREE.TextureLoader().load(element.url!);
            material.map = texture;
          } else {
            const video = document.createElement('video');
            video.src = element.url!;
            video.loop = true;
            video.muted = true;
            video.play();
            const texture = new THREE.VideoTexture(video);
            material.map = texture;
          }
          object = new THREE.Mesh(geometry, material);
        } else if (element.type === 'text') {
          object = new Text(element.content || '', {
            font: '/path/to/your/font.ttf',
            fontSize: 0.5,
            color: 0xffffff,
          });
        }

        if (object) {
          object.position.set(...element.position);
          object.rotation.set(...element.rotation);
          object.scale.set(...element.scale);
          object.name = `element-${element.id}`;
          scene.add(object);
        }
      });

      // Add models from the new state
      models.forEach((model) => {
        const modelObject = modelScene.clone();
        modelObject.position.set(...model.position);
        modelObject.name = `model-${model.id}`;
        scene.add(modelObject);
      });

    }, [elements, loadedModels, scene, models]);

    return null;
  };

  return (
    <div className="collaboration-space h-screen flex flex-col">
      <Card className="flex-grow">
        <CardHeader>
          <CardTitle>Collaboration Space</CardTitle>
          <CardDescription>Work together in real-time</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex">
          <div className="w-3/4 h-full">
            <Canvas ref={canvasRef}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <OrbitControls />
              {models.map((model) => (
                <primitive
                  key={model.id}
                  object={modelScene.clone()}
                  position={model.position}
                  scale={[0.5, 0.5, 0.5]}
                />
              ))}
              <ARScene />
            </Canvas>
          </div>
          <div className="w-1/4 h-full overflow-y-auto p-4 bg-gray-100">
            <h3 className="text-lg font-semibold mb-4">Chat</h3>
            <div className="space-y-2" ref={chatContainerRef}>
              {chatMessages.map((message) => (
                <div key={message.id} className="bg-white p-2 rounded shadow">
                  <strong>{users.find((u) => u.id === message.userId)?.name}: </strong>
                  {message.message}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button onClick={handleAddModel}>Add Model</Button>
          <form onSubmit={handleSendMessage} className="flex-grow ml-4">
            <div className="flex space-x-2">
              <Input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow"
              />
              <Button type="submit">Send</Button>
            </div>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CollaborationSpace;