import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./pages/App";
import axios from "axios";
import { UserProvider } from "./context/UserContext";
import "./i18n";
import { LanguageProvider } from "./context/LanguageContext";

axios.defaults.baseURL = "http://localhost:5050/api";
axios.defaults.withCredentials = true;

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
  <StrictMode>
    <LanguageProvider>
      <UserProvider>
        <App />
      </UserProvider>
    </LanguageProvider>
  </StrictMode>
);
