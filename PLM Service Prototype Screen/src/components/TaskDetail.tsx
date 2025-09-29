import { useState, useRef } from 'react';
import { 
  ArrowLeft,
  Edit,
  Save,
  X,
  User,
  Calendar,
  Flag,
  Clock,
  Paperclip,
  Link,
  Upload,
  Send,
  MoreHorizontal,
  Trash2,
  Play,
  Pause,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useProjects, type Task, type Attachment } from '../contexts/ProjectContext';

interface TaskDetailProps {
  taskId: string;
  onBack: () => void;
}

export default function TaskDetail({ taskId, onBack }: TaskDetailProps) {
  const { 
    projects, 
    users, 
    currentUser,
    updateTask,
    addComment,
    addAttachment,
    logTime,
    canEditTask
  } = useProjects();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Task>>({});
  const [newComment, setNewComment] = useState('');
  const [newLink, setNewLink] = useState({ name: '', url: '' });
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [timeLog, setTimeLog] = useState({ hours: '', description: '' });
  const [showTimeLog, setShowTimeLog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Find task
  const task = projects.flatMap(p => p.tasks).find(t => t.id === taskId);
  const project = projects.find(p => p.tasks.some(t => t.id === taskId));

  if (!task || !project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">태스크를 찾을 수 없습니다</h3>
          <Button onClick={onBack}>돌아가기</Button>
        </div>
      </div>
    );
  }

  const assignee = users.find(u => u.id === task.assigneeId);
  const reporter = users.find(u => u.id === task.reporterId);
  const canEdit = canEditTask(taskId);

  const handleEdit = () => {
    setEditData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId,
      estimatedHours: task.estimatedHours,
      startDate: task.startDate,
      dueDate: task.dueDate
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateTask(taskId, editData);
    setIsEditing(false);
    setEditData({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment('task', taskId, newComment.trim());
      setNewComment('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && currentUser) {
      Array.from(files).forEach(file => {
        const attachment: Omit<Attachment, 'id' | 'uploadedAt'> = {
          type: file.type.startsWith('image/') ? 'image' : 'file',
          name: file.name,
          url: URL.createObjectURL(file), // Mock URL
          size: file.size,
          uploadedBy: currentUser.id
        };
        addAttachment('task', taskId, attachment);
      });
    }
  };

  const handleAddLink = () => {
    if (newLink.name.trim() && newLink.url.trim() && currentUser) {
      const attachment: Omit<Attachment, 'id' | 'uploadedAt'> = {
        type: 'link',
        name: newLink.name.trim(),
        url: newLink.url.trim(),
        uploadedBy: currentUser.id
      };
      addAttachment('task', taskId, attachment);
      setNewLink({ name: '', url: '' });
      setShowLinkForm(false);
    }
  };

  const handleLogTime = () => {
    const hours = parseFloat(timeLog.hours);
    if (hours > 0) {
      logTime(taskId, hours, timeLog.description.trim() || undefined);
      setTimeLog({ hours: '', description: '' });
      setShowTimeLog(false);
    }
  };

  const updateStatus = (newStatus: Task['status']) => {
    updateTask(taskId, { status: newStatus });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'in-review': return 'bg-purple-100 text-purple-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto custom-scrollbar">
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              프로젝트 보드
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{project.key}</span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">{project.name}</span>
              </div>
            </div>
          </div>
          
          {canEdit && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    저장
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    취소
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  편집
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {isEditing ? (
                      <Input
                        value={editData.title || ''}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="text-xl font-bold border-none p-0 h-auto"
                      />
                    ) : (
                      <CardTitle className="text-xl">{task.title}</CardTitle>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                      <Badge className={getPriorityColor(task.priority)}>
                        <Flag className="w-3 h-3 mr-1" />
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    {task.status !== 'in-progress' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus('in-progress')}>
                        <Play className="w-3 h-3 mr-1" />
                        시작
                      </Button>
                    )}
                    {task.status === 'in-progress' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus('in-review')}>
                        <Pause className="w-3 h-3 mr-1" />
                        리뷰 요청
                      </Button>
                    )}
                    {task.status !== 'done' && (
                      <Button size="sm" onClick={() => updateStatus('done')}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        완료
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>설명</Label>
                  {isEditing ? (
                    <Textarea
                      value={editData.description || ''}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className="mt-1 min-h-[100px]"
                    />
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      <p className="whitespace-pre-wrap">{task.description}</p>
                    </div>
                  )}
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>진행률</Label>
                    <span className="text-sm font-medium">{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} className="h-3" />
                </div>

                {/* Time Tracking */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>예상 시간</Label>
                    <div className="mt-1 text-sm">
                      {task.estimatedHours ? `${task.estimatedHours}시간` : '설정되지 않음'}
                    </div>
                  </div>
                  <div>
                    <Label>기록된 시간</Label>
                    <div className="mt-1 text-sm">{task.loggedHours}시간</div>
                  </div>
                </div>

                {/* Time Log Button */}
                <Button variant="outline" size="sm" onClick={() => setShowTimeLog(true)}>
                  <Clock className="w-4 h-4 mr-2" />
                  시간 기록
                </Button>
              </CardContent>
            </Card>

            {/* Attachments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>첨부파일 및 링크</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      파일 업로드
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowLinkForm(true)}>
                      <Link className="w-4 h-4 mr-2" />
                      링크 추가
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {task.attachments.map(attachment => {
                  const uploader = users.find(u => u.id === attachment.uploadedBy);
                  return (
                    <div key={attachment.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        {attachment.type === 'link' ? (
                          <Link className="w-5 h-5 text-blue-600" />
                        ) : attachment.type === 'image' ? (
                          <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center">
                            <span className="text-green-600 text-xs">IMG</span>
                          </div>
                        ) : (
                          <Paperclip className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {attachment.type === 'link' ? (
                            <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {attachment.name}
                            </a>
                          ) : (
                            attachment.name
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {uploader?.name} • {formatDateTime(attachment.uploadedAt)}
                          {attachment.size && ` • ${formatFileSize(attachment.size)}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {task.attachments.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <Paperclip className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">첨부파일이 없습니다</p>
                  </div>
                )}

                {/* Link Form */}
                {showLinkForm && (
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <div className="space-y-3">
                      <div>
                        <Label>링크 제목</Label>
                        <Input
                          value={newLink.name}
                          onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                          placeholder="예: 참고 자료"
                        />
                      </div>
                      <div>
                        <Label>URL</Label>
                        <Input
                          value={newLink.url}
                          onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                          placeholder="https://example.com"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleAddLink}>추가</Button>
                        <Button size="sm" variant="outline" onClick={() => setShowLinkForm(false)}>취소</Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle>댓글 ({task.comments.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Comment */}
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {currentUser?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="댓글을 입력하세요..."
                      className="min-h-[80px]"
                    />
                    <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                      <Send className="w-4 h-4 mr-2" />
                      댓글 작성
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Comments List */}
                {task.comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {comment.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.userName}</span>
                        <span className="text-xs text-gray-500">{formatDateTime(comment.createdAt)}</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {task.comments.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <p className="text-sm">아직 댓글이 없습니다</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Details */}
            <Card>
              <CardHeader>
                <CardTitle>태스크 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>담당자</Label>
                  {isEditing ? (
                    <Select value={editData.assigneeId || ''} onValueChange={(value) => setEditData({ ...editData, assigneeId: value || undefined })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="담당자 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {project.members.map(member => {
                          const user = users.find(u => u.id === member.userId);
                          return user ? (
                            <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                          ) : null;
                        })}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1 flex items-center gap-2">
                      {assignee ? (
                        <>
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                              {assignee.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{assignee.name}</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">할당되지 않음</span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <Label>보고자</Label>
                  <div className="mt-1 flex items-center gap-2">
                    {reporter && (
                      <>
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                            {reporter.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{reporter.name}</span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <Label>상태</Label>
                  {isEditing ? (
                    <Select value={editData.status || task.status} onValueChange={(value) => setEditData({ ...editData, status: value as Task['status'] })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">할 일</SelectItem>
                        <SelectItem value="in-progress">진행 중</SelectItem>
                        <SelectItem value="in-review">리뷰 중</SelectItem>
                        <SelectItem value="done">완료</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  )}
                </div>

                <div>
                  <Label>우선순위</Label>
                  {isEditing ? (
                    <Select value={editData.priority || task.priority} onValueChange={(value) => setEditData({ ...editData, priority: value as Task['priority'] })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">낮음</SelectItem>
                        <SelectItem value="medium">보통</SelectItem>
                        <SelectItem value="high">높음</SelectItem>
                        <SelectItem value="urgent">긴급</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1">
                      <Badge className={getPriorityColor(task.priority)}>
                        <Flag className="w-3 h-3 mr-1" />
                        {task.priority}
                      </Badge>
                    </div>
                  )}
                </div>

                <div>
                  <Label>시작일</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editData.startDate || ''}
                      onChange={(e) => setEditData({ ...editData, startDate: e.target.value || undefined })}
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1 text-sm">
                      {task.startDate ? formatDate(task.startDate) : '설정되지 않음'}
                    </div>
                  )}
                </div>

                <div>
                  <Label>마감일</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editData.dueDate || ''}
                      onChange={(e) => setEditData({ ...editData, dueDate: e.target.value || undefined })}
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1 text-sm">
                      {task.dueDate ? formatDate(task.dueDate) : '설정되지 않음'}
                    </div>
                  )}
                </div>

                <div>
                  <Label>레이블</Label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {task.labels.map(label => (
                      <Badge key={label} variant="outline" className="text-xs">
                        {label}
                      </Badge>
                    ))}
                    {task.labels.length === 0 && (
                      <span className="text-sm text-gray-500">레이블 없음</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Log */}
            <Card>
              <CardHeader>
                <CardTitle>활동 기록</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>생성됨: {formatDateTime(task.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Edit className="w-4 h-4" />
                    <span>수정됨: {formatDateTime(task.updatedAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Time Log Modal */}
        {showTimeLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-medium mb-4">시간 기록</h3>
              <div className="space-y-4">
                <div>
                  <Label>작업 시간 (시간)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={timeLog.hours}
                    onChange={(e) => setTimeLog({ ...timeLog, hours: e.target.value })}
                    placeholder="예: 2.5"
                  />
                </div>
                <div>
                  <Label>작업 내용 (선택사항)</Label>
                  <Textarea
                    value={timeLog.description}
                    onChange={(e) => setTimeLog({ ...timeLog, description: e.target.value })}
                    placeholder="수행한 작업을 간단히 설명해주세요..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleLogTime} disabled={!timeLog.hours || parseFloat(timeLog.hours) <= 0}>
                    기록
                  </Button>
                  <Button variant="outline" onClick={() => setShowTimeLog(false)}>
                    취소
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}