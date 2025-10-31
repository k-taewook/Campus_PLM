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
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useProjects, type Project, type Task } from '../contexts/ProjectContext';
import EditProjectDialog from './EditProjectDialog';
import api from '../services/api';

interface ApiProject {
  id: number;
  projectKey: string;
  name: string;
  description: string;
  status: string;
  managerId: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiTask {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  projectId: number;
  assigneeId: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectDashboardProps {
  onProjectSelect: (projectId: string) => void;
  onCreateProject: () => void;
}

export default function ProjectDashboard({ onProjectSelect, onCreateProject }: ProjectDashboardProps) {
  const { 
    currentUser, 
    users,
    getMyProjects, 
    getAssignedTasks, 
    getUpcomingDeadlines,
    getProjectProgress,
    canEditProject,
    activities
  } = useProjects();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // API에서 가져온 프로젝트와 태스크
  const [apiProjects, setApiProjects] = useState<ApiProject[]>([]);
  const [apiTasks, setApiTasks] = useState<ApiTask[]>([]);
  const [loading, setLoading] = useState(true);

  // API에서 프로젝트와 태스크 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsRes, tasksRes] = await Promise.all([
          api.get('/projects'),
          api.get('/tasks')
        ]);
        setApiProjects(projectsRes.data);
        setApiTasks(tasksRes.data);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // API 데이터를 기존 Project 형식으로 변환
  const myProjects = apiProjects.map(p => ({
    id: p.id.toString(),
    key: p.projectKey || 'PROJ',
    name: p.name,
    description: p.description || '',
    status: p.status.toLowerCase().replace('_', '-') as any,
    type: 'software' as const,
    leadId: currentUser?.id || '1',
    members: [],
    startDate: p.startDate,
    endDate: p.endDate,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    tasks: apiTasks
      .filter(t => t.projectId === p.id)
      .map(t => ({
        id: t.id.toString(),
        title: t.title,
        description: t.description || '',
        status: t.status.toLowerCase().replace('_', '-') as any,
        priority: t.priority.toLowerCase() as any,
        assigneeIds: t.assigneeId ? [t.assigneeId.toString()] : [],
        reporterId: '1',
        projectId: t.projectId.toString(),
        labels: [],
        loggedHours: 0,
        progress: t.status === 'DONE' ? 100 : t.status === 'IN_PROGRESS' ? 50 : 0,
        dueDate: t.dueDate,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        comments: [],
        attachments: [],
        dependencies: [],
        subtasks: []
      })),
    attachments: [],
    settings: {
      allowComments: true,
      allowFileUploads: true,
      requireApproval: false,
      notifyOnUpdates: true
    }
  }));

  const assignedTasks = apiTasks.map(t => ({
    id: t.id.toString(),
    title: t.title,
    description: t.description || '',
    status: t.status.toLowerCase().replace('_', '-') as any,
    priority: t.priority.toLowerCase() as any,
    assigneeIds: t.assigneeId ? [t.assigneeId.toString()] : [],
    reporterId: '1',
    projectId: t.projectId.toString(),
    labels: [],
    loggedHours: 0,
    progress: t.status === 'DONE' ? 100 : t.status === 'IN_PROGRESS' ? 50 : 0,
    dueDate: t.dueDate,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    comments: [],
    attachments: [],
    dependencies: [],
    subtasks: []
  }));

  const upcomingDeadlines = assignedTasks.filter(t => t.dueDate && new Date(t.dueDate) > new Date());

  // Filter projects
  const filteredProjects = myProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter tasks
  const filteredTasks = assignedTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return PlayCircle;
      case 'completed': return CheckCircle;
      case 'on-hold': return PauseCircle;
      case 'planning': return Target;
      default: return PlayCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'planning': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'in-review': return 'bg-purple-100 text-purple-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getDaysUntilDeadline = (dateString: string) => {
    const now = new Date();
    const deadline = new Date(dateString);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate statistics
  const activeProjectsList = myProjects.filter(p => p.status === 'active');
  const completedTasksList = assignedTasks.filter(t => t.status === 'done');
  const overdueTasksList = assignedTasks.filter(t => 
    t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
  );

  const stats = {
    totalProjects: myProjects.length,
    activeProjects: activeProjectsList.length,
    totalTasks: assignedTasks.length,
    completedTasks: completedTasksList.length,
    overdueTasks: overdueTasksList.length,
    upcomingDeadlines: upcomingDeadlines.length
  };

  if (!currentUser) return null;

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">프로젝트 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto p-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            안녕하세요, {currentUser.name}님! 👋
          </h1>
          <p className="text-gray-600">
            프로젝트 현황을 확인하고 오늘 할 일을 계획해보세요.
          </p>
        </div>

        {/* Quick Stats */}
        <TooltipProvider>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="hover:shadow-md transition-shadow cursor-help">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      총 프로젝트
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{stats.totalProjects}</div>
                    {myProjects.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {myProjects.slice(0, 2).map(p => p.name).join(', ')}
                        {myProjects.length > 2 && ' 외 ' + (myProjects.length - 2) + '개'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-semibold">내 프로젝트 ({myProjects.length}개)</p>
                  {myProjects.length > 0 ? (
                    myProjects.map(project => (
                      <p key={project.id} className="text-sm">• {project.name}</p>
                    ))
                  ) : (
                    <p className="text-sm">참여 중인 프로젝트가 없습니다.</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="hover:shadow-md transition-shadow cursor-help">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <PlayCircle className="w-4 h-4 text-green-600" />
                      진행 중
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.activeProjects}</div>
                    {activeProjectsList.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {activeProjectsList.slice(0, 2).map(p => p.name).join(', ')}
                        {activeProjectsList.length > 2 && ' 외 ' + (activeProjectsList.length - 2) + '개'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-semibold">진행 중인 프로젝트 ({activeProjectsList.length}개)</p>
                  {activeProjectsList.length > 0 ? (
                    activeProjectsList.map(project => (
                      <p key={project.id} className="text-sm">• {project.name}</p>
                    ))
                  ) : (
                    <p className="text-sm">진행 중인 프로젝트가 없습니다.</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="hover:shadow-md transition-shadow cursor-help">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Target className="w-4 h-4 text-purple-600" />
                      할당된 태스크
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">{stats.totalTasks}</div>
                    {assignedTasks.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {assignedTasks.slice(0, 2).map(t => t.title).join(', ')}
                        {assignedTasks.length > 2 && ' 외 ' + (assignedTasks.length - 2) + '개'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-semibold">할당된 태스크 ({assignedTasks.length}개)</p>
                  {assignedTasks.length > 0 ? (
                    assignedTasks.map(task => (
                      <p key={task.id} className="text-sm">• {task.title}</p>
                    ))
                  ) : (
                    <p className="text-sm">할당된 태스크가 없습니다.</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="hover:shadow-md transition-shadow cursor-help">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      완료된 태스크
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{stats.completedTasks}</div>
                    {completedTasksList.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {completedTasksList.slice(0, 2).map(t => t.title).join(', ')}
                        {completedTasksList.length > 2 && ' 외 ' + (completedTasksList.length - 2) + '개'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-semibold">완료된 태스크 ({completedTasksList.length}개)</p>
                  {completedTasksList.length > 0 ? (
                    completedTasksList.map(task => (
                      <p key={task.id} className="text-sm">• {task.title}</p>
                    ))
                  ) : (
                    <p className="text-sm">완료된 태스크가 없습니다.</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="hover:shadow-md transition-shadow cursor-help">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      지연된 태스크
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{stats.overdueTasks}</div>
                    {overdueTasksList.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {overdueTasksList.slice(0, 2).map(t => t.title).join(', ')}
                        {overdueTasksList.length > 2 && ' 외 ' + (overdueTasksList.length - 2) + '개'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-semibold">지연된 태스크 ({overdueTasksList.length}개)</p>
                  {overdueTasksList.length > 0 ? (
                    overdueTasksList.map(task => (
                      <p key={task.id} className="text-sm text-red-600">
                        • {task.title} 
                        {task.dueDate && (
                          <span className="text-xs"> (마감: {formatDate(task.dueDate)})</span>
                        )}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm">지연된 태스크가 없습니다.</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="hover:shadow-md transition-shadow cursor-help">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-orange-600" />
                      임박한 마감일
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{stats.upcomingDeadlines}</div>
                    {upcomingDeadlines.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {upcomingDeadlines.slice(0, 2).map(t => t.title).join(', ')}
                        {upcomingDeadlines.length > 2 && ' 외 ' + (upcomingDeadlines.length - 2) + '개'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-semibold">임박한 마감일 ({upcomingDeadlines.length}개)</p>
                  {upcomingDeadlines.length > 0 ? (
                    upcomingDeadlines.map(task => {
                      const daysUntil = task.dueDate ? getDaysUntilDeadline(task.dueDate) : null;
                      return (
                        <p key={task.id} className="text-sm text-orange-600">
                          • {task.title}
                          {task.dueDate && daysUntil !== null && (
                            <span className="text-xs">
                              {' '}({daysUntil === 0 ? '오늘' : daysUntil === 1 ? '내일' : `${daysUntil}일 후`})
                            </span>
                          )}
                        </p>
                      );
                    })
                  ) : (
                    <p className="text-sm">임박한 마감일이 없습니다.</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList>
            <TabsTrigger value="projects">내 프로젝트</TabsTrigger>
            <TabsTrigger value="tasks">할당된 태스크</TabsTrigger>
            <TabsTrigger value="deadlines">마감일 임박</TabsTrigger>
            <TabsTrigger value="activity">최근 활동</TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <div className="space-y-6">
              {/* Header with search and filters */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="프로젝트 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 상태</SelectItem>
                      <SelectItem value="planning">계획</SelectItem>
                      <SelectItem value="active">진행 중</SelectItem>
                      <SelectItem value="on-hold">보류</SelectItem>
                      <SelectItem value="completed">완료</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={onCreateProject}>
                  <Plus className="w-4 h-4 mr-2" />
                  새 프로젝트
                </Button>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(project => {
                  const lead = users.find(u => u.id === project.leadId);
                  const progress = getProjectProgress(project.id);
                  const StatusIcon = getStatusIcon(project.status);
                  const totalTasks = project.tasks.length;
                  const completedTasks = project.tasks.filter(t => t.status === 'done').length;
                  
                  return (
                    <Card 
                      key={project.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                      onClick={() => onProjectSelect(project.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg line-clamp-2 mb-2">{project.name}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {project.description}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(project.status)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {project.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>진행률</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{completedTasks}/{totalTasks} 태스크 완료</span>
                            <span>{project.key}</span>
                          </div>
                        </div>

                        {/* Team and dates */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>팀: {project.members.length}명</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                {lead?.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-gray-600">리드: {lead?.name}</span>
                          </div>
                          {project.endDate && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>마감: {formatDate(project.endDate)}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredProjects.length === 0 && (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery || statusFilter !== 'all' ? '검색 결과가 없습니다' : '프로젝트가 없습니다'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchQuery || statusFilter !== 'all' 
                      ? '다른 검색어나 필터를 시도해보세요.' 
                      : '첫 번째 프로젝트를 만들어 시작해보세요.'
                    }
                  </p>
                  {!searchQuery && statusFilter === 'all' && (
                    <Button onClick={onCreateProject}>
                      프로젝트 만들기
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <div className="space-y-6">
              {/* Header with search and filters */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="태스크 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 우선순위</SelectItem>
                    <SelectItem value="urgent">긴급</SelectItem>
                    <SelectItem value="high">높음</SelectItem>
                    <SelectItem value="medium">보통</SelectItem>
                    <SelectItem value="low">낮음</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tasks List */}
              <div className="space-y-4">
                {filteredTasks.map(task => {
                  const project = myProjects.find(p => p.id === task.projectId);
                  const assignees = users.filter(u => task.assigneeIds.includes(u.id));
                  const daysUntil = task.dueDate ? getDaysUntilDeadline(task.dueDate) : null;
                  
                  return (
                    <Card key={task.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium">{task.title}</h3>
                              <Badge className={getTaskStatusColor(task.status)}>
                                {task.status}
                              </Badge>
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {task.description}
                            </p>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <span>{project?.name} ({project?.key})</span>
                              {assignees.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <div className="flex -space-x-1">
                                    {assignees.slice(0, 3).map(assignee => (
                                      <Avatar key={assignee.id} className="w-4 h-4 border border-white">
                                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                          {assignee.name.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                  </div>
                                  <span>
                                    {assignees.length === 1 
                                      ? assignees[0].name 
                                      : `${assignees[0].name} 외 ${assignees.length - 1}명`
                                    }
                                  </span>
                                </div>
                              )}
                              {task.dueDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    {formatDate(task.dueDate)}
                                    {daysUntil !== null && (
                                      <span className={`ml-1 ${daysUntil < 0 ? 'text-red-600' : daysUntil <= 2 ? 'text-orange-600' : ''}`}>
                                        ({daysUntil < 0 ? `${Math.abs(daysUntil)}일 지연` : `${daysUntil}일 남음`})
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500 mb-1">진행률</div>
                            <div className="text-lg font-bold">{task.progress}%</div>
                            <Progress value={task.progress} className="w-20 h-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredTasks.length === 0 && (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery || priorityFilter !== 'all' ? '검색 결과가 없습니다' : '할당된 태스크가 없습니다'}
                  </h3>
                  <p className="text-gray-500">
                    {searchQuery || priorityFilter !== 'all'
                      ? '다른 검색어나 필터를 시도해보세요.'
                      : '프로젝트에 참여하여 태스크를 받아보세요.'
                    }
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="deadlines">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">마감일이 임박한 태스크</h3>
              
              <div className="space-y-4">
                {upcomingDeadlines.map(task => {
                  const project = myProjects.find(p => p.id === task.projectId);
                  const assignees = users.filter(u => task.assigneeIds.includes(u.id));
                  const daysUntil = getDaysUntilDeadline(task.dueDate!);
                  
                  return (
                    <Card key={task.id} className="border-l-4 border-l-orange-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium">{task.title}</h3>
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                              <Badge variant="outline" className={`${daysUntil <= 1 ? 'border-red-500 text-red-700' : 'border-orange-500 text-orange-700'}`}>
                                {daysUntil === 0 ? '오늘 마감' : daysUntil === 1 ? '내일 마감' : `${daysUntil}일 후 마감`}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {task.description}
                            </p>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <span>{project?.name} ({project?.key})</span>
                              {assignees.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <div className="flex -space-x-1">
                                    {assignees.slice(0, 3).map(assignee => (
                                      <Avatar key={assignee.id} className="w-4 h-4 border border-white">
                                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                          {assignee.name.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                  </div>
                                  <span>
                                    {assignees.length === 1 
                                      ? assignees[0].name 
                                      : `${assignees[0].name} 외 ${assignees.length - 1}명`
                                    }
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(task.dueDate!)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500 mb-1">진행률</div>
                            <div className="text-lg font-bold">{task.progress}%</div>
                            <Progress value={task.progress} className="w-20 h-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {upcomingDeadlines.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 mx-auto text-green-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">모든 마감일이 여유롭습니다!</h3>
                  <p className="text-gray-500">
                    앞으로 7일 내에 마감인 태스크가 없습니다.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">최근 활동</h3>
              
              <div className="space-y-4">
                {activities.slice(0, 20).map(activity => {
                  const user = users.find(u => u.id === activity.userId);
                  const project = myProjects.find(p => p.id === activity.projectId);
                  
                  return (
                    <Card key={activity.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {user?.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{activity.userName}</span>
                              <span className="text-sm text-gray-600">{activity.action}</span>
                              {project && (
                                <Badge variant="outline" className="text-xs">
                                  {project.key}
                                </Badge>
                              )}
                            </div>
                            {activity.details && (
                              <p className="text-sm text-gray-600 mb-2">{activity.details}</p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {new Date(activity.timestamp).toLocaleString('ko-KR')}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {activities.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">활동이 없습니다</h3>
                  <p className="text-gray-500">
                    프로젝트 활동이 시작되면 여기에 표시됩니다.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}