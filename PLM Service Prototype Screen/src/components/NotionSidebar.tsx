import { useState } from 'react';
import { 
  Plus, 
  FileText, 
  FolderOpen, 
  Search, 
  Settings, 
  UserCircle, 
  LogOut,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Trash2,
  Copy,
  Edit,
  Users,
  Share
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useNotion, type Page } from '../contexts/NotionContext';

interface NotionSidebarProps {
  selectedPageId: string | null;
  onPageSelect: (pageId: string) => void;
  onCreatePage: () => void;
}

export default function NotionSidebar({ selectedPageId, onPageSelect, onCreatePage }: NotionSidebarProps) {
  const { 
    currentUser, 
    logout, 
    getMyPages, 
    getSharedPages, 
    deletePage, 
    duplicatePage,
    createPage,
    inviteToPage,
    getUserRole,
    canManagePage
  } = useNotion();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [invitePageId, setInvitePageId] = useState<string | null>(null);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageTemplate, setNewPageTemplate] = useState('blank');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['my-pages', 'shared-pages']));

  const myPages = getMyPages();
  const sharedPages = getSharedPages();

  const filteredMyPages = myPages.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredSharedPages = sharedPages.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePage = () => {
    if (newPageTitle.trim()) {
      const pageId = createPage(newPageTitle, newPageTemplate);
      onPageSelect(pageId);
      setNewPageTitle('');
      setNewPageTemplate('blank');
      setShowCreateDialog(false);
    }
  };

  const handleInviteUser = () => {
    if (invitePageId && inviteEmail.trim()) {
      inviteToPage(invitePageId, inviteEmail, inviteRole);
      setInviteEmail('');
      setInviteRole('editor');
      setInvitePageId(null);
      setShowInviteDialog(false);
    }
  };

  const handleDuplicatePage = (pageId: string) => {
    const newPageId = duplicatePage(pageId);
    if (newPageId) {
      onPageSelect(newPageId);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const openInviteDialog = (pageId: string) => {
    setInvitePageId(pageId);
    setShowInviteDialog(true);
  };

  const PageItem = ({ page }: { page: Page }) => {
    const userRole = getUserRole(page.id);
    const canManage = canManagePage(page.id);
    
    return (
      <div 
        className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
          selectedPageId === page.id ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
        }`}
        onClick={() => onPageSelect(page.id)}
      >
        <span className="text-sm">{page.icon || '📄'}</span>
        <span className="flex-1 text-sm truncate">{page.title}</span>
        {userRole && (
          <Badge variant="outline" className="text-xs">
            {userRole === 'owner' ? '소유자' : userRole === 'admin' ? '관리자' : userRole === 'editor' ? '편집자' : '뷰어'}
          </Badge>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 p-1 h-6 w-6"
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleDuplicatePage(page.id)}>
              <Copy className="w-4 h-4 mr-2" />
              복제
            </DropdownMenuItem>
            {canManage && (
              <>
                <DropdownMenuItem onClick={() => openInviteDialog(page.id)}>
                  <Share className="w-4 h-4 mr-2" />
                  공유
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => deletePage(page.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  삭제
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  if (!currentUser) return null;

  return (
    <div className="w-64 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2 h-auto">
              <Avatar className="w-6 h-6 mr-2">
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                  {currentUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="font-medium text-sm">{currentUser.name}</div>
                <div className="text-xs text-gray-500">{currentUser.email}</div>
              </div>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem>
              <UserCircle className="w-4 h-4 mr-2" />
              프로필 설정
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              설정
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="페이지 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Create New Page */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-sm">
                <Plus className="w-4 h-4 mr-2" />
                새 페이지
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 페이지 만들기</DialogTitle>
                <DialogDescription>
                  새로운 페이지를 만들어 작업을 시작하세요.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="page-title">페이지 제목</Label>
                  <Input
                    id="page-title"
                    value={newPageTitle}
                    onChange={(e) => setNewPageTitle(e.target.value)}
                    placeholder="제목 없음"
                  />
                </div>
                <div>
                  <Label htmlFor="page-template">템플릿</Label>
                  <Select value={newPageTemplate} onValueChange={setNewPageTemplate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blank">📄 빈 페이지</SelectItem>
                      <SelectItem value="notes">📝 노트</SelectItem>
                      <SelectItem value="project">🚀 프로젝트</SelectItem>
                      <SelectItem value="wiki">📚 위키</SelectItem>
                      <SelectItem value="database">🗃️ 데이터베이스</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    취소
                  </Button>
                  <Button onClick={handleCreatePage}>
                    페이지 만들기
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* My Pages */}
          <div>
            <button
              onClick={() => toggleSection('my-pages')}
              className="flex items-center gap-2 w-full p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              {expandedSections.has('my-pages') ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <FolderOpen className="w-4 h-4" />
              내 페이지
              <Badge variant="secondary" className="ml-auto text-xs">
                {myPages.length}
              </Badge>
            </button>
            
            {expandedSections.has('my-pages') && (
              <div className="ml-2 mt-2 space-y-1">
                {filteredMyPages.length > 0 ? (
                  filteredMyPages.map(page => (
                    <PageItem key={page.id} page={page} />
                  ))
                ) : (
                  <div className="p-2 text-sm text-gray-500">
                    {searchQuery ? '검색 결과가 없습니다' : '페이지가 없습니다'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Shared Pages */}
          {sharedPages.length > 0 && (
            <div>
              <button
                onClick={() => toggleSection('shared-pages')}
                className="flex items-center gap-2 w-full p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {expandedSections.has('shared-pages') ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <Users className="w-4 h-4" />
                공유된 페이지
                <Badge variant="secondary" className="ml-auto text-xs">
                  {sharedPages.length}
                </Badge>
              </button>
              
              {expandedSections.has('shared-pages') && (
                <div className="ml-2 mt-2 space-y-1">
                  {filteredSharedPages.length > 0 ? (
                    filteredSharedPages.map(page => (
                      <PageItem key={page.id} page={page} />
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">
                      {searchQuery ? '검색 결과가 없습니다' : '공유된 페이지가 없습니다'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>페이지 공유</DialogTitle>
            <DialogDescription>
              다른 사용자를 이 페이지에 초대하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="invite-email">이메일 주소</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <Label htmlFor="invite-role">권한</Label>
              <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">관리자 - 페이지 관리 및 멤버 초대 가능</SelectItem>
                  <SelectItem value="editor">편집자 - 페이지 편집 가능</SelectItem>
                  <SelectItem value="viewer">뷰어 - 페이지 읽기만 가능</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                취소
              </Button>
              <Button onClick={handleInviteUser}>
                초대 보내기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}