import { useState, useEffect } from 'react';
import { 
  Plus, 
  Clock, 
  Users, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  Target,
  BarChart3,
  Filter,
  Search,
  MoreHorizontal,
  Settings,
  Edit,
  FolderKanban
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useProjectApi } from '../contexts/ProjectApiContext';
import { useAuth } from '../contexts/AuthContext';
import { Project, Task } from '../services/api';

interface ProjectApiDashboardProps {
  onProjectSelect: (projectId: number) => void;
  onCreateProject: () => void;
}

export default function ProjectApiDashboard({ onProjectSelect, onCreateProject }: ProjectApiDashboardProps) {
  const { 
    projects, 
    tasks, 
    loading, 
    error,
    getProjectProgress 
  } = useProjectApi();
  
  const { user, isAdmin, canModifyTask } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updatedAt');

  // 상태별 색상 매핑
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PLANNING': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      case 'ON_HOLD': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 우선순위별 색상 매핑
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 필터링된 프로젝트 목록 (권한에 따라 필터링)
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    // ADMIN이 아닌 경우 자신이 속한 프로젝트만 표시
    let hasAccess = true;
    if (!isAdmin() && user) {
      // 프로젝트 멤버 API 호출이 필요하지만, 임시로 managerId 체크
      hasAccess = project.managerId ? project.managerId === user.id.toString() : false;
      // TODO: 프로젝트 멤버 API를 통해 실제 멤버십 확인
    }
    
    return matchesSearch && matchesStatus && hasAccess;
  });

  // 통계 계산 (권한에 따라 필터링된 프로젝트 기준)
  const totalProjects = filteredProjects.length;
  const activeProjects = filteredProjects.filter(p => p.status === 'ACTIVE').length;
  const completedProjects = filteredProjects.filter(p => p.status === 'COMPLETED').length;
  
  // 태스크도 권한에 따라 필터링
  const accessibleTasks = tasks.filter(task => {
    const taskProject = projects.find(p => p.id === task.projectId);
    if (!taskProject) return false;
    
    if (isAdmin()) return true;
    if (!user) return false;
    
    // 자신이 속한 프로젝트의 태스크만
    return taskProject.managerId ? taskProject.managerId === user.id.toString() : false;
    // TODO: 프로젝트 멤버 API를 통해 실제 멤버십 확인
  });
  
  const totalTasks = accessibleTasks.length;
  const completedTasks = accessibleTasks.filter(t => t.status === 'DONE').length;

  // 최근 업데이트된 프로젝트들
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // 마감이 임박한 태스크들
  const upcomingTasks = tasks
    .filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7; // 7일 이내
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">프로젝트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">오류: {error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-2"
            variant="outline"
          >
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">프로젝트 대시보드</h1>
          <p className="text-gray-600">진행 중인 프로젝트를 관리하고 모니터링하세요</p>
        </div>
        {(isAdmin() || user?.role === 'LEADER') && (
          <Button onClick={onCreateProject} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            새 프로젝트
          </Button>
        )}
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">전체 프로젝트</p>
                <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
              </div>
              <FolderKanban className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">진행중</p>
                <p className="text-2xl font-bold text-green-600">{activeProjects}</p>
              </div>
              <PlayCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">완료됨</p>
                <p className="text-2xl font-bold text-gray-600">{completedProjects}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">작업 완료율</p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects">프로젝트 목록</TabsTrigger>
          <TabsTrigger value="recent">최근 활동</TabsTrigger>
          <TabsTrigger value="tasks">마감 임박</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          {/* 검색 및 필터 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="프로젝트 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="PLANNING">계획중</SelectItem>
                <SelectItem value="ACTIVE">진행중</SelectItem>
                <SelectItem value="COMPLETED">완료</SelectItem>
                <SelectItem value="ON_HOLD">보류</SelectItem>
                <SelectItem value="CANCELLED">취소</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 프로젝트 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const progress = getProjectProgress(project.id);
              const projectTasks = tasks.filter(t => t.projectId === project.id);
              
              return (
                <Card 
                  key={project.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => onProjectSelect(project.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {project.description || '설명이 없습니다'}
                        </CardDescription>
                      </div>
                      {project.managerId && canModifyTask(project.managerId.toString()) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              수정
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="h-4 w-4 mr-2" />
                              설정
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* 상태 및 진행률 */}
                      <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                        <span className="text-sm text-gray-600">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      
                      {/* 작업 수 */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          작업 {projectTasks.length}개
                        </div>
                        {project.endDate && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(project.endDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <FolderKanban className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">프로젝트가 없습니다</h3>
              <p className="text-gray-600 mb-4">새로운 프로젝트를 만들어 시작해보세요</p>
              <Button onClick={onCreateProject}>
                <Plus className="h-4 w-4 mr-2" />
                첫 번째 프로젝트 만들기
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>최근 업데이트된 프로젝트</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(project.updatedAt).toLocaleDateString()} 업데이트
                      </p>
                    </div>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>마감 임박한 작업</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-gray-600">
                        {task.dueDate && new Date(task.dueDate).toLocaleDateString()} 마감
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {upcomingTasks.length === 0 && (
                  <p className="text-center text-gray-600 py-8">
                    마감 임박한 작업이 없습니다
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}