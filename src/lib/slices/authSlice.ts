import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { tokenStorage } from "../tokenStorage";

export interface User {
  id?: number;
  username: string;
  email: string;
}

interface AuthState {
  jwtToken: string | null;
  currentUser: User | null;
}

const initialState: AuthState = {
  jwtToken: tokenStorage.get(),
  currentUser: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setJwtToken(state, action: PayloadAction<string | null>) {
      state.jwtToken = action.payload;
      if (action.payload) tokenStorage.set(action.payload);
      else tokenStorage.remove();
    },
    setCurrentUser(state, action: PayloadAction<User | null>) {
      state.currentUser = action.payload;
    },
    logout(state) {
      state.jwtToken = null;
      state.currentUser = null;
      tokenStorage.remove();
    },
  },
});

export const { setJwtToken, setCurrentUser, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
