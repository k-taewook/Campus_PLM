import { useState, useRef } from 'react';
import { Upload, File, FileText, Image, Video, Music, Archive, Download, Trash2, User, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { usePLM, type FileItem } from '../contexts/PLMContext';

interface FileManagerProps {
  projectId: string;
}

export default function FileManager({ projectId }: FileManagerProps) {
  const { projects, users, currentUser, addFile } = usePLM();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const project = projects.find(p => p.id === projectId);
  const files = project?.files || [];

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('audio/')) return Music;
    if (type.includes('pdf') || type.includes('document')) return FileText;
    if (type.includes('zip') || type.includes('rar')) return Archive;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleFileUpload = (uploadedFiles: FileList) => {
    Array.from(uploadedFiles).forEach(file => {
      // 실제 환경에서는 파일을 서버에 업로드하고 URL을 받아옵니다
      const mockUrl = URL.createObjectURL(file);
      
      addFile({
        name: file.name,
        size: file.size,
        type: file.type,
        projectId,
        uploadedBy: currentUser.id,
        url: mockUrl
      });
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileUpload(selectedFiles);
    }
  };

  const handleDownload = (file: FileItem) => {
    // 실제 환경에서는 파일 다운로드 로직 구현
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>파일 관리</h2>
        <Button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          파일 업로드
        </Button>
      </div>

      {/* 파일 업로드 영역 */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="p-8 text-center">
          <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="mb-2">파일을 드래그하여 업로드하거나</h3>
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
          >
            파일 선택
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            최대 100MB까지 업로드 가능합니다
          </p>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* 파일 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {files.map((file) => {
          const uploader = users.find(u => u.id === file.uploadedBy);
          const FileIcon = getFileIcon(file.type);
          
          return (
            <Card key={file.id} className="transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm truncate">{file.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <User className="w-3 h-3" />
                        {uploader?.name}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">크기</span>
                  <Badge variant="secondary">{formatFileSize(file.size)}</Badge>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatDate(file.uploadedAt)}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    다운로드
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {files.length === 0 && (
        <div className="text-center py-12">
          <Upload className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="mb-2">업로드된 파일이 없습니다</h3>
          <p className="text-muted-foreground mb-6">
            프로젝트에 필요한 파일들을 업로드해보세요.
          </p>
          <Button onClick={() => fileInputRef.current?.click()}>
            파일 업로드
          </Button>
        </div>
      )}
    </div>
  );
}