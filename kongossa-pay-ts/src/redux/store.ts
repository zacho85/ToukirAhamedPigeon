import { configureStore } from "@reduxjs/toolkit";
import authReducer, { setAccessToken } from "./slices/authSlice";
import dashboardReducer from "./slices/dashboardSlice";
import languageReducer from "./slices/languageSlice";
import themeReducer from "./slices/themeSlice";
import sidebarReducer from './slices/sidebarSlice'
import loaderReducer from "./slices/loaderSlice";
import toastReducer from "./slices/toastSlice";
import {
  setAccessTokenGetter,
  setTokenRefreshedHandler,
  // setCsrfTokenGetter
} from "@/lib/axios";
import tableColumnSettingsReducer from "./slices/tableColumnSettingsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    language: languageReducer,
    theme: themeReducer,
    sidebar: sidebarReducer,
    loader: loaderReducer,
    toast: toastReducer,
    tableColumnSettings: tableColumnSettingsReducer,
  },
});

// ✅ Wire axios getters to always pull latest tokens from Redux
setAccessTokenGetter(() => store.getState().auth.accessToken);
// setCsrfTokenGetter(() => store.getState().auth.csrfToken);

// ✅ Wire axios's silent-refresh result back into Redux, so a token refreshed
// mid-session (not just at page load) is reflected here too.
setTokenRefreshedHandler((token) => store.dispatch(setAccessToken(token)));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
