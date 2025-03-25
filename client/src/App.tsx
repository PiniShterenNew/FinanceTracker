import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Budgets from "@/pages/Budgets";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import AuthPage from "@/pages/AuthPage";
import Layout from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useTranslation } from "react-i18next";
import { useAppContext } from "./context/AppContext";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./hooks/use-auth";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Configure request interceptor to add auth token to API requests
const configureAuthInterceptor = () => {
  const originalFetch = window.fetch;
  window.fetch = async (input, init) => {
    // Only add auth header for our API requests
    if (typeof input === 'string' && input.startsWith('/api')) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        init = init || {};
        init.headers = {
          ...init.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }
    return originalFetch(input, init);
  };
};

// Main content component that uses the context
const WalletContent = () => {
  const { language, darkMode } = useAppContext();
  const { i18n } = useTranslation();
  const [location] = useLocation();

  // Set language direction
  useEffect(() => {
    document.documentElement.dir = language === "he" ? "rtl" : "ltr";
    i18n.changeLanguage(language);
  }, [language, i18n]);

  // Set dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Configure auth interceptor
  useEffect(() => {
    configureAuthInterceptor();
  }, []);

  return (
    <>
      <Layout>
        <Switch>
          <ProtectedRoute path="/" component={Dashboard} />
          <ProtectedRoute path="/transactions" component={Transactions} />
          <ProtectedRoute path="/budgets" component={Budgets} />
          <ProtectedRoute path="/reports" component={Reports} />
          <ProtectedRoute path="/settings" component={Settings} />
          <Route path="/auth" component={AuthPage} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
      <Toaster />
    </>
  );
};

// Main App component that provides the context
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <WalletContent />
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
