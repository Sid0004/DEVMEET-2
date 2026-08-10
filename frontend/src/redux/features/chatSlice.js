import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
  unreadCount: 0,
  typingUsers: [], // Array of user objects { _id, username, fullName }
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    incrementUnread: (state) => {
      state.unreadCount += 1;
    },
    resetUnread: (state) => {
      state.unreadCount = 0;
    },
    setTypingUser: (state, action) => {
      const user = action.payload;
      if (!state.typingUsers.find((u) => u._id === user._id)) {
        state.typingUsers.push(user);
      }
    },
    removeTypingUser: (state, action) => {
      const userId = action.payload;
      state.typingUsers = state.typingUsers.filter((u) => u._id !== userId);
    },
    clearChat: (state) => {
      state.messages = [];
      state.unreadCount = 0;
      state.typingUsers = [];
    },
  },
});

export const { addMessage, setMessages, incrementUnread, resetUnread, setTypingUser, removeTypingUser, clearChat } = chatSlice.actions;
export default chatSlice.reducer;
