import React from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link';

const Dashboard: React.FC = () => {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
            <CardDescription>Start a new AR experience</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/ar-builder" passHref>
              <Button>Create Project</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manage Assets</CardTitle>
            <CardDescription>Organize your 3D models, images, and videos</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/asset-management" passHref>
              <Button>Go to Assets</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Collaborate</CardTitle>
            <CardDescription>Work with others in real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/collaboration" passHref>
              <Button>Start Collaborating</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;