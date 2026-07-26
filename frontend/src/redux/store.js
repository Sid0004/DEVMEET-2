import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import roomReducer from "./features/roomSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      room: roomReducer,
    },
  });
};

// Infer the type of makeStore
// Infer the `RootState` and `AppDispatch` types from the store itself
