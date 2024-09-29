import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const canvasRef = useRef(null);
  const [models, setModels] = useState<{ id: number; position: [number, number, number] }[]>([]);

  // Load models outside of the callback
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
    setModels((prevModels) => [...prevModels, { id: Date.now(), position: [0, 0, 0] }]);
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
          const textGeometry = new THREE.TextGeometry(element.content || '', {
            font: new THREE.FontLoader().parse(
              require('../assets/fonts/helvetiker_regular.typeface.json')
            ),
            size: 0.5,
            height: 0.1,
          });
          const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
          object = new THREE.Mesh(textGeometry, textMaterial);
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
    <div className={styles.collaborationSpace}>
      <div className={styles.sidebar}>
        <div className={styles.userList}>
          <h2>Collaborators</h2>
          {users.map((user) => (
            <TooltipProvider key={user.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className={styles.userAvatar}>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback style={{ backgroundColor: user.color }}>
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{user.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        <div className={styles.chat}>
          <h2>Chat</h2>
          <div className={styles.chatMessages} ref={chatContainerRef}>
            {chatMessages.map((message) => (
              <div key={message.id} className={styles.chatMessage}>
                <strong>{users.find((u) => u.id === message.userId)?.name}: </strong>
                {message.message}
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className={styles.chatInput}>
            <Input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
            />
            <Button type="submit">Send</Button>
          </form>
        </div>
      </div>
      <div className={styles.mainContent}>
        <div className={styles.toolbar}>
          <Button onClick={() => handleNewElement({ id: Date.now().toString(), type: 'model', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], url: '/assets/models/cube.glb' })}>
            Add Model
          </Button>
          <Button onClick={() => handleNewElement({ id: Date.now().toString(), type: 'image', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], url: '/placeholder.svg?height=512&width=512' })}>
            Add Image
          </Button>
          <Button onClick={() => handleNewElement({ id: Date.now().toString(), type: 'video', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], url: '/assets/videos/sample.mp4' })}>
            Add Video
          </Button>
          <Button onClick={() => handleNewElement({ id: Date.now().toString(), type: 'text', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], content: 'New Text' })}>
            Add Text
          </Button>
          <Button onClick={handleAddModel}>Add New Model</Button>
        </div>
        <div className={styles.arScene}>
          <Canvas ref={canvasRef}>
            <ARScene />
            <ambientLight intensity={0.5} />
            <pointLight position={10, 10, 10} />
            <OrbitControls />
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default CollaborationSpace;