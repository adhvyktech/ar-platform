import React from 'react';
import Layout from '../components/Layout';
import { Button } from "@/components/ui/button"
import Link from 'next/link';

const Home: React.FC = () => {
  return (
    <Layout>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to AR Platform</h1>
        <p className="mb-8">Create, collaborate, and experience augmented reality like never before.</p>
        <Link href="/dashboard" passHref>
          <Button size="lg">Get Started</Button>
        </Link>
      </div>
    </Layout>
  );
};

export default Home;