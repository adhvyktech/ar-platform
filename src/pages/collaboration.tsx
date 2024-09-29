import React from 'react';
import Layout from '../components/Layout';
import CollaborationSpace from '../components/CollaborationSpace';

const CollaborationPage: React.FC = () => {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Collaboration Space</h1>
      <CollaborationSpace />
    </Layout>
  );
};

export default CollaborationPage;