import { useState } from 'react';
import { 
  Plus, 
  Clock, 
  Users, 
  FileText, 
  Star,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  BookOpen,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useNotion, type Page } from '../contexts/NotionContext';

interface NotionDashboardProps {
  onPageSelect: (pageId: string) => void;
  onCreatePage: () => void;
}

export default function NotionDashboard({ onPageSelect, onCreatePage }: NotionDashboardProps) {
  const { 
    currentUser, 
    users,
    getMyPages, 
    getSharedPages, 
    activities,
    createPage
  } = useNotion();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const [filterBy, setFilterBy] = useState('all');

  const myPages = getMyPages();
  const sharedPages = getSharedPages();
  const allPages = [...myPages, ...sharedPages];

  // Filter and sort pages
  const filteredPages = allPages
    .filter(page => {
      const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           page.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterBy === 'all' || 
                           (filterBy === 'my' && page.ownerId === currentUser?.id) ||
                           (filterBy === 'shared' && page.ownerId !== currentUser?.id) ||
                           (filterBy === 'template' && page.template === filterBy);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const recentPages = allPages
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const recentActivities = activities
    .filter(activity => 
      allPages.some(page => page.id === activity.pageId)
    )
    .slice(0, 10);

  const handleQuickCreate = (template: string) => {
    const titles = {
      'blank': '제목 없음',
      'notes': '새로운 노트',
      'project': '새 프로젝트',
      'wiki': '지식베이스',
      'database': '데이터베이스'
    };
    
    const pageId = createPage(titles[template as keyof typeof titles] || '제목 없음', template);
    onPageSelect(pageId);
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

  const getTemplateIcon = (template: string) => {
    switch (template) {
      case 'project': return '🚀';
      case 'notes': return '📝';
      case 'database': return '🗃️';
      case 'wiki': return '📚';
      default: return '📄';
    }
  };

  const getTemplateColor = (template: string) => {
    switch (template) {
      case 'project': return 'bg-blue-100 text-blue-800';
      case 'notes': return 'bg-green-100 text-green-800';
      case 'database': return 'bg-purple-100 text-purple-800';
      case 'wiki': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            안녕하세요, {currentUser.name}님! 👋
          </h1>
          <p className="text-gray-600">
            오늘도 생산적인 하루를 만들어보세요.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleQuickCreate('blank')}
          >
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Plus className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-sm font-medium">빈 페이지</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleQuickCreate('notes')}
          >
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm font-medium">노트</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleQuickCreate('project')}
          >
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium">프로젝트</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleQuickCreate('wiki')}
          >
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-sm font-medium">위키</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleQuickCreate('database')}
          >
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm font-medium">데이터베이스</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                내 페이지
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{myPages.length}</div>
              <p className="text-sm text-gray-600">소유한 페이지</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                공유된 페이지
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{sharedPages.length}</div>
              <p className="text-sm text-gray-600">참여 중인 페이지</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                최근 활동
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{recentActivities.length}</div>
              <p className="text-sm text-gray-600">오늘의 활동</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="recent" className="space-y-6">
          <TabsList>
            <TabsTrigger value="recent">최근 페이지</TabsTrigger>
            <TabsTrigger value="all">모든 페이지</TabsTrigger>
            <TabsTrigger value="activity">활동</TabsTrigger>
          </TabsList>

          <TabsContent value="recent">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">최근 작업한 페이지</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentPages.map(page => {
                  const owner = users.find(u => u.id === page.ownerId);
                  const isOwner = page.ownerId === currentUser.id;
                  
                  return (
                    <Card 
                      key={page.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                      onClick={() => onPageSelect(page.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{page.icon || getTemplateIcon(page.template || 'blank')}</span>
                            <div className="flex-1">
                              <CardTitle className="text-base line-clamp-2">{page.title}</CardTitle>
                              <CardDescription className="flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(page.updatedAt)}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={getTemplateColor(page.template || 'blank')}>
                            {page.template || 'blank'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                          {page.content.replace(/[#*\-\[\]]/g, '').substring(0, 100)}...
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                {owner?.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-500">
                              {isOwner ? '내 페이지' : owner?.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{page.members.length}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {recentPages.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">페이지가 없습니다</h3>
                  <p className="text-gray-500 mb-6">첫 번째 페이지를 만들어 시작해보세요.</p>
                  <Button onClick={onCreatePage}>
                    페이지 만들기
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="all">
            <div className="space-y-4">
              {/* Search and Filter */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="페이지 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated">최근 수정</SelectItem>
                    <SelectItem value="created">생성일</SelectItem>
                    <SelectItem value="title">제목</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-32">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="my">내 페이지</SelectItem>
                    <SelectItem value="shared">공유됨</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pages List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPages.map(page => {
                  const owner = users.find(u => u.id === page.ownerId);
                  const isOwner = page.ownerId === currentUser.id;
                  
                  return (
                    <Card 
                      key={page.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                      onClick={() => onPageSelect(page.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{page.icon || getTemplateIcon(page.template || 'blank')}</span>
                            <div className="flex-1">
                              <CardTitle className="text-base line-clamp-2">{page.title}</CardTitle>
                              <CardDescription className="flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(page.updatedAt)}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={getTemplateColor(page.template || 'blank')}>
                            {page.template || 'blank'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                          {page.content.replace(/[#*\-\[\]]/g, '').substring(0, 100)}...
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                {owner?.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-500">
                              {isOwner ? '내 페이지' : owner?.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{page.members.length}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredPages.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery ? '검색 결과가 없습니다' : '페이지가 없습니다'}
                  </h3>
                  <p className="text-gray-500">
                    {searchQuery ? '다른 검색어를 시도해보세요.' : '첫 번째 페이지를 만들어 시작해보세요.'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">최근 활동</h3>
              <div className="space-y-4">
                {recentActivities.map(activity => {
                  const page = allPages.find(p => p.id === activity.pageId);
                  const user = users.find(u => u.id === activity.userId);
                  
                  if (!page || !user) return null;
                  
                  return (
                    <Card key={activity.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{user.name}</span>
                              <span className="text-sm text-gray-600">{activity.action}</span>
                              <span 
                                className="text-sm font-medium text-blue-600 cursor-pointer hover:underline"
                                onClick={() => onPageSelect(page.id)}
                              >
                                {page.title}
                              </span>
                            </div>
                            {activity.details && (
                              <p className="text-sm text-gray-600 mb-2">{activity.details}</p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-500">
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

              {recentActivities.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">활동이 없습니다</h3>
                  <p className="text-gray-500">페이지를 만들고 편집하면 여기에 활동이 표시됩니다.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}