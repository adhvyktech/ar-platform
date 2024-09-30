import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ARBuilder, { ARElement } from './components/ARBuilder';
import ARViewer from './components/ARViewer';
import AssetLibrary from './components/AssetLibrary';
import { Button } from "@/components/ui/button"

const App: React.FC = () => {
  const [elements, setElements] = useState<ARElement[]>([]);

  const handleElementUpdate = (updatedElement: ARElement) => {
    setElements(prevElements =>
      prevElements.map(el => el.id === updatedElement.id ? updatedElement : el)
    );
  };

  const handleElementAdd = (newElement: ARElement) => {
    setElements(prevElements => [...prevElements, newElement]);
  };

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>AR Platform</h1>
          <nav>
            <ul>
              <li>
                <Link to="/">
                  <Button variant="link">Home</Button>
                </Link>
              </li>
              <li>
                <Link to="/viewer">
                  <Button variant="link">AR Viewer</Button>
                </Link>
              </li>
              <li>
                <Link to="/assets">
                  <Button variant="link">Asset Library</Button>
                </Link>
              </li>
              <li>
                <Link to="/builder">
                  <Button variant="link">AR Builder</Button>
                </Link>
              </li>
            </ul>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<h2>Welcome to AR Platform</h2>} />
            <Route 
              path="/viewer" 
              element={
                <ARViewer 
                  targetId="sample-target-id" 
                  markerUrl="/path/to/marker.patt" 
                  targetUrl="/path/to/sample-model.glb" 
                />
              } 
            />
            <Route path="/assets" element={<AssetLibrary />} />
            <Route 
              path="/builder" 
              element={
                <ARBuilder 
                  elements={elements} 
                  onElementUpdate={handleElementUpdate} 
                  onElementAdd={handleElementAdd} 
                />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;