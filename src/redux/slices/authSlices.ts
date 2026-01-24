// slices/authSlice.ts
import { User } from "@/types/apiTypes";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

interface AuthState {
  user: User | null;
  token: string | undefined;
}

const initialState: AuthState = {
  user: null,
  token: Cookies.get("token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      Cookies.set("token", action.payload, { expires: 30 });
    },
    clearUser: (state) => {
      state.user = null;
      state.token = undefined;
      Cookies.remove("token");
    },
    setMe: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
});

export const { setToken, clearUser, setMe } = authSlice.actions;
export default authSlice.reducer;