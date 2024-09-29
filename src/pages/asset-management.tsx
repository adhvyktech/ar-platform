import React from 'react';
import Layout from '../components/Layout';
import AssetManager from '../components/AssetManager';

const AssetManagementPage: React.FC = () => {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Asset Management</h1>
      <AssetManager />
    </Layout>
  );
};

export default AssetManagementPage;