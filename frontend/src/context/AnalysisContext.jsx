/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";

export const AnalysisContext = createContext();

export const AnalysisProvider = ({ children }) => {
  const [analysisResult, setAnalysisResult] = useState(null);

  return (
    <AnalysisContext.Provider
      value={{
        analysisResult,
        setAnalysisResult,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};