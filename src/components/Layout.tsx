import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="container mx-auto px-4 py-4 md:py-6 flex justify-between items-center">
          <div>
            <Link
              to="/"
              className="text-2xl font-bold tracking-tight flex items-center"
            >
              <span className="text-primary inline-block mr-2 relative">
                <span className="absolute -top-1 -left-1 w-full h-full bg-gradient-to-r from-orange-100 to-orange-50 rounded-full blur-md opacity-70"></span>
                Neurotech Africa
              </span>
            </Link>
          </div>

          <nav className="flex items-center space-x-4">
            <Link
              to="/orders"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-xs hover:bg-muted/30 transition-colors border"
            >
              <FileText className="mr-2 h-4 w-4" />
              View All Orders
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>

      <footer className="glass-morphism mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Neurotech Africa All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
