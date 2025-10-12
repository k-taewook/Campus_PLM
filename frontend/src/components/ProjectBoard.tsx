import { useState, useRef } from 'react';
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
  Settings
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useProjects, type Project, type Task } from '../contexts/ProjectContext';
import TaskDetail from './TaskDetail';
import CreateTaskDialog from './CreateTaskDialog';
import ProjectSettings from './ProjectSettings';

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
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('board');

  const project = projects.find(p => p.id === projectId);
  const tasks = getTasksForProject(projectId);
  const progress = getProjectProgress(projectId);

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
              {task.labels.map(label => (
                <Badge key={label} variant="outline" className="text-xs">
                  {label}
                </Badge>
              ))}
            </div>

            {/* Progress */}
            {task.progress > 0 && (
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
  const teamMembers = users.filter(u => project.members.some(m => m.userId === u.id));

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
              <span className="text-sm">진행률: {progress}%</span>
              <Progress value={progress} className="w-24 h-2" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowCreateTask(true)}>
              <Plus className="w-4 h-4 mr-2" />
              태스크 추가
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
                            {statusLabels[task.status]}
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
                            {task.comments.length > 0 && (
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                <span>{task.comments.length}</span>
                              </div>
                            )}
                            {task.attachments.length > 0 && (
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
    </div>
  );
}