/// <reference types="vite/client" />
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

export interface ProjectMember {
  id: number;
  projectId: number;
  projectName: string;
  userId: number;
  username: string;
  userFullName: string;
  userEmail: string;
  joinedAt: string;
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

  // ===== 프로젝트 멤버 관리 =====
  getProjectMembers: async (projectId: number): Promise<ProjectMember[]> => {
    const response = await api.get(`/projects/${projectId}/members`);
    return response.data;
  },

  addProjectMember: async (projectId: number, userId: number): Promise<ProjectMember> => {
    const response = await api.post(`/projects/${projectId}/members/${userId}`);
    return response.data;
  },

  removeProjectMember: async (projectId: number, userId: number): Promise<void> => {
    await api.delete(`/projects/${projectId}/members/${userId}`);
  },

  addProjectMembersBulk: async (projectId: number, userIds: number[]): Promise<ProjectMember[]> => {
    const response = await api.post(`/projects/${projectId}/members/bulk`, userIds);
    return response.data;
  },

  getUserProjects: async (userId: number): Promise<Project[]> => {
    const response = await api.get(`/projects/user/${userId}`);
    return response.data;
  },

  // ===== 태스크 관리 =====
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

  // ===== 팀 관리 =====
  getTeams: async (): Promise<Team[]> => {
    const response = await api.get('/teams');
    return response.data;
  },

  getTeam: async (id: number): Promise<Team> => {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },

  createTeam: async (team: CreateTeamRequest): Promise<Team> => {
    const response = await api.post('/teams', team);
    return response.data;
  },

  updateTeam: async (id: number, team: Partial<CreateTeamRequest>): Promise<Team> => {
    const response = await api.put(`/teams/${id}`, team);
    return response.data;
  },

  deleteTeam: async (id: number): Promise<void> => {
    await api.delete(`/teams/${id}`);
  },

  // 팀 멤버 관리
  getTeamMembers: async (teamId: number): Promise<TeamMember[]> => {
    const response = await api.get(`/teams/${teamId}/members`);
    return response.data;
  },

  addTeamMember: async (teamId: number, userId: number, role: TeamMemberRole = 'MEMBER'): Promise<TeamMember> => {
    const response = await api.post(`/teams/${teamId}/members/${userId}`, null, { params: { role } });
    return response.data;
  },

  addTeamMembersBulk: async (teamId: number, userIds: number[], role: TeamMemberRole = 'MEMBER'): Promise<TeamMember[]> => {
    const response = await api.post(`/teams/${teamId}/members/bulk`, userIds, { params: { role } });
    return response.data;
  },

  removeTeamMember: async (teamId: number, userId: number): Promise<void> => {
    await api.delete(`/teams/${teamId}/members/${userId}`);
  },

  updateMemberRole: async (teamId: number, userId: number, role: TeamMemberRole): Promise<TeamMember> => {
    const response = await api.put(`/teams/${teamId}/members/${userId}/role`, null, { params: { role } });
    return response.data;
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

// 팀 타입 (백엔드 TeamDto 호환)
export interface Team {
  id: number;
  name: string;
  description: string;
  logoUrl?: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export type TeamMemberRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface TeamMember {
  id: number;
  teamId: number;
  teamName: string;
  userId: number;
  username: string;
  userFullName: string;
  userEmail: string;
  role: TeamMemberRole;
  joinedAt: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  logoUrl?: string;
}

// ===== 파일 API 유틸 =====
export interface FileDto {
  id: number;
  originalName: string;
  storedName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileType: 'DOCUMENT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'ARCHIVE' | 'CODE' | 'OTHER';
  projectId?: number;
  projectName?: string;
  taskId?: number;
  taskTitle?: string;
  uploaderId: number;
  uploaderUsername: string;
  uploaderFullName: string;
  downloadCount: number;
  createdAt: string;
}

export async function getTaskFiles(taskId: number): Promise<FileDto[]> {
  const response = await api.get(`/files/task/${taskId}`);
  return response.data;
}

export async function uploadFile(params: {
  file: File;
  uploaderId: number;
  projectId?: number;
  taskId?: number;
  onUploadProgress?: (e: any) => void;
}): Promise<FileDto> {
  const form = new FormData();
  form.append('file', params.file);
  form.append('uploaderId', String(params.uploaderId));
  if (params.projectId != null) form.append('projectId', String(params.projectId));
  if (params.taskId != null) form.append('taskId', String(params.taskId));

  const response = await api.post('/files/upload', form, {
    headers: {
      // Axios가 boundary를 자동 설정하도록 content-type만 지정
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: params.onUploadProgress,
  });
  return response.data;
}

export async function deleteFileById(id: number): Promise<void> {
  await api.delete(`/files/${id}`);
}

export async function updateFileOriginalName(id: number, originalName: string): Promise<FileDto> {
  const response = await api.put(`/files/${id}`, { originalName });
  return response.data;
}