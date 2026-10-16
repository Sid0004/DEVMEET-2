import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      if (action.payload.token) {
        state.token = action.payload.token;
        if (typeof document !== "undefined") {
          const isSecure = window.location.protocol === "https:";
          document.cookie = `accessToken=${action.payload.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax${isSecure ? "; Secure" : ""}`;
          try {
            localStorage.setItem("devmeet_token", action.payload.token);
          } catch {}
        }
      }
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof document !== "undefined") {
        document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        try {
          localStorage.removeItem("devmeet_token");
        } catch {}
      }
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
