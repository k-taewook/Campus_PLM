import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Search } from 'lucide-react';
import { useProjects } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import api, { plmApi } from '../services/api';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated?: () => void;
}

export default function CreateProjectDialog({ open, onOpenChange, onProjectCreated }: CreateProjectDialogProps) {
  const { users, currentUser, projects } = useProjects();
  const { user: authUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'software' as const,
    leadId: '',
    teamMembers: [] as string[],
    startDate: '',
    endDate: ''
  });

  const [nameError, setNameError] = useState('');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 사용자 목록이 로드되면 첫 번째 admin/manager를 기본 리드로 설정
  useEffect(() => {
    if (users.length > 0 && !formData.leadId) {
      const defaultLead = users.find(u => u.role === 'admin' || u.role === 'manager');
      if (defaultLead) {
        setFormData(prev => ({
          ...prev,
          leadId: defaultLead.id,
          teamMembers: [defaultLead.id]
        }));
      }
    }
  }, [users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !authUser) return;

    setIsSubmitting(true);
    setNameError('');

    try {
      // 날짜를 LocalDateTime 형식으로 변환 (YYYY-MM-DDTHH:MM:SS)
      const formatToLocalDateTime = (dateString: string) => {
        if (!dateString) return null;
        // 날짜만 있으면 시간 추가
        if (dateString.length === 10) {
          return dateString + 'T00:00:00';
        }
        return dateString;
      };

      const now = new Date();
      const defaultStartDate = now.toISOString().split('.')[0]; // 2025-10-31T14:30:00
      const futureDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      const defaultEndDate = futureDate.toISOString().split('.')[0];

      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        status: 'PLANNING',
        managerId: formData.leadId, // 선택한 프로젝트 리드 사용
        startDate: formatToLocalDateTime(formData.startDate) || defaultStartDate,
        endDate: formatToLocalDateTime(formData.endDate) || defaultEndDate
      };

      console.log('프로젝트 생성 요청:', projectData);
      console.log('선택된 프로젝트 리드 ID:', formData.leadId);
      const response = await api.post('/projects', projectData);
      console.log('프로젝트 생성 성공:', response.data);

      // 프로젝트 멤버 추가
      const createdProjectId = response.data.id;
      console.log('선택된 팀 멤버:', formData.teamMembers);
      console.log('프로젝트 ID:', createdProjectId);
      
      if (formData.teamMembers && formData.teamMembers.length > 0) {
        // 빈 문자열 제거 및 유효한 숫자로 변환
        const memberIds = formData.teamMembers
          .filter(id => id && id.trim() !== '')
          .map(id => parseInt(id))
          .filter(id => !isNaN(id));
        
        console.log('변환된 멤버 ID 배열:', memberIds);
        
        if (memberIds.length > 0) {
          try {
            const memberResponse = await plmApi.addProjectMembersBulk(createdProjectId, memberIds);
            console.log('프로젝트 멤버 추가 성공:', memberResponse);
          } catch (memberError: any) {
            console.error('프로젝트 멤버 추가 실패:', memberError);
            console.error('에러 상세:', memberError.response?.data);
            // 멤버 추가 실패해도 프로젝트는 생성됨
          }
        } else {
          console.log('유효한 멤버 ID가 없습니다.');
        }
      } else {
        console.log('추가할 팀 멤버가 없습니다.');
      }

      // Reset form - 기본 리드로 리셋
      const defaultLead = users.find(u => u.role === 'admin' || u.role === 'manager');
      setFormData({
        name: '',
        description: '',
        type: 'software',
        leadId: defaultLead?.id || '',
        teamMembers: defaultLead ? [defaultLead.id] : [],
        startDate: '',
        endDate: ''
      });
      setMemberSearchQuery('');
      
      // 부모 컴포넌트에 알림 (새로고침)
      if (onProjectCreated) {
        onProjectCreated();
      }
      
      onOpenChange(false);
      alert('프로젝트가 생성되었습니다!');
    } catch (error: any) {
      console.error('프로젝트 생성 실패:', error);
      setNameError(error.response?.data?.message || '프로젝트 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTeamMemberToggle = (userId: string) => {
    if (!authUser) return;
    
    setFormData(prev => {
      const currentMembers = prev.teamMembers;
      const isSelected = currentMembers.includes(userId);
      
      // 프로젝트 리드는 선택 해제 불가
      if (isSelected && userId === prev.leadId) {
        return prev;
      }
      
      if (isSelected) {
        return {
          ...prev,
          teamMembers: currentMembers.filter(id => id !== userId)
        };
      } else {
        return {
          ...prev,
          teamMembers: [...currentMembers, userId]
        };
      }
    });
  };

  const handleLeadChange = (newLeadId: string) => {
    setFormData(prev => {
      const oldLeadId = prev.leadId;
      
      // 이전 리드를 팀 멤버에서 제거하고, 새 리드를 추가
      let updatedMembers = prev.teamMembers.filter(id => id !== oldLeadId);
      
      // 새 리드가 팀 멤버에 없으면 추가
      if (!updatedMembers.includes(newLeadId)) {
        updatedMembers = [...updatedMembers, newLeadId];
      }
      
      return {
        ...prev,
        leadId: newLeadId,
        teamMembers: updatedMembers
      };
    });
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name
    }));
    
    // Clear name error when user starts typing
    if (nameError) {
      setNameError('');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'software': return '💻';
      case 'marketing': return '📢';
      case 'design': return '🎨';
      case 'research': return '🔬';
      case 'other': return '📁';
      default: return '📁';
    }
  };

  const selectedMembers = users.filter(user => formData.teamMembers.includes(user.id));
  
  // 검색어에 따라 사용자 필터링
  const filteredUsers = users.filter(user => {
    // 검색어 필터링
    return user.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(memberSearchQuery.toLowerCase());
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>새 프로젝트 생성</DialogTitle>
          <DialogDescription>
            새로운 프로젝트를 생성하고 팀원들과 함께 작업을 시작하세요.
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto custom-scrollbar flex-1">
        <form id="create-project-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div>
            <Label htmlFor="name">프로젝트 이름 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="프로젝트 이름을 입력하세요"
              required
              className={nameError ? 'border-red-500' : ''}
            />
            {nameError && (
              <p className="text-sm text-red-600 mt-1">{nameError}</p>
            )}
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
                  <SelectItem value="software">
                    <div className="flex items-center gap-2">
                      <span>💻</span>
                      소프트웨어 개발
                    </div>
                  </SelectItem>
                  <SelectItem value="marketing">
                    <div className="flex items-center gap-2">
                      <span>📢</span>
                      마케팅
                    </div>
                  </SelectItem>
                  <SelectItem value="design">
                    <div className="flex items-center gap-2">
                      <span>🎨</span>
                      디자인
                    </div>
                  </SelectItem>
                  <SelectItem value="research">
                    <div className="flex items-center gap-2">
                      <span>🔬</span>
                      연구
                    </div>
                  </SelectItem>
                  <SelectItem value="other">
                    <div className="flex items-center gap-2">
                      <span>📁</span>
                      기타
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="lead">프로젝트 리드</Label>
              <Select value={formData.leadId} onValueChange={handleLeadChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(user => user.role === 'admin' || user.role === 'manager').map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </SelectItem>
                  ))}
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
                    {selectedMembers.map(member => {
                      const isLead = member.id === formData.leadId;
                      return (
                        <Badge 
                          key={member.id} 
                          variant={isLead ? "default" : "secondary"} 
                          className="flex items-center gap-2"
                        >
                          <Avatar className="w-4 h-4">
                            <AvatarFallback className={isLead ? "bg-white text-blue-600 text-xs" : "bg-blue-100 text-blue-600 text-xs"}>
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {member.name}
                          {isLead && <span className="text-xs font-semibold">리드</span>}
                        </Badge>
                      );
                    })}
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
                    const isLead = user.id === formData.leadId;
                    
                    return (
                      <div key={user.id} className="flex items-center space-x-3 hover:bg-gray-50 p-1 rounded">
                        <Checkbox 
                          id={user.id}
                          checked={isSelected}
                          onCheckedChange={() => handleTeamMemberToggle(user.id)}
                          disabled={isLead} // Can't unselect project lead
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
                              {isLead && <span className="text-blue-600 ml-1 font-semibold">(리드)</span>}
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
                <div>
                  <div className="font-medium">{formData.name || '프로젝트 이름'}</div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <span>{getTypeIcon(formData.type)}</span>
                    <span>{formData.type}</span>
                  </div>
                </div>
              </div>
              {formData.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{formData.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>리드: {users.find(u => u.id === formData.leadId)?.name}</span>
                <span>팀원: {selectedMembers.length}명</span>
                {formData.startDate && (
                  <span>시작: {new Date(formData.startDate).toLocaleDateString('ko-KR')}</span>
                )}
              </div>
            </div>
          </div>
        </form>
        </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" form="create-project-form" disabled={!formData.name.trim() || isSubmitting}>
              {isSubmitting ? '생성 중...' : '프로젝트 생성'}
            </Button>
          </div>
      </DialogContent>
    </Dialog>
  );
}