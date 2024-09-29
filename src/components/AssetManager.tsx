import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Cube, Image as ImageIcon, Video, File, Trash2, Edit2, Plus, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import styles from '../styles/components/AssetManager.module.css';

interface Asset {
  id: string;
  name: string;
  type: 'model' | 'image' | 'video' | 'other';
  url: string;
  thumbnail: string;
  tags: string[];
}

const AssetManager: React.FC<{ onAssetSelect: (asset: Asset) => void }> = ({ onAssetSelect }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<Asset['type'] | 'all'>('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    name: '',
    type: 'model',
    tags: [],
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const binaryStr = reader.result;
        // Here you would typically upload the file to your backend
        // For now, we'll just create a new asset with a local URL
        const newAsset: Asset = {
          id: Date.now().toString(),
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'model',
          url: URL.createObjectURL(file),
          thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : '/placeholder.svg',
          tags: [],
        };
        setAssets(prevAssets => [...prevAssets, newAsset]);
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  useEffect(() => {
    // In a real application, you would fetch assets from your backend here
    const mockAssets: Asset[] = [
      {
        id: '1',
        name: 'Cube',
        type: 'model',
        url: '/assets/models/cube.glb',
        thumbnail: '/assets/thumbnails/cube.png',
        tags: ['geometry', '3D'],
      },
      {
        id: '2',
        name: 'Logo',
        type: 'image',
        url: '/assets/images/logo.png',
        thumbnail: '/assets/images/logo.png',
        tags: ['branding', '2D'],
      },
      {
        id: '3',
        name: 'Product Demo',
        type: 'video',
        url: '/assets/videos/demo.mp4',
        thumbnail: '/assets/thumbnails/demo.jpg',
        tags: ['marketing', 'product'],
      },
    ];
    setAssets(mockAssets);
  }, []);

  const filteredAssets = assets.filter(asset => 
    (selectedType === 'all' || asset.type === selectedType) &&
    (asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleAssetUpload = () => {
    // In a real application, you would handle file upload to your backend here
    const uploadedAsset: Asset = {
      ...newAsset as Asset,
      id: Date.now().toString(),
      url: '/placeholder.svg',
      thumbnail: '/placeholder.svg',
    };
    setAssets([...assets, uploadedAsset]);
    setIsUploadDialogOpen(false);
    setNewAsset({ name: '', type: 'model', tags: [] });
  };

  const handleAssetDelete = (id: string) => {
    setAssets(assets.filter(asset => asset.id !== id));
    if (selectedAsset?.id === id) {
      setSelectedAsset(null);
    }
  };

  const handleAssetEdit = (id: string, updates: Partial<Asset>) => {
    setAssets(assets.map(asset => asset.id === id ? { ...asset, ...updates } : asset));
    if (selectedAsset?.id === id) {
      setSelectedAsset({ ...selectedAsset, ...updates });
    }
  };

  return (
    <div className={styles.assetManager}>
      <div className={styles.toolbar}>
        <Input
          type="text"
          placeholder="Search assets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={selectedType} onValueChange={(value) => setSelectedType(value as Asset['type'] | 'all')}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="model">3D Models</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus /> Upload Asset</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Asset</DialogTitle>
              <DialogDescription>Add a new asset to your library</DialogDescription>
            </DialogHeader>
            <div {...getRootProps()} className={styles.dropzone}>
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <p>Drag 'n' drop some files here, or click to select files</p>
              )}
            </div>
            <div className={styles.uploadForm}>
              <Label htmlFor="assetName">Asset Name</Label>
              <Input
                id="assetName"
                value={newAsset.name}
                onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
              />
              <Label htmlFor="assetType">Asset Type</Label>
              <Select
                value={newAsset.type}
                onValueChange={(value) => setNewAsset({ ...newAsset, type: value as Asset['type'] })}
              >
                <SelectTrigger id="assetType">
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="model">3D Model</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Label htmlFor="assetTags">Tags (comma-separated)</Label>
              <Input
                id="assetTags"
                value={newAsset.tags?.join(', ')}
                onChange={(e) => setNewAsset({ ...newAsset, tags: e.target.value.split(',').map(tag => tag.trim()) })}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleAssetUpload}>Upload</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className={styles.assetGrid}>
        {filteredAssets.map(asset => (
          <Card
            key={asset.id}
            className={`${styles.assetCard} ${selectedAsset?.id === asset.id ? styles.selected : ''}`}
            onClick={() => setSelectedAsset(asset)}
          >
            <CardContent>
              <img src={asset.thumbnail} alt={asset.name} className={styles.assetThumbnail} />
              <CardHeader>
                <CardTitle>{asset.name}</CardTitle>
                <CardDescription>{asset.type}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="ghost" size="icon" onClick={() => handleAssetDelete(asset.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setSelectedAsset(asset)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onAssetSelect(asset)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardFooter>
            </CardContent>
          </Card>
        ))}
      </div>
      {selectedAsset && (
        <div className={styles.assetDetails}>
          <h2>{selectedAsset.name}</h2>
          <p>Type: {selectedAsset.type}</p>
          <p>Tags: {selectedAsset.tags.join(', ')}</p>
          <div className={styles.assetPreview}>
            {selectedAsset.type === 'model' && (
              <ModelViewer url={selectedAsset.url} />
            )}
            {selectedAsset.type === 'image' && (
              <img src={selectedAsset.url} alt={selectedAsset.name} />
            )}
            {selectedAsset.type === 'video' && (
              <video src={selectedAsset.url} controls />
            )}
          </div>
          <Button onClick={() => onAssetSelect(selectedAsset)}>Add to AR Scene</Button>
        </div>
      )}
    </div>
  );
};

const ModelViewer: React.FC<{ url: string }> = ({ url }) => {
  const mountRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (mountRef.current) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      mountRef.current.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.25;
      controls.enableZoom = true;

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      const pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(5, 5, 5);
      scene.add(pointLight);

      const loader = new GLTFLoader();
      loader.load(url, (gltf) => {
        scene.add(gltf.scene);
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = 75;
        const cameraZ = maxDim / 2 / Math.tan((fov / 2) * Math.PI / 180);
        camera.position.z = cameraZ * 1.5;
        const minZ = box.min.z;
        const cameraToFarEdge = (cameraZ - minZ) * 3;
        camera.far = cameraToFarEdge;
        camera.updateProjectionMatrix();
        controls.maxDistance = cameraToFarEdge;
        controls.target.copy(center);
        controls.update();
      }, undefined, (error) => {
        console.error('An error occurred loading the model:', error);
      });

      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      return () => {
        if (mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
      };
    }
  }, [url]);

  return <div ref={mountRef} style={{ width: '100%', height: '300px' }} />;
};

export default AssetManager;