import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Trash2, Users as UsersIcon } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';
import { toast } from 'sonner@2.0.3';
import { useProjects, type Project } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onProjectDeleted?: () => void;
}

export default function EditProjectDialog({ 
  open, 
  onOpenChange, 
  project,
  onProjectDeleted 
}: EditProjectDialogProps) {
  const { updateProject, deleteProject, canEditProject, currentUser, users } = useProjects();
  
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    type: 'software' as Project['type'],
    status: 'planning' as Project['status'],
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    leadId: '' as string,
  });

  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 폼 초기값 설정
  useEffect(() => {
    if (project && open) {
      setFormData({
        name: project.name,
        key: project.key,
        description: project.description,
        type: project.type,
        status: project.status,
        startDate: project.startDate ? new Date(project.startDate) : undefined,
        endDate: project.endDate ? new Date(project.endDate) : undefined,
        leadId: project.leadId || '',
      });
      
      // 현재 프로젝트 멤버들과 리드를 selectedMembers에 설정
      const memberIds = project.members?.map(m => m.userId.toString()) || [];
      const allMemberIds = new Set(memberIds);
      
      // 리드가 멤버 목록에 없다면 추가
      if (project.leadId) {
        allMemberIds.add(project.leadId);
      }
      
      setSelectedMembers(allMemberIds);
    }
  }, [project, open]);

  // 권한 체크 - AuthContext에서 가져오기
  const { isAdmin } = useAuth();
  const canEdit = project ? canEditProject(project.id) : false;
  const canDelete = project && currentUser && (
    project.leadId === currentUser.id || 
    isAdmin()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !canEdit) return;

    setIsLoading(true);
    
    try {
      // 유효성 검사
      if (!formData.name.trim()) {
        toast.error('프로젝트 이름을 입력해주세요.');
        setIsLoading(false);
        return;
      }

      if (!formData.key.trim()) {
        toast.error('프로젝트 키를 입력해주세요.');
        setIsLoading(false);
        return;
      }

      if (!/^[A-Z]{2,10}$/.test(formData.key)) {
        toast.error('프로젝트 키는 2-10자의 대문자 영문만 가능합니다.');
        setIsLoading(false);
        return;
      }

      if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
        alert('예상 종료일은 시작일 이후여야 합니다.');
        setIsLoading(false);
        return;
      }

      if (!formData.leadId) {
        toast.error('프로젝트 리드를 선택해주세요.');
        setIsLoading(false);
        return;
      }

      // 프로젝트 업데이트
      await api.put(`/projects/${project.id}`, {
        name: formData.name.trim(),
        key: formData.key.trim().toUpperCase(),
        description: formData.description.trim(),
        type: formData.type,
        status: formData.status,
        startDate: formData.startDate?.toISOString().split('T')[0],
        endDate: formData.endDate?.toISOString().split('T')[0],
        managerId: parseInt(formData.leadId),
      });

      // 멤버 변경사항 처리
      const currentMemberIds = new Set(project.members?.map(m => m.userId.toString()) || []);
      const addedMembers = Array.from(selectedMembers).filter(id => !currentMemberIds.has(id));
      const removedMembers = Array.from(currentMemberIds).filter(id => !selectedMembers.has(id));

      // 멤버 추가
      for (const userId of addedMembers) {
        await api.post(`/projects/${project.id}/members/${userId}`);
      }

      // 멤버 제거
      for (const userId of removedMembers) {
        await api.delete(`/projects/${project.id}/members/${userId}`);
      }

      // Context 업데이트
      updateProject(project.id, {
        name: formData.name.trim(),
        key: formData.key.trim().toUpperCase(),
        description: formData.description.trim(),
        type: formData.type,
        status: formData.status,
        startDate: formData.startDate?.toISOString().split('T')[0],
        endDate: formData.endDate?.toISOString().split('T')[0],
      });

      toast.success('프로젝트가 성공적으로 수정되었습니다.');
      onOpenChange(false);
      window.location.reload();
    } catch (error: any) {
      console.error('프로젝트 수정 오류:', error);
      toast.error(error.response?.data?.message || '프로젝트 수정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!project || !canDelete) return;

    setIsLoading(true);
    
    try {
      deleteProject(project.id);
      toast.success('프로젝트가 성공적으로 삭제되었습니다.');
      onOpenChange(false);
      onProjectDeleted?.();
    } catch (error) {
      console.error('프로젝트 삭제 오류:', error);
      toast.error('프로젝트 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const statusOptions = [
    { value: 'planning', label: '계획 중' },
    { value: 'active', label: '진행 중' },
    { value: 'completed', label: '완료' },
    { value: 'on-hold', label: '보류' },
    { value: 'cancelled', label: '취소' },
  ];

  const typeOptions = [
    { value: 'software', label: '소프트웨어' },
    { value: 'marketing', label: '마케팅' },
    { value: 'design', label: '디자인' },
    { value: 'research', label: '연구' },
    { value: 'other', label: '기타' },
  ];

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            프로젝트 편집
            {canDelete && (
              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    삭제
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>프로젝트 삭제</AlertDialogTitle>
                    <AlertDialogDescription>
                      정말로 "{project.name}" 프로젝트를 삭제하시겠습니까?
                      <br />
                      <strong className="text-red-600">
                        이 작업은 되돌릴 수 없으며, 모든 태스크와 데이터가 함께 삭제됩니다.
                      </strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={isLoading}
                    >
                      {isLoading ? '삭제 중...' : '삭제'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </DialogTitle>
          <DialogDescription>
            프로젝트 정보를 수정하거나 삭제할 수 있습니다.
            {!canEdit && (
              <span className="block text-amber-600 mt-2">
                ⚠️ 이 프로젝트를 편집할 권한이 없습니다.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">프로젝트 이름 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="예: 웹사이트 리뉴얼"
                disabled={!canEdit || isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="key">프로젝트 키 *</Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  key: e.target.value.toUpperCase().replace(/[^A-Z]/g, '') 
                }))}
                placeholder="예: WEB"
                maxLength={10}
                disabled={!canEdit || isLoading}
                required
              />
              <p className="text-xs text-gray-500">2-10자의 대문자 영문만 가능</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">프로젝트 설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="프로젝트에 대한 상세한 설명을 입력하세요..."
              rows={3}
              disabled={!canEdit || isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>프로젝트 유형</Label>
              <Select
                value={formData.type}
                onValueChange={(value: Project['type']) => 
                  setFormData(prev => ({ ...prev, type: value }))
                }
                disabled={!canEdit || isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>프로젝트 상태</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Project['status']) => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
                disabled={!canEdit || isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>프로젝트 리드 *</Label>
            <Select
              value={formData.leadId}
              onValueChange={(value) => {
                const oldLeadId = formData.leadId;
                setFormData(prev => ({ ...prev, leadId: value }));
                
                // 새 리드를 팀원으로 자동 추가, 기존 리드는 자동으로 일반 멤버로 전환
                setSelectedMembers(prev => {
                  const newSet = new Set(prev);
                  newSet.add(value); // 새 리드 추가
                  // 기존 리드는 제거하지 않음 (일반 멤버로 유지)
                  return newSet;
                });
              }}
              disabled={!canEdit || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="리드 선택" />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter(u => u.role === 'LEADER' || u.role === 'ADMIN')
                  .map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-5 h-5" />
              <Label className="text-base font-semibold">프로젝트 팀원</Label>
            </div>
            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto border rounded-lg p-3">
              {users.map(user => {
                const isSelected = selectedMembers.has(user.id);
                const isLead = formData.leadId === user.id;
                
                return (
                  <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                    <Checkbox
                      id={`member-${user.id}`}
                      checked={isLead || isSelected}
                      onCheckedChange={(checked) => {
                        if (isLead) {
                          toast.error('프로젝트 리드는 팀원에서 제외할 수 없습니다.');
                          return;
                        }
                        
                        setSelectedMembers(prev => {
                          const newSet = new Set(prev);
                          if (checked) {
                            newSet.add(user.id);
                          } else {
                            newSet.delete(user.id);
                          }
                          return newSet;
                        });
                      }}
                      disabled={!canEdit || isLoading || isLead}
                    />
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`member-${user.id}`} className="cursor-pointer font-medium">
                          {user.name}
                        </Label>
                        {isLead && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">리드</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>시작일</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={!canEdit || isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? (
                      formData.startDate.toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    ) : (
                      <span>시작일 선택</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                    disabled={(date) => 
                      formData.endDate ? date > formData.endDate : false
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>종료일</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={!canEdit || isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? (
                      formData.endDate.toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    ) : (
                      <span>종료일 선택</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                    disabled={(date) => 
                      formData.startDate ? date < formData.startDate : false
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              취소
            </Button>
            {canEdit && (
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? '저장 중...' : '저장'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}