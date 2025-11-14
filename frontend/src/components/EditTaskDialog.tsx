import { useState, useEffect } from 'react';
import { Plus, User, Calendar, Flag, Clock, X, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import api, { plmApi } from '../services/api';

interface EditTaskDialogProps {
  open: boolean;
  onClose: () => void;
  taskId: string;
  projectId: string;
  initialData: {
    title: string;
    description: string;
    status: string;
    priority: string;
    assigneeId?: string;
    startDate?: string;
    dueDate?: string;
  };
  onTaskUpdated?: () => void;
}

export default function EditTaskDialog({
  open,
  onClose,
  taskId,
  projectId,
  initialData,
  onTaskUpdated
}: EditTaskDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assigneeIds: [] as string[],
    startDate: '',
    dueDate: ''
  });
  
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // 프로젝트 멤버 불러오기
  useEffect(() => {
    if (open && projectId) {
      loadTeamMembers();
    }
  }, [open, projectId]);

  // initialData 변경 시 폼 데이터 초기화
  useEffect(() => {
    if (open) {
      const assigneeIds = initialData.assigneeId 
        ? initialData.assigneeId.split(',').map(id => id.trim()).filter(id => id !== '')
        : [];
      
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status?.toLowerCase().replace('_', '-') || 'todo',
        priority: initialData.priority?.toLowerCase() || 'medium',
        assigneeIds: assigneeIds,
        startDate: initialData.startDate ? initialData.startDate.split('T')[0] : '',
        dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : ''
      });
    }
  }, [open, initialData.title, initialData.description, initialData.status, initialData.priority, initialData.assigneeId, initialData.startDate, initialData.dueDate]);

  const loadTeamMembers = async () => {
    try {
      const members = await plmApi.getProjectMembers(parseInt(projectId));
      setTeamMembers(members);
    } catch (error) {
      console.error('팀원 로드 실패:', error);
    }
  };
  
  // 검색어에 따라 팀원 필터링
  const filteredTeamMembers = teamMembers.filter(member => 
    member && (
      (member.userFullName || member.username || '').toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      (member.userEmail || '').toLowerCase().includes(memberSearchQuery.toLowerCase())
    )
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);

      // 상태를 백엔드 형식으로 변환
      const statusMap: Record<string, string> = {
        'todo': 'TODO',
        'in-progress': 'IN_PROGRESS',
        'in-review': 'REVIEW',
        'done': 'DONE'
      };

      // 우선순위를 백엔드 형식으로 변환
      const priorityMap: Record<string, string> = {
        'low': 'LOW',
        'medium': 'MEDIUM',
        'high': 'HIGH',
        'urgent': 'URGENT'
      };

      // 날짜를 LocalDateTime 형식으로 변환
      let startDateFormatted = null;
      if (formData.startDate) {
        startDateFormatted = `${formData.startDate}T00:00:00`;
      }

      let dueDateFormatted = null;
      if (formData.dueDate) {
        dueDateFormatted = `${formData.dueDate}T23:59:59`;
      }

      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: statusMap[formData.status.toLowerCase()] || formData.status,
        priority: priorityMap[formData.priority.toLowerCase()] || formData.priority,
        assigneeId: formData.assigneeIds.length > 0 ? formData.assigneeIds.join(',') : null,
        startDate: startDateFormatted,
        dueDate: dueDateFormatted,
      };

      console.log('태스크 수정 요청:', updateData);
      await api.patch(`/tasks/${taskId}`, updateData);
      
      if (onTaskUpdated) {
        onTaskUpdated();
      }
      onClose();
      alert('태스크가 수정되었습니다.');
    } catch (error) {
      console.error('태스크 수정 실패:', error);
      alert('태스크 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssigneeToggle = (userId: string) => {
    setFormData(prev => {
      const currentAssignees = prev.assigneeIds;
      const isSelected = currentAssignees.includes(userId);
      
      if (isSelected) {
        return {
          ...prev,
          assigneeIds: currentAssignees.filter(id => id !== userId)
        };
      } else {
        return {
          ...prev,
          assigneeIds: [...currentAssignees, userId]
        };
      }
    });
  };

  const removeAssignee = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assigneeIds: prev.assigneeIds.filter(id => id !== userId)
    }));
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
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>태스크 수정</DialogTitle>
          <DialogDescription>
            태스크의 정보를 수정합니다.
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

          {/* Assignees and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>담당자</Label>
              <div className="mt-2 space-y-3">
                {/* Selected Assignees */}
                {formData.assigneeIds.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">선택된 담당자 ({formData.assigneeIds.length}명)</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.assigneeIds.map(assigneeId => {
                        const assignee = teamMembers.find(m => m.userId.toString() === assigneeId);
                        if (!assignee) return null;
                        return (
                          <Badge key={assigneeId} variant="secondary" className="flex items-center gap-2">
                            <Avatar className="w-4 h-4">
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                {(assignee.userFullName || assignee.username || 'U').charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {assignee.userFullName || assignee.username}
                            <X 
                              className="w-3 h-3 cursor-pointer hover:text-red-600" 
                              onClick={() => removeAssignee(assigneeId)}
                            />
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Team Members List */}
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">팀원 목록</p>
                    <span className="text-xs text-gray-500">
                      {filteredTeamMembers.length}명
                    </span>
                  </div>
                  
                  {/* Search Input */}
                  <div className="relative mb-3">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <Input
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      placeholder="팀원 이름 또는 이메일 검색"
                      className="pl-7 h-7 text-xs"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    {filteredTeamMembers.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-2">
                        {memberSearchQuery ? '검색 결과가 없습니다' : '팀원이 없습니다'}
                      </p>
                    ) : (
                      filteredTeamMembers.map(member => {
                        const isSelected = formData.assigneeIds.includes(member.userId.toString());
                        return (
                          <div
                            key={member.userId}
                            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <Checkbox 
                                checked={isSelected}
                                onCheckedChange={() => handleAssigneeToggle(member.userId.toString())}
                              />
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                  {(member.userFullName || member.username || 'U').charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-xs font-medium">
                                  {member.userFullName || member.username}
                                </p>
                                <p className="text-xs text-gray-500">{member.userEmail}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label>우선순위</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.priority === priority
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Flag className={`w-4 h-4 ${
                        priority === 'urgent' ? 'text-red-500' :
                        priority === 'high' ? 'text-orange-500' :
                        priority === 'medium' ? 'text-yellow-500' :
                        'text-green-500'
                      }`} />
                      <span className="text-sm font-medium capitalize">
                        {priority === 'low' ? '낮음' :
                         priority === 'medium' ? '보통' :
                         priority === 'high' ? '높음' : '긴급'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Status and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status">상태</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: string) => setFormData({ ...formData, status: value })}
              >
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
            </div>

            <div>
              <Label htmlFor="startDate">시작일</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="dueDate">마감일</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-sm text-gray-700 mb-3">수정 요약</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                {formData.assigneeIds.length > 0 && (
                  <span>담당자: {formData.assigneeIds.map(id => {
                    const member = teamMembers.find(m => m.userId.toString() === id);
                    return member ? (member.userFullName || member.username) : '';
                  }).filter(Boolean).join(', ')}</span>
                )}
                {formData.assigneeIds.length === 0 && <span className="text-gray-500">담당자 없음</span>}
              </div>
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-gray-400" />
                <span>우선순위: </span>
                <Badge className={getPriorityColor(formData.priority)}>
                  {formData.priority === 'low' ? '낮음' :
                   formData.priority === 'medium' ? '보통' :
                   formData.priority === 'high' ? '높음' : '긴급'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                {formData.startDate && <span>시작: {formData.startDate}</span>}
                {formData.dueDate && <span>마감: {formData.dueDate}</span>}
                {!formData.startDate && !formData.dueDate && <span className="text-gray-500">날짜 미설정</span>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.title.trim()}
            >
              {isSubmitting ? '수정 중...' : '수정하기'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
