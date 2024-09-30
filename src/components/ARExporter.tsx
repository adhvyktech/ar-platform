import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clipboard, Download, Share2, Globe, QrCode } from 'lucide-react';
import styles from '../styles/components/ARExporter.module.css';

interface ARExperience {
  id: string;
  name: string;
  elements: any[];
  animations: any[];
}

const ARExporter: React.FC<{ experience: ARExperience }> = ({ experience }) => {
  const [exportFormat, setExportFormat] = useState<'json' | 'gltf'>('json');
  const [isPublic, setIsPublic] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const [qrCode, setQrCode] = useState('');

  const handleExport = () => {
    let exportData;
    if (exportFormat === 'json') {
      exportData = JSON.stringify(experience, null, 2);
    } else {
      // Convert to glTF format (this is a placeholder, actual conversion would be more complex)
      exportData = JSON.stringify({ format: 'gltf', data: experience }, null, 2);
    }

    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${experience.name}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateLink = async () => {
    // This is a placeholder. In a real application, you would make an API call to create a shareable link
    const link = `https://ar-platform.com/experience/${experience.id}`;
    setShareableLink(link);

    // Generate QR code (this is a placeholder, you would use a QR code generation library in a real app)
    setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(link)}`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
  };

  return (
    <div className={styles.arExporter}>
      <h2 className={styles.title}>Export AR Experience</h2>
      <Tabs defaultValue="export" className={styles.tabs}>
        <TabsList>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
        </TabsList>
        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>Choose your export format and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.exportOptions}>
                <div className={styles.formatSelector}>
                  <Label htmlFor="exportFormat">Export Format</Label>
                  <select
                    id="exportFormat"
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as 'json' | 'gltf')}
                    className={styles.select}
                  >
                    <option value="json">JSON</option>
                    <option value="gltf">glTF</option>
                  </select>
                </div>
                <Button onClick={handleExport} className={styles.exportButton}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="share">
          <Card>
            <CardHeader>
              <CardTitle>Share Options</CardTitle>
              <CardDescription>Generate a shareable link for your AR experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.shareOptions}>
                <div className={styles.publicSwitch}>
                  <Switch
                    id="public-switch"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <Label htmlFor="public-switch">Make Public</Label>
                </div>
                <Button onClick={handleGenerateLink} disabled={!isPublic}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Generate Shareable Link
                </Button>
                {shareableLink && (
                  <div className={styles.shareableLink}>
                    <Input value={shareableLink} readOnly />
                    <Button onClick={handleCopyLink} className={styles.copyButton}>
                      <Clipboard className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                )}
                {qrCode && (
                  <div className={styles.qrCode}>
                    <Image src={qrCode} alt="QR Code for AR Experience" width={150} height={150} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ARExporter;