import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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

  const ARScene: React.FC = () => {
    const { scene } = useThree();

    useEffect(() => {
      elements.forEach((element) => {
        let object: THREE.Object3D | null = null;

        if (element.type === 'model') {
          const { scene: modelScene } = useGLTF(element.url!);
          object = modelScene.clone();
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
        }

        if (object) {
          object.position.set(...element.position);
          object.rotation.set(...element.rotation);
          object.scale.set(...element.scale);
          scene.add(object);
        }
      });

      return () => {
        elements.forEach((element) => {
          const object = scene.getObjectByName(element.id);
          if (object) {
            scene.remove(object);
          }
        });
      };
    }, [elements, scene]);

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
        </div>
        <div className={styles.arScene}>
          <Canvas>
            <ARScene />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <OrbitControls />
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default CollaborationSpace;