import './App.css';
import Pages from "@/pages/index.jsx";
import { Toaster } from "@/components/ui/toaster";
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store';
import React, { useEffect, useState } from 'react';
import { refreshAccessToken } from './store/authSlice';
import ToastContainer from "./components/common/ToastContainer";
import useNetworkToast from "@/utils/useNetworkToast";
import GlobalLoader from "@/components/common/GlobalLoader";

function AppWrapper() {
  useNetworkToast();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const authLoading = useSelector((state) => state.auth.loading);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await dispatch(refreshAccessToken()).unwrap();
      } catch (err) {
        console.log("Token refresh failed:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading...
      </div>
    );
  }

  return <Pages />;
}

function App() {
  return (
    <>
      <Provider store={store}>
        <GlobalLoader />
        <AppWrapper />
        <ToastContainer />
      </Provider>
      <Toaster />
    </>
  );
}

export default App;
