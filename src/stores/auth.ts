/* eslint-disable @typescript-eslint/no-unused-vars */
import { State, create } from "zustand";
import { createJSONStorage } from "zustand/middleware";
import { persist } from "zustand/middleware";
import { IUser } from "../types";
interface AuthStore {
  isLoggedIn: boolean;
  user?: IUser;

  setLoggedIn: (isLoggedIn: boolean) => void;
  setUser: (user: IUser) => void;
  reset: () => void;
}

const initialState = {
  isLoggedIn: false,
  user: undefined,
};

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,
      setLoggedIn: (isLoggedIn) => set((state) => ({ isLoggedIn })),
      setUser: (user) => set((state) => ({ user })),
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useAuthStore;
