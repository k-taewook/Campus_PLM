import { useState, useEffect } from 'react';
import { Plus, FileText, Edit, Save, X, Clock, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { usePLM, type Document } from '../contexts/PLMContext';

interface DocumentEditorProps {
  projectId: string;
}

export default function DocumentEditor({ projectId }: DocumentEditorProps) {
  const { projects, users, currentUser, addDocument, updateDocument } = usePLM();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const project = projects.find(p => p.id === projectId);
  const documents = project?.documents || [];

  const handleCreateDocument = () => {
    if (newDocTitle && projectId) {
      addDocument({
        title: newDocTitle,
        content: '# ' + newDocTitle + '\n\n문서 내용을 작성하세요...',
        projectId,
        authorId: currentUser.id
      });
      setNewDocTitle('');
      setShowCreateDialog(false);
    }
  };

  const handleEditDocument = (document: Document) => {
    setEditingDocument(document);
    setEditContent(document.content);
  };

  const handleSaveDocument = () => {
    if (editingDocument) {
      updateDocument(editingDocument.id, editContent, currentUser.id);
      setEditingDocument(null);
      setEditContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingDocument(null);
    setEditContent('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (editingDocument) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              {editingDocument.title} 편집
            </h2>
            <p className="text-muted-foreground mt-1">
              버전 {editingDocument.version} • {users.find(u => u.id === editingDocument.authorId)?.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancelEdit}>
              <X className="w-4 h-4 mr-2" />
              취소
            </Button>
            <Button onClick={handleSaveDocument}>
              <Save className="w-4 h-4 mr-2" />
              저장
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>문서 편집</CardTitle>
            <CardDescription>
              마크다운 형식으로 문서를 작성할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[400px] font-mono"
              placeholder="문서 내용을 입력하세요..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>미리보기</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {editContent.split('\n').map((line, index) => {
                if (line.startsWith('# ')) {
                  return <h1 key={index} className="text-2xl font-bold mt-6 mb-4">{line.substring(2)}</h1>;
                } else if (line.startsWith('## ')) {
                  return <h2 key={index} className="text-xl font-bold mt-5 mb-3">{line.substring(3)}</h2>;
                } else if (line.startsWith('### ')) {
                  return <h3 key={index} className="text-lg font-bold mt-4 mb-2">{line.substring(4)}</h3>;
                } else if (line.startsWith('- ')) {
                  return <li key={index} className="ml-4">{line.substring(2)}</li>;
                } else if (line.trim() === '') {
                  return <br key={index} />;
                } else {
                  return <p key={index} className="mb-2">{line}</p>;
                }
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>문서 관리</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              문서 생성
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 문서 생성</DialogTitle>
              <DialogDescription>
                프로젝트에 새로운 문서를 추가합니다.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">문서 제목</Label>
                <Input
                  id="title"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="문서 제목을 입력하세요"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  취소
                </Button>
                <Button onClick={handleCreateDocument}>
                  생성
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((document) => {
          const author = users.find(u => u.id === document.authorId);
          
          return (
            <Card 
              key={document.id}
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
              onClick={() => handleEditDocument(document)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{document.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <User className="w-3 h-3" />
                        {author?.name}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">v{document.version}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground line-clamp-3">
                  {document.content.substring(0, 150)}...
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  생성: {formatDate(document.createdAt)}
                </div>
                
                {document.updatedAt !== document.createdAt && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    수정: {formatDate(document.updatedAt)}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {documents.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="mb-2">문서가 없습니다</h3>
          <p className="text-muted-foreground mb-6">
            첫 번째 문서를 생성하여 프로젝트 정보를 기록해보세요.
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            문서 생성
          </Button>
        </div>
      )}
    </div>
  );
}