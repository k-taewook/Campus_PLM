import { Clock, FileText, Upload, FolderKanban, Users, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { usePLM, type ActivityLog } from '../contexts/PLMContext';

interface ActivityHistoryProps {
  projectId?: string;
}

export default function ActivityHistory({ projectId }: ActivityHistoryProps) {
  const { activities, users, projects } = usePLM();

  // 프로젝트별 필터링 또는 전체 활동
  const filteredActivities = projectId 
    ? activities.filter(activity => {
        // 프로젝트 관련 활동만 필터링
        if (activity.targetType === 'project' && activity.targetId === projectId) return true;
        
        // 해당 프로젝트의 문서나 파일 활동 필터링
        const project = projects.find(p => p.id === projectId);
        if (!project) return false;
        
        if (activity.targetType === 'document') {
          return project.documents.some(doc => doc.id === activity.targetId);
        }
        
        if (activity.targetType === 'file') {
          return project.files.some(file => file.id === activity.targetId);
        }
        
        return false;
      })
    : activities;

  const getActivityIcon = (targetType: string) => {
    switch (targetType) {
      case 'project': return FolderKanban;
      case 'document': return FileText;
      case 'file': return Upload;
      case 'team': return Users;
      case 'user': return UserIcon;
      default: return Clock;
    }
  };

  const getActivityColor = (targetType: string) => {
    switch (targetType) {
      case 'project': return 'bg-blue-100 text-blue-600';
      case 'document': return 'bg-green-100 text-green-600';
      case 'file': return 'bg-purple-100 text-purple-600';
      case 'team': return 'bg-orange-100 text-orange-600';
      case 'user': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
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
      return date.toLocaleDateString();
    }
  };

  const getTargetTypeLabel = (targetType: string) => {
    switch (targetType) {
      case 'project': return '프로젝트';
      case 'document': return '문서';
      case 'file': return '파일';
      case 'team': return '팀';
      case 'user': return '사용자';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>{projectId ? '프로젝트 활동 히스토리' : '전체 활동 히스토리'}</h2>
        <Badge variant="secondary">{filteredActivities.length}개 활동</Badge>
      </div>

      <div className="space-y-4">
        {filteredActivities.map((activity) => {
          const user = users.find(u => u.id === activity.userId);
          const ActivityIcon = getActivityIcon(activity.targetType);
          
          return (
            <Card key={activity.id} className="transition-all duration-300 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* 사용자 아바타 */}
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {user?.name.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>

                  {/* 활동 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{activity.userName}</span>
                      <span className="text-muted-foreground">{activity.action}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1 rounded-md ${getActivityColor(activity.targetType)}`}>
                        <ActivityIcon className="w-3 h-3" />
                      </div>
                      <span className="font-medium">{activity.targetName}</span>
                      <Badge variant="outline" className="text-xs">
                        {getTargetTypeLabel(activity.targetType)}
                      </Badge>
                    </div>

                    {activity.details && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {activity.details}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDate(activity.timestamp)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="mb-2">활동 내역이 없습니다</h3>
          <p className="text-muted-foreground">
            {projectId 
              ? '이 프로젝트에서 아직 활동이 없습니다.' 
              : '시스템에서 아직 활동이 없습니다.'
            }
          </p>
        </div>
      )}
    </div>
  );
}