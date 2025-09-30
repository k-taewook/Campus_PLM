import { useState } from 'react';
import { 
  Users, 
  Settings, 
  UserPlus, 
  Shield, 
  Trash2, 
  Edit, 
  Crown,
  Check,
  X,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { useProjects, type Project, type ProjectMember } from '../contexts/ProjectContext';
import EditProjectDialog from './EditProjectDialog';

interface ProjectSettingsProps {
  projectId: string;
  onClose: () => void;
}

export default function ProjectSettings({ projectId, onClose }: ProjectSettingsProps) {
  const { 
    projects, 
    users, 
    currentUser,
    addProjectMember,
    removeProjectMember,
    updateMemberRole,
    updateMemberPermissions,
    canManageMembers,
    canEditProject,
    getProjectMember
  } = useProjects();

  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<ProjectMember['role']>('developer');
  const [editingPermissions, setEditingPermissions] = useState<string | null>(null);
  const [showEditProject, setShowEditProject] = useState(false);

  const project = projects.find(p => p.id === projectId);
  const canManage = canManageMembers(projectId);
  const canEdit = canEditProject(projectId);
  const currentMember = getProjectMember(projectId);

  const handleProjectDeleted = () => {
    onClose();
  };

  if (!project || !currentUser) {
    return null;
  }

  const handleAddMember = () => {
    const user = users.find(u => u.email === newMemberEmail.trim());
    if (user && !project.members.some(m => m.userId === user.id)) {
      addProjectMember(projectId, user.id, newMemberRole);
      setNewMemberEmail('');
      setNewMemberRole('developer');
      setShowAddMember(false);
    }
  };

  const handleRemoveMember = (userId: string) => {
    if (window.confirm('정말로 이 멤버를 프로젝트에서 제거하시겠습니까?')) {
      removeProjectMember(projectId, userId);
    }
  };

  const handleRoleChange = (userId: string, newRole: ProjectMember['role']) => {
    updateMemberRole(projectId, userId, newRole);
  };

  const handlePermissionChange = (userId: string, permission: keyof ProjectMember['permissions'], value: boolean) => {
    updateMemberPermissions(projectId, userId, { [permission]: value });
  };

  const getRoleColor = (role: ProjectMember['role']) => {
    switch (role) {
      case 'lead': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'developer': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'designer': return 'bg-green-100 text-green-800 border-green-200';
      case 'tester': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: ProjectMember['role']) => {
    switch (role) {
      case 'lead': return Crown;
      case 'admin': return Shield;
      default: return Users;
    }
  };

  const getRoleName = (role: ProjectMember['role']) => {
    switch (role) {
      case 'lead': return '리드';
      case 'admin': return '관리자';
      case 'developer': return '개발자';
      case 'designer': return '디자이너';
      case 'tester': return '테스터';
      case 'viewer': return '뷰어';
      default: return role;
    }
  };

  const getPermissionLabel = (key: keyof ProjectMember['permissions']) => {
    switch (key) {
      case 'canEditProject': return '프로젝트 편집';
      case 'canManageMembers': return '멤버 관리';
      case 'canCreateTasks': return '태스크 생성';
      case 'canEditAllTasks': return '모든 태스크 편집';
      case 'canDeleteTasks': return '태스크 삭제';
      case 'canManageSettings': return '설정 관리';
      case 'canViewReports': return '리포트 조회';
      default: return key;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">프로젝트 설정</h2>
          <p className="text-gray-600">{project.name} ({project.key})</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          <X className="w-4 h-4 mr-2" />
          닫기
        </Button>
      </div>

      {/* Members Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                프로젝트 멤버
              </CardTitle>
              <CardDescription>
                프로젝트에 참여하는 멤버들의 역할과 권한을 관리합니다.
              </CardDescription>
            </div>
            {canManage && (
              <Button onClick={() => setShowAddMember(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                멤버 추가
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {project.members.map(member => {
            const user = users.find(u => u.id === member.userId);
            if (!user) return null;
            
            const RoleIcon = getRoleIcon(member.role);
            const isLead = member.role === 'lead';
            const canEditMember = canManage && !isLead;
            const isEditingPerms = editingPermissions === member.userId;
            
            return (
              <div key={member.userId} className="border rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{user.name}</h4>
                      <Badge className={getRoleColor(member.role)}>
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {getRoleName(member.role)}
                      </Badge>
                      {isLead && (
                        <Badge variant="outline" className="border-purple-200 text-purple-700">
                          프로젝트 리드
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <p>{user.email}</p>
                      <p>참여일: {new Date(member.joinedAt).toLocaleDateString('ko-KR')}</p>
                    </div>

                    {/* Role Change */}
                    {canEditMember && (
                      <div className="mb-3">
                        <Label className="text-sm">역할</Label>
                        <Select 
                          value={member.role} 
                          onValueChange={(value: ProjectMember['role']) => handleRoleChange(member.userId, value)}
                        >
                          <SelectTrigger className="w-48 mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">관리자</SelectItem>
                            <SelectItem value="developer">개발자</SelectItem>
                            <SelectItem value="designer">디자이너</SelectItem>
                            <SelectItem value="tester">테스터</SelectItem>
                            <SelectItem value="viewer">뷰어</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Permissions */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">권한</Label>
                        {canEditMember && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingPermissions(isEditingPerms ? null : member.userId)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            {isEditingPerms ? '완료' : '수정'}
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(member.permissions).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`${member.userId}-${key}`}
                              checked={value}
                              disabled={!isEditingPerms || isLead}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(member.userId, key as keyof ProjectMember['permissions'], !!checked)
                              }
                            />
                            <Label 
                              htmlFor={`${member.userId}-${key}`}
                              className="text-sm cursor-pointer"
                            >
                              {getPermissionLabel(key as keyof ProjectMember['permissions'])}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {canEditMember && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => setEditingPermissions(member.userId)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            권한 수정
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleRemoveMember(member.userId)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            멤버 제거
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>멤버 추가</DialogTitle>
            <DialogDescription>
              프로젝트에 새로운 멤버를 추가합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="member-email">이메일 주소</Label>
              <Select value={newMemberEmail} onValueChange={setNewMemberEmail}>
                <SelectTrigger>
                  <SelectValue placeholder="멤버 선택" />
                </SelectTrigger>
                <SelectContent>
                  {users
                    .filter(user => !project.members.some(m => m.userId === user.id))
                    .map(user => (
                      <SelectItem key={user.id} value={user.email}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="member-role">역할</Label>
              <Select value={newMemberRole} onValueChange={(value: any) => setNewMemberRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">관리자</SelectItem>
                  <SelectItem value="developer">개발자</SelectItem>
                  <SelectItem value="designer">디자이너</SelectItem>
                  <SelectItem value="tester">테스터</SelectItem>
                  <SelectItem value="viewer">뷰어</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddMember(false)}>
                취소
              </Button>
              <Button 
                onClick={handleAddMember}
                disabled={!newMemberEmail.trim()}
              >
                멤버 추가
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Project Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                프로젝트 설정
              </CardTitle>
              <CardDescription>
                프로젝트의 기본 설정을 관리합니다.
              </CardDescription>
            </div>
            {canEdit && (
              <Button
                variant="outline"
                onClick={() => setShowEditProject(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                프로젝트 편집
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>프로젝트 키</Label>
              <Input value={project.key} disabled />
            </div>
            <div>
              <Label>프로젝트 상태</Label>
              <Input value={project.status} disabled />
            </div>
          </div>
          
          <div>
            <Label>프로젝트 설명</Label>
            <Input value={project.description} disabled />
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium">프로젝트 기능</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="allow-comments" 
                  checked={project.settings.allowComments}
                  disabled={!canManage}
                />
                <Label htmlFor="allow-comments">댓글 허용</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="allow-uploads" 
                  checked={project.settings.allowFileUploads}
                  disabled={!canManage}
                />
                <Label htmlFor="allow-uploads">파일 업로드 허용</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="require-approval" 
                  checked={project.settings.requireApproval}
                  disabled={!canManage}
                />
                <Label htmlFor="require-approval">변경사항 승인 필요</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="notify-updates" 
                  checked={project.settings.notifyOnUpdates}
                  disabled={!canManage}
                />
                <Label htmlFor="notify-updates">업데이트 알림</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Member Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>멤버 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {project.members.length}
              </div>
              <div className="text-sm text-gray-600">총 멤버</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {project.members.filter(m => m.permissions.canCreateTasks).length}
              </div>
              <div className="text-sm text-gray-600">태스크 생성 가능</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {project.members.filter(m => m.permissions.canManageMembers).length}
              </div>
              <div className="text-sm text-gray-600">멤버 관리 가능</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Project Dialog */}
      <EditProjectDialog
        open={showEditProject}
        onOpenChange={setShowEditProject}
        project={project}
        onProjectDeleted={handleProjectDeleted}
      />
    </div>
  );
}