import { useEffect, useState } from 'react';
import { Plus, Users, UserPlus, Crown, User, Mail, Calendar, MoreHorizontal, Pencil, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from './ui/dropdown-menu';
import { useAuth } from '../contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { plmApi, type Team, type TeamMember, type User as ApiUser } from '../services/api';

interface TeamManagementProps {
  isCompact: boolean;
}

export default function TeamManagement({ isCompact }: TeamManagementProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<TeamMember[]>([]);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    color: 'bg-blue-100'
  });
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editTeam, setEditTeam] = useState<{ name: string; description: string }>({ name: '', description: '' });
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'>('ALL');
  const [sortBy, setSortBy] = useState<'NAME' | 'ROLE'>('NAME');
  const [defaultRole, setDefaultRole] = useState<'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER');
  const [userRoles, setUserRoles] = useState<Record<number, 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'>>({});
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [editMemberSearchQuery, setEditMemberSearchQuery] = useState('');
  const [editSelectedMembers, setEditSelectedMembers] = useState<number[]>([]);
  const [editUserRoles, setEditUserRoles] = useState<Record<number, 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'>>({});
  const [teamOwnerships, setTeamOwnerships] = useState<Record<number, boolean>>({});
  const { user: authUser } = useAuth();
  
  // 권한 체크 함수들을 컴포넌트 최상단에서 호출
  const { isAdmin, isLeader, isMember } = useAuth();
  const isSystemAdmin = isAdmin();
  const isSystemLeader = isLeader();
  const isSystemMember = isMember();

  const refreshTeams = async () => {
    const data = await plmApi.getTeams();
    setTeams(data);
    
    // 각 팀에 대한 소유권 확인
    if (authUser && isSystemLeader) {
      const ownerships: Record<number, boolean> = {};
      for (const team of data) {
        const members = await plmApi.getTeamMembers(team.id);
        ownerships[team.id] = members.some(m => m.userId === authUser.id && m.role === 'OWNER');
      }
      setTeamOwnerships(ownerships);
    }
  };

  const refreshUsers = async () => {
    const data = await plmApi.getUsers();
    setUsers(data);
  };

  const loadTeamMembers = async (teamId: number) => {
    const members = await plmApi.getTeamMembers(teamId);
    setSelectedTeamMembers(members);
  };

  useEffect(() => {
    refreshTeams();
    refreshUsers();
  }, []);

  // 팀 생성 다이얼로그가 열릴 때 LEADER는 자동으로 본인을 선택 상태로 설정
  useEffect(() => {
    if (showCreateDialog && isSystemLeader && authUser) {
      if (!selectedMembers.includes(authUser.id)) {
        setSelectedMembers(prev => [...prev, authUser.id]);
        setUserRoles(prev => ({ ...prev, [authUser.id]: 'OWNER' }));
      }
    }
  }, [showCreateDialog, isSystemLeader, authUser]);

  useEffect(() => {
    if (selectedTeam) {
      const t = teams.find(t => t.id === selectedTeam);
      if (t) setEditTeam({ name: t.name, description: t.description || '' });
      loadTeamMembers(selectedTeam);
    }
  }, [selectedTeam, teams]);

  useEffect(() => {
    if (showEditDialog && selectedTeam) {
      // 팀 수정 다이얼로그가 열릴 때 기존 멤버를 선택된 상태로 설정
      const memberIds = selectedTeamMembers.map(m => m.userId);
      setEditSelectedMembers(memberIds);
      const roles: Record<number, 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'> = {};
      selectedTeamMembers.forEach(m => {
        roles[m.userId] = m.role as 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
      });
      setEditUserRoles(roles);
    }
  }, [showEditDialog, selectedTeam, selectedTeamMembers]);

  const handleCreateTeam = async () => {
    if (!newTeam.name || !authUser) return;
    const created = await plmApi.createTeam({ name: newTeam.name, description: newTeam.description });
    
    // 팀 생성자를 OWNER로 자동 추가
    await plmApi.addTeamMember(created.id, authUser.id, 'OWNER');
    
    // 추가 선택된 멤버들 추가
    if (selectedMembers.length > 0) {
      for (const uid of selectedMembers) {
        // 생성자가 선택된 멤버에 포함되어 있으면 건너뛰기
        if (uid === authUser.id) continue;
        const role = userRoles[uid] || defaultRole || 'MEMBER';
        await plmApi.addTeamMember(created.id, uid, role);
      }
    }
    await refreshTeams();
    setNewTeam({ name: '', description: '', color: 'bg-blue-100' });
    setSelectedMembers([]);
    setUserRoles({});
    setUserSearchQuery('');
    setShowCreateDialog(false);
  };

  const handleMemberToggle = (userId: number) => {
    // LEADER가 팀 생성 시 본인을 제거할 수 없도록 방지
    if (isSystemLeader && authUser && userId === authUser.id) {
      return; // 본인은 제거 불가
    }
    
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
    setUserRoles(prev => {
      const next = { ...prev } as Record<number, any>;
      if (next[userId]) delete next[userId];
      else next[userId] = defaultRole;
      return next;
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return Crown;
      case 'admin': return UserPlus;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'member': return 'bg-gray-100 text-gray-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const colorOptions = [
    { value: 'bg-blue-100', label: '파란색', color: 'bg-blue-100' },
    { value: 'bg-green-100', label: '초록색', color: 'bg-green-100' },
    { value: 'bg-purple-100', label: '보라색', color: 'bg-purple-100' },
    { value: 'bg-orange-100', label: '주황색', color: 'bg-orange-100' },
    { value: 'bg-pink-100', label: '핑크색', color: 'bg-pink-100' },
  ];

  const selectedTeamData = teams.find(t => t.id === selectedTeam);
  const currentTeamRole = selectedTeamMembers.find(m => m.userId === authUser?.id)?.role as ('OWNER'|'ADMIN'|'MEMBER'|'VIEWER'|undefined);
  
  // 팀 소유권 확인: LEADER는 자신이 OWNER인 팀만 수정/삭제 가능
  const isTeamOwner = selectedTeamData && authUser ? 
    selectedTeamMembers.find(m => m.userId === authUser.id && m.role === 'OWNER') !== undefined : false;
  
  // 팀 관리 권한: ADMIN은 모든 팀, LEADER는 자신의 팀만
  const canManageTeam = isSystemAdmin || (isSystemLeader && isTeamOwner) || currentTeamRole === 'ADMIN';
  
  // 팀 생성 권한: ADMIN과 LEADER만 가능
  const canCreateTeam = isSystemAdmin || isSystemLeader;

  if (selectedTeam && selectedTeamData) {
    return (
      <div className="flex-1 p-8 bg-background">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => setSelectedTeam(null)}
              className="mb-2"
            >
              ← 팀 목록으로
            </Button>
            <h1 className="mb-2 text-2xl font-bold">{selectedTeamData.name}</h1>
            <p className="text-muted-foreground text-sm">{selectedTeamData.description}</p>
          </div>
          <Badge className={`bg-blue-100 text-gray-800`}>
            {selectedTeamMembers.length}명
          </Badge>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {canManageTeam && (
            <>
              <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Pencil className="w-4 h-4" />
                    팀 수정
                  </Button>
                </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>팀 정보 수정</DialogTitle>
                <DialogDescription>팀 이름, 설명 및 멤버를 수정할 수 있습니다.</DialogDescription>
              </DialogHeader>
              <div className="overflow-y-auto flex-1 space-y-4 p-1">
                <div>
                  <Label htmlFor="editTeamName">팀 이름</Label>
                  <Input id="editTeamName" value={editTeam.name} onChange={(e) => setEditTeam({ ...editTeam, name: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="editTeamDesc">팀 설명</Label>
                  <Textarea id="editTeamDesc" value={editTeam.description} onChange={(e) => setEditTeam({ ...editTeam, description: e.target.value })} />
                </div>

                {/* 팀 멤버 관리 */}
                <div>
                  <Label>팀 멤버 관리</Label>
                  {/* 사용자 검색 */}
                  <div className="relative mt-2 mb-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="이름 또는 이메일로 검색..."
                      value={editMemberSearchQuery}
                      onChange={(e) => setEditMemberSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                    {users
                      .filter(user => {
                        const query = editMemberSearchQuery.toLowerCase();
                        return (user.fullName?.toLowerCase().includes(query) || 
                                user.username?.toLowerCase().includes(query) || 
                                user.email?.toLowerCase().includes(query));
                      })
                      .map((user) => {
                        const checked = editSelectedMembers.includes(user.id);
                        const assignedRole = editUserRoles[user.id] || 'MEMBER';
                        const RoleIcon = getRoleIcon(assignedRole.toLowerCase());
                        return (
                          <div key={user.id} className="flex items-center gap-3">
                            <Checkbox 
                              id={`edit-${user.id}`}
                              checked={checked}
                              onCheckedChange={() => {
                                setEditSelectedMembers(prev => 
                                  prev.includes(user.id) 
                                    ? prev.filter(id => id !== user.id)
                                    : [...prev, user.id]
                                );
                                if (!checked) {
                                  setEditUserRoles(prev => ({ ...prev, [user.id]: 'MEMBER' }));
                                }
                              }}
                            />
                            <div className="flex items-center gap-2 flex-1">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                  {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{user.fullName || user.username}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Select 
                                disabled={!checked} 
                                value={assignedRole} 
                                onValueChange={(v: string) => setEditUserRoles(prev => ({ ...prev, [user.id]: v as any }))}
                              >
                                <SelectTrigger className="w-28 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="OWNER">OWNER</SelectItem>
                                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                                  <SelectItem value="MEMBER">MEMBER</SelectItem>
                                  <SelectItem value="VIEWER">VIEWER</SelectItem>
                                </SelectContent>
                              </Select>
                              <Badge className={getRoleColor(assignedRole.toLowerCase())}>
                                <RoleIcon className="w-3 h-3 mr-1" />
                                {assignedRole}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>취소</Button>
                <Button onClick={async () => {
                  if (!selectedTeam) return;
                  
                  // 팀 정보 업데이트
                  await plmApi.updateTeam(selectedTeam, { name: editTeam.name, description: editTeam.description });
                  
                  // 기존 멤버와 새로운 멤버 비교
                  const currentMemberIds = selectedTeamMembers.map(m => m.userId);
                  const newMemberIds = editSelectedMembers;
                  
                  // 삭제할 멤버 (기존에 있었지만 새로운 선택에 없는 멤버)
                  const toRemove = currentMemberIds.filter(id => !newMemberIds.includes(id));
                  for (const userId of toRemove) {
                    await plmApi.removeTeamMember(selectedTeam, userId);
                  }
                  
                  // 추가할 멤버 (새로운 선택에 있지만 기존에 없던 멤버)
                  const toAdd = newMemberIds.filter(id => !currentMemberIds.includes(id));
                  for (const userId of toAdd) {
                    const role = editUserRoles[userId] || 'MEMBER';
                    await plmApi.addTeamMember(selectedTeam, userId, role);
                  }
                  
                  // 역할 변경 (기존 멤버 중 역할이 변경된 경우)
                  for (const userId of newMemberIds.filter(id => currentMemberIds.includes(id))) {
                    const currentRole = selectedTeamMembers.find(m => m.userId === userId)?.role;
                    const newRole = editUserRoles[userId];
                    if (currentRole && newRole && currentRole !== newRole) {
                      await plmApi.updateMemberRole(selectedTeam, userId, newRole);
                    }
                  }
                  
                  await refreshTeams();
                  await loadTeamMembers(selectedTeam);
                  setShowEditDialog(false);
                }}>저장</Button>
              </div>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                삭제
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>이 팀을 삭제하시겠습니까?</AlertDialogTitle>
                <AlertDialogDescription>
                  팀을 삭제하면 관련 멤버 연결도 제거됩니다. 이 작업은 되돌릴 수 없습니다.
                  현재 프로젝트와 팀은 데이터 모델상 직접 연결되어 있지 않지만,
                  향후 연결 시 팀 삭제가 관련 프로젝트에 영향을 줄 수 있습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction onClick={async () => {
                  if (!selectedTeam) return;
                  await plmApi.deleteTeam(selectedTeam);
                  await refreshTeams();
                  setSelectedTeam(null);
                }}>삭제</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
            </>
          )}
        </div>

        {/* 필터/정렬 */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm">역할</Label>
            <Select onValueChange={(v: string) => setRoleFilter(v as any)} defaultValue={roleFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="역할 필터" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="OWNER">OWNER</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
                <SelectItem value="MEMBER">MEMBER</SelectItem>
                <SelectItem value="VIEWER">VIEWER</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm">정렬</Label>
            <Select onValueChange={(v: string) => setSortBy(v as any)} defaultValue={sortBy}>
              <SelectTrigger className="w-32"><SelectValue placeholder="정렬" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NAME">이름</SelectItem>
                <SelectItem value="ROLE">역할</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedTeamMembers
            .filter(m => roleFilter === 'ALL' ? true : String(m.role) === roleFilter)
            .sort((a, b) => {
              if (sortBy === 'NAME') {
                const an = a.userFullName || a.username || '';
                const bn = b.userFullName || b.username || '';
                return an.localeCompare(bn);
              } else {
                const order = ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'];
                return order.indexOf(String(a.role)) - order.indexOf(String(b.role));
              }
            })
            .map((member) => {
            const roleKey = String(member.role).toLowerCase();
            const RoleIcon = getRoleIcon(roleKey);
            
            return (
              <Card key={member.id} className="transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {member.userFullName?.charAt(0) || member.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{member.userFullName || member.username}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRoleColor(roleKey)}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {member.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    {member.userEmail}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    가입일: {new Date(member.joinedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    역할: {member.role}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-background">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="mb-2">팀 관리</h1>
          <p className="text-muted-foreground">
            팀을 생성하고 멤버를 관리하세요
          </p>
        </div>
        
        {canCreateTeam && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                팀 생성
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>새 팀 생성</DialogTitle>
              <DialogDescription>
                새로운 팀을 생성하고 멤버를 초대하세요.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="teamName">팀 이름</Label>
                  <Input
                    id="teamName"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                    placeholder="팀 이름을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="teamColor">팀 색상</Label>
                  <Select onValueChange={(value: string) => setNewTeam({...newTeam, color: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="색상 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full ${option.color}`} />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="teamDescription">팀 설명</Label>
                <Textarea
                  id="teamDescription"
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
                  placeholder="팀 설명을 입력하세요"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>팀 멤버 선택</Label>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">기본 역할</Label>
                    <Select onValueChange={(v: string) => setDefaultRole(v as any)} defaultValue={defaultRole}>
                      <SelectTrigger className="w-32"><SelectValue placeholder="기본 역할" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OWNER">OWNER</SelectItem>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                        <SelectItem value="MEMBER">MEMBER</SelectItem>
                        <SelectItem value="VIEWER">VIEWER</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* 사용자 검색 */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="이름 또는 이메일로 검색..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                  {users
                    .filter(user => {
                      const query = userSearchQuery.toLowerCase();
                      return (user.fullName?.toLowerCase().includes(query) || 
                              user.username?.toLowerCase().includes(query) || 
                              user.email?.toLowerCase().includes(query));
                    })
                    .map((user) => {
                    const checked = selectedMembers.includes(user.id);
                    const assignedRole = userRoles[user.id] || defaultRole;
                    const RoleIcon = getRoleIcon(assignedRole.toLowerCase());
                    const isCurrentUser = authUser && user.id === authUser.id;
                    const isMandatory = isSystemLeader && isCurrentUser;
                    
                    return (
                      <div key={user.id} className="flex items-center gap-3">
                        <Checkbox 
                          id={String(user.id)}
                          checked={checked}
                          onCheckedChange={() => handleMemberToggle(user.id)}
                          disabled={isMandatory}
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {user.fullName?.charAt(0) || user.username.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="text-sm font-medium flex items-center gap-2">
                              {user.fullName || user.username}
                              {isMandatory && <Badge variant="outline" className="text-xs">필수</Badge>}
                            </div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select disabled={!checked} value={assignedRole} onValueChange={(v: string) => setUserRoles(prev => ({ ...prev, [user.id]: v as any }))}>
                            <SelectTrigger className="w-28 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="OWNER">OWNER</SelectItem>
                              <SelectItem value="ADMIN">ADMIN</SelectItem>
                              <SelectItem value="MEMBER">MEMBER</SelectItem>
                              <SelectItem value="VIEWER">VIEWER</SelectItem>
                            </SelectContent>
                          </Select>
                          <Badge className={getRoleColor(assignedRole.toLowerCase())}>
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {assignedRole}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  취소
                </Button>
                <Button onClick={handleCreateTeam}>
                  생성
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        )}
      </div>

      <div className={`
        grid gap-6 transition-all duration-300 ease-in-out
        ${isCompact 
          ? 'grid-cols-1 md:grid-cols-1 lg:grid-cols-2' 
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }
      `}>
        {teams.map((team) => {
          // 각 팀에 대한 권한 확인
          const canEditThisTeam = isSystemAdmin || (isSystemLeader && teamOwnerships[team.id]);
          
          return (
            <Card 
              key={team.id}
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
              onClick={async () => { setSelectedTeam(team.id); await loadTeamMembers(team.id); }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg bg-blue-100`}>
                      <Users className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {team.description}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-1" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={async () => { setSelectedTeam(team.id); await loadTeamMembers(team.id); }}>팀 보기</DropdownMenuItem>
                      {canEditThisTeam && (
                        <>
                          <DropdownMenuItem 
                            onClick={() => { setSelectedTeam(team.id); setEditTeam({ name: team.name, description: team.description || '' }); setShowEditDialog(true); }}
                          >
                            팀 수정
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600" 
                            onClick={async () => {
                              if (!confirm('이 팀을 삭제하시겠습니까?')) return;
                              await plmApi.deleteTeam(team.id);
                              await refreshTeams();
                            }}
                          >
                            삭제
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">멤버 수</span>
                  <Badge variant="secondary">{team.memberCount}명</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  생성일: {new Date(team.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="mb-2">팀이 없습니다</h3>
          <p className="text-muted-foreground mb-6">
            {canCreateTeam 
              ? '첫 번째 팀을 생성하여 협업을 시작해보세요.'
              : '현재 소속된 팀이 없습니다.'}
          </p>
          {canCreateTeam && (
            <Button onClick={() => setShowCreateDialog(true)}>
              팀 생성
            </Button>
          )}
        </div>
      )}
    </div>
  );
}