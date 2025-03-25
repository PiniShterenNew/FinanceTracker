import React, { useState, ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNavBar from './MobileNavBar';
import AddTransactionModal from '../modals/AddTransactionModal';
import SettingsModal from '../modals/SettingsModal';

interface AppShellProps {
  children: ReactNode;
  view: string;
  setView: (view: string) => void;
  showAddTransaction: boolean;
  setShowAddTransaction: (show: boolean) => void;
}

const AppShell: React.FC<AppShellProps> = ({ 
  children, 
  view, 
  setView, 
  showAddTransaction, 
  setShowAddTransaction 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 dark:bg-dark-background dark:text-gray-100">
      <Header 
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} 
        onAddTransaction={() => setShowAddTransaction(true)}
      />
      
      <Sidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        activeView={view}
        setView={(newView) => {
          setView(newView);
          setIsMenuOpen(false);
        }}
        onOpenSettings={() => {
          setShowSettingsModal(true);
          setIsMenuOpen(false);
        }}
      />
      
      <main className="flex-1 overflow-auto p-4">
        {children}
      </main>
      
      <MobileNavBar 
        activeView={view} 
        setView={setView} 
        onAddTransaction={() => setShowAddTransaction(true)} 
      />
      
      {showAddTransaction && (
        <AddTransactionModal 
          isOpen={showAddTransaction} 
          onClose={() => setShowAddTransaction(false)} 
        />
      )}
      
      {showSettingsModal && (
        <SettingsModal 
          isOpen={showSettingsModal} 
          onClose={() => setShowSettingsModal(false)} 
        />
      )}
    </div>
  );
};

export default AppShell;
