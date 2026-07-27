import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ mustChangePassword: boolean; user: any }>;
  requestRegistration: (details: { first_name: string; last_name: string; email: string; role: string; roll_number?: string; department?: string }) => Promise<{ message: string }>;
  changePassword: (newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if session cookie exists on load
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const { data } = await API.get("/auth/me");
        if (data && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await API.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password
      });
      if (!data.mustChangePassword) {
        setUser(data.user);
      }
      return data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Invalid email or password.");
    }
  };

  const requestRegistration = async (details: any) => {
    try {
      const { data } = await API.post("/auth/request-registration", details);
      return data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to submit registration request.");
    }
  };

  const changePassword = async (newPassword: string) => {
    try {
      await API.post("/auth/change-password", { newPassword });
      // Reload profile to refresh user details (must_change_password is now false)
      const { data } = await API.get("/auth/me");
      if (data && data.user) {
        setUser(data.user);
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to update password.");
    }
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, requestRegistration, changePassword, logout, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};