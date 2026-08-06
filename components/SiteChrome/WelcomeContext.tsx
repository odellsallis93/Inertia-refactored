"use client";

import { createContext, useContext } from "react";

interface WelcomeState {
  hasPlayed: boolean;
  markPlayed: () => void;
}

export const WelcomeContext = createContext<WelcomeState>({
  hasPlayed: false,
  markPlayed: () => {},
});

export function useWelcome(): WelcomeState {
  return useContext(WelcomeContext);
}
