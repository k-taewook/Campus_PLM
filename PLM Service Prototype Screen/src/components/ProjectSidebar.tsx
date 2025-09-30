import { useState } from 'react';
import { 
  Plus, 
  FolderKanban, 
  Search, 
  Settings, 
  UserCircle, 
  LogOut,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  MoreHorizontal,
  Users,
  Calendar,
  BarChart3,
  Clock,
  Home,
  Edit
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useProjects, type Project } from '../contexts/ProjectContext';
import EditProjectDialog from './EditProjectDialog';

interface ProjectSidebarProps {
  selectedProjectId: string | null;
  onProjectSelect: (projectId: string | null) => void;
  onCreateProject: () => void;
  showDashboard: boolean;
  onShowDashboard: () => void;
  showUserProfile: boolean;
  onShowUserProfile: () => void;
  showAdminUserManagement: boolean;
  onShowAdminUserManagement: () => void;
  showSettings: boolean;
  onShowSettings: () => void;
}

export default function ProjectSidebar({ 
  selectedProjectId, 
  onProjectSelect, 
  onCreateProject,
  showDashboard,
  onShowDashboard,
  showUserProfile,
  onShowUserProfile,
  showAdminUserManagement,
  onShowAdminUserManagement,
  showSettings,
  onShowSettings
}: ProjectSidebarProps) {
  const { 
    currentUser, 
    logout, 
    getMyProjects,
    getProjectProgress,
    canEditProject,
    projects
  } = useProjects();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['my-projects']));
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const myProjects = getMyProjects();

  const filteredProjects = myProjects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(project);
    setShowEditDialog(true);
  };

  const handleProjectDeleted = () => {
    // 삭제된 프로젝트가 현재 선택된 프로젝트라면 대시보드로 이동
    if (editingProject && selectedProjectId === editingProject.id) {
      onShowDashboard();
    }
    setEditingProject(null);
  };

  const ProjectItem = ({ project }: { project: Project }) => {
    const progress = getProjectProgress(project.id);
    const isSelected = selectedProjectId === project.id;
    const canEdit = canEditProject(project.id);
    
    if (isCollapsed) {
      return (
        <Button
          variant={isSelected ? "default" : "ghost"}
          className="w-full justify-center px-0 h-10"
          onClick={() => onProjectSelect(project.id)}
          title={`${project.name} (${progress}% 완료)`}
        >
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded text-white flex items-center justify-center text-xs font-bold">
            {project.key}
          </div>
        </Button>
      );
    }
    
    return (
      <div 
        className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
          isSelected ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
        }`}
        onClick={() => onProjectSelect(project.id)}
      >
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">{project.key}</span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm truncate">{project.name}</span>
            <Badge className={`${getStatusColor(project.status)} text-xs`}>
              {project.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{progress}% 완료</span>
            <span>•</span>
            <span>{project.tasks.length}개 태스크</span>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 p-1 h-6 w-6"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onProjectSelect(project.id);
            }}>
              <FolderKanban className="w-4 h-4 mr-2" />
              프로젝트 보드
            </DropdownMenuItem>
            <DropdownMenuItem>
              <BarChart3 className="w-4 h-4 mr-2" />
              진행 상황
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Calendar className="w-4 h-4 mr-2" />
              캘린더
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {canEdit && (
              <DropdownMenuItem onClick={(e) => handleEditProject(project, e)}>
                <Edit className="w-4 h-4 mr-2" />
                편집
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={(e) => handleEditProject(project, e)}>
              <Settings className="w-4 h-4 mr-2" />
              설정
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  if (!currentUser) return null;

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} h-full bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}>
      {/* Header with Toggle */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <span className="text-lg font-semibold text-gray-800">워크스페이스</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-200"
          title={isCollapsed ? "워크스페이스 열기" : "워크스페이스 닫기"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={`w-full ${isCollapsed ? 'justify-center p-2' : 'justify-start p-2'} h-auto`}>
              <Avatar className="w-8 h-8 mr-3">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {currentUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{currentUser.name}</div>
                    <div className="text-sm text-gray-500">{currentUser.email}</div>
                  </div>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={onShowUserProfile}>
              <UserCircle className="w-4 h-4 mr-2" />
              프로필 보기
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onShowSettings}>
              <Settings className="w-4 h-4 mr-2" />
              설정
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <div className="p-4 border-b border-gray-200">
        <div className="space-y-2 mb-3">
          <Button 
            variant={showDashboard ? "default" : "ghost"}
            className={`w-full ${isCollapsed ? 'justify-center px-0' : 'justify-start'}`}
            onClick={onShowDashboard}
            title={isCollapsed ? "대시보드" : undefined}
          >
            <Home className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">대시보드</span>}
          </Button>
          <Button 
            variant={showUserProfile ? "default" : "ghost"}
            className={`w-full ${isCollapsed ? 'justify-center px-0' : 'justify-start'}`}
            onClick={onShowUserProfile}
            title={isCollapsed ? "내 프로필" : undefined}
          >
            <UserCircle className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">내 프로필</span>}
          </Button>
          {currentUser?.role === 'admin' && (
            <Button 
              variant={showAdminUserManagement ? "default" : "ghost"}
              className={`w-full ${isCollapsed ? 'justify-center px-0' : 'justify-start'}`}
              onClick={onShowAdminUserManagement}
              title={isCollapsed ? "사용자 관리" : undefined}
            >
              <Users className="w-4 h-4" />
              {!isCollapsed && <span className="ml-2">사용자 관리</span>}
            </Button>
          )}
        </div>

        {/* Search */}
        {!isCollapsed && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="프로젝트 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
        )}
      </div>

      {/* Projects */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 space-y-4">
          {/* Create New Project */}
          <Button 
            variant="outline" 
            className={`w-full ${isCollapsed ? 'justify-center px-0' : 'justify-start'} text-sm`} 
            onClick={onCreateProject}
            title={isCollapsed ? "새 프로젝트" : undefined}
          >
            <Plus className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">새 프로젝트</span>}
          </Button>

          {/* My Projects */}
          {!isCollapsed && (
            <div>
              <button
                onClick={() => toggleSection('my-projects')}
                className="flex items-center gap-2 w-full p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {expandedSections.has('my-projects') ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <FolderKanban className="w-4 h-4" />
                내 프로젝트
                <Badge variant="secondary" className="ml-auto text-xs">
                  {myProjects.length}
                </Badge>
              </button>
            
              {expandedSections.has('my-projects') && (
                <div className="ml-2 mt-2 space-y-1">
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map(project => (
                      <ProjectItem key={project.id} project={project} />
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">
                      {searchQuery ? '검색 결과가 없습니다' : '프로젝트가 없습니다'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Collapsed Project Icons */}
          {isCollapsed && (
            <div className="space-y-2">
              {myProjects.slice(0, 5).map(project => {
                const isSelected = selectedProjectId === project.id;
                return (
                  <Button
                    key={project.id}
                    variant={isSelected ? "default" : "ghost"}
                    className="w-full justify-center px-0 h-10"
                    onClick={() => onProjectSelect(project.id)}
                    title={project.name}
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded text-white flex items-center justify-center text-xs font-bold">
                      {project.key}
                    </div>
                  </Button>
                );
              })}
            </div>
          )}

          {/* Quick Stats */}
          {!isCollapsed && (
            <div className="mt-6 space-y-2">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">빠른 통계</h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">활성 프로젝트</span>
                  <Badge variant="secondary">
                    {myProjects.filter(p => p.status === 'active').length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">완료된 프로젝트</span>
                  <Badge variant="secondary">
                    {myProjects.filter(p => p.status === 'completed').length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">총 태스크</span>
                  <Badge variant="secondary">
                    {myProjects.reduce((acc, p) => acc + p.tasks.length, 0)}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {!isCollapsed && (
            <div className="mt-6">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">최근 활동</h4>
              <div className="space-y-2">
                {myProjects.slice(0, 3).map(project => {
                  const recentTask = project.tasks
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
                  
                  if (!recentTask) return null;
                  
                  return (
                    <div key={project.id} className="text-xs text-gray-600 p-2 bg-gray-100 rounded">
                      <div className="font-medium">{project.key}</div>
                      <div className="truncate">최근: {recentTask.title}</div>
                      <div className="flex items-center gap-1 mt-1 text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(recentTask.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Project Dialog */}
      <EditProjectDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        project={editingProject}
        onProjectDeleted={handleProjectDeleted}
      />
    </div>
  );
}