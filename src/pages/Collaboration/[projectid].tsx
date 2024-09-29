import React from 'react';
import { useRouter } from 'next/router';
import CollaborationSpace from '../../components/CollaborationSpace';

const CollaborationPage: React.FC = () => {
  const router = useRouter();
  const { projectId } = router.query;

  return (
    <div>
      <h1>Collaboration Space - Project {projectId}</h1>
      <CollaborationSpace />
    </div>
  );
};

export default CollaborationPage;