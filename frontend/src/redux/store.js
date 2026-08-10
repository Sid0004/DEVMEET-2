import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import roomReducer from "./features/roomSlice";
import chatReducer from "./features/chatSlice";
export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      room: roomReducer,
      chat: chatReducer,
    },
  });
};

// Infer the type of makeStore
// Infer the `RootState` and `AppDispatch` types from the store itself
