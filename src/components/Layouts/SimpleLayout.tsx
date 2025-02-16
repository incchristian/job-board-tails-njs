import React from 'react';
import '@/styles/globals.css'; // Ensure this import is present to include global styles

const SimpleLayout: React.FC = ({ children }) => {
  return (
    <div className="simple-layout flex flex-col">
      <header>
        {/* Add your header content here */}
      </header>
      <main className="flex-grow flex items-center justify-center">
        {children}
      </main>
      <footer>
        {/* Add your footer content here */}
      </footer>
    </div>
  );
};

export default SimpleLayout;