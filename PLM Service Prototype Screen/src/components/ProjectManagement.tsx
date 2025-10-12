import { useState } from 'react';
import { Plus, FolderKanban, Users, Calendar, MoreHorizontal, FileText, Upload, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { usePLM } from '../contexts/PLMContext';
import DocumentEditor from './DocumentEditor';
import FileManager from './FileManager';
import ActivityHistory from './ActivityHistory';

interface ProjectManagementProps {
  isCompact: boolean;
}

export default function ProjectManagement({ isCompact }: ProjectManagementProps) {
  const { projects, teams, users, addProject } = usePLM();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    teamId: '',
    managerId: '',
    deadline: ''
  });

  const handleCreateProject = () => {
    if (newProject.name && newProject.teamId && newProject.managerId) {
      addProject({
        ...newProject,
        status: 'planning' as const
      });
      setNewProject({
        name: '',
        description: '',
        teamId: '',
        managerId: '',
        deadline: ''
      });
      setShowCreateDialog(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedProjectData = projects.find(p => p.id === selectedProject);

  if (selectedProject && selectedProjectData) {
    return (
      <div className="flex-1 p-8 bg-background">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => setSelectedProject(null)}
              className="mb-2"
            >
              ← 프로젝트 목록으로
            </Button>
            <h1 className="mb-2">{selectedProjectData.name}</h1>
            <p className="text-muted-foreground">{selectedProjectData.description}</p>
          </div>
          <Badge className={getStatusColor(selectedProjectData.status)}>
            {selectedProjectData.status}
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4" />
              개요
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              문서
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              파일
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              활동
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>프로젝트 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="font-medium">팀:</span> {teams.find(t => t.id === selectedProjectData.teamId)?.name}
                  </div>
                  <div>
                    <span className="font-medium">매니저:</span> {users.find(u => u.id === selectedProjectData.managerId)?.name}
                  </div>
                  <div>
                    <span className="font-medium">진행률:</span> {selectedProjectData.progress}%
                  </div>
                  {selectedProjectData.deadline && (
                    <div>
                      <span className="font-medium">마감일:</span> {new Date(selectedProjectData.deadline).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>문서 현황</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{selectedProjectData.documents.length}</div>
                  <p className="text-muted-foreground">개의 문서</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>파일 현황</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{selectedProjectData.files.length}</div>
                  <p className="text-muted-foreground">개의 파일</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <DocumentEditor projectId={selectedProject} />
          </TabsContent>

          <TabsContent value="files">
            <FileManager projectId={selectedProject} />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityHistory projectId={selectedProject} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-background">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="mb-2">프로젝트 관리</h1>
          <p className="text-muted-foreground">
            프로젝트를 생성하고 진행 상황을 관리하세요
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              프로젝트 생성
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 프로젝트 생성</DialogTitle>
              <DialogDescription>
                새로운 프로젝트를 생성하여 팀과 함께 작업을 시작하세요.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">프로젝트 이름</Label>
                <Input
                  id="name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  placeholder="프로젝트 이름을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  placeholder="프로젝트 설명을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="team">담당 팀</Label>
                <Select onValueChange={(value) => setNewProject({...newProject, teamId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="팀을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="manager">프로젝트 매니저</Label>
                <Select onValueChange={(value) => setNewProject({...newProject, managerId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="매니저를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.filter(user => user.role === 'manager' || user.role === 'admin').map((user) => (
                      <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="deadline">마감일 (선택사항)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newProject.deadline}
                  onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  취소
                </Button>
                <Button onClick={handleCreateProject}>
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
        {projects.map((project) => {
          const team = teams.find(t => t.id === project.teamId);
          const manager = users.find(u => u.id === project.managerId);
          
          return (
            <Card 
              key={project.id}
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
              onClick={() => setSelectedProject(project.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {team?.name} • {manager?.name}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>진행률</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {project.deadline && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    마감: {new Date(project.deadline).toLocaleDateString()}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>문서 {project.documents.length}개</span>
                  <span>파일 {project.files.length}개</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <FolderKanban className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="mb-2">프로젝트가 없습니다</h3>
          <p className="text-muted-foreground mb-6">
            첫 번째 프로젝트를 생성하여 시작해보세요.
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            프로젝트 생성
          </Button>
        </div>
      )}
    </div>
  );
}