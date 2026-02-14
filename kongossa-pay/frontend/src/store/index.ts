import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import toastReducer from './toastSlice';
import loaderReducer from './loaderSlice';

export const store = configureStore({
  reducer: { auth: authReducer, toast: toastReducer, loader: loaderReducer },
});

// No TypeScript types needed in JS
