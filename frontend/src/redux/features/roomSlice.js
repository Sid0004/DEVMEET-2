import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  roomId: null,
  activeUsers: [],
  messages: [],
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setRoomId: (state, action) => {
      state.roomId = action.payload;
    },
    setActiveUsers: (state, action) => {
      state.activeUsers = action.payload;
    },
    addActiveUser: (state, action) => {
      const exists = state.activeUsers.find(
        (u) => u.socketId === action.payload.socketId
      );
      if (!exists) {
        state.activeUsers.push(action.payload);
      }
    },
    removeActiveUser: (state, action) => {
      state.activeUsers = state.activeUsers.filter(
        (u) => u.socketId !== action.payload
      );
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearRoom: (state) => {
      state.roomId = null;
      state.activeUsers = [];
      state.messages = [];
    },
  },
});

export const {
  setRoomId,
  setActiveUsers,
  addActiveUser,
  removeActiveUser,
  addMessage,
  clearRoom,
} = roomSlice.actions;

export default roomSlice.reducer;
