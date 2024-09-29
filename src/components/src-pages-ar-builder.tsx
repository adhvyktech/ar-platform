'use client'

import React, { useState } from 'react';
import Layout from '../components/Layout';
import ARBuilder from '../components/ARBuilder';
import AssetManager from '../components/AssetManager';
import ARViewer from '../components/ARViewer';
import CollaborationPanel from '../components/CollaborationPanel';
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  const [activeTab, setActiveTab] = useState<'builder' | 'assets' | 'preview' | 'collaborate'>('builder');

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

  return (
    <Layout>
      <div className={styles.arBuilderPage}>
        <h1 className="text-3xl font-bold mb-6">AR Builder</h1>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'builder' | 'assets' | 'preview' | 'collaborate')}>
          <TabsList>
            <TabsTrigger value="builder">Builder</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="collaborate">Collaborate</TabsTrigger>
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
          <TabsContent value="collaborate">
            <CollaborationPanel projectId="AR-Project-001" currentUser="CurrentUser" />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ARBuilderPage;