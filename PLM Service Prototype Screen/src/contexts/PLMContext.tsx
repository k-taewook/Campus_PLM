import { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  avatar?: string;
  joinDate: string;
  lastActive: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: User[];
  createdBy: string;
  createdAt: string;
  color: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  projectId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  projectId: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetType: 'project' | 'document' | 'file' | 'team' | 'user';
  targetId: string;
  targetName: string;
  timestamp: string;
  details?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'paused';
  teamId: string;
  managerId: string;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  progress: number;
  documents: Document[];
  files: FileItem[];
}

interface PLMContextType {
  users: User[];
  teams: Team[];
  projects: Project[];
  activities: ActivityLog[];
  addUser: (user: Omit<User, 'id' | 'joinDate' | 'lastActive'>) => void;
  addTeam: (team: Omit<Team, 'id' | 'createdAt'>) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'documents' | 'files'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  addDocument: (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => void;
  updateDocument: (id: string, content: string, authorId: string) => void;
  addFile: (file: Omit<FileItem, 'id' | 'uploadedAt'>) => void;
  addActivity: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  currentUser: User;
}

const PLMContext = createContext<PLMContextType | undefined>(undefined);

export function usePLM() {
  const context = useContext(PLMContext);
  if (context === undefined) {
    throw new Error('usePLM must be used within a PLMProvider');
  }
  return context;
}

export function PLMProvider({ children }: { children: ReactNode }) {
  // Mock 현재 사용자
  const currentUser: User = {
    id: 'user-1',
    name: '김관리자',
    email: 'admin@company.com',
    role: 'admin',
    joinDate: '2024-01-01',
    lastActive: new Date().toISOString()
  };

  // Mock 데이터
  const [users, setUsers] = useState<User[]>([
    currentUser,
    {
      id: 'user-2',
      name: '이팀장',
      email: 'team.leader@company.com',
      role: 'manager',
      joinDate: '2024-01-15',
      lastActive: '2024-03-10T14:30:00Z'
    },
    {
      id: 'user-3',
      name: '박개발자',
      email: 'developer@company.com',
      role: 'member',
      joinDate: '2024-02-01',
      lastActive: '2024-03-10T16:45:00Z'
    }
  ]);

  const [teams, setTeams] = useState<Team[]>([
    {
      id: 'team-1',
      name: '개발팀',
      description: '제품 개발을 담당하는 팀입니다',
      members: users.slice(1),
      createdBy: 'user-1',
      createdAt: '2024-01-01',
      color: 'bg-blue-100'
    }
  ]);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'project-1',
      name: 'PLM 시스템 개발',
      description: '협업을 위한 PLM 시스템 구축 프로젝트',
      status: 'active',
      teamId: 'team-1',
      managerId: 'user-2',
      createdAt: '2024-01-01',
      updatedAt: '2024-03-10',
      deadline: '2024-06-30',
      progress: 65,
      documents: [
        {
          id: 'doc-1',
          title: '프로젝트 기획서',
          content: '# PLM 시스템 개발 프로젝트\n\n## 목표\n- 효율적인 프로젝트 관리\n- 팀 협업 강화\n- 문서 버전 관리',
          projectId: 'project-1',
          authorId: 'user-2',
          createdAt: '2024-01-05',
          updatedAt: '2024-01-05',
          version: 1
        }
      ],
      files: [
        {
          id: 'file-1',
          name: '요구사항정의서.pdf',
          size: 1024000,
          type: 'application/pdf',
          projectId: 'project-1',
          uploadedBy: 'user-2',
          uploadedAt: '2024-01-10',
          url: '#'
        }
      ]
    }
  ]);

  const [activities, setActivities] = useState<ActivityLog[]>([
    {
      id: 'activity-1',
      userId: 'user-2',
      userName: '이팀장',
      action: '문서를 생성했습니다',
      targetType: 'document',
      targetId: 'doc-1',
      targetName: '프로젝트 기획서',
      timestamp: '2024-01-05T10:30:00Z'
    },
    {
      id: 'activity-2',
      userId: 'user-2',
      userName: '이팀장',
      action: '파일을 업로드했습니다',
      targetType: 'file',
      targetId: 'file-1',
      targetName: '요구사항정의서.pdf',
      timestamp: '2024-01-10T14:20:00Z'
    }
  ]);

  const addUser = (userData: Omit<User, 'id' | 'joinDate' | 'lastActive'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      joinDate: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
    addActivity({
      userId: currentUser.id,
      userName: currentUser.name,
      action: '새 사용자를 추가했습니다',
      targetType: 'user',
      targetId: newUser.id,
      targetName: newUser.name
    });
  };

  const addTeam = (teamData: Omit<Team, 'id' | 'createdAt'>) => {
    const newTeam: Team = {
      ...teamData,
      id: `team-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setTeams(prev => [...prev, newTeam]);
    addActivity({
      userId: currentUser.id,
      userName: currentUser.name,
      action: '새 팀을 생성했습니다',
      targetType: 'team',
      targetId: newTeam.id,
      targetName: newTeam.name
    });
  };

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'documents' | 'files'>) => {
    const newProject: Project = {
      ...projectData,
      id: `project-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
      documents: [],
      files: []
    };
    setProjects(prev => [...prev, newProject]);
    addActivity({
      userId: currentUser.id,
      userName: currentUser.name,
      action: '새 프로젝트를 생성했습니다',
      targetType: 'project',
      targetId: newProject.id,
      targetName: newProject.name
    });
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      project.id === id 
        ? { ...project, ...updates, updatedAt: new Date().toISOString() }
        : project
    ));
  };

  const addDocument = (docData: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => {
    const newDocument: Document = {
      ...docData,
      id: `doc-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };
    
    setProjects(prev => prev.map(project => 
      project.id === docData.projectId 
        ? { ...project, documents: [...project.documents, newDocument] }
        : project
    ));

    addActivity({
      userId: docData.authorId,
      userName: users.find(u => u.id === docData.authorId)?.name || '알 수 없음',
      action: '문서를 생성했습니다',
      targetType: 'document',
      targetId: newDocument.id,
      targetName: newDocument.title
    });
  };

  const updateDocument = (id: string, content: string, authorId: string) => {
    setProjects(prev => prev.map(project => ({
      ...project,
      documents: project.documents.map(doc => 
        doc.id === id 
          ? { 
              ...doc, 
              content, 
              updatedAt: new Date().toISOString(),
              version: doc.version + 1
            }
          : doc
      )
    })));

    const document = projects.flatMap(p => p.documents).find(d => d.id === id);
    if (document) {
      addActivity({
        userId: authorId,
        userName: users.find(u => u.id === authorId)?.name || '알 수 없음',
        action: '문서를 수정했습니다',
        targetType: 'document',
        targetId: id,
        targetName: document.title
      });
    }
  };

  const addFile = (fileData: Omit<FileItem, 'id' | 'uploadedAt'>) => {
    const newFile: FileItem = {
      ...fileData,
      id: `file-${Date.now()}`,
      uploadedAt: new Date().toISOString()
    };

    setProjects(prev => prev.map(project => 
      project.id === fileData.projectId 
        ? { ...project, files: [...project.files, newFile] }
        : project
    ));

    addActivity({
      userId: fileData.uploadedBy,
      userName: users.find(u => u.id === fileData.uploadedBy)?.name || '알 수 없음',
      action: '파일을 업로드했습니다',
      targetType: 'file',
      targetId: newFile.id,
      targetName: newFile.name
    });
  };

  const addActivity = (activityData: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newActivity: ActivityLog = {
      ...activityData,
      id: `activity-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  return (
    <PLMContext.Provider value={{
      users,
      teams,
      projects,
      activities,
      addUser,
      addTeam,
      addProject,
      updateProject,
      addDocument,
      updateDocument,
      addFile,
      addActivity,
      currentUser
    }}>
      {children}
    </PLMContext.Provider>
  );
}