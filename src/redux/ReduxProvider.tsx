"use client";
import React, { Suspense } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { Bounce, ToastContainer } from "react-toastify";
import DataLoader from "@/app/DataLoader";

function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <Suspense>
        <DataLoader>
          {children}
          <ToastContainer
            position="top-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Bounce}
          />
        </DataLoader>
      </Suspense>
    </Provider>
  );
}

export default ReduxProvider;
