// store/transitionSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentPage: null,
  transitionDone: false,
};

const transitionSlice = createSlice({
  name: 'transition',
  initialState,
  reducers: {
    startTransition: (state, action) => {
      state.currentPage = action.payload; // pathname
      state.transitionDone = false;
    },
    finishTransition: (state) => {
      state.transitionDone = true;
    },
  },
});

export const { startTransition, finishTransition } = transitionSlice.actions;
export default transitionSlice.reducer;
