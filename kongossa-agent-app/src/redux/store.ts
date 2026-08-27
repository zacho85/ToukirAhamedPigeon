import { configureStore } from "@reduxjs/toolkit";
import authReducer, { setAccessToken } from "./slices/authSlice";
import { setAccessTokenGetter, setTokenRefreshedHandler } from "@/lib/axios";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// Wire axios's token source to always pull the latest value from Redux, and
// wire its silent-refresh result back into Redux so a token refreshed
// mid-session (not just at page load) is reflected here too.
setAccessTokenGetter(() => store.getState().auth.accessToken);
setTokenRefreshedHandler((token) => store.dispatch(setAccessToken(token)));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
