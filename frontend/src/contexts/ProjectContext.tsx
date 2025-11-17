import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'member';
  dbRole?: 'ADMIN' | 'MANAGER' | 'DEVELOPER' | 'DESIGNER' | 'TESTER' | 'VIEWER';
   status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
  createdAt: string;
  lastActive: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: 'file' | 'link' | 'image';
  name: string;
  url: string;
  size?: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'in-review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeIds: string[];
  reporterId: string;
  projectId: string;
  labels: string[];
  estimatedHours?: number;
  loggedHours: number;
  progress: number;
  startDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  attachments: Attachment[];
  dependencies: string[]; // Task IDs that this task depends on
  subtasks: string[]; // Child task IDs
  parentTaskId?: string;
}

export interface ProjectMember {
  userId: string;
  role: 'lead' | 'admin' | 'developer' | 'designer' | 'tester' | 'viewer';
  joinedAt: string;
  addedBy: string;
  permissions: {
    canEditProject: boolean;
    canManageMembers: boolean;
    canCreateTasks: boolean;
    canEditAllTasks: boolean;
    canDeleteTasks: boolean;
    canManageSettings: boolean;
    canViewReports: boolean;
  };
}

export interface Project {
  id: string;
  key: string; // Project key like "PROJ"
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold' | 'cancelled';
  type: 'software' | 'marketing' | 'design' | 'research' | 'other';
  leadId: string;
  members: ProjectMember[]; // Changed from teamMembers to members with roles
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
  attachments: Attachment[];
  settings: {
    allowComments: boolean;
    allowFileUploads: boolean;
    requireApproval: boolean;
    notifyOnUpdates: boolean;
  };
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetType: 'project' | 'task' | 'comment';
  targetId: string;
  projectId: string;
  details?: string;
  timestamp: string;
}

interface ProjectContextType {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  activities: ActivityLog[];
  isAuthenticated: boolean;
  reloadUsers: () => Promise<void>;
  
  // Auth functions
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Project functions
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks' | 'attachments' | 'members'>) => string;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  
  // Member management functions
  addProjectMember: (projectId: string, userId: string, role: ProjectMember['role']) => void;
  removeProjectMember: (projectId: string, userId: string) => void;
  updateMemberRole: (projectId: string, userId: string, role: ProjectMember['role']) => void;
  updateMemberPermissions: (projectId: string, userId: string, permissions: Partial<ProjectMember['permissions']>) => void;
  
  // Task functions
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments' | 'loggedHours' | 'progress'>) => string;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, newStatus: Task['status']) => void;
  assignTask: (taskId: string, assigneeIds: string[]) => void;
  logTime: (taskId: string, hours: number, description?: string) => void;
  
  // Comment functions
  addComment: (targetType: 'project' | 'task', targetId: string, content: string, attachments?: Attachment[]) => void;
  updateComment: (commentId: string, content: string) => void;
  deleteComment: (commentId: string) => void;
  
  // Attachment functions
  addAttachment: (targetType: 'project' | 'task' | 'comment', targetId: string, attachment: Omit<Attachment, 'id' | 'uploadedAt'>) => void;
  removeAttachment: (attachmentId: string) => void;
  
  // Utility functions
  getMyProjects: () => Project[];
  getAssignedTasks: () => Task[];
  getTasksForProject: (projectId: string) => Task[];
  getUpcomingDeadlines: () => Task[];
  getProjectProgress: (projectId: string) => number;
  getProjectMember: (projectId: string, userId?: string) => ProjectMember | null;
  getUserProjectRole: (projectId: string, userId?: string) => ProjectMember['role'] | null;
  
  // Permission checks
  canEditProject: (projectId: string) => boolean;
  canManageMembers: (projectId: string) => boolean;
  canCreateTasks: (projectId: string) => boolean;
  canEditTask: (taskId: string) => boolean;
  canDeleteTasks: (projectId: string) => boolean;
  canManageSettings: (projectId: string) => boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  // AuthContext에서 실제 로그인한 사용자 가져오기
  const authContext = useAuth();
  const authUser = authContext?.user;

  // Users - API에서 로드
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // 사용자 목록 로드
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      const apiUsers = response.data.map((user: any) => ({
        id: user.id.toString(),
        name: user.fullName || user.username || '이름 없음',
        email: user.email || '',
        dbRole: user.role,
        role: user.role === 'ADMIN' ? 'admin' : 
              user.role === 'MANAGER' ? 'manager' : 'member',
        status: user.status,
        createdAt: user.createdAt || new Date().toISOString(),
        lastActive: user.updatedAt || new Date().toISOString()
      }));
      setUsers(apiUsers);
    } catch (error) {
      console.error('사용자 목록 로드 실패:', error);
      // 실패해도 빈 배열로 설정
      setUsers([]);
    }
  };

  const reloadUsers = async () => {
    await loadUsers();
  };

  // AuthContext의 사용자 정보로 currentUser 업데이트
  useEffect(() => {
    if (authUser) {
      // AuthContext의 사용자 정보를 ProjectContext의 User 형식으로 변환
      const projectUser: User = {
        id: authUser.id.toString(),
        name: authUser.fullName,
        email: authUser.email,
        avatar: authUser.profileImageUrl,
        dbRole: authUser.role,
        role: authUser.role === 'ADMIN' ? 'admin' : 
              authUser.role === 'MANAGER' ? 'manager' : 'member',
        status: authUser.status,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
      
      setCurrentUser(projectUser);
      
      // users 배열에 현재 사용자가 없으면 추가
      setUsers(prevUsers => {
        const existingUserIndex = prevUsers.findIndex(u => u.email === projectUser.email);
        if (existingUserIndex === -1) {
          return [projectUser, ...prevUsers];
        } else {
          // 기존 사용자 정보 업데이트
          const newUsers = [...prevUsers];
          newUsers[existingUserIndex] = projectUser;
          return newUsers;
        }
      });
    }
  }, [authUser]);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'proj-1',
      key: 'WEB',
      name: '웹사이트 리뉴얼 프로젝트',
      description: '회사 웹사이트의 전면적인 리뉴얼을 통해 사용자 경험을 개선하고 브랜드 이미지를 강화합니다.',
      status: 'active',
      type: 'software',
      leadId: 'user-1',
      members: [
        {
          userId: 'user-1',
          role: 'lead',
          joinedAt: '2024-02-15',
          addedBy: 'user-1',
          permissions: {
            canEditProject: true,
            canManageMembers: true,
            canCreateTasks: true,
            canEditAllTasks: true,
            canDeleteTasks: true,
            canManageSettings: true,
            canViewReports: true
          }
        },
        {
          userId: 'user-2',
          role: 'developer',
          joinedAt: '2024-02-16',
          addedBy: 'user-1',
          permissions: {
            canEditProject: false,
            canManageMembers: false,
            canCreateTasks: true,
            canEditAllTasks: false,
            canDeleteTasks: false,
            canManageSettings: false,
            canViewReports: true
          }
        },
        {
          userId: 'user-3',
          role: 'designer',
          joinedAt: '2024-02-17',
          addedBy: 'user-1',
          permissions: {
            canEditProject: false,
            canManageMembers: false,
            canCreateTasks: true,
            canEditAllTasks: false,
            canDeleteTasks: false,
            canManageSettings: false,
            canViewReports: true
          }
        },
        {
          userId: 'user-4',
          role: 'admin',
          joinedAt: '2024-02-18',
          addedBy: 'user-1',
          permissions: {
            canEditProject: true,
            canManageMembers: true,
            canCreateTasks: true,
            canEditAllTasks: true,
            canDeleteTasks: true,
            canManageSettings: true,
            canViewReports: true
          }
        },
        {
          userId: 'user-5',
          role: 'developer',
          joinedAt: '2024-03-15',
          addedBy: 'user-1',
          permissions: {
            canEditProject: false,
            canManageMembers: false,
            canCreateTasks: true,
            canEditAllTasks: false,
            canDeleteTasks: false,
            canManageSettings: false,
            canViewReports: true
          }
        }
      ],
      startDate: '2024-03-01',
      endDate: '2024-05-31',
      createdAt: '2024-02-15',
      updatedAt: '2024-03-12',
      tasks: [
        {
          id: 'task-1',
          title: '와이어프레임 설계',
          description: '메인 페이지와 주요 페이지들의 와이어프레임을 작성합니다. 사용자 플로우를 고려하여 직관적인 레이아웃을 설계해야 합니다.',
          status: 'done',
          priority: 'high',
          assigneeIds: ['user-3'],
          reporterId: 'user-1',
          projectId: 'proj-1',
          labels: ['design', 'ux'],
          estimatedHours: 20,
          loggedHours: 18,
          progress: 100,
          startDate: '2024-03-01',
          dueDate: '2024-03-08',
          createdAt: '2024-03-01',
          updatedAt: '2024-03-08',
          comments: [
            {
              id: 'comment-1',
              userId: 'user-1',
              userName: '김프로젝트',
              content: '와이어프레임이 매우 잘 나왔네요! 특히 네비게이션 구조가 직관적입니다.',
              createdAt: '2024-03-08T14:30:00Z'
            },
            {
              id: 'comment-2',
              userId: 'user-3',
              userName: '박디자이너',
              content: '감사합니다! 다음 단계인 시각적 디자인으로 넘어가겠습니다.',
              createdAt: '2024-03-08T15:00:00Z'
            }
          ],
          attachments: [
            {
              id: 'att-1',
              type: 'file',
              name: 'wireframe_v1.2.fig',
              url: '#',
              uploadedBy: 'user-3',
              uploadedAt: '2024-03-08T10:30:00Z'
            },
            {
              id: 'att-2',
              type: 'link',
              name: 'Figma 프로토타입',
              url: 'https://figma.com/proto/example',
              uploadedBy: 'user-3',
              uploadedAt: '2024-03-08T10:35:00Z'
            }
          ],
          dependencies: [],
          subtasks: [],
        },
        {
          id: 'task-2',
          title: 'API 설계 및 문서화',
          description: 'RESTful API 엔드포인트를 설계하고 Swagger 문서를 작성합니다. 프론트엔드와 백엔드 간의 데이터 교환 규격을 명확히 정의해야 합니다.',
          status: 'in-progress',
          priority: 'high',
          assigneeIds: ['user-2'],
          reporterId: 'user-4',
          projectId: 'proj-1',
          labels: ['backend', 'api', 'documentation'],
          estimatedHours: 16,
          loggedHours: 8,
          progress: 60,
          startDate: '2024-03-05',
          dueDate: '2024-03-15',
          createdAt: '2024-03-05',
          updatedAt: '2024-03-12',
          comments: [
            {
              id: 'comment-3',
              userId: 'user-4',
              userName: '최매니저',
              content: '진행 상황이 어떤가요? 예정된 일정대로 진행되고 있나요?',
              createdAt: '2024-03-12T09:00:00Z'
            },
            {
              id: 'comment-4',
              userId: 'user-2',
              userName: '이개발자',
              content: '네, 순조롭게 진행되고 있습니다. 이번 주 금요일까지는 완료될 예정입니다. 사용자 인증 관련 API가 좀 복잡해서 시간이 걸리고 있어요.',
              createdAt: '2024-03-12T09:30:00Z'
            }
          ],
          attachments: [
            {
              id: 'att-3',
              type: 'link',
              name: 'API 문서 (Swagger)',
              url: 'https://api-docs.example.com',
              uploadedBy: 'user-2',
              uploadedAt: '2024-03-10T16:20:00Z'
            }
          ],
          dependencies: [],
          subtasks: ['task-5', 'task-6'],
        },
        {
          id: 'task-3',
          title: 'UI 컴포넌트 개발',
          description: '재사용 가능한 UI 컴포넌트들을 개발합니다. 디자인 시스템에 맞춰 일관성 있는 컴포넌트를 제작해야 합니다.',
          status: 'todo',
          priority: 'medium',
          assigneeIds: ['user-2'],
          reporterId: 'user-1',
          projectId: 'proj-1',
          labels: ['frontend', 'ui', 'components'],
          estimatedHours: 24,
          loggedHours: 0,
          progress: 0,
          startDate: '2024-03-16',
          dueDate: '2024-03-30',
          createdAt: '2024-03-01',
          updatedAt: '2024-03-01',
          comments: [],
          attachments: [],
          dependencies: ['task-1'],
          subtasks: [],
        },
        {
          id: 'task-4',
          title: '성능 최적화',
          description: '웹사이트의 로딩 속도를 개선하고 SEO를 최적화합니다. 이미지 압축, 코드 스플리팅, 캐싱 전략 등을 적용합니다.',
          status: 'todo',
          priority: 'medium',
          assigneeIds: [],
          reporterId: 'user-4',
          projectId: 'proj-1',
          labels: ['performance', 'seo', 'optimization'],
          estimatedHours: 12,
          loggedHours: 0,
          progress: 0,
          startDate: '2024-04-15',
          dueDate: '2024-04-25',
          createdAt: '2024-03-01',
          updatedAt: '2024-03-01',
          comments: [],
          attachments: [],
          dependencies: ['task-3'],
          subtasks: [],
        },
        {
          id: 'task-5',
          title: '사용자 인증 API',
          description: '로그인, 회원가입, 비밀번호 재설정 등 사용자 인증 관련 API를 구현합니다.',
          status: 'in-progress',
          priority: 'high',
          assigneeIds: ['user-2'],
          reporterId: 'user-4',
          projectId: 'proj-1',
          labels: ['backend', 'auth', 'security'],
          estimatedHours: 8,
          loggedHours: 4,
          progress: 50,
          startDate: '2024-03-08',
          dueDate: '2024-03-14',
          createdAt: '2024-03-08',
          updatedAt: '2024-03-12',
          comments: [],
          attachments: [],
          dependencies: [],
          subtasks: [],
          parentTaskId: 'task-2',
        },
        {
          id: 'task-6',
          title: '데이터 CRUD API',
          description: '게시글, 댓글 등 주요 데이터의 생성, 조회, 수정, 삭제 API를 구현합니다.',
          status: 'todo',
          priority: 'high',
          assigneeIds: ['user-2'],
          reporterId: 'user-4',
          projectId: 'proj-1',
          labels: ['backend', 'crud', 'database'],
          estimatedHours: 8,
          loggedHours: 0,
          progress: 0,
          startDate: '2024-03-15',
          dueDate: '2024-03-20',
          createdAt: '2024-03-08',
          updatedAt: '2024-03-08',
          comments: [],
          attachments: [],
          dependencies: ['task-5'],
          subtasks: [],
          parentTaskId: 'task-2',
        },
        {
          id: 'task-7',
          title: '프론트엔드 컴포넌트 개발',
          description: '공통 UI 컴포넌트를 개발하고 재사용 가능한 라이브러리를 구축합니다.',
          status: 'in-progress',
          priority: 'medium',
          assigneeIds: ['user-5'],
          reporterId: 'user-1',
          projectId: 'proj-1',
          labels: ['frontend', 'component', 'ui'],
          estimatedHours: 12,
          loggedHours: 6,
          progress: 40,
          startDate: '2024-03-10',
          dueDate: '2024-03-22',
          createdAt: '2024-03-10',
          updatedAt: '2024-03-15',
          comments: [
            {
              id: 'comment-7',
              userId: 'user-1',
              userName: '김프로젝트',
              content: '버튼, 입력 필드, 카드 컴포넌트부터 시작해주세요. 디자인 시스템을 참고해서 작업해주시면 됩니다.',
              createdAt: '2024-03-10T10:00:00Z'
            }
          ],
          attachments: [],
          dependencies: [],
          subtasks: [],
        },
        {
          id: 'task-8',
          title: '반응형 웹 구현',
          description: '모바일, 태블릿, 데스크톱 화면에 최적화된 반응형 레이아웃을 구현합니다.',
          status: 'todo',
          priority: 'medium',
          assigneeIds: ['user-5'],
          reporterId: 'user-1',
          projectId: 'proj-1',
          labels: ['frontend', 'responsive', 'css'],
          estimatedHours: 8,
          loggedHours: 0,
          progress: 0,
          startDate: '2024-03-25',
          dueDate: '2024-04-05',
          createdAt: '2024-03-15',
          updatedAt: '2024-03-15',
          comments: [],
          attachments: [],
          dependencies: ['task-7'],
          subtasks: [],
        }
      ],
      attachments: [
        {
          id: 'proj-att-1',
          type: 'file',
          name: '프로젝트 기획서.pdf',
          url: '#',
          size: 2048000,
          uploadedBy: 'user-1',
          uploadedAt: '2024-02-15T09:00:00Z'
        }
      ],
      settings: {
        allowComments: true,
        allowFileUploads: true,
        requireApproval: false,
        notifyOnUpdates: true,
      }
    },
    {
      id: 'proj-2',
      key: 'MOB',
      name: '모바일 앱 개발',
      description: '고객 서비스 개선을 위한 모바일 애플리케이션을 개발합니다.',
      status: 'planning',
      type: 'software',
      leadId: 'user-4',
      members: [
        {
          userId: 'user-4',
          role: 'lead',
          joinedAt: '2024-03-01',
          addedBy: 'user-4',
          permissions: {
            canEditProject: true,
            canManageMembers: true,
            canCreateTasks: true,
            canEditAllTasks: true,
            canDeleteTasks: true,
            canManageSettings: true,
            canViewReports: true
          }
        },
        {
          userId: 'user-2',
          role: 'developer',
          joinedAt: '2024-03-02',
          addedBy: 'user-4',
          permissions: {
            canEditProject: false,
            canManageMembers: false,
            canCreateTasks: true,
            canEditAllTasks: false,
            canDeleteTasks: false,
            canManageSettings: false,
            canViewReports: true
          }
        },
        {
          userId: 'user-3',
          role: 'designer',
          joinedAt: '2024-03-03',
          addedBy: 'user-4',
          permissions: {
            canEditProject: false,
            canManageMembers: false,
            canCreateTasks: true,
            canEditAllTasks: false,
            canDeleteTasks: false,
            canManageSettings: false,
            canViewReports: true
          }
        }
      ],
      startDate: '2024-04-01',
      endDate: '2024-07-31',
      createdAt: '2024-03-01',
      updatedAt: '2024-03-10',
      tasks: [
        {
          id: 'task-7',
          title: '시장 조사 및 경쟁사 분석',
          description: '유사한 모바일 앱들을 분석하고 차별화 포인트를 찾습니다.',
          status: 'in-progress',
          priority: 'high',
          assigneeIds: ['user-4'],
          reporterId: 'user-4',
          projectId: 'proj-2',
          labels: ['research', 'analysis'],
          estimatedHours: 16,
          loggedHours: 6,
          progress: 40,
          startDate: '2024-03-11',
          dueDate: '2024-03-20',
          createdAt: '2024-03-11',
          updatedAt: '2024-03-12',
          comments: [],
          attachments: [],
          dependencies: [],
          subtasks: [],
        }
      ],
      attachments: [],
      settings: {
        allowComments: true,
        allowFileUploads: true,
        requireApproval: true,
        notifyOnUpdates: true,
      }
    }
  ]);

  const [activities, setActivities] = useState<ActivityLog[]>([
    {
      id: 'activity-1',
      userId: 'user-3',
      userName: '박디자이너',
      action: '태스크를 완료했습니다',
      targetType: 'task',
      targetId: 'task-1',
      projectId: 'proj-1',
      details: '와이어프레임 설계',
      timestamp: '2024-03-08T15:30:00Z'
    },
    {
      id: 'activity-2',
      userId: 'user-2',
      userName: '이개발자',
      action: '댓글을 남겼습니다',
      targetType: 'comment',
      targetId: 'comment-4',
      projectId: 'proj-1',
      details: 'API 설계 및 문서화 태스크에 진행 상황 업데이트',
      timestamp: '2024-03-12T09:30:00Z'
    }
  ]);

  // Helper functions
  const addActivity = (targetType: ActivityLog['targetType'], targetId: string, action: string, details?: string) => {
    if (!currentUser) return;
    
    let projectId = '';
    if (targetType === 'project') {
      projectId = targetId;
    } else if (targetType === 'task') {
      const task = projects.flatMap(p => p.tasks).find(t => t.id === targetId);
      projectId = task?.projectId || '';
    }
    
    const newActivity: ActivityLog = {
      id: `activity-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      targetType,
      targetId,
      projectId,
      details,
      timestamp: new Date().toISOString()
    };
    
    setActivities(prev => [newActivity, ...prev]);
  };

  // Auth functions
  const login = async (email: string, password: string): Promise<boolean> => {
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role: 'member',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
    
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Default permissions helper
  const getDefaultPermissions = (role: ProjectMember['role']): ProjectMember['permissions'] => {
    switch (role) {
      case 'lead':
        return {
          canEditProject: true,
          canManageMembers: true,
          canCreateTasks: true,
          canEditAllTasks: true,
          canDeleteTasks: true,
          canManageSettings: true,
          canViewReports: true
        };
      case 'admin':
        return {
          canEditProject: true,
          canManageMembers: true,
          canCreateTasks: true,
          canEditAllTasks: true,
          canDeleteTasks: true,
          canManageSettings: true,
          canViewReports: true
        };
      case 'developer':
        return {
          canEditProject: false,
          canManageMembers: false,
          canCreateTasks: true,
          canEditAllTasks: false,
          canDeleteTasks: false,
          canManageSettings: false,
          canViewReports: true
        };
      case 'designer':
        return {
          canEditProject: false,
          canManageMembers: false,
          canCreateTasks: true,
          canEditAllTasks: false,
          canDeleteTasks: false,
          canManageSettings: false,
          canViewReports: true
        };
      case 'tester':
        return {
          canEditProject: false,
          canManageMembers: false,
          canCreateTasks: true,
          canEditAllTasks: false,
          canDeleteTasks: false,
          canManageSettings: false,
          canViewReports: true
        };
      case 'viewer':
        return {
          canEditProject: false,
          canManageMembers: false,
          canCreateTasks: false,
          canEditAllTasks: false,
          canDeleteTasks: false,
          canManageSettings: false,
          canViewReports: true
        };
      default:
        return {
          canEditProject: false,
          canManageMembers: false,
          canCreateTasks: false,
          canEditAllTasks: false,
          canDeleteTasks: false,
          canManageSettings: false,
          canViewReports: false
        };
    }
  };

  // Project functions
  const createProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks' | 'attachments' | 'members'>): string => {
    if (!currentUser) return '';

    // Create project lead member
    const leadMember: ProjectMember = {
      userId: currentUser.id,
      role: 'lead',
      joinedAt: new Date().toISOString(),
      addedBy: currentUser.id,
      permissions: getDefaultPermissions('lead')
    };

    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      leadId: currentUser.id,
      members: [leadMember],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: [],
      attachments: []
    };
    
    setProjects(prev => [...prev, newProject]);
    addActivity('project', newProject.id, 'created', `프로젝트를 생성했습니다`);
    return newProject.id;
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, ...updates, updatedAt: new Date().toISOString() }
        : project
    ));
    addActivity('project', projectId, 'updated', '프로젝트를 수정했습니다');
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    addActivity('project', projectId, 'deleted', '프로젝트를 삭제했습니다');
  };

  // Member management functions
  const addProjectMember = (projectId: string, userId: string, role: ProjectMember['role']) => {
    if (!currentUser) return;

    const newMember: ProjectMember = {
      userId,
      role,
      joinedAt: new Date().toISOString(),
      addedBy: currentUser.id,
      permissions: getDefaultPermissions(role)
    };

    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { 
            ...project, 
            members: [...project.members.filter(m => m.userId !== userId), newMember],
            updatedAt: new Date().toISOString()
          }
        : project
    ));

    const user = users.find(u => u.id === userId);
    addActivity('project', projectId, 'member-added', `${user?.name}님을 ${role} 역할로 추가했습니다`);
  };

  const removeProjectMember = (projectId: string, userId: string) => {
    if (!currentUser) return;
    
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    // Can't remove the project lead
    if (project.leadId === userId) return;
    
    const memberToRemove = project.members.find(m => m.userId === userId);
    if (!memberToRemove) return;

    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { 
            ...project, 
            members: project.members.filter(m => m.userId !== userId),
            updatedAt: new Date().toISOString()
          }
        : project
    ));

    const user = users.find(u => u.id === userId);
    addActivity('project', projectId, 'member-removed', `${user?.name}님을 프로젝트에서 제거했습니다`);
  };

  const updateMemberRole = (projectId: string, userId: string, role: ProjectMember['role']) => {
    if (!currentUser) return;
    
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    // Can't change lead role
    if (project.leadId === userId && role !== 'lead') return;

    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { 
            ...project, 
            members: project.members.map(member => 
              member.userId === userId 
                ? { 
                    ...member, 
                    role,
                    permissions: getDefaultPermissions(role)
                  }
                : member
            ),
            updatedAt: new Date().toISOString()
          }
        : project
    ));

    const user = users.find(u => u.id === userId);
    addActivity('project', projectId, 'role-updated', `${user?.name}님의 역할을 ${role}로 변경했습니다`);
  };

  const updateMemberPermissions = (projectId: string, userId: string, permissions: Partial<ProjectMember['permissions']>) => {
    if (!currentUser) return;

    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { 
            ...project, 
            members: project.members.map(member => 
              member.userId === userId 
                ? { 
                    ...member, 
                    permissions: { ...member.permissions, ...permissions }
                  }
                : member
            ),
            updatedAt: new Date().toISOString()
          }
        : project
    ));

    const user = users.find(u => u.id === userId);
    addActivity('project', projectId, 'permissions-updated', `${user?.name}님의 권한을 수정했습니다`);
  };

  // Task functions
  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments' | 'loggedHours' | 'progress'>): string => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      attachments: [],
      loggedHours: 0,
      progress: 0
    };
    
    setProjects(prev => prev.map(project => 
      project.id === taskData.projectId 
        ? { ...project, tasks: [...project.tasks, newTask] }
        : project
    ));
    
    addActivity('task', newTask.id, 'created', `태스크를 생성했습니다: ${newTask.title}`);
    return newTask.id;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setProjects(prev => prev.map(project => ({
      ...project,
      tasks: project.tasks.map(task => 
        task.id === taskId 
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      )
    })));
    
    addActivity('task', taskId, 'updated', '태스크를 수정했습니다');
  };

  const deleteTask = (taskId: string) => {
    setProjects(prev => prev.map(project => ({
      ...project,
      tasks: project.tasks.filter(task => task.id !== taskId)
    })));
    
    addActivity('task', taskId, 'deleted', '태스크를 삭제했습니다');
  };

  const moveTask = (taskId: string, newStatus: Task['status']) => {
    updateTask(taskId, { status: newStatus });
    addActivity('task', taskId, 'moved', `태스크 상태를 ${newStatus}로 변경했습니다`);
  };

  const assignTask = (taskId: string, assigneeIds: string[]) => {
    updateTask(taskId, { assigneeIds });
    const assigneeNames = users.filter(u => assigneeIds.includes(u.id)).map(u => u.name);
    addActivity('task', taskId, 'assigned', `태스크를 ${assigneeNames.join(', ')}에게 할당했습니다`);
  };

  const logTime = (taskId: string, hours: number, description?: string) => {
    const task = projects.flatMap(p => p.tasks).find(t => t.id === taskId);
    if (task) {
      const newLoggedHours = task.loggedHours + hours;
      const progress = task.estimatedHours ? Math.min(100, (newLoggedHours / task.estimatedHours) * 100) : task.progress;
      updateTask(taskId, { 
        loggedHours: newLoggedHours,
        progress: Math.round(progress)
      });
      addActivity('task', taskId, 'logged-time', `${hours}시간을 기록했습니다`);
    }
  };

  // Comment functions
  const addComment = (targetType: 'project' | 'task', targetId: string, content: string, attachments: Attachment[] = []) => {
    if (!currentUser) return;
    
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      content,
      createdAt: new Date().toISOString(),
      attachments
    };

    if (targetType === 'task') {
      setProjects(prev => prev.map(project => ({
        ...project,
        tasks: project.tasks.map(task => 
          task.id === targetId 
            ? { ...task, comments: [...task.comments, newComment] }
            : task
        )
      })));
    }
    
    addActivity('comment', newComment.id, 'commented', '댓글을 남겼습니다');
  };

  const updateComment = (commentId: string, content: string) => {
    setProjects(prev => prev.map(project => ({
      ...project,
      tasks: project.tasks.map(task => ({
        ...task,
        comments: task.comments.map(comment => 
          comment.id === commentId 
            ? { ...comment, content, updatedAt: new Date().toISOString() }
            : comment
        )
      }))
    })));
  };

  const deleteComment = (commentId: string) => {
    setProjects(prev => prev.map(project => ({
      ...project,
      tasks: project.tasks.map(task => ({
        ...task,
        comments: task.comments.filter(comment => comment.id !== commentId)
      }))
    })));
  };

  // Attachment functions
  const addAttachment = (targetType: 'project' | 'task' | 'comment', targetId: string, attachmentData: Omit<Attachment, 'id' | 'uploadedAt'>) => {
    const newAttachment: Attachment = {
      ...attachmentData,
      id: `att-${Date.now()}`,
      uploadedAt: new Date().toISOString()
    };

    if (targetType === 'task') {
      setProjects(prev => prev.map(project => ({
        ...project,
        tasks: project.tasks.map(task => 
          task.id === targetId 
            ? { ...task, attachments: [...task.attachments, newAttachment] }
            : task
        )
      })));
    } else if (targetType === 'project') {
      setProjects(prev => prev.map(project => 
        project.id === targetId 
          ? { ...project, attachments: [...project.attachments, newAttachment] }
          : project
      ));
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setProjects(prev => prev.map(project => ({
      ...project,
      attachments: project.attachments.filter(att => att.id !== attachmentId),
      tasks: project.tasks.map(task => ({
        ...task,
        attachments: task.attachments.filter(att => att.id !== attachmentId)
      }))
    })));
  };

  // Utility functions
  const getMyProjects = (): Project[] => {
    if (!currentUser) return [];
    return projects.filter(project => 
      project.leadId === currentUser.id || 
      project.members.some(member => member.userId === currentUser.id)
    );
  };

  const getAssignedTasks = (): Task[] => {
    if (!currentUser) return [];
    return projects.flatMap(project => 
      project.tasks.filter(task => task.assigneeIds.includes(currentUser.id))
    );
  };

  const getTasksForProject = (projectId: string): Task[] => {
    const project = projects.find(p => p.id === projectId);
    return project?.tasks || [];
  };

  const getUpcomingDeadlines = (): Task[] => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return projects.flatMap(project => 
      project.tasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= now && dueDate <= sevenDaysFromNow && task.status !== 'done';
      })
    ).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  };

  const getProjectProgress = (projectId: string): number => {
    const project = projects.find(p => p.id === projectId);
    if (!project || project.tasks.length === 0) return 0;
    
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(task => task.status === 'done').length;
    return Math.round((completedTasks / totalTasks) * 100);
  };

  const getProjectMember = (projectId: string, userId?: string): ProjectMember | null => {
    const targetUserId = userId || currentUser?.id;
    if (!targetUserId) return null;
    
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;
    
    return project.members.find(member => member.userId === targetUserId) || null;
  };

  const getUserProjectRole = (projectId: string, userId?: string): ProjectMember['role'] | null => {
    const member = getProjectMember(projectId, userId);
    return member?.role || null;
  };

  // Permission checks
  const canEditProject = (projectId: string): boolean => {
    if (!currentUser) return false;
    const member = getProjectMember(projectId);
    return member?.permissions.canEditProject || false;
  };

  const canManageMembers = (projectId: string): boolean => {
    if (!currentUser) return false;
    const member = getProjectMember(projectId);
    return member?.permissions.canManageMembers || false;
  };

  const canCreateTasks = (projectId: string): boolean => {
    if (!currentUser) return false;
    const member = getProjectMember(projectId);
    return member?.permissions.canCreateTasks || false;
  };

  const canEditTask = (taskId: string): boolean => {
    if (!currentUser) return false;
    const task = projects.flatMap(p => p.tasks).find(t => t.id === taskId);
    if (!task) return false;
    
    const member = getProjectMember(task.projectId);
    if (!member) return false;
    
    // Can edit if assigned to task, reported the task, or has permission to edit all tasks
    return task.assigneeIds.includes(currentUser.id) || 
           task.reporterId === currentUser.id || 
           member.permissions.canEditAllTasks;
  };

  const canDeleteTasks = (projectId: string): boolean => {
    if (!currentUser) return false;
    const member = getProjectMember(projectId);
    return member?.permissions.canDeleteTasks || false;
  };

  const canManageSettings = (projectId: string): boolean => {
    if (!currentUser) return false;
    const member = getProjectMember(projectId);
    return member?.permissions.canManageSettings || false;
  };

  return (
    <ProjectContext.Provider value={{
      currentUser,
      users,
      projects,
      activities,
      isAuthenticated,
      reloadUsers,
      login,
      register,
      logout,
      createProject,
      updateProject,
      deleteProject,
      addProjectMember,
      removeProjectMember,
      updateMemberRole,
      updateMemberPermissions,
      createTask,
      updateTask,
      deleteTask,
      moveTask,
      assignTask,
      logTime,
      addComment,
      updateComment,
      deleteComment,
      addAttachment,
      removeAttachment,
      getMyProjects,
      getAssignedTasks,
      getTasksForProject,
      getUpcomingDeadlines,
      getProjectProgress,
      getProjectMember,
      getUserProjectRole,
      canEditProject,
      canManageMembers,
      canCreateTasks,
      canEditTask,
      canDeleteTasks,
      canManageSettings
    }}>
      {children}
    </ProjectContext.Provider>
  );
}