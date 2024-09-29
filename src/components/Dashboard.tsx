import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import styles from '../styles/components/Dashboard.module.css';

interface ARExperience {
  id: string;
  name: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const [experiences, setExperiences] = useState<ARExperience[]>([]);
  const router = useRouter();

  useEffect(() => {
    // In a real application, you would fetch the user's AR experiences from an API
    const mockExperiences: ARExperience[] = [
      { id: '1', name: 'My First AR Experience', createdAt: '2023-05-01' },
      { id: '2', name: 'Interactive Product Demo', createdAt: '2023-05-15' },
      { id: '3', name: 'AR Art Gallery', createdAt: '2023-05-20' },
    ];
    setExperiences(mockExperiences);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleCreateNew = () => {
    router.push('/ar-builder');
  };

  const handleViewExperience = (id: string) => {
    router.push(`/ar-viewer/${id}`);
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>AR Platform Dashboard</h1>
        <Button onClick={handleLogout}>Logout</Button>
      </header>
      <main className={styles.main}>
        <section className={styles.actions}>
          <Button onClick={handleCreateNew}>Create New AR Experience</Button>
        </section>
        <section className={styles.experiences}>
          <h2>Your AR Experiences</h2>
          <div className={styles.experienceGrid}>
            {experiences.map((experience) => (
              <Card key={experience.id} className={styles.experienceCard}>
                <CardHeader>
                  <CardTitle>{experience.name}</CardTitle>
                  <CardDescription>Created on: {experience.createdAt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => handleViewExperience(experience.id)}>View</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;