import React, { useState, useContext, createContext } from "react";
import { FirebaseUser } from "../types";

const StateContext = createContext({
  searchTerm: "" as string,
  setSearchTerm: "" as any,
  themeMode: "",
  setThemeMode: "" as any,
  switchMode: (mode: string): void => {},
  switchColor: (color: string): void => {},
  themeColor: "",
  user: { displayName: "", photoURL: "" } as FirebaseUser,
  setUser: "" as any
});

export const ContextProvider = ({ children }: any) => {
  const themeColorType = localStorage.getItem("color");
  const themeModeType = localStorage.getItem("mode");

  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") as string));

  const [searchTerm, setSearchTerm] = useState("");
  const [themeMode, setThemeMode] = useState(themeModeType || "light");
  const [themeColor, setThemeColor] = useState(themeColorType || "#594194");

  const switchMode = (mode: string) => {
    localStorage.setItem("mode", mode);
    setThemeMode(mode);
  };

  const switchColor = (color: string) => {
    localStorage.setItem("color", color);
    setThemeColor(color);
  };

  return (
    <StateContext.Provider
      value={{
        searchTerm,
        setSearchTerm,
        themeMode,
        setThemeMode,
        switchMode,
        switchColor,
        themeColor,
        user,
        setUser
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
