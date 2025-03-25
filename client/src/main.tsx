import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { TestProvider } from "./context/TestContext";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import "./lib/i18n";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <TestProvider>
      <App />
    </TestProvider>
  </QueryClientProvider>
);
