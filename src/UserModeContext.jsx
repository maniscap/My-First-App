import React, { createContext, useState, useContext, useEffect } from 'react';

export const UserModeContext = createContext();

export const UserModeProvider = ({ children }) => {
  // Initialize from localStorage, or default to false (Consumer Mode)
  const [isSellerMode, setIsSellerMode] = useState(() => {
    const savedMode = localStorage.getItem('app_isSellerMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  // Save to localStorage whenever the mode changes
  useEffect(() => {
    localStorage.setItem('app_isSellerMode', JSON.stringify(isSellerMode));
  }, [isSellerMode]);

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