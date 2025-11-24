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
import { useProjects } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import api, { plmApi } from '../services/api';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onTaskCreated?: () => void;
}

export default function CreateTaskDialog({ open, onOpenChange, projectId, onTaskCreated }: CreateTaskDialogProps) {
  const { users, currentUser } = useProjects();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    assigneeIds: [] as string[],
    startDate: '',
    dueDate: ''
  });
  
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // 프로젝트 멤버 불러오기
  useEffect(() => {
    if (open && projectId) {
      loadProjectMembers();
    }
  }, [open, projectId]);

  const loadProjectMembers = async () => {
    try {
      const members = await plmApi.getProjectMembers(parseInt(projectId));
      setProjectMembers(members);
      
      // 프로젝트 멤버의 userId로 users에서 찾기
      const memberUsers = members.map((member: any) => 
        users.find(u => u.id === member.userId.toString())
      ).filter(Boolean);
      
      setTeamMembers(memberUsers);
    } catch (error) {
      console.error('프로젝트 멤버 로드 실패:', error);
    }
  };
  
  // 검색어에 따라 팀원 필터링
  const filteredTeamMembers = teamMembers.filter(member => 
    member && (
      member.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
    )
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !currentUser || isSubmitting) return;
    
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 날짜 유효성 검사
    if (formData.startDate && formData.dueDate) {
      const startDate = new Date(formData.startDate);
      const dueDate = new Date(formData.dueDate);
      if (startDate > dueDate) {
        alert('마감일은 시작일 이후여야합니다.');
        return;
      }
    }

    try {
      setIsSubmitting(true);

      // 우선순위를 백엔드 형식으로 변환
      const priorityMap: Record<string, string> = {
        'low': 'LOW',
        'medium': 'MEDIUM',
        'high': 'HIGH',
        'urgent': 'URGENT'
      };

      // 날짜를 LocalDateTime 형식으로 변환 (YYYY-MM-DDTHH:mm:ss)
      let dueDateFormatted = null;
      if (formData.dueDate) {
        dueDateFormatted = `${formData.dueDate}T23:59:59`;
      }

      let startDateFormatted = null;
      if (formData.startDate) {
        startDateFormatted = `${formData.startDate}T00:00:00`;
      }

      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: 'TODO',
        priority: priorityMap[formData.priority],
        assigneeId: formData.assigneeIds.length > 0 ? formData.assigneeIds.join(',') : null,
        startDate: startDateFormatted,
        dueDate: dueDateFormatted,
      };

      console.log('태스크 생성 요청:', taskData);

      await api.post(`/projects/${projectId}/tasks?userId=${user.id}`, taskData);

      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        assigneeIds: [],
        startDate: '',
        dueDate: ''
      });
      setMemberSearchQuery('');
      
      if (onTaskCreated) {
        onTaskCreated();
      }
    } catch (error) {
      console.error('태스크 생성 실패:', error);
      alert('태스크 생성에 실패했습니다.');
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>새 태스크 생성</DialogTitle>
          <DialogDescription>
            프로젝트에 새로운 태스크를 추가합니다.
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
                        const assignee = teamMembers.find(m => m.id === assigneeId);
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
                        {memberSearchQuery ? '검색 결과가 없습니다.' : '팀원이 없습니다.'}
                      </p>
                    ) : (
                      filteredTeamMembers.map(member => {
                      const isSelected = formData.assigneeIds.includes(member.id);
                      
                      return (
                        <div key={member.id} className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded">
                          <Checkbox 
                            id={`assignee-${member.id}`}
                            checked={isSelected}
                            onCheckedChange={() => handleAssigneeToggle(member.id)}
                          />
                          <label 
                            htmlFor={`assignee-${member.id}`}
                            className="flex items-center gap-2 flex-1 cursor-pointer"
                          >
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                {member.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm block truncate">{member.name}</span>
                              <span className="text-xs text-gray-500 block truncate">{member.email}</span>
                            </div>
                          </label>
                        </div>
                      );
                    })
                   )}
                  </div>
                </div>
              </div>
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
              <Label htmlFor="dueDate">마감일</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
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
                {formData.assigneeIds.length > 0 && (
                  <span>담당자: {formData.assigneeIds.map(id => teamMembers.find(m => m.id === id)?.name).filter(Boolean).join(', ')}</span>
                )}
                {formData.dueDate && (
                  <span>마감: {new Date(formData.dueDate).toLocaleDateString('ko-KR')}</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" disabled={!formData.title.trim() || isSubmitting}>
              {isSubmitting ? '생성 중...' : '태스크 생성'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}