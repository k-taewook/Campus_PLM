import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);

// 타입 정의
export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
  startDate: string;
  endDate: string;
  managerId: string;
  createdAt: string;
  updatedAt: string;
  progress?: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  projectId: number;
  assigneeId: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

// API 서비스 함수들
export const plmApi = {
  // 사용자 등록 (회원가입 API 사용)
  registerUser: async (params: { email: string; password: string; fullName: string; }) => {
    const response = await api.post('/users/auth/register', params);
    return response.data;
  },
  // 사용자 목록 가져오기
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  // 사용자 업데이트
  updateUser: async (id: number, user: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, user);
    return response.data;
  },

  // 사용자 삭제
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
  // 대시보드 요약 정보 가져오기
  getDashboardSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },

  // 최근 활동 내역 가져오기
  getRecentActivities: async () => {
    const response = await api.get('/dashboard/recent-activities');
    return response.data;
  },

  // 제품 목록 가져오기
  getProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },

  // 프로젝트 목록 가져오기
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get('/projects');
    return response.data;
  },

  // 특정 프로젝트 가져오기
  getProject: async (id: number): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  // 프로젝트 생성
  createProject: async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
    const response = await api.post('/projects', project);
    return response.data;
  },

  // 프로젝트 업데이트
  updateProject: async (id: number, project: Partial<Project>): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, project);
    return response.data;
  },

  // 프로젝트 삭제
  deleteProject: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  // 태스크 목록 가져오기
  getTasks: async (): Promise<Task[]> => {
    const response = await api.get('/tasks');
    return response.data;
  },

  // 특정 프로젝트의 태스크 가져오기
  getTasksByProject: async (projectId: number): Promise<Task[]> => {
    const response = await api.get(`/tasks/project/${projectId}`);
    return response.data;
  },

  // 특정 태스크 가져오기
  getTask: async (id: number): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // 태스크 생성
  createTask: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    const response = await api.post('/tasks', task);
    return response.data;
  },

  // 태스크 업데이트
  updateTask: async (id: number, task: Partial<Task>): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, task);
    return response.data;
  },

  // 태스크 삭제
  deleteTask: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};

export default api;

// 사용자 타입 정의 (백엔드 UserDto와 호환)
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  profileImageUrl?: string;
  role: 'ADMIN' | 'MANAGER' | 'DEVELOPER' | 'DESIGNER' | 'TESTER' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
  phoneNumber?: string;
  department?: string;
  position?: string;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}