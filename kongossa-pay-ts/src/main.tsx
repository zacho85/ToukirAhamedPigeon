import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// 🔹 Redux
import { Provider } from "react-redux";
import { store } from "./redux/store";

// 🔹 Global CSS
import "./index.css";

// 🔹 CSRF Initialization
import { refreshAccessToken } from "./redux/slices/authSlice";

// 🔹 Global Components
import GlobalLoader from "@/components/custom/GlobalLoader";
import ToastContainer from "@/components/custom/ToastContainer";

// 🔹 Stripe
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "./lib/stripe";

// 🔹 PWA Service Worker
import { registerSW } from "virtual:pwa-register";

// ============================================================
// STEP 0: Register Service Worker (PWA)
// ============================================================
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log("New update available! Prompt user to refresh.");
    // Optional: show a toast or modal to reload
  },
  onOfflineReady() {
    console.log("App is ready to work offline!");
  },
});

// ============================================================
// STEP 1: Initialize CSRF + Theme
// ============================================================
const initApp = async () => {
  try {
    // Refresh CSRF / Access Token
    await store.dispatch(refreshAccessToken()).unwrap();

    // Theme Initialization
    type Theme = "light" | "dark" | "system";
    const savedTheme = (localStorage.getItem("appearance") as Theme) || "light";
    const isDark =
      savedTheme === "dark" ||
      (savedTheme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);

    // Language initialization (optional)
    // const savedLang = localStorage.getItem("lang") || "en";
    // store.dispatch(setLanguage(savedLang));
    // await store.dispatch(fetchTranslations({ lang: savedLang })).unwrap();
  } catch (err) {
    window.dispatchEvent(new Event("logout"));
  }
};

// ============================================================
// STEP 2: Render React App
// ============================================================
initApp().finally(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <Provider store={store}>
        <Elements stripe={stripePromise}>
          <GlobalLoader />
          <App />
          <ToastContainer />
        </Elements>
      </Provider>
    </React.StrictMode>
  );

  // Check for SW updates
  updateSW();
});
