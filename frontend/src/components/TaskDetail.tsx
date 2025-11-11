import React, { useState, useRef, useEffect } from 'react';
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
  CheckCircle,
  Plus
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
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useProjects, type Task, type Attachment } from '../contexts/ProjectContext';
import api, { getTaskFiles, uploadFile as uploadFileApi, deleteFileById, updateFileOriginalName, type FileDto } from '../services/api';
import EditTaskDialog from './EditTaskDialog';

interface TaskDetailProps {
  taskId: string;
  onBack: () => void;
  onTaskUpdated?: () => void;  // 태스크 업데이트 시 호출될 콜백
}

export default function TaskDetail({ taskId, onBack, onTaskUpdated }: TaskDetailProps) {
  const { 
    users, 
    currentUser,
    updateTask,
    addComment,
    addAttachment,
    logTime,
    canEditTask
  } = useProjects();

  const [task, setTask] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [newComment, setNewComment] = useState('');
  const [newLink, setNewLink] = useState({ name: '', url: '' });
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [timeLog, setTimeLog] = useState({ hours: '', description: '' });
  const [showTimeLog, setShowTimeLog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // 체크리스트 관련 상태
  const [checklist, setChecklist] = useState<Array<{ id: string; text: string; completed: boolean }>>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [showChecklistForm, setShowChecklistForm] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressMap, setUploadProgressMap] = useState<Record<string, number>>({});
  const [uploadDoneCount, setUploadDoneCount] = useState<number>(0);

  useEffect(() => {
    loadTaskData();
  }, [taskId]);

  // 체크리스트 변경 시 localStorage에 저장
  useEffect(() => {
    if (task) {  // task가 로드된 후에만 저장
      localStorage.setItem(`checklist_${taskId}`, JSON.stringify(checklist));
    }
  }, [checklist, taskId, task]);

  const loadTaskData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tasks/${taskId}`);
      const taskData = response.data;
      
      // 백엔드 상태를 프론트엔드 형식으로 변환
      const statusMap: Record<string, string> = {
        'TODO': 'todo',
        'IN_PROGRESS': 'in-progress',
        'REVIEW': 'in-review',  // REVIEW -> in-review
        'DONE': 'done',
        'CANCELLED': 'cancelled'
      };
      
      const frontendStatus = statusMap[taskData.status] || taskData.status.toLowerCase().replace('_', '-');
      
      console.log('태스크 로드:', {
        백엔드상태: taskData.status,
        프론트엔드상태: frontendStatus,
        매핑테이블: statusMap
      });
      
      setTask({
        id: taskData.id.toString(),
        title: taskData.title,
        description: taskData.description || '',
        status: frontendStatus,
        priority: taskData.priority.toLowerCase(),
        assigneeIds: taskData.assigneeId 
          ? taskData.assigneeId.split(',').map((id: string) => id.trim()).filter((id: string) => id !== '')
          : [],
        reporterId: taskData.reporterId?.toString() || '',
        dueDate: taskData.dueDate,
        startDate: taskData.startDate,
        createdAt: taskData.createdAt,
        updatedAt: taskData.updatedAt,
        estimatedHours: taskData.estimatedHours || 0,
        loggedHours: taskData.loggedHours || 0,
        progress: taskData.progress || 0,
        comments: [],
        attachments: [],
        labels: [],
        subtasks: [],
        timeLogs: []
      });

      // 체크리스트 로드 (localStorage에서)
      const savedChecklist = localStorage.getItem(`checklist_${taskId}`);
      let loadedChecklist: typeof checklist = [];
      if (savedChecklist) {
        loadedChecklist = JSON.parse(savedChecklist);
        setChecklist(loadedChecklist);
      }

      // 진행률 자동 수정: 데이터베이스 값이 0이고 체크리스트도 없으면 상태 기반으로 업데이트
      const dbProgress = taskData.progress || 0;
      const shouldUpdateProgress = dbProgress === 0 && loadedChecklist.length === 0 && frontendStatus !== 'todo';
      
      if (shouldUpdateProgress) {
        let calculatedProgress = 0;
        switch (frontendStatus) {
          case 'in-progress': calculatedProgress = 50; break;
          case 'in-review': calculatedProgress = 75; break;
          case 'done': calculatedProgress = 100; break;
          default: calculatedProgress = 0;
        }
        
        if (calculatedProgress > 0) {
          console.log('진행률 자동 수정:', { 
            현재진행률: dbProgress, 
            상태: frontendStatus, 
            새진행률: calculatedProgress 
          });
          
          // 백엔드에 진행률 업데이트
          try {
            await api.patch(`/tasks/${taskId}`, { progress: calculatedProgress });
            // 로컬 상태도 업데이트
            setTask((prev: any) => prev ? { ...prev, progress: calculatedProgress } : prev);
          } catch (error) {
            console.error('진행률 자동 업데이트 실패:', error);
          }
        }
      }

      // 프로젝트 정보 로드
      if (taskData.projectId) {
        try {
          const projectResponse = await api.get(`/projects/${taskData.projectId}`);
          setProject({
            id: projectResponse.data.id.toString(),
            name: projectResponse.data.name,
            key: projectResponse.data.projectKey || 'PROJ'
          });
        } catch (error) {
          console.error('프로젝트 로드 실패:', error);
        }
      }

      // 태스크 첨부파일 목록 로드
      try {
        const files: FileDto[] = await getTaskFiles(Number(taskId));
        const mapped: Attachment[] = files.map((f) => ({
          id: String(f.id),
          type: f.mimeType?.startsWith('image/') ? 'image' : 'file',
          name: f.originalName,
          url: `${api.defaults.baseURL}/files/${f.id}/download`,
          size: f.fileSize,
          uploadedBy: String(f.uploaderId),
          uploadedAt: f.createdAt,
        }));
        setTask((prev: any) => prev ? { ...prev, attachments: mapped } : prev);
      } catch (err) {
        console.error('첨부파일 로드 실패:', err);
      }
    } catch (error) {
      console.error('태스크 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p>태스크 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">태스크를 찾을 수 없습니다</h3>
          <Button onClick={onBack}>돌아가기</Button>
        </div>
      </div>
    );
  }

  const assignees = users.filter(u => task.assigneeIds.includes(u.id));
  const reporter = users.find(u => u.id === task.reporterId);
  const canEdit = true; // API 기반 시스템에서는 항상 편집 가능

  const handleEdit = () => {
    setEditData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assigneeIds: task.assigneeIds,
      estimatedHours: task.estimatedHours,
      startDate: task.startDate,
      dueDate: task.dueDate
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // API 형식에 맞게 데이터 변환
      const statusMap: Record<string, string> = {
        'todo': 'TODO',
        'in-progress': 'IN_PROGRESS',
        'in-review': 'REVIEW',
        'done': 'DONE',
        'cancelled': 'CANCELLED'
      };
      
      const updateData: any = {
        title: editData.title,
        description: editData.description || null,
        status: statusMap[editData.status] || editData.status.toUpperCase().replace('-', '_'),
        priority: editData.priority.toUpperCase(),
        estimatedHours: editData.estimatedHours || null,
        startDate: editData.startDate || null,
        dueDate: editData.dueDate || null
      };

      // assigneeIds를 쉼표로 구분된 문자열로 변환
      if (editData.assigneeIds && editData.assigneeIds.length > 0) {
        updateData.assigneeId = editData.assigneeIds.join(',');
      } else {
        updateData.assigneeId = null;
      }

      await api.put(`/tasks/${taskId}`, updateData);
      
      // 데이터 새로고침
      await loadTaskData();
      
      // 부모 컴포넌트에 업데이트 알림
      if (onTaskUpdated) {
        onTaskUpdated();
      }
      
      setIsEditing(false);
      setEditData({});
      alert('태스크가 수정되었습니다!');
    } catch (error) {
      console.error('태스크 수정 실패:', error);
      alert('태스크 수정에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setShowDeleteConfirm(false);
      alert('태스크가 삭제되었습니다.');
      onBack(); // 목록으로 돌아가기
    } catch (error) {
      console.error('태스크 삭제 실패:', error);
      alert('태스크 삭제에 실패했습니다.');
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment('task', taskId, newComment.trim());
      setNewComment('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !currentUser) return;
    try {
      setIsUploading(true);
      const projectIdNum = project ? Number(project.id) : undefined;
      const uploaderIdNum = Number(currentUser.id);
      const taskIdNum = Number(taskId);

      const filesArr: File[] = Array.from(files as FileList);
      // 초기 프로그레스 0으로 설정
      const initialMap: Record<string, number> = {};
      const keys = filesArr.map((file, idx) => `${file.name}-${idx}-${Date.now()}`);
      keys.forEach((k) => (initialMap[k] = 0));
      setUploadProgressMap(initialMap);

      await Promise.all(
        filesArr.map((file: File, idx) => {
          const key = keys[idx];
          return uploadFileApi({
            file,
            uploaderId: uploaderIdNum,
            projectId: projectIdNum,
            taskId: taskIdNum,
            onUploadProgress: (evt: any) => {
              if (!evt) return;
              const total = evt.total || file.size || 1;
              const percent = Math.min(100, Math.round((evt.loaded / total) * 100));
              setUploadProgressMap((prev) => ({ ...prev, [key]: percent }));
            },
          });
        })
      );

      // 업로드 완료 후 목록 재로딩
      setUploadDoneCount(filesArr.length);
      setTimeout(() => setUploadDoneCount(0), 3000);
      const updatedFiles: FileDto[] = await getTaskFiles(taskIdNum);
      const mapped: Attachment[] = updatedFiles.map((f) => ({
        id: String(f.id),
        type: f.mimeType?.startsWith('image/') ? 'image' : 'file',
        name: f.originalName,
        url: `${api.defaults.baseURL}/files/${f.id}/download`,
        size: f.fileSize,
        uploadedBy: String(f.uploaderId),
        uploadedAt: f.createdAt,
      }));
      setTask((prev: any) => prev ? { ...prev, attachments: mapped } : prev);
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      alert('파일 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
      setUploadProgressMap({});
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 첨부파일 목록 새로고침
  const reloadAttachments = async () => {
    try {
      const list = await getTaskFiles(Number(taskId));
      const mapped: Attachment[] = list.map((f) => ({
        id: String(f.id),
        type: f.mimeType?.startsWith('image/') ? 'image' : 'file',
        name: f.originalName,
        url: `${api.defaults.baseURL}/files/${f.id}/download`,
        size: f.fileSize,
        uploadedBy: String(f.uploaderId),
        uploadedAt: f.createdAt,
      }));
      setTask((prev: any) => prev ? { ...prev, attachments: mapped } : prev);
    } catch (e) {
      console.error('첨부파일 새로고침 실패:', e);
    }
  };

  // 첨부파일 삭제
  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm('이 첨부파일을 삭제하시겠습니까?')) return;
    try {
      await deleteFileById(Number(attachmentId));
      await reloadAttachments();
      alert('첨부파일이 삭제되었습니다.');
    } catch (e) {
      console.error('첨부파일 삭제 실패:', e);
      alert('첨부파일 삭제에 실패했습니다.');
    }
  };

  // 첨부파일 이름 수정
  const handleRenameAttachment = async (attachmentId: string, currentName: string) => {
    const newName = window.prompt('새 파일명을 입력하세요', currentName);
    if (!newName || newName.trim() === '' || newName === currentName) return;
    try {
      await updateFileOriginalName(Number(attachmentId), newName.trim());
      await reloadAttachments();
      alert('파일명이 변경되었습니다.');
    } catch (e) {
      console.error('파일명 변경 실패:', e);
      alert('파일명 변경에 실패했습니다.');
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

  const updateStatus = async (newStatus: string) => {
    try {
      // 프론트엔드 상태를 백엔드 enum 값으로 변환
      const statusMap: Record<string, string> = {
        'todo': 'TODO',
        'in-progress': 'IN_PROGRESS',
        'in-review': 'REVIEW',  // 백엔드는 REVIEW 사용
        'done': 'DONE',
        'cancelled': 'CANCELLED'
      };
      
      const backendStatus = statusMap[newStatus] || newStatus.toUpperCase().replace('-', '_');
      
      // 상태 기반 진행률 계산 (체크리스트가 없을 때)
      let progressValue = 0;
      if (checklist.length === 0) {
        switch (newStatus) {
          case 'todo': progressValue = 0; break;
          case 'in-progress': progressValue = 50; break;
          case 'in-review': progressValue = 75; break;
          case 'done': progressValue = 100; break;
          default: progressValue = 0;
        }
      } else {
        // 체크리스트가 있으면 현재 진행률 유지
        const completedCount = checklist.filter(item => item.completed).length;
        progressValue = Math.round((completedCount / checklist.length) * 100);
      }
      
      const updateData = {
        status: backendStatus,
        progress: progressValue
      };
      
      console.log('상태 변경:', newStatus, '->', backendStatus, '진행률:', progressValue);
      await api.patch(`/tasks/${taskId}`, updateData);
      await loadTaskData();
      
      // 부모 컴포넌트에 업데이트 알림
      if (onTaskUpdated) {
        onTaskUpdated();
      }
    } catch (error) {
      console.error('상태 변경 실패:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

  // 진행률 계산 (하이브리드 방식)
  const calculateProgress = () => {
    // 1. 체크리스트가 있으면 체크리스트 기반 계산
    if (checklist.length > 0) {
      const completedCount = checklist.filter(item => item.completed).length;
      return Math.round((completedCount / checklist.length) * 100);
    }
    
    // 2. 체크리스트가 없으면 상태 기반 계산 (폴백)
    switch (task?.status) {
      case 'todo': return 0;
      case 'in-progress': return 50;
      case 'in-review': return 75;
      case 'done': return 100;
      default: return 0;
    }
  };

  // 체크리스트 항목 추가
  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    
    const newItem = {
      id: Date.now().toString(),
      text: newChecklistItem.trim(),
      completed: false
    };
    
    const updatedChecklist = [...checklist, newItem];
    setChecklist(updatedChecklist);
    setNewChecklistItem('');
    setShowChecklistForm(false);
    
    // 진행률 업데이트 (새 체크리스트 기준)
    updateProgressWithChecklist(updatedChecklist);
  };

  // 체크리스트 항목 토글
  const toggleChecklistItem = (id: string) => {
    const updatedChecklist = checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updatedChecklist);
    
    // 진행률 업데이트 (새 체크리스트 기준)
    updateProgressWithChecklist(updatedChecklist);
  };

  // 체크리스트 항목 삭제
  const deleteChecklistItem = (id: string) => {
    const updatedChecklist = checklist.filter(item => item.id !== id);
    setChecklist(updatedChecklist);
    
    // 진행률 업데이트 (새 체크리스트 기준)
    updateProgressWithChecklist(updatedChecklist);
  };

  // 진행률 백엔드에 업데이트 (체크리스트 전달 받음)
  const updateProgressWithChecklist = async (currentChecklist: typeof checklist) => {
    try {
      // 체크리스트 기반 진행률 계산
      let newProgress = 0;
      if (currentChecklist.length > 0) {
        const completedCount = currentChecklist.filter(item => item.completed).length;
        newProgress = Math.round((completedCount / currentChecklist.length) * 100);
      } else {
        // 체크리스트가 없으면 상태 기반
        switch (task?.status) {
          case 'todo': newProgress = 0; break;
          case 'in-progress': newProgress = 50; break;
          case 'in-review': newProgress = 75; break;
          case 'done': newProgress = 100; break;
          default: newProgress = 0;
        }
      }
      
      console.log('진행률 업데이트:', { 
        체크리스트: currentChecklist.length, 
        완료: currentChecklist.filter(i => i.completed).length,
        진행률: newProgress 
      });
      
      const response = await api.patch(`/tasks/${taskId}`, {
        progress: newProgress
      });
      
      console.log('진행률 업데이트 성공:', response.data);
      
      // 로컬 상태 업데이트
      setTask((prevTask: any) => prevTask ? { ...prevTask, progress: newProgress } : prevTask);
      
      // 부모 컴포넌트에 알림
      if (onTaskUpdated) {
        onTaskUpdated();
      }
    } catch (error) {
      console.error('진행률 업데이트 실패:', error);
    }
  };

  // 진행률 백엔드에 업데이트 (기존 함수 - 현재 checklist 상태 사용)
  const updateProgress = async () => {
    await updateProgressWithChecklist(checklist);
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'done': return '완료';
      case 'in-progress': return '진행 중';
      case 'in-review': return '리뷰 중';
      case 'todo': return '할 일';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle className="w-3 h-3" />;
      case 'in-progress': return <Play className="w-3 h-3" />;
      case 'in-review': return <Pause className="w-3 h-3" />;
      case 'todo': return <Clock className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
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
                <Button onClick={() => setShowEditDialog(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  태스크 수정
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className={`${getStatusColor(task.status)} border-0`}>
                            {getStatusIcon(task.status)}
                            <span className="ml-1">{getStatusLabel(task.status)}</span>
                            <MoreHorizontal className="w-3 h-3 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => updateStatus('todo')}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-gray-500" />
                              할 일
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus('in-progress')}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                              진행 중
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus('in-review')}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-purple-500" />
                              리뷰 중
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus('done')}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              완료
                            </div>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <Badge className={getPriorityColor(task.priority)}>
                        <Flag className="w-3 h-3 mr-1" />
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Quick Actions - 상태별 빠른 액션 버튼 */}
                  <div className="flex gap-2 items-center flex-wrap">
                    {/* todo 상태일 때 */}
                    {task.status?.toLowerCase().trim() === 'todo' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateStatus('in-progress')} 
                        style={{backgroundColor: '#2563eb', color: '#ffffff'}}
                        className="hover:bg-blue-700"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        시작하기
                      </Button>
                    )}
                    
                    {/* in-progress 상태일 때 */}
                    {task.status?.toLowerCase().replace('_', '-').trim() === 'in-progress' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => updateStatus('todo')}
                          style={{color: '#000000'}}
                        >
                          <Pause className="w-3 h-3 mr-1" />
                          일시정지
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => updateStatus('in-review')} 
                          style={{backgroundColor: '#9333ea', color: '#ffffff'}}
                          className="hover:bg-purple-700"
                        >
                          리뷰 요청
                        </Button>
                      </>
                    )}
                    
                    {/* in-review 상태일 때 */}
                    {(task.status?.toLowerCase().replace('_', '-').trim() === 'in-review' || 
                      task.status?.toLowerCase().trim() === 'review') && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => updateStatus('in-progress')}
                          style={{color: '#000000'}}
                        >
                          수정 필요
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => updateStatus('done')} 
                          style={{backgroundColor: '#16a34a', color: '#ffffff'}}
                          className="hover:bg-green-700"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          완료
                        </Button>
                      </>
                    )}
                    
                    {/* done 상태일 때 */}
                    {task.status?.toLowerCase().trim() === 'done' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => updateStatus('in-progress')}
                        style={{color: '#000000'}}
                      >
                        재작업
                      </Button>
                    )}
                    
                    {/* 삭제 버튼 */}
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      삭제
                    </Button>
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
                    <span className="text-sm font-medium">{calculateProgress()}%</span>
                  </div>
                  <Progress value={calculateProgress()} className="h-3" />
                  {checklist.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      체크리스트 기반: {checklist.filter(item => item.completed).length}/{checklist.length} 완료
                    </p>
                  )}
                </div>

                {/* Checklist */}
                <Card className="border-dashed">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">체크리스트</CardTitle>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setShowChecklistForm(!showChecklistForm)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        항목 추가
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {/* 체크리스트 항목들 */}
                    {checklist.length > 0 ? (
                      <div className="space-y-2">
                        {checklist.map((item) => (
                          <div 
                            key={item.id} 
                            className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 group"
                          >
                            <Checkbox
                              checked={item.completed}
                              onCheckedChange={() => toggleChecklistItem(item.id)}
                            />
                            <span 
                              className={`flex-1 ${item.completed ? 'line-through text-gray-400' : ''}`}
                            >
                              {item.text}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => deleteChecklistItem(item.id)}
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-400">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">체크리스트가 없습니다</p>
                        <p className="text-xs mt-1">항목을 추가하여 작업을 관리하세요</p>
                      </div>
                    )}

                    {/* 새 항목 추가 폼 */}
                    {showChecklistForm && (
                      <div className="flex gap-2 pt-2 border-t">
                        <Input
                          placeholder="새 체크리스트 항목..."
                          value={newChecklistItem}
                          onChange={(e) => setNewChecklistItem(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addChecklistItem();
                            }
                          }}
                          autoFocus
                        />
                        <Button size="sm" onClick={addChecklistItem}>
                          추가
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            setShowChecklistForm(false);
                            setNewChecklistItem('');
                          }}
                        >
                          취소
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

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
                  {/* <Button size="sm" variant="outline" onClick={() => setShowLinkForm(true)}>
                    <Link className="w-4 h-4 mr-2" />
                    링크 추가
                  </Button> */}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
              {/* 업로드 완료 안내 */}
              {uploadDoneCount > 0 && (
                <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">
                  {uploadDoneCount}개 파일 업로드가 완료되었습니다.
                </div>
              )}
                {/* 업로드 진행률 표시 */}
                {isUploading && Object.keys(uploadProgressMap).length > 0 && (
                  <div className="space-y-2 p-3 border rounded-md bg-gray-50">
                    <div className="text-sm font-medium">업로드 중...</div>
                    {Object.entries(uploadProgressMap).map(([key, percent]) => (
                      <div key={key}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="truncate max-w-[220px]">{key.split('-').slice(0, -2).join('-') || '파일'}</span>
                          <span>{percent}%</span>
                        </div>
                        <Progress value={percent} className="h-2" />
                      </div>
                    ))}
                  </div>
                )}
                {task.attachments.map((attachment: any) => {
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
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-900 hover:underline"
                            >
                              {attachment.name}
                            </a>
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

                {/* Link Form 보류 */}
                {/* {showLinkForm && (...)} */}
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
                {task.comments.map((comment: any) => (
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
                    <div className="mt-2 space-y-3">
                      {/* Selected Assignees */}
                      {editData.assigneeIds && editData.assigneeIds.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">선택된 담당자 ({editData.assigneeIds.length}명)</p>
                          <div className="flex flex-wrap gap-2">
                            {editData.assigneeIds.map((assigneeId: any) => {
                              const assignee = users.find(u => u.id === assigneeId);
                              if (!assignee) return null;
                              return (
                                <Badge key={assigneeId} variant="secondary" className="flex items-center gap-2">
                                  <Avatar className="w-4 h-4">
                                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                      {assignee.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  {assignee.name}
                                  <X 
                                    className="w-3 h-3 cursor-pointer hover:text-red-600" 
                                    onClick={() => {
                                      const newAssigneeIds = editData.assigneeIds?.filter((id: any) => id !== assigneeId) || [];
                                      setEditData({ ...editData, assigneeIds: newAssigneeIds });
                                    }}
                                  />
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Available Team Members */}
                      <div className="border rounded-lg p-3 max-h-32 overflow-y-auto">
                        <p className="text-sm text-gray-600 mb-2">사용 가능한 팀원</p>
                        <div className="space-y-2">
                          {project.members.map((member: any) => {
                            const user = users.find(u => u.id === member.userId);
                            if (!user) return null;
                            
                            const isSelected = editData.assigneeIds?.includes(user.id) || false;
                            
                            return (
                              <div key={user.id} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`edit-assignee-${user.id}`}
                                  checked={isSelected}
                                  onCheckedChange={() => {
                                    const currentAssignees = editData.assigneeIds || [];
                                    if (isSelected) {
                                      setEditData({ 
                                        ...editData, 
                                        assigneeIds: currentAssignees.filter((id: any) => id !== user.id) 
                                      });
                                    } else {
                                      setEditData({ 
                                        ...editData, 
                                        assigneeIds: [...currentAssignees, user.id] 
                                      });
                                    }
                                  }}
                                />
                                <div className="flex items-center gap-2 flex-1">
                                  <Avatar className="w-5 h-5">
                                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                      {user.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{user.name}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1">
                      {assignees.length > 0 ? (
                        <div className="space-y-2">
                          {assignees.map(assignee => (
                            <div key={assignee.id} className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                  {assignee.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{assignee.name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">할당되지 않음</span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <Label>상태</Label>
                  {isEditing ? (
                    <Select value={editData.status || task.status} onValueChange={(value: any) => setEditData({ ...editData, status: value })}>
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
                    <Select value={editData.priority || task.priority} onValueChange={(value: any) => setEditData({ ...editData, priority: value })}>
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
                    {task.labels.map((label: any) => (
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>태스크 삭제</DialogTitle>
            <DialogDescription>
              "{task.title}" 태스크를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              삭제
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 태스크 수정 다이얼로그 */}
      {project && (
        <EditTaskDialog
          open={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          taskId={taskId}
          projectId={project.id}
          initialData={{
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            assigneeId: task.assigneeIds && task.assigneeIds.length > 0 ? task.assigneeIds.join(',') : undefined,
            dueDate: task.dueDate
          }}
          onTaskUpdated={() => {
            loadTaskData();
            if (onTaskUpdated) {
              onTaskUpdated();
            }
          }}
        />
      )}
    </div>
  );
}