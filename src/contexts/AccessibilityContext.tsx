import React, { createContext, useContext, useState, useEffect } from "react";

interface AccessibilityContextType {
  isInclusiveMode: boolean;
  toggleInclusiveMode: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInclusiveMode, setIsInclusiveMode] = useState(() => {
    const saved = localStorage.getItem("inclusive_mode");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("inclusive_mode", isInclusiveMode.toString());
  }, [isInclusiveMode]);

  const toggleInclusiveMode = () => {
    setIsInclusiveMode(prev => !prev);
  };

  return (
    <AccessibilityContext.Provider value={{ isInclusiveMode, toggleInclusiveMode }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
};
