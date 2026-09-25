// /context/GlobalContext.js
import { createContext, useState, useContext } from 'react';

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {


  return (
    <GlobalContext.Provider value={{ shopCategory, toggleShopCategory }}>
      {children}
    </GlobalContext.Provider>
  );
};

// Custom hook to use the context easily
export const useGlobalContext = () => useContext(GlobalContext);
