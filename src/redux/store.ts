import { configureStore } from "@reduxjs/toolkit";
import baseApi from "./baseApi";
import authReducer from "./slices/authSlices";
import rtlReducer from "./slices/rtlSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    rtl: rtlReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({}).concat(baseApi.middleware),
});

// Infer the `RootState` and `AppDispatch` types for later use
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
