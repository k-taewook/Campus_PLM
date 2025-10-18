import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { plmApi, Project, Task } from '../services/api';

// 프론트엔드에서 사용하는 타입들을 백엔드 API 타입과 매핑
export interface ProjectContextType {
  projects: Project[];
  tasks: Task[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  
  // 프로젝트 관련 액션들
  loadProjects: () => Promise<void>;
  loadProject: (id: number) => Promise<void>;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: number, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  
  // 태스크 관련 액션들
  loadTasks: () => Promise<void>;
  loadTasksByProject: (projectId: number) => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: number, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  
  // 유틸리티 함수들
  setCurrentProject: (project: Project | null) => void;
  getProjectProgress: (projectId: number) => number;
}

const ProjectApiContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjectApi = () => {
  const context = useContext(ProjectApiContext);
  if (context === undefined) {
    throw new Error('useProjectApi must be used within a ProjectApiProvider');
  }
  return context;
};

interface ProjectApiProviderProps {
  children: ReactNode;
}

export const ProjectApiProvider = ({ children }: ProjectApiProviderProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 에러 핸들링 헬퍼
  const handleApiCall = async <T,>(apiCall: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';
      setError(message);
      console.error('API 호출 오류:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 프로젝트 목록 로드
  const loadProjects = async () => {
    const result = await handleApiCall(() => plmApi.getProjects());
    if (result) {
      setProjects(result);
    }
  };

  // 특정 프로젝트 로드
  const loadProject = async (id: number) => {
    const result = await handleApiCall(() => plmApi.getProject(id));
    if (result) {
      setCurrentProject(result);
    }
  };

  // 프로젝트 생성
  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const result = await handleApiCall(() => plmApi.createProject(projectData));
    if (result) {
      setProjects(prev => [...prev, result]);
    }
  };

  // 프로젝트 업데이트
  const updateProject = async (id: number, projectData: Partial<Project>) => {
    const result = await handleApiCall(() => plmApi.updateProject(id, projectData));
    if (result) {
      setProjects(prev => prev.map(p => p.id === id ? result : p));
      if (currentProject && currentProject.id === id) {
        setCurrentProject(result);
      }
    }
  };

  // 프로젝트 삭제
  const deleteProject = async (id: number) => {
    const result = await handleApiCall(() => plmApi.deleteProject(id));
    if (result !== null) {
      setProjects(prev => prev.filter(p => p.id !== id));
      if (currentProject && currentProject.id === id) {
        setCurrentProject(null);
      }
    }
  };

  // 전체 태스크 로드
  const loadTasks = async () => {
    const result = await handleApiCall(() => plmApi.getTasks());
    if (result) {
      setTasks(result);
    }
  };

  // 특정 프로젝트의 태스크 로드
  const loadTasksByProject = async (projectId: number) => {
    const result = await handleApiCall(() => plmApi.getTasksByProject(projectId));
    if (result) {
      setTasks(result);
    }
  };

  // 태스크 생성
  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const result = await handleApiCall(() => plmApi.createTask(taskData));
    if (result) {
      setTasks(prev => [...prev, result]);
    }
  };

  // 태스크 업데이트
  const updateTask = async (id: number, taskData: Partial<Task>) => {
    const result = await handleApiCall(() => plmApi.updateTask(id, taskData));
    if (result) {
      setTasks(prev => prev.map(t => t.id === id ? result : t));
    }
  };

  // 태스크 삭제
  const deleteTask = async (id: number) => {
    const result = await handleApiCall(() => plmApi.deleteTask(id));
    if (result !== null) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  // 프로젝트 진행률 계산
  const getProjectProgress = (projectId: number): number => {
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    
    const completedTasks = projectTasks.filter(task => task.status === 'DONE');
    return Math.round((completedTasks.length / projectTasks.length) * 100);
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadProjects();
    loadTasks();
  }, []);

  const value: ProjectContextType = {
    projects,
    tasks,
    currentProject,
    loading,
    error,
    loadProjects,
    loadProject,
    createProject,
    updateProject,
    deleteProject,
    loadTasks,
    loadTasksByProject,
    createTask,
    updateTask,
    deleteTask,
    setCurrentProject,
    getProjectProgress,
  };

  return (
    <ProjectApiContext.Provider value={value}>
      {children}
    </ProjectApiContext.Provider>
  );
};