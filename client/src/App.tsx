import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Budgets from "@/pages/Budgets";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Layout from "@/components/Layout";
import { useTranslation } from "react-i18next";
import { useAppContext } from "./context/AppContext";
import { AppProvider } from "./context/AppContext";

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

  return (
    <>
      <Layout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/budgets" component={Budgets} />
          <Route path="/reports" component={Reports} />
          <Route path="/settings" component={Settings} />
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
    <AppProvider>
      <WalletContent />
    </AppProvider>
  );
}

export default App;
