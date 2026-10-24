import { createContext, useContext, useState } from "react";
import apiClient from "../api/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");

        try {
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            localStorage.removeItem("user");
            return null;
        }
    });

    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setLoading(true);

        try {
            const response = await apiClient.post("/users/login/", {
                email: email.trim(),
                password,
            });

            const data = response.data;

            localStorage.setItem("accessToken", data.access);
            localStorage.setItem("refreshToken", data.refresh);
            localStorage.setItem("user", JSON.stringify(data.user));

            setUser(data.user);

            return { success: true, user: data.user };
        } catch (error) {
            console.error(
                "Login error:",
                error.response?.status,
                error.response?.data || error.message
            );

            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    error.response?.data?.detail ||
                    error.response?.data?.error ||
                    error.message ||
                    "Login failed.",
            };
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password) => {
        setLoading(true);

        try {
            const response = await apiClient.post("/users/register/", {
                name,
                email: email.trim(),
                password,
            });

            return { success: true, data: response.data };
        } catch (error) {
            console.error(
                "Registration error:",
                error.response?.status,
                error.response?.data || error.message
            );

            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    error.response?.data?.detail ||
                    error.response?.data?.error ||
                    error.message ||
                    "Registration failed.",
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setUser(null);
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                isAuthenticated,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
