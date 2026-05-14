import { createRoot } from "react-dom/client";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

setBaseUrl("/api");

setAuthTokenGetter(() => {
  try {
    const stored = localStorage.getItem("auth-storage");
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
});

createRoot(document.getElementById("root")!).render(<App />);