import React, { createContext, useState, useContext } from 'react';

export const UserModeContext = createContext();

export const UserModeProvider = ({ children }) => {
  // false = Consumer Mode (Default) | true = Seller Mode
  const [isSellerMode, setIsSellerMode] = useState(false);

  const toggleUserMode = () => {
    setIsSellerMode((prevMode) => !prevMode);
  };

  return (
    <UserModeContext.Provider value={{ isSellerMode, setIsSellerMode, toggleUserMode }}>
      {children}
    </UserModeContext.Provider>
  );
};

export const useUserMode = () => useContext(UserModeContext);