import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Budgets from "@/pages/Budgets";
import Reports from "@/pages/Reports";
import LandingPage from "@/pages/LandingPage";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { I18nProvider } from "@/components/ui/i18n-provider";
import AppShell from "@/components/layout/AppShell";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { initializeStorage } from "@/lib/storage";

function Router() {
  const [view, setView] = useState('dashboard');
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [isInstalled, setIsInstalled] = useLocalStorage('pwa-installed', false);
  
  // Check if the app is already installed as PWA
  useEffect(() => {
    // Check if it's running as standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  }, [setIsInstalled]);
  
  // Initialize local storage on first load
  useEffect(() => {
    initializeStorage();
  }, []);

  if (!isInstalled) {
    return (
      <Switch>
        <Route path="/">
          <LandingPage onInstall={() => setIsInstalled(true)} />
        </Route>
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <AppShell 
      view={view} 
      setView={setView} 
      showAddTransaction={showAddTransaction}
      setShowAddTransaction={setShowAddTransaction}
    >
      <Switch>
        <Route path="/">
          {view === 'dashboard' && <Dashboard />}
          {view === 'transactions' && <Transactions />}
          {view === 'budgets' && <Budgets />}
          {view === 'reports' && <Reports />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <Router />
          <Toaster />
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
