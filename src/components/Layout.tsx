
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 glass-morphism">
        <div className="container mx-auto px-4 py-4 md:py-6 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="text-2xl font-bold tracking-tight flex items-center">
              <span className="text-primary inline-block mr-2 relative">
                <span className="absolute -top-1 -left-1 w-full h-full bg-gradient-to-r from-orange-100 to-orange-50 rounded-full blur-md opacity-70"></span>
                Neurotech
              </span>
              <span className="text-muted-foreground">.Africa</span>
            </Link>
          </motion.div>
          
          <nav className="flex items-center space-x-4">
            <Link 
              to="/orders" 
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-muted/30 transition-colors"
            >
              <FileText className="mr-2 h-4 w-4" />
              View All Orders
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="glass-morphism mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Neurotech.Africa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
