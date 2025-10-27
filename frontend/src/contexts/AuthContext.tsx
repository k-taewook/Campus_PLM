import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  username: string;
  fullName: string;
  role: 'ADMIN' | 'MANAGER' | 'DEVELOPER' | 'DESIGNER' | 'TESTER' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
  profileImageUrl?: string;
  department?: string;
  position?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:8080/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 페이지 로드 시 localStorage에서 사용자 정보 복원
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/auth/login`, {
        email,
        password,
      });

      const userData = response.data.user;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/auth/register`, {
        email,
        password,
        fullName,
      });

      const userData = response.data;
      // 회원가입 후 자동 로그인
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('회원가입에 실패했습니다.');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
