import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
  });
};

// Infer the type of makeStore
// Infer the `RootState` and `AppDispatch` types from the store itself
