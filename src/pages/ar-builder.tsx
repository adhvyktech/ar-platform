import React, { useState } from 'react';
import Layout from '../components/Layout';
import ARBuilder from '../components/ARBuilder';
import AssetManager from '../components/AssetManager';
import ARViewer from '../components/ARViewer';
import TargetTrackingSetup from '../components/TargetTrackingSetup';
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, Link } from 'lucide-react';
import styles from '../styles/pages/ARBuilder.module.css';

interface ARElement {
  id: string;
  type: 'model' | 'image' | 'video' | 'text';
  name: string;
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  content?: string;
}

const ARBuilderPage: React.FC = () => {
  const [elements, setElements] = useState<ARElement[]>([]);
  const [activeTab, setActiveTab] = useState<'builder' | 'assets' | 'preview' | 'target'>('builder');
  const [targetInfo, setTargetInfo] = useState<{ targetId: string; qrCode: string; testUrl: string } | null>(null);

  const handleElementUpdate = (id: string, updates: Partial<ARElement>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const handleElementAdd = (element: ARElement) => {
    setElements([...elements, element]);
  };

  const handleAssetSelect = (asset: any) => {
    const newElement: ARElement = {
      id: Date.now().toString(),
      type: asset.type,
      name: asset.name,
      url: asset.url,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      content: asset.type === 'text' ? asset.content : undefined,
    };
    handleElementAdd(newElement);
  };

  const handleTargetCreated = (targetId: string, qrCode: string, testUrl: string) => {
    setTargetInfo({ targetId, qrCode, testUrl });
  };

  return (
    <Layout>
      <div className={styles.arBuilderPage}>
        <h1 className="text-3xl font-bold mb-6">AR Builder</h1>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'builder' | 'assets' | 'preview' | 'target')}>
          <TabsList>
            <TabsTrigger value="builder">Builder</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="target">Target Setup</TabsTrigger>
          </TabsList>
          <TabsContent value="builder">
            <ARBuilder
              elements={elements}
              onElementUpdate={handleElementUpdate}
              onElementAdd={handleElementAdd}
            />
          </TabsContent>
          <TabsContent value="assets">
            <AssetManager onAssetSelect={handleAssetSelect} />
          </TabsContent>
          <TabsContent value="preview">
            <ARViewer elements={elements} onElementUpdate={handleElementUpdate} />
          </TabsContent>
          <TabsContent value="target">
            <div className={styles.targetSetupContainer}>
              <TargetTrackingSetup onTargetCreated={handleTargetCreated} />
              {targetInfo && (
                <Card className={styles.targetInfo}>
                  <CardHeader>
                    <CardTitle>Target Created Successfully</CardTitle>
                    <CardDescription>Use the QR code or link below to test your AR experience</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={styles.qrCode}>
                      <img src={targetInfo.qrCode} alt="QR Code for AR experience" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild>
                      <a href={targetInfo.testUrl} target="_blank" rel="noopener noreferrer">
                        <Link className="mr-2 h-4 w-4" />
                        Open AR Viewer
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ARBuilderPage;