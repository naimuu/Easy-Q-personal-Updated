import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RTLState {
  isRTL: boolean;
}

const initialState: RTLState = {
  isRTL: false,
};

const rtlSlice = createSlice({
  name: "rtl",
  initialState,
  reducers: {
    setRTL: (state, action: PayloadAction<boolean>) => {
      state.isRTL = action.payload;
    },
    toggleRTL: (state) => {
      state.isRTL = !state.isRTL;
    },
  },
});

export const { setRTL, toggleRTL } = rtlSlice.actions;
export default rtlSlice.reducer;
