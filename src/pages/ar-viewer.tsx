import React from 'react';
import { useRouter } from 'next/router';
import ARViewer from '../components/ARViewer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import styles from '../styles/pages/ARViewer.module.css';

const ARViewerPage: React.FC = () => {
  const router = useRouter();
  const { targetId, markerUrl, targetUrl } = router.query;

  if (!targetId || !markerUrl || !targetUrl || 
      typeof targetId !== 'string' || 
      typeof markerUrl !== 'string' || 
      typeof targetUrl !== 'string') {
    return (
      <div className={styles.errorContainer}>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Invalid or missing target information.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ARViewer targetId={targetId} markerUrl={markerUrl} targetUrl={targetUrl} />;
};

export default ARViewerPage;