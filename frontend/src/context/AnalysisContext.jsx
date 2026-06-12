/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";

export const AnalysisContext = createContext();

export const AnalysisProvider = ({ children }) => {
  const [analysisResult, setAnalysisResult] = useState(() => {
    try {
      const saved = localStorage.getItem("im_07_analysis_result");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse saved reconciliation data", e);
      return null;
    }
  });

  const setAndSaveAnalysisResult = (result) => {
    setAnalysisResult(result);
    if (result) {
      localStorage.setItem("im_07_analysis_result", JSON.stringify(result));
    } else {
      localStorage.removeItem("im_07_analysis_result");
    }
  };

  const clearAnalysisResult = () => {
    setAnalysisResult(null);
    localStorage.removeItem("im_07_analysis_result");
  };

  return (
    <AnalysisContext.Provider
      value={{
        analysisResult,
        setAnalysisResult: setAndSaveAnalysisResult,
        clearAnalysisResult,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};