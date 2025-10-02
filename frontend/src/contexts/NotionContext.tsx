import { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  lastActive: string;
}

export interface PageMember {
  userId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joinedAt: string;
  invitedBy: string;
}

export interface Page {
  id: string;
  title: string;
  content: string;
  icon?: string;
  coverImage?: string;
  ownerId: string;
  members: PageMember[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  lastEditedBy: string;
  version: number;
  template?: 'blank' | 'project' | 'notes' | 'database' | 'wiki';
  parentId?: string; // 하위 페이지를 위한 부모 페이지 ID
  order: number;
}

export interface Invitation {
  id: string;
  pageId: string;
  inviterUserId: string;
  inviteeEmail: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  expiresAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  pageId: string;
  action: 'created' | 'edited' | 'deleted' | 'invited' | 'joined' | 'shared';
  details?: string;
  timestamp: string;
}

interface NotionContextType {
  currentUser: User | null;
  users: User[];
  pages: Page[];
  invitations: Invitation[];
  activities: Activity[];
  isAuthenticated: boolean;
  
  // Auth functions
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Page functions
  createPage: (title: string, template?: string) => string;
  updatePage: (pageId: string, updates: Partial<Page>) => void;
  deletePage: (pageId: string) => void;
  duplicatePage: (pageId: string) => string;
  
  // Member functions
  inviteToPage: (pageId: string, email: string, role: 'admin' | 'editor' | 'viewer') => void;
  acceptInvitation: (invitationId: string) => void;
  declineInvitation: (invitationId: string) => void;
  removeMemberFromPage: (pageId: string, userId: string) => void;
  updateMemberRole: (pageId: string, userId: string, role: 'admin' | 'editor' | 'viewer') => void;
  
  // Utility functions
  getMyPages: () => Page[];
  getSharedPages: () => Page[];
  getPagesByRole: (role: 'owner' | 'admin' | 'editor' | 'viewer') => Page[];
  canEditPage: (pageId: string) => boolean;
  canManagePage: (pageId: string) => boolean;
  getUserRole: (pageId: string) => 'owner' | 'admin' | 'editor' | 'viewer' | null;
}

const NotionContext = createContext<NotionContextType | undefined>(undefined);

export function useNotion() {
  const context = useContext(NotionContext);
  if (context === undefined) {
    throw new Error('useNotion must be used within a NotionProvider');
  }
  return context;
}

export function NotionProvider({ children }: { children: ReactNode }) {
  // Mock users
  const [users, setUsers] = useState<User[]>([
    {
      id: 'user-1',
      name: '김철수',
      email: 'kim@example.com',
      createdAt: '2024-01-01',
      lastActive: new Date().toISOString()
    },
    {
      id: 'user-2',
      name: '이영희',
      email: 'lee@example.com',
      createdAt: '2024-01-15',
      lastActive: '2024-03-10T14:30:00Z'
    },
    {
      id: 'user-3',
      name: '박민수',
      email: 'park@example.com',
      createdAt: '2024-02-01',
      lastActive: '2024-03-10T16:45:00Z'
    }
  ]);

  const [currentUser, setCurrentUser] = useState<User | null>(users[0]); // 로그인된 상태로 시작
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const [pages, setPages] = useState<Page[]>([
    {
      id: 'page-1',
      title: '개인 노트',
      content: '# 개인 노트\n\n이것은 나만의 개인 노트 공간입니다.\n\n## 할 일\n- [ ] 프로젝트 계획 수립\n- [ ] 팀 미팅 준비\n- [x] 문서 정리',
      icon: '📝',
      ownerId: 'user-1',
      members: [
        { userId: 'user-1', role: 'owner', joinedAt: '2024-01-01', invitedBy: 'user-1' }
      ],
      isPublic: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-03-10',
      lastEditedBy: 'user-1',
      version: 3,
      template: 'notes',
      order: 1
    },
    {
      id: 'page-2',
      title: '팀 프로젝트 - 웹사이트 리뉴얼',
      content: '# 웹사이트 리뉴얼 프로젝트\n\n## 프로젝트 개요\n새로운 디자인 시스템을 적용한 웹사이트 리뉴얼 프로젝트입니다.\n\n## 팀 구성\n- PM: 김철수\n- 디자이너: 이영희\n- 개발자: 박민수\n\n## 일정\n- 기획: 3월 1일 - 3월 15일\n- 디자인: 3월 16일 - 4월 5일\n- 개발: 4월 6일 - 4월 30일',
      icon: '🚀',
      ownerId: 'user-1',
      members: [
        { userId: 'user-1', role: 'owner', joinedAt: '2024-02-01', invitedBy: 'user-1' },
        { userId: 'user-2', role: 'editor', joinedAt: '2024-02-05', invitedBy: 'user-1' },
        { userId: 'user-3', role: 'editor', joinedAt: '2024-02-10', invitedBy: 'user-1' }
      ],
      isPublic: false,
      createdAt: '2024-02-01',
      updatedAt: '2024-03-12',
      lastEditedBy: 'user-2',
      version: 8,
      template: 'project',
      order: 2
    },
    {
      id: 'page-3',
      title: '공유 지식베이스',
      content: '# 팀 지식베이스\n\n## 개발 가이드라인\n\n### 코딩 컨벤션\n- 변수명은 camelCase 사용\n- 함수명은 동사+명사 형태\n\n### Git 워크플로우\n1. feature 브랜치 생성\n2. 작업 완료 후 PR 생성\n3. 코드 리뷰 후 merge',
      icon: '📚',
      ownerId: 'user-2',
      members: [
        { userId: 'user-2', role: 'owner', joinedAt: '2024-01-20', invitedBy: 'user-2' },
        { userId: 'user-1', role: 'editor', joinedAt: '2024-01-25', invitedBy: 'user-2' },
        { userId: 'user-3', role: 'viewer', joinedAt: '2024-02-01', invitedBy: 'user-2' }
      ],
      isPublic: true,
      createdAt: '2024-01-20',
      updatedAt: '2024-03-08',
      lastEditedBy: 'user-2',
      version: 12,
      template: 'wiki',
      order: 1
    }
  ]);

  const [invitations, setInvitations] = useState<Invitation[]>([
    {
      id: 'invite-1',
      pageId: 'page-2',
      inviterUserId: 'user-1',
      inviteeEmail: 'newuser@example.com',
      role: 'editor',
      status: 'pending',
      createdAt: '2024-03-10',
      expiresAt: '2024-03-17'
    }
  ]);

  const [activities, setActivities] = useState<Activity[]>([
    {
      id: 'activity-1',
      userId: 'user-2',
      userName: '이영희',
      pageId: 'page-2',
      action: 'edited',
      details: '프로젝트 일정 업데이트',
      timestamp: '2024-03-12T10:30:00Z'
    },
    {
      id: 'activity-2',
      userId: 'user-1',
      userName: '김철수',
      pageId: 'page-1',
      action: 'created',
      details: '개인 노트 페이지 생성',
      timestamp: '2024-01-01T09:00:00Z'
    }
  ]);

  // Auth functions
  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login logic
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    // Mock registration logic
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
    
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    
    // Create welcome page for new user
    const welcomePage: Page = {
      id: `page-${Date.now()}`,
      title: '시작하기',
      content: `# ${name}님, 환영합니다! 👋\n\n이곳은 당신만의 워크스페이스입니다.\n\n## 할 수 있는 것들\n- 📝 노트 작성\n- 🗂️ 프로젝트 관리\n- 👥 팀원들과 협업\n- 📊 데이터베이스 생성\n\n새로운 페이지를 만들어 시작해보세요!`,
      icon: '🎉',
      ownerId: newUser.id,
      members: [
        { userId: newUser.id, role: 'owner', joinedAt: new Date().toISOString(), invitedBy: newUser.id }
      ],
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastEditedBy: newUser.id,
      version: 1,
      template: 'blank',
      order: 1
    };
    
    setPages(prev => [...prev, welcomePage]);
    
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Page functions
  const createPage = (title: string, template = 'blank'): string => {
    if (!currentUser) return '';
    
    const newPage: Page = {
      id: `page-${Date.now()}`,
      title,
      content: getTemplateContent(title, template),
      icon: getTemplateIcon(template),
      ownerId: currentUser.id,
      members: [
        { userId: currentUser.id, role: 'owner', joinedAt: new Date().toISOString(), invitedBy: currentUser.id }
      ],
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastEditedBy: currentUser.id,
      version: 1,
      template: template as any,
      order: pages.filter(p => p.ownerId === currentUser.id).length + 1
    };
    
    setPages(prev => [...prev, newPage]);
    
    addActivity({
      userId: currentUser.id,
      userName: currentUser.name,
      pageId: newPage.id,
      action: 'created',
      details: `새 페이지 "${title}" 생성`
    });
    
    return newPage.id;
  };

  const updatePage = (pageId: string, updates: Partial<Page>) => {
    if (!currentUser) return;
    
    setPages(prev => prev.map(page => 
      page.id === pageId 
        ? { 
            ...page, 
            ...updates, 
            updatedAt: new Date().toISOString(),
            lastEditedBy: currentUser.id,
            version: page.version + 1
          }
        : page
    ));

    if (updates.content || updates.title) {
      addActivity({
        userId: currentUser.id,
        userName: currentUser.name,
        pageId,
        action: 'edited',
        details: updates.title ? `페이지 제목을 "${updates.title}"로 변경` : '페이지 내용 수정'
      });
    }
  };

  const deletePage = (pageId: string) => {
    if (!currentUser) return;
    
    const page = pages.find(p => p.id === pageId);
    if (!page || page.ownerId !== currentUser.id) return;
    
    setPages(prev => prev.filter(p => p.id !== pageId));
    
    addActivity({
      userId: currentUser.id,
      userName: currentUser.name,
      pageId,
      action: 'deleted',
      details: `페이지 "${page.title}" 삭제`
    });
  };

  const duplicatePage = (pageId: string): string => {
    if (!currentUser) return '';
    
    const originalPage = pages.find(p => p.id === pageId);
    if (!originalPage) return '';
    
    const newPage: Page = {
      ...originalPage,
      id: `page-${Date.now()}`,
      title: `${originalPage.title} (복사본)`,
      ownerId: currentUser.id,
      members: [
        { userId: currentUser.id, role: 'owner', joinedAt: new Date().toISOString(), invitedBy: currentUser.id }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastEditedBy: currentUser.id,
      version: 1,
      order: pages.filter(p => p.ownerId === currentUser.id).length + 1
    };
    
    setPages(prev => [...prev, newPage]);
    
    return newPage.id;
  };

  // Member functions
  const inviteToPage = (pageId: string, email: string, role: 'admin' | 'editor' | 'viewer') => {
    if (!currentUser) return;
    
    const invitation: Invitation = {
      id: `invite-${Date.now()}`,
      pageId,
      inviterUserId: currentUser.id,
      inviteeEmail: email,
      role,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7일 후 만료
    };
    
    setInvitations(prev => [...prev, invitation]);
    
    addActivity({
      userId: currentUser.id,
      userName: currentUser.name,
      pageId,
      action: 'invited',
      details: `${email}을 ${role} 권한으로 초대`
    });
  };

  const acceptInvitation = (invitationId: string) => {
    if (!currentUser) return;
    
    const invitation = invitations.find(i => i.id === invitationId);
    if (!invitation || invitation.inviteeEmail !== currentUser.email) return;
    
    // Add user to page members
    setPages(prev => prev.map(page => 
      page.id === invitation.pageId
        ? {
            ...page,
            members: [...page.members, {
              userId: currentUser.id,
              role: invitation.role,
              joinedAt: new Date().toISOString(),
              invitedBy: invitation.inviterUserId
            }]
          }
        : page
    ));
    
    // Update invitation status
    setInvitations(prev => prev.map(inv => 
      inv.id === invitationId 
        ? { ...inv, status: 'accepted' as const }
        : inv
    ));
    
    addActivity({
      userId: currentUser.id,
      userName: currentUser.name,
      pageId: invitation.pageId,
      action: 'joined',
      details: `페이지에 ${invitation.role} 권한으로 참여`
    });
  };

  const declineInvitation = (invitationId: string) => {
    setInvitations(prev => prev.map(inv => 
      inv.id === invitationId 
        ? { ...inv, status: 'declined' as const }
        : inv
    ));
  };

  const removeMemberFromPage = (pageId: string, userId: string) => {
    if (!canManagePage(pageId)) return;
    
    setPages(prev => prev.map(page => 
      page.id === pageId
        ? { ...page, members: page.members.filter(m => m.userId !== userId) }
        : page
    ));
  };

  const updateMemberRole = (pageId: string, userId: string, role: 'admin' | 'editor' | 'viewer') => {
    if (!canManagePage(pageId)) return;
    
    setPages(prev => prev.map(page => 
      page.id === pageId
        ? {
            ...page,
            members: page.members.map(m => 
              m.userId === userId ? { ...m, role } : m
            )
          }
        : page
    ));
  };

  // Utility functions
  const getMyPages = (): Page[] => {
    if (!currentUser) return [];
    return pages.filter(page => page.ownerId === currentUser.id);
  };

  const getSharedPages = (): Page[] => {
    if (!currentUser) return [];
    return pages.filter(page => 
      page.ownerId !== currentUser.id && 
      page.members.some(m => m.userId === currentUser.id)
    );
  };

  const getPagesByRole = (role: 'owner' | 'admin' | 'editor' | 'viewer'): Page[] => {
    if (!currentUser) return [];
    
    return pages.filter(page => {
      if (role === 'owner') {
        return page.ownerId === currentUser.id;
      }
      const member = page.members.find(m => m.userId === currentUser.id);
      return member?.role === role;
    });
  };

  const canEditPage = (pageId: string): boolean => {
    if (!currentUser) return false;
    
    const page = pages.find(p => p.id === pageId);
    if (!page) return false;
    
    if (page.ownerId === currentUser.id) return true;
    
    const member = page.members.find(m => m.userId === currentUser.id);
    return member?.role === 'admin' || member?.role === 'editor';
  };

  const canManagePage = (pageId: string): boolean => {
    if (!currentUser) return false;
    
    const page = pages.find(p => p.id === pageId);
    if (!page) return false;
    
    if (page.ownerId === currentUser.id) return true;
    
    const member = page.members.find(m => m.userId === currentUser.id);
    return member?.role === 'admin';
  };

  const getUserRole = (pageId: string): 'owner' | 'admin' | 'editor' | 'viewer' | null => {
    if (!currentUser) return null;
    
    const page = pages.find(p => p.id === pageId);
    if (!page) return null;
    
    if (page.ownerId === currentUser.id) return 'owner';
    
    const member = page.members.find(m => m.userId === currentUser.id);
    return member?.role || null;
  };

  // Helper functions
  const addActivity = (activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = {
      ...activity,
      id: `activity-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  const getTemplateContent = (title: string, template: string): string => {
    switch (template) {
      case 'project':
        return `# ${title}\n\n## 프로젝트 개요\n\n## 목표\n\n## 팀 구성\n\n## 일정\n\n## 진행 상황\n- [ ] 기획\n- [ ] 디자인\n- [ ] 개발\n- [ ] 테스트\n- [ ] 배포`;
      case 'notes':
        return `# ${title}\n\n## 메모\n\n## 아이디어\n\n## 할 일\n- [ ] \n- [ ] \n- [ ] `;
      case 'database':
        return `# ${title}\n\n## 데이터베이스 구조\n\n| 이름 | 타입 | 설명 |\n|------|------|------|\n| | | |\n\n## 관련 정보`;
      case 'wiki':
        return `# ${title}\n\n## 개요\n\n## 상세 내용\n\n## 참고 자료\n\n## 관련 문서`;
      default:
        return `# ${title}\n\n페이지 내용을 작성해보세요...`;
    }
  };

  const getTemplateIcon = (template: string): string => {
    switch (template) {
      case 'project': return '🚀';
      case 'notes': return '📝';
      case 'database': return '🗃️';
      case 'wiki': return '📚';
      default: return '📄';
    }
  };

  return (
    <NotionContext.Provider value={{
      currentUser,
      users,
      pages,
      invitations,
      activities,
      isAuthenticated,
      login,
      register,
      logout,
      createPage,
      updatePage,
      deletePage,
      duplicatePage,
      inviteToPage,
      acceptInvitation,
      declineInvitation,
      removeMemberFromPage,
      updateMemberRole,
      getMyPages,
      getSharedPages,
      getPagesByRole,
      canEditPage,
      canManagePage,
      getUserRole
    }}>
      {children}
    </NotionContext.Provider>
  );
}