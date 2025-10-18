import { useState } from 'react';
import { Plus, Users, UserPlus, Crown, User, Mail, Calendar, MoreHorizontal } from 'lucide-react';
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
import { usePLM, type User as UserType } from '../contexts/PLMContext';

interface TeamManagementProps {
  isCompact: boolean;
}

export default function TeamManagement({ isCompact }: TeamManagementProps) {
  const { teams, users, currentUser, addTeam } = usePLM();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    color: 'bg-blue-100'
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const handleCreateTeam = () => {
    if (newTeam.name && selectedMembers.length > 0) {
      const teamMembers = users.filter(user => selectedMembers.includes(user.id));
      addTeam({
        ...newTeam,
        members: teamMembers,
        createdBy: currentUser.id
      });
      setNewTeam({
        name: '',
        description: '',
        color: 'bg-blue-100'
      });
      setSelectedMembers([]);
      setShowCreateDialog(false);
    }
  };

  const handleMemberToggle = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
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

  const colorOptions = [
    { value: 'bg-blue-100', label: '파란색', color: 'bg-blue-100' },
    { value: 'bg-green-100', label: '초록색', color: 'bg-green-100' },
    { value: 'bg-purple-100', label: '보라색', color: 'bg-purple-100' },
    { value: 'bg-orange-100', label: '주황색', color: 'bg-orange-100' },
    { value: 'bg-pink-100', label: '핑크색', color: 'bg-pink-100' },
  ];

  const selectedTeamData = teams.find(t => t.id === selectedTeam);

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
            <h1 className="mb-2">{selectedTeamData.name}</h1>
            <p className="text-muted-foreground">{selectedTeamData.description}</p>
          </div>
          <Badge className={`${selectedTeamData.color} text-gray-800`}>
            {selectedTeamData.members.length}명
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedTeamData.members.map((member) => {
            const RoleIcon = getRoleIcon(member.role);
            
            return (
              <Card key={member.id} className="transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRoleColor(member.role)}>
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
                    {member.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    가입일: {new Date(member.joinDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    최근 활동: {new Date(member.lastActive).toLocaleDateString()}
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
                  <Select onValueChange={(value) => setNewTeam({...newTeam, color: value})}>
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
                <Label>팀 멤버 선택</Label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                  {users.map((user) => {
                    const RoleIcon = getRoleIcon(user.role);
                    return (
                      <div key={user.id} className="flex items-center space-x-3">
                        <Checkbox 
                          id={user.id}
                          checked={selectedMembers.includes(user.id)}
                          onCheckedChange={() => handleMemberToggle(user.id)}
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                          <Badge className={getRoleColor(user.role)}>
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {user.role}
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
      </div>

      <div className={`
        grid gap-6 transition-all duration-300 ease-in-out
        ${isCompact 
          ? 'grid-cols-1 md:grid-cols-1 lg:grid-cols-2' 
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }
      `}>
        {teams.map((team) => {
          const creator = users.find(u => u.id === team.createdBy);
          
          return (
            <Card 
              key={team.id}
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
              onClick={() => setSelectedTeam(team.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${team.color}`}>
                      <Users className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {team.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">멤버 수</span>
                  <Badge variant="secondary">{team.members.length}명</Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  생성자: {creator?.name}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  생성일: {new Date(team.createdAt).toLocaleDateString()}
                </div>

                {/* 팀 멤버 아바타 미리보기 */}
                <div className="flex items-center gap-1">
                  {team.members.slice(0, 3).map((member) => (
                    <Avatar key={member.id} className="w-6 h-6">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {team.members.length > 3 && (
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xs text-gray-600">+{team.members.length - 3}</span>
                    </div>
                  )}
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
            첫 번째 팀을 생성하여 협업을 시작해보세요.
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            팀 생성
          </Button>
        </div>
      )}
    </div>
  );
}