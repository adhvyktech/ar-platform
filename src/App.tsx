import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Button } from "@/components/ui/button"
import Dashboard from './components/Dashboard';
import { default as ARViewerComponent } from './components/ARViewer';
import AssetLibrary from './components/AssetLibrary';
import ARBuilder from './components/ARBuilder';
import styles from './styles/App.module.css';
import { trackingConfig } from './hooks/useTracking';

interface ARViewerProps {
  targetId: string;
  markerUrl: string;
  targetUrl: string;
}

const ARViewer: React.FC<ARViewerProps> = ({ targetId, markerUrl, targetUrl }) => {
  return (
    <ARViewerComponent targetId={targetId} markerUrl={markerUrl} targetUrl={targetUrl} />
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Router>
        <div className={styles.app}>
          <header className={styles.header}>
            <nav>
              <ul className={styles.navList}>
                <li>
                  <Link to="/">
                    <Button variant="link">Dashboard</Button>
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
          <main className={styles.main}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/viewer" element={<ARViewerComponent targetId="your-target-id" markerUrl="/path/to/marker.patt" targetUrl="/path/to/target.glb" />} />
              <Route path="/assets" element={<AssetLibrary />} />
              <Route path="/builder" element={<ARBuilder elements={[]} onElementUpdate={() => {}} onElementAdd={() => {}} />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;