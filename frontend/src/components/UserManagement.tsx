import { useState } from 'react';
import { Plus, User, Crown, UserPlus, Mail, Calendar, Clock, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { usePLM } from '../contexts/PLMContext';

interface UserManagementProps {
  isCompact: boolean;
}

export default function UserManagement({ isCompact }: UserManagementProps) {
  const { users, addUser } = usePLM();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'member' as 'admin' | 'manager' | 'member'
  });

  const handleCreateUser = () => {
    if (newUser.name && newUser.email) {
      addUser(newUser);
      setNewUser({
        name: '',
        email: '',
        role: 'member'
      });
      setShowCreateDialog(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Crown;
      case 'manager': return UserPlus;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return '관리자';
      case 'manager': return '매니저';
      default: return '멤버';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return '방금 전';
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}일 전`;
    } else {
      return `${Math.floor(diffInHours / (24 * 7))}주 전`;
    }
  };

  // 사용자 필터링
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // 역할별 통계
  const roleStats = {
    admin: users.filter(u => u.role === 'admin').length,
    manager: users.filter(u => u.role === 'manager').length,
    member: users.filter(u => u.role === 'member').length
  };

  return (
    <div className="flex-1 p-8 bg-background">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="mb-2">사용자 관리</h1>
          <p className="text-muted-foreground">
            시스템 사용자를 관리하고 권한을 설정하세요
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
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
                <Label htmlFor="userRole">역할</Label>
                <Select onValueChange={(value) => setNewUser({...newUser, role: value as any})}>
                  <SelectTrigger>
                    <SelectValue placeholder="역할을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">멤버</SelectItem>
                    <SelectItem value="manager">매니저</SelectItem>
                    <SelectItem value="admin">관리자</SelectItem>
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

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">전체 사용자</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">관리자</p>
                <p className="text-2xl font-bold">{roleStats.admin}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">매니저</p>
                <p className="text-2xl font-bold">{roleStats.manager}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-muted-foreground">멤버</p>
                <p className="text-2xl font-bold">{roleStats.member}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="이름 또는 이메일로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 역할</SelectItem>
            <SelectItem value="admin">관리자</SelectItem>
            <SelectItem value="manager">매니저</SelectItem>
            <SelectItem value="member">멤버</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 사용자 목록 */}
      <div className={`
        grid gap-6 transition-all duration-300 ease-in-out
        ${isCompact 
          ? 'grid-cols-1 md:grid-cols-1 lg:grid-cols-2' 
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }
      `}>
        {filteredUsers.map((user) => {
          const RoleIcon = getRoleIcon(user.role);
          
          return (
            <Card 
              key={user.id}
              className="transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getRoleColor(user.role)}>
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {getRoleLabel(user.role)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  가입일: {formatDate(user.joinDate)}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  최근 활동: {getTimeSince(user.lastActive)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="mb-2">
            {searchTerm || roleFilter !== 'all' 
              ? '검색 결과가 없습니다' 
              : '사용자가 없습니다'
            }
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm || roleFilter !== 'all'
              ? '다른 검색어나 필터를 시도해보세요.'
              : '첫 번째 사용자를 추가해보세요.'
            }
          </p>
          {!searchTerm && roleFilter === 'all' && (
            <Button onClick={() => setShowCreateDialog(true)}>
              사용자 추가
            </Button>
          )}
        </div>
      )}
    </div>
  );
}