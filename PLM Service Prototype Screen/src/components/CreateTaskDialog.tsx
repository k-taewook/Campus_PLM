import { useState } from 'react';
import { Plus, User, Calendar, Flag, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useProjects } from '../contexts/ProjectContext';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export default function CreateTaskDialog({ open, onOpenChange, projectId }: CreateTaskDialogProps) {
  const { createTask, users, projects, currentUser } = useProjects();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    assigneeId: 'unassigned',
    estimatedHours: '',
    startDate: '',
    dueDate: '',
    labels: [] as string[]
  });
  
  const [newLabel, setNewLabel] = useState('');

  const project = projects.find(p => p.id === projectId);
  const teamMembers = users.filter(u => project?.members.some(m => m.userId === u.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !currentUser) return;

    createTask({
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: 'todo',
      priority: formData.priority,
      assigneeId: formData.assigneeId === 'unassigned' ? undefined : formData.assigneeId,
      reporterId: currentUser.id,
      projectId,
      labels: formData.labels,
      estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : undefined,
      startDate: formData.startDate || undefined,
      dueDate: formData.dueDate || undefined,
      dependencies: [],
      subtasks: []
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      assigneeId: 'unassigned',
      estimatedHours: '',
      startDate: '',
      dueDate: '',
      labels: []
    });
    setNewLabel('');
    onOpenChange(false);
  };

  const addLabel = () => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      setFormData({
        ...formData,
        labels: [...formData.labels, newLabel.trim()]
      });
      setNewLabel('');
    }
  };

  const removeLabel = (labelToRemove: string) => {
    setFormData({
      ...formData,
      labels: formData.labels.filter(label => label !== labelToRemove)
    });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>새 태스크 생성</DialogTitle>
          <DialogDescription>
            {project?.name} 프로젝트에 새로운 태스크를 추가합니다.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">태스크 제목 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="태스크 제목을 입력하세요"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="태스크에 대한 상세한 설명을 입력하세요"
                className="min-h-[100px]"
              />
            </div>
          </div>

          {/* Assignment and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assignee">담당자</Label>
              <Select value={formData.assigneeId} onValueChange={(value) => setFormData({ ...formData, assigneeId: value })}>
                <SelectTrigger>
                  <User className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="담당자 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">할당하지 않음</SelectItem>
                  {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">우선순위</Label>
              <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <Flag className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-100 rounded"></div>
                      낮음
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-100 rounded"></div>
                      보통
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-100 rounded"></div>
                      높음
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-100 rounded"></div>
                      긴급
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Time and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="estimatedHours">예상 시간 (시간)</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="1"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                placeholder="예: 8"
              />
            </div>

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
              <Label htmlFor="dueDate">마감일</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          {/* Labels */}
          <div>
            <Label>레이블</Label>
            <div className="mt-2 space-y-3">
              {formData.labels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.labels.map(label => (
                    <Badge 
                      key={label} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-red-50 hover:border-red-200"
                      onClick={() => removeLabel(label)}
                    >
                      {label} ×
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <Input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="새 레이블 입력"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addLabel();
                    }
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={addLabel}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-3">미리보기</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{formData.title || '제목 없음'}</span>
                <Badge className={getPriorityColor(formData.priority)}>
                  {formData.priority}
                </Badge>
              </div>
              {formData.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{formData.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {formData.assigneeId && formData.assigneeId !== 'unassigned' && (
                  <span>담당자: {teamMembers.find(m => m.id === formData.assigneeId)?.name}</span>
                )}
                {formData.estimatedHours && (
                  <span>예상: {formData.estimatedHours}시간</span>
                )}
                {formData.dueDate && (
                  <span>마감: {new Date(formData.dueDate).toLocaleDateString('ko-KR')}</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={!formData.title.trim()}>
              태스크 생성
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}