import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button"

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">AR Platform</Link>
          <div className="space-x-4">
            <Link href="/dashboard" passHref>
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/asset-management" passHref>
              <Button variant="ghost">Assets</Button>
            </Link>
            <Link href="/collaboration" passHref>
              <Button variant="ghost">Collaborate</Button>
            </Link>
          </div>
        </nav>
      </header>
      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>
      <footer className="bg-secondary text-secondary-foreground p-4">
        <div className="container mx-auto text-center">
          © 2023 AR Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;