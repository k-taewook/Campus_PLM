import React, { useState, useMemo } from 'react';
import { 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  Mail, 
  Shield, 
  Activity, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  PlayCircle,
  Edit2,
  Settings,
  Award,
  Target,
  FileText,
  Users,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useProjects } from '../contexts/ProjectContext';

interface UserProfileProps {
  userId?: string; // If not provided, shows current user's profile
}

export default function UserProfile({ userId }: UserProfileProps) {
  const { 
    currentUser, 
    users, 
    projects, 
    activities,
    getMyProjects,
    getAssignedTasks
  } = useProjects();
  
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    bio: ''
  });

  // 표시할 사용자 결정 (userId가 있으면 해당 사용자, 없으면 현재 사용자)
  const displayUser = userId ? users.find(u => u.id === userId) : currentUser;
  const isOwnProfile = !userId || userId === currentUser?.id;

  if (!displayUser) {
    return (
      <div className="flex-1 p-8 bg-background">
        <div className="text-center py-12">
          <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="mb-2">사용자를 찾을 수 없습니다</h3>
          <p className="text-muted-foreground mb-6">
            요청한 사용자 정보를 찾을 수 없습니다.
          </p>
        </div>
      </div>
    );
  }

  // 사용자 관련 통계 계산
  const userStats = useMemo(() => {
    const userProjects = projects.filter(p => 
      p.members.some(m => m.userId === displayUser.id)
    );
    
    const userTasks = projects.flatMap(p => p.tasks).filter(t => 
      t.assigneeId === displayUser.id
    );
    
    const completedTasks = userTasks.filter(t => t.status === 'done');
    const inProgressTasks = userTasks.filter(t => t.status === 'in-progress');
    const userActivities = activities.filter(a => a.userId === displayUser.id);
    
    const totalLoggedHours = userTasks.reduce((sum, task) => sum + task.loggedHours, 0);
    const totalEstimatedHours = userTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
    
    return {
      totalProjects: userProjects.length,
      totalTasks: userTasks.length,
      completedTasks: completedTasks.length,
      inProgressTasks: inProgressTasks.length,
      completionRate: userTasks.length > 0 ? Math.round((completedTasks.length / userTasks.length) * 100) : 0,
      totalActivities: userActivities.length,
      totalLoggedHours,
      totalEstimatedHours,
      efficiency: totalEstimatedHours > 0 ? Math.round((totalLoggedHours / totalEstimatedHours) * 100) : 100
    };
  }, [displayUser.id, projects, activities]);

  // 사용자가 참여한 프로젝트
  const userProjects = projects.filter(p => 
    p.members.some(m => m.userId === displayUser.id)
  );

  // 최근 활동
  const recentActivities = activities
    .filter(a => a.userId === displayUser.id)
    .slice(0, 10);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'leader': return Users;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'leader': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return '관리자';
      case 'leader': return '리더';
      default: return '멤버';
    }
  };

  const getProjectRoleLabel = (role: string) => {
    switch (role) {
      case 'lead': return '리더';
      case 'admin': return '관리자';
      default: return '멤버';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
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

  const handleEditProfile = () => {
    setEditForm({
      name: displayUser.name,
      email: displayUser.email,
      bio: '' // 실제 구현에서는 bio 필드가 있어야 함
    });
    setShowEditDialog(true);
  };

  return (
    <div className="flex-1 p-8 bg-background overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div>
            <h1>사용자 프로필</h1>
            <p className="text-muted-foreground">
              {isOwnProfile ? '내 정보를 확인하고 관리하세요' : `${displayUser.name}님의 프로필입니다`}
            </p>
          </div>
        </div>
        
        {isOwnProfile && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEditProfile}>
              <Edit2 className="w-4 h-4 mr-2" />
              프로필 편집
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              설정
            </Button>
          </div>
        )}
      </div>

      {/* Profile Header Card */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                {displayUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl">{displayUser.name}</h2>
                <Badge className={getRoleColor(displayUser.role)}>
                  {React.createElement(getRoleIcon(displayUser.role), { className: "w-3 h-3 mr-1" })}
                  {getRoleLabel(displayUser.role)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {displayUser.email}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  가입일: {formatDate(displayUser.createdAt)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  최근 활동: {getTimeSince(displayUser.lastActive)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">참여 프로젝트</p>
                <p className="text-2xl">{userStats.totalProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">완료한 태스크</p>
                <p className="text-2xl">{userStats.completedTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <PlayCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">진행 중</p>
                <p className="text-2xl">{userStats.inProgressTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">완료율</p>
                <p className="text-2xl">{userStats.completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="projects">프로젝트</TabsTrigger>
          <TabsTrigger value="activity">활동</TabsTrigger>
          <TabsTrigger value="stats">통계</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  성과 요약
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>태스크 완료율</span>
                    <span>{userStats.completionRate}%</span>
                  </div>
                  <Progress value={userStats.completionRate} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>시간 효율성</span>
                    <span>{userStats.efficiency}%</span>
                  </div>
                  <Progress value={userStats.efficiency} className="h-2" />
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>총 작업 시간</span>
                    <span>{userStats.totalLoggedHours}시간</span>
                  </div>
                  <div className="flex justify-between">
                    <span>예상 작업 시간</span>
                    <span>{userStats.totalEstimatedHours}시간</span>
                  </div>
                  <div className="flex justify-between">
                    <span>총 활동 수</span>
                    <span>{userStats.totalActivities}개</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  최근 활동
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{activity.action}</p>
                        {activity.details && (
                          <p className="text-xs text-muted-foreground">{activity.details}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {getTimeSince(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {recentActivities.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      아직 활동 내역이 없습니다.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>참여 프로젝트</CardTitle>
              <CardDescription>
                현재 참여하고 있는 모든 프로젝트 목록입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userProjects.map((project) => {
                  const userMember = project.members.find(m => m.userId === displayUser.id);
                  const userTasks = project.tasks.filter(t => t.assigneeId === displayUser.id);
                  const completedUserTasks = userTasks.filter(t => t.status === 'done');
                  
                  return (
                    <div key={project.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg">{project.name}</h3>
                          <p className="text-sm text-muted-foreground">{project.description}</p>
                        </div>
                        <Badge variant="outline">
                          {getProjectRoleLabel(userMember?.role || 'member')}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">총 태스크: </span>
                          <span>{userTasks.length}개</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">완료: </span>
                          <span>{completedUserTasks.length}개</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">완료율: </span>
                          <span>{userTasks.length > 0 ? Math.round((completedUserTasks.length / userTasks.length) * 100) : 0}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {userProjects.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">참여 중인 프로젝트가 없습니다.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>활동 히스토리</CardTitle>
              <CardDescription>
                모든 활동 내역을 시간순으로 확인할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 border-l-2 border-blue-200 bg-muted/30">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm">{activity.action}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(activity.timestamp)}
                        </span>
                      </div>
                      {activity.details && (
                        <p className="text-xs text-muted-foreground">{activity.details}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {getTimeSince(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {recentActivities.length === 0 && (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">활동 내역이 없습니다.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  작업 통계
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">전체 태스크</span>
                    <span className="text-lg">{userStats.totalTasks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">완료된 태스크</span>
                    <span className="text-lg text-green-600">{userStats.completedTasks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">진행 중인 태스크</span>
                    <span className="text-lg text-orange-600">{userStats.inProgressTasks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">대기 중인 태스크</span>
                    <span className="text-lg text-gray-600">
                      {userStats.totalTasks - userStats.completedTasks - userStats.inProgressTasks}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  성과 지표
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">완료율</span>
                    <span className="text-lg">{userStats.completionRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">시간 효율성</span>
                    <span className="text-lg">{userStats.efficiency}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">총 작업 시간</span>
                    <span className="text-lg">{userStats.totalLoggedHours}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">평균 일일 활동</span>
                    <span className="text-lg">
                      {Math.round(userStats.totalActivities / 30)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>프로필 편집</DialogTitle>
            <DialogDescription>
              개인 정보를 수정하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editName">이름</Label>
              <Input
                id="editName"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="editEmail">이메일</Label>
              <Input
                id="editEmail"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="editBio">소개</Label>
              <Textarea
                id="editBio"
                value={editForm.bio}
                onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                placeholder="간단한 자기소개를 작성하세요"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                취소
              </Button>
              <Button onClick={() => {
                // 실제 구현에서는 여기서 프로필 업데이트 로직 실행
                console.log('프로필 업데이트:', editForm);
                setShowEditDialog(false);
              }}>
                저장
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}