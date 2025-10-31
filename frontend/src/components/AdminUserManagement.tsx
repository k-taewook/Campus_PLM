import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Shield, 
  UserX, 
  UserCheck,
  Activity,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Eye,
  Settings,
  Download,
  Upload,
  Ban,
  Unlock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useProjects } from '../contexts/ProjectContext';
import UserProfile from './UserProfile';
import { plmApi } from '../services/api';

interface AdminUserManagementProps {
  // No props needed
}

export default function AdminUserManagement() {
  const { 
    currentUser, 
    users, 
    projects, 
    activities,
    updateMemberRole, 
    reloadUsers
  } = useProjects();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // 새 사용자 폼
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VIEWER' as 'ADMIN' | 'MANAGER' | 'DEVELOPER' | 'DESIGNER' | 'TESTER' | 'VIEWER',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  });

  // 편집 중인 사용자 폼
  const [editingUser, setEditingUser] = useState({
    id: '',
    name: '',
    email: '',
    role: 'VIEWER' as 'ADMIN' | 'MANAGER' | 'DEVELOPER' | 'DESIGNER' | 'TESTER' | 'VIEWER',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  });

  const ROLE_OPTIONS: Array<'ADMIN' | 'MANAGER' | 'DEVELOPER' | 'DESIGNER' | 'TESTER' | 'VIEWER'> = [
    'ADMIN', 'MANAGER', 'DEVELOPER', 'DESIGNER', 'TESTER', 'VIEWER'
  ];

  // 권한 확인
  const isAdmin = (currentUser?.role || '').toUpperCase() === 'ADMIN';
  const canManageUsers = isAdmin;

  if (!canManageUsers) {
    return (
      <div className="flex-1 p-8 bg-background">
        <div className="text-center py-12">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="mb-2">접근 권한이 없습니다</h3>
          <p className="text-muted-foreground mb-6">
            이 페이지에 접근하려면 관리자 권한이 필요합니다.
          </p>
        </div>
      </div>
    );
  }

  // 사용자 통계 계산
  const userStats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.lastActive && 
      new Date(u.lastActive) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const managerUsers = users.filter(u => u.role === 'manager').length;
    const memberUsers = users.filter(u => u.role === 'member').length;
    const recentJoins = users.filter(u => u.createdAt && 
      new Date(u.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      managerUsers,
      memberUsers,
      recentJoins,
      inactiveUsers: totalUsers - activeUsers
    };
  }, [users]);

  // 사용자 필터링 및 정렬
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && user.lastActive && 
         new Date(user.lastActive) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
        (statusFilter === 'inactive' && (!user.lastActive || 
         new Date(user.lastActive) <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));
      
      return matchesSearch && matchesRole && matchesStatus;
    });

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'email':
          return a.email.localeCompare(b.email);
        case 'role':
          return a.role.localeCompare(b.role);
        case 'lastActive':
          return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [users, searchTerm, roleFilter, statusFilter, sortBy]);

  // 개별 사용자 통계
  const getUserStats = (userId: string) => {
    const userProjects = projects.filter(p => p.members.some(m => m.userId === userId));
    const userTasks = projects.flatMap(p => p.tasks).filter(t => t.assigneeId === userId);
    const userActivities = activities.filter(a => a.userId === userId);
    const completedTasks = userTasks.filter(t => t.status === 'done');

    return {
      projectCount: userProjects.length,
      taskCount: userTasks.length,
      completedTaskCount: completedTasks.length,
      activityCount: userActivities.length,
      completionRate: userTasks.length > 0 ? Math.round((completedTasks.length / userTasks.length) * 100) : 0
    };
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return Shield;
      case 'MANAGER': return Users;
      case 'DEVELOPER': return Users;
      case 'DESIGNER': return Users;
      case 'TESTER': return Users;
      case 'VIEWER': return Users;
      default: return Users;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'MANAGER': return 'bg-blue-100 text-blue-800';
      case 'DEVELOPER': return 'bg-emerald-100 text-emerald-800';
      case 'DESIGNER': return 'bg-pink-100 text-pink-800';
      case 'TESTER': return 'bg-yellow-100 text-yellow-800';
      case 'VIEWER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return '관리자';
      case 'MANAGER': return '매니저';
      case 'DEVELOPER': return '개발자';
      case 'DESIGNER': return '디자이너';
      case 'TESTER': return '테스터';
      case 'VIEWER': return '뷰어';
      default: return role;
    }
  };

  const getStatusColor = (user: any) => {
    if (!user.lastActive) return 'bg-gray-100 text-gray-800';
    
    const lastActive = new Date(user.lastActive);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays <= 1) return 'bg-green-100 text-green-800';
    if (diffInDays <= 7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusLabel = (user: any) => {
    if (!user.lastActive) return '비활성';
    
    const lastActive = new Date(user.lastActive);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays <= 1) return '활성';
    if (diffInDays <= 7) return '최근 활동';
    return '비���성';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '방금 전';
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)}일 전`;
    return `${Math.floor(diffInHours / (24 * 7))}주 전`;
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email) return;
    const passwordToUse = newUser.password && newUser.password.length >= 8 ? newUser.password : 'Temp1234!';
    try {
      // 1) 회원 등록 (비밀번호 포함)
      const created = await plmApi.registerUser({
        email: newUser.email,
        password: passwordToUse,
        fullName: newUser.name,
      });
      // 2) 선택한 역할로 업데이트 (기본 VIEWER가 아닐 때)
      if (newUser.role && newUser.role !== 'VIEWER') {
        await plmApi.updateUser(Number(created.id), { role: newUser.role } as any);
      }
      await reloadUsers();
    } catch (e) {
      console.error('사용자 생성 실패', e);
    } finally {
      setNewUser({ name: '', email: '', password: '', role: 'VIEWER', status: 'ACTIVE' });
      setShowCreateDialog(false);
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: (user.dbRole || (typeof user.role === 'string' ? user.role.toUpperCase() : 'VIEWER')) as typeof editingUser.role,
      status: getStatusLabel(user) === '활성' ? 'ACTIVE' : 'INACTIVE'
    });
    setShowEditDialog(true);
  };

  const handleUpdateUser = async () => {
    try {
      await plmApi.updateUser(Number(editingUser.id), {
        fullName: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
      } as any);
      await reloadUsers();
    } catch (e) {
      console.error('사용자 정보 업데이트 실패', e);
    } finally {
      setShowEditDialog(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await plmApi.deleteUser(Number(userId));
      await reloadUsers();
    } catch (e) {
      console.error('사용자 삭제 실패', e);
    }
  };

  const handleRoleChange = async (userId: string, newRole: typeof ROLE_OPTIONS[number]) => {
    try {
      await plmApi.updateUser(Number(userId), { role: newRole } as any);
    } catch (e) {
      console.error('역할 변경 실패', e);
    }
  };

  const handleViewProfile = (userId: string) => {
    setSelectedUserId(userId);
    setShowUserProfile(true);
  };

  if (showUserProfile && selectedUserId) {
    return (
      <UserProfile 
        userId={selectedUserId}
      />
    );
  }

  return (
    <div className="flex-1 p-8 bg-background overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div>
            <h1>사용자 관리</h1>
            <p className="text-muted-foreground">
              시스템의 모든 사용자를 관리하고 모니터링하세요
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            내보내기
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                사용자 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 사용자 추가</DialogTitle>
                <DialogDescription>
                  새로운 사용자를 시스템에 등록합니다.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="userName">이름</Label>
                  <Input
                    id="userName"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="사용자 이름을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="userEmail">이메일</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="이메일 주소를 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="userPassword">임시 비밀번호</Label>
                  <Input
                    id="userPassword"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="(선택) 최소 8자, 미입력 시 Temp1234! 사용"
                  />
                </div>
                <div>
                  <Label htmlFor="userRole">역할</Label>
                  <Select 
                    value={newUser.role} 
                    onValueChange={(value: any) => setNewUser({...newUser, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((r) => (
                        <SelectItem key={r} value={r}>{getRoleLabel(r)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    취소
                  </Button>
                  <Button onClick={handleCreateUser}>
                    추가
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">전체 사용자</p>
                <p className="text-2xl">{userStats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">활성 사용자</p>
                <p className="text-2xl">{userStats.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">관리자</p>
                <p className="text-2xl">{userStats.adminUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">신규 가입</p>
                <p className="text-2xl">{userStats.recentJoins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">사용자 목록</TabsTrigger>
          <TabsTrigger value="analytics">분석</TabsTrigger>
          <TabsTrigger value="settings">설정</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="이름 또는 이메일로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="역할" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 역할</SelectItem>
                      <SelectItem value="admin">관리자</SelectItem>
                      <SelectItem value="manager">매니저</SelectItem>
                      <SelectItem value="member">멤버</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="상태" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 상태</SelectItem>
                      <SelectItem value="active">활성</SelectItem>
                      <SelectItem value="inactive">비활성</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="정렬" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">이름순</SelectItem>
                      <SelectItem value="email">이메일순</SelectItem>
                      <SelectItem value="role">역할순</SelectItem>
                      <SelectItem value="lastActive">최근 활동순</SelectItem>
                      <SelectItem value="createdAt">가입일순</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>사용자 목록</CardTitle>
              <CardDescription>
                총 {filteredAndSortedUsers.length}명의 사용자가 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사용자</TableHead>
                    <TableHead>역할</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>프로젝트</TableHead>
                    <TableHead>완료율</TableHead>
                    <TableHead>최근 활동</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedUsers.map((user: any) => {
                    const userStats = getUserStats(user.id);
                    const roleForBadge = (user.dbRole || (user.role || '').toUpperCase());
                    const RoleIcon = getRoleIcon(roleForBadge);
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(roleForBadge)}>
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {getRoleLabel(roleForBadge)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user)}>
                            {getStatusLabel(user)}
                          </Badge>
                        </TableCell>
                        <TableCell>{userStats.projectCount}</TableCell>
                        <TableCell>{userStats.completionRate}%</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {getTimeSince(user.lastActive)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewProfile(user.id)}>
                                <Eye className="w-4 h-4 mr-2" />
                                프로필 보기
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                정보 수정
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    사용자 삭제
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>사용자 삭제 확인</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      '{user.name}' 사용자를 정말 삭제하시겠습니까? 
                                      이 작업은 되돌릴 수 없습니다.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>취소</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      삭제
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>사용자 활동 통계</CardTitle>
                <CardDescription>역할별 사용자 분포</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>관리자</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500"
                          style={{ width: `${(userStats.adminUsers / userStats.totalUsers) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm">{userStats.adminUsers}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>매니저</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500"
                          style={{ width: `${(userStats.managerUsers / userStats.totalUsers) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm">{userStats.managerUsers}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>멤버</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gray-500"
                          style={{ width: `${(userStats.memberUsers / userStats.totalUsers) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm">{userStats.memberUsers}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle>활동 요약</CardTitle>
                <CardDescription>최근 30일 사용자 활동</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>활성 사용자</span>
                    <span className="text-green-600">{userStats.activeUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>비활성 사용자</span>
                    <span className="text-red-600">{userStats.inactiveUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>신규 가입</span>
                    <span className="text-blue-600">{userStats.recentJoins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>전체 프로젝트</span>
                    <span>{projects.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>전체 활동</span>
                    <span>{activities.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>사용자 관리 설정</CardTitle>
              <CardDescription>시스템 사용자 관리 정책을 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>자동 계정 비활성화</Label>
                    <p className="text-sm text-muted-foreground">30일 미접속 시 자동으로 계정을 비활성화합니다</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>신규 사용자 승인</Label>
                    <p className="text-sm text-muted-foreground">신규 가입 시 관리자 승인을 요구합니다</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>이메일 알림</Label>
                    <p className="text-sm text-muted-foreground">사용자 관련 이벤트 시 이메일 알림을 발송합니다</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button>설정 저장</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자 정보 수정</DialogTitle>
            <DialogDescription>
              사용자의 기본 정보를 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editName">이름</Label>
              <Input
                id="editName"
                value={editingUser.name}
                onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="editEmail">이메일</Label>
              <Input
                id="editEmail"
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="editRole">역할</Label>
              <Select 
                value={editingUser.role} 
                onValueChange={(value: any) => setEditingUser({...editingUser, role: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>{getRoleLabel(r)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                취소
              </Button>
              <Button onClick={handleUpdateUser}>
                저장
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}