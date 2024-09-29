import React from 'react';
import { useRouter } from 'next/router';
import ARExporter from '../components/ARExporter';
import { Button } from "@/components/ui/button"
import styles from '../styles/pages/ExportExperience.module.css';

const ExportExperiencePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  // In a real application, you would fetch the experience data based on the ID
  const mockExperience = {
    id: id as string,
    name: 'Sample AR Experience',
    elements: [
      // Your AR elements would go here
    ],
    animations: [
      // Your animations would go here
    ],
  };

  return (
    <div className={styles.exportPage}>
      <h1 className={styles.pageTitle}>Export AR Experience</h1>
      <ARExporter experience={mockExperience} />
      <Button onClick={() => router.push('/ar-builder')} className={styles.backButton}>
        Back to AR Builder
      </Button>
    </div>
  );
};

export default ExportExperiencePage;