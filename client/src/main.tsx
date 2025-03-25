import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import "./lib/i18n";
import { I18nProvider } from "./components/ui/i18n-provider";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <App />
    </I18nProvider>
  </QueryClientProvider>
);
