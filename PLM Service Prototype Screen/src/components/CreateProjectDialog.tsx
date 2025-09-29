import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { useProjects } from '../contexts/ProjectContext';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const { createProject, users, currentUser } = useProjects();
  
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    type: 'software' as const,
    leadId: currentUser?.id || '',
    teamMembers: [currentUser?.id || ''],
    startDate: '',
    endDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.key.trim() || !formData.name.trim() || !currentUser) return;

    createProject({
      key: formData.key.trim().toUpperCase(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      status: 'planning',
      type: formData.type,
      leadId: formData.leadId,
      teamMembers: formData.teamMembers.filter(Boolean),
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      settings: {
        allowComments: true,
        allowFileUploads: true,
        requireApproval: false,
        notifyOnUpdates: true
      }
    });

    // Reset form
    setFormData({
      key: '',
      name: '',
      description: '',
      type: 'software',
      leadId: currentUser.id,
      teamMembers: [currentUser.id],
      startDate: '',
      endDate: ''
    });
    onOpenChange(false);
  };

  const handleTeamMemberToggle = (userId: string) => {
    setFormData(prev => {
      const currentMembers = prev.teamMembers;
      const isSelected = currentMembers.includes(userId);
      
      if (isSelected && userId !== currentUser?.id) {
        // Can't remove yourself
        return {
          ...prev,
          teamMembers: currentMembers.filter(id => id !== userId)
        };
      } else if (!isSelected) {
        return {
          ...prev,
          teamMembers: [...currentMembers, userId]
        };
      }
      return prev;
    });
  };

  const generateProjectKey = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 4).toUpperCase();
    } else {
      return words.slice(0, 3).map(word => word.charAt(0)).join('').toUpperCase();
    }
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      key: prev.key || generateProjectKey(name)
    }));
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>새 프로젝트 생성</DialogTitle>
          <DialogDescription>
            새로운 프로젝트를 생성하고 팀원들과 함께 작업을 시작하세요.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="key">프로젝트 키 *</Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                placeholder="예: WEB"
                maxLength={10}
                required
                className="uppercase"
              />
              <p className="text-xs text-gray-500 mt-1">2-10자의 고유 식별자</p>
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="name">프로젝트 이름 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="프로젝트 이름을 입력하세요"
                required
              />
            </div>
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
              <Select value={formData.leadId} onValueChange={(value) => setFormData({ ...formData, leadId: value })}>
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
              <div className="border rounded-lg p-4 max-h-40 overflow-y-auto">
                <p className="text-sm text-gray-600 mb-3">사용 가능한 멤버</p>
                <div className="space-y-2">
                  {users.map(user => {
                    const isSelected = formData.teamMembers.includes(user.id);
                    const isCurrentUser = user.id === currentUser?.id;
                    
                    return (
                      <div key={user.id} className="flex items-center space-x-3">
                        <Checkbox 
                          id={user.id}
                          checked={isSelected}
                          onCheckedChange={() => handleTeamMemberToggle(user.id)}
                          disabled={isCurrentUser} // Can't unselect yourself
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {user.name}
                              {isCurrentUser && <span className="text-gray-500 ml-1">(나)</span>}
                            </p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
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
                  <span className="text-white font-bold text-sm">{formData.key || 'KEY'}</span>
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

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={!formData.key.trim() || !formData.name.trim()}>
              프로젝트 생성
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}