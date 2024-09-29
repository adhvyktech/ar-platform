import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Image, Video, Cube } from 'lucide-react';
import styles from '../styles/components/AssetLibrary.module.css';

interface Asset {
  id: string;
  name: string;
  type: 'model' | 'image' | 'video';
  url: string;
}

const AssetLibrary: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([
    { id: '1', name: 'Robot', type: 'model', url: '/assets/models/robot.glb' },
    { id: '2', name: 'Product Image', type: 'image', url: '/assets/images/product.jpg' },
    { id: '3', name: 'Tutorial Video', type: 'video', url: '/assets/videos/tutorial.mp4' },
  ]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      // In a real application, you would upload the file to a server here
      // For this example, we'll just add it to the assets array
      const newAsset: Asset = {
        id: Date.now().toString(),
        name: selectedFile.name,
        type: selectedFile.type.startsWith('image') ? 'image' : 
              selectedFile.type.startsWith('video') ? 'video' : 'model',
        url: URL.createObjectURL(selectedFile),
      };
      setAssets([...assets, newAsset]);
      setSelectedFile(null);
    }
  };

  const renderAssetIcon = (type: Asset['type']) => {
    switch (type) {
      case 'model':
        return <Cube className={styles.assetIcon} />;
      case 'image':
        return <Image className={styles.assetIcon} />;
      case 'video':
        return <Video className={styles.assetIcon} />;
    }
  };

  return (
    <div className={styles.assetLibrary}>
      <h1 className={styles.title}>Asset Library</h1>
      <div className={styles.uploadSection}>
        <Input type="file" onChange={handleFileChange} accept=".glb,.gltf,.jpg,.png,.mp4" />
        <Button onClick={handleUpload} disabled={!selectedFile}>
          <Upload className="mr-2 h-4 w-4" /> Upload Asset
        </Button>
      </div>
      <Tabs defaultValue="all" className={styles.tabs}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="models">3D Models</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className={styles.assetGrid}>
            {assets.map((asset) => (
              <Card key={asset.id} className={styles.assetCard}>
                <CardHeader>
                  <CardTitle className={styles.assetName}>{asset.name}</CardTitle>
                  <CardDescription>{asset.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderAssetIcon(asset.type)}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="models">
          <div className={styles.assetGrid}>
            {assets.filter(asset => asset.type === 'model').map((asset) => (
              <Card key={asset.id} className={styles.assetCard}>
                <CardHeader>
                  <CardTitle className={styles.assetName}>{asset.name}</CardTitle>
                  <CardDescription>{asset.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderAssetIcon(asset.type)}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="images">
          <div className={styles.assetGrid}>
            {assets.filter(asset => asset.type === 'image').map((asset) => (
              <Card key={asset.id} className={styles.assetCard}>
                <CardHeader>
                  <CardTitle className={styles.assetName}>{asset.name}</CardTitle>
                  <CardDescription>{asset.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderAssetIcon(asset.type)}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="videos">
          <div className={styles.assetGrid}>
            {assets.filter(asset => asset.type === 'video').map((asset) => (
              <Card key={asset.id} className={styles.assetCard}>
                <CardHeader>
                  <CardTitle className={styles.assetName}>{asset.name}</CardTitle>
                  <CardDescription>{asset.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderAssetIcon(asset.type)}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssetLibrary;