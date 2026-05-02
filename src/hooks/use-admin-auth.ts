import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface AdminSession {
  username: string;
  loginTime: number;
}

export function useAdminAuth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check both localStorage and sessionStorage
    const localSession = localStorage.getItem("admin_session");
    const sessionSession = sessionStorage.getItem("admin_session");
    
    if (localSession || sessionSession) {
      try {
        const session: AdminSession = JSON.parse(localSession || sessionSession || "{}");
        if (session.username && session.loginTime) {
          setIsAuthenticated(true);
        } else {
          redirectToLogin();
        }
      } catch {
        redirectToLogin();
      }
    } else {
      redirectToLogin();
    }
    setIsLoading(false);
  }, []);

  const redirectToLogin = useCallback(() => {
    setIsAuthenticated(false);
    // Will be handled by the component
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem("admin_session");
    sessionStorage.removeItem("admin_session");
    setIsAuthenticated(false);
    navigate("/admin/login");
  }, [navigate]);

  return { isLoading, isAuthenticated, logout };
}

export function checkAdminAuth(): boolean {
  const localSession = localStorage.getItem("admin_session");
  const sessionSession = sessionStorage.getItem("admin_session");
  
  if (!localSession && !sessionSession) return false;
  
  try {
    const session: AdminSession = JSON.parse(localSession || sessionSession || "{}");
    return !!(session.username && session.loginTime);
  } catch {
    return false;
  }
}

export function getAdminSession(): AdminSession | null {
  const localSession = localStorage.getItem("admin_session");
  const sessionSession = sessionStorage.getItem("admin_session");
  
  try {
    return JSON.parse(localSession || sessionSession || "null");
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("admin_session");
  sessionStorage.removeItem("admin_session");
}