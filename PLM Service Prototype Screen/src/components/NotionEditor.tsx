import { useState, useEffect } from 'react';
import { 
  Edit,
  Save,
  Share,
  MoreHorizontal,
  Users,
  Clock,
  Eye,
  EyeOff,
  Star,
  Copy,
  Trash2,
  User,
  Settings
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useNotion, type Page } from '../contexts/NotionContext';

interface NotionEditorProps {
  pageId: string | null;
}

export default function NotionEditor({ pageId }: NotionEditorProps) {
  const { 
    pages, 
    users, 
    currentUser,
    updatePage, 
    duplicatePage, 
    deletePage,
    inviteToPage,
    canEditPage,
    canManagePage,
    getUserRole
  } = useNotion();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor');

  const page = pageId ? pages.find(p => p.id === pageId) : null;
  const canEdit = pageId ? canEditPage(pageId) : false;
  const canManage = pageId ? canManagePage(pageId) : false;
  const userRole = pageId ? getUserRole(pageId) : null;

  useEffect(() => {
    if (page) {
      setEditTitle(page.title);
      setEditContent(page.content);
      setEditIcon(page.icon || '');
      setIsEditing(false);
    }
  }, [page]);

  const handleSave = () => {
    if (!pageId || !page) return;
    
    updatePage(pageId, {
      title: editTitle,
      content: editContent,
      icon: editIcon || undefined
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (page) {
      setEditTitle(page.title);
      setEditContent(page.content);
      setEditIcon(page.icon || '');
    }
    setIsEditing(false);
  };

  const handleInviteUser = () => {
    if (pageId && inviteEmail.trim()) {
      inviteToPage(pageId, inviteEmail, inviteRole);
      setInviteEmail('');
      setInviteRole('editor');
      setShowInviteDialog(false);
    }
  };

  const handleDuplicate = () => {
    if (pageId) {
      duplicatePage(pageId);
    }
  };

  const handleDelete = () => {
    if (pageId && page && window.confirm(`"${page.title}" 페이지를 삭제하시겠습니까?`)) {
      deletePage(pageId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderMarkdown = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold mt-8 mb-6 first:mt-0">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold mt-6 mb-4">{line.substring(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-bold mt-5 mb-3">{line.substring(4)}</h3>;
      } else if (line.startsWith('- [ ] ')) {
        return (
          <div key={index} className="flex items-center gap-2 mb-2">
            <input type="checkbox" className="rounded" />
            <span>{line.substring(6)}</span>
          </div>
        );
      } else if (line.startsWith('- [x] ')) {
        return (
          <div key={index} className="flex items-center gap-2 mb-2">
            <input type="checkbox" checked className="rounded" />
            <span className="line-through text-gray-500">{line.substring(6)}</span>
          </div>
        );
      } else if (line.startsWith('- ')) {
        return <li key={index} className="ml-4 mb-1">{line.substring(2)}</li>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else if (line.startsWith('|') && line.endsWith('|')) {
        // Simple table row
        const cells = line.split('|').slice(1, -1);
        return (
          <div key={index} className="flex border-b">
            {cells.map((cell, cellIndex) => (
              <div key={cellIndex} className="flex-1 p-2 border-r last:border-r-0">
                {cell.trim()}
              </div>
            ))}
          </div>
        );
      } else {
        return <p key={index} className="mb-3">{line}</p>;
      }
    });
  };

  if (!pageId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Edit className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">페이지를 선택하세요</h3>
          <p className="text-gray-500">
            사이드바에서 페이지를 선택하거나 새 페이지를 만들어보세요.
          </p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">페이지를 찾을 수 없습니다</h3>
          <p className="text-gray-500">
            요청한 페이지가 존재하지 않거나 접근 권한이 없습니다.
          </p>
        </div>
      </div>
    );
  }

  const pageMembers = page.members.map(member => 
    users.find(user => user.id === member.userId)
  ).filter(Boolean);

  const lastEditor = users.find(user => user.id === page.lastEditedBy);

  return (
    <div className="flex-1 bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {isEditing ? (
              <Input
                value={editIcon}
                onChange={(e) => setEditIcon(e.target.value)}
                placeholder="이모지"
                className="w-16 text-center"
              />
            ) : (
              <span className="text-2xl">{page.icon || '📄'}</span>
            )}
            
            <div>
              {isEditing ? (
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-xl font-bold border-none p-0 h-auto"
                />
              ) : (
                <h1 className="text-xl font-bold">{page.title}</h1>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>마지막 수정: {formatDate(page.updatedAt)}</span>
                </div>
                {lastEditor && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{lastEditor.name}</span>
                  </div>
                )}
                <Badge variant="outline" className="text-xs">
                  v{page.version}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Members */}
            <div className="flex items-center gap-1">
              {pageMembers.slice(0, 3).map((member, index) => (
                <Avatar key={member?.id} className="w-6 h-6 -ml-1 first:ml-0 border-2 border-white">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                    {member?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {pageMembers.length > 3 && (
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center -ml-1 border-2 border-white">
                  <span className="text-xs text-gray-600">+{pageMembers.length - 3}</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMembersDialog(true)}
                className="ml-2"
              >
                <Users className="w-4 h-4" />
              </Button>
            </div>

            {/* Action buttons */}
            {canEdit && (
              <>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave}>
                      <Save className="w-4 h-4 mr-1" />
                      저장
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      취소
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-1" />
                    편집
                  </Button>
                )}
              </>
            )}

            {/* More options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="w-4 h-4 mr-2" />
                  복제
                </DropdownMenuItem>
                {canManage && (
                  <>
                    <DropdownMenuItem onClick={() => setShowInviteDialog(true)}>
                      <Share className="w-4 h-4 mr-2" />
                      공유
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      삭제
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Role badge */}
        {userRole && (
          <Badge variant="outline" className="text-xs">
            {userRole === 'owner' ? '소유자' : userRole === 'admin' ? '관리자' : userRole === 'editor' ? '편집자' : '뷰어'}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {isEditing ? (
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full min-h-[500px] border-none resize-none focus:ring-0 text-base leading-7"
            placeholder="페이지 내용을 작성하세요..."
          />
        ) : (
          <div className="prose prose-lg max-w-none">
            {renderMarkdown(page.content)}
          </div>
        )}
      </div>

      {/* Members Dialog */}
      <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>페이지 멤버</DialogTitle>
            <DialogDescription>
              이 페이지에 접근할 수 있는 멤버들입니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {page.members.map(member => {
              const user = users.find(u => u.id === member.userId);
              if (!user) return null;
              
              return (
                <div key={member.userId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {member.role === 'owner' ? '소유자' : member.role === 'admin' ? '관리자' : member.role === 'editor' ? '편집자' : '뷰어'}
                  </Badge>
                </div>
              );
            })}
            {canManage && (
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => {
                  setShowMembersDialog(false);
                  setShowInviteDialog(true);
                }}
              >
                멤버 초대
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>멤버 초대</DialogTitle>
            <DialogDescription>
              새로운 멤버를 이 페이지에 초대하세요.
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