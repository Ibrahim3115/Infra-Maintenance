/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("im07_token") || null);
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Fetch current user details on mount if we have a token
  useEffect(() => {
    let active = true;
    const fetchMe = async () => {
      if (!token) {
        setIsAuthLoading(false);
        return;
      }
      try {
        const response = await fetch("http://127.0.0.1:8000/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const userData = await response.json();
          if (active) {
            setUser(userData);
          }
        } else {
          // Token expired or invalid
          if (active) {
            setToken(null);
            setUser(null);
            localStorage.removeItem("im07_token");
          }
        }
      } catch (e) {
        console.error("Auth initialization failed", e);
      } finally {
        if (active) {
          setIsAuthLoading(false);
        }
      }
    };

    fetchMe();
    return () => {
      active = false;
    };
  }, [token]);

  const login = async (username, password) => {
    const response = await fetch("http://127.0.0.1:8000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Login failed.");
    }

    localStorage.setItem("im07_token", data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    return data;
  };

  const signup = async (username, email, password) => {
    const response = await fetch("http://127.0.0.1:8000/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Signup failed.");
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem("im07_token");
    localStorage.removeItem("im_07_analysis_result");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthLoading,
        login,
        signup,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
