import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, MessageSquare, Send } from 'lucide-react';
import styles from '../styles/components/CollaborationPanel.module.css';

interface Message {
  id: string;
  user: string;
  content: string;
  timestamp: Date;
}

interface CollaborationPanelProps {
  projectId: string;
  currentUser: string;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ projectId, currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Simulated WebSocket connection
  useEffect(() => {
    const simulatedWebSocket = {
      send: (message: string) => {
        // Simulate receiving the message
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === 'chat') {
          setMessages(prevMessages => [...prevMessages, {
            id: Date.now().toString(),
            user: currentUser,
            content: parsedMessage.content,
            timestamp: new Date(),
          }]);
        }
      },
      // Simulate receiving messages and user updates
      onmessage: (callback: (event: { data: string }) => void) => {
        setInterval(() => {
          const randomUser = `User${Math.floor(Math.random() * 100)}`;
          callback({
            data: JSON.stringify({
              type: 'chat',
              user: randomUser,
              content: `Hello from ${randomUser}!`,
            }),
          });
        }, 5000);

        setInterval(() => {
          setOnlineUsers(prevUsers => {
            const newUser = `User${Math.floor(Math.random() * 100)}`;
            return [...new Set([...prevUsers, newUser])];
          });
        }, 3000);
      },
    };

    simulatedWebSocket.onmessage((event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chat') {
        setMessages(prevMessages => [...prevMessages, {
          id: Date.now().toString(),
          user: data.user,
          content: data.content,
          timestamp: new Date(),
        }]);
      }
    });

    return () => {
      // Clean up the simulated WebSocket
    };
  }, [currentUser]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real application, you would send this message through the WebSocket
      const message = {
        type: 'chat',
        content: newMessage,
      };
      // Simulate sending the message
      setMessages(prevMessages => [...prevMessages, {
        id: Date.now().toString(),
        user: currentUser,
        content: newMessage,
        timestamp: new Date(),
      }]);
      setNewMessage('');
    }
  };

  return (
    <Card className={styles.collaborationPanel}>
      <CardHeader>
        <CardTitle>Collaboration</CardTitle>
        <CardDescription>Project: {projectId}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={styles.onlineUsers}>
          <h3><Users className="inline-block mr-2" /> Online Users</h3>
          <div className={styles.avatarGroup}>
            {onlineUsers.map((user, index) => (
              <Avatar key={user} className={styles.avatar}>
                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user}`} alt={user} />
                <AvatarFallback>{user.slice(0, 2)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
        <div className={styles.chatArea}>
          <h3><MessageSquare className="inline-block mr-2" /> Chat</h3>
          <div className={styles.messages}>
            {messages.map((message) => (
              <div key={message.id} className={`${styles.message} ${message.user === currentUser ? styles.ownMessage : ''}`}>
                <strong>{message.user}: </strong>
                <span>{message.content}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className={styles.messageInput}>
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button onClick={handleSendMessage}>
            <Send className="mr-2" />
            Send
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CollaborationPanel;