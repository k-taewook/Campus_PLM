import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: number;
  email: string;
  username: string;
  fullName: string;
  role: 'ADMIN' | 'LEADER' | 'MEMBER';
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
  isAdmin: () => boolean;
  isLeader: () => boolean;
  isMember: () => boolean;
  canManageProject: (projectManagerId: string) => boolean;
  canModifyTask: (projectManagerId: string) => boolean;
  isTaskAssignee: (assigneeIds: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  
  // 권한 체크 함수들
  const isAdmin = () => user?.role === 'ADMIN';
  const isLeader = () => user?.role === 'LEADER';
  const isMember = () => user?.role === 'MEMBER';
  
  // 프로젝트 관리 권한 체크 (ADMIN 또는 해당 프로젝트의 리더)
  const canManageProject = (projectManagerId: string) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return user.id.toString() === projectManagerId;
  };
  
  // 태스크 수정 권한 체크 (ADMIN 또는 해당 프로젝트의 리더)
  const canModifyTask = (projectManagerId: string) => {
    return canManageProject(projectManagerId);
  };
  
  // 태스크 담당자인지 확인
  const isTaskAssignee = (assigneeIds: string[]) => {
    if (!user) return false;
    return assigneeIds.includes(user.id.toString());
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      // 백엔드는 LoginResponse를 직접 반환 (user 래핑 없음)
      const userData = {
        id: response.data.id,
        email: response.data.email,
        username: response.data.username,
        fullName: response.data.fullName,
        role: response.data.role,
        status: 'ACTIVE' as const,
      };
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
      const response = await api.post('/auth/register', {
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
        isAdmin,
        isLeader,
        isMember,
        canManageProject,
        canModifyTask,
        isTaskAssignee,
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
