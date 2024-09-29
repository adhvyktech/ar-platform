import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Image as ImageIcon, QrCode } from 'lucide-react';
import useToast from "@/components/ui/use-toast"
import styles from '../styles/components/TargetTrackingSetup.module.css';

interface TargetTrackingSetupProps {
  onTargetCreated: (targetId: string, markerUrl: string, targetUrl: string, qrCode: string, testUrl: string) => void;
}

const TargetTrackingSetup: React.FC<TargetTrackingSetupProps> = ({ onTargetCreated }) => {
  const [markerImage, setMarkerImage] = useState<File | null>(null);
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

  const handleMarkerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMarkerImage(file);
    }
  };

  const handleTargetUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setTargetFile(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!markerImage || !targetFile) {
      showToast("Please provide both a marker image and a target file.", "error");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('marker', markerImage);
      formData.append('target', targetFile);

      const response = await fetch('/api/create-target', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create target');
      }

      const data = await response.json();
      onTargetCreated(data.targetId, data.markerUrl, data.targetUrl, data.qrCode, data.testUrl);

      showToast("Target created successfully.", "success");
    } catch (error) {
      console.error('Error creating target:', error);
      showToast("Failed to create target. Please try again.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className={styles.targetTrackingSetup}>
      <CardHeader>
        <CardTitle>Create AR Target</CardTitle>
        <CardDescription>Upload a marker image and target file for AR tracking</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <Label htmlFor="markerImage">Marker Image</Label>
            <div className={styles.fileUpload}>
              <Input
                id="markerImage"
                type="file"
                accept="image/*"
                onChange={handleMarkerUpload}
                className="hidden"
              />
              <Button type="button" onClick={() => document.getElementById('markerImage')?.click()}>
                <Upload className="mr-2 h-4 w-4" /> Choose Marker Image
              </Button>
              {markerImage && (
                <span className={styles.fileName}>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {markerImage.name}
                </span>
              )}
            </div>
          </div>
          <div className={styles.formGroup}>
            <Label htmlFor="targetFile">Target File (Image, Video, or 3D Model)</Label>
            <div className={styles.fileUpload}>
              <Input
                id="targetFile"
                type="file"
                accept="image/*,video/*,.glb,.gltf"
                onChange={handleTargetUpload}
                className="hidden"
              />
              <Button type="button" onClick={() => document.getElementById('targetFile')?.click()}>
                <Upload className="mr-2 h-4 w-4" /> Choose Target File
              </Button>
              {targetFile && (
                <span className={styles.fileName}>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {targetFile.name}
                </span>
              )}
            </div>
          </div>
          <Button type="submit" disabled={isUploading}>
            {isUploading ? 'Creating Target...' : 'Create Target'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TargetTrackingSetup;