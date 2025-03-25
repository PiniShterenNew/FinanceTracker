import { AppProvider, useAppContext } from "./context/AppContext";

// This is the component that will use the context
const WalletContent = () => {
  const { darkMode, toggleDarkMode } = useAppContext();
  
  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      backgroundColor: darkMode ? '#121212' : '#ffffff',
      color: darkMode ? '#ffffff' : '#121212',
      minHeight: '100vh'
    }}>
      <h1>My Wallet Application</h1>
      <p>Now with simple dark mode context!</p>
      
      <button 
        onClick={toggleDarkMode}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          border: 'none',
          backgroundColor: darkMode ? '#444' : '#eee',
          color: darkMode ? '#fff' : '#000',
          cursor: 'pointer'
        }}
      >
        Toggle {darkMode ? 'Light' : 'Dark'} Mode
      </button>
    </div>
  );
};

// Main App component that provides the context
function App() {
  return (
    <AppProvider>
      <WalletContent />
    </AppProvider>
  );
}

export default App;
