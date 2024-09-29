import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Cube, Image as ImageIcon, Video, Text, Trash2, Copy, Eye, EyeOff } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import styles from '../styles/components/ARBuilder.module.css';

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

interface ARBuilderProps {
  elements: ARElement[];
  onElementUpdate: (id: string, updates: Partial<ARElement>)

 => void;
  onElementAdd: (element: ARElement) => void;
}

const ARBuilder: React.FC<ARBuilderProps> = ({ elements, onElementUpdate, onElementAdd }) => {
  const [selectedElement, setSelectedElement] = useState<ARElement | null>(null);

  const handleElementSelect = (element: ARElement) => {
    setSelectedElement(element);
  };

  const handleElementDelete = (id: string) => {
    onElementUpdate(id, { position: [-1000, -1000, -1000] }); // Move off-screen instead of deleting
  };

  const handleElementDuplicate = (element: ARElement) => {
    const newElement = {
      ...element,
      id: Date.now().toString(),
      name: `${element.name} (Copy)`,
      position: [element.position[0] + 0.5, element.position[1] + 0.5, element.position[2]],
    };
    onElementAdd(newElement);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const binaryStr = reader.result;
        // Here you would typically upload the file to your backend
        // For now, we'll just create a new element with a local URL
        const newElement: ARElement = {
          id: Date.now().toString(),
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'model',
          url: URL.createObjectURL(file),
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
        };
        onElementAdd(newElement);
      };
      reader.readAsArrayBuffer(file);
    });
  }, [onElementAdd]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className={styles.arBuilder}>
      <div {...getRootProps()} className={styles.dropzone}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here to add them to the AR scene</p>
        )}
      </div>
      <div className={styles.elementList}>
        {elements.map(element => (
          <Card
            key={element.id}
            className={`${styles.elementCard} ${selectedElement?.id === element.id ? styles.selected : ''}`}
            onClick={() => handleElementSelect(element)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{element.name}</span>
                <div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onElementUpdate(element.id, { visible: !element.visible })}
                  >
                    {element.visible ? <Eye /> : <EyeOff />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleElementDuplicate(element)}
                  >
                    <Copy />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleElementDelete(element.id)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>{element.type}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
      {selectedElement && (
        <Card className={styles.elementProperties}>
          <CardHeader>
            <CardTitle>{selectedElement.name}</CardTitle>
            <CardDescription>{selectedElement.type}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.propertyGroup}>
              <Label>Position</Label>
              <div className={styles.vectorInput}>
                {['x', 'y', 'z'].map((axis, index) => (
                  <Input
                    key={axis}
                    type="number"
                    value={selectedElement.position[index]}
                    onChange={(e) => {
                      const newPosition = [...selectedElement.position];
                      newPosition[index] = parseFloat(e.target.value);
                      onElementUpdate(selectedElement.id, { position: newPosition as [number, number, number] });
                    }}
                  />
                ))}
              </div>
            </div>
            <div className={styles.propertyGroup}>
              <Label>Rotation</Label>
              <div className={styles.vectorInput}>
                {['x', 'y', 'z'].map((axis, index) => (
                  <Input
                    key={axis}
                    type="number"
                    value={selectedElement.rotation[index]}
                    onChange={(e) => {
                      const newRotation = [...selectedElement.rotation];
                      newRotation[index] = parseFloat(e.target.value);
                      onElementUpdate(selectedElement.id, { rotation: newRotation as [number, number, number] });
                    }}
                  />
                ))}
              </div>
            </div>
            <div className={styles.propertyGroup}>
              <Label>Scale</Label>
              <Slider
                value={[selectedElement.scale[0]]}
                min={0.1}
                max={2}
                step={0.1}
                onValueChange={([value]) => onElementUpdate(selectedElement.id, { scale: [value, value, value] })}
              />
            </div>
            {selectedElement.type === 'text' && (
              <div className={styles.propertyGroup}>
                <Label>Content</Label>
                <Input
                  value={selectedElement.content || ''}
                  onChange={(e) => onElementUpdate(selectedElement.id, { content: e.target.value })}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ARBuilder;