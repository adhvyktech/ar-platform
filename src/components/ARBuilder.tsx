import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Box, Image as ImageIcon, Video, Type, Trash2, Copy, Eye, EyeOff } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export interface ARElement {
  id: string;
  type: 'image' | 'video' | 'text' | '3d';
  content: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

interface ARBuilderProps {
  elements: ARElement[];
  onElementUpdate: (updatedElement: ARElement) => void;
  onElementAdd: (newElement: ARElement) => void;
}

const ARBuilder: React.FC<ARBuilderProps> = ({ elements, onElementUpdate, onElementAdd }) => {
  const [selectedElement, setSelectedElement] = useState<ARElement | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newElement: ARElement = {
          id: Date.now().toString(),
          type: file.type.startsWith('image/') ? 'image' : 'video',
          content: reader.result as string,
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        };
        onElementAdd(newElement);
      };
      reader.readAsDataURL(file);
    });
  }, [onElementAdd]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const addTextElement = () => {
    const newElement: ARElement = {
      id: Date.now().toString(),
      type: 'text',
      content: 'New Text',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    };
    onElementAdd(newElement);
  };

  const add3DElement = () => {
    const newElement: ARElement = {
      id: Date.now().toString(),
      type: '3d',
      content: '/path/to/default/3d/model.glb',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    };
    onElementAdd(newElement);
  };

  const updateElement = (id: string, updates: Partial<ARElement>) => {
    const updatedElement = elements.find(element => element.id === id);
    if (updatedElement) {
      onElementUpdate({ ...updatedElement, ...updates });
    }
  };

  const deleteElement = (id: string) => {
    // Implement delete functionality
  };

  const duplicateElement = (id: string) => {
    const elementToDuplicate = elements.find((element) => element.id === id);
    if (elementToDuplicate) {
      const newElement = {
        ...elementToDuplicate,
        id: Date.now().toString(),
        position: {
          x: elementToDuplicate.position.x + 0.1,
          y: elementToDuplicate.position.y + 0.1,
          z: elementToDuplicate.position.z,
        },
      };
      onElementAdd(newElement);
    }
  };

  return (
    <div className="ar-builder">
      <Card className="element-list">
        <CardHeader>
          <CardTitle>AR Elements</CardTitle>
          <CardDescription>Drag and drop or add elements to your AR scene</CardDescription>
        </CardHeader>
        <CardContent>
          <div {...getRootProps()} className="dropzone">
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>Drag 'n' drop some files here, or click to select files</p>
            )}
          </div>
          <div className="add-buttons">
            <Button onClick={addTextElement}><Type className="mr-2 h-4 w-4" /> Add Text</Button>
            <Button onClick={add3DElement}><Box className="mr-2 h-4 w-4" /> Add 3D Model</Button>
          </div>
          <ul className="elements-list">
            {elements.map((element) => (
              <li key={element.id} onClick={() => setSelectedElement(element)}>
                {element.type === 'image' && <ImageIcon />}
                {element.type === 'video' && <Video />}
                {element.type === 'text' && <Type />}
                {element.type === '3d' && <Box />}
                <span>{element.type} - {element.id}</span>
                <Button variant="ghost" size="icon" onClick={() => deleteElement(element.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => duplicateElement(element.id)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      {selectedElement && (
        <Card className="element-properties">
          <CardHeader>
            <CardTitle>Element Properties</CardTitle>
            <CardDescription>Edit the properties of the selected element</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="property-group">
              <Label htmlFor="elementType">Type</Label>
              <Select
                value={selectedElement.type}
                onValueChange={(value) => updateElement(selectedElement.id, { type: value as ARElement['type'] })}
              >
                <SelectTrigger id="elementType">
                  <SelectValue placeholder="Select element type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="3d">3D Model</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedElement.type === 'text' && (
              <div className="property-group">
                <Label htmlFor="textContent">Text Content</Label>
                <Input
                  id="textContent"
                  value={selectedElement.content}
                  onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                />
              </div>
            )}
            <div className="property-group">
              <Label>Position</Label>
              <div className="vector-input">
                <Input
                  type="number"
                  value={selectedElement.position.x}
                  onChange={(e) => updateElement(selectedElement.id, { position: { ...selectedElement.position, x: parseFloat(e.target.value) } })}
                />
                <Input
                  type="number"
                  value={selectedElement.position.y}
                  onChange={(e) => updateElement(selectedElement.id, { position: { ...selectedElement.position, y: parseFloat(e.target.value) } })}
                />
                <Input
                  type="number"
                  value={selectedElement.position.z}
                  onChange={(e) => updateElement(selectedElement.id, { position: { ...selectedElement.position, z: parseFloat(e.target.value) } })}
                />
              </div>
            </div>
            <div className="property-group">
              <Label>Rotation</Label>
              <div className="vector-input">
                <Input
                  type="number"
                  value={selectedElement.rotation.x}
                  onChange={(e) => updateElement(selectedElement.id, { rotation: { ...selectedElement.rotation, x: parseFloat(e.target.value) } })}
                />
                <Input
                  type="number"
                  value={selectedElement.rotation.y}
                  onChange={(e) => updateElement(selectedElement.id, { rotation: { ...selectedElement.rotation, y: parseFloat(e.target.value) } })}
                />
                <Input
                  type="number"
                  value={selectedElement.rotation.z}
                  onChange={(e) => updateElement(selectedElement.id, { rotation: { ...selectedElement.rotation, z: parseFloat(e.target.value) } })}
                />
              </div>
            </div>
            <div className="property-group">
              <Label>Scale</Label>
              <div className="vector-input">
                <Input
                  type="number"
                  value={selectedElement.scale.x}
                  onChange={(e) => updateElement(selectedElement.id, { scale: { ...selectedElement.scale, x: parseFloat(e.target.value) } })}
                />
                <Input
                  type="number"
                  value={selectedElement.scale.y}
                  onChange={(e) => updateElement(selectedElement.id, { scale: { ...selectedElement.scale, y: parseFloat(e.target.value) } })}
                />
                <Input
                  type="number"
                  value={selectedElement.scale.z}
                  onChange={(e) => updateElement(selectedElement.id, { scale: { ...selectedElement.scale, z: parseFloat(e.target.value) } })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ARBuilder;