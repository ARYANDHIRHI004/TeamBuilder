import { createSlice } from "@reduxjs/toolkit";

const initialState: any = {
  user: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
   
    logout: (state) => {
      state.user = null;
    },

    getMe: (state, action) => {
        state.user = action.payload
    },
  },
});

export const { logout, getMe } = authSlice.actions;

export default authSlice.reducer;
