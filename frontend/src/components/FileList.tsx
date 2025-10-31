import { Download, Trash2, File, FileText, Image, Video, Music, Archive, Eye } from 'lucide-react';

export interface FileItem {
  id: number;
  originalName: string;
  storedName: string;
  fileSize: number;
  mimeType: string;
  fileType: string;
  uploaderFullName: string;
  downloadCount: number;
  createdAt: string;
}

interface FileListProps {
  files: FileItem[];
  onDownload: (fileId: number, fileName: string) => void;
  onDelete: (fileId: number) => void;
  showDelete?: boolean;
}

export default function FileList({ files, onDownload, onDelete, showDelete = true }: FileListProps) {
  
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5 text-purple-500" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-5 h-5 text-green-500" />;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <Archive className="w-5 h-5 text-orange-500" />;
    if (mimeType.includes('text') || mimeType.includes('pdf') || mimeType.includes('document')) 
      return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
    
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">첨부된 파일이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map(file => (
        <div 
          key={file.id} 
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition group"
        >
          {/* 파일 정보 */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getFileIcon(file.mimeType)}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate hover:text-blue-600 cursor-pointer">
                {file.originalName}
              </p>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>{formatFileSize(file.fileSize)}</span>
                <span>•</span>
                <span>{file.uploaderFullName}</span>
                <span>•</span>
                <span>{formatDate(file.createdAt)}</span>
                {file.downloadCount > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {file.downloadCount}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
            {/* 미리보기 (이미지만) */}
            {file.mimeType.startsWith('image/') && (
              <button
                onClick={() => window.open(`http://localhost:8080/api/files/${file.id}/download`, '_blank')}
                className="p-2 hover:bg-blue-100 rounded-lg transition"
                title="미리보기"
              >
                <Eye className="w-4 h-4 text-blue-600" />
              </button>
            )}
            
            {/* 다운로드 */}
            <button
              onClick={() => onDownload(file.id, file.originalName)}
              className="p-2 hover:bg-green-100 rounded-lg transition"
              title="다운로드"
            >
              <Download className="w-4 h-4 text-green-600" />
            </button>
            
            {/* 삭제 */}
            {showDelete && (
              <button
                onClick={() => {
                  if (window.confirm(`"${file.originalName}"을(를) 삭제하시겠습니까?`)) {
                    onDelete(file.id);
                  }
                }}
                className="p-2 hover:bg-red-100 rounded-lg transition"
                title="삭제"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
