import { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Calendar,
  User,
  MessageCircle,
  Paperclip,
  Clock,
  Flag,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  Filter,
  Search,
  ArrowLeft,
  Settings,
  List,
  LayoutGrid,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { useProjects, type Project, type Task } from '../contexts/ProjectContext';
import TaskDetail from './TaskDetail';
import CreateTaskDialog from './CreateTaskDialog';
import ProjectSettings from './ProjectSettings';
import api from '../services/api';

interface ProjectBoardProps {
  projectId: string;
  onBack: () => void;
}

export default function ProjectBoard({ projectId, onBack }: ProjectBoardProps) {
  const { 
    projects, 
    users, 
    currentUser,
    getTasksForProject, 
    getProjectProgress,
    moveTask,
    canEditProject,
    canEditTask,
    canManageSettings
  } = useProjects();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('board');
  
  // API에서 프로젝트와 태스크 로드
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      console.log('프로젝트 로딩 중... ID:', projectId);
      
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/tasks`)  // 경로 수정
      ]);
      
      console.log('프로젝트 응답:', projectRes.data);
      console.log('태스크 응답:', tasksRes.data);
      
      setProject({
        id: projectRes.data.id.toString(),
        name: projectRes.data.name,
        description: projectRes.data.description || '',
        status: projectRes.data.status.toLowerCase().replace('_', '-'),
        key: projectRes.data.projectKey || 'PROJ'
      });
      
      setTasks(tasksRes.data.map((t: any) => ({
        id: t.id.toString(),
        title: t.title,
        description: t.description || '',
        status: t.status.toLowerCase().replace('_', '-'),
        priority: t.priority.toLowerCase(),
        assigneeIds: t.assigneeId ? [t.assigneeId.toString()] : [],
        dueDate: t.dueDate,
        createdAt: t.createdAt,
        comments: [],      // 빈 배열로 초기화
        attachments: [],   // 빈 배열로 초기화
        labels: [],        // 빈 배열로 초기화
        progress: 0        // 0으로 초기화
      })));
      
      console.log('프로젝트 로드 완료');
    } catch (error: any) {
      console.error('프로젝트 데이터 로드 실패:', error);
      console.error('에러 상세:', error.response?.data || error.message);
      // 에러가 발생해도 빈 배열로 설정
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const progress = project && tasks.length > 0
    ? {
        completion: Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100),
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'done').length,
        inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
        todoTasks: tasks.filter(t => t.status === 'todo').length
      }
    : { completion: 0, totalTasks: 0, completedTasks: 0, inProgressTasks: 0, todoTasks: 0 };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">프로젝트 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">프로젝트를 찾을 수 없습니다</h3>
          <Button onClick={onBack}>돌아가기</Button>
        </div>
      </div>
    );
  }

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAssignee = assigneeFilter === 'all' || task.assigneeIds.includes(assigneeFilter);
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesAssignee && matchesPriority;
  });

  // Group tasks by status
  const tasksByStatus = {
    'todo': filteredTasks.filter(task => task.status === 'todo'),
    'in-progress': filteredTasks.filter(task => task.status === 'in-progress'),
    'in-review': filteredTasks.filter(task => task.status === 'in-review'),
    'done': filteredTasks.filter(task => task.status === 'done')
  };

  const statusLabels = {
    'todo': '할 일',
    'in-progress': '진행 중',
    'in-review': '리뷰 중',
    'done': '완료'
  };

  const statusColors = {
    'todo': 'bg-gray-100',
    'in-progress': 'bg-blue-100',
    'in-review': 'bg-purple-100',
    'done': 'bg-green-100'
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  const getDaysUntilDeadline = (dateString: string) => {
    const now = new Date();
    const deadline = new Date(dateString);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      moveTask(draggedTask.id, newStatus);
    }
    setDraggedTask(null);
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const assignees = users.filter(u => task.assigneeIds.includes(u.id));
    const reporter = users.find(u => u.id === task.reporterId);
    const daysUntil = task.dueDate ? getDaysUntilDeadline(task.dueDate) : null;
    const canEdit = canEditTask(task.id);

    return (
      <Card
        className="mb-3 cursor-pointer hover:shadow-md transition-shadow"
        draggable
        onDragStart={(e) => handleDragStart(e, task)}
        onClick={() => setSelectedTaskId(task.id)}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedTaskId(task.id)}>
                    <Edit className="w-4 h-4 mr-2" />
                    상세보기
                  </DropdownMenuItem>
                  {canEdit && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        삭제
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Priority and Labels */}
            <div className="flex items-start gap-2 flex-wrap">
              <Badge className={getPriorityColor(task.priority)}>
                <Flag className="w-3 h-3 mr-1" />
                {task.priority}
              </Badge>
              {task.labels && task.labels.map(label => (
                <Badge key={label} variant="outline" className="text-xs">
                  {label}
                </Badge>
              ))}
            </div>

            {/* Progress */}
            {task.progress && task.progress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>진행률</span>
                  <span>{task.progress}%</span>
                </div>
                <Progress value={task.progress} className="h-1" />
              </div>
            )}

            {/* Bottom info */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {assignees.length > 0 && (
                  <div className="flex -space-x-1">
                    {assignees.slice(0, 3).map(assignee => (
                      <Avatar key={assignee.id} className="w-5 h-5 border border-white">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                          {assignee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {assignees.length > 3 && (
                      <div className="w-5 h-5 bg-gray-100 rounded-full border border-white flex items-center justify-center">
                        <span className="text-xs text-gray-600">+{assignees.length - 3}</span>
                      </div>
                    )}
                  </div>
                )}
                {task.comments.length > 0 && (
                  <div className="flex items-center gap-1 text-gray-500">
                    <MessageCircle className="w-3 h-3" />
                    <span>{task.comments.length}</span>
                  </div>
                )}
                {task.attachments.length > 0 && (
                  <div className="flex items-center gap-1 text-gray-500">
                    <Paperclip className="w-3 h-3" />
                    <span>{task.attachments.length}</span>
                  </div>
                )}
              </div>
              {task.dueDate && (
                <div className={`flex items-center gap-1 ${
                  daysUntil !== null && daysUntil < 0 ? 'text-red-600' : 
                  daysUntil !== null && daysUntil <= 2 ? 'text-orange-600' : 'text-gray-500'
                }`}>
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const lead = users.find(u => u.id === project.leadId);
  const teamMembers = project.members 
    ? users.filter(u => project.members.some((m: any) => m.userId === u.id))
    : [];

  if (selectedTaskId) {
    return (
      <TaskDetail 
        taskId={selectedTaskId} 
        onBack={() => setSelectedTaskId(null)} 
      />
    );
  }

  if (showSettings) {
    return (
      <ProjectSettings 
        projectId={projectId}
        onClose={() => setShowSettings(false)}
      />
    );
  }

  return (
    <div className="flex-1 bg-gray-50 overflow-auto flex flex-col custom-scrollbar">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            프로젝트 목록
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <Badge className={`${
                project.status === 'active' ? 'bg-green-100 text-green-800' :
                project.status === 'planning' ? 'bg-purple-100 text-purple-800' :
                project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {project.status}
              </Badge>
              <span className="text-sm text-gray-500">({project.key})</span>
            </div>
            <p className="text-gray-600 mt-1">{project.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm">리드: {lead?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">팀원: {teamMembers.length}명</span>
              <div className="flex -space-x-1">
                {teamMembers.slice(0, 5).map(member => (
                  <Avatar key={member.id} className="w-6 h-6 border-2 border-white">
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {teamMembers.length > 5 && (
                  <div className="w-6 h-6 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-xs text-gray-600">+{teamMembers.length - 5}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">진행률: {progress.completion}%</span>
              <Progress value={progress.completion} className="w-24 h-2" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowCreateTask(true)}>
              <Plus className="w-4 h-4 mr-2" />
              태스크 추가
            </Button>
            <Button variant="outline" onClick={() => setShowEditProject(true)}>
              <Edit className="w-4 h-4 mr-2" />
              프로젝트 수정
            </Button>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(true)} className="text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4 mr-2" />
              프로젝트 삭제
            </Button>
            {canManageSettings(projectId) && (
              <Button variant="outline" onClick={() => setShowSettings(true)}>
                <Settings className="w-4 h-4 mr-2" />
                설정
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="bg-white border-b border-gray-200 px-6 flex-shrink-0">
          <TabsList>
            <TabsTrigger value="board">칸반 보드</TabsTrigger>
            <TabsTrigger value="list">리스트 뷰</TabsTrigger>
            <TabsTrigger value="calendar">캘린더</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="board" className="flex-1 flex flex-col min-h-0 overflow-auto">
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6 p-6 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="태스크 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-40">
                <User className="w-4 h-4 mr-2" />
                <SelectValue placeholder="담당자" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 담당자</SelectItem>
                {teamMembers.map(member => (
                  <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <Flag className="w-4 h-4 mr-2" />
                <SelectValue placeholder="우선순위" />
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

          {/* Kanban Board */}
          <div className="flex gap-6 overflow-x-auto px-6 pb-6 min-h-0 custom-scrollbar">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
              <div 
                key={status}
                className="flex-shrink-0 w-80 flex flex-col"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status as Task['status'])}
              >
                <div className={`${statusColors[status as keyof typeof statusColors]} rounded-lg p-4 mb-4 flex-shrink-0`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{statusLabels[status as keyof typeof statusLabels]}</h3>
                    <Badge variant="secondary">{statusTasks.length}</Badge>
                  </div>
                </div>
                <div className="space-y-3 overflow-y-auto flex-1 kanban-scrollbar">
                  {statusTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  {statusTasks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">태스크가 없습니다</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="flex-1 overflow-auto custom-scrollbar">
          <div className="space-y-4 p-6">
            {filteredTasks.map(task => {
              const assignees = users.filter(u => task.assigneeIds.includes(u.id));
              const daysUntil = task.dueDate ? getDaysUntilDeadline(task.dueDate) : null;
              
              return (
                <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTaskId(task.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{task.title}</h4>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge variant="outline">
                            {statusLabels[task.status as keyof typeof statusLabels] || task.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-1">{task.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {assignees.length > 0 && (
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-1">
                                {assignees.slice(0, 2).map(assignee => (
                                  <Avatar key={assignee.id} className="w-4 h-4 border border-white">
                                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                      {assignee.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {assignees.length > 2 && (
                                  <div className="w-4 h-4 bg-gray-100 rounded-full border border-white flex items-center justify-center">
                                    <span className="text-xs text-gray-600">+{assignees.length - 2}</span>
                                  </div>
                                )}
                              </div>
                              <span className="text-xs">
                                {assignees.length === 1 
                                  ? assignees[0].name 
                                  : `${assignees.length}명`
                                }
                              </span>
                            </div>
                          )}
                          {task.dueDate && (
                            <div className={`flex items-center gap-1 ${
                              daysUntil !== null && daysUntil < 0 ? 'text-red-600' : 
                              daysUntil !== null && daysUntil <= 2 ? 'text-orange-600' : ''
                            }`}>
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(task.dueDate)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            {task.comments && task.comments.length > 0 && (
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                <span>{task.comments.length}</span>
                              </div>
                            )}
                            {task.attachments && task.attachments.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Paperclip className="w-3 h-3" />
                                <span>{task.attachments.length}</span>
                              </div>
                            )}
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
        </TabsContent>

        <TabsContent value="calendar" className="flex-1 overflow-auto">
          <div className="text-center py-20 p-6">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">캘린더 뷰</h3>
            <p className="text-gray-500">캘린더 기능은 곧 추가될 예정입니다.</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Task Dialog */}
      <CreateTaskDialog 
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        projectId={projectId}
      />

      {/* Edit Project Dialog */}
      {showEditProject && (
        <EditProjectDialogSimple
          projectId={projectId}
          onClose={() => setShowEditProject(false)}
          onProjectUpdated={() => {
            loadProjectData();
            setShowEditProject(false);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <DeleteConfirmDialog
          projectName={project.name}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={async () => {
            try {
              await api.delete(`/projects/${projectId}`);
              alert('프로젝트가 삭제되었습니다.');
              onBack();
            } catch (error) {
              console.error('프로젝트 삭제 실패:', error);
              alert('프로젝트 삭제에 실패했습니다.');
            }
          }}
        />
      )}
    </div>
  );
}

// 개선된 수정 다이얼로그 컴포넌트
function EditProjectDialogSimple({ projectId, onClose, onProjectUpdated }: { 
  projectId: string; 
  onClose: () => void; 
  onProjectUpdated: () => void;
}) {
  const { users: contextUsers, currentUser } = useProjects();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'BUSINESS',
    status: 'PLANNING',
    startDate: '',
    endDate: '',
    managerId: '',
    teamMembers: [] as string[]
  });
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  // 현재 사용자를 기본으로 팀 멤버에 추가
  useEffect(() => {
    if (currentUser && !formData.teamMembers.includes(currentUser.id)) {
      setFormData(prev => ({
        ...prev,
        teamMembers: [...prev.teamMembers, currentUser.id]
      }));
    }
  }, [currentUser]);

  const loadProjectData = async () => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      const project = response.data;
      
      setFormData({
        name: project.name,
        description: project.description || '',
        type: project.type || 'BUSINESS',
        status: project.status,
        startDate: project.startDate ? project.startDate.split('T')[0] : '',
        endDate: project.endDate ? project.endDate.split('T')[0] : '',
        managerId: project.managerId?.toString() || '',
        teamMembers: project.managerId ? [project.managerId.toString()] : []
      });
    } catch (error) {
      console.error('프로젝트 로드 실패:', error);
      alert('프로젝트 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('프로젝트 이름을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formatToLocalDateTime = (dateString: string) => {
        if (!dateString) return null;
        if (dateString.length === 10) {
          return dateString + 'T00:00:00';
        }
        return dateString;
      };

      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        type: formData.type,
        status: formData.status,
        startDate: formatToLocalDateTime(formData.startDate),
        endDate: formatToLocalDateTime(formData.endDate),
        managerId: formData.managerId ? parseInt(formData.managerId) : null
      };

      await api.put(`/projects/${projectId}`, projectData);
      
      alert('프로젝트가 수정되었습니다!');
      onProjectUpdated();
      onClose();
    } catch (error: any) {
      console.error('프로젝트 수정 실패:', error);
      alert('프로젝트 수정에 실패했습니다: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTeamMemberToggle = (userId: string) => {
    // 현재 사용자는 해제할 수 없음
    if (userId === currentUser?.id) return;
    
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(userId)
        ? prev.teamMembers.filter(id => id !== userId)
        : [...prev.teamMembers, userId]
    }));
  };

  // 검색어에 따라 사용자 필터링
  const filteredUsers = contextUsers.filter(user => 
    user.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

  // 선택된 멤버 목록
  const selectedMembers = contextUsers.filter(user => 
    formData.teamMembers.includes(user.id)
  );

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p>프로젝트 정보 로딩 중...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>프로젝트 수정</DialogTitle>
          <DialogDescription>
            프로젝트 정보를 수정하세요.
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto custom-scrollbar flex-1">
        <form id="edit-project-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div>
            <Label htmlFor="name">프로젝트 이름 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="프로젝트 이름을 입력하세요"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="프로젝트에 대한 상세한 설명을 입력하세요"
              className="min-h-[100px]"
            />
          </div>

          {/* Project Type and Lead */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">프로젝트 유형</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUSINESS">비즈니스</SelectItem>
                  <SelectItem value="MARKETING">마케팅</SelectItem>
                  <SelectItem value="SOFTWARE">소프트웨어</SelectItem>
                  <SelectItem value="DESIGN">디자인</SelectItem>
                  <SelectItem value="RESEARCH">연구</SelectItem>
                  <SelectItem value="OTHER">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="lead">프로젝트 리드</Label>
              <Select value={formData.managerId} onValueChange={(value: string) => setFormData({ ...formData, managerId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="리드를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {contextUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                      {user.id === currentUser?.id && ' (나)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">프로젝트 상태</Label>
            <Select value={formData.status} onValueChange={(value: string) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLANNING">📋 계획 중</SelectItem>
                <SelectItem value="ACTIVE">🚀 진행 중</SelectItem>
                <SelectItem value="ON_HOLD">⏸️ 보류</SelectItem>
                <SelectItem value="COMPLETED">✅ 완료</SelectItem>
                <SelectItem value="CANCELLED">❌ 취소</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">시작일</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="endDate">예상 종료일</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate || undefined}
              />
            </div>
          </div>

          {/* Team Members */}
          <div>
            <Label>팀 멤버</Label>
            <div className="mt-3 space-y-3">
              {/* Selected Members */}
              {selectedMembers.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">선택된 멤버 ({selectedMembers.length}명)</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map(member => (
                      <Badge key={member.id} variant="secondary" className="flex items-center gap-2">
                        <Avatar className="w-4 h-4">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {member.name}
                        {member.id === currentUser?.id && <span className="text-xs">(나)</span>}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* All Users */}
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-600">멤버 목록</p>
                  <span className="text-xs text-gray-500">
                    {filteredUsers.length}명
                  </span>
                </div>
                
                {/* Search Input */}
                <div className="relative mb-3">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                  <Input
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    placeholder="멤버 이름 또는 이메일 검색"
                    className="pl-7 h-7 text-xs"
                  />
                </div>
                
                <div className="space-y-2">
                  {filteredUsers.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-2">
                      {memberSearchQuery ? '검색 결과가 없습니다.' : '사용자가 없습니다.'}
                    </p>
                  ) : (
                    filteredUsers.map(user => {
                    const isSelected = formData.teamMembers.includes(user.id);
                    const isCurrentUser = user.id === currentUser?.id;
                    
                    return (
                      <div key={user.id} className="flex items-center space-x-3 hover:bg-gray-50 p-1 rounded">
                        <Checkbox 
                          id={user.id}
                          checked={isSelected}
                          onCheckedChange={() => handleTeamMemberToggle(user.id)}
                          disabled={isCurrentUser} // Can't unselect yourself
                        />
                        <label 
                          htmlFor={user.id}
                          className="flex items-center gap-2 flex-1 cursor-pointer"
                        >
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {user.name}
                              {isCurrentUser && <span className="text-gray-500 ml-1">(나)</span>}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {user.role}
                          </Badge>
                        </label>
                      </div>
                    );
                  })
                )}
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-3">프로젝트 미리보기</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {formData.name ? (
                      formData.name.trim().split(/\s+/).length === 1 
                        ? formData.name.substring(0, 4).toUpperCase()
                        : formData.name.trim().split(/\s+/).slice(0, 3).map(word => word.charAt(0)).join('').toUpperCase()
                    ) : 'KEY'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium truncate">{formData.name || '프로젝트 이름'}</h5>
                  <p className="text-xs text-gray-500">{formData.type} • {selectedMembers.length}명의 멤버</p>
                </div>
              </div>
              {formData.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{formData.description}</p>
              )}
            </div>
          </div>
        </form>
        </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t flex-shrink-0">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              취소
            </Button>
            <Button type="submit" form="edit-project-form" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? '수정 중...' : '수정 완료'}
            </Button>
          </div>
      </DialogContent>
    </Dialog>
  );
}

// 삭제 확인 다이얼로그 컴포넌트
function DeleteConfirmDialog({ projectName, onClose, onConfirm }: {
  projectName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">프로젝트 삭제</h2>
        <p className="text-gray-600 mb-6">
          <strong>{projectName}</strong> 프로젝트를 삭제하시겠습니까?<br/>
          이 작업은 되돌릴 수 없습니다.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            취소
          </Button>
          <Button 
            onClick={() => {
              onConfirm();
              onClose();
            }} 
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            삭제
          </Button>
        </div>
      </div>
    </div>
  );
}