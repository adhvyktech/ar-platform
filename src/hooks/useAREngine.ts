import { useState, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { Object3D } from 'three';
import { useFrame } from '@react-three/fiber';

interface ARElement {
  id: string;
  type: 'model' | 'image' | 'video';
  object: Object3D;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
}

interface AREngineState {
  elements: ARElement[];
  selectedElementId: string | null;
}

export function useAREngine() {
  const [state, setState] = useState<AREngineState>({
    elements: [],
    selectedElementId: null,
  });

  const sceneRef = useRef<THREE.Scene | null>(null);

  const addElement = useCallback((type: ARElement['type'], object: Object3D) => {
    const newElement: ARElement = {
      id: Date.now().toString(),
      type,
      object,
      position: new THREE.Vector3(),
      rotation: new THREE.Euler(),
      scale: new THREE.Vector3(1, 1, 1),
    };

    setState((prevState) => ({
      ...prevState,
      elements: [...prevState.elements, newElement],
      selectedElementId: newElement.id,
    }));

    if (sceneRef.current) {
      sceneRef.current.add(object);
    }

    return newElement.id;
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<ARElement>) => {
    setState((prevState) => ({
      ...prevState,
      elements: prevState.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    }));
  }, []);

  const removeElement = useCallback((id: string) => {
    setState((prevState) => {
      const elementToRemove = prevState.elements.find((el) => el.id === id);
      if (elementToRemove && sceneRef.current) {
        sceneRef.current.remove(elementToRemove.object);
      }
      return {
        ...prevState,
        elements: prevState.elements.filter((el) => el.id !== id),
        selectedElementId: prevState.selectedElementId === id ? null : prevState.selectedElementId,
      };
    });
  }, []);

  const selectElement = useCallback((id: string | null) => {
    setState((prevState) => ({
      ...prevState,
      selectedElementId: id,
    }));
  }, []);

  useFrame(() => {
    state.elements.forEach((element) => {
      element.object.position.copy(element.position);
      element.object.rotation.copy(element.rotation);
      element.object.scale.copy(element.scale);
    });
  });

  const setSceneRef = useCallback((scene: THREE.Scene | null) => {
    sceneRef.current = scene;
  }, []);

  return {
    elements: state.elements,
    selectedElementId: state.selectedElementId,
    addElement,
    updateElement,
    removeElement,
    selectElement,
    setSceneRef,
  };
}